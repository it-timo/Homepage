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
2. Music metadata and optional local-media discovery
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

Source records contain `relationships` with a relationship type and target ID. `tools/build_relationships.py` fails on broken targets and writes `data/entities.json` with resolved labels, paths, entity types, incoming relationships, and an edge list. Pages use that graph to render connected records. The graph builder rejects self-references, deduplicates repeated edges, and the renderer suppresses links that would reopen the current destination.

## Music catalog and externally deployed media

Git stores the catalog, not the large media files. Each `assets/music/<album>/` directory contains:

- `album.json` for album metadata
- `tracks.json` for the ordered track titles and filename stems

The corresponding `.flac`, `.png`, and `.lrc` files are deployed directly to the same public `/assets/music/<album>/` path and are ignored by Git. A track manifest entry such as:

```json
{"track": 1, "title": "Used To Be Easy", "file": "01_Used_to_be_easy"}
```

produces URLs ending in `.flac`, `.png`, and `.lrc`, plus the song route and previous/next navigation. When FLAC files are present locally, the builder reads duration from the FLAC STREAMINFO block. When media exists only on the deployed homepage, album and song pages read duration from the browser's audio metadata without downloading the complete song or storing a manual duration.

Manual themes, years, statuses, and relationships belong in `metadata/music.json`, never in `data/music_catalog.json`. `tools/enrich_music.py` merges them after catalog generation.

LRC parsing supports metadata, multiple timestamps per line, and the standard millisecond `offset` tag. Timestamped lyrics follow the native audio player, highlight the active line, keep it visible, and let a visitor seek by selecting a line without forcing playback. Files without timestamps remain a simple plain-text lyric view. Audio never autoplays.

## Markdown knowledge base

Write source documents in:

```text
content/articles/*.md
content/notes/*.md
content/project-journals/*.md
content/music-commentary/*.md
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
  These records preserve an overview, known facts, technologies, architectural responsibilities, engineering concerns, meaning, and relationships; project pages render the full record rather than reducing it to a summary card.
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
