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

## Verdicts

Taste review: pending
Code review: pending
