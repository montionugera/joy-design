---
title: "Color palette preset system with 5 presets and Bauhaus joy-coach full design system integration"
id: I-053
status: idea
---

# Color palette preset system with 5 presets and Bauhaus joy-coach full design system integration

## Problem

1. `joy-coach` (`/Users/pasitnusso/workspace/repos/joy-coach/joy-coach-svc/packages/ui`) was forced to vendor a reconstruction of `joymify-base.css` and maintain a parallel `@joy-coach/ui` component library because Joymify Design System lacked:
   - The **Clay ramp** (`--clay-50`..`--clay-600`) and court surface tokens (`--surface-clay-*`, `--surface-grass-*`, etc.).
   - **Result & Sports analytics semantics** (`--result-won`, `--result-lost`, `--result-retired`, `--result-title`).
   - **Display Serif typography** (`--font-display: 'Cormorant Garamond'`) and tabular lining numeral standards.
   - Bauhaus structural primitives (`VoiceCard`, `PerformanceBars`, `DenseRow`, `MonoChip`, `Emblem`, `StatCard` editorial mode).
2. The Storybook Hub offers only a binary Dark/Light toggle on a single Navy/Gold palette, preventing product teams from exploring alternative curated visual directions (Bauhaus primary triad, clay court, minimalist slate, verdant lawn) without manual overrides.

## Why now

- The Joymify ecosystem is consolidating multiple frontends (`joy-coach`, `quant`, `connect-fe`, `fact-board`). Bringing full Bauhaus and Joy-Coach support into `@joymify/tokens`, `@joymify/svelte`, and `@joymify/react` eliminates duplicated vendored files and unlocks multi-brand themes.
- Adding a 5-preset palette selector directly into Storybook Hub provides immediate visual delight and rapid design iteration.

## Sketch

1. **Tokens (`@joymify/tokens`)**:
   - Add Clay color ramp (`--joy-color-clay-50`..`--joy-color-clay-600`).
   - Add court surfaces and sports result semantics.
   - Add display serif font stack (`Cormorant Garamond` + Thai companion).
   - Add 5 palette presets mapped to `[data-palette="..."]`:
     - `classic`: Joy Classic (Navy / Gold / Cream / Ink)
     - `bauhaus-primary`: Dessau Geometric (Cobalt / Crimson / Cadmium Yellow)
     - `clay-court`: Roland-Garros (Terracotta / Olive / Sand)
     - `nordic-slate`: Bauhaus Steel (Slate / Cerulean / Cool Paper)
     - `verdant-lawn`: Wimbledon (Racing Green / Champagne / Ivory)
2. **Components (`@joymify/svelte` & `@joymify/react`)**:
   - `VoiceCard`: Container for dual Bauhaus registers (`editorial` vs `performance`).
   - `StatCard`: Enhanced editorial mode with serif numerals, required note, delta, and progress bar.
   - `PerformanceFigure` & `PerformanceBars`: Monospace figures and square outcome bars.
   - `DenseRow` & `MonoChip`: High-density tabular metric display.
   - `TrendLine`: Minimal dual-series sparkline.
   - `Emblem`: Bauhaus circular badge with SVG text path.
3. **Storybook Hub (`apps/storybook-hub`)**:
   - Topbar palette dropdown with 3-dot color swatch preview pills and `localStorage` persistence.
   - Bauhaus showcase panel demonstrating both editorial and performance registers.

## Acceptance criteria

- [ ] `@joymify/tokens` defines Clay ramp, court surface semantics, result tokens, and display serif typography.
- [ ] 5 distinct color palette presets are implemented in tokens CSS under `[data-palette="..."]` with full WCAG AA contrast compliance in both light and dark modes.
- [ ] Storybook Hub topbar includes a responsive palette switcher with swatch previews, updating tokens live and persisting in `localStorage`.
- [ ] Bauhaus component twins (`VoiceCard`, `StatCard` editorial mode, `PerformanceFigure`, `PerformanceBars`, `DenseRow`, `MonoChip`, `TrendLine`, `Emblem`) are implemented in both `@joymify/svelte` and `@joymify/react`.
- [ ] Svelte and React component twins maintain 100% parity (`node scripts/parity-check.mjs` exits 0).
- [ ] Strict color linting (`scripts/lint-colors.sh`) passes with 0 violations.
- [ ] Gate 1 precheck (`./scripts/precheck.sh`) passes with all unit and Playwright tests green.
