# Verification — E-003 Swift & SwiftUI Design System Package

1. `node packages/tokens/build.js` generates `packages/swift/Sources/JoyDesign/JoyTokens.g.swift` and `node packages/tokens/scripts/gen-swift-tokens.mjs --check` exits 0.
2. `pnpm --filter @montionugera/joy-tokens test` passes including `packages/tokens/test/swift-tokens.test.js`.
3. `(cd packages/swift && swift test)` compiles `JoyDesign` and passes all Swift XCTest assertions for token values, presets, and SwiftUI component primitives.
4. `bash scripts/lint-colors.sh packages/swift/Sources` exits 0 with 0 hardcoded color violations in handwritten `.swift` files.
5. `bash scripts/precheck.sh` and `bash scripts/epic-check.sh` pass cleanly.
