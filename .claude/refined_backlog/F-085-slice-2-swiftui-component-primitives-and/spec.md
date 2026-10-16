---
title: "Slice 2: SwiftUI Component Primitives and Linter Parity"
id: F-085
status: refined
epic: E-003
from_idea: I-093
---

# Slice 2: SwiftUI Component Primitives and Linter Parity

## Problem Statement

With `JoyTokens.g.swift` generated in `packages/swift`, macOS/iOS consumers need reusable SwiftUI component primitives (`JoyBadge`, `JoyCard`, `JoyWell`, `JoyKpiTile`, `JoyPrimaryButtonStyle`, `JoyGhostButtonStyle`) that strictly consume semantic `JoyDesign` tokens without hardcoded hex literals, enforced by `scripts/lint-colors.sh`.

## Requirements

1. **`packages/swift/Sources/JoyDesign/JoyComponents.swift`**:
   - Implements `JoyDesign.BadgeTone`, `JoyBadge`, `JoyCard`, `JoyWell`, `JoyKpiTile`, `JoyPrimaryButtonStyle`, and `JoyGhostButtonStyle` using only `JoyDesign.Colors`, `JoyDesign.Palette`, `JoyDesign.Space`, `JoyDesign.Radius`, and `JoyDesign.Typography` (zero raw hex or `Color(0x...)` literals).
2. **`scripts/lint-colors.sh` & `scripts/test-lint-colors.sh`**:
   - Extend `scripts/lint-colors.sh` so when scanning `.swift` files or directories containing `.swift` files (e.g. `bash scripts/lint-colors.sh packages/swift/Sources`), generated `*.g.swift` files are exempted (like `*.g.dart`), while handwritten `.swift` files are checked against hardcoded hex / `Color(hex:` / `Color(joyHex:` / `NSColor(` / `UIColor(` literals.
   - Add Swift color-linter unit tests in `scripts/test-lint-colors.sh`.
3. **Tests & Gate Verification**:
   - Extend `packages/swift/Tests/JoyDesignTests/JoyTokensTests.swift` to test `JoyBadge`, `JoyCard`, `JoyWell`, `JoyKpiTile`, `JoyPrimaryButtonStyle`, and `JoyGhostButtonStyle`.
   - Add Swift check step to `scripts/precheck.sh` (runs `swift test` in `packages/swift` when `swift` is in `PATH` and `bash scripts/lint-colors.sh packages/swift/Sources`).

## Acceptance criteria

- [ ] `packages/swift/Sources/JoyDesign/JoyComponents.swift` implements `JoyBadge`, `JoyCard`, `JoyWell`, `JoyKpiTile`, `JoyPrimaryButtonStyle`, and `JoyGhostButtonStyle` with zero hardcoded color literals.
- [ ] `bash scripts/lint-colors.sh packages/swift/Sources`, `bash scripts/test-lint-colors.sh`, and `(cd packages/swift && swift test)` pass.
