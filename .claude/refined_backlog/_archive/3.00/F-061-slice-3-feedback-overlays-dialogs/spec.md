---
title: "Slice 3: Feedback, Overlays & Dialogs"
id: F-061
status: refined
from_idea: I-066
---

# Slice 3: Feedback, Overlays & Dialogs

## Acceptance criteria

- [ ] `JoyAlert` implemented with 4 status variants (`info`, `success`, `warning`, `danger`), vector icons, `closable: true` with 44px hit bounds, and full 1px border.
- [ ] `JoyProgress` implemented with linear bar and circular progress modes, percent text, and token fills (`--joy-accent-base` / status colors).
- [ ] `JoySpin` implemented with animated spinning loader, tip text, and container overlay wrapping.
- [ ] `JoySkeleton` implemented with animated shimmer placeholders (lines, avatar, button shape) and active pulse.
- [ ] `JoyModal` implemented with backdrop scrim, Escape dismissal, responsive full-bleed on mobile <= 480px, sticky footer, and accessible dialog semantics.
- [ ] `JoyDrawer` implemented with directional sliding (right, left, bottom), adaptive bottom sheet on mobile <= 480px, and backdrop dismiss.
- [ ] `JoyPopconfirm` implemented with confirmation popover, confirm/cancel buttons, and top-layer positioning.
- [ ] `JoyTooltip` implemented with hover/tap bubble, arrow, and semantic surface contrast.
- [ ] `JoyNotification` and `JoyMessage` implemented with floating toast queue, auto-dismiss, and top/bottom positioning.
- [ ] Declarative Contract Schemas v2 created for Alert, Modal, Drawer, Tooltip and executed natively via Flutter `testWidgets`.
- [ ] Triplet parity checker (`scripts/parity-check.mjs --triplet`) verifies exports and prop compatibility for all Slice 3 components.
- [ ] `apps/flutter-hub` updated with interactive feedback, dialog, and overlay showcase sections.
- [ ] Gate 1 (`scripts/precheck.sh`) passes with exit code 0.
