---
title: "Flutter Component Parity & Mobile Ecosystem"
id: E-002
status: epic
---

# Flutter Component Parity & Mobile Ecosystem

## Why

Joymify Design System (`joy-design`) currently provides full component parity across React 19 (`@joymify/react`) and Svelte 5 (`@joymify/svelte`). However, mobile clients (`joy-coach-fe`, `quant-fe`, etc.) building on Flutter 3.32+ lack a first-class Joymify component library. Developers are forced to hand-craft Flutter styling, causing theme drift, broken contrast, unaligned typography/spacing tokens, and duplicate E2E test efforts.

By establishing a first-class Flutter package (`packages/flutter`), data-driven token compiler (`gen-dart-tokens.mjs`), declarative cross-platform contract testing ("One Contract, Three Runners"), and Gate 1/2 linter integration, Joymify achieves true triplet parity across React, Svelte, and Flutter.

## Outcome

Once every slice has shipped:

- `packages/flutter` provides a comprehensive Flutter package with strict semantic token resolution via `ThemeExtension<JoyThemeTokens>` (`context.joyTheme`) and zero color literals or foreign hex.
- Single source of truth token compilation via `packages/tokens/scripts/gen-dart-tokens.mjs` generates `joy_tokens.g.dart` directly from `tokens.json`.
- Zero Emoji Policy enforced across all Flutter widgets using vector SVG icons from `@joymify/icons`.
- Declarative contract schemas (`packages/contracts/schemas/*.contract.json`) executed natively via Flutter widget tests (`testWidgets`) and Playwright on Storybook Web / Flutter Web smoke runner.
- All 62 Tier 1 enterprise components exist across React, Svelte, and Flutter with matching property names, variants, events, and a 44px mobile touch target floor.
- Gate 1 (`scripts/precheck.sh`) and Gate 2 (`scripts/integration.sh`) rigorously verify Dart color token integrity, triplet parity, and contract compliance.

## Slices

1. Slice 0: Foundation & Walking Skeleton — packages/flutter scaffold, data-driven token compiler, Dart lint-colors, Contract Schema v2 + native runner, JoyButton end-to-end, apps/flutter-hub + Playwright smoke
2. Slice 1: Core Primitives, Layout & Visual Tokens — JoyText, JoyIcon SVG bridge, JoyBox, JoyFlex, JoyGrid, JoyDivider, JoyBadge, JoyTag, JoyAvatar
3. Slice 2: Form & Input Controls — JoyInput, JoyInputNumber, JoyCheckbox, JoyRadioGroup, JoySwitch, JoySlider, JoyRate, JoySegmented
4. Slice 3: Feedback, Overlays & Dialogs — JoyAlert, JoyProgress, JoySpin, JoySkeleton, JoyModal, JoyDrawer, JoyPopconfirm, JoyTooltip, JoyNotification, JoyMessage
5. Slice 4: Navigation, Tabs & Workflow — JoyTabs, JoyPagination, JoyBreadcrumb, JoySteps, JoyTimeline
6. Slice 5: Financial Charts & Data Display — JoyTable, JoyMetricTile, JoyCandlestickChart, JoyLineChart, JoyBarChart
7. Slice 6: Full Parity Verification, Hub Integration & Enterprise Hardening — Triplet parity check, all 62 Tier 1 contracts passing, Gate 1 & 2 integration
