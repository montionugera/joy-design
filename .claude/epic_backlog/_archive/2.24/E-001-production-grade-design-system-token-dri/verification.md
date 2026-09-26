---
title: "Production-grade design system: token-driven dark mode, mobile-first components, brand color ramps, hero CTA and full state coverage"
id: E-001
---

# How we will know E-001 works

`scripts/epic-check.sh` implements these assertions against the combined release tree.

## Assertions

1. `pnpm -r test` passes, including a tokens contrast test that computes WCAG ratios for every semantic text/surface and border/surface pair in light and dark and asserts AA.
2. `scripts/lint-colors.sh` finds zero hex literals or rgba() literals in `packages/svelte/src`, `packages/react/src`, `apps/storybook-hub/build.js` (only `packages/tokens/src/tokens.json` may define colors) and zero `var(--joy-*, <hex>)` fallbacks.
3. `node apps/storybook-hub/build.js` succeeds and the Playwright contracts pass, including new contracts: no horizontal overflow at 375px in light and dark; every `.joy-button`, input, checkbox, tab and pagination control measures ≥ 44px tall at 375px; `[data-theme="dark"]` swaps at least the canvas, card, text and border semantic tokens.
4. Zero emoji policy (existing precheck) still passes.
5. Svelte and React component inventories match (same component names; a parity script diffs the exported class names and CSS custom-property usage).
