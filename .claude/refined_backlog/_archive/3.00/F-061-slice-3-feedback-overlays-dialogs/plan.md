# Slice 3: Feedback, Overlays & Dialogs Implementation Plan

## Goal
Establish full triplet parity for feedback indicators, overlays, and dialogs across React, Svelte, and Flutter: `JoyAlert`, `JoyProgress`, `JoySpin`, `JoySkeleton`, `JoyModal`, `JoyDrawer`, `JoyPopconfirm`, `JoyTooltip`, `JoyNotification`, `JoyMessage`.

## Global Constraints
- **Single Source of Truth:** All styles must derive from `JoyThemeTokens` (`context.joyTheme`).
- **Zero Color Literals:** No raw hex (`0xFF...`), RGB, or Flutter stock colors in component code.
- **Zero Emoji Policy:** Enterprise components must never contain raw OS emojis; vector SVG icons via `JoyIcon` must be used.
- **Touch Target Floor:** All interactive controls (close buttons, action buttons) must enforce a 44x44px minimum touch target floor on coarse pointers.
- **Mobile Ergonomics:** `JoyModal` must become full-bleed with a sticky footer on mobile viewports <= 480px; `JoyDrawer` must adapt into a bottom sheet on mobile viewports <= 480px.
- **Scrim Styling:** Scrim backdrop uses `JoyColorRamps.navy900` at 60% opacity (no blur/backdrop-filter).
- **Quality Gate Integration:** Gate 1 (`scripts/precheck.sh`) must pass with exit code 0.

---

### Task 1: Feedback Indicators — `JoyAlert`, `JoyProgress`, `JoySpin`, `JoySkeleton`
- Create `packages/flutter/lib/src/components/feedback/joy_alert.dart` (4 status variants: info, success, warning, danger; vector icon; full 1px border; closable with 44px hit bounds).
- Create `packages/flutter/lib/src/components/feedback/joy_progress.dart` (linear and circular progress, percent text, token fills).
- Create `packages/flutter/lib/src/components/feedback/joy_spin.dart` (spinning loader, container wrapper).
- Create `packages/flutter/lib/src/components/feedback/joy_skeleton.dart` (animated shimmer placeholder, avatar, line, button shapes).
- Export from `packages/flutter/lib/joymify_flutter.dart`.
- Unit tests in `packages/flutter/test/components/`.
- Commit: `feat(flutter): implement JoyAlert, JoyProgress, JoySpin, and JoySkeleton feedback components`.

### Task 2: Overlays & Dialogs — `JoyModal`, `JoyDrawer`, `JoyPopconfirm`, `JoyTooltip`
- Create `packages/flutter/lib/src/components/overlay/joy_modal.dart` (scrim backdrop, Escape dismiss, sticky footer, mobile full bleed <= 480px).
- Create `packages/flutter/lib/src/components/overlay/joy_drawer.dart` (sliding panel, adaptive bottom-sheet on <= 480px).
- Create `packages/flutter/lib/src/components/overlay/joy_popconfirm.dart` (confirmation popover with confirm/cancel buttons).
- Create `packages/flutter/lib/src/components/overlay/joy_tooltip.dart` (hover/tap bubble, contrast).
- Export from `packages/flutter/lib/joymify_flutter.dart`.
- Unit tests in `packages/flutter/test/components/`.
- Commit: `feat(flutter): implement JoyModal, JoyDrawer, JoyPopconfirm, and JoyTooltip overlay primitives`.

### Task 3: Floating Notifications — `JoyNotification` and `JoyMessage`
- Create `packages/flutter/lib/src/components/feedback/joy_notification.dart` (floating toast queue, auto-dismiss, placement, status variants).
- Create `packages/flutter/lib/src/components/feedback/joy_message.dart` (lightweight inline/top message).
- Export from `packages/flutter/lib/joymify_flutter.dart`.
- Unit tests in `packages/flutter/test/components/`.
- Commit: `feat(flutter): implement JoyNotification and JoyMessage floating toast system`.

### Task 4: Manifests & Declarative Contracts v2
- Create manifests in `manifests/` for alert, progress, spin, skeleton, modal, drawer, popconfirm, tooltip, notification, message.
- Create contract schemas in `packages/contracts/schemas/`.
- Native contract test runners in `packages/flutter/test/contracts/`.
- Verify `node scripts/parity-check.mjs --triplet` passes.
- Commit: `test(contracts): add declarative contracts and parity manifests for Slice 3`.

### Task 5: Flutter Hub Showcase & Gate 1 Verification
- Update `apps/flutter-hub/lib/main.dart` with feedback, dialog, and overlay showcases.
- Recompile web showcase: `cd apps/flutter-hub && flutter build web`.
- Run Gate 1: `bash scripts/precheck.sh`.
- Commit: `feat(hub): add Slice 3 feedback and overlay showcase to flutter-hub and verify Gate 1`.
