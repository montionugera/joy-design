# Implementation Plan — I-093: SwiftUI Component Primitives and Linter Parity

1. [x] Task 1: Create `packages/swift/Sources/JoyDesign/JoyComponents.swift` with zero color literals and full semantic token bindings.
2. [x] Task 2: Add `.swift` / `.g.swift` support to `scripts/lint-colors.sh` and add Swift linter tests to `scripts/test-lint-colors.sh`.
3. [x] Task 3: Expand `packages/swift/Tests/JoyDesignTests/JoyTokensTests.swift` and `packages/tokens/test/swift-tokens.test.js` to verify component primitives and color-lint compliance.
4. [x] Task 4: Wire `packages/swift` into `scripts/precheck.sh` and verify full Gate 1 + `swift test`.
