# [F-031] Storybook Hub UX Overhaul: Hash Routing, Mobile Drawer, 3D Kinetic Canvas & Design System Categorization

> **Autonomous Execution Standard**: Zero mid-turn interruptions. Evidence before assertions. Zero OS emojis. Full chain to production.

**Goal**: Transform Storybook Hub from a wave-centric internal dev showcase into an elegant, high-performance, mobile-first design portal resolving all 6 user-reported issues:
1. **Hash Routing & Persistence**: Retain active view across page refreshes and browser history via `window.location.hash` (`switchView` updates URL; `hashchange`/`DOMContentLoaded` restores view).
2. **Interactive 3D / Kinetic Particle Canvas**: Add a 60fps mouse-tracking 3D particle constellation hero on Landing Suite with gravitational pull, kinetic velocities, and depth perspective.
3. **Responsive Mobile Drawer**: Under 900px, collapse sidebar into an off-canvas drawer with topbar hamburger button, backdrop overlay, and close gesture.
4. **Zero Text Spill & Robust Layout**: Add `flex-wrap: wrap; gap: 10px; min-width: 0` to all `.playground-header` and `.component-header` elements with word-break rules to prevent badge overlaps.
5. **Card & Spacing Polish**: Define explicit CSS for `.component-card`, `.component-header`, `.component-title`, `.component-desc`, `.component-canvas` across light/dark themes; fix form grid collapses.
6. **Design System Categorization**: Replace internal `Wave X` release headers with standard design system categories: Getting Started, General & Primitives, Navigation & Workflow, Data Entry & Forms, Data Display & Feedback, Enterprise & Telemetry.

---

## Phase 1: CSS Engine Expansion in `apps/storybook-hub/build.js`
- [x] Add mobile drawer styles (`@media (max-width: 900px)`) for `.sidebar`, `.sidebar.open`, `.sidebar-backdrop`, `.mobile-menu-btn`.
- [x] Add explicit CSS for `.component-card`, `.component-header`, `.component-title`, `.component-desc`, `.component-canvas` for light and dark themes.
- [x] Fix `.playground-header` flex-wrap, text min-width, and overflow rules.
- [x] Fix responsive grids (`grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr))`).

## Phase 2: Structural Markup & Categorization
- [x] Reorganize sidebar navigation from release waves (`Wave 1` ... `Wave 8`) into 6 semantic design-system categories.
- [x] Add hamburger toggle button and mobile close button.
- [x] Add `.sidebar-backdrop`.
- [x] Integrate 3D Interactive Kinetic Particle Canvas in `#view-landing-blocks` hero section.

## Phase 3: Hash Routing & Particle Canvas Runtime
- [x] Update `switchView(viewName, updateHash)` to manage `window.location.hash`.
- [x] Add `initRouting()` and `hashchange` listener to restore active panel on load and back/forward navigation.
- [x] Implement pure HTML5 60fps 3D particle constellation engine with mouse interaction, spring physics, dynamic connections, and dark/light adaptability.
- [x] Preserve theme toggle in `localStorage`.

## Phase 4: Build & Integration Verification
- [x] Compile storybook hub: `node apps/storybook-hub/build.js`.
- [x] Run full test suite: `./scripts/integration.sh`.
- [x] Verify zero emoji rule and no syntax errors.

## Phase 5: Ship, Promote & Production Verification
- [ ] Git commit and `psrw ship`.
- [ ] `psrw promote --babysit`.
- [ ] Verify live deployment on `https://design.joymify.com`.
