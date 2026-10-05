# Slice 1: Core Primitives, Layout & Visual Tokens Implementation Plan

## Goal
Establish full triplet parity for foundation primitives, layout helpers, and visual display widgets across React, Svelte, and Flutter: `JoyText`, `JoyIcon`, `JoyBox`, `JoyFlex`, `JoySpace`, `JoyGrid`, `JoyDivider`, `JoyBadge`, `JoyTag`, `JoyAvatar`.

## Global Constraints
- **Single Source of Truth:** All styles must derive from `JoyThemeTokens` (`context.joyTheme`).
- **Zero Color Literals:** No raw hex (`0xFF...`), RGB, or Flutter stock colors in component code.
- **Zero Emoji Policy:** Enterprise components must never contain raw OS emojis; vector icons via `JoyIcon` must be used.
- **Touch Target Floor:** All interactive controls (`JoyTag` close button, clickable avatar) must meet 44px on coarse pointers.
- **Quality Gate Integration:** Gate 1 (`scripts/precheck.sh`) must pass with exit code 0.

---

### Task 1: Primitives — `JoyText` and `JoyIcon`
- Create `packages/flutter/lib/src/components/primitives/joy_text.dart` (typography scales: h1-h6, body, caption, code; semantic colors: primary, secondary, tertiary, inverse).
- Create `packages/flutter/lib/src/components/primitives/joy_icon.dart` (SVG vector icon bridge using `flutter_svg`).
- Export both from `packages/flutter/lib/joymify_flutter.dart`.
- Unit tests: `packages/flutter/test/components/joy_text_test.dart`, `joy_icon_test.dart`.
- Commit: `feat(flutter): implement JoyText typography and JoyIcon SVG vector bridge`.

### Task 2: Layout Primitives — `JoyBox`, `JoyFlex`, `JoySpace`, `JoyGrid`, `JoyDivider`
- Create `packages/flutter/lib/src/components/layout/joy_box.dart` (padding, margin, surface, border, radius).
- Create `packages/flutter/lib/src/components/layout/joy_flex.dart` and `joy_space.dart` (token gap spacing).
- Create `packages/flutter/lib/src/components/layout/joy_grid.dart` (responsive grid).
- Create `packages/flutter/lib/src/components/layout/joy_divider.dart` (horizontal/vertical hairline).
- Export all from `packages/flutter/lib/joymify_flutter.dart`.
- Unit tests in `packages/flutter/test/components/`.
- Commit: `feat(flutter): implement JoyBox, JoyFlex, JoySpace, JoyGrid, and JoyDivider layout primitives`.

### Task 3: Visual Display Widgets — `JoyBadge`, `JoyTag`, `JoyAvatar`
- Create `packages/flutter/lib/src/components/display/joy_badge.dart` (count, dot, status colors).
- Create `packages/flutter/lib/src/components/display/joy_tag.dart` (status variants, closable with 44px hit bounds on coarse pointers).
- Create `packages/flutter/lib/src/components/display/joy_avatar.dart` (image, initials fallback, ring border, sizes).
- Export all from `packages/flutter/lib/joymify_flutter.dart`.
- Unit tests in `packages/flutter/test/components/`.
- Commit: `feat(flutter): implement JoyBadge, JoyTag, and JoyAvatar display widgets`.

### Task 4: Manifests & Declarative Contracts v2
- Create manifests: `manifests/text.json`, `manifests/divider.json`, `manifests/badge.json`, `manifests/tag.json`, `manifests/avatar.json`.
- Create contract schemas in `packages/contracts/schemas/` for badge, tag, avatar.
- Implement native contract runners in `packages/flutter/test/contracts/`.
- Verify `node scripts/parity-check.mjs --triplet` passes.
- Commit: `test(contracts): add declarative contracts and parity manifests for Slice 1`.

### Task 5: Flutter Hub Showcase & Gate 1 Verification
- Update `apps/flutter-hub/lib/main.dart` with demo sections for all Slice 1 widgets.
- Rebuild web showcase: `cd apps/flutter-hub && flutter build web`.
- Run Gate 1: `bash scripts/precheck.sh`.
- Commit: `feat(hub): add Slice 1 showcase to flutter-hub and verify Gate 1`.
