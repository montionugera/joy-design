# Slice 4: Navigation, Tabs & Workflow Implementation Plan

## Goal
Establish full triplet parity for navigation, tabs, and workflow indicators across React, Svelte, and Flutter: `JoyTabs`, `JoyPagination`, `JoyBreadcrumb`, `JoySteps`, `JoyTimeline`.

## Global Constraints
- **Single Source of Truth:** All styles must derive from `JoyThemeTokens` (`context.joyTheme`).
- **Zero Color Literals:** No raw hex (`0xFF...`), RGB, or Flutter stock colors in component code.
- **Zero Emoji Policy:** Enterprise components must never contain raw OS emojis; vector SVG icons via `JoyIcon` must be used.
- **Touch Target Floor:** All interactive controls (tabs, pagination buttons, breadcrumb links, step items) must enforce a 44x44px minimum touch target floor on coarse pointers.
- **Mobile Ergonomics:** `JoyTabs` must scroll horizontally without clipping on narrow viewports; `JoyPagination` must provide a compact mode on mobile viewports <= 480px.
- **Quality Gate Integration:** Gate 1 (`scripts/precheck.sh`) must pass with exit code 0.

---

### Task 1: Tabs & Pagination — `JoyTabs` and `JoyPagination`
- Create `packages/flutter/lib/src/components/navigation/joy_tabs.dart` (tab items, animated indicator, roving focus, scrollable bar, 44px hit bounds).
- Create `packages/flutter/lib/src/components/navigation/joy_pagination.dart` (windowed page numbers, total count, page size selector, next/prev chevrons, compact mobile mode).
- Export from `packages/flutter/lib/joymify_flutter.dart`.
- Unit tests in `packages/flutter/test/components/`.
- Commit: `feat(flutter): implement JoyTabs and JoyPagination navigation components`.

### Task 2: Breadcrumb, Steps & Timeline — `JoyBreadcrumb`, `JoySteps`, `JoyTimeline`
- Create `packages/flutter/lib/src/components/navigation/joy_breadcrumb.dart` (item list, separator, active leaf, link tap).
- Create `packages/flutter/lib/src/components/navigation/joy_steps.dart` (horizontal/vertical, status: wait, process, finish, error, vector icons, connector lines).
- Create `packages/flutter/lib/src/components/navigation/joy_timeline.dart` (event list, custom color dots, dashed/solid connectors).
- Export from `packages/flutter/lib/joymify_flutter.dart`.
- Unit tests in `packages/flutter/test/components/`.
- Commit: `feat(flutter): implement JoyBreadcrumb, JoySteps, and JoyTimeline workflow primitives`.

### Task 3: Manifests & Declarative Contracts v2
- Create manifests in `manifests/`: `tabs.json`, `pagination.json`, `breadcrumb.json`, `steps.json`, `timeline.json`.
- Create contract schemas in `packages/contracts/schemas/`.
- Native Dart contract runners in `packages/flutter/test/contracts/`.
- Verify `node scripts/parity-check.mjs --triplet` passes.
- Commit: `test(contracts): add declarative contracts and parity manifests for Slice 4`.

### Task 4: Flutter Hub Showcase & Gate 1 Verification
- Update `apps/flutter-hub/lib/main.dart` with navigation and workflow showcase sections.
- Recompile web showcase: `cd apps/flutter-hub && flutter build web`.
- Run Gate 1: `bash scripts/precheck.sh`.
- Commit: `feat(hub): add Slice 4 navigation and workflow showcase to flutter-hub and verify Gate 1`.
