---
title: "Wave 5: Storybook hub — mobile layout, dark mode, hero, token-only colors, visual contracts"
id: I-040
status: idea
epic: E-001
---

# Wave 5: Storybook hub at design.joymify.com (brand register for landing view, product register for the workshop)

Parent: E-001. Depends on Waves 1–4. Evidence: `research/audit-hub.md` (70 issues, 15 P0), `research/audit-standards.md`. Every HUB- issue must be resolved or deferred with a reason.

Files: `apps/storybook-hub/build.js` (generates HTML+CSS+JS), `apps/storybook-hub/src/navigation.manifest.json`, `apps/storybook-hub/tests/contracts.spec.ts`, `apps/storybook-hub/playwright.config.ts`.

## Problem

316 hardcoded hex values (slate + violet); zero media queries below 900px so the topbar overflows 375px by ~190px; dark mode patches inline styles with `div[style*="background: #ffffff"]` selectors; the kinetic canvas uses purple/cyan/fuchsia particles regardless of theme; hero buttons are flat; gradient text, glass, tracked uppercase, trailing arrows; 34px/28px touch targets; no reduced-motion; z-index 2/10/100/998/999; contracts test overflow only on one view.

## Scope (in)

1. **Hub stylesheet on semantic tokens** (import `packages/tokens/dist/theme.css` and use only `--joy-*`); delete all hex, all `div[style*=...]` dark hacks, all inline `style="background: #..."` in generated markup; the hub's own chrome tokens (sidebar, topbar, code blocks) are semantic aliases defined once per theme.
2. **Phone tier**: breakpoints 480/768/900; topbar becomes logo + menu + theme toggle with the framework switcher moving into the drawer; drawer trigger and close ≥ 44px; component cards single column with 16px gutters; playground headers wrap; code blocks scroll horizontally inside their card; tables get the scroll wrapper; no document-level horizontal overflow on any manifest view at 375px.
3. **Dark mode designed**: canvas/card/raised from tokens, code blocks on `--joy-surface-sunken`, borders visible, no black halos; theme toggle persists and honors `prefers-color-scheme` on first load without FOUC (inline script sets `data-theme` before paint).
4. **Kinetic canvas**: particle and link colors read from `--joy-accent-*` and `--joy-text-muted` per theme; stops entirely under `prefers-reduced-motion` and on `pointer: coarse` falls back to a static gradient of the same hue; capped at 60fps with `requestAnimationFrame` only while visible.
5. **Hero and CTA in the landing view** use the Wave 4 Button and HeroSection so the hub showcases the real component; no bespoke hero CSS in the hub.
6. **Slop removal** across hub chrome: no gradient text, glass, tracked uppercase section labels, `→` suffixes, or `01/02/03` markers; typography on `--joy-font-size-*`; z-index on `--joy-z-*`; motion 150–250ms with reduced-motion.
7. **Contracts**: extend `contracts.spec.ts` to iterate every manifest view at 375px and 1280px in light and dark asserting zero horizontal overflow, ≥ 44px hit areas for the drawer trigger/close/tabs, `data-theme` applied before first paint, computed contrast ≥ 4.5:1 for topbar/sidebar text, and no element with `background-clip: text`. Store screenshots per view/theme/viewport under `test-results/` (gitignored) and attach 8 representative ones to the plan.

## Out of scope

Component internals (Waves 2–4), docs (Wave 6).

## Acceptance criteria

- [ ] `lint-colors.sh --strict apps/storybook-hub/build.js` exits 0; `grep -c "style\*=" apps/storybook-hub/build.js` is 0.
- [ ] `node apps/storybook-hub/build.js && playwright test` passes with the extended contracts; `scripts/precheck.sh` exits 0.
- [ ] Screenshots attached: landing, primitives, forms, data display at 375px and 1280px, light and dark.
