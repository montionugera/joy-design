# F-038 issue coverage (SVD-001..098, RXD-001..105)

The spec requires that every SVD- and RXD- issue is resolved or deferred with a reason. This table is the machine-checked record: `node .claude/refined_backlog/F-038-wave-3-display-feedback-navigation-and-o/research/id-coverage.mjs` parses the two audit files for the ID list and this file for the statuses, prints the summary line and exits 1 if an audit ID is missing, has an empty or unknown status, or carries a different severity than the audit.

Totals: 203 issues = 148 closed, 53 verify-only (already clean), 2 deferred, 0 n/a (out of scope).

## Status meanings

| Status | Meaning |
| :--- | :--- |
| closed | The wave changed code, CSS or tests for it. Where column names the component, lane and commit(s) (sha7). |
| verify-only (already clean) | The defect named by the audit was not present at the start of the wave (mostly because commit 13d7805, before the plan, had already made `packages/tokens/build.js` token-only, or the Wave 1 global reduced-motion block covers it). The lane re-checked it against the code and left it. |
| deferred | Not done in this wave; the Note column gives the reason. Details in rulings-and-deferrals.md. |
| n/a (out of scope) | Not used: no audit issue was ruled out of scope. |

## Notes on reading the Where column

- Lane names: A1 (chart-core), A2 (parity checker), B-L1..B-L8 (Svelte lanes), C-L1..C-L8 (React lanes), D3.1 (twin parity finalisation).
- Audit line numbers had drifted by 130-330+ lines; several audit targets in `build.js` were already fixed before the wave, and the real violation lived in a component's own Svelte `<style>` block. Those were fixed there (and, under the standing ruling, the scoped rules were then deleted so `build.js` is the single source of truth for classes both twins render).
- The audit's RXD numbering does not always match the lane reports' shorthand; statuses here were derived from the audit text and checked against the code at the final commit, not copied from report prose.
- A closed row may cite a later fix commit (for example 5ba96bd after 5bdeeb4); the final state is what the code has at HEAD of feat/F-038.

## Table

| ID | Sev | Status | Where | Note |
| :--- | :--- | :--- | :--- | :--- |
| SVD-001 | P0 | closed | Alert, B-L3 18d97bd | Svelte scoped border-left deleted; full 1px status border, styles single-sourced in build.js |
| SVD-002 | P0 | closed | Alert, B-L3 18d97bd | Dark via status bg/fg/border tokens, no per-theme rule needed |
| SVD-003 | P0 | closed | Alert, B-L3 18d97bd | Scoped hex and Tailwind fallbacks deleted |
| SVD-004 | P1 | closed | Alert, B-L3 18d97bd | Per-variant status icon (AlertCircle/CheckCircle/AlertTriangle family) |
| SVD-005 | P1 | closed | Alert, B-L3 18d97bd, ce083dc | closable + onclose + rest spread; dismiss model is uncontrolled and documented |
| SVD-006 | P1 | verify-only (already clean) | Anchor, B-L5 | build.js rail already used --joy-border-subtle before the wave |
| SVD-007 | P1 | closed | Anchor, B-L5 ea61e2e | Coarse-pointer min-height 44px |
| SVD-008 | P1 | closed | Anchor, B-L5 ea61e2e | Ink-ball uses --joy-accent-active; note neither twin renders the ball (CSS only) |
| SVD-009 | P2 | verify-only (already clean) | Anchor, B-L5 | Covered by the Wave 1 global prefers-reduced-motion block |
| SVD-010 | P1 | closed | Avatar, B-L1 5bdeeb4 | surface-sunken / text-secondary in build.js |
| SVD-011 | P1 | closed | Avatar, B-L1 5bdeeb4 | Badge ring is --joy-surface-canvas |
| SVD-012 | P1 | closed | AvatarGroup, B-L1 5bdeeb4 | Group ring is --joy-surface-canvas |
| SVD-013 | P2 | verify-only (already clean) | Avatar, B-L1 | onerror fallback (imgError) already existed; AvatarGroup max closed separately (see RXD-102) |
| SVD-014 | P0 | closed | Badge, B-L1 5bdeeb4 | Fix landed in Badge.svelte scoped style (plan target build.js was already clean). Ruling: brand badge uses accent-subtle/accent-text, not navy-500 |
| SVD-015 | P1 | closed | Badge, B-L1 5bdeeb4 | Status variants use --joy-status-* tokens |
| SVD-016 | P1 | closed | Badge, B-L1 5bdeeb4 | Neutral badge uses surface-sunken/text-secondary; flips per theme |
| SVD-017 | P1 | closed | Breadcrumb, B-L5 ea61e2e | Scoped block deleted, tokens only |
| SVD-018 | P1 | closed | Breadcrumb, B-L5 ea61e2e | Token duration; global reduced-motion covers it |
| SVD-019 | P1 | closed | Breadcrumb, B-L5 ea61e2e, 5d15177 | Horizontal scroll under 768px, padding keeps the focus ring visible |
| SVD-020 | P1 | verify-only (already clean) | Divider, B-L1 | build.js already used var(--joy-border-subtle) with no fallback |
| SVD-021 | P1 | verify-only (already clean) | Divider, B-L1 | No dark override existed |
| SVD-022 | P0 | closed | Drawer, B-L6 d765d2e | backdrop-filter removed; solid navy-900 mix scrim |
| SVD-023 | P0 | closed | Drawer, B-L6 d765d2e, 4ddad97 | lockBodyScroll + trapFocus + registerDialog (Escape closes topmost only) |
| SVD-024 | P1 | closed | Drawer, B-L6 d765d2e | Bottom sheet at 480px and below |
| SVD-025 | P1 | closed | Drawer, B-L6 d765d2e | Close icon button, 44px, aria-label "Close drawer" |
| SVD-026 | P1 | closed | Drawer, B-L6 d765d2e | Reduced-motion guard on the slide |
| SVD-027 | P0 | closed | Dropdown, B-L6 d765d2e, 4ddad97 | aria-haspopup/aria-expanded, keyboard, openOverlay wiring |
| SVD-028 | P1 | closed | Dropdown, B-L6 d765d2e | Positioned by the overlay primitive at --joy-z-dropdown; absolute fallback for unmigrated panels (4ddad97) |
| SVD-029 | P1 | closed | Dropdown, B-L6 d765d2e | Coarse-pointer 44px items |
| SVD-030 | P1 | closed | EmptyState, B-L3 18d97bd | Scoped block deleted, --joy-surface-card |
| SVD-031 | P1 | closed | EmptyState, B-L3 18d97bd | Scoped block deleted, --joy-surface-card |
| SVD-032 | P2 | deferred | Flex (not implemented) | Feature request, not a defect (responsive direction/wrap prop). Filed as a future idea |
| SVD-033 | P2 | closed | Space, B-L2 8e7649c | Gap exposed as --joy-space-gap (P2 polish) |
| SVD-034 | P0 | closed | ImagePreview, B-L6 d765d2e | Blur removed; navy-900 85% scrim |
| SVD-035 | P0 | closed | ImagePreview, B-L6 d765d2e | z-index uses --joy-z-modal / --joy-z-popover |
| SVD-036 | P1 | closed | ImagePreview, B-L6 d765d2e | Toolbar on tokens |
| SVD-037 | P1 | closed | ImagePreview, B-L6 d765d2e | Labelled toolbar buttons with @joymify/icons, 44px targets |
| SVD-038 | P1 | verify-only (already clean) | Image, B-L2 | The overlay element carries no `joy-*` class, so the global `[class*="joy-"]` reduced-motion block does not match it; the conclusion still holds because the overlay is mounted only while hovered/focused ({#if}) and its transition never runs (final review corrected the rationale) |
| SVD-039 | P1 | closed | MarkdownViewer, B-L7 5eded48 | Inline hr style replaced by a class using --joy-border-default |
| SVD-040 | P1 | closed | MarkdownViewer, B-L7 5eded48 | Copy button aria-label, focus ring, 44px coarse, live status; blockquote full border (spec item 6) |
| SVD-041 | P1 | closed | Menu, B-L5 ea61e2e | Hover retinted to --joy-accent-subtle; build.js was already token-only |
| SVD-042 | P1 | closed | Menu, B-L5 ea61e2e | menu/menuitem roles, aria-current, roving tabindex, arrow keys. Ruling: role=menu kept for navigation-style usage |
| SVD-043 | P0 | closed | Message, B-L4 ba61b72 | Info icon uses status-info-fg via tone class |
| SVD-044 | P0 | closed | Notification, B-L4 ba61b72 | Info icon uses status-info-fg via tone class |
| SVD-045 | P1 | closed | Message/Notification, B-L4 ba61b72 | z-index --joy-z-toast |
| SVD-046 | P1 | closed | Notification, B-L4 ba61b72 | max-width calc(100vw - 32px) under 480px |
| SVD-047 | P0 | closed | MetricTile, B-L2 8e7649c, cf23e95 | Scoped style deleted, build.js single source (metric tile border/radius now default/card) |
| SVD-048 | P0 | closed | StatCard, B-L2 8e7649c, cf23e95 | Scoped style deleted, build.js single source |
| SVD-049 | P1 | closed | StatCard, B-L2 8e7649c, 6ea0fb5 | Trend colours from status tokens; trend prop derived from delta sign |
| SVD-050 | P1 | verify-only (already clean) | Statistic, B-L2 | build.js already used --joy-text-primary with no dark override |
| SVD-051 | P0 | closed | Modal, B-L6 d765d2e | backdrop-filter removed; navy-900 60% scrim (spec amendment: not --joy-surface-overlay) |
| SVD-052 | P0 | closed | Modal, B-L6 d765d2e, 4ddad97 | lockBodyScroll + trapFocus + registerDialog |
| SVD-053 | P0 | closed | Modal, B-L6 d765d2e | Card surface on --joy-surface-card |
| SVD-054 | P1 | closed | Modal, B-L6 d765d2e | Full-bleed with sticky footer at 480px and below; safe-area insets |
| SVD-055 | P1 | closed | Modal, B-L6 d765d2e | Close icon button, 44px, aria-label "Close dialog" |
| SVD-056 | P1 | closed | Modal, B-L6 d765d2e | Reduced-motion guard on joy-modal-pop; exit animation deferred (see rulings) |
| SVD-057 | P1 | closed | Pagination, B-L5 ea61e2e | Coarse-pointer 44px buttons |
| SVD-058 | P1 | verify-only (already clean) | Pagination, B-L5 | No slate literals left in build.js before the wave |
| SVD-059 | P1 | verify-only (already clean) | Pagination, B-L5 | Dark surface already --joy-surface-card |
| SVD-060 | P0 | closed | Popconfirm, B-L6 d765d2e | z-index --joy-z-popover 1060 (above Modal 1050), measured in the hub contract |
| SVD-061 | P1 | closed | Popconfirm, B-L6 d765d2e | Warning icon uses status tokens |
| SVD-062 | P1 | closed | Popconfirm, B-L6 d765d2e | Escape and outside click through openOverlay; role=alertdialog |
| SVD-063 | P0 | closed | Progress, B-L4 ba61b72, 2a483fd | Scoped block deleted; default fill --joy-accent-text; role/aria on the root |
| SVD-064 | P1 | closed | Progress, B-L4 ba61b72 | transition: all replaced by named properties |
| SVD-065 | P1 | closed | Progress, B-L4 ba61b72 | Scoped dark fallback deleted |
| SVD-066 | P1 | verify-only (already clean) | Result, B-L3 | build.js already --joy-text-primary, no dark hex |
| SVD-067 | P1 | verify-only (already clean) | Result, B-L3 | build.js already --joy-status-warning-fg |
| SVD-068 | P1 | closed | Skeleton, B-L3 18d97bd | Targeted reduced-motion block (static tinted block) |
| SVD-069 | P1 | verify-only (already clean) | Skeleton, B-L3 | Shimmer stops already --joy-surface-sunken/raised |
| SVD-070 | P0 | closed | Spin, B-L4 ba61b72 | Tip text --joy-accent-text |
| SVD-071 | P1 | closed | Spin, B-L4 ba61b72 | Reduced motion slows the spinner (does not stop it) |
| SVD-072 | P1 | closed | Splitter, B-L7 5eded48, 7679973 | separator role, aria-value*, keyboard, both axes, stacked under 640px |
| SVD-073 | P1 | closed | Splitter, B-L7 5eded48 | Bar uses --joy-border-default |
| SVD-074 | P1 | closed | Steps, B-L5 ea61e2e | Icon fill --joy-accent-text (brief's accent-active/on-accent measured 2.84:1) |
| SVD-075 | P1 | closed | Steps, B-L5 ea61e2e | Vertical under 768px, aria-current=step |
| SVD-076 | P0 | closed | Table, B-L7 5eded48 | Row hover retinted to --joy-accent-subtle (purple was already gone before the wave); asserted absent in theme.css |
| SVD-077 | P0 | closed | Table, B-L7 5eded48 | tabindex, Enter/Space, aria-sort on sortable headers |
| SVD-078 | P1 | closed | Table, B-L7 5eded48, 7679973 | Border on --joy-border-default; scroll region keyboard-focusable; sticky isolation |
| SVD-079 | P1 | closed | Table, B-L7 5eded48 | Stack label on --joy-text-secondary; no per-component dark override |
| SVD-080 | P1 | verify-only (already clean) | Table, B-L7 | Wave 1 global reduced-motion block reaches the flash animations |
| SVD-081 | P1 | closed | Tabs, B-L5 ea61e2e | Coarse-pointer 44px tabs |
| SVD-082 | P1 | closed | Tabs, B-L5 ea61e2e | Roving tabindex + ArrowLeft/ArrowRight/Home/End |
| SVD-083 | P1 | verify-only (already clean) | Tag, B-L1 | build.js already accent/status tokens; later taste fix 871a81d moved primary tag text to --joy-accent-text (AA) |
| SVD-084 | P1 | verify-only (already clean) | Tag, B-L1 | No dark slate override existed in build.js |
| SVD-085 | P1 | closed | Timeline, B-L7 5eded48 | Inline colour fallback replaced by a class |
| SVD-086 | P1 | closed | Timeline, B-L7 5eded48 | Connector on --joy-border-default |
| SVD-087 | P0 | closed | Toast, B-L4 ba61b72 | Container z-index --joy-z-toast (1100; the old 1200 is now Tooltip only) |
| SVD-088 | P1 | closed | Toast, B-L4 ba61b72 | Close icon button, 44px, aria-label "Dismiss notification" |
| SVD-089 | P1 | closed | Tooltip, B-L6 d765d2e | Tap/click toggle with outside-tap dismiss; aria-describedby link |
| SVD-090 | P0 | closed | chart-core, A1 ecf3a59 | Bull/bear read from CSS variables through readChartPalette |
| SVD-091 | P0 | closed | chart-core, A1 ecf3a59 | Axis text uses palette.textSecondary |
| SVD-092 | P0 | closed | BarChart, B-L8 f35c2be | HUD text via token classes (was navy-on-navy 1.00:1) |
| SVD-093 | P0 | closed | LineChart, B-L8 f35c2be | HUD text via token classes |
| SVD-094 | P0 | closed | CandlestickChart, B-L8 f35c2be | HUD text via token classes |
| SVD-095 | P1 | closed | CandlestickChart, B-L8 f35c2be | Bull/bear classes on status tokens |
| SVD-096 | P1 | closed | Charts, B-L8 f35c2be | HUD wraps at 375px (verified in real chromium) |
| SVD-097 | P1 | deferred | overlay-utils (not implemented) | iOS scroll lock via position: fixed needs scrollY save/restore in the shared primitive (both copies); risk judged higher than the wave allowed. Backlog idea |
| SVD-098 | P1 | verify-only (already clean) | overlay-utils, B-L6 | trapFocus already re-queries focusable elements on every Tab keydown |
| RXD-001 | P0 | closed | BarChart, C-L8 e0ffd76 | Token class for HUD value |
| RXD-002 | P0 | closed | LineChart, C-L8 e0ffd76 | Token class for HUD label |
| RXD-003 | P0 | closed | CandlestickChart, C-L8 e0ffd76 | Token class for HUD indicator |
| RXD-004 | P0 | closed | chart-core, A1 ecf3a59 | Axis colours from palette (shared file) |
| RXD-005 | P1 | closed | chart-core, A1 ecf3a59 | Bull/bear from palette |
| RXD-006 | P1 | verify-only (already clean) | build.js, A1 | backdrop-filter already removed before the wave by 13d7805 |
| RXD-007 | P1 | verify-only (already clean) | build.js, A1 | Dark hex overrides already removed before the wave by 13d7805 |
| RXD-008 | P1 | closed | Charts, C-L8 e0ffd76 | role=img + aria-label + capped accessible summary table |
| RXD-009 | P1 | closed | CandlestickChart, C-L8 e0ffd76 | Delta colours from bull/bear classes |
| RXD-010 | P1 | closed | chart-core, A1 36942ff | Crosshair pill and default series colour from palette (plan gap: ChartPalette gained accent/onAccent) |
| RXD-011 | P0 | verify-only (already clean) | Alert, B-L3 | build.js had no border-left; React uses build.js; Svelte stripe closed under SVD-001 |
| RXD-012 | P0 | verify-only (already clean) | Alert, B-L3 | No light-only hex in build.js; status tokens flip per theme |
| RXD-013 | P1 | verify-only (already clean) | Alert, B-L3 | build.js already on status tokens |
| RXD-014 | P1 | closed | Alert, C-L3 531e6a9 | forwardRef + rest spread |
| RXD-015 | P1 | closed | Alert, C-L3 531e6a9 | closable + onClose, icon, close button |
| RXD-016 | P2 | closed | Alert, B-L3 18d97bd | Targeted reduced-motion block (the Wave 1 global block also covers it) |
| RXD-017 | P0 | closed | ImagePreview, C-L6 814fece | Inline styles moved to joy-image-preview-* classes in build.js |
| RXD-018 | P1 | closed | ImagePreview, C-L6 814fece | No backdrop blur |
| RXD-019 | P1 | closed | ImagePreview, B-L6 d765d2e + C-L6 814fece | 44px toolbar buttons (coarse pointer) |
| RXD-020 | P1 | closed | ImagePreview, C-L6 814fece | z-index tokens |
| RXD-021 | P1 | closed | Image, C-L6 814fece | Image.tsx split out and exported |
| RXD-022 | P1 | closed | ImagePreview, C-L6 814fece | forwardRef + rest |
| RXD-023 | P1 | closed | ImagePreview, C-L6 814fece | No inline colours |
| RXD-024 | P0 | verify-only (already clean) | Modal footer, B-L6 | build.js footer was already token-only; sticky footer at 480px added under SVD-054 |
| RXD-025 | P1 | closed | Drawer, B-L6 d765d2e | Drawer backdrop blur removed (was still in build.js) |
| RXD-026 | P1 | closed | Modal, C-L6 814fece, 5d253b4 | Focus trap via useDialog; focus returns to the opener even with autoFocus content |
| RXD-027 | P1 | closed | Modal, C-L6 814fece | Close icon replaces &times; |
| RXD-028 | P1 | closed | Modal/Drawer, B-L6 d765d2e | Close buttons 44px |
| RXD-029 | P1 | closed | Modal, C-L6 814fece | useId-based title id |
| RXD-030 | P1 | closed | Modal, C-L6 814fece, 5d253b4 | forwardRef + rest; consumer aria-label wins like in Svelte |
| RXD-031 | P1 | closed | Drawer, C-L6 814fece | lockBodyScroll via useDialog |
| RXD-032 | P2 | verify-only (already clean) | Modal, B-L6 | No slate fallback left in build.js |
| RXD-033 | P1 | closed | Drawer, C-L6 814fece | forwardRef + rest |
| RXD-034 | P0 | verify-only (already clean) | Tabs, B-L5 | build.js already on accent tokens (no purple) |
| RXD-035 | P0 | verify-only (already clean) | Tabs, B-L5 | Tokens flip per theme; no hex left |
| RXD-036 | P1 | closed | Tabs, B-L5 ea61e2e | Coarse-pointer 44px |
| RXD-037 | P1 | closed | Tabs, C-L5 5fde471 | Arrow/Home/End roving tabindex |
| RXD-038 | P1 | closed | Tabs, B-L5 ea61e2e | Focus ring on tab buttons |
| RXD-039 | P1 | verify-only (already clean) | Tabs | Casing (React onChange, Svelte onchange) is the documented rule; parity gate enforces it per side (3feae32). Tabs ids/aria-controls added in C-L5 |
| RXD-040 | P1 | closed | Tabs, C-L5 5fde471 | forwardRef + rest |
| RXD-041 | P0 | closed | Pagination, C-L5 5fde471, B-L5 ea61e2e | Windowed page list with ellipsis via shared pagination-utils.ts |
| RXD-042 | P0 | verify-only (already clean) | Pagination, B-L5 | No purple left in build.js |
| RXD-043 | P1 | closed | Pagination, B-L5 ea61e2e | Coarse-pointer 44px buttons |
| RXD-044 | P1 | verify-only (already clean) | Pagination, B-L5 | Dark surface already a token |
| RXD-045 | P1 | closed | Pagination, C-L5 5fde471 | Chevron icons replace entities |
| RXD-046 | P1 | closed | Pagination, C-L5 5fde471 | forwardRef + rest |
| RXD-047 | P0 | verify-only (already clean) | Dropdown, B-L6 | Lavender hover already gone before the wave |
| RXD-048 | P0 | verify-only (already clean) | Dropdown, B-L6 | No light-only hover left; tokens flip per theme |
| RXD-049 | P1 | closed | Dropdown, C-L6 814fece | useOverlay: Escape + outside click |
| RXD-050 | P1 | closed | Dropdown, C-L6 814fece | aria-haspopup + aria-expanded |
| RXD-051 | P0 | closed | Menu, B-L5 ea61e2e | Inline active side stripe removed |
| RXD-052 | P1 | verify-only (already clean) | Menu, B-L5 | build.js already on tokens |
| RXD-053 | P1 | closed | Menu, B-L5 ea61e2e | Coarse-pointer 44px items |
| RXD-054 | P1 | verify-only (already clean) | Menu, B-L5 | Phantom tokens are aliased in build.js (color-surface-elevated to surface-raised) |
| RXD-055 | P1 | closed | Dropdown, C-L6 814fece | forwardRef + rest |
| RXD-056 | P1 | verify-only (already clean) | Menu | React already used onSelect (casing rule); verified |
| RXD-057 | P0 | closed | Table, C-L7 d63fc92 | tabIndex, Enter/Space, aria-sort |
| RXD-058 | P0 | verify-only (already clean) | Table, B-L7 | Dark hex overrides already gone before the wave |
| RXD-059 | P1 | verify-only (already clean) | Table, B-L7 | Lavender hover already gone; retinted to --joy-accent-subtle (SVD-076) |
| RXD-060 | P1 | closed | Table, C-L7 d63fc92 | forwardRef + rest; onSort casing verified |
| RXD-061 | P1 | verify-only (already clean) | Table, B-L7 | Phantom token aliased in build.js (color-surface-subtle to surface-sunken) |
| RXD-062 | P0 | verify-only (already clean) | MetricTile, B-L2 | Uppercase/tracking already removed from build.js |
| RXD-063 | P0 | verify-only (already clean) | StatCard, B-L2 | Uppercase/tracking already removed from build.js; Svelte scoped copy closed under SVD-048 |
| RXD-064 | P1 | closed | MetricTile, C-L2 679bb2b | SVG trend icons replace the Unicode triangles |
| RXD-065 | P1 | verify-only (already clean) | MetricTile/StatCard, B-L2 | build.js delta classes already tokenised |
| RXD-066 | P1 | verify-only (already clean) | StatCard, B-L2 | No dark hex in build.js |
| RXD-067 | P1 | closed | MetricTile, C-L2 679bb2b | forwardRef + rest |
| RXD-068 | P1 | closed | StatCard, C-L2 679bb2b | forwardRef + rest |
| RXD-069 | P1 | verify-only (already clean) | Statistic, B-L2 | Already --joy-text-primary / --joy-text-muted |
| RXD-070 | P0 | verify-only (already clean) | Badge, B-L1 | build.js already tokenised; purple lived in Badge.svelte scoped style (closed as SVD-014) |
| RXD-071 | P0 | verify-only (already clean) | Badge, B-L1 | Tokens flip per theme |
| RXD-072 | P0 | verify-only (already clean) | Tag, B-L1 | build.js already on accent tokens; primary tag text moved to --joy-accent-text in 871a81d (AA) |
| RXD-073 | P1 | closed | Tag, B-L1 5bdeeb4, 5ba96bd | 24px visual close with a 34x44 hit box (deliberate deviation from 44x44, see rulings) |
| RXD-074 | P1 | closed | Tag, B-L1 5bdeeb4 | checkable :focus-visible ring |
| RXD-075 | P1 | closed | Badge, C-L1 753cb4f | forwardRef + rest |
| RXD-076 | P1 | verify-only (already clean) | Tag, B-L1 | No dark slate override in build.js |
| RXD-077 | P0 | closed | Message, C-L4 f8f8df2 | Info icon via tone class, no inline hex |
| RXD-078 | P0 | closed | Notification, C-L4 f8f8df2 | Info icon via tone class, no inline hex |
| RXD-079 | P0 | verify-only (already clean) | Toast, B-L4 | build.js had no border-left; variants also gained status bg/fg |
| RXD-080 | P1 | closed | Notification, C-L4 f8f8df2 | Inline layout styles replaced by classes carrying the mobile max-width |
| RXD-081 | P1 | closed | Message/Notification, B-L4 ba61b72 | z-index --joy-z-toast |
| RXD-082 | P1 | closed | Popconfirm, B-L6 d765d2e | z-index --joy-z-popover |
| RXD-083 | P1 | closed | Toast, C-L4 f8f8df2 | Close icon replaces &times; |
| RXD-084 | P1 | closed | Toast, C-L4 f8f8df2 | 44px close button, label "Dismiss notification" |
| RXD-085 | P1 | closed | Popconfirm, C-L6 814fece | useOverlay: Escape + outside click; controlled use needs onOpenChange |
| RXD-086 | P1 | closed | Toast, C-L4 f8f8df2 | forwardRef + rest |
| RXD-087 | P0 | verify-only (already clean) | Steps, B-L5 | Purple already gone from build.js; the gold contrast defect is SVD-074 |
| RXD-088 | P0 | closed | Timeline, C-L7 d63fc92 | Inline foreign colour fallback removed from Timeline.tsx (dot purple was already gone from build.js) |
| RXD-089 | P0 | closed | Spin, B-L4 ba61b72, C-L4 f8f8df2 | Tip text --joy-accent-text |
| RXD-090 | P1 | closed | Spin, B-L4 ba61b72 | Reduced motion slows the spinner |
| RXD-091 | P1 | verify-only (already clean) | Spin, B-L4 | No backdrop-filter left in the mask |
| RXD-092 | P0 | verify-only (already clean) | Splitter, B-L7 | Purple hover already gone from build.js; interaction rebuilt under RXD-093/094 |
| RXD-093 | P1 | closed | Splitter, C-L7 d63fc92 | Wider touch hit area, stacked under 640px, pointer events |
| RXD-094 | P1 | closed | Splitter, C-L7 d63fc92 | Arrow/Home/End keys, aria-value*, orientation |
| RXD-095 | P0 | verify-only (already clean) | Skeleton, B-L3 | Dark gradient stops already tokens |
| RXD-096 | P1 | closed | Skeleton, C-L3 531e6a9 | forwardRef + rest, single wrapper |
| RXD-097 | P0 | verify-only (already clean) | EmptyState, B-L3 | No dark hex in build.js; Svelte scoped copy closed under SVD-030 |
| RXD-098 | P1 | closed | EmptyState, C-L3 531e6a9 | forwardRef + rest |
| RXD-099 | P0 | verify-only (already clean) | Breadcrumb, B-L5 | build.js hover already accent-text; Svelte scoped purple closed under SVD-017 |
| RXD-100 | P1 | closed | Breadcrumb, C-L5 5fde471, B-L5 ea61e2e | Coarse-pointer 44px links; forwardRef + rest + aria |
| RXD-101 | P1 | closed | Divider, C-L1 753cb4f, D3.1 f377cf2 | aria-orientation=vertical in both twins (Svelte twin fixed in D3.1) |
| RXD-102 | P1 | closed | AvatarGroup, C-L1 753cb4f, B-L1 5ba96bd | max truncation + "+N" overflow avatar through items |
| RXD-103 | P1 | closed | Avatar, B-L1 5bdeeb4 | Status badge and group ring on --joy-surface-canvas (same fix as SVD-011/012) |
| RXD-104 | P1 | closed | Tooltip, C-L6 814fece | useId + aria-describedby |
| RXD-105 | P0 | verify-only (already clean) | build.js global focus ring | Already :focus-visible { outline: var(--joy-focus-ring) } before the wave |
