---
title: "Dedicated Developer Portal hero landing page at root with 3 sub webapps and full storybook at /design/"
id: I-074
status: idea
---

# Dedicated Developer Portal hero landing page at root with 3 sub webapps and full storybook at /design/

## Problem

Visiting `https://dev.joymify.com` loads the Joymify Design System Storybook Hub with the 280px component sidebar (Button, Badge, etc.) taking up the screen, instead of presenting a dedicated, clean, standalone Developer Portal Hero Landing Page that fans out to the 3 core libraries (`index -> 3 sub`). The design system component catalog should live at `/design/`, while `/` should be the top-level portal home.

## Why now

With `dev.joymify.com` now live, users arriving at the root domain expect a high-impact developer portal landing page showcasing the 3 core open-source libraries rather than a component explorer for just one of them.

## Sketch

1. Make `dist/index.html` (served at `/`) render in full-width Portal Mode:
   - Hide the component sidebar (`display: none`).
   - Topbar displays "Joymify Developer Portal" with direct nav links to Design System (`/design/`), Server Decorator (`/server-decorator/`), and CLI State Handler (`/cli-state-handler/`).
   - Prominent Hero section: "The Unified Engineering Ecosystem for Joymify" with CTAs to all 3 sub-webapps.
   - 3 distinct Bento cards showcasing the 3 libraries with live links.
2. In `dist/design/index.html` (served at `/design/`):
   - Full Joymify Design System Storybook Hub with sidebar and component matrix.
   - Prominent back-link `← Back to Developer Portal` linking to `/`.
3. Support deep hash links on `/` (e.g. `/#button`) by switching view seamlessly.

## Acceptance criteria

- [ ] Visiting `/` renders the Developer Portal Hero Landing Page without the 280px component sidebar.
- [ ] Root `/` prominently displays the 3 sub-webapps (Joy Design System, Node Server Decorator, CLI State Handler).
- [ ] Visiting `/design/` renders the Joy Design System Storybook Hub with the full component sidebar.
- [ ] `/design/` includes a clear `← Back to Developer Portal` link pointing to `/`.
- [ ] All 3 sub-webapps (`/design/`, `/server-decorator/`, `/cli-state-handler/`) return HTTP 200 without 403 Forbidden.
- [ ] All Gate 1 checks and Playwright tests pass cleanly.
