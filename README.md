# Joymify Design System (`joy-design`)

Enterprise multi-platform design system and composed Storybook workshop powering the Joymify ecosystem:
- **Quant** (`quant-fe`, `quant-admin-fe`): Svelte 5 + SvelteKit high-density trading UI
- **JoyCoach** (`joy-coach-fe`): Svelte 5 coaching and scoring UI
- **AssetStudio** (`asset-studio`): React 19 visual generation & inspection suite
- **JoyQuest / Portal** (`joymify-portal`): Svelte 5 & React 19 interactive platform

## Architecture
- `packages/tokens`: Style Dictionary W3C design tokens compiled to CSS variables and Tailwind v4 themes.
- `packages/svelte`: Native Svelte 5 components built with Runes (`$props`, `$state`, `$derived`).
- `packages/react`: Accessible React 19 components with full TypeScript support and token bindings.
- `apps/storybook-hub`: Unified Storybook Composition Hub referencing both Svelte (port 6006) and React (port 6007).

## Form Controls (Wave 2)

Wave 2 delivers production-grade, hero-tier Button and form control primitives with full cross-framework parity across `@joymify/svelte` (Svelte 5 Runes) and `@joymify/react` (React 19). All styling is powered strictly by semantic design tokens defined in `packages/tokens`.

### State Matrix & Component Coverage

All 21 form controls support a comprehensive state matrix across Light and Dark themes:

| Component Category | Components | Sizes | States & Modifiers |
| :--- | :--- | :--- | :--- |
| **Action** | `Button` | `sm` (32px), `md` (40px), `lg` (48px) | Variants (`solid`, `outline`, `ghost`, `danger`, `link`), States (`default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`), Modifiers (`block`, `iconOnly`), Slots (`iconStart`, `iconEnd`) |
| **Text Inputs** | `Input`, `InputNumber`, `Mentions`, `DatePicker`, `TimePicker`, `DateRangePicker`, `MarkdownEditor` | `sm`, `md`, `lg` | `default`, `hover`, `focus-visible`, `disabled`, `readonly`, `error`, `success`, `message` helper slot, `prefix` / `suffix` addons |
| **Choice Controls** | `Checkbox`, `Switch`, `RadioGroup`, `Slider`, `Rate`, `Segmented` | `sm`, `md` | `default`, `hover`, `focus-visible`, `active`, `disabled`, `indeterminate` (`Checkbox`), `allowHalf` / `readonly` (`Rate`), roving keyboard tabindex (`RadioGroup`, `Rate`, `Segmented`, `Slider`) |
| **Overlay Controls**| `Select`, `TreeSelect`, `Cascader`, `TimePicker`, `Mentions` | `sm`, `md`, `lg` | `open`, `closed`, `disabled`, `error`, fixed-anchor dropdown panel, mobile bottom-sheet mode |
| **Data Transfer & Files** | `Upload`, `Transfer` | `md` | `Upload` (dragger box, drag-over, file list, remove), `Transfer` (dual listboxes, item selection, move actions, responsive stack) |
| **Form Layout** | `Form`, `FormItem` | - | Layouts (`vertical`, `horizontal`, `inline`), `colon`, `labelAlign`, `labelWidth`, required indicator, error explain (`role="alert"`) |

### Cross-Framework Casing & Prop Parity Rule

Components in `@joymify/svelte` and `@joymify/react` share identical API contracts and emit the same CSS class hierarchy:

- **Event Handlers**: React uses camelCase (`onChange`, `onInput`, `onSelect`, `onRemove`, `onSubmit`, `onClick`). Svelte uses standard lowercase runes/props (`onchange`, `oninput`, `onselect`, `onremove`, `onsubmit`, `onclick`).
- **Class Attribute**: React accepts `className`; Svelte accepts `class`.
- **References & Rest Props**: React components forward element refs (`React.forwardRef`) and spread `...rest`. Svelte components expose bindable refs (`ref = $bindable(null)`) and spread `...rest`.
- **Invariance**: Every other prop name, option interface, and slot behavior is 100% identical between frameworks.

### Overlay Primitive (`openOverlay` & `useOverlay`)

Dropdown-bearing controls (`Select`, `TreeSelect`, `Cascader`, `TimePicker`, `Mentions`) utilize a unified positioning primitive (`packages/svelte/src/lib/overlay-utils.ts` and `packages/react/src/overlay-utils.ts`, plus React's `useOverlay` hook):

- **Anchored Positioning**: Uses `position: fixed` with smart collision detection. Panels drop below the control by default and flip upward when viewport space is constrained.
- **Adaptive Bottom Sheets**: When viewport width is under 480px or when a coarse pointer is detected (`@media (pointer: coarse)`), panels automatically adapt into mobile bottom sheets (`.joy-overlay--sheet`) docked at `bottom: 0`.
- **Accessibility & Focus Trapping**: Closes on `Escape` keypress and returns focus to the trigger anchor element; closes on pointerdown outside the anchor/panel boundary.
- **Containing Block Notice**: Because positioning uses `position: fixed`, ancestors applying `transform`, `filter`, or `perspective` will establish a new containing block.

### Touch Target Ergonomics

- **44px Minimum Hit Area**: Under coarse pointer media queries (`@media (pointer: coarse)`), `--joy-control-height-sm` and `--joy-control-height-md` expand to 44px, ensuring compliant tap targets on mobile touch devices.
- **iOS Zoom Prevention**: All text inputs (`.joy-input`, `.joy-textarea`, `.joy-select`, `.joy-input-number__input`, `.joy-date-picker__input`) enforce a 16px minimum font size on coarse pointers to prevent iOS Safari auto-zooming.

### Quality & Precheck Gates

- **Twin Parity Verification**: `node scripts/parity-check.mjs` verifies that Svelte and React twins match exact prop and class contracts without divergence.
- **Strict Color Token Linting**: `bash scripts/lint-colors.sh` strictly forbids arbitrary hex/rgb color literals and `var(--joy-*, fallback)` fallbacks in all 21 Wave 2 controls.
- **Gate 1 Precheck**: `bash scripts/precheck.sh` runs zero-emoji validation, strict color linting, workspace test suites (`pnpm -r test`), cross-framework parity check, and Playwright UI contracts before code can merge into the release line.
