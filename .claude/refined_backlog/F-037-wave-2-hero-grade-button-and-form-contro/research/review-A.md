# Quality Gate Review: Phase A (Task A1)

## Scope
- Task A1: dependencies (@joymify/icons), hero button tokens (gold-450 gradient-end, accent-highlight, elevation-accent-1/2/inset), button state matrix CSS, contrast pairs, and wave-2 test suite.

## Reviewers
- code-reviewer (adversarial review)
- typescript-reviewer (type contracts & d.ts generation)

## Findings & Verifications

### 1. Contrast Math & Accessibility
- `--joy-text-on-accent` (`#14253e`) on light `--joy-accent-gradient-end` (`#b39042`):
  - Contrast ratio: **5.12:1** (exceeds WCAG 2.2 AA 4.5:1 and task threshold 5.0:1). PASS.
- `--joy-text-on-accent` (`#0a121f`) on dark `--joy-accent-gradient-end` (`#c49a3a`):
  - Contrast ratio: **7.18:1** (exceeds 4.5:1). PASS.
- `--joy-status-danger-bg` on `--joy-status-danger-fg`:
  - Light theme: **9.13:1** (exceeds 4.5:1). PASS.
  - Dark theme: **8.77:1** (exceeds 4.5:1). PASS.

### 2. Ramps Monotonicity
- Gold step 450 placed at L=0.67, C=0.105 between step 400 (L=0.704) and step 500 (L=0.620).
- Monotonically decreasing luminance verified by `packages/tokens/test/ramps.test.js`. PASS.

### 3. Lockfile & Dependency Hygiene
- `@joymify/icons` added as `"workspace:*"` in `packages/svelte/package.json` and `packages/react/package.json`.
- `pnpm-lock.yaml` diff isolated strictly to the two importers (`packages/svelte` and `packages/react`). PASS.

### 4. CSS State Matrix & Visual Quality
- Full state matrix for Button compiled in `packages/tokens/dist/theme.css`:
  - Variants: `solid`, `outline`, `ghost`, `danger`, `link`, `glass`.
  - Sizes: `sm`, `md`, `lg` mapped to `--joy-control-height-*` (touch targets >= 44px via `@media (pointer: coarse)`).
  - States: default, hover (1px lift, elevation-accent-2 on solid), active (transform none, elevation-accent-inset), focus-visible (`--joy-focus-ring`), disabled (opacity 0.5, no lift/shadow), loading (spinner with zero layout shift).
  - Transitions: explicit properties with `--joy-duration-fast` and `--joy-ease-out`; no `transition: all`.
  - Zero hex/rgb color literals in `.joy-button` definitions. PASS.

### 5. Automated Verification Verdict
- `pnpm --filter @joymify/tokens build`: exit code 0
- `pnpm --filter @joymify/tokens test`: 14/14 tests pass (exit code 0)
- `bash scripts/lint-colors.sh`: clean, strict checks pass (exit code 0)
- `node apps/storybook-hub/build.js`: exit code 0
- `pnpm --filter @joymify/svelte test`: 10/10 tests pass (exit code 0)
- `pnpm --filter @joymify/react test`: 10/10 tests pass (exit code 0)

Verdict: **PASS (Clean)**

---

# Quality Gate Review: Phase A (Task A2)

## Scope
- Task A2: Text-like inputs, Select listbox, Form and FormItem layout, InputNumber, DatePicker, DateRangePicker, TimePicker, Mentions, MarkdownEditor state matrix and responsive rules in `packages/tokens/build.js`.

## Reviewers
- code-reviewer (adversarial review)
- typescript-reviewer (type contracts & CSS compilation)

## Findings & Verifications

### 1. Token Usage & Color Integrity
- All colors mapped strictly to semantic tokens (`--joy-surface-card`, `--joy-surface-sunken`, `--joy-surface-raised`, `--joy-border-default`, `--joy-border-strong`, `--joy-border-focus`, `--joy-text-primary`, `--joy-text-secondary`, `--joy-text-muted`, `--joy-accent-subtle`, `--joy-accent-text`, `--joy-status-danger-fg`, `--joy-status-danger-border`, `--joy-status-success-fg`, `--joy-status-success-border`).
- Zero hardcoded hex, rgb, or hsl values introduced in `componentStyles`.
- Removed phantom `--joy-color-surface-elevated` reference and `z-index: 50;` literal from TimePicker and Mentions.
- Removed `SimSun` font reference in required form item marker in favor of `--joy-font-family-sans`.

### 2. Typography & Touch Targets
- All text inputs use `--joy-font-size-md` (16px) on touch devices via `@media (pointer: coarse)` to prevent iOS auto-zoom.
- Removed legacy fixed `font-size: 0.875rem` from base text control definitions.
- Control heights bound to `--joy-control-height-sm`, `--joy-control-height-md`, `--joy-control-height-lg`.

### 3. Responsive & Overlay Layouts
- Form horizontal layout activates at `>= 640px` (`@media (min-width: 640px)`) and stacks below 640px. Removed fixed widths/margins.
- DateRangePicker stacks vertically under 640px (`@media (max-width: 640px)`).
- MarkdownEditor split panes stack under 640px (`@media (max-width: 640px)`).

### 4. Automated Verification Verdict
- `pnpm --filter @joymify/tokens build`: exit code 0
- `pnpm --filter @joymify/tokens test`: 15/15 tests pass (exit code 0)
- `bash scripts/lint-colors.sh`: clean, strict checks pass (exit code 0)
- `node apps/storybook-hub/build.js`: exit code 0
- `pnpm --filter @joymify/svelte test`: 10/10 tests pass (exit code 0)
- `pnpm --filter @joymify/react test`: 10/10 tests pass (exit code 0)

Verdict: **PASS (Clean)**

---

# Quality Gate Review: Phase A (Task A3)

## Scope
- Task A3: Choice controls CSS in `packages/tokens/build.js` (`.joy-checkbox*`, `.joy-radio*`, `.joy-switch*`, `.joy-slider*`, `.joy-segmented*`, `.joy-rate*`) and test suite in `packages/tokens/test/wave-2.test.js`.

## Reviewers
- code-reviewer (adversarial review)
- typescript-reviewer (type contracts & CSS compilation)

## Findings & Verifications

### 1. Token Usage & Color Invariants
- Strictly token-driven color references:
  - Base borders: `--joy-border-subtle`, `--joy-border-strong`
  - Active accents: `--joy-accent-default`, `--joy-text-on-accent`
  - Surfaces: `--joy-surface-card`, `--joy-surface-sunken`, `--joy-surface-inverse`
  - Focus rings: `--joy-focus-ring` (2px outline offset)
  - Error/validation: `--joy-status-danger-border` on `aria-invalid="true"`
- Removed all legacy hardcoded purple/gradient fills (`linear-gradient(90deg, ...)`) from choice controls (SVF-044, SVF-045, RXF-015).
- Zero raw OS emojis across all choice controls; Rate uses inline vector polygon SVG with `currentColor`.

### 2. Touch Hit Target Standards (>= 44px)
- Checkbox & Radio root labels enforce `min-height: var(--joy-control-height-md)` and `min-width: var(--joy-control-height-md)` (44px under coarse pointer) around 20px visual boxes/circles.
- Switch uses `min-height: var(--joy-control-height-md)` (44px) with `--sm` size modifier (`min-height: var(--joy-control-height-sm)`).
- Slider handle provides 44px hit target via `__handle::before { inset: -12px; }` on 20px circle.
- Rate stars size to `width: var(--joy-control-height-md); height: var(--joy-control-height-md);` (44px on touch).
- Segmented items provide `min-height: var(--joy-control-height-md)` with `--sm` size modifier (`min-height: var(--joy-control-height-sm)`).

### 3. State Coverage & Transitions
- Complete state coverage: default, hover (border accent), active (elevation lift / inset), focus-visible (`--joy-focus-ring`), disabled (opacity 0.5, cursor not-allowed), readonly (Rate), indeterminate (Checkbox square bar).
- Motion transitions strictly bounded to `--joy-duration-fast` and `--joy-ease-out` with explicit properties; zero `transition: all`.

### 4. Automated Verification Verdict
- `pnpm --filter @joymify/tokens build`: exit code 0
- `pnpm --filter @joymify/tokens test`: 16/16 tests pass (exit code 0)
- `bash scripts/lint-colors.sh`: clean, strict checks pass (exit code 0)
- `node apps/storybook-hub/build.js`: exit code 0
- `pnpm --filter @joymify/svelte test`: 10/10 tests pass (exit code 0)
- `pnpm --filter @joymify/react test`: 10/10 tests pass (exit code 0)

Verdict: **PASS (Clean)**

---

# Quality Gate Review: Phase A (Task A4)

## Scope
- Task A4: Overlay primitive (`.joy-overlay`, `.joy-overlay--sheet`, `.joy-overlay--above`), TreeSelect, Cascader, Transfer, and Upload CSS in `packages/tokens/build.js`, tokenized z-index removal, and test suite in `packages/tokens/test/wave-2.test.js`.

## Reviewers
- code-reviewer (adversarial review)
- typescript-reviewer (type contracts & CSS compilation)

## Findings & Verifications

### 1. Token Usage & Color Integrity
- All styles compiled strictly using semantic tokens (`--joy-surface-overlay`, `--joy-surface-card`, `--joy-surface-raised`, `--joy-surface-sunken`, `--joy-border-default`, `--joy-border-subtle`, `--joy-border-strong`, `--joy-border-focus`, `--joy-text-primary`, `--joy-text-secondary`, `--joy-text-muted`, `--joy-accent-default`, `--joy-accent-subtle`, `--joy-accent-text`, `--joy-status-danger-fg`, `--joy-status-danger-bg`, `--joy-elevation-3`, `--joy-radius-overlay`, `--joy-radius-card`, `--joy-radius-control`, `--joy-radius-pill`, `--joy-z-dropdown`).
- Zero hardcoded hex, rgb, or hsl color literals in touched blocks.
- Zero var() fallbacks.
- Deleted legacy `.joy-cascader-menus` and `.joy-treeselect__node--selected` with hardcoded `!important` color rules.

### 2. Z-Index Tokenization & Overlay Contract
- Wave 2 dropdown panels and overlay primitive bound to `position: fixed` and `z-index: var(--joy-z-dropdown)`.
- Verified zero instances of arbitrary `z-index: 1000`, `z-index: 1050`, or `z-index: 1100` literals across Wave 2 components.
- Overlay primitive supports fixed anchoring, bottom-sheet layout under 480px or coarse pointers (`.joy-overlay--sheet`), and flipped direction (`.joy-overlay--above`).

### 3. Responsive & Touch Target Coverage
- TreeSelect and Cascader controls share standard text-input min-height (`--joy-control-height-md`) and 16px font size on touch to eliminate iOS zoom.
- Cascader columns stack vertically in mobile sheet layout (`.joy-overlay--sheet .joy-cascader__columns { flex-direction: column }`).
- Transfer switches to vertical stacking with horizontal operation buttons under 640px (`@media (max-width: 640px)`).
- TreeSelect remove tag, clear buttons, node toggles, and Upload remove button enforce hit targets conforming to control height standards.

### 4. Automated Verification Verdict
- `pnpm --filter @joymify/tokens build`: exit code 0
- `pnpm --filter @joymify/tokens test`: 17/17 tests pass (exit code 0)
- `bash scripts/lint-colors.sh`: clean, strict checks pass (exit code 0)
- `node apps/storybook-hub/build.js`: exit code 0
- `pnpm --filter @joymify/svelte test`: 10/10 tests pass (exit code 0)
- `pnpm --filter @joymify/react test`: 10/10 tests pass (exit code 0)

Verdict: **PASS (Clean)**

---

# Quality Gate Review: Phase A (Task A5)

## Scope
- Task A5: Overlay primitive (`openOverlay`, `positionPanel`, `isOutside`, `isSheet`, `SHEET_MAX_WIDTH`) in `packages/svelte/src/lib/overlay-utils.ts` and `packages/react/src/overlay-utils.ts`, React hook `useOverlay` in `packages/react/src/useOverlay.ts`, re-exports in package indices, and test suites in `packages/svelte/test/overlay-utils.test.js` and `packages/react/test/overlay-utils.test.js`.

## Reviewers
- code-reviewer (adversarial review: listener cleanup, capture-phase scroll, outside-click semantics)
- typescript-reviewer (type contracts & ref stability in useOverlay)

## Findings & Verifications

### 1. Overlay Lifecycle & Listener Cleanup
- `openOverlay` attaches 4 event listeners:
  - `doc.addEventListener('keydown', handleKeyDown)`: handles Escape key.
  - `doc.addEventListener('pointerdown', handlePointerDown)`: handles outside clicks.
  - `win.addEventListener('resize', handleResize)`: recalculates position or sheet mode.
  - `win.addEventListener('scroll', handleScroll, { capture: true })`: catches scroll events from any nested scrollable container via capture phase.
- In both internal close (`close()`) and external dispose (`dispose()`), all 4 event listeners are symmetrically detached via `removeEventListener`.
- Double cleanup or race conditions prevented via boolean `disposed` guard.
- Focus restoration: on internal close (`Escape` or outside pointerdown), `anchor.focus()` is invoked prior to `onClose()` notification. Calling `dispose()` directly (e.g. effect unmount) cleans up listeners and classes without triggering focus return or `onClose()`. PASS.

### 2. React Ref Stability & Hook Lifecycle (`useOverlay`)
- `onClose` callback reference stored in `useRef(onClose)` and refreshed on each render, eliminating stale closures without triggering effect re-execution.
- `useEffect` dependencies restricted strictly to `[open]`. Prevents unwanted overlay re-disposal and listener re-binding during caller re-renders.
- Cleanup return cleanly executes `handle.dispose()`. PASS.

### 3. Responsive Sheet Detection & Placement Logic
- `isSheet` reliably triggers when viewport width `< 480px` (`SHEET_MAX_WIDTH`) OR on touch devices via `@media (pointer: coarse)`.
- In sheet mode, `.joy-overlay--sheet` is applied and inline coordinates (`top`, `left`, `minWidth`) are cleared to delegate responsive positioning to CSS (`bottom: 0; left: 0; right: 0; max-height: 70vh`).
- In dropdown mode, `positionPanel` bounds horizontal positioning within viewport padding (8px) and flips vertically (`above: true`, `.joy-overlay--above`) when insufficient clearance below. PASS.

### 4. Parity & Lint Standards
- `cmp packages/svelte/src/lib/overlay-utils.ts packages/react/src/overlay-utils.ts`: byte-identical (exit code 0).
- `bash scripts/lint-colors.sh --strict packages/svelte/src/lib/overlay-utils.ts packages/react/src/overlay-utils.ts packages/react/src/useOverlay.ts`: zero color literals, zero `var()` fallbacks across touched files. PASS.

### 5. Automated Verification Verdict
- `pnpm --filter @joymify/svelte test`: 16/16 tests pass (6 new tests in overlay-utils.test.js) (exit code 0)
- `pnpm --filter @joymify/react test`: 16/16 tests pass (6 new tests in overlay-utils.test.js) (exit code 0)
- `cmp packages/svelte/src/lib/overlay-utils.ts packages/react/src/overlay-utils.ts`: exit code 0
- `bash scripts/lint-colors.sh --strict packages/svelte/src/lib/overlay-utils.ts packages/react/src/overlay-utils.ts packages/react/src/useOverlay.ts`: exit code 0

Verdict: **PASS (Clean)**

---

# Quality Gate Review: Phase A (Task A6)

## Scope
- Task A6: Parity contract script (`scripts/parity-check.mjs`), gate wiring in `scripts/epic-check.sh`, wave-2 test assertions in `packages/tokens/test/wave-2.test.js`.

## Reviewers
- code-reviewer (adversarial review: class regex boundaries, hole replacement safety, contract completeness)
- typescript-reviewer (prop normalization, AST/interface regex robustness, HTMLAttributes inheritance)

## Findings & Verifications

### 1. Parity Contract Completeness & Accuracy
- `COMPONENTS` array contains exactly 21 Wave 2 controls in canonical order.
- `CONTRACT` defines exact framework-neutral prop lists for all 21 components (matching `plan.md` lines 68-88).
- `NORMALISE` maps event handlers and `class` (`onchange` -> `onChange`, `oninput` -> `onInput`, `class` -> `className`, etc.).
- `HTML_INHERITED` accurately credits props inherited when React components declare `extends ... React.<X>HTMLAttributes` (including `Omit<React.InputHTMLAttributes, 'type'>`).

### 2. Class Name Extraction & Hole Sanitization
- `classes(src)` safely replaces variable interpolation holes (`${...}`, `{...}`) with `*` without stripping class literals inside ternary/quoted expressions.
- Dropping tokens ending in `-` or `--` cleanly avoids false positives on dynamic prefixes like `joy-button--` or `joy-form--`.
- Correctly surfaces missing classes from `theme.css` across both frameworks (`joy-color-text-muted`, `joy-border`, `joy-surface-card`, `joy-button--primary`, `joy-form-label-width`, `joy-editor-btn`, etc.), reproducing the documented issues in RXF-054..077 and RXF-094..106.

### 3. Dual-Mode Reporting & Exit Codes
- `--side svelte`: reports Svelte-side undefined classes and missing contract props (exits 1 on current pre-lane codebase, 64 violations found).
- `--side react`: reports React-side undefined classes and missing contract props (exits 1 on current pre-lane codebase, 52 violations found).
- Twin mode (default): reports undefined classes, missing contract props, and bidirectional differences (classes/props only in Svelte or React).
- `--json`: outputs machine-readable JSON structure.
- Markdown table output renders structured, scannable tables.

### 4. Gate Integration & Test Suite
- `scripts/epic-check.sh` incorporates `run_step "parity check" node scripts/parity-check.mjs` immediately following color lint.
- `packages/tokens/test/wave-2.test.js` asserts `scripts/parity-check.mjs` exists, exports `COMPONENTS`, and verifies length is exactly 21.

### 5. Automated Verification Verdict
- `node scripts/parity-check.mjs --side svelte`: exit code 1 (clean failure with 64 actionable violations)
- `node scripts/parity-check.mjs --side react`: exit code 1 (clean failure with 52 actionable violations)
- `pnpm --filter @joymify/tokens test`: 18/18 tests pass (exit code 0)
- `bash scripts/lint-colors.sh`: clean, strict checks pass (exit code 0)
- `node apps/storybook-hub/build.js`: exit code 0
- `pnpm --filter @joymify/svelte test`: 16/16 tests pass (exit code 0)
- `pnpm --filter @joymify/react test`: 16/16 tests pass (exit code 0)

Verdict: **PASS (Clean)**



