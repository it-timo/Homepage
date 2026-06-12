# Website audit and improvement plan

## Audit

### Authenticity problems

- The original data invented albums (`The Shape of Distance`, `Untitled / III`), projects (`Quiet Systems`), experiments (`The City Below Noon`, `Emergence Atlas`), dates, catalog numbers, release states, and article publication history that are not supported by the knowledge base.
- `Grounded Fire` had an incorrect five-song tracklist and an invented release year. `Used To Be Easy` was attached to the wrong album.
- DNS Database was described as a “compact experiment,” hiding its actual scale, Go/RocksDB architecture, test coverage, documentation, and lifecycle focus.
- The Test Generation Platform omitted KiwiTCMS, Playwright, the human-to-automation workflow, and its integration purpose.
- JARVIS was reduced to generic AI-orchestration language and lost its mission, planned architecture, and “Autonomous Until The Gate” principle.
- The professional background, Alpha Strike Labs experience, engineering disciplines, languages, and working principles were absent.
- Contact and social links were rendered as dead `#` placeholders.

### Information architecture problems

- The required “In Motion” view did not exist as a first-class section.
- Project cards had no detail pages, despite the architecture claiming detail support.
- The Library presented invented articles as published work instead of honestly showing an archive prepared for future writing.
- Music pages prioritized generic cover cards over album themes, acts, tracklists, notable tracks, and the relationship between music and the rest of the work.
- The timeline used invented dates and presented a false chronology rather than a maintainable record of known states.
- “Worlds” in navigation did not match the requested “Experiments” information architecture.

### Generic/portfolio-like patterns

- Hero language such as “Selected systems in motion,” “Enter the timeline,” “All projects,” large marketing headlines, numeric section labels, and uniform cards made the site read like a designed portfolio.
- Cards gave every item equal shape and shallow depth. They emphasized presentation instead of why the work exists.
- Calls to action and “open file” links implied detail that did not exist.
- The About page relied on abstract creative language while omitting concrete career history and engineering philosophy.

### Maintainability problems

- Several templates contained hardcoded content that already existed—or should have existed—in JSON.
- Rendering rules special-cased individual slugs instead of using paths stored in content records.
- Status values mixed project lifecycle, publication state, and release state without a documented model.
- Empty links and fabricated placeholders made it difficult to distinguish known facts from future content slots.
- Client-side rendering had no content audit script to catch missing fields, unsupported statuses, duplicate slugs, or broken internal routes.

## Improvement plan

1. Make the supplied knowledge base a committed source of truth and document content provenance.
2. Replace invented records with the known projects, albums, creative work, priorities, professional background, and themes.
3. Add an honest “In Motion” page driven by current-priority records, with no rigid roadmap or invented dates.
4. Deepen music information architecture around albums, themes, acts, complete tracklists, notable songs, and the Used To Be Easy video.
5. Add data-driven project detail pages for DNS Database, Test Generation Platform, External Playwright Adapter, and JARVIS.
6. Treat Library as a prepared but honest archive: collection definitions and future structure, without fake publication dates or articles.
7. Reframe Timeline as a state/history index that uses only known chronology and explicitly marks undated records.
8. Replace portfolio calls-to-action with contextual cross-links explaining recurring themes across domains.
9. Add content schemas, route fields, and an automated audit script for long-term maintenance.
10. Preserve the calm Orbit/Signal visual system while reducing decorative marketing patterns and improving reading hierarchy.
