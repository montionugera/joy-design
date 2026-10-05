---
title: "Slice 0: Foundation & Walking Skeleton"
id: F-058
status: refined
from_idea: I-063
---

# Slice 0: Foundation & Walking Skeleton

## Acceptance criteria

- [ ] `packages/flutter` scaffolded with `pubspec.yaml` pinned to Flutter 3.32+ / Dart 3.8.1 and zero third-party UI framework dependencies.
- [ ] Data-driven token compiler (`packages/tokens/scripts/gen-dart-tokens.mjs`) parses `tokens.json` and emits `joy_tokens.g.dart` with `JoyThemeTokens` implementing `ThemeExtension<JoyThemeTokens>`.
- [ ] Round-trip token tests (`test/tokens_roundtrip_test.dart`) verify that all 6 palette presets, light/dark themes, and scale values match `tokens.json`.
- [ ] `scripts/lint-colors.sh` extended with Dart color checks, verifying zero color literals (`0xFF...`, raw hex, RGB) and zero Flutter stock colors (`Colors.*`) in `packages/flutter/lib/`.
- [ ] `scripts/precheck.sh` includes Dart color linting and zero-emoji verification across `packages/flutter/`.
- [ ] `manifests/button.json` created and `scripts/parity-check.mjs` verifies 3-way parity across Svelte, React, and Flutter Button.
- [ ] `JoyButton` widget implemented with pure style resolver, supporting all 5 variants (`solid`, `outline`, `ghost`, `danger`, `link`), 3 sizes (`sm`, `md`, `lg`), states (`disabled`, `loading`), icon slots (`iconStart`, `iconEnd`), and minimum 44x44px touch target on mobile viewports.
- [ ] Declarative Contract Schema v2 (`packages/contracts/schemas/button.contract.json`) executed natively via `testWidgets` in `packages/flutter/test/contracts/button_contract_test.dart`.
- [ ] `apps/flutter-hub` scaffolded with `JoyHubBridge` (`window.__joyHub`) supporting hash routing (`#button`), theme toggling (`setTheme`), and interactive demos.
- [ ] Cross-platform Playwright smoke suite (`apps/storybook-hub/tests/flutter-smoke.spec.ts`) tests `apps/flutter-hub` button interactions and theme switching.
- [ ] Gate 1 (`scripts/precheck.sh`) passes with exit code 0.
