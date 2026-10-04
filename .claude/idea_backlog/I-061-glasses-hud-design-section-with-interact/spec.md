---
title: "Glasses HUD design section with interactive state machine and UI guidelines"
id: I-061
status: idea
---

# Glasses HUD design section with interactive state machine and UI guidelines

## Problem

Smart glasses optical see-through (OST) head-up displays (HUD) present unique spatial, optical, and interaction challenges:
1. Conventional 2D mobile UI paradigms fail in optical waveguides where true black is 100% transparent and pixels add light directly onto the physical environment.
2. Voice conversation transcripts and actionable assistant widgets currently lack a cohesive spatial layout, causing visual occlusion or cognitive overload while moving.
3. Temple touchpad gesture flows (single tap, double tap, swipe) and audio-visual state transitions (listening, watching, AI talking, recording, interrupt) lack an interactive simulator, concrete component specifications, and standardized design guidelines within the Joymify Design System.

## Why now

Joymify is engineering smart glasses HUD software requiring a dual-panel information architecture (Left: Conversation Transcript & Audio State; Right: Hierarchical Assist & Control Center) paired with real-time temple touchpad gesture mechanics. Establishing the design section and UI guideline now ensures strict semantic token adherence, zero OS emoji violations, and optical waveguide usability before production hardware integration.

## Sketch

1. **Interactive HUD Simulator in Storybook Hub (`#view-glasses-hud`)**:
   - Realistic optical waveguide visor viewport with optional real-world ambient backgrounds (City Street, Office, Minimal).
   - Dual-panel split layout:
     - Left Panel: Communication mode & state pill (`Voice / Watch`, `Listening / Talking`), real-time streaming dialogue script between User and Claudia.
     - Right Panel: Hierarchical Assist Views with gesture indicator:
       - View 1: Control Center (`> Conversation Control`, `Daily Todos 1/5`, `Notifications`).
       - View 2: Today Todos Checklist (`> [ ] Walk 3 Km`, `[✓] Prepare Meeting note`, `[ ] Meeting with John`).
       - View 3: Todo Detail Action Tray (`Walk 3 Km`: `> [ Mark done ]`, `[ Mark not done ]`, `[ Delete ]`).
       - View 4: Communication State & Gesture Control Guide (`Tap to interrupt`, `Swipe to cycle listen/pause/watch`).
   - Interactive temple touchpad simulator driving the state machine (`Tap`, `Double Tap`, `Swipe`, `Hold`).
2. **Comprehensive UI Guideline & Specification**:
   - Full optical waveguide design manual covering additive RGB optics, glanceable eye-box typography, state machine formal transitions, and accessibility.

## Acceptance criteria

- [ ] Add `#view-glasses-hud` to `navigation.manifest.json` and Storybook Hub navigation.
- [ ] Build interactive glasses HUD simulator in `apps/storybook-hub/build.js` with dual-panel layout matching the user's sketch.
- [ ] Implement live communication state machine supporting `listening`, `watching`, `AI talking`, and `recording` with tap-to-interrupt and gesture navigation.
- [ ] Implement right-panel views: Control Center, Today Todos checklist, Item Detail action tray, and Communication control guide.
- [ ] Ensure Zero OS Emoji Policy: use vector SVGs from `@joymify/icons` exclusively.
- [ ] Zero color literals: 100% semantic token compliance (`scripts/lint-colors.sh` exits 0).
- [ ] Write comprehensive design spec `docs/superpowers/specs/glasses-hud-design.md`, render styled HTML with `render-spec-md.sh`, and verify in Chrome.
- [ ] Create Playwright visual verification test `apps/storybook-hub/tests/glasses-hud.spec.ts` capturing light and dark theme screenshots.
- [ ] Pass Gate 1 precheck (`bash scripts/precheck.sh`) with 100% success.
