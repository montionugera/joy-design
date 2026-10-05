# Slice 5: Financial Charts & Data Display Implementation Plan

## Goal
Establish full triplet parity for financial tables, metrics, and high-performance trading charts across React, Svelte, and Flutter: `JoyTable`, `JoyMetricTile`, `JoyStatCard`, `JoyCandlestickChart`, `JoyLineChart`, `JoyBarChart`.

## Global Constraints
- **Single Source of Truth:** All chart and table styles must derive from `JoyThemeTokens` (`context.joyTheme`).
- **Zero Color Literals:** No raw hex (`0xFF...`), RGB, or Flutter stock colors in component code. Bull/bear colors reuse `--joy-status-success-fg` / `--joy-status-danger-fg`.
- **Zero Emoji Policy:** Enterprise components must never contain raw OS emojis; vector SVG icons via `JoyIcon` must be used.
- **Mobile Ergonomics:** `JoyTable` must adapt into responsive stacked cards on mobile viewports <= 480px.
- **Accessibility:** Charts must include accessible image semantics and offscreen tabular data summaries.
- **Quality Gate Integration:** Gate 1 (`scripts/precheck.sh`) must pass with exit code 0.

---

### Task 1: High-Density Table & Financial Metrics — `JoyTable`, `JoyMetricTile`, `JoyStatCard`
- Create `packages/flutter/lib/src/components/data_display/joy_table.dart` (sorting, selection, striped rows, adaptive mobile card fallback <= 480px).
- Create `packages/flutter/lib/src/components/data_display/joy_metric_tile.dart` (metric value, title, prefix/suffix, trend bull/bear pills).
- Export from `packages/flutter/lib/joymify_flutter.dart`.
- Unit tests in `packages/flutter/test/components/`.
- Commit: `feat(flutter): implement JoyTable adaptive table and JoyMetricTile financial cards`.

### Task 2: Trading & Timeseries Charts — `JoyCandlestickChart`, `JoyLineChart`, `JoyBarChart`
- Create `packages/flutter/lib/src/components/charts/chart_common.dart` (palette mapper, canvas helper).
- Create `packages/flutter/lib/src/components/charts/joy_candlestick_chart.dart` (OHLC bars, bull/bear colors, hover crosshair).
- Create `packages/flutter/lib/src/components/charts/joy_line_chart.dart` (timeseries line, gradient area fill, crosshair point).
- Create `packages/flutter/lib/src/components/charts/joy_bar_chart.dart` (categorical bars, token fills).
- Export from `packages/flutter/lib/joymify_flutter.dart`.
- Unit tests in `packages/flutter/test/components/`.
- Commit: `feat(flutter): implement JoyCandlestickChart, JoyLineChart, and JoyBarChart financial canvas engine`.

### Task 3: Manifests & Declarative Contracts v2
- Create manifests in `manifests/`: `table.json`, `metric-tile.json`, `candlestick-chart.json`, `line-chart.json`, `bar-chart.json`.
- Create contract schemas in `packages/contracts/schemas/`.
- Native Dart contract runners in `packages/flutter/test/contracts/`.
- Verify `node scripts/parity-check.mjs --triplet` passes.
- Commit: `test(contracts): add declarative contracts and parity manifests for Slice 5`.

### Task 4: Flutter Hub Showcase & Gate 1 Verification
- Update `apps/flutter-hub/lib/main.dart` with financial charts and table showcase.
- Recompile web showcase: `cd apps/flutter-hub && flutter build web`.
- Run Gate 1: `bash scripts/precheck.sh`.
- Commit: `feat(hub): add Slice 5 charts and data display showcase to flutter-hub and verify Gate 1`.
