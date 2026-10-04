# F-055 Implementation Plan: 8 Hero Section Variants & Apple Continuous Narrative Scroll Landing Page

## Phase 1: Centered Luxury Editorial Image Cover & 8 Hero Section Variants
- [x] Task 1.1: Re-architect Editorial Cover in `apps/storybook-hub/scripts/gen-landing-blocks.mjs` and `build.js` with full-bleed image cover backdrop, true vertical/horizontal centering, and luxury typography.
- [x] Task 1.2: Implement 8 distinct Hero Section variants with segmented switcher in `#view-landing-blocks`:
  1. Antigravity Interactive Particles
  2. 3D Volumetric Wave Mesh
  3. Luxury Editorial Image Cover (Centered)
  4. Apple Keynote Hardware Hero
  5. SaaS Cockpit Financial Terminal
  6. Cyberpunk Kinetic HUD
  7. Swiss Typographic Poster
  8. Luminous Fluid Gradient Aura
- [x] Task 1.3: Wire interactive scripts and canvas lifecycle management in `apps/storybook-hub/build.js` for all 8 hero variants.
- [x] Task 1.4: Run `node apps/storybook-hub/scripts/gen-landing-blocks.mjs --write` and verify generator parity.

## Phase 2: Apple-Style Continuous Narrative Scroll Landing Page (`#view-apple-landing`)
- [x] Task 2.1: Add `apple-landing` view to `apps/storybook-hub/src/navigation.manifest.json`.
- [x] Task 2.2: Implement `#view-apple-landing` with sticky product sub-nav and 5 continuous scroll narrative scenes:
  - Scene 1: Monumental Intro & Keynote Silhouette Reveal
  - Scene 2: Interactive Posture & Fold Mechanics (0°–180° scrub slider `< >` and posture mode pills matching Image 3)
  - Scene 3: Ultra-Wide Cinematic Display Immersion with ambient glow (matching Image 4)
  - Scene 4: Bionic Silicon & Thermal Specs Bento
  - Scene 5: Studio Finish Customizer & Configuration Tray
- [x] Task 2.3: Wire interactive slider, posture buttons, finish swatches, and aspect ratio controls.

## Phase 3: Token Discipline, Parity & Quality Gates
- [x] Task 3.1: Enforce Zero Emoji Policy (`python3` regex audit) and Pure Semantic Tokens (`scripts/lint-colors.sh` passed 0 violations).
- [x] Task 3.2: Verify Svelte/React component parity and workspace unit tests (100% passed).

## Phase 4: Automated Testing, Visual Verification & Documentation
- [x] Task 4.1: Create Playwright test suite `apps/storybook-hub/tests/apple-narrative-and-heroes.spec.ts` testing all 8 hero variants and the 5 narrative scroll scenes (passed).
- [x] Task 4.2: Capture visual verification screenshots at 375px and 1280px in light and dark themes (hero variants 1–8, centered editorial, and Apple scenes 1–5 saved and verified).
- [x] Task 4.3: Update `README.md` to document the new Hero suite and Apple narrative landing page.
- [x] Task 4.4: Run Gate 1 (`scripts/precheck.sh`) and confirm 100% pass (Gate 1 Precheck passed successfully!).

## Phase 5: Promotion & Release Lifecycle
- [ ] Task 5.1: Commit all work to `feat/F-055`.
- [ ] Task 5.2: Ship feature to `release/2.34` via `psrw ship`.
- [ ] Task 5.3: Promote release 2.34 to `main` via `psrw promote --babysit`.
