# Implementation Plan — I-092: Swift Token Compiler and SwiftPM Package Foundation

1. [x] Task 1: Add `.build/` and `.swiftpm/` to `.gitignore` and add `.build` / `.swiftpm` to the Zero Emoji directory skip list in `scripts/precheck.sh`.
2. [x] Task 2: Create `packages/tokens/scripts/gen-swift-tokens.mjs` and wire it into `packages/tokens/build.js`.
3. [x] Task 3: Create `packages/swift/Package.swift`, generate `packages/swift/Sources/JoyDesign/JoyTokens.g.swift`, and add `packages/swift/Tests/JoyDesignTests/JoyTokensTests.swift`.
4. [x] Task 4: Add `packages/tokens/test/swift-tokens.test.js` and verify `pnpm --filter @montionugera/joy-tokens test` and `swift test`.
