# dev-timo.com digital ecosystem

A zero-build, JSON-driven living archive for Timo Schmidt's software, music, writing, and experiments.

## Source of truth

`WEBSITE_KNOWLEDGE_BASE.md` defines the known identity, work, themes, and website philosophy. Content must not invent dates, release states, project details, links, or biography to make a page appear complete.

`AUDIT_AND_IMPROVEMENT_PLAN.md` records the audit that led to the current structure and explains which generic or unsupported elements were removed.

## Local development

The site uses `fetch` to load shared data, so serve it over HTTP:

```bash
python3 -m http.server 8000
```

Open <http://localhost:8000>.

## Content collections

- `data/site.json` — identity and primary navigation
- `data/profile.json` — professional background, disciplines, languages, principles, and recurring questions
- `data/in-motion.json` — current priorities without a fixed roadmap
- `data/projects.json` — engineering records and project detail-page data
- `data/albums.json` and `data/songs.json` — album concepts, complete tracklists, notable tracks, and visual work
- `data/experiments.json` — simulation, narrative, and worldbuilding explorations
- `data/library.json` — collection definitions and future writing entries
- `data/timeline.json` — known current and long-running states without invented dates

Every navigable content record stores its own `path`. Rendering is generic; adding a record should not require a slug-specific branch in `script.js`.

## Content audit

Run the content audit after changing JSON or adding routes:

```bash
node scripts/audit-content.mjs
```

It validates required fields, unique slugs, album tracklists, notable-track references, navigation structure, and matching HTML entry points.

Also run:

```bash
node --check script.js
git diff --check
```

## Adding a page

1. Add or update the relevant JSON record.
2. Set its canonical `path`.
3. Copy the shared `index.html` shell to that path if the static host requires physical entry files.
4. Run `node scripts/audit-content.mjs`.

The Library intentionally has no fabricated entries. Add writing only when real content and publication context are available.
