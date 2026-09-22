---
title: "Wave 1: semantic token foundation — light/dark remaps, brand-tinted ramps, type/space/z/shadow scales, reduced motion, foreign-hex lint and epic-check gate"
id: F-036
status: refined
epic: E-001
from_idea: I-036
---

# Wave 1: semantic token foundation

Parent: E-001. Audit evidence: `research/audit-tokens.md` (94 issues, 20 P0) and `research/contrast-table-before.md`. Every issue ID TOK-001…TOK-094 must be resolved or explicitly deferred with a reason in the plan.

## Problem

`packages/tokens` is a primitive dump (brand, surface, border, text, status, 6 spacings, 4 radii, 3 z-indices) plus a 3,700-line component CSS string in `build.js`. Dark mode is 112 per-component overrides; 40+ `#7c3aed` purple and slate fallbacks pollute the brand; gold and status colors fail WCAG as text; there is no type scale; the Tailwind `@theme` export is corrupted; nothing handles reduced motion; nothing prevents regressions.

## Scope (in)

1. **Primitive ramps in `tokens.json`** (OKLCH-derived, exported as hex):
   - `navy` 50–950 anchored at `navy-500 #14253e`; `gold` 50–950 anchored at `gold-400 #c49a3a` with `gold-600` ≥ 4.5:1 on white and cream (text/link use) and `gold-300` ≥ 4.5:1 on `navy-900` (dark accent); `ink` 50–950 anchored at `ink-500 #1f1c13`; `cream` 50–300 anchored at `cream-100 #f8f3e8`.
   - Neutral ramp `neutral` 50–950 tinted toward the ink/navy hue (chroma 0.005–0.015). Delete every slate value (`#0f172a #1e293b #334155 #64748b #cbd5e1 #e2e8f0 #f1f5f9 #f8fafc`).
   - Status ramps `success`, `warning`, `danger`, `info`, each with 100/300/500/600/700/900 and hue-tuned to the brand (warm amber warning, deep green success, brick danger, navy-leaning info). No raw Tailwind values remain.
2. **Semantic layer** defined on `:root` from primitives and remapped once under `[data-theme="dark"]` (also under `@media (prefers-color-scheme: dark)` guarded by `:root:not([data-theme="light"])`):
   `--joy-surface-{canvas,card,raised,sunken,overlay,inverse}`, `--joy-text-{primary,secondary,muted,inverse,link,on-accent}`, `--joy-border-{subtle,default,strong,focus}`, `--joy-accent-{default,hover,active,subtle,text}`, `--joy-status-{success,warning,danger,info}-{fg,bg,border}`, `--joy-focus-ring` (2px, ≥ 3:1 against both canvas and card), `--joy-elevation-{0,1,2,3}` (navy-tinted shadows in light; border+lighter-surface in dark), `--joy-z-{base,dropdown,sticky,backdrop,drawer,modal,popover,toast,tooltip}`, `--joy-font-size-{xs,sm,md,lg,xl,2xl,3xl,4xl,5xl}` on a 1.2 ratio from 0.75rem, `--joy-font-size-display-{sm,md,lg}` as `clamp()`, `--joy-line-height-{tight,snug,normal,relaxed}`, `--joy-font-weight-{regular,medium,semibold,bold}`, `--joy-letter-spacing-{tight,normal}`, `--joy-space-{0.5,1,2,3,4,5,6,8,10,12,16,20,24}`, `--joy-radius-{control,card,overlay,pill}`, `--joy-duration-{fast,normal,slow}`, `--joy-ease-{out,in-out,emphasized}`, `--joy-control-height-{sm,md,lg}` (32/40/48px, 44px minimum on touch via `@media (pointer: coarse)`).
   Dark card must be lighter than dark canvas; dark text primary is cream-tinted, not `#ffffff`; dark interactive borders ≥ 3:1 against canvas.
   Keep the old names (`--joy-color-*`, `--joy-spacing-*`, `--joy-surface-canvas`, `--joy-text-primary`, `--joy-border`) as aliases of the new semantic tokens so consumers do not break; mark them deprecated in `index.d.ts` comments.
3. **`build.js` global sections**: rewrite `:root` generation from the semantic model; fix the Tailwind `@theme` export to map by token category (`--color-*`, `--spacing-*`, `--radius-*`, `--font-*`, `--shadow-*`, `--ease-*`, `--animate-*`); global `:focus-visible` uses `--joy-focus-ring`; add a global `@media (prefers-reduced-motion: reduce)` block that collapses `.joy-*` transitions and animations to 0.01ms and disables the kinetic canvas class; remove `[data-palette="joymify"]` forcing a dark canvas (palettes must only re-point semantic tokens).
4. **Mechanical sweep of the component CSS string in `build.js`**: replace every hex, `rgb()`/`rgba()` literal and every `var(--x, <literal>)` fallback with the semantic token; delete `[data-theme="dark"] .joy-*` overrides that only re-color (the remap now does it), keep any that change structure; remove banned patterns from theme CSS (gradient text class `.joy-hero__title-gradient` becomes solid `--joy-text-primary`, side-stripe `border-left` accents ≥ 2px become full borders or tinted backgrounds, decorative `backdrop-filter` removed, tracked-uppercase eyebrow classes lose `text-transform`/`letter-spacing`). Visual behavior beyond color is out of scope here (Waves 2–5).
5. **Gates**: `packages/tokens/test/contrast.test.js` computes WCAG ratios for every semantic text/surface, accent-text/surface, status-fg/status-bg and interactive border/surface pair in light and dark and asserts AA (4.5:1 text, 3:1 UI); `scripts/lint-colors.sh` fails on any hex/rgb literal or `var(--joy-*, <literal>)` in `packages/svelte/src`, `packages/react/src`, `apps/storybook-hub/build.js` (allowlist: `packages/tokens/src/tokens.json`, `chart-core.ts` canvas fill strings only if they read from CSS variables); `scripts/epic-check.sh` runs lint-colors, `pnpm -r test`, `node apps/storybook-hub/build.js` and the Playwright contracts; `scripts/precheck.sh` calls `scripts/lint-colors.sh`. For this wave, the lint may run in warn mode for `.svelte`/`.tsx` files (Waves 2–5 clean them) but must be strict for `build.js`.
6. Rebuild `packages/tokens/dist/*` and commit it (dist is tracked).

## Out of scope

Component behavior, states, mobile layout, parity, hub markup, docs (Waves 2–6).

## Acceptance

- `pnpm --filter @joy-design/tokens test` passes including the new contrast test; `research/contrast-table-after.md` is generated by the test and shows every pair passing.
- `bash scripts/lint-colors.sh --strict packages/tokens/build.js` exits 0; `grep -c "#7c3aed" packages/tokens/build.js` is 0; `grep -c 'data-theme="dark"\] \.joy' packages/tokens/build.js` ≤ 15.
- `dist/tailwind-theme.css` contains `--spacing-joy-4`, `--radius-joy-card`, `--font-joy-sans`, and no `--color-joy-spacing-*`.
- `node apps/storybook-hub/build.js` succeeds and the existing Playwright contracts pass in both themes.
- Screenshot evidence (light + dark, 375px + 1280px) of the hub "General & Primitives" section attached to the plan showing no purple, no invisible borders, no black shadows on dark.
