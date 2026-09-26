# F-038 visual evidence (Wave 3: display, feedback, navigation, overlays)

Regenerate: `F038_SCREENS=1 PLAYWRIGHT_PORT=6117 pnpm --filter storybook-hub exec playwright test tests/screens-f038.spec.ts --project=desktop-chrome`
(spec: `apps/storybook-hub/tests/screens-f038.spec.ts`). File names are `{name}-{theme}-{width}x{height}.png`
with theme `light` or `dark` and nominal viewport `375x812` (phone) or `1280x800` (desktop). Whole-view and
element shots grow the viewport to the content height so nothing is cut off; overlay shots are a plain viewport.

| Name | What it shows |
| --- | --- |
| `data-display-feedback-*` | Full "Data Display & Feedback" hub view (all matrices: Alert to charts) |
| `navigation-workflow-*` | Full "Navigation & Workflow" hub view (Pagination to MarkdownViewer) |
| `matrix-alert-*` | Alert card: four variants with icons, closable, description-only |
| `matrix-badge-*` | Badge card: variants, sizes, dot |
| `matrix-tag-*` | Tag card: colours, closable, checkable |
| `modal-open-*` | Modal opened from the overlay matrix (phone: full-height sheet) |
| `modal-popconfirm-open-*` | Modal with its Popconfirm open on top (phone: bottom sheet over the modal) |
| `drawer-open-*` | Drawer opened (phone: bottom sheet; desktop: right side panel) |
| `table-*` | Table default responsive-stack variant (labelled cards on phone) |
| `table-scroll-*` | Table scroll variant with sticky first column |
| `chart-*` | Charts card: BarChart and CandlestickChart with HUD, canvases painted from theme tokens |

Every name exists in all four combinations (light/dark x 375/1280): 11 names x 4 = 44 PNGs.

## Views and their components

- "Data Display & Feedback" (`#view-data-display-feedback`): Alert, Badge, Tag, Avatar, Image, ImagePreview, Statistic/MetricTile/StatCard, Progress, Skeleton and Spin, EmptyState, Result, Toast/Message/Notification, Table, charts (Bar, Candlestick).
- "Navigation & Workflow" (`#view-navigation-workflow`): Pagination, Tabs, Menu, Breadcrumb, Steps, Anchor, Timeline, Splitter, overlay openers (Modal with a Popconfirm inside, Drawer, Popconfirm, Dropdown, Tooltip), MarkdownViewer.

## Known deviations

- Tag close hit area is 44px tall but 34px wide, by design: it grows toward the right edge only and never left over the label, because widening it to 44px would make neighbouring tags' hit areas overlap (tag lists use an 8px gap). Alert and Toast close buttons get the full 44x44 centred area. Ruled on in the F-038 D2b fix round; `display-contracts.spec.ts` asserts 34 for tags and says why.
- The 44px touch-target rules are `@media (pointer: coarse)` in the component CSS, so the contract runs on the `mobile-chrome` project only (as in Wave 2). At 375px with a fine pointer the controls are intentionally smaller.
- The overflow contract allow-lists three real scroll regions (scroll Table container, tabs list, breadcrumb under 768px). Any other container that scrolls sideways fails.
- Dark tokens changed in the D2b fix round to make the evidence readable: `--joy-border-subtle` (was navy-700, 1.05:1 against the card, now 1.34:1) and the four dark `--joy-status-*-bg` fills (were the near-black 900 stops, now a lighter tint, 1.08-1.19:1 against the card, text still >= 7.5:1).

## Verdicts

Taste review: FIX after the first pass (0 P0, 7 P1, one older hub-wide finding); PASS after two fix rounds (0 P0/P1, P2s only). Detail in rulings-and-deferrals.md.
Code review: quality gaps found in the first pass (purple scan missed semi-transparent purple, hand-edited generated tokens.json), fixed and re-reviewed APPROVE; 144 Playwright tests passed with --repeat-each=3 and no flake.
