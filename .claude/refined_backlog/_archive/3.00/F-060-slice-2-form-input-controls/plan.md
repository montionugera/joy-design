# Slice 2: Form & Input Controls Implementation Plan

## Goal
Establish full triplet parity for form controls and input primitives across React, Svelte, and Flutter: `JoyInput`, `JoyInputNumber`, `JoyCheckbox`, `JoyRadio`, `JoyRadioGroup`, `JoySwitch`, `JoySlider`, `JoyRate`, `JoySegmented`.

## Global Constraints
- **Single Source of Truth:** All styles must derive from `JoyThemeTokens` (`context.joyTheme`).
- **Zero Color Literals:** No raw hex (`0xFF...`), RGB, or Flutter stock colors in component code.
- **Zero Emoji Policy:** Enterprise components must never contain raw OS emojis; vector SVG icons via `JoyIcon` must be used.
- **Touch Target Floor:** All interactive controls (`Checkbox`, `Radio`, `Switch`, `Slider` thumb, `Rate` stars) must enforce a 44x44px minimum touch target floor on coarse pointers.
- **Mobile Ergonomics:** Text inputs must enforce 16px minimum font size on mobile viewports to prevent iOS auto-zoom.
- **Quality Gate Integration:** Gate 1 (`scripts/precheck.sh`) must pass with exit code 0.

---

### Task 1: Text & Number Inputs — `JoyInput` and `JoyInputNumber`
- Create `packages/flutter/lib/src/components/form/joy_input.dart` (prefix/suffix addons, status error/success/warning, clearable button, sizes sm/md/lg, password/obscure, disabled/readonly).
- Create `packages/flutter/lib/src/components/form/joy_input_number.dart` (numeric stepping, min/max limits, precision, step up/down buttons).
- Export both from `packages/flutter/lib/joymify_flutter.dart`.
- Unit tests: `packages/flutter/test/components/joy_input_test.dart`, `joy_input_number_test.dart`.
- Commit: `feat(flutter): implement JoyInput and JoyInputNumber with mobile zoom prevention`.

### Task 2: Choice Controls — `JoyCheckbox`, `JoyRadio`, and `JoyRadioGroup`
- Create `packages/flutter/lib/src/components/form/joy_checkbox.dart` (checked, unchecked, indeterminate, label, 44px hit bounds).
- Create `packages/flutter/lib/src/components/form/joy_radio.dart` (`JoyRadio` and `JoyRadioGroup` single-choice manager with accessible semantics and 44px hit bounds).
- Export all from `packages/flutter/lib/joymify_flutter.dart`.
- Unit tests: `packages/flutter/test/components/joy_checkbox_test.dart`, `joy_radio_test.dart`.
- Commit: `feat(flutter): implement JoyCheckbox and JoyRadioGroup choice controls`.

### Task 3: Interactive Sliders & Toggles — `JoySwitch`, `JoySlider`, `JoyRate`, `JoySegmented`
- Create `packages/flutter/lib/src/components/form/joy_switch.dart` (animated sliding pill thumb, loading indicator, 44px hit bounds).
- Create `packages/flutter/lib/src/components/form/joy_slider.dart` (track/thumb token styling, step, range min/max).
- Create `packages/flutter/lib/src/components/form/joy_rate.dart` (star rating, half-stars, zero emojis using vector SVG star).
- Create `packages/flutter/lib/src/components/form/joy_segmented.dart` (sliding indicator animation, block option, token radius).
- Export all from `packages/flutter/lib/joymify_flutter.dart`.
- Unit tests in `packages/flutter/test/components/`.
- Commit: `feat(flutter): implement JoySwitch, JoySlider, JoyRate, and JoySegmented`.

### Task 4: Manifests & Declarative Contracts v2
- Create manifests: `manifests/input.json`, `manifests/input-number.json`, `manifests/checkbox.json`, `manifests/radio.json`, `manifests/switch.json`, `manifests/slider.json`, `manifests/rate.json`, `manifests/segmented.json`.
- Create contract schemas in `packages/contracts/schemas/`.
- Implement native contract runners in `packages/flutter/test/contracts/`.
- Verify `node scripts/parity-check.mjs --triplet` passes.
- Commit: `test(contracts): add declarative contracts and parity manifests for Slice 2`.

### Task 5: Flutter Hub Showcase & Gate 1 Verification
- Update `apps/flutter-hub/lib/main.dart` with interactive form demo sections.
- Recompile web showcase: `cd apps/flutter-hub && flutter build web`.
- Run Gate 1: `bash scripts/precheck.sh`.
- Commit: `feat(hub): add Slice 2 form showcase to flutter-hub and verify Gate 1`.
