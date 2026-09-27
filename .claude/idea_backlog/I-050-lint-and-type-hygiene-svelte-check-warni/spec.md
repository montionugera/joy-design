---
title: "Lint and type hygiene: svelte-check warnings, hub inline font sizes, check scripts"
id: I-050
status: idea
---

# Lint and type hygiene: svelte-check warnings, hub inline font sizes, check scripts

## Problem

Three leftovers from E-001:
- `packages/svelte` `pnpm check` (svelte-check, `--threshold error`) reports ~21 warnings, which hide new ones.
- `apps/storybook-hub/build.js` hard-codes ~20 font sizes in px/rem (inline `style=` and CSS rules)
  instead of the `--joy-font-size-*` type-scale tokens, so the hub drifts from the type scale.
- `packages/icons` and `packages/tokens` have no `check` script, so `pnpm check` (turbo) skips them.

## Why now

Cheap follow-ups filed in F-041; clean baseline before more component work.

## Sketch

- Fix each svelte-check warning at its source (a11y, unused, deprecated); no blanket suppression
  comments unless a warning is a verified false positive (document each one).
- Map each hard-coded hub font size to the nearest `--joy-font-size-*` token; leave a value only
  when no token fits and note it in the plan.
- Add a `check` script to icons and tokens (a type check or a validation script that already exists
  there), so `pnpm check` covers them.

## Acceptance criteria

- [ ] `pnpm --filter @joymify/svelte check` reports 0 errors and 0 warnings (or only documented, individually justified exceptions).
- [ ] `apps/storybook-hub/build.js` hub chrome and demo markup contain no px/rem `font-size` literals except ones listed as justified in the plan.
- [ ] `pnpm check` runs a `check` task for `@joymify/icons` and `@joymify/tokens` and exits 0.
- [ ] `scripts/precheck.sh` exits 0 (no visual/contract test regressions).
