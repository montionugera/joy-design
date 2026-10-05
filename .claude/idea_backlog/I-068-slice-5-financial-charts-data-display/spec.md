---
title: "Slice 5: Financial Charts & Data Display"
id: I-068
status: idea
---

# Slice 5: Financial Charts & Data Display

## Acceptance criteria

- [ ] `JoyTable` implemented with column sorting, striped rows, selection checkboxes, and mobile adaptive card fallback on viewports <= 480px.
- [ ] `JoyMetricTile` and `JoyStatCard` implemented with trend indicators (`up`, `down`, `neutral`), delta percentage pill, and semantic bull/bear colors (`tokens.status.success` / `tokens.status.danger`).
- [ ] `JoyCandlestickChart` implemented using Flutter `CustomPainter` with OHLC data bars, bull/bear colors, hover tooltip crosshair, and accessible summary semantics.
- [ ] `JoyLineChart` implemented with area fill, line series, hover crosshair point, and accessible summary table.
- [ ] `JoyBarChart` implemented with categorical bars, token accents, and hover tooltips.
- [ ] Declarative Contract Schemas v2 created for Table, MetricTile, CandlestickChart, LineChart, BarChart and executed natively via Flutter `testWidgets`.
- [ ] Triplet parity checker (`scripts/parity-check.mjs --triplet`) verifies exports and prop compatibility for all Slice 5 components.
- [ ] `apps/flutter-hub` updated with interactive financial chart & data display showcase sections.
- [ ] Gate 1 (`scripts/precheck.sh`) passes with exit code 0.
