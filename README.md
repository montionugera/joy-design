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

## Display, Feedback, Navigation & Overlay (Wave 3)

Wave 3 brings the 39 display, feedback, navigation and overlay components plus the shared chart engine (`chart-core.ts`) to the same standard as Wave 2, in both `@joymify/svelte` and `@joymify/react`. Every component in this wave guarantees:

- **Tokens only**: no hex/rgb/hsl literal and no `var(--joy-*, <foreign fallback>)` in the component files or their CSS (`packages/tokens/build.js` is the single source of truth for every `joy-*` class both twins render).
- **Dark mode through tokens**: no per-component dark overrides; surfaces, borders and status fills flip with `[data-theme]`.
- **44px touch targets** under `@media (pointer: coarse)` for pagination, tab, menu, dropdown, close and toolbar controls (tag close is a documented exception, see Known deviations).
- **Keyboard and ARIA**: roles, names and keyboard operation listed in the table below.
- **No banned patterns**: no side-stripe borders, no decorative `backdrop-filter`, no tracked uppercase eyebrow labels, no HTML-entity or Unicode-glyph icons (icons come from `@joymify/icons`).

### Components and contract points

Handlers follow the casing rule (Svelte `onclose`, React `onClose`). All 19 React components that used to swallow refs now `forwardRef` and spread `...rest` onto the root element.

| Component | Contract |
| :--- | :--- |
| `Alert` | `role="alert"`, per-variant status icon, full 1px status border (no side stripe). `closable` + `onclose` / `onClose`; uncontrolled (hides itself, then calls the handler); close button `aria-label="Dismiss alert"` |
| `Anchor` | `role="navigation"`, active link `aria-current="location"`, coarse-pointer 44px links |
| `Avatar` | Image error falls back to initials; ring colour is `--joy-surface-canvas` in both themes |
| `AvatarGroup` | `items` (declarative list) and `max`: at most `max` avatars then one `joy-avatar-group__overflow` "+N" avatar. In Svelte `max` applies to `items` only (snippet children cannot be sliced) |
| `Badge` | Status and brand variants from `--joy-status-*` and `--joy-accent-subtle` / `--joy-accent-text` (the brand badge is not navy) |
| `Breadcrumb` | `<nav aria-label="Breadcrumb">`, last crumb `aria-current="page"`, horizontal scroll under 768px, coarse 44px links |
| `Divider` | Vertical divider carries `role="separator"` and `aria-orientation="vertical"` in both twins |
| `Drawer` | `role="dialog"` `aria-modal`, close button `aria-label="Close drawer"`, scroll lock + focus trap + Escape (topmost only); bottom sheet at 480px and below |
| `Dropdown` | Trigger `aria-haspopup="menu"` `aria-expanded`, `role="menu"` / `menuitem` panel, arrow-key focus, positioned through `openOverlay` / `useOverlay`; coarse 44px items |
| `EmptyState` | Surface `--joy-surface-card`; React forwards ref and rest |
| `Flex`, `Space` | Layout only. `Space` exposes its gap as `--joy-space-gap`. A responsive `Flex` direction prop is deferred |
| `Image`, `ImagePreview` | Split into two files in both packages. `Image` shows a hover/focus preview overlay; `ImagePreview` is a modal-layer dialog (`aria-label` overridable) with a `role="toolbar"` of labelled buttons (Zoom in, Zoom out, Rotate left, Rotate right, Reset, Close) and arrow-key navigation |
| `MarkdownViewer` | Copy button `aria-label="Copy code to clipboard"` with focus ring and live status; blockquote is a full border on `--joy-accent-subtle`; `hr` uses `--joy-border-default` |
| `Menu` | `role="menu"` / `menuitem`, active item `aria-current="page"`, roving `tabindex`, ArrowUp/ArrowDown/Home/End; coarse 44px items |
| `Message`, `Notification`, `Toast` | `z-index: var(--joy-z-toast)`, tone classes on icons, Notification/Toast close button `aria-label="Dismiss notification"` with 44px area; Message and Notification auto-dismiss through the shared `auto-dismiss.ts` (one `onClose`, timer does not restart on re-render) |
| `MetricTile`, `StatCard`, `Statistic` | Sentence-case muted labels, SVG trend icons (`TrendingUp` / `TrendingDown`), `StatCard` `trend: 'up' \| 'down' \| 'flat'` (derived from the delta text through `delta-utils.ts` when omitted; `deltaTone` only sets colour) |
| `Modal` | `role="dialog"` `aria-modal`, unique title id, close `aria-label="Close dialog"`, scroll lock + focus trap + Escape (topmost only) + focus return to the opener; full-bleed with sticky footer at 480px and below |
| `Pagination` | Windowed page list with ellipsis, `Page N` labels, `aria-current="page"`, chevron icons, out-of-range `current` clamped; compact mode (prev, current, next) at 480px and below; page-size select uses `joy-pagination__size` |
| `Popconfirm` | `role="alertdialog"`, confirm button `joy-button--solid`, Escape and outside click through the overlay primitive; `open` is bindable in Svelte with `onopenchange`, React takes `onOpenChange` |
| `Progress` | `role="progressbar"` with `aria-valuenow/min/max` on the root element, non-finite values clamped to 0, default fill `--joy-accent-text` |
| `Result` | Status icon colours from `--joy-status-*` |
| `Skeleton` | One wrapper element (one `role="progressbar"`) for multi-line text; consumer `style` merges after the computed size; shimmer stops for `prefers-reduced-motion` |
| `Spin` | `role="status"` `aria-busy`, tip text `--joy-accent-text`, slowed (not stopped) under reduced motion; `className` lands on the root |
| `Splitter` | `role="separator"` with `aria-orientation`, `aria-valuenow/min/max` (the enforced bounds), `tabindex="0"`, arrow keys plus Home/End; panes sized by `--joy-splitter-size`; stacks vertically under 640px |
| `Steps` | `role="navigation"`, `aria-current="step"` on the item at `current`, vertical under 768px |
| `Table` | Sortable header: `tabindex="0"`, Enter/Space, `aria-sort`; `variant: 'stack' \| 'scroll'` (scroll variant is a keyboard-focusable `role="region"` with a sticky first column and `isolation: isolate`); hover uses `--joy-accent-subtle` |
| `Tabs` | `role="tablist"` / `tab` / `tabpanel` with generated ids and `aria-controls` / `aria-labelledby`, roving `tabindex`, ArrowLeft/ArrowRight/Home/End, horizontal scroll with fade edge, coarse 44px |
| `Tag` | Close control is a 24px visual with a 34x44 hit box (see Known deviations); checkable tags have a `:focus-visible` ring; primary tag text uses `--joy-accent-text` |
| `Timeline` | Connector and dot from `--joy-border-default` / tokens, no inline colour |
| `Tooltip` | Trigger linked with `aria-describedby`; tap/click toggles it on touch devices; Escape and outside click dismiss |
| `BarChart`, `LineChart`, `CandlestickChart` | HUD text through token classes (`joy-chart__hud-*`), wraps on phones, canvas container `role="img"` with `aria-label`, plus an accessible summary table (capped) |
| `chart-core.ts` | Palette read from CSS variables and repainted on theme change (see Charts) |

### Overlay layer

Only some of this wave's overlays use the shared primitives in `overlay-utils.ts`:

- **Positioned panels (`openOverlay` in Svelte, `useOverlay` in React):** Popconfirm and Dropdown (and, from Wave 2, Select, TreeSelect, Cascader, TimePicker, Mentions).
- **Dialogs (`lockBodyScroll`, `trapFocus`, `registerDialog`):** Modal, Drawer and ImagePreview. Svelte calls the three functions directly; React goes through `useDialog` in `dialog-hooks.ts`.
- **Token scale only (no primitive):** Tooltip is CSS-positioned (`.joy-tooltip { position: absolute; z-index: var(--joy-z-tooltip) }`); Message, Notification and Toast are fixed-position stacks using `--joy-z-toast`. None of them calls `openOverlay` / `useOverlay`.

All of them use the token scale below.

| Token | Value | Layer |
| :--- | :--- | :--- |
| `--joy-z-base` | 0 | Page content |
| `--joy-z-sticky` | 100 | Sticky table column and header |
| `--joy-z-backdrop` | 900 | Reserved (no rule uses it: the backdrop is the panel's parent) |
| `--joy-z-dropdown` | 1000 | Dropdown, overlay primitive panels |
| `--joy-z-drawer` | 1020 | Drawer |
| `--joy-z-modal` | 1050 | Modal, ImagePreview mask |
| `--joy-z-popover` | 1060 | Popconfirm (above Modal), ImagePreview toolbar |
| `--joy-z-toast` | 1100 | Message, Notification, Toast (above Modal and Popconfirm) |
| `--joy-z-tooltip` | 1200 | Tooltip |

- **Popconfirm above Modal**: 1060 is greater than 1050, so a Popconfirm opened from inside a Modal renders on top of it. The hub contract measures this in a real browser.
- **Dialog stack**: Modal, Drawer and ImagePreview call `lockBodyScroll()`, `trapFocus(el)` and `registerDialog()` (from `overlay-utils.ts`). `registerDialog()` returns a handle with `isTopmost()` and `unregister()`, so Escape closes only the topmost dialog. The handler also calls `preventDefault()` so a popover inside a dialog closes alone.
- **Fallback positioning**: panels not (yet) placed by `openOverlay` keep an absolute fallback (`.joy-dropdown:not(.joy-overlay)`, `.joy-popconfirm__panel:not(.joy-overlay)`), so static hub demos and server-rendered markup are not laid out in flow.
- **Mobile**: Modal is full-bleed with a sticky footer and safe-area insets at 480px and below; Drawer becomes a bottom sheet at 480px and below.
- **Scrim**: `color-mix(in srgb, var(--joy-color-navy-900) 60%, transparent)` (85% for ImagePreview). The spec named `--joy-surface-overlay`, but that token is white in light mode, so the scrim would not dim the page. `--joy-color-navy-900` is near-black in both themes. No `backdrop-filter`.
- **Motion**: Modal and Drawer have an enter animation only (see Known deviations); reduced motion is honoured by the Wave 1 global block.

### Charts

- `readChartPalette(canvas)` (exported from `chart-core.ts`) reads the theme once per render through `getComputedStyle`. `ChartPalette` fields: `textSecondary`, `textPrimary`, `bull`, `bear`, `border`, `accent`, `onAccent`. Bull/bear reuse `--joy-status-success-fg` / `--joy-status-danger-fg`; there is no separate chart token family.
- **Theme repaint**: `chart-core` installs a `MutationObserver` on `document.documentElement` (attribute `data-theme`), so a theme flip repaints without any event. A `joy-theme-change` event on `window` also triggers a repaint (nothing in the repo dispatches it; it is available to hosts that switch themes another way).
- **HUD**: token classes `joy-chart__hud`, `joy-chart__hud-item`, `joy-chart__hud-label`, `joy-chart__hud-value` (and `--accent`, bull, bear modifiers) instead of inline colours; solid card background, no blur; wraps under 480px.
- **Accessible summary**: each chart's canvas container is `role="img"` with an `aria-label`, and a visually hidden summary table (capped window from `summaryWindow`) carries the values.

### Shared helpers (byte-identical between packages)

These files exist in both `packages/svelte/src/lib/` and `packages/react/src/` and must stay identical (`cmp` exits 0):
`overlay-utils.ts`, `chart-core.ts`, `delta-utils.ts`, `auto-dismiss.ts`, `roving-utils.ts`, `pagination-utils.ts`, `splitter-utils.ts`, `table-utils.ts`.
Their tests (`overlay-utils`, `chart-core`, `roving-utils`, `pagination-utils`, `splitter-utils`, `table-utils` `.test.js`) are the same file in both packages apart from the import path line. `delta-utils.ts` and `auto-dismiss.ts` are covered inside `components.test.js`. Byte-identity is asserted by tests in both packages (a missing or diverged copy fails `pnpm -r test`); the twin diff in `scripts/parity-check.mjs` covers the components. `dialog-hooks.ts` (`useDialog`, `useOpener`, `useMergedRef`) is React-only; its Svelte counterpart for the focus-return part is `dialog-opener.ts` (`createOpenerTracker`, driven by `$effect.pre`), so an autofocused child cannot become the remembered opener in either package.

### Casing rule and the parity gate

The Wave 2 rule is unchanged: Svelte handler props are all lowercase (`onclose`, `onchange`, `onselect`, `onsort`, `onopenchange`) and use `class`; React handler props are camelCase (`onClose`, `onChange`, `onSelect`, `onSort`, `onOpenChange`) and use `className`.

`node scripts/parity-check.mjs` covers 60 components (`COMPONENTS`). It exits non-zero on any of:

- **Class diff**: `joy-*` classes present in only one twin, including CSS custom properties (`--joy-space-gap`) and dynamic prefixes (`joy-progress--status-*`), which are compared but need no theme rule.
- **Undefined class**: a fully spelled class with no rule in `dist/theme.css`; `STRUCTURAL_CLASSES` is a small allowlist of unstyled hook classes, honoured only while both twins carry the hook.
- **Prop diff**: prop names in one twin only, plus the exact `CONTRACT` props for the Wave 2 controls. Handlers compare case-insensitively.
- **Handler casing per side**: Svelte handler props must be lowercase, React handler props camelCase (`HANDLER_CASING_EXCEPTIONS` is empty).
- **`REF_FORWARDING`**: the 19 named React components must `forwardRef` and spread `...rest`/`...props`.

Modes: default (twin), `--side svelte`, `--side react` (single-side checks used while a twin is still being built), and `--json` (machine-readable result). Run `node scripts/parity-check.mjs --side react` to see the React-only gaps.

### Gates

- **Strict colour lint**: `bash scripts/lint-colors.sh` hard-fails on foreign colour literals in every file matched by `strict_file_pattern` (the 21 Wave 2 controls, the 39 Wave 3 components in both packages, and the shared helper modules) and only warns elsewhere (landing sections, other waves). `bash scripts/lint-colors.sh --strict <files>` checks an explicit file list; `scripts/test-lint-colors.sh` holds the fixtures.
- **Unit tests**: `pnpm -r test` (icons, tokens, svelte, react).
- **Playwright contracts**: `apps/storybook-hub/tests/display-contracts.spec.ts` (no real horizontal overflow at 375px in light and dark, Popconfirm above Modal with Escape closing it first, Drawer as a bottom sheet at 375px and a side panel at 1280px, 44px pagination/tab/menu/dropdown/close controls on the coarse-pointer project, no purple or hard-coded white, no side stripes, chart HUD contrast of 4.5:1 or more, Pagination compact and windowed modes). Run `PLAYWRIGHT_PORT=6117 pnpm --filter storybook-hub exec playwright test`; the config defaults to port 6116, so set a different `PLAYWRIGHT_PORT` per worktree or an already-running server from another worktree is silently reused.
- **Screenshots**: `F038_SCREENS=1 PLAYWRIGHT_PORT=6117 pnpm --filter storybook-hub exec playwright test tests/screens-f038.spec.ts --project=desktop-chrome` writes 44 PNGs (11 names x light/dark x 375/1280) to `.claude/refined_backlog/F-038-wave-3-display-feedback-navigation-and-o/research/screens/` (index in that folder's `README.md`).
- **Release gates**: `bash scripts/precheck.sh` (Gate 1: emoji scan over tracked and untracked files, colour lint, `pnpm -r test`, parity, hub build and Playwright) and `bash scripts/epic-check.sh`.

### Hub views

The storybook hub has two aspect views for this wave: **Data Display & Feedback** (`#view-data-display-feedback`: Alert, Badge, Tag, Avatar, Image, ImagePreview, Statistic/MetricTile/StatCard, Progress, Skeleton, Spin, EmptyState, Result, Toast/Message/Notification, Table, charts) and **Navigation & Workflow** (`#view-navigation-workflow`: Pagination, Tabs, Menu, Breadcrumb, Steps, Anchor, Timeline, Splitter, overlay openers for Modal, Drawer, Popconfirm, Dropdown and Tooltip, MarkdownViewer).

### Breaking changes and migration notes

- **Svelte `ImagePreview` handler props renamed** (breaking; the component shipped in release 2.16): `onClose` becomes `onclose` and `onChange` becomes `onchange`, to follow the casing rule. Update every Svelte consumer that passes them. React `ImagePreview` keeps `onClose` / `onChange`.
- **React `Image` no longer has a `placeholder` prop** (it was never rendered). `Image` now lives in its own `Image.tsx`, matching Svelte, and is exported from the package index.
- **Tokens changed globally in dark mode** (values live in `packages/tokens/scripts/ramps.mjs`, `tokens.json` and `dist/theme.css` are generated from them): `--joy-border-subtle` is now `#22324b` (was navy-700, 1.05:1 against the card, now 1.34:1) and `--joy-status-{success,warning,danger,info}-bg` are now `#0d2d0f`, `#3a1e00`, `#470d0e`, `#0b2741` (were the near-black 900 stops). Anything in the ecosystem that uses these tokens in dark mode gets slightly lighter hairlines and status fills; status text stays at 7.5:1 or better.
- **Progress** default fill is now `--joy-accent-text` in both twins (the Svelte scoped style used the navy `--joy-color-primary`); the `role="progressbar"` attributes moved to the root element.
- **Message, Notification, Toast** now stack at `--joy-z-toast` (1100), above Modal (1050) and Popconfirm (1060), and below Tooltip (1200).
- **Close labels**: Notification and Toast close buttons are labelled "Dismiss notification" (was "Close notification" / raw text); Modal and Drawer close buttons are icon buttons labelled "Close dialog" / "Close drawer".
- **Markup and class changes** for consumers that style internals or query the DOM: Alert (icon, close button, full border instead of a 4px stripe, `joy-alert__close`); Skeleton with `lines > 1` renders one wrapper around plain line elements (the wrapper no longer carries `joy-skeleton` classes); Pagination (windowed list, ellipsis spans, chevron icons, `Page N` labels, page-size select class `joy-pagination__size`); Tabs and Menu now carry `role="tablist"` / `role="menu"` with roving `tabindex`; Popconfirm panel is `role="alertdialog"` and its confirm button is `joy-button--solid` (the old `joy-button--primary` class had no CSS); Spin puts `className` on the root and removes inline styles; Notification, Toast and ImagePreview use classes instead of inline styles.
- **Removed classes** (for consumers that query the DOM): Svelte `ImagePreview` no longer renders `joy-nav-btn` / `joy-preview-btn` (now `joy-image-preview-nav`, `joy-image-preview-btn`); React `joy-image-wrapper` no longer comes from `ImagePreview.tsx` (it is rendered by `Image.tsx`, as in Svelte); `joy-button--primary` on Popconfirm (see above). Everything else in the wave keeps its class names or adds new ones.
- **Additive**: Alert `closable` / `onclose` / `onClose`, StatCard `trend`, Table `variant` (`'stack'` is the default, so existing Table usage is unchanged), AvatarGroup `items`, Popconfirm `onopenchange` (Svelte) / `onOpenChange` (React), React `Form` emits `joy-form--<layout>` like Svelte.

### Known deviations and deferred gaps

Rationale for each lives in `.claude/refined_backlog/F-038-wave-3-display-feedback-navigation-and-o/research/rulings-and-deferrals.md`; the per-issue status of all 203 audit findings is in `research/issue-coverage.md` next to it.

- **Tooltip, Message, Notification and Toast do not use the overlay primitive** (spec item 3 listed them): they only use the `--joy-z-*` tokens. Tooltip therefore is not viewport-aware and can be clipped by an `overflow: hidden` ancestor (for example the Table scroll region).
- **No exit animation** for Modal and Drawer: they render conditionally, so only the enter animation exists (spec asked for enter and exit).
- **iOS scroll lock (SVD-097)**: `lockBodyScroll` only sets `overflow: hidden` on the body; the `position: fixed` scroll-position technique is not implemented.
- **Tag close hit area is 34x44, not 44x44**: it grows toward the right edge only, because a 44px-wide hit box would overlap neighbouring tags (8px gap). Alert and Toast close buttons get the full 44x44.
- **Menu keeps `role="menu"`** even in navigation-style usage (the brief and audit required it); screen readers announce a menu for site navigation. Consumers can override `role` through `...rest`.
- **`Flex` responsive direction** (SVD-032) is a feature request and is deferred.
- **No TypeScript gate**: the repo has no `tsc` / `@types/react`, and `packages/react/package.json` `types` points at a missing file, so React typings are not compile-checked.
