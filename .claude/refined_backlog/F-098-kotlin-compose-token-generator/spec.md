---
title: "Kotlin Compose token generator"
id: F-098
status: refined
from_idea: I-109
---

# Kotlin Compose token generator

## Problem

Joy Design compiles `packages/tokens/src/tokens.json` into CSS/JS/TS, Flutter/Dart (`gen-dart-tokens.mjs`), and SwiftUI (`gen-swift-tokens.mjs`), including the `I-108` `modern` theme (Midnight Brass base, First Light 6-stop 172deg sky gradient, Kintsugi seams). Android / Jetpack Compose consumers (such as `joy-companion` glasses and Android surfaces) lack a generated Kotlin source of truth, risking hand-coded hex literals and token drift.

## Why now

- `F-097` (`I-108` `modern` theme) just shipped to `release/3.21` for CSS, Dart, and Swift.
- Android Jetpack Compose surfaces need matching `JoyPalette`, `JoyThemeTokens.modern`, `JoyModernTokens`, `JoySpacing`, `JoyRadii`, and `JoyTypography` tokens generated directly from `tokens.json`.

## Design & Scope

Add `packages/tokens/scripts/gen-kotlin-tokens.mjs` as a sibling of `gen-swift-tokens.mjs` that:
1. Reads `packages/tokens/src/tokens.json` and emits `packages/kotlin/src/main/kotlin/com/joymify/design/JoyTokens.g.kt` with only `import androidx.compose.ui.graphics.Color` (and zero extra Compose imports):
   - `object JoyPalette`: all primitive color ramps (`navy`, `gold`, `ink`, `cream`, `neutral`, `status`, `clay`) as `Color(0xFF...)`.
   - `data class JoyThemeTokens(...)`: semantic tokens with companion `light`, `dark`, `modernLight`, `modernDark`, and `fun modern(isDark: Boolean = false): JoyThemeTokens`.
   - `data class JoyGradientStop(val color: Color, val position: Float)` and `data class JoyModernModeTokens(...)`.
   - `object JoyModernTokens`: Midnight Brass dark/light tokens (`canvas`, `card`, `tile`, `border`, `title`, `text`, `skyInk`, `button`, `buttonText`, `buttonEdge`, `porcelain`, `porcelainText`, `mutedTint`, `successTint`, `errorTint`, `seamMid`, `seamEdge`, `ivoryCore`), `firstLightAngleDeg = 172f`, and `firstLightStops: List<JoyGradientStop>` (all 6 stops from `tokens.json` `preset.modern.dark` / `light`), plus `.light`, `.dark`, `.mode(isDark)`.
   - `object JoySpacing`, `object JoyRadii`, `object JoyTypography` as `Float` / `Int` constants.
2. Supports `--check` (exits 0 when up-to-date, non-zero when missing or drifted) and is wired into `packages/tokens/build.js` next to `gen-swift-tokens.mjs`.
3. Excludes `*.g.kt` in `scripts/lint-colors.sh` alongside `*.g.swift` / `*.g.dart` (with Kotlin color literal checks and self-test cases in `scripts/test-lint-colors.sh`).
4. Adds `packages/tokens/test/kotlin-tokens.test.js` verifying generation, `--check`, modern hex values, First Light stops, Kintsugi seams, and `JoyThemeTokens.modern`.

## Acceptance criteria

- [ ] `packages/tokens/scripts/gen-kotlin-tokens.mjs` generates `packages/kotlin/src/main/kotlin/com/joymify/design/JoyTokens.g.kt` from `packages/tokens/src/tokens.json` and passes `--check` with exit code 0.
- [ ] `JoyTokens.g.kt` defines `JoyPalette`, `JoyThemeTokens` (`light`, `dark`, `modernLight`, `modernDark`, `modern`), `JoyGradientStop`, `JoyModernTokens` (all Midnight Brass tokens, 6 First Light 172deg stops for dark/light, Kintsugi seam tokens, `ivoryCore`), `JoySpacing`, `JoyRadii`, and `JoyTypography` with only `import androidx.compose.ui.graphics.Color`.
- [ ] `packages/tokens/build.js` invokes `packages/tokens/scripts/gen-kotlin-tokens.mjs` alongside `gen-swift-tokens.mjs`.
- [ ] `packages/tokens/test/kotlin-tokens.test.js` passes under `pnpm --filter @montionugera/joy-tokens test`.
- [ ] `scripts/lint-colors.sh` excludes `*.g.kt`, and both `bash scripts/lint-colors.sh` and `bash scripts/test-lint-colors.sh` pass with exit code 0.
- [ ] Zero Emoji Policy holds across all new and modified files, and `psrw ship --no-deploy` succeeds into `release/3.21`.
