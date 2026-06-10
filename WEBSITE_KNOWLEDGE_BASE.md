# Timo Schmidt Digital Ecosystem

**Version:** 1.0

## Purpose

This website is not a portfolio, consulting landing page, or startup product page. It is a long-term digital home documenting software, automation, systems, music, writing, experiments, worldbuilding, and future ideas.

The goal is a living archive. Visitors should understand the recurring patterns behind the work rather than simply seeing a collection of projects.

## Core identity

Timo Schmidt works at the intersection of **systems, stories, and experiments**: different mediums, same curiosity.

Recurring questions:

- How do complex things emerge?
- How do systems evolve?
- How does identity persist through change?
- How do people find meaning?
- How do simple rules create unexpected outcomes?

## Professional background

Primary disciplines are backend engineering, software quality engineering, test automation, and architecture. Primary languages are Go, Python, TypeScript, and Bash.

Professional principles:

- Maintainability over hype.
- Documentation matters.
- Long-term thinking matters.
- Systems should remain understandable years later.
- Architecture is communication.
- Quality is designed, not inspected.

Timo has worked at Alpha Strike Labs GmbH for approximately 5.5 years. Work has included OSINT systems, backend development, test automation, CI/CD improvements, Docker environments, VPN testing, and mentoring interns. Current role: Software Quality Engineer.

## Software projects

### DNS Database

A large Go backend project: approximately 13,000 lines, approximately 90% test coverage, extensive documentation, lifecycle-focused design, and RocksDB-based storage. It represents long-term engineering craftsmanship.

### Test Generation Platform

An active initiative transforming human-written test cases into executable Playwright automation. Technologies include KiwiTCMS, Playwright, Python, TypeScript, Docker, and Jinja2. It represents a bridge between human-readable testing and automation.

### External Playwright Adapter

Allows external repositories to participate in a larger testing ecosystem. It represents pragmatic integration.

### JARVIS

A personal orchestration platform intended to reduce context switching by connecting projects, memory, documentation, automation, and creative work. Core principle: **Autonomous Until The Gate**. Planned technologies include LangGraph, LiteLLM, FastAPI, React, ChromaDB, and PostgreSQL. Current state: Alpha.

## Music

Music is a primary creative output, not a side hobby. Its recurring themes include identity, resilience, persistence, authenticity, technology and humanity, responsibility, loneliness, connection, and self-reflection.

### Artifacts of Resilience

An album about endurance through difficult periods, focusing on resilience, responsibility, persistence, and recovery.

1. I Still Look
2. No Echo
3. Nineteen And Nowhere
4. What Family Means
5. No Room
6. Where It Lands
7. Late Bloom
8. Built For More Stuck On Empty
9. Loyal To A Fault
10. Running On Loops
11. Trapped Inside
12. It Was Me
13. Override

Notable tracks: Loyal To A Fault, Running On Loops, It Was Me, Override.

### Core Override

An album about technology, identity, routine, and digital life, focusing on modern communication, digital relationships, self-awareness, rebuilding, and personal agency.

1. Used To Be Easy
2. Swipe Ghost Repeat
3. All The Right Lies
4. Say It Or Leave It
5. Velvet Lies
6. I Am The Voice In Your GPS
7. Walls We Built
8. System Upgrade
9. The Only Worker In The Mainframe
10. Nothing Personal Just The Apocalypse
11. Static Noise And Cold Coffee
12. Burn The Night Into Me
13. Built From Scraps

Notable tracks: Used To Be Easy, Walls We Built, Built From Scraps, The Only Worker In The Mainframe.

### Grounded Fire

A 13-track concept album about reconnection after emotional and technological disconnection.

- Act I: Disconnection
- Act II: Reactivation
- Act III: Self Respect Through Intensity

1. Idle State
2. Simulated Warmth
3. The Distance Between Sparks
4. Pulse Detect
5. She Glitches Just Right
6. No More Careful
7. Chemical Voltage
8. Too Loud To Fade
9. The Cost Of No Mistakes
10. Unapologetic Depth
11. Grounded Fire
12. No Script
13. After The Pulse

Notable tracks: Simulated Warmth, No More Careful, Chemical Voltage, Too Loud To Fade, Grounded Fire.

### Used To Be Easy video

The current major video production. Its central figure, The Walker, is a 36-year-old man with dark hair and light stubble who is reflective and emotionally restrained. Themes include memory, nostalgia, distance, connection, and personal history. Warm memory silhouettes represent remembered human connection; they are not ghosts.

## Creative projects

### More Powerful Passenger

A civilization-scale god simulation. The player acts as a limited god, faith is scarce, civilizations evolve autonomously, and there is no victory condition. Themes include emergence, belief, interpretation, responsibility, and indirect influence.

### Narrative Simulation

An exploratory project about story systems, emergent narratives, and simulation.

### Manhwa concepts

A long-term, exploratory practice focused on characters, systems, worldbuilding, and narrative structures.

## Current priorities

Music, professional engineering work, GoBoot, and JARVIS. Future directions intentionally remain open; the website must not imply a rigid roadmap.

## Website philosophy

Use grounded, thoughtful, precise, human language. Avoid startup aesthetics, consulting language, buzzwords, and generic portfolio patterns.

The primary visual motif is **Orbit / Signal**, representing systems, emergence, movement, and connection. The style is dark, cinematic, industrial minimalism with warm orange accents, high contrast, and calm typography. Avoid neon cyberpunk, gamer aesthetics, SaaS blue, and excessive glassmorphism.

## Information architecture

Primary sections: Home, In Motion, Music, Projects, Experiments, Library, Timeline, About, and Contact.

The homepage should answer who this person is—not what services this person sells.

## Music System v1

The metadata below `assets/music/` is authoritative for published website music data. Every album directory contains `album.json` and `tracks.json`. Large FLAC, PNG, and LRC media files are deployed directly to the homepage and intentionally remain outside Git. The track manifest defines titles, order, and filename stems; routes, media paths, album statistics, and previous/next navigation are generated. Runtimes come from local FLAC STREAMINFO when available or deployed browser audio metadata otherwise.

Album routes use `/music/<album>/`; track routes use `/music/<album>/<track>/`. Playback uses native HTML5 audio with no autoplay. LRC parsing supports a plain lyric view now and retains timestamps for future synchronized lyrics.

## GitHub integration

The authoritative GitHub username is **`it-timo`**. Public repository data is generated from the GitHub API into `data/projects.json`. Forks and archived repositories are excluded and results are sorted by most recent update. Manually curated highlights live only in `data/project_featured.json`.

## Connected Archive Infrastructure

Archive records use stable, namespaced entity IDs and explicit typed relationships. Relationships are validated during the build and resolved in both directions so an album can point to a video while the video is also discoverable from the album's incoming links.

Manual music enrichment belongs in `metadata/music.json`; generated media records remain disposable build output. Long-form knowledge belongs in Markdown under `content/articles/` and `content/notes/`. GitHub facts and manually authored project meaning remain separate and are merged during generation.

The timeline is generated from dated entities and explicit manual history. Search indexes direct metadata together with connected record titles, allowing themes to reveal work across mediums.
