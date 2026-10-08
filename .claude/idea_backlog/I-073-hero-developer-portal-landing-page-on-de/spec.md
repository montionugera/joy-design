---
title: "Hero Developer Portal landing page on dev.joymify.com fanning out to 3 sub-webapps: Design System, Server Decorator, and CLI State Handler"
id: I-073
status: idea
---

# Hero Developer Portal landing page on dev.joymify.com fanning out to 3 sub-webapps: Design System, Server Decorator, and CLI State Handler

## Problem

Visiting `dev.joymify.com` previously dropped users straight into Joy Design's component explorer/storybook hub with the sidebar rather than a dedicated Developer Portal entry point. Furthermore, navigating to `/server-decorator/` and `/cli-state-handler/` returned HTTP 403 Forbidden because CI only checked out `joy-design` and created empty placeholder directories in the Docker image.

## Why now

Consolidating `joy-design`, `node-server-decorator`, and `cli-state-handler` under a single domain (`dev.joymify.com`) on a single Kubernetes pod requires a clear, hierarchical mental model: `index` (`/`) as a dedicated Hero Developer Portal Landing Page that links out to 3 isolated, fully functioning sub-webapps (`/design/`, `/server-decorator/`, `/cli-state-handler/`), with `design.joymify.com` permanently redirecting (301) to `/design/`.

## Sketch

1. Root `/` serves a high-aesthetic Developer Portal Hero Landing Page with:
   - Joymify brand mark & header with global dark/light theme switch.
   - Hero banner highlighting the Joymify Engineering Ecosystem.
   - 3 interactive Bento Launch Cards:
     - Joy Design System (`/design/`)
     - Node Server Decorator (`/server-decorator/`)
     - CLI State Handler (`/cli-state-handler/`)
   - Architecture & quick links.
2. Sub-paths served from the single container:
   - `/design/`: The Joy Design Storybook Hub & Component Explorer.
   - `/server-decorator/`: The Node Server Decorator Astro Starlight site.
   - `/cli-state-handler/`: The CLI State Handler Vite documentation tutorial.
3. Static bundles for `node-server-decorator` and `cli-state-handler` are integrated so the Docker build packages all three static sites deterministically.
4. Nginx config handles `/`, `/design/`, `/server-decorator/`, `/cli-state-handler/` with trailing slash normalization and SPA fallbacks, plus legacy 301 redirect for `design.joymify.com` to `https://dev.joymify.com/design$request_uri`.

## Acceptance criteria

- [ ] Web root (`/`) serves the Developer Portal Hero Landing Page introducing all 3 libraries with live launch cards.
- [ ] Sub-path `/design/` serves the Joy Design Storybook Hub.
- [ ] Sub-path `/server-decorator/` serves the Node Server Decorator Starlight documentation site without 403 Forbidden.
- [ ] Sub-path `/cli-state-handler/` serves the CLI State Handler Vite documentation site without 403 Forbidden.
- [ ] `design.joymify.com` redirects permanently (HTTP 301) to `https://dev.joymify.com/design$request_uri`.
- [ ] Gate 1 Precheck passes with 0 test failures.
