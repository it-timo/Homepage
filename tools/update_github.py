#!/usr/bin/env python3
"""Update data/projects.json from the public GitHub API for it-timo."""

from __future__ import annotations

import argparse
import base64
import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "data" / "projects.json"
FEATURED = ROOT / "data" / "project_featured.json"
DEFAULT_USERNAME = "it-timo"
API = "https://api.github.com"


def request_json(url: str, token: str | None, accept: str = "application/vnd.github+json"):
    headers = {"Accept": accept, "User-Agent": "dev-timo-catalog-builder", "X-GitHub-Api-Version": "2022-11-28"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


def normalize_readme(markdown: str, limit: int = 420) -> str:
    text = re.sub(r"```.*?```", " ", markdown, flags=re.DOTALL)
    text = re.sub(r"!\[[^]]*\]\([^)]*\)", " ", text)
    text = re.sub(r"\[([^]]+)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"^[#>*+\-]+\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"[`_*~]", "", text)
    text = " ".join(text.split())
    return text if len(text) <= limit else text[:limit].rsplit(" ", 1)[0] + "…"


def fetch_optional(url: str, token: str | None, fallback):
    try:
        return request_json(url, token)
    except urllib.error.HTTPError as error:
        if error.code == 404:
            return fallback
        raise


def build_repository(repo: dict, token: str | None, featured: set[str]) -> dict:
    full_name = repo["full_name"]
    languages_data = fetch_optional(f"{API}/repos/{full_name}/languages", token, {})
    readme_data = fetch_optional(f"{API}/repos/{full_name}/readme", token, None)
    readme_excerpt = ""
    if readme_data and readme_data.get("content"):
        markdown = base64.b64decode(readme_data["content"]).decode("utf-8", errors="replace")
        readme_excerpt = normalize_readme(markdown)
    languages = list(languages_data.keys())
    return {
        "name": repo["name"],
        "description": repo.get("description") or "",
        "language": repo.get("language") or "",
        "languages": languages,
        "topics": repo.get("topics") or [],
        "updated_at": repo["updated_at"],
        "url": repo["html_url"],
        "readme_excerpt": readme_excerpt,
        "featured": repo["name"] in featured,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--username", default=DEFAULT_USERNAME)
    args = parser.parse_args()
    token = os.environ.get("GITHUB_TOKEN")
    featured_data = json.loads(FEATURED.read_text(encoding="utf-8"))
    featured = set(featured_data.get("repositories", []))
    try:
        repos = request_json(f"{API}/users/{args.username}/repos?per_page=100&type=owner&sort=updated", token)
        selected = [repo for repo in repos if not repo["fork"] and not repo["archived"]]
        projects = [build_repository(repo, token, featured) for repo in selected]
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError) as error:
        print(f"GitHub update failed: {error}", file=sys.stderr)
        return 1
    projects.sort(key=lambda item: item["updated_at"], reverse=True)
    temporary = OUTPUT.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(projects, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    temporary.replace(OUTPUT)
    print(f"Updated {OUTPUT.relative_to(ROOT)} with {len(projects)} repositories for {args.username}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
