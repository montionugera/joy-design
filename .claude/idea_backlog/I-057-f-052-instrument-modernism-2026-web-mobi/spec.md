---
title: "F-052: Instrument Modernism — 2026 Web/Mobile Responsiveness, Joy-Coach Suite, and Interactive Demos"
id: I-057
status: idea
---

# F-052: Instrument Modernism — 2026 Web/Mobile Responsiveness, Joy-Coach Suite, and Interactive Demos

## Problem
Conventional SaaS component libraries rely on generic AI-generation tropes (warm cream monoculture `#F4F1EA`, 3-card equal rounded boxes, blurry 20px grey shadows, decorative glassmorphism, and raw OS emojis). For `joy-coach` and `quant-fe`, these patterns fail:
1. They wash out completely under direct outdoor sunlight (50,000 lux glare courtside).
2. They ignore one-handed mobile ergonomics (75% thumb-driven interactions in the bottom 35% safe zone).
3. They fail to support bi-manual mobile landscape mode (courtside video + telemetry split).
4. Numeric streaming tickers jiggle horizontally due to proportional font glyph widths.

## Why now
`joy-coach` is preparing for live tennis court testing and coach adoption. Coaches require instant 3-second glanceability, outdoor sunlight readability (AAA contrast ≥7.0:1), and high-density tabular precision.

## Sketch
Elevate `joy-design` to an **Instrument-Grade Design System**:
1. **Token Engine**: 1px directional ambient highlight, tactile sunken wells (`--joy-surface-sunken`), tabular-nums typography, and High-Noon Outdoor mode tokens (`[data-mode="outdoor"]` with AAA ≥7:1 contrast).
2. **Joy-Coach Athletic Performance Suite**:
   - `CourtRadar` (Interactive SVG court for clay, grass, hard surfaces with ball placement heatmap).
   - `MatchScoreboard` (Grand Slam tabular score matrix with live game increments).
   - `ChronometerDial` (tactile stopwatch with split lap memory and 56px touch buttons).
   - `TelemetryStrip` (Cardio zone ribbon and serve speed radar).
3. **Ergonomic Containers**:
   - `BentoGrid` & `BentoCard` (CSS Subgrid & Container Queries `@container`).
   - `CommandIsland` (floating thumb dock for mobile, `Cmd+K` quick bar for desktop).
   - `BottomSheet` (native swipe-to-dismiss drawer container).
4. **Interactive Demos in Storybook Hub**:
   - Demo 1: Courtside Live Match Logger (`/demos/courtside-logger`).
   - Demo 2: Athletic Performance & Kinematics Bento (`/demos/coach-dashboard`).
   - Demo 3: Outdoor Sunlight & Glare Simulator (`/demos/outdoor-glare`).

## Acceptance criteria

- [ ] Ambient bevel elevation tokens (`--joy-elevation-bevel-light`, `--joy-elevation-bevel-dark`) and outdoor high-contrast mode tokens (`[data-mode="outdoor"]`) defined in `packages/tokens`.
- [ ] Tabular lining numeral typography (`font-variant-numeric: tabular-nums lining-nums`) enforced for all numeric telemetry and timer readouts.
- [ ] `CourtRadar` component implemented with Svelte 5 and React 19 parity, supporting clay/grass/hard court skins and interactive ball marking.
- [ ] `MatchScoreboard` component implemented with live set/game/point incrementation and zero layout jitter.
- [ ] `ChronometerDial` component implemented with circular progress ring and minimum 56px touch target controls.
- [ ] `BentoGrid` and `BentoCard` implemented with CSS Subgrid and container queries (`@container`).
- [ ] `CommandIsland` floating thumb dock implemented for mobile portrait and landscape viewports.
- [ ] Multi-screen responsive layout support verified across Small (375px/844px), Medium (768px/1024px), and Large (1280px+).
- [ ] Three interactive demo pages implemented in `apps/storybook-hub`: Courtside Match Logger, Coach Dashboard Bento, and Outdoor Glare Simulator.
- [ ] 100% Svelte/React parity verified via `scripts/parity-check.mjs`.
- [ ] Gate 1 (`scripts/precheck.sh`) passes cleanly with zero lint or color token violations.
