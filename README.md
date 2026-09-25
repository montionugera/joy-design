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

`node scripts/parity-check.mjs` covers 75 components (`COMPONENTS`: the 21 Wave 2 controls, the 39 Wave 3 components, the 14 Wave 4 landing components and the internal `LandingAction`). It exits non-zero on any of:

- **Class diff**: `joy-*` classes present in only one twin, including CSS custom properties (`--joy-space-gap`) and dynamic prefixes (`joy-progress--status-*`), which are compared but need no theme rule.
- **Undefined class**: a fully spelled class with no rule in `dist/theme.css`; `STRUCTURAL_CLASSES` is a small allowlist of unstyled hook classes, honoured only while both twins carry the hook.
- **Prop diff**: prop names in one twin only, plus the exact `CONTRACT` props for the Wave 2 controls. Handlers compare case-insensitively.
- **Handler casing per side**: Svelte handler props must be lowercase, React handler props camelCase (`HANDLER_CASING_EXCEPTIONS` is empty).
- **`REF_FORWARDING`**: the 33 named React components (the Wave 2 and Wave 3 set plus the 14 landing names) must `forwardRef` and spread `...rest`/`...props`.

Modes: default (twin), `--side svelte`, `--side react` (single-side checks used while a twin is still being built), and `--json` (machine-readable result). Run `node scripts/parity-check.mjs --side react` to see the React-only gaps.

### Gates

- **Strict colour lint**: `bash scripts/lint-colors.sh` hard-fails on foreign colour literals in every file matched by `strict_file_pattern` (the 21 Wave 2 controls, the 39 Wave 3 components and the 14 Wave 4 landing components in both packages, and the shared helper modules) and only warns elsewhere (other waves, for example `Carousel`). `bash scripts/lint-colors.sh --strict <files>` checks an explicit file list; `scripts/test-lint-colors.sh` holds the fixtures.
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

## Landing suite (Wave 4)

Wave 4 brings the 14 landing components to the same standard in both `@joymify/svelte` and `@joymify/react`: `HeroSection`, `CTASection`, `PricingCard`, `PricingMatrix`, `FeatureCard`, `FeatureGrid`, `BentoCard`, `BentoGrid`, `LogoCloud`, `FAQSection`, `StatsSection`, `TestimonialCard`, `SiteFooter` and `LandingPage`. An internal twin, `LandingAction` (not exported from either index), renders the CTA button for `HeroSection` and `CTASection`: without `href` it composes `Button`, with `href` it renders an anchor, and a disabled or loading link drops its `href` and leaves the tab order. The full record of rulings, deviations and deferrals is in `.claude/refined_backlog/F-039-wave-4-landing-suite-hero-and-cta-depth/research/rulings-and-deferrals.md`; the per-issue status of every audit finding is in `research/issue-coverage.md` next to it.

### Props (notable components)

`HeroSection` and `CTASection` share the CTA props. Defaults differ: the hero uses `Get started free` / `Explore documentation`, the CTA band uses `Get started today` / `Contact sales`.

| Prop | HeroSection | CTASection |
| --- | --- | --- |
| `badgeText`, `titleEmphasis`, `subtitle`, `previewSlot` | yes | no |
| `title` | optional | required |
| `description` | no | optional |
| `primaryCtaText`, `secondaryCtaText` | strings, defaults above | strings, defaults above |
| `primaryHref`, `secondaryHref` | anchor instead of button | anchor instead of button |
| `primaryLoading`, `primaryDisabled`, `secondaryDisabled` | boolean, default `false` | boolean, default `false` |
| Click handlers | Svelte `onprimaryclick` / `onsecondaryclick`, React `onPrimaryClick` / `onSecondaryClick` | same |

`titleEmphasis` renders a `<span class="joy-hero__title-emphasis">` in solid `--joy-accent-text` (never a gradient). `previewSlot` is a Svelte `Snippet` and a React `ReactNode`.

| Component | Props worth knowing |
| --- | --- |
| `FeatureGrid` | `layout`: `'lead'` (default) or `'uniform'`. From 900px `lead` is three columns with the first card spanning two and the last card filling its row, for any card count; below 900px it is one column. `columns` (`2`, `3`, `4`, default `3`) applies only with `layout="uniform"`, where it is a maximum (auto-fit). |
| `FeatureCard` | `title`, `description`, `icon`, `badge` (Svelte snippets, React nodes), `linkText`, `linkHref`, `onlinkclick` (Svelte) / `onLinkClick` (React). A handler without `linkHref` renders a `<button>`. |
| `BentoGrid`, `BentoCard` | `BentoCard` takes `colSpan` (1 to 12, default `4`; anything else falls back to 4), `title`, `description`, `badge`, children. Every span from 1 to 12 has a CSS rule; below 900px every card is full width. |
| `PricingCard` | `title`, `price` (required), `description`, `period` (default `/month`), `features`, `ctaText`, `featured`, `badge`, `loading`, `disabled`, `onselect` (Svelte) / `onSelect` (React). |
| `PricingMatrix` | Children card grid by default. Optional data props `columns` (string array) and `rows` (`{ label, values }[]`, where a value is a string or a boolean) render a real table inside a scroll region instead; pass both or neither (a lone data prop is ignored). `rowHeaderLabel` (default `Feature`) and `label` (default `Pricing plans`, names the scroll region). |
| `LogoCloud` | `title`, `logos`. Logos are `currentColor` at `--joy-text-muted` with no invert filter. |
| `FAQSection` | `title`, `subtitle`, `items`, `allowMultiple`. Ids are per instance; closed answers stay in the DOM with `hidden`. |
| `StatsSection` | `stats`. An inline-size container; the column count follows the container width and the stat count. |
| `TestimonialCard` | `quote`, `authorName`, `authorRole`, `avatarSrc`, `avatarInitials`, `rating` (default `5`, clamped to 0 to 5 whole stars). |
| `SiteFooter` | `brandTitle` (default `Joymify`), `brandDescription`, `brandLogo`, `columns` (required, `{ title, links: { label, href, external? }[] }[]`), `copyright` (defaults to the current year), `socialLinks`. It renders a plain `<footer>` with no explicit role, so it is the page `contentinfo` landmark only when it is not nested in `section` or `article`. Svelte `socialLinks` entries may also carry a trusted-input `svgHtml` string; React passes an element through `icon`. |
| `LandingPage` | `palette` (`joymify` default, `obsidian`, `quantum`, `cyberpunk`, `titanium`; a plain `data-palette` attribute, the theme is decided by `data-theme` alone), `interactiveSlot`, deploy and docs handlers (Svelte `ondeployclick` / `ondocsclick`, React `onDeployClick` / `onDocsClick`). Under 768px the header collapses to a menu button that opens a `Drawer`. It renders its own skip link (`.joy-landing-skip`) and its own `<main>`, so render it as the page body and never inside another `<main>`. |

### Casing rule

The Wave 2 and Wave 3 rule applies to every landing component. React handler props are camelCase (`onPrimaryClick`, `onDeployClick`), use `className`, and forward the root element ref with `React.forwardRef` and `...rest`. Svelte handler props are all lowercase (`onprimaryclick`, `ondeployclick`), use `class`, expose the root through `ref = $bindable(null)` and spread `{...rest}`. Every landing Svelte `Props` interface now extends the root element's `HTMLAttributes` (with `class`, `children` and `title` omitted where redefined), so `aria-*` and `data-*` attributes type-check. `LandingAction` is the exception: it is internal and has no rest spread.

### Design rules

- **No slop**: no `&bull;` or middle-dot separators, no gradient text, no glass or `backdrop-filter`, no tracked uppercase eyebrows, no side-stripe borders, no arrows in link text, no identical icon-card grid (`FeatureGrid` leads with one wide card). Stat values use `--joy-accent-text` and rating stars use `--joy-status-warning-fg`.
- **Fluid type**: section headings (hero, CTA, FAQ, the hub features heading) use the display clamps. Card titles use fixed scale tokens (`--joy-font-size-2xl` for feature cards, `--joy-font-size-xl` for bento cards). This is a deliberate deviation from the original "every heading fluid" line: the clamps split words in 150 to 220px cards.
- **Dark treatment is token-driven**: no `[data-theme]` component selectors were added (the phase-b cap of 15 is untouched); surfaces, borders and text flip through the token remap, including for OS-level dark.
- **Layout**: `StatsSection` uses container queries (`@container joy-stats`), so it adapts inside frames and sidebars. `PricingMatrix` cards are a wrapping flex row. `FeatureGrid` `lead` spans keep every row edge to edge. Viewport breakpoints: 899 (bento and feature grids collapse to one column; from 900 the wide layouts apply), 767 (LandingPage header collapses to a menu button and Drawer, footer padding tightens), 480 to 767 (footer link groups pair up in two columns), 639 (footer bottom row stacks), 479 (hero and CTA action buttons stack, CTA band padding shrinks) and 480 (the Drawer is the Wave 3 bottom sheet). The 767 and 639 values are deliberate, so 768 and 640 keep the wide layout.

### Generated hub blocks

`apps/storybook-hub` has two landing views: `#landing-preview` (the full-page simulator: generated from the real components except the hand-written header, toolbar and scripts, plus a hub-only features heading and pricing section around the `LandingPage` output) and `#landing-blocks` (Bento and Landing Suite blocks). Both are produced by SSR-rendering the Svelte components:

```bash
node apps/storybook-hub/scripts/gen-landing-blocks.mjs --write   # regenerate
node apps/storybook-hub/scripts/gen-landing-blocks.mjs --check   # fail on drift
```

**Regenerate after any landing component markup change.** `packages/svelte/test/hub-landing-blocks.test.js` fails on drift, so a forgotten `--write` turns `pnpm -r test` red. The simulator frame-width toggle only changes the frame width; media queries follow the real browser window.

### Tests, gates and screenshots

- **Unit tests**: `pnpm -r test`. Landing coverage lives in `packages/svelte/test/landing-*.test.js`, `packages/svelte/test/hub-landing-blocks.test.js` and the React equivalents. Svelte tests render through `packages/svelte/test/helpers/render-svelte.js` and React tests load TSX through `packages/react/test/helpers/load-tsx.js`.
- **Playwright**: `PLAYWRIGHT_PORT=6120 pnpm --filter storybook-hub exec playwright test --workers=3`. Landing specs in `apps/storybook-hub/tests/`: `landing-contracts` (hub views at 375 and 1280, light and dark), `landing-component-page` (real React and Svelte components on `dist/theme.css` only, no hub CSS and no reset, so the hub cannot mask a component defect), `landing-cta-contrast`, `landing-stats-*` (grid and overflow), `landing-blocks-*` (layout and states), `landing-simulator-t2`, `landing-layout-t1`, `landing-pricing-grid` and `landing-button-states`. Set a distinct `PLAYWRIGHT_PORT` per worktree or a server from another worktree is silently reused.
- **Screenshots**: `F039_SCREENS=1 PLAYWRIGHT_PORT=6120 pnpm --filter storybook-hub exec playwright test tests/screens-f039.spec.ts --project=desktop-chrome` writes the PNGs to `.claude/refined_backlog/F-039-wave-4-landing-suite-hero-and-cta-depth/research/screens/`.
- **Parity gate**: `COMPONENTS` and `REF_FORWARDING` in `scripts/parity-check.mjs` list the 14 landing names, and the new `SVELTE_REF_REST` list (checked by `checkSvelteRefRest`) requires each listed Svelte component to destructure `ref = $bindable(null)`, spread `{...rest}` and bind the root to `ref`.
- **Strict colour lint**: `strict_file_pattern` in `scripts/lint-colors.sh` now includes the 14 landing names and the internal `LandingAction` helper, so all 30 landing files hard-fail on foreign colour literals.

### Breaking and visible changes (Wave 4)

- **`titleGradient` is removed from `HeroSection`; use `titleEmphasis`** in both twins, with no alias (an alias would keep the banned gradient API alive). Consumers that still pass `titleGradient` get no emphasis and no error: the old prop is spread onto the root element as an unknown attribute, so search your code for the name and rename it.
- **`.joy-button--glass` is removed**, together with its hover rule. Use `joy-button--outline`. Markup that still carries the class silently loses its styling.
- **Any `.joy-button` with `aria-disabled="true"` now looks disabled and gets `pointer-events: none`**, in every component, not only the landing suite (it used to look enabled). A consumer using the focusable-disabled pattern (`aria-disabled="true"` on a button that shows a tooltip) no longer receives hover or click events on it; keep such a button on `disabled` semantics or move the tooltip to a wrapper.
- **`FeatureGrid` default changed from the uniform column grid to `layout="lead"`** (the first card is wider; the last card fills its row). To keep the old look, pass `layout="uniform"` together with `columns`.
- **React `LogoCloud` `forwardRef` element type changed from `HTMLDivElement` to `HTMLElement`** (the root element is now a `<section>`, so `HTMLDivElement` no longer matches). Update the `ref` typing in consumers, for example `useRef<HTMLElement>(null)`.
- **`SiteFooter` no longer sets `role="contentinfo"`**: the implicit landmark applies unless the footer is nested in `section` or `article`. Footer links have a 44px minimum height at every pointer type.
- **`PricingMatrix` gained optional `columns` / `rows` data props** (additive; the children card grid is unchanged).
- **CTA band restyle**: a raised surface with an accent wash and a strong border in both themes. The light band is no longer navy.
- **`LandingPage` renders its own `<main>` and a skip link**: do not nest it inside another `<main>`.
- **Svelte landing `Props` extend the element attributes**, so extra attributes are typed and forwarded to the root.
- **Card titles use fixed scale tokens** instead of the display clamps.

## Storybook hub (Wave 5)

`apps/storybook-hub/build.js` generates the hub page (`apps/storybook-hub/dist/index.html`): stylesheet, 38 manifest views and the runtime script. Wave 5 rebuilt its chrome for phones and dark mode.

### Layout tiers

| Width | Chrome |
| --- | --- |
| over 900px | Sidebar always shown; topbar has the theme toggle and the Svelte/React switcher. |
| 900px and below | The sidebar becomes an off-canvas drawer (`#hub-sidebar`, `z-index: var(--joy-z-drawer)`) behind a scrim. The topbar shows the menu button (`aria-controls`, `aria-expanded`) and the brand. While open, Tab stays inside the drawer; Escape closes it and returns focus to the menu button. A closed drawer is `visibility: hidden`, so its links leave the tab order. |
| 767px and below | The topbar is menu button, brand and theme toggle only. The framework switcher moves into the drawer. Content uses 16px gutters, and token and props tables scroll sideways inside labelled, focusable regions (`.hub-scroll-x`). |
| 480px and below | The theme toggle is icon-only. It keeps its `aria-label`. |

The menu button, drawer close, theme toggle (on phones) and the drawer's framework buttons are at least 44px square. Framework buttons carry `data-framework` and `aria-pressed`, and `setFramework()` keeps both copies in sync.

### Theme and colour

- **Theme is resolved before the first paint.** An inline `<head>` script sets `data-theme` from `localStorage['joy-theme']`, or from `prefers-color-scheme` when nothing is saved. The toggle stores the choice; its label reads "Dark theme" / "Light theme" and its `aria-label` says "Switch to dark theme" / "Switch to light theme".
- **Token-only colours.** The hub stylesheet uses `--joy-*` tokens, plus `--hub-*` chrome aliases (`--hub-sidebar-bg`, `--hub-topbar-bg`, `--hub-chrome-border`, `--hub-code-bg`, `--hub-code-fg`, `--hub-drawer-edge`, `--hub-scrim`). The drawer scrim is `--hub-scrim` at 55% (the inverse surface in light, the darkest neutral in dark, so it always dims). The aliases are defined once in `:root` and once in `[data-theme="dark"]`, and every one resolves to a token. There are no `div[style*=...]` dark-mode patches. `bash scripts/lint-colors.sh --strict apps/storybook-hub/build.js` reports 0.
- **No slop in the chrome.** There is no glass (`backdrop-filter`), gradient text, tracked uppercase labels, arrow suffixes, middle dots or numbered markers. Font sizes use `--joy-font-size-*`, z-index uses `--joy-z-*`, and transitions run 150-250ms on `--joy-duration-*`. They switch off under `prefers-reduced-motion`.

### Heroes and the particle field

- The landing view (`#overview`) opens with a real `HeroSection` render. Its "Browse components" and "Read the tokens" buttons are wired in `build.js`.
- The kinetic hero in `#landing-blocks` is also a `HeroSection` render, placed over a decorative canvas. Both come from `scripts/gen-landing-blocks.mjs`, which now owns a fourth region, `overview-hero`. Regenerate with `--write` and check with `--check`, as for the other regions.
- The particle canvas reads `--joy-accent-default`, `--joy-accent-hover`, `--joy-accent-active` and `--joy-text-muted` through `window.hubKineticPalette()`, and re-reads them whenever `data-theme` changes.
- Under reduced motion the canvas draws one still frame. On a coarse pointer the canvas is hidden and a still accent gradient shows instead.
- Frames only run while an `IntersectionObserver` sees the hero and the tab is visible, capped at 60fps. The field never paints under the hero text or CTAs.
- One component fix landed with this wave: `.joy-radio-group` gained `flex-wrap: wrap`, because a horizontal group of long options ran off a 375px screen.

### Contracts and screenshots

`apps/storybook-hub/tests/contracts.spec.ts` covers the hub in these contracts. Most run on the `desktop-chrome` project and set their own viewports.

- **Contract 5**: the kinetic hero is a `HeroSection`; the palette follows the theme; no paint sits under the hero text; the field is still under reduced motion, hidden on a touch pointer, and schedules no frames while off screen.
- **Contract 6**: every manifest view at 375px and 1280px, in light and dark. It checks for no document or `.main` horizontal overflow, no element past the viewport, no content cut off inside an `overflow: hidden` box, and no `background-clip: text`. It writes one screenshot per view, theme and width to `apps/storybook-hub/test-results/` (gitignored).
- **Contract 7**: `data-theme` is right at the first animation frame for an OS light or dark preference, and a saved choice wins after reload.
- **Contract 8**: topbar and sidebar text has a contrast ratio of at least 4.5:1 in both themes, at 375px and 1280px.
- **Contract 8b**: card outlines stay visible against the canvas and the card surface in both themes; Contract 8 also checks that the drawer scrim darkens the page in both themes.
- **Contract 9**: phone chrome, 44px hit areas, the drawer focus trap and the framework switcher in the drawer.
- **Contract 9b**: the market filter is 16px on phones, so iOS does not zoom on focus.
- **Contract 10**: the slop sweep over every view, plus reduced motion.

Run them:

```bash
node apps/storybook-hub/build.js
cd apps/storybook-hub && PLAYWRIGHT_PORT=6122 ./node_modules/.bin/playwright test tests/contracts.spec.ts --project=desktop-chrome
F040_SCREENS=1 PLAYWRIGHT_PORT=6122 ./node_modules/.bin/playwright test tests/screens-f040.spec.ts --project=desktop-chrome
```

The last command writes the 16 acceptance screenshots (landing, primitives, forms and data display, at 375px and 1280px, light and dark) to `.claude/refined_backlog/F-040-wave-5-storybook-hub-mobile-layout-dark/research/screens/`. The per-issue status of the hub audit (HUB-001 to HUB-070), including the deferrals, is in `research/issue-coverage.md` in the same folder.
