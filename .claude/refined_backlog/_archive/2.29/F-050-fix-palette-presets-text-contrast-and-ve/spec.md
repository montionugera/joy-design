---
title: "fix-palette-presets-text-contrast-and-verification-matrix"
id: F-050
status: refined
from_idea: I-055
---

# fix-palette-presets-text-contrast-and-verification-matrix

## Problem

When users switch between palette presets (`bauhaus-primary`, `clay-court`, `nordic-slate`, `verdant-lawn`), buttons, badges, and controls styled with `--joy-text-on-accent` against `--joy-accent-default` fail WCAG 2.2 AA contrast standards (ratios dropping as low as 1.39:1). Solid buttons render with dark navy/ink text on dark crimson, terracotta, cerulean, and forest green backgrounds, rendering labels completely unreadable.

In addition, the token contrast test suite (`packages/tokens/test/contrast.test.js`) only verified `:root` and default `[data-theme="dark"]`, without verifying the 5 presets in light and dark modes. Storybook Hub tests checked attribute toggling but lacked computed style contrast assertions.

## Why now

User reported "new theme , nothing work, do you have skill for verify ?" with screenshots showing unreadable solid buttons across all 4 newly introduced presets on the live design portal.

## Sketch

1. Explicitly specify `--joy-text-on-accent` across all 5 presets in both light and dark modes in `packages/tokens/scripts/ramps.mjs` and compile to `tokens.json` & `theme.css`.
2. Tune `nordic-slate` light accent to `#0274b3` so `--joy-text-on-accent: #ffffff` hits ≥5.0:1 contrast (WCAG AA compliant).
3. Ensure all palette presets define complete semantic secondary/muted text and border ramps in both light and dark themes.
4. Expand `packages/tokens/test/contrast.test.js` to assert `contrastRatio(text-on-accent, accent-default) >= 4.5:1` across all 5 presets in both light and dark modes.
5. Add Playwright test in `apps/storybook-hub/tests/palette-switcher.spec.ts` to compute button text contrast in live DOM across all 5 palettes and verify pass rate.

## Acceptance criteria

- [ ] Every preset in `tokens.json` defines `text-on-accent` for both light and dark modes with contrast ratio ≥ 4.5:1 against `accent-default`.
- [ ] `packages/tokens/test/contrast.test.js` checks contrast across all 5 presets in both light and dark themes and passes.
- [ ] Storybook Hub includes automated Playwright verification of computed button contrast across all 5 presets in light and dark modes.
- [ ] Solid buttons in `bauhaus-primary`, `clay-court`, `nordic-slate`, and `verdant-lawn` have crisp, readable text meeting WCAG AA.
- [ ] Gate 1 (`./scripts/precheck.sh`) passes with 0 failures and zero emoji.
