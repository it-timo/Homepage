# dev-timo.com digital ecosystem

A zero-build, JSON-driven static website for long-term projects, music releases, writing, timelines, and experiments.

## Local development

The site loads shared data with `fetch`, so serve it through a local HTTP server rather than opening `index.html` directly:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Content model

Content lives in `/data`:

- `projects.json` — software and systems with lifecycle statuses
- `albums.json` and `songs.json` — releases, track listings, lyrics, and credits
- `articles.json` — articles, notes, project journals, and music commentary
- `timeline.json` — a cross-discipline chronological archive
- `experiments.json` — worlds, narrative ideas, and simulations
- `site.json` — shared identity, contact, and profile details

Pages are lightweight HTML entry points assembled by the shared `script.js` component and routing layer. Add content to JSON collections without duplicating it across pages.
