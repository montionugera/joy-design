# [F-019] Form Suite & Advanced Data Entry Parity

> **Autonomous Execution Standard**: Zero mid-turn interruptions. Verify evidence before assertions. Zero OS emojis.

**Goal**: Deliver complete Ant Design parity for Data Entry:
1. `Form` & `Form.Item` with client/async validation engine (`rules`: `required`, `min`, `max`, `pattern`, `validator`).
2. `InputNumber`: High-density numeric stepper with min, max, step, precision, spinbutton ARIA traits, and keyboard arrows.
3. `Rate`: Interactive star rating scale with half-star granularity, hover feedback, and radiogroup ARIA semantics.
4. `Mentions`: Trigger-based `@` and `#` autocomplete tagging input with dropdown menu.
5. `TimePicker`: Column-based hour/minute/second picker with 24-hour and 12-hour presets.
6. `Transfer`: Dual-panel list migration component with selection counts, search filter, and directional action buttons (matching Ant Design Screenshot 5).

Dual-framework exports (`@joymify/svelte` + `@joymify/react`), Storybook Hub interactive showcases, and live Kubernetes deployment.

---

## Phase 1: Tokens & Styling Engine Expansion
- [x] Add CSS classes in `packages/tokens/build.js`:
  - `.joy-form`, `.joy-form-item`, `.joy-form-item__label`, `.joy-form-item__explain`, `.joy-form-item--error`
  - `.joy-input-number`, `.joy-input-number__handler-wrap`, `.joy-input-number__handler-up`, `.joy-input-number__handler-down`
  - `.joy-rate`, `.joy-rate__star`, `.joy-rate__star--half`, `.joy-rate__star--full`
  - `.joy-mentions`, `.joy-mentions__dropdown`, `.joy-mentions__item`
  - `.joy-time-picker`, `.joy-time-picker__panel`, `.joy-time-picker__column`
  - `.joy-transfer`, `.joy-transfer__list`, `.joy-transfer__header`, `.joy-transfer__body`, `.joy-transfer__operations`
- [x] Compile tokens and verify `packages/tokens/test/tokens.test.js`

## Phase 2: Svelte 5 Runes Implementation
- [x] `Form.svelte` & `FormItem.svelte`
- [x] `InputNumber.svelte`
- [x] `Rate.svelte`
- [x] `Mentions.svelte`
- [x] `TimePicker.svelte`
- [x] `Transfer.svelte`
- [x] Export in `packages/svelte/src/lib/index.ts` and test in `packages/svelte/test/components.test.js`

## Phase 3: React 19 Implementation
- [x] `Form.tsx` & `FormItem.tsx`
- [x] `InputNumber.tsx`
- [x] `Rate.tsx`
- [x] `Mentions.tsx`
- [x] `TimePicker.tsx`
- [x] `Transfer.tsx`
- [x] Export in `packages/react/src/index.ts` and test in `packages/react/test/components.test.js`

## Phase 4: Storybook Hub Integration & Zero Emoji Audit
- [x] Add Form & Advanced Data Entry showcase tab (`#view-forms`) in `apps/storybook-hub/build.js`
- [x] Verify zero raw OS emojis

## Phase 5: Verification & Promotion
- [ ] Run `./scripts/integration.sh`
- [ ] `psrw ship`
- [ ] `psrw promote --babysit`
- [ ] Live verification on `https://design.joymify.com`
