# dev-timo.com connected archive

A zero-build living archive whose pages are generated from authoritative media, Markdown, GitHub, and manually curated metadata.

## One build command

```bash
python3 build_all.py
```

The build attempts to refresh GitHub and retains the last checked-in repository catalog if the API is unavailable. For a deterministic offline build:

```bash
python3 build_all.py --skip-github
```

The pipeline runs, in dependency order:

1. GitHub discovery and project-profile enrichment
2. Filesystem music discovery
3. Manual music metadata enrichment
4. Markdown ingestion
5. Relationship graph generation and reference validation
6. Timeline generation
7. Search-index generation
8. Full content audit

Serve the result with `python3 -m http.server 8000`.

## Entity relationships

Every archive entity has a stable namespaced ID:

- `album:core-override`
- `track:core-override:used-to-be-easy`
- `video:used-to-be-easy`
- `project:jarvis`
- `article:architecture-is-communication`
- `note:maintainability-over-hype`

Source records contain `relationships` with a relationship type and target ID. `tools/build_relationships.py` fails on broken targets and writes `data/entities.json` with resolved labels, paths, entity types, incoming relationships, and an edge list. Pages use that graph to render connected records.

## Music discovery and enrichment

`assets/music/` is authoritative for albums and track media. Each album requires `album.json`. Numbered `.wav`, `.png`, and `.lrc` files are grouped into tracks by `tools/build_music_catalog.py`; durations, runtime totals, navigation, media paths, IDs, and static routes are generated.

Manual themes, years, statuses, and relationships belong in `metadata/music.json`, never in `data/music_catalog.json`. `tools/enrich_music.py` merges them after discovery. Metadata for a track whose media is not present remains reported under `unmatched_track_metadata` until the matching files arrive.

LRC parsing retains both plain text and timestamps. Current pages render plain lyrics with timestamp attributes ready for future synchronized playback. Audio uses native HTML5 controls and never autoplays.

## Markdown knowledge base

Write source documents in:

```text
content/articles/*.md
content/notes/*.md
```

Each file uses front matter:

```yaml
---
title: Architecture Is Communication
slug: architecture-is-communication
collection: articles
status: living note
year: 2026
date:
summary: A durable summary.
themes: [architecture, documentation]
relationships: [project:jarvis]
---
```

`tools/build_content_catalog.py` generates `data/content_catalog.json` and `/library/<collection>/<slug>/` routes while preserving Markdown as the editable source.

## GitHub intelligence

The authoritative account is **`it-timo`**. `tools/update_github.py` excludes forks and archived repositories and collects descriptions, README excerpts, languages, topics, update/create/push times, stars, forks, open issues, and repository size.

- `data/project_featured.json` contains manually featured repository names.
- `data/project_overrides.json` adds narrative summaries, themes, relationships, or other manual corrections by repository name.
- `data/project_context.json` holds non-GitHub engineering records and is not overwritten.
- `data/projects.json` is generated and should not be hand-edited.

Set `GITHUB_TOKEN` for higher API limits.

## Timeline and search

`tools/build_timeline.py` combines dated albums, tracks, projects, repositories, milestones, articles, notes, videos, and experiments with `data/timeline_manual.json`. Project milestone sources live in `data/milestones.json`. Exact dates are used when known; year-only records remain year-only.

`tools/build_search.py` indexes titles, summaries, themes, entity types, and connected-record titles. Search therefore returns records through both direct metadata and their relationships.

## Validation

```bash
python3 build_all.py --skip-github
node --check script.js
python3 -m py_compile build_all.py tools/*.py
git diff --check
```
