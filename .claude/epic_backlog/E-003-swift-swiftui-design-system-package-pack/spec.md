---
title: "Swift & SwiftUI Design System Package (packages/swift)"
id: E-003
status: epic
---

# Swift & SwiftUI Design System Package (packages/swift)

## Why

Joymify Design System (`joy-design`) currently compiles `packages/tokens/src/tokens.json` into CSS/Tailwind (`packages/tokens`), React (`packages/react`), Svelte (`packages/svelte`), and Flutter/Dart (`packages/flutter` via `packages/tokens/scripts/gen-dart-tokens.mjs`). Meanwhile, native macOS and iOS SwiftUI applications across the workspace (`atlas-world-svc/tools/mac-observatory` and `joy-companion/apps/macos-hud`) need a canonical shared Swift Package (`packages/swift`) so every Swift/SwiftUI client consumes the exact same token scales, semantic colors, presets, spacing, radii, typography, and core SwiftUI component primitives without hardcoded hex drift.

## Outcome

Once every slice has shipped:

- `packages/tokens/scripts/gen-swift-tokens.mjs` compiles `packages/tokens/src/tokens.json` (plus the Joymify Fantasy Dark preset tokens) into `packages/swift/Sources/JoyDesign/JoyTokens.g.swift` automatically during `node packages/tokens/build.js` (and supports `--check` for drift detection).
- `packages/swift/Package.swift` defines the `JoyDesign` Swift Package (macOS 14+ / iOS 17+, Swift 5.9+) exporting generated token ramps (`JoyColorRamps`, `JoySpace`, `JoyRadius`, `JoyFontSize`, `JoyThemeTokens`, `JoyFantasyPalette`) and reusable SwiftUI primitives (`JoyBadge`, `JoyCard`, `JoyWell`, `JoyKpiTile`, `JoyPrimaryButtonStyle`, `JoyGhostButtonStyle`).
- Zero Emoji Policy and color-linter rules (`scripts/lint-colors.sh`) are respected across `packages/swift` (generated `*.g.swift` holds primitive hex initializers; handwritten SwiftUI component files reference only semantic `JoyDesign` / `JoyThemeTokens` tokens).
- Automated verification covers both Node token-generator tests (`packages/tokens/test/swift-tokens.test.js`) and native SwiftPM tests (`swift test` in `packages/swift`).

## Slices

1. Slice 1: Swift Token Compiler & SwiftPM Package Foundation — `packages/tokens/scripts/gen-swift-tokens.mjs` wired into `packages/tokens/build.js`, `packages/swift/Package.swift`, generated `JoyTokens.g.swift` (all color ramps, light/dark semantic tokens, palette presets, fantasy preset, spacing, radii, typography), and Node + Swift unit tests.
2. Slice 2: SwiftUI Component Primitives & Linter Parity — Reusable SwiftUI components (`JoyBadge`, `JoyCard`, `JoyWell`, `JoyKpiTile`, `JoyPrimaryButtonStyle`, `JoyGhostButtonStyle`) in `packages/swift/Sources/JoyDesign/JoyComponents.swift`, Swift color-lint support in `scripts/lint-colors.sh`, `.gitignore` / `precheck.sh` integration, and consumer sync with `atlas-world-svc`.
