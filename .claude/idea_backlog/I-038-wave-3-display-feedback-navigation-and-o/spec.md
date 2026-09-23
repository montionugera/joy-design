---
title: "Wave 3: display, feedback, navigation and overlay components — dark mode, mobile, z-index, states, parity"
id: I-038
status: idea
epic: E-001
---

# Wave 3: display, feedback, navigation, overlays (product register)

Parent: E-001. Depends on Waves 1–2 (tokens, Button, overlay primitive). Evidence: `research/audit-svelte-display.md` (98 issues, 27 P0), `research/audit-react-display.md` (105 issues, 24 P0), `research/audit-standards.md`. Every SVD- and RXD- issue must be resolved or deferred with a reason.

Components (both frameworks plus CSS in `packages/tokens/build.js`): Alert, Anchor, Avatar, AvatarGroup, Badge, Breadcrumb, Divider, Drawer, Dropdown, EmptyState, Flex, Image, ImagePreview, MarkdownViewer, Menu, Message, MetricTile, Modal, Notification, Pagination, Popconfirm, Progress, Result, Skeleton, Space, Spin, Splitter, StatCard, Statistic, Steps, Table, Tabs, Tag, Timeline, Toast, Tooltip, BarChart, LineChart, CandlestickChart, `chart-core.ts`, `overlay-utils.ts`.

## Problem

Chart HUDs and Breadcrumb render navy-on-navy (1.00:1) in dark; Alert/Badge/EmptyState/MetricTile/Tabs/Dropdown/Tooltip have no dark rules; Alert and Toast use banned side stripes; Modal/Drawer/ImagePreview use decorative blur and do not use the focus trap and scroll lock that already exist in `overlay-utils.ts`; z-indices are magic numbers so Popconfirm (100) sits behind modals; Pagination/Tabs/Menu/Tag close/ImagePreview toolbar are under 44px; Table sort and Splitter drag are mouse-only; chart axis text is `#94a3b8`/`#64748b` at 2.6–3.7:1; 19 React components swallow refs and rest props; callbacks drift in casing.

## Scope (in)

1. **Semantic tokens only** in every listed component and its CSS; chart-core reads colors from CSS variables on the canvas element (`getComputedStyle`) once per render and re-reads on theme change; axis/HUD text uses `--joy-text-secondary` (≥ 4.5:1 both themes).
2. **Dark mode designed** for every component: raised surfaces, `--joy-border-default`, status `bg/fg/border` triads for Alert, Badge, Tag, Toast, Notification, Message, Result, Progress; Skeleton shimmer uses a tinted neutral pair; Table zebra/hover/selected rows use surface tokens; no `#fff` cards.
3. **Overlay layer** (Modal, Drawer, Popconfirm, Dropdown, Tooltip, ImagePreview, Message, Notification, Toast): shared primitive from Wave 2 (`overlay-utils.ts` / `useOverlay`); `--joy-z-*` scale only; focus trap + body scroll lock + Escape + outside click + focus return in Modal/Drawer/Popconfirm/ImagePreview; backdrop is `--joy-surface-overlay` at 60% with no blur (ImagePreview may keep ≤ 4px); enter/exit at 200ms with reduced-motion fallback; Drawer is a bottom sheet under 480px; Modal is full-bleed under 480px with a sticky footer.
4. **Mobile**: Pagination collapses to prev/next + current under 480px with 44px buttons; Tabs scroll horizontally with a fade edge and ≥ 44px targets; Menu items ≥ 44px; Tag close ≥ 24px visual with 44px hit; Table keeps the existing responsive stack strategy but on semantic tokens and adds a `scroll` variant with sticky first column; Splitter becomes vertical stacking under 640px.
5. **Keyboard and ARIA**: Table sort buttons with `aria-sort`; Splitter with `role=separator`, `aria-valuenow`, arrow keys; Tabs roving tabindex; Steps and Breadcrumb `aria-current`; Progress `role=progressbar`.
6. **Slop removal**: no side stripes (Alert, Toast, MarkdownViewer blockquote use full border + status bg), no tracked uppercase labels (MetricTile, StatCard use `--joy-text-muted` sentence case), no decorative blur, no `→` in link text.
7. **Parity**: React forwards refs and spreads rest props in all 19 named components; casing rule applied; `scripts/parity-check.mjs` extended to these components; `Image` split out of `ImagePreview` in React to match Svelte.
8. Hub stories for state × theme where missing.

## Out of scope

Form controls (Wave 2), landing (Wave 4), hub chrome (Wave 5).

## Acceptance criteria

- [ ] `lint-colors.sh --strict` passes for all listed files; `parity-check.mjs` zero divergences for them.
- [ ] `pnpm -r test` passes with new tests: overlay stacking order asserts `z-index` tokens; chart-core unit test asserts axis colors resolve from CSS variables in both themes; keyboard tests for Table sort, Tabs, Splitter.
- [ ] Playwright contract: at 375px light and dark, "Data Display & Feedback" and "Navigation & Workflow" hub views have zero horizontal overflow; opening Modal then Popconfirm shows Popconfirm above; Drawer opens as a bottom sheet; every pagination/tab/menu control ≥ 44px.
- [ ] Screenshots (375px and 1280px, light and dark) of Alert/Badge/Tag matrix, Modal, Drawer, Table and a chart attached to the plan.
