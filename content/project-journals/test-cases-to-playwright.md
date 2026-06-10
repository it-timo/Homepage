---
title: From Human Test Cases to Playwright
slug: test-cases-to-playwright
collection: project-journals
status: active project record
year: 2026
date:
summary: The Test Generation Platform explores how human-readable KiwiTCMS cases can become executable Playwright automation without losing their intent.
themes: [test automation, Playwright, KiwiTCMS, Python, TypeScript]
relationships: [project:test-generation-platform, project:external-playwright-adapter, note:quality-is-designed]
---
The Test Generation Platform connects human-written test cases with executable Playwright automation. KiwiTCMS remains the human-readable source; Python, TypeScript, Docker, and Jinja2 form the path toward repeatable execution.

The difficult part is not simply emitting code. It is preserving intent while moving between representations, and allowing external repositories to participate without forcing every codebase into the same shape. The External Playwright Adapter exists as the pragmatic integration point for that larger testing ecosystem.
