# [F-018] High-Performance Financial Charts Engine & Core Ant Design Parity Suite

> **For agentic workers:** Autonomous execution mode. Zero mid-turn interruptions. Evidence before assertions. Zero OS emojis.

**Goal:** Implement the Joymify High-Performance Financial & Large-Dataset Charts Engine (`LineChart`, `BarChart`, `CandlestickChart` with LTTB decimation, zoom, pan, crosshair, and telemetry HUD) alongside Ant Design Layout & General Primitives (`Divider`, `Flex`, `Space`, `Splitter`, `Statistic`, `Tag`, `Segmented`) with full dual-framework parity (Svelte 5 Runes & React 19), interactive Storybook Hub showcases, and Kubernetes deployment.

---

## Phase 1: Tokens & Styling Engine Expansion
- [x] Add Chart & Layout CSS tokens in `packages/tokens/build.js`:
  - Chart container, canvas overlays, and floating precision HUD (`.joy-chart`, `.joy-chart__hud`, `.joy-chart__crosshair`)
  - Layout primitives (`.joy-divider`, `.joy-flex`, `.joy-space`, `.joy-splitter`)
  - Data display primitives (`.joy-typography`, `.joy-statistic`, `.joy-tag`, `.joy-segmented`)
- [x] Compile tokens and verify `packages/tokens/test/tokens.test.js`

## Phase 2: Core Charts Engine & Algorithms
- [x] Implement `JoyChartCore` zero-dependency Canvas engine:
  - High-DPR sub-pixel crisp rendering with half-pixel alignment
  - 100,000+ points LTTB (Largest-Triangle-Three-Buckets) decimation algorithm
  - Monotone cubic hermite spline smoothing
  - Interactive wheel zoom and inertial pan
  - Dual-canvas magnetic crosshair & axis pill overlays
- [x] Implement Svelte 5 Components:
  - `LineChart.svelte`
  - `BarChart.svelte`
  - `CandlestickChart.svelte`
  - `Divider.svelte`, `Flex.svelte`, `Space.svelte`, `Splitter.svelte`
  - `Statistic.svelte`, `Tag.svelte`, `Segmented.svelte`
- [x] Export in `packages/svelte/src/lib/index.ts` and test in `packages/svelte/test/components.test.js`

## Phase 3: React 19 Components Parity
- [x] Implement React 19 Components with `forwardRef` and TypeScript interfaces:
  - `LineChart.tsx`, `BarChart.tsx`, `CandlestickChart.tsx`
  - `Divider.tsx`, `Flex.tsx`, `Space.tsx`, `Splitter.tsx`
  - `Statistic.tsx`, `Tag.tsx`, `Segmented.tsx`
- [x] Export in `packages/react/src/index.ts` and test in `packages/react/test/components.test.js`

## Phase 4: Storybook Hub Interactive Showcase & Zero Emoji Policy
- [x] Add interactive High-Performance Financial Charts tab (`#view-charts`) with live 10,000-point streaming simulator, zoom/pan controls, and candlestick telemetry.
- [x] Add Layout & Primitives tab (`#view-primitives`) showcasing Splitter, Flex, Space, Statistic, Tag, and Segmented.
- [x] Verify zero raw OS emojis across all source code and built HTML.

## Phase 5: Verification, Release & Live Promotion
- [x] Run full test suite: `pnpm -r test`
- [x] Run `./scripts/integration.sh`
- [ ] Ship via `psrw ship`
- [ ] Promote via `psrw promote --babysit`
- [ ] Live verification on `https://design.joymify.com`
