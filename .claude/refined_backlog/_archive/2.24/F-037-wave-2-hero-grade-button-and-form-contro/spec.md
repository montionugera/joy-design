---
title: "Wave 2: hero-grade Button and form controls with full state coverage, Svelte + React parity"
id: F-037
status: refined
epic: E-001
from_idea: I-037
---

# Wave 2: Button and form controls (product register)

Parent: E-001. Depends on Wave 1 semantic tokens. Evidence: `research/audit-svelte-forms.md` (115 issues, 24 P0), `research/audit-react-forms-landing.md` (165 issues; the form rows apply here, landing rows belong to Wave 4), `research/audit-standards.md`. Every SVF- issue and every RXF- form issue must be resolved or deferred with a reason.

Components (both `packages/svelte/src/lib` and `packages/react/src`, plus their CSS in `packages/tokens/build.js`): Button, Input, InputNumber, Select, Checkbox, Switch, RadioGroup, Slider, Rate, Segmented, Form, FormItem, DatePicker, TimePicker, DateRangePicker, Mentions, Upload, TreeSelect, Cascader, Transfer, MarkdownEditor.

## Problem

Controls fall back to purple and slate, Checkbox/Switch/Radio/Rate/Select have no dark rules, nearly every control is under 44px on touch, inputs are 14px so iOS zooms, Cascader/Transfer/DateRangePicker/MarkdownEditor overflow 375px, dropdowns render inline with arbitrary z-index and no Escape or outside-click contract, TreeSelect/Cascader/MarkdownEditor leak navy cards into light mode, no reduced-motion, React invents classes the stylesheet does not define, and props/events/classes drift between frameworks. Button is a flat rectangle with color-only hover.

## Scope (in)

1. **Button (the reference control).** Variants `solid | outline | ghost | danger | link`, sizes `sm | md | lg` on `--joy-control-height-*`, states default/hover/focus-visible/active/disabled/loading with icons slots (`iconStart`, `iconEnd`), `block` prop. Solid: two-stop same-hue gradient (`--joy-accent-default` to a 6% darker stop) with 1px inset top highlight, `--joy-elevation-1` gold-tinted, hover lifts 1px and deepens to `--joy-elevation-2`, active removes lift with inset shadow, loading swaps label opacity and shows the spinner without layout shift, disabled at 50% with no lift. Outline and ghost use `--joy-border-strong`/`--joy-text-primary`. All transitions 150ms `--joy-ease-out` with reduced-motion fallback. Touch: ≥ 44px via `@media (pointer: coarse)`.
2. **Text-like inputs** (Input, InputNumber, Mentions, DatePicker, TimePicker, DateRangePicker, MarkdownEditor): 16px font on mobile, `--joy-control-height-*`, states incl. `error`/`success` with message slot, prefix/suffix slots, focus uses `--joy-focus-ring` (no glow), disabled/readonly styles, dark surfaces from semantic tokens only.
3. **Choice controls** (Checkbox, Switch, RadioGroup, Rate, Segmented, Slider): visible 44px hit areas with 20px visuals, `:focus-visible` ring, indeterminate checkbox, keyboard operation (arrow keys for radio/segmented/slider/rate, Space for switch), dark rules, `aria-*` states.
4. **Overlay-bearing controls** (Select, TreeSelect, Cascader, DatePicker, TimePicker, Mentions): render the panel through a shared overlay primitive (from `overlay-utils.ts` in Svelte, a matching `useOverlay` hook in React) using `position: fixed` anchored positioning, `--joy-z-dropdown`, Escape, outside-click, focus return, and a bottom-sheet layout under 480px. Cascader columns stack on mobile; DateRangePicker shows one calendar under 640px; Transfer stacks vertically with the operation row horizontal under 640px.
5. **Form/FormItem**: label/required/help/error layout on one spacing scale, horizontal on ≥ 640px and stacked below, required marker uses `--joy-status-danger-fg` and the sans font (no `SimSun`).
6. **Parity.** For every component: identical prop names (documented casing rule: React `onChange`, Svelte `onchange`), identical class names, identical CSS in `build.js`; React components spread rest props and forward refs; Svelte components accept `...rest` and `bind:ref`/`$bindable` value; delete invented class references (RXF list) or add their rules. Generate `scripts/parity-check.mjs` that diffs class names and prop names between twins and fails on divergence.
7. **Emoji removal** in Rate, Upload, MarkdownEditor (React) and any Svelte twin; use `packages/icons`.
8. Hub stories for every state × size × theme so reviewers can see them (add to the existing manifest; no new hub chrome).

## Out of scope

Display/feedback/navigation components (Wave 3), landing (Wave 4), hub layout (Wave 5).

## Acceptance

- `bash scripts/lint-colors.sh --strict packages/svelte/src/lib/{list} packages/react/src/{list}` exits 0 for the 21 components; `node scripts/parity-check.mjs` reports zero divergences for them.
- `pnpm -r test` passes with new tests: each component renders every documented state and size (existing `components.test.js` pattern); overlay primitive unit tests for Escape/outside-click/focus return.
- Playwright contract: at 375px in light and dark, every `.joy-button`, input, checkbox, switch, radio, segmented item and rate star has a hit area ≥ 44px; no horizontal overflow in the "Data Entry & Forms" hub view; Select and Cascader panels open as bottom sheets.
- Screenshots (375px and 1280px, light and dark) of the Button matrix and the forms view attached to the plan; the Button matrix is reviewed for taste by a Claude reviewer with the `impeccable` skill loaded.
