---
title: "Slice 1: Swift Token Compiler and SwiftPM Package Foundation"
id: I-092
status: approved
epic: E-003
---

# Slice 1: Swift Token Compiler and SwiftPM Package Foundation

## Problem Statement

Native macOS and iOS SwiftUI applications (`atlas-world-svc/tools/mac-observatory` and `joy-companion/apps/macos-hud`) need a deterministic Swift token library generated from `packages/tokens/src/tokens.json` (plus the Joymify Fantasy Dark preset tokens) so they never drift from web or Flutter tokens.

## Requirements

1. **`packages/tokens/scripts/gen-swift-tokens.mjs`**:
   - Reads `packages/tokens/src/tokens.json` and resolves all token references (`{color.navy.800}`, etc.).
   - Generates `packages/swift/Sources/JoyDesign/JoyTokens.g.swift` (and supports `--check` flag to verify zero drift).
   - Emits:
     - `Color(joyHex: UInt32, alpha: Double = 1.0)` extension in `JoyTokens.g.swift`.
     - `JoyColorRamps` (all color ramps from `tokens.json`: `navy`, `gold`, `ink`, `cream`, `neutral`, `clay`, `status`).
     - `JoySpace` (`s1=4`, `s2=8`, `s3=12`, `s4=16`, `s5=24`, `s6=32` plus full `tokens.space` steps).
     - `JoyRadius` (`r1=6`, `r2=10`, `r3=16` plus `sm`, `md`, `lg`, `xl`, `full`).
     - `JoyFontSize` (`xs`, `sm`, `base`, `md`, `lg`, `xl`, `xxl`, `xxxl`).
     - `JoyThemeTokens` (`light`, `dark`, and all 6 presets from `tokens.json`: `classic`, `bauhausPrimary`, `clayCourt`, `nordicSlate`, `verdantLawn`, `outdoor`).
     - `JoyDesign.Palette`, `JoyDesign.Colors`, `JoyDesign.Space`, `JoyDesign.Radius`, `JoyDesign.Typography` (canonical Joymify Fantasy Dark tokens shared with `atlas-world-svc` and `joy-companion`).
2. **`packages/tokens/build.js`**:
   - Invokes `packages/tokens/scripts/gen-swift-tokens.mjs` alongside `gen-dart-tokens.mjs`.
3. **`packages/swift/Package.swift`**:
   - SwiftPM manifest (`swift-tools-version: 5.9`), platforms `.macOS(.v14), .iOS(.v17)`, library product `JoyDesign`, target `JoyDesign`, testTarget `JoyDesignTests`.
4. **Tests**:
   - `packages/tokens/test/swift-tokens.test.js`: verifies `JoyTokens.g.swift` exists, `--check` passes, and key token ramps (`navy800`, `gold500`, `JoyThemeTokens.light`, `JoyThemeTokens.dark`, `JoyDesign.Palette`) are present.
   - `packages/swift/Tests/JoyDesignTests/JoyTokensTests.swift`: XCTest suite verifying spacing, radii, and token ramp invariants.

## Acceptance criteria

- [ ] `node packages/tokens/build.js` generates `packages/swift/Sources/JoyDesign/JoyTokens.g.swift` and `node packages/tokens/scripts/gen-swift-tokens.mjs --check` exits 0.
- [ ] `pnpm --filter @montionugera/joy-tokens test` and `(cd packages/swift && swift test)` pass.
