# Implementation Plan: F-047 Dark Mode Contrast Elevation & Enterprise Color Calibration

## Objective
Elevate dark mode semantic tokens and component styles in `packages/tokens/src/tokens.json` to eliminate font-blending defects, fix non-compliant status borders, remove muddy accent patches, and restore tactical switch/control luminosity.

## Tasks

### Task 1: Semantic Token Calibration in `tokens.json`
- Update `semantic.light.surface` and `semantic.dark.surface` to add `thumb` (`#ffffff` light, `{color.cream.100}` dark).
- Update `semantic.dark.text`:
  - `muted`: update from `{color.neutral.400}` (`#88867f`) to `{color.navy.200}` (`#a2b2cb`), raising contrast on navy card to >8:1.
  - `disabled`: update from `{color.neutral.400}` (`#88867f`) to `{color.navy.300}` (`#7487a5`).
- Update `semantic.dark.status` borders from step 700 to step 500:
  - `danger-border`: `{color.status.danger.500}` (`#c74b47`, 3.56:1 contrast)
  - `success-border`: `{color.status.success.500}` (`#478d4b`, 4.76:1 contrast)
  - `warning-border`: `{color.status.warning.500}` (`#a96b00`, 4.37:1 contrast)
  - `info-border`: `{color.status.info.500}` (`#437eb9`, 4.25:1 contrast)
- Update `semantic.dark.accent.subtle` from muddy `#2a2211` to `#1e2129` (harmonious warm slate-navy).

### Task 2: Component CSS Updates in `packages/tokens/build.js`
- Update `.joy-switch__thumb::after` to use `background: var(--joy-surface-thumb);` so the knob remains an illuminated, tactile toggle in both light and dark themes.

### Task 3: Token Compilation & Documentation Synchronization
- Run `pnpm --filter @joymify/tokens build` to re-generate `packages/tokens/dist/theme.css` and `dist/index.d.ts`.
- Run `node scripts/gen-design-md.mjs` to synchronize `DESIGN.md` and `README.md`.
- Run `node apps/storybook-hub/build.js` to refresh the hub preview distribution.

### Task 4: Verification & Automated Quality Gate
- Run `pnpm --filter @joymify/tokens test` (including WCAG 2.2 AA contrast gate).
- Run `bash scripts/precheck.sh` (Gate 1).
- Visually inspect newly generated screenshots of the Form Suite in dark mode.
