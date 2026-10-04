---
title: "Fix button red line highlight, style sleek theme scrollbars, upgrade Antigravity particles, and add 3D mesh and Cover landing blocks"
id: I-059
status: idea
---

# Fix button red line highlight, style sleek theme scrollbars, upgrade Antigravity particles, and add 3D mesh and Cover landing blocks

## Problem

1. **Red line on solid button**: In `packages/tokens/src/tokens.json`, the `bauhaus-primary` (Dessau Bauhaus) palette configures `"accent-highlight": "#dc2626"` (dark) and `"#b91c1c"` (light). Because `.joy-button--solid` uses `box-shadow: inset 0 1px 0 var(--joy-accent-highlight)`, cobalt blue buttons render an unnatural, glaring crimson red line across their top bevel.
2. **Ugly default scrollbar**: Storybook Hub's sidebar navigation (`.nav`) and main content viewport (`.main`) lack custom scrollbar rules, causing browsers on macOS and Windows to render an opaque, stark white scrollbar gutter with a grey box thumb against dark theme canvases.
3. **Ugly constellation particles**: The existing kinetic hero canvas uses an obsolete 2015-style `particles.js` connecting-lines constellation algorithm that clusters into spiderweb knots in the corner of the hero.
4. **Missing 3D and cover landing hero blocks**: The landing block library lacks modern interactive hero variations inspired by top-tier reference designs:
   - Google Antigravity-style floating multi-colored capsule/pill particles with cursor lift-off physics.
   - OpenAI Codex-style 3D undulating wireframe grid / cyber wave plane.
   - Gucci-style editorial full-bleed visual cover hero with centered luxury typography and minimalist CTA.

## Why now

User feedback directly identified these four visual flaws with attached photographic evidence from the live Storybook Hub. Resolving them elevates the design system to top-tier enterprise quality.

## Sketch

1. **Tokens**: Update `bauhaus-primary` `accent-highlight` to harmonized cobalt tints (`#60a5fa` in dark, `#93c5fd` in light). Rebuild tokens.
2. **Scrollbars**: Add custom scrollbar styles across Storybook Hub (`::-webkit-scrollbar` with 6px width, transparent track, `--joy-border-default` thumb, hover `--joy-border-strong`, `scrollbar-width: thin`).
3. **Antigravity Interactive Particles**: Rebuild the particle physics engine in the hero canvas to render floating multi-colored pill/capsule/orb particles that interactively lift off and repel from cursor movements with smooth velocity dampening and zero spiderweb lines.
4. **3D Mesh and Editorial Cover Blocks**:
   - Provide an interactive switcher in the Storybook Hub landing blocks view to demonstrate:
     - **Antigravity Particle Field**: Multi-colored floating capsules with cursor physics.
     - **Codex 3D Volumetric Wave**: Dynamic undulating wireframe perspective plane on canvas.
     - **Editorial Cover Hero**: Edge-to-edge visual cover block with centered typography and luxury pill CTA.

## Acceptance criteria

- [ ] Solid buttons in `bauhaus-primary` palette have a harmonized cobalt highlight with zero red pixels on their top edge.
- [ ] Sidebar `.nav` and `.main` viewports render sleek 6px themed scrollbars with transparent tracks and rounded thumbs in both Light and Dark modes.
- [ ] Kinetic particle canvas in the hero renders Antigravity-style floating multi-colored particles that react smoothly to mouse movement without connecting spiderweb lines.
- [ ] Landing blocks view provides interactive options for Antigravity particles, Codex 3D wave mesh, and Editorial Cover hero blocks.
- [ ] `scripts/lint-colors.sh` passes with 0 violations.
- [ ] Gate 1 `scripts/precheck.sh` passes cleanly across all test suites.
