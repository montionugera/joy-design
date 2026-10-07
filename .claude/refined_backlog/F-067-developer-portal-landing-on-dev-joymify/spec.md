---
title: "Developer Portal landing on dev.joymify.com with 3-library switcher and legacy design redirect"
id: F-067
status: refined
from_idea: I-072
---

# Developer Portal landing on dev.joymify.com with 3-library switcher and legacy design redirect

## Goal

Fold Joymify's three primary libraries (`joy-design`, `node-server-decorator`, and `cli-state-handler`) under a single consolidated domain (`dev.joymify.com`). Provide a unified, high-aesthetic Bento Developer Portal landing page at the web root (`/`), seamless cross-library navigation switchers, and a safe HTTP 301 permanent redirect from `design.joymify.com` to `dev.joymify.com/design` to ensure zero broken bookmarks or links.

## Architecture

1. **Web Root Portal Landing (`/`)**:
   - High-aesthetic Bento grid showcasing the 3 core libraries side by side:
     - **Joy Design System** (`/design`): Multi-framework UI suite (React, Svelte 5, Flutter), tokens, and 70+ components.
     - **Node Server Decorator** (`/server-decorator`): Polyglot microservices decorator suite (`@cache`, `@tracking`, `@retry`, `@circuit_breaker`, SSE streaming).
     - **CLI State Handler** (`/cli-state-handler`): Terminal workflow state manager & interactive CLI engine.
   - Status indicators, version chips, and direct links to GitHub repositories and npm packages.

2. **Cross-Library Switcher Header**:
   - Universal navigation bar allowing instant switching between the UI Design System, Server Decorators, and CLI State Handler.
   - Integrated dark and light theme toggle respecting `--joy-surface-*` and `--joy-accent-*` design tokens.

3. **Kubernetes Ingress & Legacy Decommissioning**:
   - Update `k8s/ingress.yml` to serve `dev.joymify.com` with prefix paths (`/`, `/design`, `/server-decorator`, `/cli-state-handler`).
   - Add legacy ingress redirect for `design.joymify.com` returning HTTP 301 to `https://dev.joymify.com/design$request_uri`.

## Acceptance criteria

- [x] Web root (`/`) provides a responsive, semantic Bento-grid Developer Portal introducing all 3 libraries.
- [x] Universal cross-library navigation header is present and functional across desktop and mobile viewports.
- [x] `k8s/ingress.yml` configures `dev.joymify.com` with prefix path routing and HTTP 301 permanent redirect for `design.joymify.com`.
- [x] Zero color literal violations (all styles powered by semantic design tokens).
- [x] Gate 1 Precheck passes with 0 test failures.
