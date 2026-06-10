#!/usr/bin/env python3
"""Write route-aware HTML shells with canonical and social metadata."""
from __future__ import annotations

import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
BASE_URL = "https://dev-timo.com"
SITE_NAME = "Timo Schmidt"
DEFAULT_DESCRIPTION = "The digital home of Timo Schmidt — software, music, writing, experiments, and the connections between them."
SOCIAL_IMAGE = f"{BASE_URL}/assets/hero-background.svg"


def load(name: str):
    return json.loads((DATA / f"{name}.json").read_text(encoding="utf-8"))


def clean_description(value: str) -> str:
    return " ".join(str(value).split())[:300]


def route_file(path: str) -> Path:
    clean = path.split("#", 1)[0]
    if clean == "/":
        return ROOT / "index.html"
    if clean.endswith("/"):
        return ROOT / clean.strip("/") / "index.html"
    return ROOT / clean.lstrip("/")


def shell(path: str, title: str, description: str, page_kind: str = "website", og_type: str = "website") -> str:
    canonical = f"{BASE_URL}{path.split('#', 1)[0]}"
    full_title = f"{title} — {SITE_NAME}" if title != SITE_NAME else f"{SITE_NAME} — Systems, Stories, Experiments"
    escaped_title = html.escape(full_title, quote=True)
    escaped_description = html.escape(clean_description(description), quote=True)
    escaped_canonical = html.escape(canonical, quote=True)
    escaped_kind = html.escape(page_kind, quote=True)
    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0a0a09">
  <meta name="description" content="{escaped_description}">
  <meta property="og:site_name" content="{SITE_NAME}">
  <meta property="og:type" content="{html.escape(og_type, quote=True)}">
  <meta property="og:title" content="{escaped_title}">
  <meta property="og:description" content="{escaped_description}">
  <meta property="og:url" content="{escaped_canonical}">
  <meta property="og:image" content="{SOCIAL_IMAGE}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{escaped_title}">
  <meta name="twitter:description" content="{escaped_description}">
  <link rel="canonical" href="{escaped_canonical}">
  <title>{escaped_title}</title>
  <link rel="icon" href="/assets/orbit-logo.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/style.css">
  <script src="/script.js" defer></script>
</head>
<body data-page-kind="{escaped_kind}">
  <a class="skip-link" href="#content">Skip to content</a>
  <div class="site-shell">
    <header class="site-header" data-header></header>
    <main id="content" tabindex="-1" data-page></main>
    <footer class="site-footer" data-footer></footer>
  </div>
  <noscript><section class="noscript" aria-labelledby="noscript-title"><h1 id="noscript-title">{html.escape(title)}</h1><p>{escaped_description}</p><p>This archive uses JavaScript to assemble validated content records.</p></section></noscript>
</body>
</html>
'''


def add(records: dict[str, dict], path: str, title: str, description: str, kind: str = "website", og_type: str = "website") -> None:
    records[path.split("#", 1)[0]] = {"title": title, "description": description, "kind": kind, "og_type": og_type}


def build_records() -> dict[str, dict]:
    site = load("site")
    projects = load("project_context")
    music = load("music_catalog")
    content = load("content_catalog")["entries"]
    library = load("library")["collections"]
    records: dict[str, dict] = {}

    add(records, "/", SITE_NAME, site["thread"], "home")
    section_metadata = {
        "/in-motion/": ("In Motion", "A current-state record of music, engineering work, GoBoot, and JARVIS without a fabricated roadmap."),
        "/projects/": ("Projects", "Long-running engineering systems documented through purpose, architecture, constraints, and maintainability."),
        "/music/": ("Music", "Albums, songs, lyrics, themes, and visual work from a primary creative body of work."),
        "/experiments/": ("Experiments", "Worldbuilding, narrative systems, and simulations exploring emergence, belief, identity, and responsibility."),
        "/library/": ("Library", "Articles, notes, project journals, and music commentary from the connected archive."),
        "/timeline/": ("Timeline", "A chronology of releases, project milestones, writing, and other archive records where dates are known."),
        "/search/": ("Search", "Search software, music, writing, experiments, themes, and their connected records."),
        "/about/": ("About", site["statement"]),
        "/contact/": ("Contact", "Verified public contact information for Timo Schmidt, when available."),
    }
    for path, (title, description) in section_metadata.items():
        add(records, path, title, description, "section")

    for project in projects:
        add(records, project["path"], project["title"], project["summary"], "project", "article")
    for collection in library:
        add(records, f'/library/{collection["slug"]}/', collection["title"], collection["description"], "collection")
    for entry in content:
        add(records, entry["path"], entry["title"], entry["summary"], entry["type"], "article")
    for album in music["albums"]:
        add(records, album["path"], album["title"], album["description"], "album", "music.album")
        for track in album["tracks"]:
            description = f'{track["title"]}, track {track["track"]} from {album["title"]}. Listen with synchronized lyrics and explore connected archive records.'
            add(records, track["path"], track["title"], description, "track", "music.song")
    return records


def main() -> int:
    records = build_records()
    for path, metadata in records.items():
        output = route_file(path)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(shell(path, metadata["title"], metadata["description"], metadata["kind"], metadata["og_type"]), encoding="utf-8")
    print(f"Built route-aware metadata for {len(records)} HTML shells.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
