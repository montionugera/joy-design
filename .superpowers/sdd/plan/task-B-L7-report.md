# B-L7 report (MarkdownViewer, Splitter, Table, Timeline)
Branch feat/F-038. B-L7.6 (quality gate) intentionally not done; orchestrator reviews. Nothing pushed. All four components done (no "part 1"). Commit SHA is in the final section.

## Per-file changes
- packages/tokens/build.js (single source of truth for the classes both twins render; the four `.svelte` files have no `<style>` block). Most selectors were already hex-free (plan targets stale, per the self-grill correction); the real fixes:
  - Table: container/header/stack-card border `--joy-border-subtle` -> `--joy-border-default`; `tr:hover td` `--joy-surface-raised` -> `--joy-accent-subtle`; stack `td::before` label `--joy-text-muted` -> `--joy-text-secondary`; sortable hover + sorted icon `--joy-accent-default` (2.4:1 on white) -> `--joy-accent-text`; new `.joy-table-th--sortable:focus-visible` ring (inset, so the scroll container does not clip it); new scroll-variant block (below).
  - MarkdownViewer: `pre` was inverted (`--joy-text-primary` fill, `--joy-border-subtle` text) -> `--joy-surface-sunken` + `--joy-text-primary`; inline `code` `--joy-surface-raised`/`--joy-accent-default` (2.4:1) -> `--joy-surface-sunken`/`--joy-text-primary`, radius `--joy-radius-control`; blockquote fill `--joy-surface-raised` -> `--joy-accent-subtle` (it already had a full 1px `--joy-border-default` border, no stripe); new `.joy-markdown a` (`--joy-text-link`), `.joy-markdown hr` (`--joy-border-default`), `.joy-markdown__table-wrap`, `.joy-markdown__status` (visually hidden live region); copy button border `--joy-border-default`, radius token, `transition: all` -> explicit properties, `:focus-visible` `outline: var(--joy-focus-ring); outline-offset: 2px`, coarse `min-width/min-height: 44px`.
  - Timeline: connector `--joy-border-subtle` -> `--joy-border-default`; dot border `--joy-accent-default` -> `--joy-accent-text`; warning/info dot `-border` -> `-fg` (border tokens were under 3:1 on the card); new `.joy-timeline__title` / `__description` (`--joy-text-secondary`); `__time` `--joy-text-muted` -> `--joy-text-secondary` (4.5:1 on card).
  - Splitter: bar idle `--joy-surface-sunken` (invisible) -> `--joy-border-default`; hover/active/focus-visible `--joy-accent-default` -> `--joy-accent-text` (>= 3:1 both themes); `touch-action: none`; focus ring; pane size is now `flex: var(--joy-splitter-size) 1 0%` (see contract); mobile stacking media rule; 44px `::after` hit area under `(pointer: coarse)`.
- packages/tokens/dist/theme.css regenerated with `pnpm --filter @joymify/tokens build` (tracked).
- packages/svelte/src/lib/Table.svelte, Splitter.svelte, Timeline.svelte, MarkdownViewer.svelte: rewritten as below. All four gain `class` (MarkdownViewer had none), `ref = $bindable(null)` + `bind:this`, `...rest` on the root.
- New pure helpers (byte-identical copy for React): packages/svelte/src/lib/splitter-utils.ts, table-utils.ts.
- Tests: packages/svelte/test/splitter-utils.test.js (10), table-utils.test.js (3), components.test.js +4 lane tests (source contract of all four components + svelte/compiler warning-free compile, server and client), packages/tokens/test/wave-3.test.js +12 tests (no literals/stripes/purple, table hover/borders, sortable focus, scroll variant sticky rules, reduced-motion coverage of the flash, splitter hit area / 640px rule / ratio sizing / 3:1 contrast in both themes, timeline contrast, markdown tokens + contrast).

## ID status
- SVD-039 (MarkdownViewer hr `#e2e8f0`): closed (inline style removed; `.joy-markdown hr` with `--joy-border-default`).
- SVD-040 (copy button a11y): closed (`aria-label="Copy code to clipboard"`, `type="button"`, focus ring, 44px coarse, `Copy`/`Check` icons, live status). Blockquote: closed (full border + `--joy-accent-subtle` fill, no `border-left`); spec item 6.
- SVD-072 (Splitter dark bar / a11y), SVD-073 (Splitter keyboard): closed (bar `--joy-border-default`; separator with aria-orientation/valuenow/valuemin/valuemax, tabindex 0, arrows/Home/End). RXD-092..094 (React Splitter) are the twin's job (C-L7); the contract below is what it must match. Spec item 4 (mobile stacking, touch hit area): closed (script flag + CSS).
- SVD-076 (row hover `#faf5ff`): closed (`--joy-accent-subtle`; `#faf5ff` no longer anywhere in theme.css, asserted). SVD-077 (keyboard sort / aria-sort): closed. SVD-078 (container/header slate): closed (tokens; build.js already token-only, border now `--joy-border-default`). SVD-079 (dark stack label): closed (`--joy-text-secondary`; no per-component dark override exists, asserted). SVD-080 (ticker flash reduced motion): VERIFY-ONLY, the Wave-1 global block (`[class*="joy-"]` `animation-duration: 0.01ms !important; animation-iteration-count: 1 !important`) reaches `.joy-table-cell--flash-*`; asserted in wave-3.test.js. Zebra/selected rows: no such classes exist in either twin, nothing to migrate (verify-only). Spec item 5 (`variant="scroll"` sticky first column): closed.
- SVD-085 (timeline inline `#64748b` fallback): closed (class). SVD-086 (dark connector): closed (`--joy-border-default`; dark comes from the token).
- RXD-057..061 (Table React), RXD-088 (Timeline React): twin work for C-L7, contract below. Deferred: none in this lane.

## DOM / class contract (React must match exactly; casing rule: `onSort`, `className`, `ref` via forwardRef, rest spread on the root)

### Table (props: `columns`, `data`, `density`, `responsive`, `variant`, `sortKey`, `sortDirection`, `onsort`/`onSort`, `class`/`className`, `ref`, rest)
- NEW `variant?: 'stack' | 'scroll'`. Omitted: current behaviour (`responsive` decides; default stack). `variant === 'stack'` forces stack, `variant === 'scroll'` forces scroll. `responsive` is unchanged (`'scroll'`/`false` = plain table, no sticky column).
```
<div ref class="joy-table-container [joy-table-container--responsive-stack] [joy-table-container--scroll] {class}" {...rest}>
  <table class="joy-table joy-table--{density} [joy-table--responsive-stack] [joy-table--scroll]">
    <thead><tr>
      <th style="text-align: ..." [width]
          class="[joy-table-th--sortable] [joy-table-th--sorted-asc] [joy-table-th--sorted-desc]"
          tabindex="0"                    <- sortable columns only, absent otherwise
          aria-sort="ascending|descending|none"   <- sortable columns only, absent otherwise; NO role attribute
          onclick + onkeydown>            <- Enter / Space (key ' ') run the same handler; preventDefault on Space/Enter; only when e.target === e.currentTarget
        <span>{title}</span>
        [<span class="joy-table-sort-icon"><svg width="12" height="12" ... aria-hidden="true">...</svg></span>]   <- three icons (asc chevron up, desc chevron down, unsorted double chevron), NO aria-label, aria-hidden
```
- Body unchanged: `td[data-label][style=text-align]` with `joy-table-cell--flash-up|down`.
- The scroll variant is CSS only: `.joy-table-container--scroll` (`overflow-x: auto`), `.joy-table--scroll` (`width: max-content; min-width: 100%; border-collapse: separate`), first `th`/`td` `position: sticky; left: 0; z-index: var(--joy-z-sticky)` with a `1px solid var(--joy-border-subtle)` right border (a collapsed border would scroll away from a sticky cell, hence `separate`), `td:first-child` bg `--joy-surface-card`, all `th` sticky top, bg `--joy-surface-raised`, first `th` z-index sticky + 1, row hover applies to the pinned cell too.
- Sort cycle unchanged: new column asc, active column toggles (`nextSort`).

### Splitter (props: `layout: 'horizontal' | 'vertical'` (default horizontal = panes side by side), `defaultSplit` (50), `min` (10), `max` (90), `firstPane`, `secondPane` (React: children/props of your choice), `class`/`className`, `ref`, rest)
```
<div ref class="joy-splitter joy-splitter--{layout} {class}" role="group" aria-label="Resizable Splitter Panel" {...rest}>
  <div class="joy-splitter__pane" style="--joy-splitter-size: {ratio};">   <- unitless number, e.g. 30
  <div class="joy-splitter__bar [joy-splitter__bar--active]" role="separator" aria-label="Resize panes"
       aria-orientation="vertical|horizontal" aria-valuenow={Math.round(ratio)} aria-valuemin={min} aria-valuemax={max}
       tabindex="0" onpointerdown/onpointermove/onpointerup/onpointercancel onkeydown>
  <div class="joy-splitter__pane" style="--joy-splitter-size: {100 - ratio};">
</div>
```
- The class stays `joy-splitter--{layout}` (the PROP, never the stacked state). Panes are sized ONLY by the custom property (no inline width/height): CSS is `flex: var(--joy-splitter-size) 1 0%`. Until the React twin adopts this, its inline width/height still work (the `flex` declaration is invalid without the variable and falls back to the initial value).
- `ratio = clampSplit(state, min, max)`. Stacked flag: `matchMedia(SPLIT_STACK_QUERY)` (`(max-width: 640px)`) in an effect with cleanup, SSR-safe, default false. `arrangement = effectiveLayout(layout, stacked)`; `aria-orientation = barOrientation(arrangement)`; drag uses `clientX/rect.left/rect.width` for `horizontal`, `clientY/rect.top/rect.height` otherwise; keys via `splitKeyNext(e.key, ratio, arrangement, min, max, e.shiftKey)`, `preventDefault` only when it returns non-null.
- Pointer: `pointerdown` (primary button for mouse) -> `preventDefault`, `setPointerCapture`, focus the bar, `isResizing`; `pointermove` on the bar while resizing; `pointerup`/`pointercancel` -> release + stop. No window listeners. The container ref is what is measured.
- CSS: under `(max-width: 640px)` `.joy-splitter--horizontal` becomes `flex-direction: column` with `cursor: row-resize` on the bar; `.joy-splitter--vertical` and stacked containers have `min-height: 12rem` (percent flex basis 0 needs a height when the parent has none). `(pointer: coarse)` adds a 44px `::after` on the bar.

### Timeline (props: `items: {title, description?, time?, status?}[]`, `class`/`className`, `ref`, rest)
```
<ul ref class="joy-timeline {class}" role="list" {...rest}>
  <li class="joy-timeline__item">
    <div class="joy-timeline__dot joy-timeline__dot--{status||'primary'}">
    <div class="joy-timeline__content">
      <div class="joy-timeline__title">{title}</div>            <- was inline style font-weight
      [<div class="joy-timeline__description">{description}</div>]   <- was inline style with #64748b fallback
      [<div class="joy-timeline__time">{time}</div>]
```
No inline `style` anywhere.

### MarkdownViewer (props: `content`, `allowCopy`, `class`/`className` (new), `ref`, rest)
```
<div ref class="joy-markdown {class}" role="region" aria-label="Markdown content" {...rest}>
  h1/h2/h3/p/blockquote as before;  <hr />  (no inline style; styled by .joy-markdown hr)
  <pre class="joy-markdown__pre"><code>..</code>
    <button type="button" class="joy-markdown__copy-btn" aria-label="Copy code to clipboard" onclick>
      Copy icon (size 14) + "Copy"   |   Check icon (size 14) + "Copied"   (2s after a SUCCESSFUL clipboard write)
    </button>
    <span class="joy-markdown__status" role="status">{copied ? 'Copied to clipboard' : ''}</span>
  </pre>
  table: <div class="joy-markdown__table-wrap"><table class="joy-markdown__table">...   (wrapper was inline overflow-x)
```
- Icons: `Copy`, `Check` from `@joymify/icons` (React: `@joymify/icons/react`). The raw inline `<svg>` is gone. A failed/denied `navigator.clipboard.writeText` does NOT show the copied state (no false success); the reset timer is cleared on re-copy and on destroy.
- Markup changes vs before: `<hr>` lost its inline style; the table wrapper `div` lost its inline style (now a class); button aria-label text changed from "Copy code snippet"; new sibling `role="status"` span inside the `pre`; new root `class`/`ref`/rest.

## Helper APIs (React lane: copy byte-for-byte, `cmp` them)
`packages/svelte/src/lib/splitter-utils.ts` -> `packages/react/src/splitter-utils.ts`:
- `type SplitLayout = 'horizontal' | 'vertical'`; `SPLIT_STEP = 5`, `SPLIT_STEP_LARGE = 10`, `SPLIT_STACK_QUERY = '(max-width: 640px)'`
- `clampSplit(value, min, max): number` (NaN -> middle of range; reversed/non-finite/out-of-range bounds repaired to an ordered pair inside 0..100)
- `effectiveLayout(layout, stacked): SplitLayout`; `barOrientation(layout): 'vertical' | 'horizontal'`
- `splitFromPointer(offset, size, min, max): number | null` (null when size <= 0 or an input is non-finite)
- `splitKeyNext(key, current, layout, min, max, large = false): number | null` (Left/Right for horizontal, Up/Down for vertical, Home/End to min/max, null for anything else)

`packages/svelte/src/lib/table-utils.ts` -> `packages/react/src/table-utils.ts`:
- `type SortDirection = 'asc' | 'desc'`, `type AriaSort = 'ascending' | 'descending' | 'none'`
- `ariaSort(sortKey, sortDirection, key): AriaSort`; `nextSort(sortKey, sortDirection, key): SortDirection`; `isSortActivationKey(key): boolean` (Enter, ' ', Spacebar)
- Unit tests to copy: packages/svelte/test/splitter-utils.test.js and table-utils.test.js (they import `../src/lib/*.ts`; adjust the path to `../src/*.ts` in React).

## Verification (real output; scratch outputs kept under /private/tmp/claude-502/)
- `pnpm --filter @joymify/tokens build` exit 0 ("Tokens compiled successfully"); `pnpm --filter @joymify/tokens test`: exit 0, tests 63, pass 63, fail 0 (12 new B-L7 tests; contrast checks include splitter bar idle/hover on card and canvas in both themes >= 3:1, timeline dots >= 3:1 and text >= 4.5:1, markdown pairs >= 4.5:1).
- `pnpm --filter @joymify/svelte test`: exit 0, tests 82, pass 82, fail 0.
- `pnpm --filter @joymify/react test`: exit 0, tests 74, pass 74, fail 0 (chart-benchmark did not flake this run).
- `bash scripts/lint-colors.sh --strict` on MarkdownViewer/Splitter/Table/Timeline.svelte, splitter-utils.ts, table-utils.ts and packages/tokens/build.js: exit 0, every file "0 violation(s)", "PASS lint-colors: 0 warning file(s); strict checks clean." (Note: a `var(--joy-splitter-size, 50)` fallback was caught by this gate during development and removed.)
- `node apps/storybook-hub/build.js`: exit 0 ("Built Storybook Hub static distribution"). The hub has no Splitter demo; Table/Timeline/Markdown hub demos use the same classes and are unaffected.
- svelte/compiler: all four compile warning-free for server and client (asserted in components.test.js). Two Svelte a11y lints (focusable/interactive separator) and one `state_referenced_locally` are suppressed with a comment in Splitter.svelte, with reasons.
- SSR render (svelte/server through a scratch ESM loader that compiles .svelte and maps `./x.js` to `.ts`): Table sortable (`tabindex="0" aria-sort="descending"` on the sorted th, `aria-sort="none"` on the unsorted, none on the non-sortable th, svg `aria-hidden`), Table `variant="scroll"` (`joy-table-container--scroll` + `joy-table--scroll`, no stack classes), Splitter (`--joy-splitter-size: 30` / `70`, separator with orientation vertical, valuenow 30, min 10, max 90), Timeline, MarkdownViewer (hr without style, labelled copy button, status span): all match the contract above.
- REAL BROWSER (Playwright chromium 1.63 against a scratch server that compiles the components on the fly with dist/theme.css; harness lives in the session scratchpad, not the repo): 55/55 checks, run three times after the last CSS change. Desktop light: Enter then Space cycle aria-sort none -> ascending -> descending and fire `onsort` with the right payloads, other keys ignored, Space does not scroll the page, th focus ring 2px, row hover computed colour equals `--joy-accent-subtle`; scroll variant overflows (795 in 400), first column stays at the same x after scrolling 200px, sticky/left 0/z 100, opaque white, 1px right border, first th sticky z 101 opaque; Splitter horizontal aria-orientation vertical, valuenow/min/max, ArrowRight +5, Shift+ArrowLeft -10, ArrowDown ignored, End/Home = max/min with the pane measured at ~10%, mouse drag to 70% reads 70; vertical layout ArrowDown +5, ArrowLeft ignored, vertical drag maths (25% target read 23 only because the harness wrapper was 300px and the splitter had a 320px min-height at the time, since lowered to 12rem; ratio maths independently unit-tested); idle bar computed = `--joy-border-default`, hover = `--joy-accent-text`; Timeline description = `--joy-text-secondary`; blockquote 1px on all sides with `--joy-accent-subtle`; hr `--joy-border-default`; copy button label/type, focus ring 2px, click -> "Copied" + status text "Copied to clipboard"; pre = sunken/primary. Dark: row hover = rgb(42, 34, 17) (`--joy-accent-subtle` dark). Phone 375px with coarse pointer: splitter is `flex-direction: column`, bar aria-orientation horizontal, `::after` 44px tall, `touch-action: none`, ArrowDown +5 and ArrowRight ignored while stacked, pointer drag along Y to 30% reads 28 (wrapper artifact as above), first pane height ~30%, vertical layout hit area 44px; stack table hides its thead and the `td::before` label is `--joy-text-secondary`; copy button 64x44. No console errors. Screenshots (light/dark/mobile) inspected once (dark).

## Concerns / notes for the orchestrator
- Splitter pane sizing changed from inline width/height to the `--joy-splitter-size` flex ratio. The bar (6px) is excluded from the ratio, so a pointer at exactly N% yields a pane a few px off N% of the full container; aria-valuenow is the pointer percentage. React's current inline width/height keeps working until C-L7 adopts the contract; both twins must ship the same vocabulary before the hub/docs claim parity.
- `.joy-splitter--vertical` and stacked splitters get `min-height: 12rem` (they collapse otherwise when the parent has no definite height; before, percent heights silently fell back to auto so drag did nothing). A parent shorter than 12rem will overflow.
- Left/Right arrows are not mirrored for RTL (not requested).
- `responsive="scroll"` (existing) and the new `variant="scroll"` are different: only the variant pins the first column, so the existing behaviour cannot change for current consumers.
- The `.joy-markdown__pre` class emitted by the component and the hub has no CSS rule of its own (styled through `.joy-markdown pre`); left as is.
- Hub demo at apps/storybook-hub/build.js ~2573 still has its own hand-written copy button markup (no `aria-label`, inline onclick, `joy-markdown__pre`); Phase D2 should align it with the contract above.

## Commit
See below (filled after commit).
