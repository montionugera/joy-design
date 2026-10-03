# Implementation Plan: Production-Grade Aesthetic Palettes (Release 2.30 / F-051)

**Goal:** Elevate the 5 palette presets from prototype status to true production-grade design system quality by replacing the "destructive red button" in Dessau Bauhaus with Architectural Cobalt, refining Clay Court from chalky peach to fired terracotta in dark mode, calibrating Nordic Slate and Verdant Lawn with cultural/material anchors, generating all 24 semantic tokens per preset theme in OKLCH, and verifying 110 contrast pairs (WCAG 2.2 AA) with automated tests and Playwright visual evidence.

---

## Phase 1: Token Ramps & Build Artifacts

- [x] **Task 1.1: Update `packages/tokens/scripts/ramps.mjs`**
  - Replace the 5 preset definitions in `presets` dictionary with the exact 24-token dictionaries from the approved spec (`docs/superpowers/specs/2026-10-03-production-grade-aesthetic-palettes-design.md`):
    - `classic`: Oxford Navy `#14253e`, Ochre Gold `#c49a3a` / `#dab362`, Parchment Cream `#f8f3e8`.
    - `bauhaus-primary`: Architectural Cobalt `#1e40af` / `#2563eb` as `accent-default`, Graphic Charcoal `#101828` / `#080c14`, Crimson `#b91c1c` / `#dc2626` and Cadmium `#d97706` / `#f59e0b` as highlights/emblems.
    - `clay-court`: Roland-Garros Terracotta `#9c4221` / `#d97746`, Court Pine `#264e22`, Court Line `#fbf0ea`.
    - `nordic-slate`: Architectural Granite `#101828` / `#1e293b`, Arctic Fjord Navy `#0369a1` / `#075985`, Silver Mist Paper `#f8fafc`.
    - `verdant-lawn`: British Racing Green `#143d2b` / `#22593d`, Champagne Gold `#c9a227` / `#d6b64a`, Lawn Ivory `#f4f6f0`.
  - Ensure every preset explicitly includes all text, border, and surface keys: `surface-canvas`, `surface-card`, `surface-raised`, `surface-sunken`, `text-primary`, `text-secondary`, `text-muted`, `text-on-accent`, `border-subtle`, `border-default`, `border-strong`, `border-focus`, `accent-default`, `accent-hover`, `accent-active`, `accent-subtle`, `accent-text`, `accent-gradient-end`, `accent-highlight`, `color-brand-primary`, and brand primitives.

- [x] **Task 1.2: Regenerate tokens and build CSS**
  - Run `node packages/tokens/scripts/ramps.mjs` to regenerate `packages/tokens/src/tokens.json`.
  - Run `pnpm --filter @joymify/tokens build` to recompile `packages/tokens/dist/theme.css` and JS/TS exports.
  - Verify that `dist/theme.css` contains all 5 presets under `[data-palette="..."]` for both light and `[data-theme="dark"]`.

---

## Phase 2: Unit Contrast Matrix Verification

- [x] **Task 2.1: Expand `packages/tokens/test/contrast.test.js`**
  - Add comprehensive assertion coverage for all 5 presets across both light and dark themes:
    - `text-on-accent` against `accent-default` (≥ 4.5:1)
    - `text-on-accent` against `accent-hover` (≥ 4.5:1)
    - `text-on-accent` against `accent-active` (≥ 4.5:1)
    - `text-primary` against `surface-canvas` and `surface-card` (≥ 4.5:1)
    - `text-secondary` against `surface-canvas` and `surface-card` (≥ 4.5:1)
    - `text-muted` against `surface-canvas` and `surface-card` (≥ 4.5:1)
    - `border-default` against `surface-canvas` and `surface-card` (≥ 3.0:1)
  - Run `pnpm --filter @joymify/tokens test` and verify all 110 contrast pairs pass.

---

## Phase 3: Hub Showcase & Playwright Live-DOM Visual Verification

- [x] **Task 3.1: Rebuild Storybook Hub**
  - Run `node apps/storybook-hub/build.js` to ensure the hub reflects the rebuilt `theme.css`.

- [x] **Task 3.2: Update and run Playwright tests**
  - Update `apps/storybook-hub/tests/palette-switcher.spec.ts` to assert the new calibrated action colors:
    - Bauhaus action button background: `rgb(30, 64, 175)` (cobalt `#1e40af`) in light mode, `rgb(37, 99, 235)` (`#2563eb`) in dark mode.
    - Clay Court action button background: `rgb(156, 66, 33)` (terracotta `#9c4221`) in light mode, `rgb(217, 119, 70)` (`#d97746`) in dark mode.
  - Execute `pnpm --filter storybook-hub exec playwright test tests/palette-switcher.spec.ts` with `PALETTE_SCREENS=1` to generate fresh desktop and mobile screenshots for all 5 presets.
  - Verify zero visual regressions and zero contrast failures.

---

## Phase 4: Gate 1, Ship & Promote

- [ ] **Task 4.1: Run Gate 1 (`./scripts/precheck.sh`)**
  - Verify lint, typecheck, unit tests, parity checks, and build all exit 0.

- [ ] **Task 4.2: Ship Feature Branch**
  - Run `psrw ship --no-deploy` to merge into `release/2.30`.

- [ ] **Task 4.3: Promote Release 2.30**
  - Run `psrw promote --babysit` to run Gate 2 (`integration.sh`), open PR, verify CI, squash-merge to `main`, and verify production deployment.
