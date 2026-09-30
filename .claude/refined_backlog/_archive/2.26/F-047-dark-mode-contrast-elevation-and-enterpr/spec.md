---
title: "Dark mode contrast elevation and enterprise color calibration"
id: F-047
status: refined
from_idea: I-051
---

# Dark mode contrast elevation and enterprise color calibration

## Problem

In dark mode, several semantic tokens and component styles result in low contrast, poor readability, and an unrefined aesthetic:
1. `--joy-text-muted` is mapped to `{color.neutral.400}` (`#88867f`), which blends into dark navy surfaces (`#111b2b` card, `#0d1624` canvas) and causes input placeholders, prefixes, suffixes, and subtitles to appear dingy and unreadable.
2. `--joy-status-danger-border` (`#781b1c`) and `--joy-status-success-border` (`#1a4f1f`) have contrast ratios of only 1.62:1 and 1.45:1 against card surfaces, failing the WCAG 3.0:1 non-text boundary minimum.
3. `--joy-accent-subtle` is hardcoded to `#2a2211`, producing an opaque muddy olive-brown rectangle for active items in dropdowns and navigation.
4. Switches in dark mode have inverted luminosity (slate track with dark sunken navy handle).

## Why now

Visual inspection of the Form Suite and advanced data entry components reveals noticeable contrast defects that degrade enterprise user experience. Fixing these tokens establishes a polished, production-grade dark theme across all forms and data entry components.

## Sketch

1. Calibrate dark mode semantic tokens in `packages/tokens/src/tokens.json`:
   - Elevate `--joy-text-muted` to a high-contrast neutral with clean luminosity (>7:1 on navy).
   - Calibrate `--joy-status-danger-border` and `--joy-status-success-border` to exceed 3.0:1 contrast on dark card surfaces.
   - Refine `--joy-accent-subtle` to a harmonious, luminous tint that eliminates muddy patches.
   - Update switch handle token references so the knob remains an illuminated light surface.
2. Recompile tokens and sync generated artifacts:
   - `pnpm --filter @joymify/tokens build`
   - `node scripts/gen-design-md.mjs`
   - `node apps/storybook-hub/build.js`
3. Verify via `bash scripts/precheck.sh` and Playwright visual screenshots.

## Acceptance criteria

- [ ] Dark mode `--joy-text-muted` achieves crisp readability (>6:1 contrast) on dark canvas and card surfaces without muddy chromatic dissonance.
- [ ] Dark mode `--joy-status-danger-border` and `--joy-status-success-border` achieve at least 3.0:1 contrast against card and canvas surfaces.
- [ ] Dark mode `--joy-accent-subtle` renders harmoniously inside dark cards and overlays without muddy olive/brown discoloration.
- [ ] Dark mode switch handles use an illuminated light knob with tactile contrast in both on and off states.
- [ ] All token changes are strictly declared in `packages/tokens/src/tokens.json`, compiled to `packages/tokens/dist/theme.css`, and synchronized with `DESIGN.md`.
- [ ] Gate 1 (`bash scripts/precheck.sh`) passes with 0 color lint violations, 0 emoji violations, and all contrast/parity tests green.
