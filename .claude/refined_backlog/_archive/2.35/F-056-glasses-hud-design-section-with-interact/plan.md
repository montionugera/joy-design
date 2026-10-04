# F-056 Implementation Plan: Glasses HUD Design Section & UI Guidelines

## Phase 1: Architectural UI Guideline & Specification
- [ ] Task 1.1: Author comprehensive design guide `docs/superpowers/specs/glasses-hud-design.md` detailing optical see-through (OST) waveguide optics, additive RGB rules, communication state machine, touchpad gestures, and dual-panel layout.
- [ ] Task 1.2: Render spec to styled HTML via `~/.claude/scripts/render-spec-md.sh` and open in Chrome.

## Phase 2: Navigation Manifest & Storybook Hub Section Markup
- [ ] Task 2.1: Add `glasses-hud` view to `apps/storybook-hub/src/navigation.manifest.json`.
- [ ] Task 2.2: Implement `#view-glasses-hud` section markup in `apps/storybook-hub/build.js`:
  - Visor optical waveguide frame with environment toggle (Night Street, Daylight Office, Wireframe).
  - Left Panel: Communication status pill (`Voice / Watch`, `Listening / Talking`) and streaming transcript dialogue.
  - Right Panel: Hierarchical Assist Views (Control Center, Today Todos, Item Detail Action Tray, Communication Control Guide).
  - Temple Touchpad simulator with Tap, Double Tap, Swipe, and Hold controls.

## Phase 3: Client Script Logic & State Machine Interactivity
- [ ] Task 3.1: Implement HUD communication state machine (`listening`, `watching`, `talking`, `recording`) with auto-transitions, tap-to-interrupt, and audio wave animation.
- [ ] Task 3.2: Implement hierarchical navigation controller:
  - View switching: Control Center ↔ Today Todos ↔ Todo Detail Action Tray ↔ Communication Control Guide.
  - Gesture handlers for Tap, Double Tap, Swipe, and Hold.
  - Interactive todo toggling (mark done, mark not done, delete) and real-time counter updates.

## Phase 4: Token Discipline & Quality Gates
- [ ] Task 4.1: Enforce Zero Emoji Policy: use vector SVGs from `@joymify/icons` exclusively.
- [ ] Task 4.2: Enforce pure semantic tokens: ensure `scripts/lint-colors.sh` exits 0.

## Phase 5: Automated Testing & Visual Verification
- [ ] Task 5.1: Create Playwright test `apps/storybook-hub/tests/glasses-hud.spec.ts` testing state transitions, navigation, and gesture mechanics.
- [ ] Task 5.2: Capture visual verification screenshots at 375px and 1280px in light and dark modes.
- [ ] Task 5.3: Run Gate 1 (`bash scripts/precheck.sh`) and confirm 100% pass.

## Phase 6: Documentation & Promotion
- [ ] Task 6.1: Update `README.md` to document the Glasses HUD suite.
- [ ] Task 6.2: Commit changes to `feat/F-056`.
- [ ] Task 6.3: Ship feature to `release/2.35` via `psrw ship`.
- [ ] Task 6.4: Promote release 2.35 to `main` via `psrw promote --babysit`.
