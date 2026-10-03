---
title: "production-grade-palette-aesthetic-refinement-and-bauhaus-cobalt"
id: F-051
status: refined
from_idea: I-056
---

# production-grade-palette-aesthetic-refinement-and-bauhaus-cobalt

## Problem

The initial 5 palette presets feel non-production and uncalibrated:
1. **Dessau Bauhaus** uses crimson red (`#b91c1c` / `#dc2626`) as the default primary action fill (`accent-default`). In a state-rich enterprise UI, red signals "destructive/delete/error".
2. **Clay Court** in dark mode uses a powdery peach (`#dfb093`), which reads as cosmetic chalk rather than rich fired terracotta under stadium lights.
3. **Nordic Slate** uses generic SaaS sky-blue (`#38bdf8`) rather than mineral architectural granite and arctic fjord navy.
4. **Verdant Lawn** uses a generic startup neon green instead of heritage British racing green and champagne gold.
5. Missing systematic contrast gating: interactive hover/active states and secondary/muted texts lack full contrast coverage.

## Why now

Release 2.29 fixed immediate text-on-accent contrast bugs, but the aesthetic choices remain amateur and do not align with Joymify's brand values (composed, exact, warm) or authentic material culture. Release 2.30 executes this full overhaul.

## Sketch

1. Implement the 5 curated presets in `packages/tokens/scripts/ramps.mjs` using the calibrated OKLCH coordinates from the approved spec (`docs/superpowers/specs/2026-10-03-production-grade-aesthetic-palettes-design.md`):
   - **Joy Classic**: Oxford Navy (`#14253e`), Ochre Gold (`#c49a3a` / `#dab362`), Parchment Cream (`#f8f3e8`).
   - **Dessau Bauhaus**: Architectural Cobalt (`#1e40af` / `#2563eb`) as action fill; Crimson (`#b91c1c` / `#dc2626`) and Cadmium Yellow (`#d97706` / `#f59e0b`) as graphic emblems/badges.
   - **Clay Court**: Roland-Garros Terracotta (`#9c4221` / `#d97746`), Court Pine (`#264e22`), Court Line White (`#fbf0ea`).
   - **Nordic Slate**: Architectural Granite (`#0f172a` / `#1e293b`), Arctic Fjord Navy (`#0369a1` / `#075985`), Silver Mist Paper (`#f8fafc`).
   - **Verdant Lawn**: British Racing Green (`#143d2b` / `#22593d`), Champagne Gold (`#c9a227` / `#d6b64a`), Lawn Ivory (`#f4f6f0`).
2. Regenerate `packages/tokens/src/tokens.json` and build `packages/tokens/dist/theme.css`.
3. Expand unit contrast assertions in `packages/tokens/test/contrast.test.js` to cover all 110 contrast pairs (text on action default/hover/active, text primary/secondary/muted on canvas and card, border on canvas and card) across all 5 presets in light and dark themes.
4. Verify in Storybook Hub with Playwright live-DOM tests and capture fresh visual proof.

## Acceptance criteria

- [ ] All 5 presets define all 24 semantic token keys in `packages/tokens/scripts/ramps.mjs`.
- [ ] Dessau Bauhaus uses Architectural Cobalt (`#1e40af` light / `#2563eb` dark) for `accent-default`.
- [ ] Clay Court dark mode uses Fired Terracotta (`#d97746`) for `accent-default`.
- [ ] All 110 contrast pairs pass WCAG 2.2 AA (≥ 4.5:1 for text, ≥ 3.0:1 for borders) in `packages/tokens/test/contrast.test.js`.
- [ ] Playwright palette switcher tests pass and verify live DOM computed styles.
- [ ] Gate 1 (`./scripts/precheck.sh`) passes with 0 errors.
