# Flutter Component Parity, Quality Gate & Sharable E2E Architecture Implementation Plan (Hardened)

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the complete Flutter ecosystem for Joymify Design System (`joy-design`), providing 100% component triplet parity across React 19, Svelte 5, and Flutter 3.32+, automated data-driven token compilation to Dart, strict multi-framework quality gates (Zero Emoji, Color Lint, Parity Checker, WCAG AA Contrast), and a unified cross-platform E2E test suite shared between Web and Flutter Web.

**Architecture:** A dedicated monorepo package `packages/flutter` consumes generated Dart tokens (`joy_tokens.g.dart`) compiled from `tokens.json`. Components implement neutral API manifests, 44px coarse hit targets, and pure style resolvers. Quality gates (Gate 1 and Gate 2) verify static integrity, color conformance, and triplet parity. Testing follows the "One Contract, Three Runners" model: a declarative JSON contract executed natively in Flutter widget tests (Gate 1 primary), in Playwright on Storybook Web (Gate 1), and in Playwright on Flutter Web (Gate 2 smoke).

**Tech Stack:** Flutter 3.32+ / Dart 3.8.1, Node.js / pnpm, Playwright, bash scripts, `ps-release-workflow` (`psrw`).

**Spec:** `docs/superpowers/specs/2026-10-05-flutter-parity-ecosystem-design.md`  
**Thinker Review:** `docs/superpowers/specs/thinker-co-design-flutter-parity.md`

## Global Constraints

- **Single Source of Truth:** All colors, radius, spacing, typography, and motion tokens must derive exclusively from `packages/tokens/src/tokens.json`.
- **Zero Color Literals:** No raw hex (`0xFF...`), RGB, or Flutter stock colors (`Colors.*`) in component source code; only semantic tokens from `ThemeExtension<JoyThemeTokens>` (`context.joyTheme`).
- **Zero Emoji Policy:** Enterprise components must never contain raw OS emojis (`[green-circle]`, `[red-circle]`, `[hourglass]`, `[moon]`). Vector icons from `@joymify/icons` must be used.
- **Triplet Parity Contract:** Every component listed in `COMPONENTS` must exist in React, Svelte, and Flutter with matching property names, events, and states.
- **Touch Target Floor:** All interactive controls must measure at least 44x44px on coarse pointers / mobile viewports.
- **Quality Gate Integration:** Gate 1 (`scripts/precheck.sh`) and Gate 2 (`scripts/integration.sh`) must pass with exit code 0 before any code merge.

---

## Phase 0: Workspace Settlement & Working Tree Preparation

### Task 0: Settle Uncommitted Working Tree Changes on Main

**Files:**
- Modify: `apps/storybook-hub/build.js`
- Modify: `packages/tokens/build.js`
- Modify: `packages/tokens/dist/theme.css`
- Modify: `packages/react/src/Dropdown.tsx`
- Modify: `packages/react/src/Select.tsx`
- Modify: `packages/svelte/src/lib/Dropdown.svelte`
- Modify: `packages/svelte/src/lib/Select.svelte`

- [ ] **Step 1: Verify current precheck passes on existing modifications**

Run: `bash scripts/precheck.sh`  
Expected: PASS "==> Gate 1 Precheck passed successfully! <=="

- [ ] **Step 2: Commit current working tree improvements to main**

```bash
git add apps/storybook-hub/ packages/react/ packages/svelte/ packages/tokens/ docs/superpowers/
git commit -m "chore(hub): settle pending date-range, select/dropdown styling and specs on main"
```

---

## Phase 1: Slice 0 — The Walking Skeleton (`JoyButton` End-to-End)

### Task 1: Flutter Package Scaffolding (`packages/flutter`)

**Files:**
- Create: `packages/flutter/pubspec.yaml`
- Create: `packages/flutter/analysis_options.yaml`
- Create: `packages/flutter/lib/joymify_flutter.dart`
- Modify: `package.json`

**Interfaces:**
- Consumes: Flutter SDK 3.32+, Dart 3.8.1
- Produces: `joymify_flutter` package skeleton

- [ ] **Step 1: Write the failing test**

```bash
test -f packages/flutter/pubspec.yaml
```

- [ ] **Step 2: Run test to verify it fails**

Run: `test -f packages/flutter/pubspec.yaml`  
Expected: Exit 1

- [ ] **Step 3: Write minimal implementation**

Create `packages/flutter/pubspec.yaml`:
```yaml
name: joymify_flutter
description: Joymify Design System for Flutter — complete token and component parity.
version: 0.1.0
publish_to: none

environment:
  sdk: '>=3.8.0 <4.0.0'
  flutter: '>=3.32.0'

dependencies:
  flutter:
    sdk: flutter
  flutter_svg: ^2.0.10+1

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0
```

Create `packages/flutter/analysis_options.yaml`:
```yaml
include: package:flutter_lints/flutter.yaml

analyzer:
  language:
    strict-casts: true
    strict-inference: true
    strict-raw-types: true
  errors:
    missing_required_param: error
    missing_return: error

linter:
  rules:
    - prefer_const_constructors
    - prefer_const_declarations
    - avoid_print
    - unawaited_futures
    - unnecessary_library_name
```

Create `packages/flutter/lib/joymify_flutter.dart`:
```dart
// Barrel export for Joymify Design System
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/flutter && flutter pub get && flutter analyze`  
Expected: "No issues found!"

- [ ] **Step 5: Commit**

```bash
git add packages/flutter package.json
git commit -m "feat(flutter): scaffold joymify_flutter package with Dart 3.8 pin"
```

- [ ] **Step 6: Phase gate**

Verify: `cd packages/flutter && flutter analyze` exits 0.

---

### Task 2: Data-Driven Token Compiler & Round-Trip Gate (`joy_tokens.g.dart`)

**Files:**
- Create: `packages/tokens/scripts/gen-dart-tokens.mjs`
- Modify: `packages/tokens/build.js`
- Create: `packages/flutter/lib/src/tokens/joy_tokens.g.dart`
- Create: `packages/flutter/test/tokens_test.dart`

**Interfaces:**
- Consumes: `packages/tokens/src/tokens.json`
- Produces: `joy_tokens.g.dart` with all primitives, 6 palette presets, outdoor mode, ordinal spacing, and reserved word mapping (`default` -> `base`)

- [ ] **Step 1: Write the failing test**

Create `packages/flutter/test/tokens_test.dart`:
```dart
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:joymify_flutter/joymify_flutter.dart';

void main() {
  test('Dart tokens compile and match resolved tokens.json values', () {
    final light = JoyThemeTokens.light;
    final dark = JoyThemeTokens.dark;

    expect(light.surface.canvas, isNotNull);
    expect(dark.surface.canvas, isNotNull);
    expect(light.surface.canvas, isNot(equals(dark.surface.canvas)));

    expect(JoySpacing.s4, equals(4.0));
    expect(JoySpacing.s8, equals(8.0));
    expect(JoySpacing.s16, equals(16.0));
    expect(JoyRadius.md, equals(8.0));
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/flutter && flutter test test/tokens_test.dart`  
Expected: Compilation failure (tokens not generated yet)

- [ ] **Step 3: Write minimal implementation**

Write `packages/tokens/scripts/gen-dart-tokens.mjs` to parse `tokens.json`:
- Convert kebab-case to camelCase.
- Map reserved keywords (`default` -> `base`).
- Extract primitives (including 3-level status colors).
- Extract ordinal spacing (`space.1` -> `s4`, `space.2` -> `s8`).
- Build `JoyThemeTokens` supporting all 6 palette presets and outdoor mode.
- Export `ThemeExtension<JoyThemeTokens>` with full `lerp` support and `JoyTheme.data()` returning complete `ThemeData`.
- Implement `--check` mode to verify generated tokens are not stale.

Export tokens from `packages/flutter/lib/joymify_flutter.dart`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node packages/tokens/scripts/gen-dart-tokens.mjs && cd packages/flutter && flutter test test/tokens_test.dart`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/tokens/ packages/flutter/
git commit -m "feat(tokens): implement data-driven Dart token compiler and staleness check"
```

- [ ] **Step 6: Phase gate**

Run: `node packages/tokens/scripts/gen-dart-tokens.mjs --check && cd packages/flutter && flutter analyze`.

---

### Task 3: Quality Gate 1 Enhancements (Zero Emoji & Dart Color Linter)

**Files:**
- Modify: `scripts/precheck.sh`
- Modify: `scripts/lint-colors.sh`
- Modify: `scripts/test-lint-colors.sh`

**Interfaces:**
- Consumes: Source files across `packages/flutter/lib`
- Produces: Strict enforcement of zero emoji and zero hardcoded colors in Dart

- [ ] **Step 1: Write failing test in `scripts/test-lint-colors.sh`**

Add fixture for Dart: verify that `Color(0xFF000000)` and `Colors.blue` in a component file fail the color linter.

- [ ] **Step 2: Run test to verify it fails**

Run: `bash scripts/test-lint-colors.sh`  
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

Update `scripts/lint-colors.sh`:
- Add `packages/flutter/lib` to target directories.
- Add regex matching: `Color\(0x[0-9a-fA-F]+\)|Colors\.[a-zA-Z]+|CupertinoColors\.[a-zA-Z]+|\.withOpacity\(|\.withAlpha\(|\.withValues\(`.
- Exclude `joy_tokens.g.dart` from the color literal ban.

Update `scripts/precheck.sh`:
- Ensure the zero emoji Python walker excludes `.dart_tool/` and `build/`.
- Add `(cd packages/flutter && flutter analyze --fatal-infos && flutter test)` to Gate 1.

- [ ] **Step 4: Run test to verify it passes**

Run: `bash scripts/test-lint-colors.sh && bash scripts/precheck.sh`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/precheck.sh scripts/lint-colors.sh scripts/test-lint-colors.sh
git commit -m "chore(gate): enforce zero emoji, color linting, and analysis on Flutter code"
```

- [ ] **Step 6: Phase gate**

Verify Gate 1 self-tests pass: `bash scripts/test-lint-colors.sh && bash scripts/test-epic-check.sh`.

---

### Task 4: Component API Manifest & Triplet Parity Checker

**Files:**
- Create: `manifests/button.json`
- Modify: `scripts/parity-check.mjs`
- Test: `scripts/test/parity-check.test.mjs`

**Interfaces:**
- Consumes: `manifests/*.json`
- Produces: Declarative API parity verification across React, Svelte, and Flutter

- [ ] **Step 1: Write the failing test**

Create `manifests/button.json`:
```json
{
  "component": "Button",
  "targets": { "react": "required", "svelte": "required", "flutter": "required" },
  "props": {
    "variant": { "enum": ["solid", "outline", "ghost", "danger", "link"] },
    "size": { "enum": ["sm", "md", "lg"] },
    "loading": { "type": "boolean" },
    "disabled": { "type": "boolean" }
  },
  "events": { "activate": { "react": "onClick", "svelte": "onclick", "flutter": "onPressed" } },
  "content": { "react": "children", "svelte": "children", "flutter": "child" }
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node scripts/parity-check.mjs`  
Expected: FAIL (Flutter `JoyButton` does not exist yet)

- [ ] **Step 3: Update `scripts/parity-check.mjs`**

Implement manifest-driven parity checking that reads `manifests/*.json` and checks exports in all three packages.

- [ ] **Step 4: Commit**

```bash
git add manifests/ scripts/parity-check.mjs
git commit -m "feat(parity): implement manifest-driven triplet parity checking"
```

---

### Task 5: `JoyButton` Implementation & Pure Style Resolver

**Files:**
- Create: `packages/flutter/lib/src/components/general/joy_button.dart`
- Create: `packages/flutter/lib/src/components/general/joy_button_style.dart`
- Modify: `packages/flutter/lib/joymify_flutter.dart`
- Create: `packages/flutter/test/components/joy_button_test.dart`

**Interfaces:**
- Consumes: `joy_tokens.g.dart`
- Produces: `JoyButton` widget with full state matrix and pure style resolution

- [ ] **Step 1: Write the failing test**

Create `packages/flutter/test/components/joy_button_test.dart`:
```dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:joymify_flutter/joymify_flutter.dart';

void main() {
  testWidgets('JoyButton enforces 44px hit bounds and handles states', (tester) async {
    int taps = 0;
    await tester.pumpWidget(
      MaterialApp(
        theme: ThemeData(extensions: [JoyThemeTokens.light]),
        home: Scaffold(
          body: JoyButton(
            variant: JoyButtonVariant.solid,
            size: JoyButtonSize.md,
            onPressed: () => taps++,
            child: const Text('Submit'),
          ),
        ),
      ),
    );

    final finder = find.byType(JoyButton);
    expect(finder, findsOneWidget);
    final size = tester.getSize(finder);
    expect(size.height, greaterThanOrEqualTo(44.0));
    expect(size.width, greaterThanOrEqualTo(44.0));

    await tester.tap(finder);
    expect(taps, equals(1));
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/flutter && flutter test test/components/joy_button_test.dart`  
Expected: FAIL (`JoyButton` not defined)

- [ ] **Step 3: Write minimal implementation**

Implement `JoyButtonStyle.resolve(tokens, variant, size, state)` as a pure function returning colors, padding, and borders.  
Implement `JoyButton` using `ConstrainedBox(minHeight: 44, minWidth: 44)` and `Semantics(button: true)`. Export from `joymify_flutter.dart`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/flutter && flutter test test/components/joy_button_test.dart && node scripts/parity-check.mjs`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/flutter/
git commit -m "feat(flutter): implement JoyButton with pure style resolver and 44px hit bounds"
```

- [ ] **Step 6: Phase gate**

Verify Gate 1: `bash scripts/precheck.sh`.

---

### Task 6: Contract Schema v2 & Native Flutter Contract Test Runner

**Files:**
- Create: `tests/contracts/button.contract.json`
- Create: `packages/flutter/test/contracts/contract_runner.dart`
- Create: `packages/flutter/test/contracts/button_contract_test.dart`

**Interfaces:**
- Consumes: `tests/contracts/button.contract.json`
- Produces: Native Flutter execution of shared test contracts

- [ ] **Step 1: Write the declarative behavioral contract** in `tests/contracts/button.contract.json` (Schema v2).
- [ ] **Step 2: Implement Dart contract runner** loading the JSON and executing `testWidgets` verifying activation, disabled state, and loading state.
- [ ] **Step 3: Run test to verify it passes:** `cd packages/flutter && flutter test test/contracts/button_contract_test.dart`.
- [ ] **Step 4: Commit:** `git commit -m "test(contracts): implement native Flutter contract runner for Button"`
- [ ] **Step 5: Phase gate:** `bash scripts/precheck.sh`.

---

### Task 7: Minimal Flutter Web Showcase & `JoyHubBridge` (`apps/flutter-hub`)

**Files:**
- Create: `apps/flutter-hub/pubspec.yaml`
- Create: `apps/flutter-hub/lib/main.dart`
- Create: `apps/flutter-hub/lib/bridge.dart`
- Create: `apps/flutter-hub/web/index.html`

**Interfaces:**
- Consumes: `joymify_flutter`
- Produces: `window.__joyHub` exposing readiness, theme setting, and callback event counts for Playwright

- [ ] **Step 1: Write minimal implementation** of `apps/flutter-hub` rendering `JoyButton` story and mounting `JoyHubBridge`.
- [ ] **Step 2: Build for Web:** `cd apps/flutter-hub && flutter build web --wasm`.
- [ ] **Step 3: Commit:** `git commit -m "feat(hub): build minimal Flutter Web showcase with JoyHubBridge"`
- [ ] **Step 4: Phase gate:** `bash scripts/precheck.sh`.

---

### Task 8: Cross-Platform Playwright Smoke Runner

**Files:**
- Create: `apps/storybook-hub/tests/cross-platform-smoke.spec.ts`

- [ ] **Step 1: Write Playwright test** hitting both Web Hub (`http://localhost:6116/#button`) and Flutter Web Hub (`http://localhost:6118/#/button`), awaiting `window.__joyHub.ready`, and verifying button activation and theme setting.
- [ ] **Step 2: Run test to verify it passes:** `pnpm --filter storybook-hub exec playwright test tests/cross-platform-smoke.spec.ts`.
- [ ] **Step 3: Commit:** `git commit -m "test(e2e): implement cross-platform Playwright smoke runner"`
- [ ] **Step 4: Phase gate:** `bash scripts/precheck.sh`.

---

### Task 9: Slice 0 Gate Verification & Walking Skeleton Milestone

**Files:**
- Modify: `README.md`
- Verify: `docs/superpowers/specs/2026-10-05-flutter-parity-architecture.drawio`

- [ ] **Step 1: Validate Architecture Diagram Score:** `python3 ~/.gemini/config/skills/drawio-skill/scripts/validate.py docs/superpowers/specs/2026-10-05-flutter-parity-architecture.drawio --score` (Score 0)
- [ ] **Step 2: Run Full Gate 1 Precheck:** `bash scripts/precheck.sh` -> PASS
- [ ] **Step 3: Run Full Gate 2 Integration:** `bash scripts/integration.sh` -> PASS
- [ ] **Step 4: Update README.md and commit Slice 0 milestone.**

---

## Subsequent Slices (Post-Skeleton Roadmap)

- **Slice 1: Foundation Widgets** (`JoyIcon` with precompiled vector graphics, `JoyText`, `JoyScope` overlay host, layout primitives `JoySpace`, `JoyFlex`, `JoyDivider`).
- **Slice 2: Simple Form Controls** (`JoyCheckbox`, `JoySwitch`, `JoyRadioGroup`, `JoySegmented`, `JoyRate`, `JoySlider`).
- **Slice 3: Text Inputs & Validation** (`JoyInput`, `JoyInputNumber`, `JoyForm`, `JoyFormItem`).
- **Slice 4: Pickers** (`JoySelect` with bottom sheet, `JoyDatePicker`, `JoyTimePicker`, `JoyDateRangePicker`).
- **Slice 5: Overlays** (`JoyModal`, `JoyDrawer`, `JoyPopconfirm`, `JoyTooltip`, `JoyDropdown`).
- **Slice 6: Feedback** (`JoyAlert`, `JoyMessage`, `JoyToast`, `JoyNotification`, `JoyProgress`, `JoyResult`, `JoySkeleton`, `JoySpin`).
- **Slice 7: Navigation** (`JoyBreadcrumb`, `JoyMenu`, `JoyPagination`, `JoySteps`, `JoyTabs`).
- **Slice 8: Data Display** (`JoyAvatar`, `JoyAvatarGroup`, `JoyBadge`, `JoyTag`, `JoyEmptyState`, `JoyTimeline`, `JoyImage`, `JoyStatistic`, `JoyStatCard`, `JoyMetricTile`).
- **Slice 9: High-Density Table** (`JoyTable` with virtualized columns and mobile card fallback).
- **Slice 10: Trading Charts** (`JoyBarChart`, `JoyLineChart`, `JoyCandlestickChart`, `JoyTrendLine`).
- **Slice 11: Domain & Sports** (`JoyVoiceCard`, `JoyCourtRadar`, `JoyMatchScoreboard`, `JoyPerformanceFigure`, `JoyDenseRow`, `JoyMonoChip`).
- **Slice 12: Brand Identity** (`JoyBrandMark`, `JoyWordmark`, `JoyRibbon`, `JoyBrandBanner`, `JoyEmblem`).
- **Slice 13: Hardening & Consumer Pilot** (Cross-engine geometry check, text scaling 2.0 sweep, pilot integration in `joy-coach-app`).
