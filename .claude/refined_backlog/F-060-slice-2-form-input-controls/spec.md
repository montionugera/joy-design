---
title: "Slice 2: Form & Input Controls"
id: F-060
status: refined
from_idea: I-065
---

# Slice 2: Form & Input Controls

## Acceptance criteria

- [ ] `JoyInput` implemented with prefix/suffix addons, status variants (`error`, `success`, `warning`), clearable button, sizes (`sm`, `md`, `lg`), disabled/readonly states, and 16px minimum font size on mobile viewports.
- [ ] `JoyInputNumber` implemented with numeric stepping, precision, min/max limits, and accessible increment/decrement buttons.
- [ ] `JoyCheckbox` implemented with checked, unchecked, indeterminate states, label slot, and 44x44px minimum touch target floor.
- [ ] `JoyRadio` and `JoyRadioGroup` implemented with single-selection management, disabled options, and accessible radio semantics.
- [ ] `JoySwitch` implemented with animated sliding pill thumb, checked/unchecked states, loading state, and 44x44px hit bounds.
- [ ] `JoySlider` implemented with track/thumb token styling, min/max range, step, and disabled state.
- [ ] `JoyRate` implemented with star rating, half-star support, custom count, and zero raw OS emojis (using vector SVG star from `@joymify/icons`).
- [ ] `JoySegmented` implemented with sliding indicator animation, disabled items, block width option, and token radius.
- [ ] Declarative Contract Schemas v2 created for each control and executed natively via Flutter `testWidgets`.
- [ ] Triplet parity checker (`scripts/parity-check.mjs --triplet`) verifies exports and prop compatibility for all Slice 2 controls.
- [ ] `apps/flutter-hub` updated with interactive showcase demos for all Slice 2 form controls.
- [ ] Gate 1 (`scripts/precheck.sh`) passes with exit code 0.
