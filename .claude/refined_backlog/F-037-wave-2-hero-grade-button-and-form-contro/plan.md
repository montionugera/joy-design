# F-037 Wave 2 plan: hero-grade Button and form controls, Svelte + React parity

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Every numbered task (A1..A6, B-L1..B-L4, C-L1..C-L4, D1..D3) is sized for ONE dispatched CLI worker with a 25-minute budget and has its own verify command and commit message. If a budget runs out, commit the verified subset with the task's commit message suffixed ` (part 1)` and hand back; the orchestrator re-dispatches the same task with the remaining checkboxes.

**Goal:** Every Wave 2 control (Button, Input, InputNumber, Select, Checkbox, Switch, RadioGroup, Slider, Rate, Segmented, Form, FormItem, DatePicker, TimePicker, DateRangePicker, Mentions, Upload, TreeSelect, Cascader, Transfer, MarkdownEditor) renders a complete state matrix from semantic tokens only, hits 44px on touch, respects reduced motion, and produces identical class names and DOM in `@joymify/svelte` and `@joymify/react`; every SVF-/RXF- form issue is resolved or deferred with a reason.

**Architecture:** All component CSS lives in the `componentStyles` string of `packages/tokens/build.js` (emitted to `packages/tokens/dist/theme.css`); the 21 Svelte components lose their `<style>` blocks and both twins render one shared DOM contract. A DOM-agnostic overlay primitive (`overlay-utils.ts` in both packages, plus a React `useOverlay` hook) gives dropdown panels fixed-position anchoring, `--joy-z-dropdown`, Escape, outside-click, focus return and a bottom-sheet layout under 480px or on coarse pointers. `scripts/parity-check.mjs` is the machine-readable contract: it fails when class names, prop names (after the casing rule) or theme.css coverage diverge.

**Tech Stack:** Svelte 5 runes, React 18/19 (`forwardRef`), node:test (Node 26, native TypeScript imports as in `packages/svelte/test/chart-core.test.js`), Playwright (`apps/storybook-hub/playwright.config.ts`, projects `desktop-chrome` 1280x800 and `mobile-chrome` Pixel 5 with coarse pointer), bash gates (`scripts/precheck.sh` is Gate 1 on the ship path).

**Spec:** `.claude/refined_backlog/F-037-wave-2-hero-grade-button-and-form-contro/spec.md`. Evidence: `research/audit-svelte-forms.md` (SVF-001..115), `research/audit-react-forms-landing.md` (RXF-001..165), `research/audit-standards.md`. Wave 1 relay: `.claude/refined_backlog/F-036-wave-1-semantic-token-foundation-light-d/research/handoff-relay.md`. ID coverage is reproducible with `node .claude/refined_backlog/F-037-wave-2-hero-grade-button-and-form-contro/research/id-coverage.mjs`.

## Global Constraints

- Standing rules (from F-036): new commits only, never `--amend`; never touch `.release.json` or `_catalog.json`; never ship/push/PR. Work only inside this worktree (branch `feat/F-037`).
- Tokens only. No hex/rgb/hsl literal and no `var(--joy-x, fallback)` anywhere in the 21 twins, `overlay-utils.ts`, `useOverlay.ts`, or new CSS. Gate: `bash scripts/lint-colors.sh --strict <files>` exit 0. Available names are exactly those in `packages/tokens/dist/theme.css` (`--joy-accent-{default,hover,active,subtle,text}`, `--joy-border-{hairline,subtle,default,strong,focus}`, `--joy-surface-{canvas,card,raised,sunken,overlay,inverse}`, `--joy-text-{primary,secondary,muted,link,inverse,on-accent}`, `--joy-status-{success,warning,danger,info}-{fg,bg,border}`, `--joy-focus-ring`, `--joy-elevation-{0,1,2,3}`, `--joy-z-{base,dropdown,sticky,backdrop,drawer,modal,popover,toast,tooltip}`, `--joy-control-height-{sm,md,lg}` = 32/40/48px (44/44/48 under `@media (pointer: coarse)`, already emitted by Wave 1), `--joy-space-N`, `--joy-radius-{control,card,overlay,pill,full}`, `--joy-font-size-{xs,sm,md,lg,...}`, `--joy-duration-{fast,normal,slow}`, `--joy-ease-{out,in-out,emphasized}`, `--joy-form-label-width`) plus the five tokens A1 adds.
- `packages/tokens/src/tokens.json` and `packages/tokens/dist/index.d.ts` are GENERATED (`node packages/tokens/scripts/ramps.mjs` writes tokens.json; `build.js` writes dist). Never hand-edit them; edit `ramps.mjs`, regenerate, rebuild.
- Component CSS only in `packages/tokens/build.js` `componentStyles` (lines 136..3347 today). Svelte `<style>` blocks in the 21 components are deleted. No inline `style=` attributes carrying colors or sizes in components (custom-property passthrough such as `style="--joy-form-label-width: {labelWidth}"` is allowed).
- Motion: `transition: <explicit properties> var(--joy-duration-fast) var(--joy-ease-out)`. Never `transition: all`. Reduced motion is handled once by Wave 1's global `@media (prefers-reduced-motion: reduce) [class*="joy-"] { ... }` block; per-component media queries are not added (this closes SVF-007, SVF-038, SVF-049, SVF-072, SVF-093, RXF-164, RXF-165 once the components no longer carry their own transitions).
- Casing rule (documented in README by D3): React `onChange` / `onSelect` / `onRemove` / `onInput` / `className`; Svelte `onchange` / `onselect` / `onremove` / `oninput` / `class`. Every other prop name is identical in both frameworks. React components spread `...rest` and `forwardRef`; Svelte components accept `...rest`, expose `bind:ref` (`ref = $bindable(null)`) and `$bindable` value/checked.
- Zero emoji. Icons come from `@joymify/icons` (Svelte: `import { Upload, File, Close, Edit, Eye, Maximize2, Minimize2, ChevronDown, ChevronLeft, ChevronRight, Calendar, Clock, Check, Minus } from '@joymify/icons'`; React: same names from `@joymify/icons/react`). No `Star` icon exists: Rate keeps the inline SVG polygon already used by `Rate.svelte:84`. The dependency is added ONCE in A1 (both package.json files + `pnpm-lock.yaml`); B and C lanes never touch `package.json` or `pnpm-lock.yaml`.
- Parallelism: B-L1..B-L4 and C-L1..C-L4 (8 lanes) all run in parallel once Phase A has landed; each lane owns only the files listed under it. Phase A tasks are sequential (A1 -> A6); Phase D tasks are sequential after all lanes are merged into `feat/F-037`.
- Verification commands (real scripts): `pnpm --filter @joymify/tokens build`, `pnpm --filter @joymify/tokens test`, `pnpm --filter @joymify/svelte test`, `pnpm --filter @joymify/react test`, `pnpm -r test`, `node apps/storybook-hub/build.js`, `PLAYWRIGHT_PORT=6116 pnpm --filter storybook-hub exec playwright test`, `bash scripts/lint-colors.sh`, `bash scripts/precheck.sh`, `bash scripts/epic-check.sh`, `node scripts/parity-check.mjs`.

## Spec ambiguities resolved (assumptions)

1. **Select becomes a custom listbox, not a native `<select>`.** `spec.md:47` requires "Select and Cascader panels open as bottom sheets", so Select renders `button[role=combobox]` + `ul.joy-select__listbox.joy-overlay[role=listbox]` through the overlay primitive, with a hidden `input[name]` for form posts; the sheet layout applies under 480px or when `(pointer: coarse)` matches. The legacy `select.joy-select` rule stays styled so the existing hub markup keeps working until D1 replaces it.
2. **No portal.** The primitive positions panels with `position: fixed` (spec §4) and does not move DOM nodes, so Svelte `{#if}` teardown and React reconciliation stay simple and DOM stays identical. Limitation documented in README: an ancestor with `transform`/`filter` still clips.
3. **No standalone Textarea component exists.** The text-like matrix covers `.joy-mentions__textarea` and `.joy-markdown-editor__textarea` through a shared `.joy-textarea` base class; no new component is added.
4. **lint-colors strict flip is per file, not per directory.** Today 17 of the 42 twins and 38 non-Wave-2 files under `packages/svelte/src` and `packages/react/src` warn (Badge, Alert, StatCard, charts, landing sections: Waves 3-5). D3 makes the 21 twins plus overlay files hard failures in default mode; the directory-wide flip belongs to the wave that clears the last file.
5. **Hero gradient and lift need five new semantic tokens** (`accent.gradient-end`, `accent.highlight`, `elevation.accent-1`, `elevation.accent-2`, `elevation.accent-inset`) and one new primitive step `gold.450`, all generated by `ramps.mjs` (never a hand-picked hex in tokens.json). Light `gradient-end` = `gold.450` (must reach >= 5.0:1 under `--joy-text-on-accent` `#14253e`; `gold.500` `#a5802b` is only 4.20:1 and is NOT acceptable); dark `gradient-end` = `gold.400` (7.18:1 under the dark on-accent text).
6. **`useOverlay` must not re-dispose every render.** Its effect depends on `[open]` only; `onClose` is stored in a `useRef` updated each render (useEvent-style), so callers do not have to memoize.

---

## Phase A — foundation (sequential: A1 -> A6; each task is one worker)

**Interfaces produced (B, C and D consume these verbatim):**

DOM contract. Both twins render exactly this markup (attributes in brackets are conditional):

| Component | Root and children (class names) |
| --- | --- |
| Button | `button.joy-button.joy-button--{variant}.joy-button--{size}[.joy-button--loading][.joy-button--block][.joy-button--icon-only]` `[aria-busy=true]` `[disabled]` > `span.joy-button__icon.joy-button__icon--start`? + `span.joy-button__label` + `span.joy-button__icon.joy-button__icon--end`? + (loading) `span.joy-button__spinner[aria-hidden=true] > svg.joy-button__spinner-svg` |
| Input | `div.joy-input-wrapper.joy-input-wrapper--{size}[.--error][.--success][.--disabled][.--readonly]` > `span.joy-input-wrapper__prefix`? + `input.joy-input[aria-invalid=true][aria-describedby=<id>-message]` + `span.joy-input-wrapper__suffix`? + `p.joy-input-wrapper__message#<id>-message`? |
| InputNumber | `div.joy-input-number.joy-input-number--{size}[.--disabled][.--readonly][.--error]` > `input.joy-input-number__input[type=text][inputmode=decimal][role=spinbutton][aria-valuenow][aria-valuemin][aria-valuemax]` + `div.joy-input-number__handler-wrap` > `button.joy-input-number__handler-up[type=button][aria-label="Increase"][tabindex=-1]` + `button.joy-input-number__handler-down[...]` |
| Select | `div.joy-select-wrapper.joy-select-wrapper--{size}[.--error][.--disabled][.--open]` > `button.joy-select[type=button][role=combobox][aria-expanded][aria-haspopup=listbox][aria-controls=<id>-listbox][aria-invalid]` > (`span.joy-select__value` \| `span.joy-select__placeholder`) + `span.joy-select__arrow > svg`; `input[type=hidden][name][value]`; (open) `ul.joy-select__listbox.joy-overlay#<id>-listbox[role=listbox]` > `li.joy-select__option[role=option][aria-selected][.--active][.--disabled]`; `p.joy-select-wrapper__message`? |
| Checkbox | `label.joy-checkbox[.--disabled][.--indeterminate]` > `input[type=checkbox]` (no `role`, `indeterminate` set via ref/effect) + `span.joy-checkbox__box` + `span.joy-checkbox__label`? |
| Switch | `button.joy-switch[role=switch][aria-checked][.--checked][.--{size}]` > `span.joy-switch__thumb` + `span.joy-switch__label`? |
| RadioGroup | `div.joy-radio-group[role=radiogroup][.--vertical][.--error][aria-invalid]` > `label.joy-radio[.--disabled]` > `input[type=radio][tabindex=0 or -1]` + `span.joy-radio__circle` + `span.joy-radio__label` ...; `p.joy-radio-group__message`? |
| Slider | `div.joy-slider[.--disabled]` > `div.joy-slider__rail` > `div.joy-slider__track` + `div.joy-slider__handle[role=slider][tabindex=0][aria-valuenow][aria-valuemin][aria-valuemax][aria-disabled]` > `span.joy-slider__tooltip`? |
| Rate | `div.joy-rate[role=radiogroup][.--disabled][.--readonly]` > `button.joy-rate__star[type=button][role=radio][aria-checked][aria-label="N of M"][.--full][.--half][tabindex]` > `svg` |
| Segmented | `div.joy-segmented[role=radiogroup][.--sm]` > `button.joy-segmented__item[type=button][role=radio][aria-checked][tabindex][.--active][disabled]` |
| Form | `form.joy-form.joy-form--{layout}[.--label-left][.--no-colon]` with `style="--joy-form-label-width: <labelWidth>"` when set |
| FormItem | `div.joy-form-item[.--horizontal][.--error][.--required]` > `label.joy-form-item__label[for]` > (`span.joy-form-item__required` "*")? + text + `div.joy-form-item__control` > children + `p.joy-form-item__explain[role=alert]`? |
| DatePicker | `div.joy-date-picker.joy-date-picker--{size}[.--disabled][.--error]` > `input.joy-date-picker__input[type=date]` + `span.joy-date-picker__icon[aria-hidden]`; React custom calendar (if kept) renders `div.joy-date-picker__panel.joy-overlay[role=dialog]` |
| TimePicker | `div.joy-time-picker[.--disabled]` > `div.joy-input-wrapper > input.joy-input[readonly] + span.joy-input-wrapper__suffix > svg` + (open) `div.joy-time-picker__panel.joy-overlay[role=listbox]` > `div.joy-time-picker__column` > `button.joy-time-picker__cell[type=button][.--selected][aria-selected]` |
| DateRangePicker | `div.joy-date-range-picker[.--disabled][.--error]` > DatePicker + `span.joy-date-range-picker__sep` (text "to") + DatePicker |
| Mentions | `div.joy-mentions[.--disabled]` > `textarea.joy-textarea.joy-mentions__textarea[aria-autocomplete=list][aria-expanded][aria-controls]` + (open) `ul.joy-mentions__dropdown.joy-overlay[role=listbox]` > `li.joy-mentions__item[role=option][aria-selected][.--active]` > `span.joy-mentions__item-label` |
| Upload | `div.joy-upload[.--disabled]` > `input[type=file][hidden]` + (dragger ? `div.joy-upload-dragger[role=button][tabindex=0][.--dragover]` > `span.joy-upload-dragger__icon > svg` + `p.joy-upload-dragger__text` + `p.joy-upload-dragger__hint` : `button.joy-button.joy-button--outline.joy-button--md`) + `ul.joy-upload-list` > `li.joy-upload-list__item` > `span.joy-upload-list__item-icon > svg` + `span.joy-upload-list__item-info` + `button.joy-upload-list__item-remove[type=button][aria-label="Remove <name>"] > svg` |
| TreeSelect | `div.joy-treeselect[.--disabled][.--open]` > `div.joy-treeselect__control[role=combobox][aria-expanded][aria-haspopup=tree][tabindex=0]` > `span.joy-treeselect__tags > span.joy-treeselect__tag > button.joy-treeselect__tag-remove` \| `span.joy-treeselect__placeholder`, `button.joy-treeselect__clear`?, `span.joy-treeselect__arrow > svg`; (open) `div.joy-treeselect__panel.joy-overlay[role=tree]` > `div.joy-treeselect__node[role=treeitem][aria-expanded][aria-selected][.--selected][.--disabled]` > `button.joy-treeselect__node-toggle` + `span.joy-treeselect__node-checkbox`? + `span.joy-treeselect__node-label` |
| Cascader | `div.joy-cascader[.--disabled][.--open]` > `div.joy-cascader__control[role=combobox][aria-expanded][tabindex=0]` > `span.joy-cascader__value` \| `span.joy-cascader__placeholder`, `button.joy-cascader__clear`?, `span.joy-cascader__arrow > svg`; (open) `div.joy-cascader__panel.joy-overlay` > `div.joy-cascader__columns` > `ul.joy-cascader__column[role=menu]` > `li.joy-cascader__item[role=menuitem][tabindex][.--active][aria-expanded]` > label + `span.joy-cascader__item-arrow > svg`? |
| Transfer | `div.joy-transfer` > `div.joy-transfer__list` > `div.joy-transfer__header` > Checkbox + `span.joy-transfer__header-title` + `span.joy-transfer__header-count`; `div.joy-transfer__body` > `label.joy-transfer__item[.--selected]` > Checkbox + `span.joy-transfer__item-text`; `div.joy-transfer__empty`?; `div.joy-transfer__operations` > `button.joy-button.joy-button--solid.joy-button--sm.joy-button--icon-only[aria-label="Move right"] > svg` x2 |
| MarkdownEditor | `div.joy-markdown-editor[.--fullscreen][.--readonly]` > `div.joy-markdown-editor__toolbar[role=toolbar]` > `button.joy-markdown-editor__tool[type=button][aria-label][aria-pressed]` (icons from `@joymify/icons`) + `div.joy-markdown-editor__panes.joy-markdown-editor__panes--{mode}` > `textarea.joy-textarea.joy-markdown-editor__textarea` + `div.joy-markdown-editor__preview` |

Prop contract (framework-neutral names; casing rule applies to handlers and `class`). This is also the `CONTRACT` object in `scripts/parity-check.mjs` (A6):

- Button: `variant: 'solid'|'outline'|'ghost'|'danger'|'link'`, `size: 'sm'|'md'|'lg'`, `disabled`, `loading`, `block`, `iconOnly`, `type`, `iconStart`, `iconEnd` (Svelte `Snippet`, React `ReactNode`), `onclick/onClick`, `children`, `class/className`, `ref`.
- Input: `value`, `placeholder`, `disabled`, `readonly`, `error`, `success`, `message`, `size`, `type`, `id`, `name`, `prefix`, `suffix`, `oninput/onInput`, `onchange/onChange`.
- InputNumber: `value`, `min`, `max`, `step`, `precision`, `disabled`, `readonly`, `error`, `size`, `placeholder`, `id`, `name`, `onchange/onChange`.
- Select: `value`, `options` (`{ value, label, disabled? }[]`), `placeholder`, `disabled`, `error`, `message`, `size`, `name`, `id`, `onchange/onChange`.
- Checkbox: `checked`, `indeterminate`, `disabled`, `name`, `id`, `value`, `label`, `onchange/onChange`, `children`.
- Switch: `checked`, `disabled`, `label`, `size`, `id`, `name`, `onchange/onChange`.
- RadioGroup: `name`, `value`, `options`, `direction`, `disabled`, `error`, `message`, `onchange/onChange`.
- Slider: `value`, `min`, `max`, `step`, `disabled`, `showTooltip`, `label`, `onchange/onChange`.
- Rate: `count`, `value`, `allowHalf`, `disabled`, `readonly`, `label`, `onchange/onChange`.
- Segmented: `options`, `value`, `disabled`, `size`, `onchange/onChange`.
- Form: `layout`, `colon`, `labelAlign`, `labelWidth`, `disabled`, `onsubmit/onSubmit`, `children`.
- FormItem: `label`, `name`, `required`, `colon`, `labelAlign`, `labelWidth`, `error`, `help`, `rules`, `layout`, `children`.
- DatePicker: `value`, `min`, `max`, `placeholder`, `disabled`, `error`, `size`, `id`, `onchange/onChange`.
- TimePicker: `value`, `format`, `placeholder`, `disabled`, `id`, `onchange/onChange`.
- DateRangePicker: `value`, `min`, `max`, `disabled`, `error`, `startId`, `endId`, `onchange/onChange`.
- Mentions: `value`, `prefix`, `options`, `placeholder`, `rows`, `disabled`, `onchange/onChange`, `onselect/onSelect`.
- Upload: `fileList`, `dragger`, `accept`, `multiple`, `disabled`, `title`, `hint`, `onchange/onChange`, `onremove/onRemove`.
- TreeSelect: `treeData`, `value`, `defaultValue`, `multiple`, `placeholder`, `allowClear`, `disabled`, `treeDefaultExpandAll`, `onchange/onChange`.
- Cascader: `options`, `value`, `defaultValue`, `placeholder`, `allowClear`, `disabled`, `changeOnSelect`, `displayRender`, `onchange/onChange`.
- Transfer: `dataSource`, `targetKeys`, `titles`, `disabled`, `onchange/onChange`.
- MarkdownEditor: `value`, `defaultValue`, `height`, `mode`, `placeholder`, `readOnly`, `onchange/onChange`.
- Every component: `class/className`, `style`, `ref`, and `...rest` spread onto the root element (or onto the native input for Input, Checkbox, InputNumber, DatePicker).

Overlay primitive API (`packages/svelte/src/lib/overlay-utils.ts` and the byte-identical `packages/react/src/overlay-utils.ts`):

```ts
export interface OverlayRect { top: number; left: number; width: number; height: number; bottom: number; right: number }
export interface OverlayNode {
  classList: { add(...c: string[]): void; remove(...c: string[]): void };
  style: Record<string, string>;
  getBoundingClientRect(): OverlayRect;
  contains(node: unknown): boolean;
  focus(): void;
}
export interface OverlayWindow extends EventTarget { innerWidth: number; innerHeight: number; matchMedia?(query: string): { matches: boolean } }
export interface OverlayOptions {
  anchor: OverlayNode; panel: OverlayNode; onClose: () => void;
  win?: OverlayWindow; doc?: EventTarget; sheetMaxWidth?: number; gap?: number;
}
export interface OverlayHandle { update(): void; dispose(): void }
export const SHEET_MAX_WIDTH = 480;
export function positionPanel(anchor: OverlayRect, panel: OverlayRect, viewport: { width: number; height: number }, gap = 4): { top: number; left: number; above: boolean };
export function isOutside(target: unknown, roots: Array<{ contains(node: unknown): boolean }>): boolean;
export function isSheet(win: OverlayWindow, sheetMaxWidth = SHEET_MAX_WIDTH): boolean; // innerWidth < sheetMaxWidth || matchMedia?.('(pointer: coarse)').matches
export function openOverlay(opts: OverlayOptions): OverlayHandle;
```

`openOverlay` adds `joy-overlay` (and `joy-overlay--sheet` when `isSheet(win)`, else `joy-overlay--above` when flipped) to `panel.classList`, writes `panel.style.position = 'fixed'`, `top`, `left`, `minWidth` (anchor width) unless sheet, listens on `doc` for `keydown` (`event.key === 'Escape'` -> close) and `pointerdown` (`isOutside(event.target, [anchor, panel])` -> close), and on `win` for `resize` and `scroll` (capture) -> `update()`. Internal close = `dispose()` then `anchor.focus()` then `onClose()`. `dispose()` only removes listeners and the classes (used by effect cleanup; never calls `onClose`).

React hook (`packages/react/src/useOverlay.ts`), stable across renders without caller memoization:

```ts
import { useEffect, useRef, type RefObject } from 'react';
import { openOverlay } from './overlay-utils.js';
export function useOverlay(open: boolean, anchorRef: RefObject<HTMLElement | null>, panelRef: RefObject<HTMLElement | null>, onClose: () => void): void {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open || !anchorRef.current || !panelRef.current) return;
    const handle = openOverlay({ anchor: anchorRef.current, panel: panelRef.current, onClose: () => onCloseRef.current() });
    return () => handle.dispose();
  }, [open]);
}
```

Svelte usage: `$effect(() => { if (!open || !anchorEl || !panelEl) return; const h = openOverlay({ anchor: anchorEl, panel: panelEl, onClose: () => (open = false) }); return () => h.dispose(); });`

### A1 — dependencies, hero tokens, Button CSS, button tests

**Files:** `packages/svelte/package.json`, `packages/react/package.json`, `pnpm-lock.yaml` (importers `packages/react` at :36 and `packages/svelte` at :48), `packages/tokens/scripts/ramps.mjs`, `packages/tokens/src/tokens.json` (regenerated only), `packages/tokens/build.js` lines 151..255 (button block, INCLUDING `.joy-button--glass` 240..251 and `.joy-button:disabled` at 252), `packages/tokens/test/contrast.test.js`, `packages/tokens/test/wave-2.test.js` (new).

- [x] A1.1 Add `"@joymify/icons": "workspace:*"` to `dependencies` of `packages/svelte/package.json` and `packages/react/package.json`; run `pnpm install --offline` (falls back to `pnpm install` if the store misses a package); confirm `git diff --stat pnpm-lock.yaml` touches only the two importers. B and C lanes must never touch these three files again.
- [x] A1.2 In `packages/tokens/scripts/ramps.mjs`: add `{ step: '450', L: 0.67, C: 0.105 }` to `goldSteps` between 400 and 500 (tune `L` within 0.66..0.68 until `contrastRatio(hex, '#14253e') >= 5.0` AND luminance stays strictly between gold-400 and gold-500 so `ramps.test.js` keeps passing; expected hex ~`#b98f35`). Add to the generated semantic maps: light `accent.gradient-end = {color.gold.450}`, dark `accent.gradient-end = {color.gold.400}`; light and dark `accent.highlight = {color.gold.200}`; `elevation.accent-1` (light `0 1px 2px rgba(196, 154, 58, 0.28), 0 1px 3px rgba(20, 37, 62, 0.08)`, dark `0 0 0 1px rgba(218, 179, 98, 0.35), 0 1px 3px rgba(0, 0, 0, 0.4)`), `elevation.accent-2` (light `0 4px 10px -2px rgba(196, 154, 58, 0.35), 0 2px 4px -2px rgba(20, 37, 62, 0.08)`, dark `0 0 0 1px rgba(218, 179, 98, 0.45), 0 4px 12px rgba(0, 0, 0, 0.5)`), `elevation.accent-inset` (light `inset 0 2px 4px rgba(133, 101, 21, 0.35)`, dark `inset 0 2px 4px rgba(0, 0, 0, 0.45)`). Regenerate: `node packages/tokens/scripts/ramps.mjs` then `pnpm --filter @joymify/tokens build`. Do NOT hand-edit `tokens.json` or `dist/index.d.ts`.
- [x] A1.3 In `packages/tokens/test/contrast.test.js` add the pairs `text-on-accent on accent-gradient-end` and `status-danger-bg on status-danger-fg` (both themes, threshold 4.5). (Closes SVF-001, SVF-003 root cause.)
- [x] A1.4 Replace `build.js` lines 151..255 (`.joy-button__spinner-svg` through the old `.joy-button:disabled` at 252; `.joy-button--glass` 240..251 is kept verbatim in the middle, it is landing-owned, RXF-002 verify-only) with:

```css
.joy-button { appearance: none; -webkit-appearance: none; box-sizing: border-box; position: relative; display: inline-flex; align-items: center; justify-content: center; gap: var(--joy-space-2); font-family: var(--joy-font-family-sans); font-weight: 600; letter-spacing: -0.01em; line-height: 1.25; border: 1px solid transparent; border-radius: var(--joy-radius-control); cursor: pointer; user-select: none; -webkit-user-select: none; text-decoration: none; transition: transform var(--joy-duration-fast) var(--joy-ease-out), box-shadow var(--joy-duration-fast) var(--joy-ease-out), background-color var(--joy-duration-fast) var(--joy-ease-out), border-color var(--joy-duration-fast) var(--joy-ease-out), color var(--joy-duration-fast) var(--joy-ease-out); }
.joy-button:focus:not(:focus-visible) { outline: none; }
.joy-button:focus-visible { outline: var(--joy-focus-ring); outline-offset: 2px; }
.joy-button--sm { min-height: var(--joy-control-height-sm); padding: 0 var(--joy-space-3); font-size: var(--joy-font-size-sm); }
.joy-button--md { min-height: var(--joy-control-height-md); padding: 0 var(--joy-space-4); font-size: var(--joy-font-size-md); }
.joy-button--lg { min-height: var(--joy-control-height-lg); padding: 0 var(--joy-space-6); font-size: var(--joy-font-size-lg); }
.joy-button--block { display: flex; width: 100%; }
.joy-button--icon-only { padding: 0; }
.joy-button--icon-only.joy-button--sm { width: var(--joy-control-height-sm); }
.joy-button--icon-only.joy-button--md { width: var(--joy-control-height-md); }
.joy-button--icon-only.joy-button--lg { width: var(--joy-control-height-lg); }
.joy-button__icon { display: inline-flex; flex-shrink: 0; }
.joy-button__icon > svg { width: 1.25em; height: 1.25em; }
.joy-button__label { transition: opacity var(--joy-duration-fast) var(--joy-ease-out); }
.joy-button--loading { cursor: progress; }
.joy-button--loading .joy-button__label, .joy-button--loading .joy-button__icon { opacity: 0; }
.joy-button__spinner { position: absolute; inset: 0; display: grid; place-items: center; }
.joy-button__spinner-svg { width: 1.25em; height: 1.25em; animation: joy-spin 0.8s linear infinite; }
.joy-button--solid { background-color: var(--joy-accent-default); background-image: linear-gradient(180deg, var(--joy-accent-default), var(--joy-accent-gradient-end)); color: var(--joy-text-on-accent); border-color: var(--joy-accent-gradient-end); box-shadow: inset 0 1px 0 var(--joy-accent-highlight), var(--joy-elevation-accent-1); }
.joy-button--solid:hover:not(:disabled) { transform: translateY(-1px); box-shadow: inset 0 1px 0 var(--joy-accent-highlight), var(--joy-elevation-accent-2); }
.joy-button--solid:active:not(:disabled) { transform: none; background-image: none; background-color: var(--joy-accent-hover); box-shadow: var(--joy-elevation-accent-inset); }
.joy-button--outline { background-color: transparent; border-color: var(--joy-border-strong); color: var(--joy-text-primary); }
.joy-button--outline:hover:not(:disabled) { background-color: var(--joy-surface-raised); }
.joy-button--outline:active:not(:disabled) { background-color: var(--joy-surface-sunken); }
.joy-button--ghost { background-color: transparent; color: var(--joy-text-primary); }
.joy-button--ghost:hover:not(:disabled) { background-color: var(--joy-surface-raised); }
.joy-button--ghost:active:not(:disabled) { background-color: var(--joy-surface-sunken); }
.joy-button--danger { background-color: var(--joy-status-danger-fg); color: var(--joy-status-danger-bg); border-color: var(--joy-status-danger-border); box-shadow: var(--joy-elevation-1); }
.joy-button--danger:hover:not(:disabled) { transform: translateY(-1px); box-shadow: var(--joy-elevation-2); }
.joy-button--danger:active:not(:disabled) { transform: none; box-shadow: var(--joy-elevation-accent-inset); }
.joy-button--link { background: none; border-color: transparent; color: var(--joy-text-link); padding-inline: 0; }
.joy-button--link:hover:not(:disabled) { text-decoration: underline; text-underline-offset: 0.2em; }
/* .joy-button--glass block stays here unchanged (Wave 4 owns it) */
.joy-button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
```
  (Closes: SVF-001..007, SVF-009, RXF-047, RXF-094, RXF-136, RXF-137, RXF-138, RXF-165; RXF-002 verify-only: `.joy-button--glass` still reads `var(--joy-surface-raised)`/`var(--joy-text-primary)`.)
- [x] A1.5 Create `packages/tokens/test/wave-2.test.js` (node:test over `dist/theme.css` and `dist/index.d.ts`): the five new keys `accent-gradient-end`, `accent-highlight`, `elevation-accent-1`, `elevation-accent-2`, `elevation-accent-inset` appear both as `--joy-*` declarations in theme.css (light and dark blocks) and as members of the `JoyTokenName` union in `dist/index.d.ts`; `tokens.json.color.gold['450']` exists; theme.css contains `.joy-button--link`, `.joy-button__label`, `.joy-button--icon-only.joy-button--md`, `.joy-button--block`, `linear-gradient(180deg, var(--joy-accent-default), var(--joy-accent-gradient-end))`; theme.css does NOT contain `transition: all` inside the `.joy-button` rule; exactly one `.joy-button:disabled {` rule exists. Later A tasks append their assertions to this file.
- [x] A1.6 Verify: `pnpm --filter @joymify/tokens build && pnpm --filter @joymify/tokens test` exit 0; `bash scripts/lint-colors.sh` exit 0; `node apps/storybook-hub/build.js` exit 0; `pnpm --filter @joymify/svelte test && pnpm --filter @joymify/react test` exit 0. Commit: `feat(tokens): hero button tokens (gold-450 gradient end), button state matrix, icons dependency`.
- [x] A1.7 Quality gate: `code-reviewer` + `typescript-reviewer` on `git diff HEAD~1` (contrast math, ramps monotonicity, lockfile scope); refactor; re-run A1.6. Verdicts appended to `research/review-A.md`.

### A2 — text-like inputs, Select, Form CSS

**Files:** `packages/tokens/build.js` only: `/* Input */` block (303..327), `.joy-select-wrapper`..`.joy-select:disabled` (835..865), `.joy-input-number*` (2497..2554), `.joy-date-picker*` and `.joy-date-range-picker*` (1145..1215), `.joy-time-picker*` (2626..2667), `.joy-mentions*` (2579..2625), `.joy-markdown-editor*` (2967..), form block (2414..2495); `packages/tokens/test/wave-2.test.js`. Line numbers shift after A1 — locate by selector.

- [x] A2.1 Rewrite the blocks so these rules exist (all colours from tokens, sizes from `--joy-control-height-*`, no `font-size: 0.875rem` on any text input):
  - `.joy-input-wrapper { position: relative; display: inline-flex; flex-wrap: wrap; align-items: center; width: 100%; }`; `.joy-input, .joy-textarea, .joy-select, select.joy-select, .joy-input-number__input, .joy-date-picker__input { box-sizing: border-box; width: 100%; min-height: var(--joy-control-height-md); padding: 0 var(--joy-space-3); font-family: var(--joy-font-family-sans); font-size: var(--joy-font-size-md); color: var(--joy-text-primary); background: var(--joy-surface-card); border: 1px solid var(--joy-border-default); border-radius: var(--joy-radius-control); text-align: left; transition: border-color var(--joy-duration-fast) var(--joy-ease-out), background-color var(--joy-duration-fast) var(--joy-ease-out); }` with `::placeholder { color: var(--joy-text-muted) }`, `:hover:not(:disabled) { border-color: var(--joy-border-strong) }`, `:focus-visible { outline: var(--joy-focus-ring); outline-offset: 2px; border-color: var(--joy-border-focus) }`, `:focus:not(:focus-visible) { outline: none }`, `:disabled, .joy-input-wrapper--disabled .joy-input, .joy-select-wrapper--disabled .joy-select { background: var(--joy-surface-sunken); color: var(--joy-text-muted); cursor: not-allowed }`, `:read-only:not(:disabled), .joy-input-wrapper--readonly .joy-input { background: var(--joy-surface-sunken); border-style: dashed }`.
  - Size modifiers on wrappers: `.joy-input-wrapper--sm .joy-input { min-height: var(--joy-control-height-sm); font-size: var(--joy-font-size-sm) }`, `--lg` -> `control-height-lg`, `font-size-lg`; the same three for `.joy-select-wrapper--*`, `.joy-input-number--*`, `.joy-date-picker--*`. Then `@media (pointer: coarse) { .joy-input, .joy-textarea, .joy-select, .joy-input-number__input, .joy-date-picker__input { font-size: var(--joy-font-size-md); } }` (16px on touch kills iOS zoom at every size).
  - State modifiers: `.joy-input-wrapper--error .joy-input { border-color: var(--joy-status-danger-border) }`, `--success` -> `--joy-status-success-border`; `.joy-input-wrapper__message { flex-basis: 100%; margin: var(--joy-space-1) 0 0; font-size: var(--joy-font-size-sm); color: var(--joy-text-secondary) }`, `.joy-input-wrapper--error .joy-input-wrapper__message { color: var(--joy-status-danger-fg) }`, `--success` -> `--joy-status-success-fg`; `__prefix`/`__suffix { position: absolute; top: 0; bottom: 0; display: inline-flex; align-items: center; color: var(--joy-text-muted); pointer-events: none }` (`__prefix { left: var(--joy-space-3) }`, `__suffix { right: var(--joy-space-3) }`, `.joy-input-wrapper:has(.joy-input-wrapper__prefix) .joy-input { padding-left: var(--joy-space-8) }`, suffix mirror). Same `--error/--success/__message` trio for `.joy-select-wrapper`, `.joy-radio-group`, `.joy-input-number`.
  - `.joy-textarea { min-height: calc(var(--joy-control-height-md) * 2); padding: var(--joy-space-2) var(--joy-space-3); line-height: var(--joy-line-height-normal); resize: vertical }`.
  - Select (custom listbox + legacy native): `.joy-select { display: flex; align-items: center; justify-content: space-between; gap: var(--joy-space-2); cursor: pointer; padding-right: var(--joy-space-10) }`, `select.joy-select { -webkit-appearance: none; appearance: none; background-image: <existing currentColor chevron data-URI>; background-repeat: no-repeat; background-position: right var(--joy-space-3) center }`, `.joy-select__value { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }`, `.joy-select__placeholder { color: var(--joy-text-muted) }`, `.joy-select__arrow { position: absolute; right: var(--joy-space-3); top: 50%; transform: translateY(-50%); display: inline-flex; color: var(--joy-text-muted); pointer-events: none; transition: transform var(--joy-duration-fast) var(--joy-ease-out) }`, `.joy-select-wrapper--open .joy-select__arrow { transform: translateY(-50%) rotate(180deg) }`, `.joy-select__listbox { list-style: none; margin: 0; padding: var(--joy-space-1) }`, `.joy-select__option { display: flex; align-items: center; min-height: var(--joy-control-height-sm); padding: 0 var(--joy-space-3); border-radius: var(--joy-radius-control); cursor: pointer }`, `.joy-select__option:hover, .joy-select__option--active { background: var(--joy-surface-raised) }`, `.joy-select__option[aria-selected="true"] { background: var(--joy-accent-subtle); color: var(--joy-accent-text); font-weight: 600 }`, `.joy-select__option--disabled { opacity: 0.5; pointer-events: none }`, `.joy-overlay--sheet .joy-select__option { min-height: var(--joy-control-height-md) }`.
  - InputNumber handlers: `.joy-input-number__handler-up, .joy-input-number__handler-down { min-width: var(--joy-control-height-sm); flex: 1; display: grid; place-items: center; color: var(--joy-text-muted); background: transparent; border: 0; border-left: 1px solid var(--joy-border-subtle); cursor: pointer }`, `:hover { background: var(--joy-surface-raised); color: var(--joy-text-primary) }`, `:active { background: var(--joy-surface-sunken) }`, `.joy-input-number--disabled .joy-input-number__handler-up, ... { opacity: 0.5; cursor: not-allowed }`.
  - Form: `.joy-form { --joy-form-label-width: 10rem; display: flex; flex-direction: column; gap: var(--joy-space-4); font-family: var(--joy-font-family-sans) }`; `.joy-form-item { display: flex; flex-direction: column; gap: var(--joy-space-1) }`; `@media (min-width: 640px) { .joy-form--horizontal .joy-form-item, .joy-form-item--horizontal { display: grid; grid-template-columns: var(--joy-form-label-width) minmax(0, 1fr); column-gap: var(--joy-space-4); align-items: start } }` (below 640px everything stacks; delete every fixed `width`/`min-width`/`margin-left` on the label and control); `.joy-form-item__label { font-size: var(--joy-font-size-sm); font-weight: 500; color: var(--joy-text-primary) }`; `.joy-form-item__required { color: var(--joy-status-danger-fg); font-family: var(--joy-font-family-sans); margin-right: var(--joy-space-1) }` (remove `SimSun`); `.joy-form-item__explain { font-size: var(--joy-font-size-sm); color: var(--joy-text-secondary) }`, `.joy-form-item--error .joy-form-item__explain { color: var(--joy-status-danger-fg) }`; `.joy-form-item--error .joy-input, .joy-form-item--error .joy-select { border-color: var(--joy-status-danger-border) }`.
  - DatePicker: `.joy-date-picker { position: relative; display: inline-flex; width: 100% }`, `__input` shares the text-input base, `__icon { position: absolute; right: var(--joy-space-3); top: 50%; transform: translateY(-50%); color: var(--joy-text-muted); pointer-events: none }` (delete any `::-webkit-calendar-picker-indicator` that stretches over the input; SVF-071). DateRangePicker: `.joy-date-range-picker { display: flex; align-items: center; gap: var(--joy-space-2) }`, `__sep { color: var(--joy-text-muted); font-size: var(--joy-font-size-sm) }`, `@media (max-width: 640px) { .joy-date-range-picker { flex-direction: column; align-items: stretch } }`.
  - TimePicker panel content: `.joy-time-picker__panel { display: flex; padding: var(--joy-space-1) }` (position/z/surface come from `.joy-overlay`, A4), `__column { flex: 1; max-height: 240px; overflow-y: auto }`, `__cell { display: block; width: 100%; min-height: var(--joy-control-height-sm); padding: 0 var(--joy-space-3); text-align: left; background: transparent; border: 0; border-radius: var(--joy-radius-control); color: var(--joy-text-primary); cursor: pointer }`, `:hover { background: var(--joy-surface-raised) }`, `--selected { background: var(--joy-accent-subtle); color: var(--joy-accent-text); font-weight: 600 }`, `:focus-visible { outline: var(--joy-focus-ring); outline-offset: -2px }`. Delete `z-index: 50` and the phantom `--joy-color-surface-elevated` reference.
  - Mentions: textarea uses `.joy-textarea`; `.joy-mentions__dropdown { list-style: none; margin: 0; padding: var(--joy-space-1) }`, `__item { min-height: var(--joy-control-height-sm); display: flex; align-items: center; padding: 0 var(--joy-space-3); border-radius: var(--joy-radius-control); cursor: pointer }`, `__item--active, __item:hover { background: var(--joy-accent-subtle); color: var(--joy-accent-text) }`, `__item-label { font-weight: 500 }`.
  - MarkdownEditor: `.joy-markdown-editor { display: flex; flex-direction: column; border: 1px solid var(--joy-border-default); border-radius: var(--joy-radius-card); background: var(--joy-surface-card); overflow: hidden }`, `--fullscreen { position: fixed; inset: 0; z-index: var(--joy-z-modal); border-radius: 0 }`, `__toolbar { display: flex; flex-wrap: wrap; gap: var(--joy-space-1); padding: var(--joy-space-1); border-bottom: 1px solid var(--joy-border-subtle); background: var(--joy-surface-raised) }`, `__tool { min-width: var(--joy-control-height-sm); min-height: var(--joy-control-height-sm); display: grid; place-items: center; background: transparent; border: 0; border-radius: var(--joy-radius-control); color: var(--joy-text-secondary); cursor: pointer }`, `:hover { background: var(--joy-surface-sunken); color: var(--joy-text-primary) }`, `[aria-pressed="true"] { background: var(--joy-accent-subtle); color: var(--joy-accent-text) }`, `:focus-visible { outline: var(--joy-focus-ring); outline-offset: -2px }`, `__panes { display: grid; grid-template-columns: 1fr; min-height: 240px }`, `__panes--split { grid-template-columns: 1fr 1fr }`, `@media (max-width: 640px) { .joy-markdown-editor__panes--split { grid-template-columns: 1fr } }`, `__textarea { border: 0; border-radius: 0; min-height: 240px }`, `__preview { padding: var(--joy-space-4); overflow: auto; border-left: 1px solid var(--joy-border-subtle) }`.
  (Closes CSS side of: SVF-010..015, SVF-017, SVF-018, SVF-021, SVF-023..026, SVF-061..063, SVF-069, SVF-070, SVF-071, SVF-075, SVF-076, SVF-080, SVF-086, SVF-088, SVF-111, SVF-112, SVF-113; RXF-034, RXF-046, RXF-048, RXF-049, RXF-052, RXF-095, RXF-101, RXF-102, RXF-153 (verify), RXF-155, RXF-156, RXF-157.)
- [x] A2.2 Append to `wave-2.test.js`: theme.css contains `.joy-input-wrapper--success`, `.joy-select__listbox`, `.joy-select__option[aria-selected="true"]`, `.joy-textarea`, `@media (max-width: 640px)` blocks for `.joy-date-range-picker` and `.joy-markdown-editor__panes--split`; does NOT contain `SimSun`, `--joy-color-surface-elevated`, `z-index: 50;`; no `font-size: 0.875rem` inside the `.joy-input`, `.joy-select`, `.joy-textarea`, `.joy-input-number__input`, `.joy-date-picker__input` rules; every base control rule above uses `var(--joy-control-height-`.
- [x] A2.3 Verify: `pnpm --filter @joymify/tokens build && pnpm --filter @joymify/tokens test` exit 0; `bash scripts/lint-colors.sh` exit 0; `node apps/storybook-hub/build.js` exit 0. Commit: `feat(tokens): text input, select listbox and form state matrix from semantic tokens`.
- [x] A2.4 Quality gate as A1.7; re-run A2.3.

### A3 — choice controls CSS

**Files:** `packages/tokens/build.js` only: `.joy-switch*`, `.joy-checkbox*`, `.joy-radio*`, `.joy-slider*`, `.joy-segmented*`, `.joy-rate*` blocks (locate by selector); `packages/tokens/test/wave-2.test.js`.

- [x] A3.1 Rewrite:
  - Checkbox/Radio: root `label { display: inline-flex; align-items: center; gap: var(--joy-space-2); min-height: var(--joy-control-height-md); min-width: var(--joy-control-height-md); padding: 0 var(--joy-space-1); cursor: pointer; font-size: var(--joy-font-size-md); color: var(--joy-text-primary); user-select: none; border-radius: var(--joy-radius-control) }`; hidden native input stays `position:absolute; opacity:0; width:0; height:0`; box/circle `20px` square, `border: 1.5px solid var(--joy-border-strong); background: var(--joy-surface-card); transition: background-color ..., border-color ...`; `:hover` on label -> `border-color: var(--joy-accent-default)`; `input:focus-visible + .joy-checkbox__box { outline: var(--joy-focus-ring); outline-offset: 2px }` (same for radio); checked -> `background: var(--joy-accent-default); border-color: var(--joy-accent-default)` with the existing `::after` tick in `var(--joy-text-on-accent)`; `input:indeterminate + .joy-checkbox__box { background: var(--joy-accent-default); border-color: var(--joy-accent-default) }` and `input:indeterminate + .joy-checkbox__box::after { content: ''; width: 10px; height: 2px; border: 0; background: var(--joy-text-on-accent); transform: none }`; `--disabled { opacity: 0.5; cursor: not-allowed }`; radio checked dot 10px `var(--joy-accent-default)`; `.joy-radio-group[aria-invalid="true"] .joy-radio__circle { border-color: var(--joy-status-danger-border) }`.
  - Switch: `.joy-switch { display: inline-flex; align-items: center; gap: var(--joy-space-2); min-height: var(--joy-control-height-md); padding: 0 var(--joy-space-1); background: transparent; border: 0; border-radius: var(--joy-radius-pill); cursor: pointer; font-family: var(--joy-font-family-sans); font-size: var(--joy-font-size-md); color: var(--joy-text-primary) }`, `__thumb` (the track) `width: 44px; height: 24px; background: var(--joy-border-strong); border-radius: var(--joy-radius-pill); transition: background-color ...`, `::after` knob 20px `background: var(--joy-surface-card); box-shadow: var(--joy-elevation-1); transition: transform ...`, `--checked .joy-switch__thumb { background: var(--joy-accent-default) }`, `--checked .joy-switch__thumb::after { transform: translateX(20px) }`, `:focus-visible .joy-switch__thumb { outline: var(--joy-focus-ring); outline-offset: 2px }`, `:disabled { opacity: 0.5; cursor: not-allowed }`, `--sm .joy-switch__thumb { width: 36px; height: 20px }` (knob 16px, translate 16px), `__label { line-height: 1.25 }`.
  - Slider: `.joy-slider { position: relative; display: flex; align-items: center; min-height: var(--joy-control-height-md); padding: 0 10px }`, `__rail { position: relative; flex: 1; height: 4px; background: var(--joy-border-subtle); border-radius: var(--joy-radius-pill) }`, `__track { position: absolute; inset: 0 auto 0 0; background: var(--joy-accent-default); border-radius: inherit }` (no gradient), `__handle { position: absolute; top: 50%; width: 20px; height: 20px; transform: translate(-50%, -50%); background: var(--joy-surface-card); border: 2px solid var(--joy-accent-default); border-radius: 50%; box-shadow: var(--joy-elevation-1); cursor: grab; touch-action: none }`, `__handle::before { content: ''; position: absolute; inset: -12px }` (44px hit area), `__handle:focus-visible { outline: var(--joy-focus-ring); outline-offset: 2px }`, `__handle:active { cursor: grabbing; box-shadow: var(--joy-elevation-2) }`, `--disabled { opacity: 0.5; pointer-events: none }`, `__tooltip { position: absolute; bottom: calc(100% + var(--joy-space-2)); left: 50%; transform: translateX(-50%); padding: var(--joy-space-0-5) var(--joy-space-2); background: var(--joy-surface-inverse); color: var(--joy-text-inverse); border-radius: var(--joy-radius-control); font-size: var(--joy-font-size-xs); white-space: nowrap }`.
  - Rate: `.joy-rate { display: inline-flex }`, `__star { display: grid; place-items: center; width: var(--joy-control-height-md); height: var(--joy-control-height-md); padding: 0; background: transparent; border: 0; color: var(--joy-border-strong); cursor: pointer; transition: color ..., transform ... }`, `__star > svg { width: 20px; height: 20px }`, `__star--full, __star--half { color: var(--joy-accent-default) }`, `__star:hover { transform: scale(1.1) }`, `__star:focus-visible { outline: var(--joy-focus-ring); outline-offset: -2px; border-radius: var(--joy-radius-control) }`, `--disabled { opacity: 0.5; pointer-events: none }`, `--readonly .joy-rate__star { cursor: default; pointer-events: none }`.
  - Segmented: `.joy-segmented { display: inline-flex; padding: 0 var(--joy-space-0-5); background: var(--joy-surface-sunken); border: 1px solid var(--joy-border-subtle); border-radius: var(--joy-radius-control) }`, `__item { min-height: var(--joy-control-height-md); padding: 0 var(--joy-space-4); background: transparent; border: 0; border-radius: var(--joy-radius-control); color: var(--joy-text-secondary); font: inherit; font-size: var(--joy-font-size-sm); font-weight: 500; cursor: pointer; transition: background-color ..., color ..., box-shadow ... }`, `__item:hover:not(:disabled) { color: var(--joy-text-primary) }`, `__item--active { background: var(--joy-surface-card); color: var(--joy-text-primary); box-shadow: var(--joy-elevation-1) }`, `__item:focus-visible { outline: var(--joy-focus-ring); outline-offset: -2px }`, `__item:disabled { opacity: 0.5; cursor: not-allowed }`, `--sm .joy-segmented__item { min-height: var(--joy-control-height-sm) }`.
  (Closes CSS side of: SVF-028..031, SVF-033, SVF-035..038, SVF-039..042, SVF-044..051, SVF-053..060; RXF-015, RXF-016, RXF-017, RXF-050, RXF-051, RXF-096, RXF-097, RXF-098, RXF-123, RXF-124, RXF-125, RXF-164.)
- [x] A3.2 Append to `wave-2.test.js`: contains `.joy-checkbox input[type="checkbox"]:indeterminate`, `.joy-rate--readonly`, `.joy-segmented__item:focus-visible`, `.joy-slider__handle::before`, `.joy-switch--sm`; does NOT contain `linear-gradient(90deg`.
- [x] A3.3 Verify: `pnpm --filter @joymify/tokens build && pnpm --filter @joymify/tokens test` exit 0; `bash scripts/lint-colors.sh` exit 0; `node apps/storybook-hub/build.js` exit 0. Commit: `feat(tokens): checkbox, radio, switch, slider, rate, segmented state matrix with 44px hit areas`.
- [x] A3.4 Quality gate as A1.7; re-run A3.3.

### A4 — overlay, Upload, TreeSelect, Cascader, Transfer CSS

**Files:** `packages/tokens/build.js` only (new `/* Overlay primitive */` block after the button block; `.joy-upload*`, `.joy-treeselect*`, `.joy-cascader*`, `.joy-transfer*` blocks); `packages/tokens/test/wave-2.test.js`.

- [x] A4.1 Add `.joy-overlay { position: fixed; z-index: var(--joy-z-dropdown); box-sizing: border-box; background: var(--joy-surface-overlay); color: var(--joy-text-primary); border: 1px solid var(--joy-border-default); border-radius: var(--joy-radius-overlay); box-shadow: var(--joy-elevation-3); max-height: min(320px, 60vh); overflow: auto; animation: joy-fade-in var(--joy-duration-fast) var(--joy-ease-out) }`, `.joy-overlay--above { transform-origin: bottom }`, `.joy-overlay--sheet { top: auto !important; left: 0 !important; right: 0; bottom: 0; width: auto; min-width: 0; max-height: 70vh; border-radius: var(--joy-radius-overlay) var(--joy-radius-overlay) 0 0; padding-bottom: env(safe-area-inset-bottom) }`.
- [x] A4.2 TreeSelect: `.joy-treeselect { position: relative; display: block }`, `__control` shares the text-input base plus `display: flex; flex-wrap: wrap; gap: var(--joy-space-1); align-items: center; cursor: pointer; min-height: var(--joy-control-height-md); padding: var(--joy-space-1) var(--joy-space-10) var(--joy-space-1) var(--joy-space-3)`, `__tag { display: inline-flex; align-items: center; gap: var(--joy-space-1); padding: 0 var(--joy-space-2); min-height: 28px; background: var(--joy-accent-subtle); color: var(--joy-accent-text); border-radius: var(--joy-radius-pill); font-size: var(--joy-font-size-sm) }`, `__tag-remove { min-width: var(--joy-control-height-sm); min-height: 28px; background: transparent; border: 0; color: inherit; cursor: pointer }`, `__placeholder { color: var(--joy-text-muted) }`, `__clear`/`__arrow` absolutely positioned at right using `--joy-space-3`/`--joy-space-8`, `__panel { padding: var(--joy-space-1) }`, `__node { display: flex; align-items: center; gap: var(--joy-space-2); min-height: var(--joy-control-height-sm); padding: 0 var(--joy-space-2); border-radius: var(--joy-radius-control); cursor: pointer }`, `__node:hover { background: var(--joy-surface-raised) }`, `__node--selected { background: var(--joy-accent-subtle); color: var(--joy-accent-text); font-weight: 600 }`, `__node:focus-visible { outline: var(--joy-focus-ring); outline-offset: -2px }`, `__node-toggle { width: 24px; height: 24px; display: grid; place-items: center; background: transparent; border: 0; color: var(--joy-text-muted) }`, `__node-checkbox` = 16px box styled like `.joy-checkbox__box`, `--disabled { opacity: 0.5; pointer-events: none }`; remove the old `.joy-treeselect__node--selected` literal rule. Cascader: `.joy-cascader`, `__control` same as TreeSelect control, `__value`, `__placeholder`, `__clear`, `__arrow`, `__panel { padding: 0 }`, `__columns { display: flex }`, `__column { list-style: none; margin: 0; padding: var(--joy-space-1); min-width: 160px; max-height: 280px; overflow-y: auto; border-right: 1px solid var(--joy-border-subtle) }`, `__column:last-child { border-right: 0 }`, `__item { display: flex; align-items: center; justify-content: space-between; gap: var(--joy-space-2); min-height: var(--joy-control-height-sm); padding: 0 var(--joy-space-3); border-radius: var(--joy-radius-control); cursor: pointer }`, `__item:hover { background: var(--joy-surface-raised) }`, `__item--active { background: var(--joy-accent-subtle); color: var(--joy-accent-text); font-weight: 600 }`, `__item:focus-visible { outline: var(--joy-focus-ring); outline-offset: -2px }`, `.joy-overlay--sheet .joy-cascader__columns { flex-direction: column }`, `.joy-overlay--sheet .joy-cascader__column { min-width: 0; border-right: 0; border-bottom: 1px solid var(--joy-border-subtle); max-height: 40vh }`, `.joy-overlay--sheet .joy-cascader__item { min-height: var(--joy-control-height-md) }`; delete `.joy-cascader-menus`.
- [x] A4.3 Transfer: `.joy-transfer { display: flex; gap: var(--joy-space-3); align-items: stretch }`, `__list { flex: 1; min-width: 0; display: flex; flex-direction: column; border: 1px solid var(--joy-border-default); border-radius: var(--joy-radius-card); background: var(--joy-surface-card); min-height: 240px }`, `__header { display: flex; align-items: center; gap: var(--joy-space-2); padding: var(--joy-space-2) var(--joy-space-3); border-bottom: 1px solid var(--joy-border-subtle); background: var(--joy-surface-raised) }`, `__header-title { font-weight: 600 }`, `__header-count { margin-left: auto; color: var(--joy-text-muted); font-size: var(--joy-font-size-sm) }`, `__body { flex: 1; overflow: auto; padding: var(--joy-space-1) }`, `__item { display: flex; align-items: center; gap: var(--joy-space-2); min-height: var(--joy-control-height-sm); padding: 0 var(--joy-space-2); border-radius: var(--joy-radius-control); cursor: pointer }`, `__item:hover { background: var(--joy-surface-raised) }`, `__item--selected { background: var(--joy-accent-subtle) }`, `__item:focus-within { outline: var(--joy-focus-ring); outline-offset: -2px }`, `__item-text`, `__empty { padding: var(--joy-space-6); text-align: center; color: var(--joy-text-muted) }`, `__operations { display: flex; flex-direction: column; justify-content: center; gap: var(--joy-space-2) }`, `@media (max-width: 640px) { .joy-transfer { flex-direction: column } .joy-transfer__operations { flex-direction: row; justify-content: center } }`; delete the phantom `--joy-color-surface-elevated`. Upload: `.joy-upload-dragger { display: flex; flex-direction: column; align-items: center; gap: var(--joy-space-2); padding: var(--joy-space-8) var(--joy-space-4); border: 1px dashed var(--joy-border-strong); border-radius: var(--joy-radius-card); background: var(--joy-surface-card); cursor: pointer; text-align: center; transition: border-color ..., background-color ... }`, `:hover, --dragover { border-color: var(--joy-accent-default); background: var(--joy-accent-subtle) }`, `:focus-visible { outline: var(--joy-focus-ring); outline-offset: 2px }`, `__icon { color: var(--joy-accent-text) }`, `__icon > svg { width: 32px; height: 32px }`, `__text { margin: 0; font-weight: 500; color: var(--joy-text-primary) }`, `__hint { margin: 0; font-size: var(--joy-font-size-sm); color: var(--joy-text-muted) }`, `.joy-upload-list { list-style: none; margin: var(--joy-space-2) 0 0; padding: 0 }`, `__item { display: flex; align-items: center; gap: var(--joy-space-2); min-height: var(--joy-control-height-sm); padding: 0 var(--joy-space-2); border-radius: var(--joy-radius-control) }`, `__item:hover { background: var(--joy-surface-raised) }`, `__item-icon { color: var(--joy-accent-text); display: inline-flex }`, `__item-info { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap }`, `__item-remove { min-width: var(--joy-control-height-sm); min-height: var(--joy-control-height-sm); display: grid; place-items: center; background: transparent; border: 0; border-radius: var(--joy-radius-control); color: var(--joy-text-muted); cursor: pointer }`, `:hover { color: var(--joy-status-danger-fg); background: var(--joy-status-danger-bg) }`, `:focus-visible { outline: var(--joy-focus-ring); outline-offset: -2px }`.
- [x] A4.4 Remove the Wave 2 z-index literals from componentStyles: `z-index: 1000` (treeselect/cascader/mentions dropdowns), `z-index: 1050`, `z-index: 1100` (markdown fullscreen -> `var(--joy-z-modal)`). Toast (`1200`) and Message/Notification (`1010`) literals are Wave 3 and stay; expectation: `sed -n 136,3347p packages/tokens/build.js | grep -nE "z-index: (1000|1050|1100)\b"` returns nothing.
  (Closes CSS side of: SVF-089, SVF-090, SVF-092, SVF-093, SVF-096, SVF-099, SVF-100, SVF-104, SVF-106, SVF-107; RXF-053, RXF-103 (rules for the real classes), RXF-104, RXF-105, RXF-106, RXF-126, RXF-127, RXF-158, RXF-159.)
- [x] A4.5 Append to `wave-2.test.js`: contains `.joy-overlay--sheet`, `.joy-overlay--sheet .joy-cascader__columns`, `.joy-treeselect__panel`, `.joy-transfer__empty`, `@media (max-width: 640px)` block for `.joy-transfer`; does NOT contain `.joy-cascader-menus`, `z-index: 1000`, `z-index: 1050`, `z-index: 1100`.
- [x] A4.6 Verify: `pnpm --filter @joymify/tokens build && pnpm --filter @joymify/tokens test` exit 0; `bash scripts/lint-colors.sh` exit 0; `node apps/storybook-hub/build.js` exit 0. Commit: `feat(tokens): overlay primitive css, tree/cascader/transfer/upload rules, tokenised z-index`.
- [x] A4.7 Quality gate as A1.7; re-run A4.6.


### A5 — overlay primitive + unit tests (both packages)

**Files:** `packages/svelte/src/lib/overlay-utils.ts` (extend), `packages/react/src/overlay-utils.ts` (extend, byte-identical), `packages/react/src/useOverlay.ts` (new), `packages/svelte/src/lib/index.ts`, `packages/react/src/index.ts`, `packages/svelte/test/overlay-utils.test.js` (new), `packages/react/test/overlay-utils.test.js` (new).

- [x] A5.1 Append the API above to the Svelte file; `positionPanel`: `left = clamp(anchor.left, 8, viewport.width - panel.width - 8)`, `top = anchor.bottom + gap`; if `top + panel.height > viewport.height - 8` and `anchor.top - gap - panel.height >= 8` then `top = anchor.top - gap - panel.height`, `above = true`. `isSheet(win)` = `win.innerWidth < sheetMaxWidth || Boolean(win.matchMedia?.('(pointer: coarse)').matches)`. Copy byte-for-byte to the React file (`cmp` exit 0); create `useOverlay.ts` exactly as written above; export `openOverlay, positionPanel, isOutside, isSheet, SHEET_MAX_WIDTH` from both `index.ts` and `useOverlay` from the React index.
- [x] A5.2 Tests (`packages/svelte/test/overlay-utils.test.js`; the React copy changes only the import path to `../src/overlay-utils.ts`):

```js
import test from 'node:test';
import assert from 'node:assert';
import { positionPanel, isOutside, isSheet, openOverlay, SHEET_MAX_WIDTH } from '../src/lib/overlay-utils.ts';

const rect = (top, left, width, height) => ({ top, left, width, height, bottom: top + height, right: left + width });
const node = (r, name) => ({ name, focused: 0, classes: new Set(), style: {}, classList: { add(...c) { c.forEach((x) => this.classes.add(x)); }, remove(...c) { c.forEach((x) => this.classes.delete(x)); } }, getBoundingClientRect: () => r, contains(n) { return n === this || n?.owner === this; }, focus() { this.focused++; } });
const win = (innerWidth, coarse = false) => Object.assign(new EventTarget(), { innerWidth, innerHeight: 800, matchMedia: () => ({ matches: coarse }) });
const evt = (type, props) => { const e = new Event(type); for (const [k, v] of Object.entries(props)) Object.defineProperty(e, k, { value: v }); return e; };

test('positionPanel drops below the anchor and flips above when there is no room', () => {
  const vp = { width: 1280, height: 800 };
  assert.deepStrictEqual(positionPanel(rect(100, 40, 200, 40), rect(0, 0, 240, 300), vp), { top: 144, left: 40, above: false });
  assert.deepStrictEqual(positionPanel(rect(700, 40, 200, 40), rect(0, 0, 240, 300), vp), { top: 396, left: 40, above: true });
  assert.strictEqual(positionPanel(rect(100, 1200, 200, 40), rect(0, 0, 240, 300), vp).left, 1032);
});

test('isOutside is false for the anchor, the panel and their descendants', () => {
  const anchor = node(rect(0, 0, 10, 10), 'anchor'); const panel = node(rect(0, 0, 10, 10), 'panel');
  assert.strictEqual(isOutside({ owner: panel }, [anchor, panel]), false);
  assert.strictEqual(isOutside(anchor, [anchor, panel]), false);
  assert.strictEqual(isOutside({}, [anchor, panel]), true);
});

test('isSheet: narrow viewport or coarse pointer', () => {
  assert.strictEqual(isSheet(win(SHEET_MAX_WIDTH)), false);
  assert.strictEqual(isSheet(win(SHEET_MAX_WIDTH - 1)), true);
  assert.strictEqual(isSheet(win(1280, true)), true);
});

function harness(width = 1280) {
  const anchor = node(rect(100, 40, 200, 40), 'anchor'); const panel = node(rect(0, 0, 240, 200), 'panel');
  const doc = new EventTarget(); const w = win(width);
  let closed = 0; const handle = openOverlay({ anchor, panel, onClose: () => closed++, doc, win: w });
  return { anchor, panel, doc, win: w, handle, closed: () => closed };
}

test('Escape closes, returns focus and calls onClose once', () => {
  const h = harness();
  h.doc.dispatchEvent(evt('keydown', { key: 'Escape' }));
  assert.strictEqual(h.closed(), 1); assert.strictEqual(h.anchor.focused, 1); assert.ok(!h.panel.classes.has('joy-overlay'));
  h.doc.dispatchEvent(evt('keydown', { key: 'Escape' }));
  assert.strictEqual(h.closed(), 1, 'listeners are removed on close');
});

test('outside pointerdown closes, inside pointerdown does not', () => {
  const h = harness();
  h.doc.dispatchEvent(evt('pointerdown', { target: { owner: h.panel } }));
  assert.strictEqual(h.closed(), 0);
  h.doc.dispatchEvent(evt('pointerdown', { target: {} }));
  assert.strictEqual(h.closed(), 1);
});

test('narrow viewports get the sheet class and fixed positioning; dispose never calls onClose', () => {
  const h = harness(SHEET_MAX_WIDTH - 1);
  assert.ok(h.panel.classes.has('joy-overlay--sheet')); assert.strictEqual(h.panel.style.position, 'fixed');
  h.handle.dispose(); assert.strictEqual(h.closed(), 0);
});
```
  (Closes the mechanism for: SVF-073, SVF-074, SVF-078, SVF-084, SVF-085, SVF-097, SVF-101; RXF-135, RXF-143, RXF-144, RXF-145; wiring happens in B-L2/B-L4/C-L2/C-L4.)
- [x] A5.3 Verify: `pnpm --filter @joymify/svelte test && pnpm --filter @joymify/react test` exit 0 (6 new tests pass in each package); `cmp packages/svelte/src/lib/overlay-utils.ts packages/react/src/overlay-utils.ts` exit 0; `bash scripts/lint-colors.sh --strict packages/svelte/src/lib/overlay-utils.ts packages/react/src/overlay-utils.ts packages/react/src/useOverlay.ts` exit 0. Commit: `feat(overlay): shared fixed-position overlay primitive with escape, outside-click, focus return and sheet mode`.
- [x] A5.4 Quality gate: `code-reviewer` + `typescript-reviewer` (listener cleanup, capture-phase scroll, ref stability in `useOverlay`); refactor; re-run A5.3.

### A6 — parity contract script + gate wiring

**Files:** `scripts/parity-check.mjs` (new), `scripts/epic-check.sh`, `packages/tokens/test/wave-2.test.js`.

- [x] A6.1 `scripts/parity-check.mjs` (ESM, no dependencies). `const COMPONENTS = ['Button','Input','InputNumber','Select','Checkbox','Switch','RadioGroup','Slider','Rate','Segmented','Form','FormItem','DatePicker','TimePicker','DateRangePicker','Mentions','Upload','TreeSelect','Cascader','Transfer','MarkdownEditor']`. For each: read `packages/svelte/src/lib/<N>.svelte` and `packages/react/src/<N>.tsx`; `classes(src)` = set of `/\bjoy-[a-z0-9]+(?:[_-]+[a-z0-9]+)*/g` matches after replacing `{...}` and `${...}` holes with `*` and dropping tokens that end in `-` or `--`; `props(src)` = names from the Svelte `interface Props {` block and the React `export interface <N>Props` block (regex `/^\s*([A-Za-z]+)\??\s*:/gm`, plus `children`), normalised with `NORMALISE = { onchange: 'onChange', oninput: 'onInput', onselect: 'onSelect', onremove: 'onRemove', onsubmit: 'onSubmit', onclick: 'onClick', class: 'className' }`; React props inherited through `extends React.<X>HTMLAttributes` count as present for the fixed `HTML_INHERITED = ['value','placeholder','disabled','readonly','type','name','id','min','max','step','multiple','accept','onChange','onInput','onClick','onSubmit','style','className','children','ref']`. Read `packages/tokens/dist/theme.css` and compute `defined` = set of `.joy-*` class names in selectors. `CONTRACT` = the prop contract above as `{ Button: ['variant','size','disabled','loading','block','iconOnly','type','iconStart','iconEnd','onClick','children','className','ref'], ... }` for all 21. Modes: `--side svelte` or `--side react` (lane mode) reports for that side only: `classes without a theme.css rule` and `CONTRACT props not implemented`; default mode (twin mode) additionally reports `classes only in svelte`, `classes only in react`, `props only in svelte`, `props only in react`. Exit 1 on any non-empty list; print a markdown table; `--json` prints JSON.
- [x] A6.2 In `scripts/epic-check.sh` add `run_step "parity check" node scripts/parity-check.mjs` after the colour lint. (Gate 1 `scripts/precheck.sh` is wired in D3.) Append to `wave-2.test.js` an assertion that `scripts/parity-check.mjs` exists and exports/contains `COMPONENTS` with 21 names.
- [x] A6.3 Verify: `node scripts/parity-check.mjs --side svelte; node scripts/parity-check.mjs --side react` both run (exit 1 today, listing missing classes/props: this is the evidence for RXF-054..077 and RXF-094..106); `pnpm --filter @joymify/tokens test` exit 0; `bash scripts/lint-colors.sh` exit 0. Commit: `chore(gates): parity-check script (class + prop contract, theme coverage) wired into epic-check`.
- [x] A6.4 Quality gate as A1.7; re-run A6.3. After A6 lands, dispatch all eight B/C lanes in parallel.

## Phase B — Svelte lanes (B-L1..B-L4 run in parallel with each other and with C-L1..C-L4 after A6)

Each lane consumes the DOM contract, prop contract and overlay API from Phase A; follows the `svelte-5-runes` skill (`$props()` with `$bindable`, `$state`, `$derived`, `$effect`, `onclick` not `on:click`, `Snippet` for slots); deletes the component's `<style>` block; adds `...rest`, `ref = $bindable(null)` + `bind:this={ref}`, `class: className = ''`; never touches `package.json`, `pnpm-lock.yaml`, or files outside its list. Shared lane test block (each lane adds its own `test('Wave 2 <lane>: ...')` to `packages/svelte/test/components.test.js`; lanes append disjoint test functions, so merge conflicts are trivial line appends):

```js
const read = (n) => fs.readFileSync(path.resolve(`./src/lib/${n}.svelte`), 'utf8');
const assertWave2 = (name) => {
  const src = read(name);
  assert.ok(!src.includes('<style'), `${name} must not carry a scoped style block`);
  assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(|var\(--joy-[^,)]*,/.test(src), `${name} must not contain colour literals or fallbacks`);
  assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}★☆→]/u.test(src), `${name} must not contain emoji or arrow glyphs`);
  assert.ok(src.includes('...rest') && src.includes('bind:this={ref}'), `${name} must spread rest props and expose bind:ref`);
};
```

Lane verify (same for every B lane, with the lane's files): `pnpm --filter @joymify/svelte test` exit 0; `bash scripts/lint-colors.sh --strict <lane files>` exit 0; `node scripts/parity-check.mjs --side svelte` reports zero rows for the lane's components (other components may still fail until their lanes land); `node apps/storybook-hub/build.js` exit 0. Lane gate: `code-reviewer` + `typescript-reviewer` (with `svelte-5-runes` loaded) on `git diff HEAD~1`; refactor; re-verify; verdict appended to `research/review-B.md`.

### B-L1 — Button, Input, InputNumber, Select, DatePicker, DateRangePicker

**Owns:** `packages/svelte/src/lib/{Button,Input,InputNumber,Select,DatePicker,DateRangePicker}.svelte`, test block `Wave 2 B-L1` in `packages/svelte/test/components.test.js`.

- [x] B-L1.1 Button.svelte: props per contract with `let { variant = 'solid', size = 'md', disabled = false, loading = false, block = false, iconOnly = false, type = 'button', iconStart, iconEnd, onclick, children, class: className = '', ref = $bindable(null), ...rest }: Props = $props();`. Render `<button bind:this={ref} {type} class="joy-button joy-button--{variant} joy-button--{size} {loading ? 'joy-button--loading' : ''} {block ? 'joy-button--block' : ''} {iconOnly ? 'joy-button--icon-only' : ''} {className}" disabled={disabled || loading} aria-busy={loading || undefined} {onclick} {...rest}>` with `{#if iconStart}<span class="joy-button__icon joy-button__icon--start">{@render iconStart()}</span>{/if}<span class="joy-button__label">{@render children?.()}</span>{#if iconEnd}...{/if}{#if loading}<span class="joy-button__spinner" aria-hidden="true"><svg class="joy-button__spinner-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg></span>{/if}`. (SVF-008; finishes SVF-001..007, SVF-009.)
- [x] B-L1.2 Input.svelte: add `readonly`, `success`, `message`, `size = 'md'`, `id`, `name`, `prefix`/`suffix` snippets, `onchange`; `...rest` on the `<input>`; `aria-invalid={error || undefined}`, `aria-describedby` = `${id}-message` when a message renders. (SVF-010, SVF-011, SVF-015, SVF-016.) InputNumber.svelte: move `role="spinbutton"` + `aria-value*` onto the `<input>`, drop them from the wrapper; add `inputmode="decimal"`, `readonly`, `error`, `size`, `id`, `name`; handler buttons `type="button" tabindex="-1" aria-label`. (SVF-019, SVF-020, SVF-022.)
- [x] B-L1.3 Select.svelte: custom listbox per the DOM contract. `let open = $state(false); let activeIndex = $state(-1);` trigger `button.joy-select[role=combobox]`; `openOverlay` via `$effect` when `open`; keyboard on the trigger: `ArrowDown`/`ArrowUp` open and move `activeIndex` (skipping disabled), `Enter`/`Space` select `options[activeIndex]` and close, `Home`/`End`; options `onclick` select; hidden `<input type="hidden" {name} value={value ?? ''}>`; `error`, `message`, `size`, `aria-invalid`; `value = $bindable()` and `onchange?.(value)`. (SVF-023..027 wiring; spec bottom-sheet requirement.)
- [x] B-L1.4 DatePicker.svelte: delete `<style>` including `:global(.dark)` rules; add `size`, `...rest`, `ref`; icon `Calendar` from `@joymify/icons` inside `span.joy-date-picker__icon aria-hidden="true"`. (SVF-067, SVF-068, SVF-071, SVF-072.) DateRangePicker.svelte: delete `<style>`; separator text `to` in `span.joy-date-range-picker__sep`. (SVF-079, SVF-081, SVF-082.)
- [x] B-L1.5 Test block `Wave 2 B-L1`: `assertWave2` for the six files; Button includes `"'link'"`, `joy-button__label`, `joy-button--block`, `joy-button--icon-only`, `aria-busy`, `iconStart`, `iconEnd`; Input includes `joy-input-wrapper__message` and `readonly`; InputNumber includes `inputmode="decimal"` and `role="spinbutton"` on the input line; Select includes `role="combobox"`, `joy-select__listbox`, `openOverlay`, `type="hidden"`; DatePicker includes `@joymify/icons`; DateRangePicker does not include `→`.
- [x] B-L1.6 Verify (lane verify). Commit: `feat(svelte): Button, Input, InputNumber, Select listbox, DatePicker, DateRangePicker on the shared DOM contract`. Lane gate.

### B-L2 — TimePicker, Mentions, MarkdownEditor

**Owns:** `packages/svelte/src/lib/{TimePicker,Mentions,MarkdownEditor}.svelte`, test block `Wave 2 B-L2`.

- [x] B-L2.1 TimePicker.svelte: remove the inline `style` on the icon, use `span.joy-input-wrapper__suffix` with `Clock` icon; panel `class="joy-time-picker__panel"` (`joy-overlay` is added by the primitive), `bind:this={panelEl}`, `openOverlay` effect; cells `<button type="button" role="option" aria-selected>`; panel keyboard: `ArrowUp/ArrowDown` within a column, `ArrowLeft/ArrowRight` between columns, `Enter` selects. (SVF-073, SVF-074, SVF-077, SVF-078.)
- [x] B-L2.2 Mentions.svelte: replace the 200ms `onblur` timer with the primitive; `ArrowUp/ArrowDown` move `activeIndex`, `Enter`/`Tab` select; textarea `class="joy-textarea joy-mentions__textarea"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls`; items `role="option" aria-selected`. (SVF-084, SVF-085, SVF-087.)
- [x] B-L2.3 MarkdownEditor.svelte: delete `<style>`; toolbar buttons `class="joy-markdown-editor__tool"` with `aria-label`, `aria-pressed`, icons `Edit`/`Eye`/`Maximize2`/`Minimize2` from `@joymify/icons` (no `H`, `B`, emoji glyphs); panes `class="joy-markdown-editor__panes joy-markdown-editor__panes--{mode}"`; textarea `class="joy-textarea joy-markdown-editor__textarea"`; remove every inline `style` except `style="height: {height}"` on the root. (SVF-110, SVF-113, SVF-114, SVF-115.)
- [x] B-L2.4 Test block `Wave 2 B-L2`: `assertWave2` for the three files; each includes `openOverlay` (TimePicker, Mentions); Mentions does not include `setTimeout`; MarkdownEditor includes `joy-markdown-editor__tool` and `@joymify/icons`.
- [x] B-L2.5 Verify (lane verify). Commit: `feat(svelte): TimePicker, Mentions, MarkdownEditor use the overlay primitive and icons`. Lane gate.

### B-L3 — Checkbox, Switch, RadioGroup, Slider, Rate, Segmented, Form, FormItem

**Owns:** `packages/svelte/src/lib/{Checkbox,Switch,RadioGroup,Slider,Rate,Segmented,Form,FormItem}.svelte`, test block `Wave 2 B-L3`.

- [x] B-L3.1 Checkbox.svelte: remove `role="checkbox"` and `aria-checked` from the native input; add `indeterminate = false`, `value`; `$effect(() => { if (ref) ref.indeterminate = indeterminate; })`; label span `class="joy-checkbox__label"`; read `getContext('joy-form')?.disabled`. (SVF-032.) Switch.svelte: delete `<style>`; add `size = 'md'`, `id`, `name`. (SVF-033, SVF-034, SVF-035, SVF-037.)
- [x] B-L3.2 RadioGroup.svelte: roving tabindex (checked option, or first when none, gets `tabindex="0"`); `onkeydown` on the group: `ArrowUp/ArrowLeft` previous, `ArrowDown/ArrowRight` next, `Home`, `End`, wraps, selects on move and focuses the input; `error`, `message`, `aria-invalid`. (SVF-043.) Rate.svelte: stars become `<button type="button" role="radio" class="joy-rate__star" aria-checked aria-label="{i} of {count}" tabindex={i === Math.ceil(value || 1) ? 0 : -1}>`; `onkeydown`: `ArrowRight/ArrowUp` +step, `ArrowLeft/ArrowDown` -step (step = allowHalf ? 0.5 : 1), `Home` 0, `End` count; add `readonly`, `label` (`aria-label` on the group). (SVF-052, SVF-053.) Slider.svelte: verify `onkeydown` covers `ArrowLeft/Right/Up/Down`, `PageUp/PageDown` (10 steps), `Home`, `End`; add `label` -> `aria-label` on the handle, `aria-disabled`. Segmented.svelte: items `role="radio" aria-checked`, group `role="radiogroup"`, roving tabindex and `ArrowLeft/ArrowRight`; add `disabled`, `size`.
- [x] B-L3.3 Form.svelte: delete `<style>`; `disabled` cascaded via `setContext('joy-form', { layout, colon, labelAlign, labelWidth, disabled })`; root `class="joy-form joy-form--{layout} {labelAlign === 'left' ? 'joy-form--label-left' : ''} {colon ? '' : 'joy-form--no-colon'} {className}"`, `style={labelWidth ? \`--joy-form-label-width: ${labelWidth}\` : undefined}`. (SVF-065.) FormItem.svelte: delete `<style>`; `label for={name}` only when `name` is set; add `help` (`p.joy-form-item__explain` without `role="alert"`), `error` string keeps `role="alert"`. (SVF-064, SVF-066.)
- [x] B-L3.4 Test block `Wave 2 B-L3`: `assertWave2` for the eight files; change the existing Checkbox assertion to `assert.ok(!checkbox.includes('role="checkbox"'), 'Checkbox must not duplicate the native role')`; Checkbox includes `indeterminate`; RadioGroup, Segmented and Rate include `ArrowRight`; Rate includes `role="radio"`; Form includes `setContext('joy-form'`; FormItem includes `joy-form-item__explain`.
- [x] B-L3.5 Verify (lane verify). Commit: `feat(svelte): choice controls with keyboard operation, indeterminate checkbox, form context`. Lane gate.

### B-L4 — TreeSelect, Cascader, Transfer, Upload

**Owns:** `packages/svelte/src/lib/{TreeSelect,Cascader,Transfer,Upload}.svelte`, test block `Wave 2 B-L4`.

- [x] B-L4.1 TreeSelect.svelte: delete all 17 inline `style` declarations and the utility classes `joy-border`, `joy-surface-card`, `joy-text-primary`; render the DOM contract; panel `bind:this={panelEl}` + `openOverlay` effect; `ArrowUp/ArrowDown` move focus between nodes, `ArrowRight/ArrowLeft` expand/collapse, `Enter`/`Space` select. (SVF-094, SVF-095, SVF-097, SVF-098, SVF-099.) Cascader.svelte: same treatment; `ArrowRight` enters the next column, `ArrowLeft` returns. (SVF-101, SVF-102, SVF-103.)
- [x] B-L4.2 Transfer.svelte: operation buttons become `class="joy-button joy-button--solid joy-button--sm joy-button--icon-only"` with `ChevronRight`/`ChevronLeft` icons and `aria-label="Move right"`/`"Move left"`; delete `joy-button--primary`, `joy-color-text-muted` and the inline `#94a3b8`; rows are `label.joy-transfer__item` containing the Checkbox. (SVF-105, SVF-108, SVF-109.) Upload.svelte: delete inline colours and the `joy-color-*` utility classes; icons `Upload`, `File`, `Close` from `@joymify/icons`; remove button `aria-label="Remove {file.name}"`. (SVF-091, SVF-092.)
- [x] B-L4.3 Test block `Wave 2 B-L4`: `assertWave2` for the four files; TreeSelect and Cascader include `openOverlay` and do not include `style="` other than the root passthrough; Transfer includes `joy-button--icon-only` and not `joy-button--primary`; Upload includes `@joymify/icons`.
- [x] B-L4.4 Verify (lane verify). Commit: `feat(svelte): TreeSelect, Cascader, Transfer, Upload on the overlay primitive with real classes`. Lane gate.

## Phase C — React lanes (C-L1..C-L4 run in parallel with each other and with B-L1..B-L4 after A6)

Each lane consumes the same contracts plus `useOverlay`; every component is `React.forwardRef`, spreads `...rest`, builds class strings with a local `cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ')` (no empty modifiers, no trailing spaces); never touches `package.json`, `pnpm-lock.yaml`, or files outside its list. Shared lane test block for `packages/react/test/components.test.js`:

```js
const read = (n) => fs.readFileSync(path.resolve(`./src/${n}.tsx`), 'utf8');
const assertWave2 = (name) => {
  const src = read(name);
  assert.ok(src.includes('React.forwardRef') && src.includes('...rest'), `${name} must forwardRef and spread rest`);
  assert.ok(!/#[0-9a-fA-F]{3,8}\b|rgba?\(|var\(--joy-[^,)]*,/.test(src), `${name} must not contain colour literals or fallbacks`);
  assert.ok(!/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}★☆→]/u.test(src), `${name} must not contain emoji or arrow glyphs`);
  assert.ok(!/--\$\{[^}]*\}\s*[`"']/.test(src) || src.includes('cx('), `${name} must not emit empty modifiers`);
};
```

Lane verify: `pnpm --filter @joymify/react test` exit 0; `bash scripts/lint-colors.sh --strict <lane files>` exit 0; `node scripts/parity-check.mjs --side react` reports zero rows for the lane's components; `node apps/storybook-hub/build.js` exit 0. Lane gate: `code-reviewer` + `typescript-reviewer` on `git diff HEAD~1` (controlled/uncontrolled correctness, ref merging, effect deps, keyboard handlers); refactor; re-verify; verdict appended to `research/review-C.md`.

### C-L1 — Button, Input, InputNumber, Select, DatePicker, DateRangePicker

**Owns:** `packages/react/src/{Button,Input,InputNumber,Select,DatePicker,DateRangePicker}.tsx`, test block `Wave 2 C-L1` in `packages/react/test/components.test.js`.

- [x] C-L1.1 Button.tsx: `ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>` with explicit `variant?: 'solid'|'outline'|'ghost'|'danger'|'link'`, `size`, `loading`, `disabled`, `block`, `iconOnly`, `type`, `iconStart?: React.ReactNode`, `iconEnd?: React.ReactNode`; DOM contract; `aria-busy={loading || undefined}`. (RXF-054, RXF-055, RXF-056, RXF-094.)
- [x] C-L1.2 Input.tsx: explicit `value`, `placeholder`, `disabled`, `readOnly`, `type`, `error`, `success`, `message`, `size`, `prefix`, `suffix`, `onInput`, `onChange`; wrapper modifiers; `aria-invalid`, `aria-describedby`. (RXF-048, RXF-057, RXF-058.) InputNumber.tsx: controlled `value` + `onChange(value: number | null)` with `defaultValue` fallback; `role="spinbutton"` + `aria-value*` on the input; `inputMode="decimal"`; handler buttons `type="button" tabIndex={-1} aria-label`; `joy-input-number--disabled`. (RXF-059, RXF-095, RXF-134, RXF-140.)
- [x] C-L1.3 Select.tsx: custom listbox per the DOM contract (`options: { value: string; label: string; disabled?: boolean }[]`, `value`, `onChange(value)`, `placeholder`, `disabled`, `error`, `message`, `size`, `name`, `id`); `useOverlay(open, triggerRef, listRef, close)`; same keyboard as B-L1.3; hidden `<input type="hidden" name value>`; `forwardRef<HTMLButtonElement>` on the trigger. (RXF-060; spec bottom-sheet requirement.)
- [x] C-L1.4 DatePicker.tsx: explicit `min`, `max`, `placeholder`, `disabled`, `id`, `size`; remove `#ffffff`/`#f1f5f9`; if the custom calendar stays it renders `div.joy-date-picker__panel` through `useOverlay` and announces month changes in an `aria-live="polite"` `span.joy-date-picker__live`; icon `Calendar` from `@joymify/icons/react`. (RXF-009, RXF-049, RXF-069, RXF-147.) DateRangePicker.tsx: add `startId`, `endId`; separator text `to`; `forwardRef<HTMLDivElement>`. (RXF-024, RXF-071.)
- [x] C-L1.5 Test block `Wave 2 C-L1`: `assertWave2` for the six files; Button includes `"'link'"`, `joy-button__label`, `aria-busy`, `iconStart`, `iconEnd`, `cx(`; Select includes `role="combobox"`, `useOverlay(`, `type="hidden"`; InputNumber includes `inputMode="decimal"`; DatePicker imports `@joymify/icons/react`; DateRangePicker does not include `→`.
- [x] C-L1.6 Verify (lane verify). Commit: `feat(react): Button, Input, InputNumber, Select listbox, DatePicker, DateRangePicker match the Svelte DOM contract`. Lane gate.

### C-L2 — TimePicker, Mentions, MarkdownEditor

**Owns:** `packages/react/src/{TimePicker,Mentions,MarkdownEditor}.tsx`, test block `Wave 2 C-L2`.

- [x] C-L2.1 TimePicker.tsx: drop `#64748b`, use `span.joy-input-wrapper__suffix` + `Clock` icon; `useOverlay`; `value`/`onChange` controlled with `defaultValue` fallback; delete `joy-color-text-muted`; keyboard as B-L2.1. (RXF-008, RXF-070, RXF-101, RXF-135.)
- [x] C-L2.2 Mentions.tsx: `value`/`onChange`/`onSelect`; `useOverlay`; `aria-selected={index === activeIndex}`; ArrowUp/ArrowDown/Enter/Tab. (RXF-072, RXF-102, RXF-142.)
- [x] C-L2.3 MarkdownEditor.tsx: toolbar icons from `@joymify/icons/react` replacing the emoji; class names per contract (`__tool`, `__panes--{mode}`, `__textarea`); delete inline `#ffffff`; `forwardRef<HTMLDivElement>`. (RXF-030, RXF-077, RXF-127.)
- [x] C-L2.4 Test block `Wave 2 C-L2`: `assertWave2` for the three files; TimePicker and Mentions include `useOverlay(`; MarkdownEditor imports `@joymify/icons/react` and includes `joy-markdown-editor__tool`.
- [x] C-L2.5 Verify (lane verify). Commit: `feat(react): TimePicker, Mentions, MarkdownEditor use useOverlay and icons`. Lane gate.

### C-L3 — Checkbox, Switch, RadioGroup, Slider, Rate, Segmented, Form, FormItem

**Owns:** `packages/react/src/{Checkbox,Switch,RadioGroup,Slider,Rate,Segmented,Form,FormItem}.tsx`, test block `Wave 2 C-L3`.

- [x] C-L3.1 Checkbox.tsx: remove `role="checkbox"`; explicit `checked`, `disabled`, `name`, `id`, `value`, `indeterminate`, `onChange`; `useEffect` sets `inputRef.current.indeterminate`; merge forwarded and internal refs; read `FormContext.disabled`. (RXF-061, RXF-139.) Switch.tsx: `forwardRef<HTMLButtonElement>`, `size`, `id`, `name`. (RXF-051, RXF-062, RXF-096, RXF-164.)
- [x] C-L3.2 RadioGroup.tsx: controlled `value`/`onChange` with `defaultValue` fallback; roving tabindex + arrow keys as B-L3.2; `error`, `message`, `aria-invalid`; `forwardRef<HTMLDivElement>`. (RXF-063, RXF-131.) Slider.tsx: controlled `value`/`onChange`; `onKeyDown` on the handle: ArrowLeft/Down -step, ArrowRight/Up +step, PageDown/PageUp 10 steps, Home/End; `label`. (RXF-064, RXF-097, RXF-132.) Rate.tsx: replace `★`/`☆` with the inline SVG polygon from `Rate.svelte:84`; `hoverValue` state drives `--full`/`--half` preview; `readonly`; buttons `role="radio"` with roving tabindex and arrow keys. (RXF-031, RXF-065, RXF-098, RXF-133.) Segmented.tsx: `onChange: (value: string) => void`, explicit `disabled`, `size`; arrow-key roving. (RXF-050, RXF-066, RXF-141.)
- [x] C-L3.3 Form.tsx: `onSubmit` typed; `disabled` cascaded through `FormContext = React.createContext<{ layout; colon; labelAlign; labelWidth; disabled }>` (exported from Form.tsx and imported by Checkbox/Switch/RadioGroup in this lane; Input/Select in C-L1 read it only if C-L1 lands first, otherwise a follow-up line in D3); class via `cx` (no `joy-form--` empty modifier, no `joy-form-label-width` class; width goes to `style={{ '--joy-form-label-width': labelWidth } as React.CSSProperties}`). (RXF-067, RXF-099.) FormItem.tsx: class names per contract, `help`, `label htmlFor={name}` only when `name` is set. (RXF-068, RXF-100.)
- [x] C-L3.4 Test block `Wave 2 C-L3`: `assertWave2` for the eight files; change the existing Checkbox assertion to reject `role="checkbox"`; Checkbox includes `indeterminate`; Rate does not include `★`; RadioGroup, Segmented, Rate include `ArrowRight`; Form includes `createContext` and `cx(`.
- [x] C-L3.5 Verify (lane verify). Commit: `feat(react): choice controls with keyboard operation, indeterminate checkbox, form context; forwardRef everywhere`. Lane gate.

### C-L4 — TreeSelect, Cascader, Transfer, Upload

**Owns:** `packages/react/src/{TreeSelect,Cascader,Transfer,Upload}.tsx`, test block `Wave 2 C-L4`.

- [x] C-L4.1 TreeSelect.tsx: delete the `joy-border`/`joy-surface-card`/`joy-text-primary` utilities and every inline colour and `z-index`; `useOverlay`; selected text via `joy-treeselect__node--selected`; tree keyboard as B-L4.1. (RXF-012, RXF-074, RXF-104, RXF-143, RXF-144, RXF-158.) Cascader.tsx: same; column keyboard. (RXF-053, RXF-075, RXF-105, RXF-145, RXF-146, RXF-159.)
- [x] C-L4.2 Transfer.tsx: delete `#ffffff` list surfaces and `joy-button--primary`; icon-only Buttons with `ChevronRight`/`ChevronLeft`; `onChange(targetKeys, direction, moveKeys)` kept and documented; rows as `label.joy-transfer__item`. (RXF-076, RXF-106, RXF-126.) Upload.tsx: `📁` -> `Upload` icon; `File`/`Close` icons in the list; delete `joy-color-brand-primary`/`joy-color-text-muted` utilities; `forwardRef<HTMLDivElement>`. (RXF-032, RXF-073, RXF-103.)
- [x] C-L4.3 Test block `Wave 2 C-L4`: `assertWave2` for the four files; TreeSelect and Cascader include `useOverlay(`; Transfer includes `joy-button--icon-only` and not `joy-button--primary`; Upload imports `@joymify/icons/react` and does not include `📁`.
- [x] C-L4.4 Verify (lane verify). Commit: `feat(react): TreeSelect, Cascader, Transfer, Upload on useOverlay with real classes`. Lane gate.

## Phase D — hub stories, contracts, evidence, gates, docs (sequential D1 -> D3, after all eight lanes are merged into `feat/F-037`)

### D1 — hub state matrices

**Files:** `apps/storybook-hub/build.js`.

- [x] D1.1 Add two generator functions after the manifest load (line 38): `renderButtonMatrix()` returns, for `['solid','outline','ghost','danger','link'] x ['sm','md','lg'] x ['default','hover','focus','active','disabled','loading']`, one `<button class="joy-button joy-button--{v} joy-button--{s} [joy-button--loading]" [disabled] data-state="{state}">` (hover/focus/active rows are labelled only; Playwright drives real states) plus an icon-only row (`ChevronRight` SVG path inline) and a `joy-button--block` row, wrapped in `<div class="component-canvas" data-matrix="button" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); gap: var(--joy-space-3);">`. `renderFormsMatrix()` returns, inside `<div class="component-canvas" data-matrix="forms">`, the DOM-contract markup for Input (default/error/success/disabled/readonly, sm/md/lg, with prefix/suffix and message), InputNumber, Select as `button[role=combobox]` (default/error/disabled) plus one static open listbox (`ul.joy-select__listbox.joy-overlay.joy-overlay--sheet`, `data-sheet-demo`), Checkbox (unchecked/checked/indeterminate via `data-indeterminate` + inline script, disabled), Switch (off/on/disabled/sm), RadioGroup (horizontal/vertical/error), Slider, Rate (default/half/readonly/disabled), Segmented, Form horizontal + vertical, DatePicker, TimePicker with a static open panel, DateRangePicker, Mentions with static open dropdown, Upload dragger + list, TreeSelect and Cascader each with a static open panel carrying `joy-overlay joy-overlay--sheet` (`data-sheet-demo`), Transfer, MarkdownEditor split mode. Static open panels sit inside a `div.hub-sheet-demo` with a fixed height (`min-height: 360px`) so a `position: fixed` sheet does not overlap the rest of the page: give the demo wrapper `transform: translateZ(0)` so the fixed panel is contained by it (this is the documented containing-block limitation used on purpose). Insert `renderButtonMatrix()` inside `#view-button` after the existing playground box (heading `<h3>State matrix</h3>`), and `renderFormsMatrix()` at the top of `#view-forms`, replacing the native `<select class="joy-select">` samples in that view with the combobox markup. All new markup uses tokens only (no inline literals; existing hub literals are Wave 5's).
- [x] D1.2 Verify: `node apps/storybook-hub/build.js` exit 0; `grep -c 'data-matrix="' apps/storybook-hub/dist/index.html` = 2; `grep -c 'data-sheet-demo' apps/storybook-hub/dist/index.html` >= 3; `PLAYWRIGHT_PORT=6116 pnpm --filter storybook-hub exec playwright test` (existing contracts still green). Commit: `feat(hub): button and form-control state matrices with static open sheet stories`.
- [x] D1.3 Quality gate: `code-reviewer` on `git diff HEAD~1` (markup matches the DOM contract; no literals); refactor; re-run D1.2. Verdict in `research/review-D.md`.

### D2 — Playwright contracts, screenshots, taste review

**Files:** `apps/storybook-hub/tests/forms-contracts.spec.ts` (new), `apps/storybook-hub/tests/screens-f037.spec.ts` (new), `research/screens/*.png`, `research/screens/README.md`, `packages/tokens/build.js` only if the taste review returns FIX.

- [x] D2.1 `forms-contracts.spec.ts`:

```ts
import { test, expect, type Page } from '@playwright/test';
const themes = ['light', 'dark'] as const;
async function open(page: Page, hash: string, theme: string) {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/#${hash}`); await page.waitForLoadState('networkidle');
  await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
}
test.describe('F-037 form control contracts', () => {
  for (const theme of themes) {
    test(`button matrix renders every variant, size and state in ${theme}`, async ({ page }) => {
      await open(page, 'button', theme);
      const matrix = page.locator('[data-matrix="button"]');
      for (const v of ['solid', 'outline', 'ghost', 'danger', 'link']) for (const s of ['sm', 'md', 'lg']) await expect(matrix.locator(`.joy-button--${v}.joy-button--${s}`).first()).toBeVisible();
      await expect(matrix.locator('.joy-button--loading .joy-button__spinner-svg').first()).toBeVisible();
      const solid = matrix.locator('.joy-button--solid.joy-button--md[data-state="default"]');
      const before = await solid.evaluate((el) => getComputedStyle(el).boxShadow);
      await solid.hover(); await page.waitForTimeout(200);
      expect(await solid.evaluate((el) => getComputedStyle(el).transform)).not.toBe('none');
      expect(await solid.evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe(before);
      await solid.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
      expect(await solid.evaluate((el) => getComputedStyle(el).outlineWidth)).toBe('2px');
      expect(await matrix.evaluate((el) => [...el.querySelectorAll('.joy-button')].map((b) => getComputedStyle(b).backgroundImage).some((bg) => /rgb\((124, 58, 237|139, 92, 246)\)/.test(bg)))).toBe(false);
    });
    test(`44px touch targets at 375px in ${theme}`, async ({ page }, testInfo) => {
      test.skip(testInfo.project.name !== 'mobile-chrome', 'coarse pointer only');
      for (const hash of ['button', 'forms']) {
        await open(page, hash, theme);
        const short = await page.locator(`#view-${hash} .joy-button, #view-${hash} .joy-input, #view-${hash} .joy-select, #view-${hash} .joy-checkbox, #view-${hash} .joy-switch, #view-${hash} .joy-radio, #view-${hash} .joy-segmented__item, #view-${hash} .joy-rate__star`).evaluateAll((els) => els.filter((el) => (el as HTMLElement).offsetParent !== null).map((el) => [el.className, el.getBoundingClientRect().height]).filter(([, h]) => (h as number) < 44));
        expect(short, `${hash}: every control >= 44px`).toEqual([]);
      }
    });
    test(`no horizontal overflow in the forms view in ${theme}`, async ({ page }) => {
      await open(page, 'forms', theme);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
    });
    test(`Select and Cascader panels are bottom sheets under 480px in ${theme}`, async ({ page }) => {
      await open(page, 'forms', theme);
      for (const sel of ['.joy-select__listbox', '.joy-cascader__panel', '.joy-treeselect__panel']) {
        const panel = page.locator(`${sel}.joy-overlay--sheet`).first();
        const box = await panel.boundingBox(); expect(box, sel).not.toBeNull();
        expect(Math.round(box!.width)).toBe(375);
        expect(await panel.evaluate((el) => getComputedStyle(el).position)).toBe('fixed');
        expect(await panel.evaluate((el) => getComputedStyle(el).zIndex)).toBe('1000');
      }
    });
  }
});
```
  Run `PLAYWRIGHT_PORT=6116 pnpm --filter storybook-hub exec playwright test tests/forms-contracts.spec.ts`; expect green on both projects (the sheet's width is measured against the `hub-sheet-demo` containing block, which must be full-width at 375px).
- [x] D2.2 `screens-f037.spec.ts` mirroring `screens-f036.spec.ts` (env flag `F037_SCREENS=1`, `screenshotsDir` = `../../../.claude/refined_backlog/F-037-wave-2-hero-grade-button-and-form-contro/research/screens`, views `button` and `forms`, themes light/dark, viewports 375x812 and 1280x800, files `{view}-{theme}-{w}x{h}.png`, full-page). Run `F037_SCREENS=1 PLAYWRIGHT_PORT=6116 pnpm --filter storybook-hub exec playwright test tests/screens-f037.spec.ts --project=desktop-chrome`; expect 8 PNGs:
  - `research/screens/button-light-1280x800.png`
  - `research/screens/button-light-375x812.png`
  - `research/screens/button-dark-1280x800.png`
  - `research/screens/button-dark-375x812.png`
  - `research/screens/forms-light-1280x800.png`
  - `research/screens/forms-light-375x812.png`
  - `research/screens/forms-dark-1280x800.png`
  - `research/screens/forms-dark-375x812.png`
- [x] D2.3 Dispatch a Claude reviewer with the `impeccable` skill loaded on the four `button-*.png` (taste verdict on depth, hover lift, focus ring, dark gold, 375px layout) and a `code-reviewer` pass on the four `forms-*.png` (no purple, no white flashes in dark, no overflow, 44px targets visually plausible); write both verdicts to `research/screens/README.md`; a FIX verdict is applied in `packages/tokens/build.js` (CSS only), rebuilt, and screenshots regenerated before D2.4.
- [x] D2.4 Verify: `PLAYWRIGHT_PORT=6116 pnpm --filter storybook-hub exec playwright test` exit 0 (all specs, both projects); `pnpm --filter @joymify/tokens test` exit 0. Commit: `test(hub): F-037 form-control contracts and visual evidence`.
- [x] D2.5 Quality gate: `code-reviewer` + `typescript-reviewer` on the two spec files; refactor; re-run D2.4. Verdict appended to `research/review-D.md`.

### D3 — gates on the ship path, docs, twin parity, final verify

**Files:** `scripts/lint-colors.sh`, `scripts/test-lint-colors.sh`, `scripts/precheck.sh`, `README.md`, `apps/storybook-hub/build.js` (props-spec rows only), this `plan.md`.

- [x] D3.1 `scripts/lint-colors.sh`: directly after the default `targets=(...)` block (line 30) add

```bash
# Files that are hard failures even in default mode. Waves flip their own files here;
# the directory-wide flip happens when the last file in a package is clean.
strict_file_pattern='^packages/(svelte/src/lib|react/src)/(Button|Input|InputNumber|Select|Checkbox|Switch|RadioGroup|Slider|Rate|Segmented|Form|FormItem|DatePicker|TimePicker|DateRangePicker|Mentions|Upload|TreeSelect|Cascader|Transfer|MarkdownEditor)\.(svelte|tsx)$|^packages/(svelte/src/lib|react/src)/(overlay-utils|useOverlay)\.ts$'
```
  and in `scan_target`'s per-file loop replace `if $strict; then` with `if $strict || [[ $file =~ $strict_file_pattern ]]; then` (`$file` is repo-relative because `rg --files` runs on the relative target). Extend `scripts/test-lint-colors.sh`: `mkdir -p "$fixture_dir/packages/react/src"`, copy the literal fixture to `"$fixture_dir/packages/react/src/Button.tsx"`, and assert `(cd "$fixture_dir" && bash "$repo_root/scripts/lint-colors.sh" packages/react/src)` exits non-zero in default mode.
- [x] D3.2 `scripts/precheck.sh` (Gate 1, the ship path): insert between step 2 (`bash scripts/lint-colors.sh`, line 34) and step 3 (`node apps/storybook-hub/build.js`, line 37):

```bash
echo "2b. Running workspace unit tests..."
pnpm -r test

echo "2c. Checking Svelte/React parity contract..."
node scripts/parity-check.mjs
```
  (Without this, `wave-2.test.js`, the overlay tests, the lane test blocks and the parity contract would never run at ship.)
- [x] D3.3 Twin parity: `node scripts/parity-check.mjs` (twin mode) must exit 0 with zero rows in every list; fix any residual divergence in the offending twin (small edits only; if a lane-sized fix is needed, re-dispatch that lane). If C-L3 landed before C-L1, add the `FormContext.disabled` read to `Input.tsx` and `Select.tsx` here.
- [x] D3.4 Docs: `README.md` gains a "Form controls (Wave 2)" section with the state matrix table (variants x sizes x states), the casing rule, the overlay primitive (`openOverlay` / `useOverlay`, fixed positioning, sheet under 480px or coarse pointer, Escape/outside-click/focus return, transformed-ancestor limitation), touch-target behaviour (`--joy-control-height-*` under `pointer: coarse`), and the gates (`node scripts/parity-check.mjs`, `bash scripts/lint-colors.sh` strict file list, `bash scripts/precheck.sh` now running `pnpm -r test` + parity). Update the hub `#view-props-spec` Button row (`apps/storybook-hub/build.js:1201`) to `'solid' | 'outline' | 'ghost' | 'danger' | 'link'` and add rows for `block`, `iconOnly`, `iconStart`, `iconEnd`, `loading`. Tick every completed checkbox in this plan and list the eight screenshot paths under D2.2.
- [x] D3.5 Verify: `bash scripts/test-lint-colors.sh` exit 0; `bash scripts/lint-colors.sh` exit 0 (default mode: the 23 strict files print PASS; remaining WARN files are Waves 3-5); `bash scripts/lint-colors.sh --strict packages/svelte/src/lib/{Button,Input,InputNumber,Select,Checkbox,Switch,RadioGroup,Slider,Rate,Segmented,Form,FormItem,DatePicker,TimePicker,DateRangePicker,Mentions,Upload,TreeSelect,Cascader,Transfer,MarkdownEditor}.svelte packages/react/src/{Button,Input,InputNumber,Select,Checkbox,Switch,RadioGroup,Slider,Rate,Segmented,Form,FormItem,DatePicker,TimePicker,DateRangePicker,Mentions,Upload,TreeSelect,Cascader,Transfer,MarkdownEditor}.tsx` exit 0 (the spec's acceptance line); `node scripts/parity-check.mjs` exit 0; `bash scripts/precheck.sh` exit 0; `bash scripts/epic-check.sh` exit 0; `node .claude/refined_backlog/F-037-wave-2-hero-grade-button-and-form-contro/research/id-coverage.mjs` prints `in-scope 201 / deferred 79 / missing 0`. Commit: `chore(gates): strict colour lint for wave 2 controls, precheck runs unit tests + parity, docs`.
- [x] D3.6 Taste-fix punch list from the two independent `impeccable` re-reviews of the screens at `038fbea` (both verdicts: FIX; full detail in `research/handoff-relay.md`, "2026-09-23 relay" section). **Files:** `packages/tokens/build.js`, `apps/storybook-hub/build.js`.
  - **P0** `packages/tokens/build.js`: `.joy-input-number--error`/`--success` modifier blocks are emitted BEFORE the base `.joy-input-number {` rule; equal specificity means the base's `border` shorthand always wins and the error/success state never renders. Move the modifier blocks after the base block. Add a `wave-2.test.js` assertion that the modifier block's index in the compiled CSS is greater than the base block's index.
  - **P0** `apps/storybook-hub/build.js` `.topbar` (~line 333, plus the media-query copy ~982 and the dark copy ~658): at <=640px the Dark Mode toggle spills out of the wrapped topbar onto the h1 in both themes. Set `flex-wrap: nowrap` and `flex-shrink: 0` on the toggle button; icon-only (hide `#theme-label`) inside the `max-width: 640px` block.
  - **P1** Demo-fidelity gap: the D1 state matrix never actually renders `:hover`/`:focus-visible` (byte-identical to default because the CSS is pseudo-class-only over static markup), so the new two-tone focus ring and hover lift are unverified. Add `.joy-button--demo-focus` / `.joy-button--demo-hover` in `packages/tokens/build.js` mirroring the real `:focus-visible` box-shadow and `--solid:hover` lift; use them in the D1 matrix in `apps/storybook-hub/build.js`; re-shoot screens (`F037_SCREENS=1 PLAYWRIGHT_PORT=6116 pnpm --filter storybook-hub exec playwright test tests/screens-f037.spec.ts --project=desktop-chrome`) and confirm the ring/lift is visible on a solid button in both themes.
  - **P1** `apps/storybook-hub/build.js` desktop select dropdown is unanchored (`.joy-overlay` is `position: fixed`, no JS positioning on the hub demo): add `.joy-select-wrapper--open .joy-select__listbox { position: absolute; top: calc(100% + 4px); left: 0; min-width: 100% }` outside the <=640px block; keep fixed/sheet behaviour inside it.
  - **P1** `apps/storybook-hub/build.js` dark canvas lost its dot grid: `[data-theme="dark"] .component-canvas { background: var(--joy-surface-card) }` (~line 1124, and the duplicate ~777) uses the `background` shorthand, wiping `background-image`; use `background-color:` instead.
  - **P2** dark disabled/readonly inputs indistinguishable from default (`packages/tokens/build.js` `.joy-input:disabled`/`:read-only`, ~line 350/362): switch text to `--joy-text-disabled` and border to `--joy-border-subtle` in dark.
  - **P2** `apps/storybook-hub/build.js`: Size segmented control wraps 2+1 at 375px (`.controls-table` `grid-template-columns: repeat(3, 1fr)` in the `max-width: 640px` block) — use `auto-fit`/`minmax` or drop to 2 columns.
  - **P2** doubled spaces in the `Click Me! (Clicked:  0  )` demo label template string — verify directly against the source and fix if present.
  - **P3** `apps/storybook-hub/build.js:1205` `<span class="badge-react">REACT 19</span>` renders bright blue, off the navy+gold system — retone with a semantic token.
  - Verify: `pnpm --filter @joymify/tokens test` exit 0; `bash scripts/lint-colors.sh` exit 0; `node apps/storybook-hub/build.js` exit 0; `PLAYWRIGHT_PORT=6116 pnpm --filter storybook-hub exec playwright test` exit 0 (34 passed baseline); re-shoot the 8 screenshots; commit `fix(hub): taste-fix punch list from D2.3 re-review - InputNumber state ordering, topbar overflow, demo-focus/hover fidelity, select anchor, dark canvas grid, disabled contrast, segmented wrap, REACT badge tone`.
- [ ] D3.7 Quality gate: `code-reviewer` + `typescript-reviewer` on `git diff HEAD~2` (D3.5 + D3.6 commits), plus a wave-level review of `git diff release/2.24...feat/F-037` against the spec's Acceptance list; refactor; re-run D3.5 and D3.6's verify commands; verdict appended to `research/review-D.md`. Then hand back (do not ship).

## Issue coverage

Reproduce with `node .claude/refined_backlog/F-037-wave-2-hero-grade-button-and-form-contro/research/id-coverage.mjs` (parses this plan's task sections, expands `SVF-010..015` ranges, and compares against the in-scope and deferred lists below).

- **In scope (201):** SVF-001..082, SVF-084..115 (114); RXF-002, 008, 009, 012, 015, 016, 017, 024, 030, 031, 032, 034, 046..077, 094..106, 123..127, 131..147, 153, 155..159, 164, 165 (87). Each ID appears in at least one task above (A = CSS/mechanism, B = Svelte wiring, C = React wiring); the parity IDs RXF-054..077 are closed by the prop contract plus `scripts/parity-check.mjs`, with the casing rule as the documented resolution for RXF-059, 062..065, 070, 072..076.
- **Deferred (79):**
  - SVF-083 (DateRangePicker preset ranges): a feature request, not a defect; file as an idea for Wave 3+.
  - RXF-001, 003..007, 010, 011, 013, 014, 018..023, 025..029, 035..045, 078..093, 107..122, 128..130, 148..152, 154, 160..163: landing sections (Hero, CTA, Pricing, Feature, Bento, Stats, Logo cloud, FAQ, Testimonial, SiteFooter, LandingPage) and their parity/dark/copy rows belong to Wave 4 (`I-039`), per spec "landing rows belong to Wave 4".
  - RXF-033 (`.joy-alert` side stripe): display/feedback component, Wave 3.
  - RXF-002 is verified in A1.4 but its owner (`.joy-button--glass` removal, RXF-020/022) is Wave 4.

## Appendix — audit trail
- 2026-09-22 self-grill-audit: verdict safe-with-fixes. Corrected: gradient end-stop contrast (CRITICAL); precheck.sh gains pnpm -r test + parity (HIGH); B7/C7 gate reworded, twin diff moved to D6 (HIGH); icons dep + lockfile moved to Phase A (HIGH); dropped hand edit of generated index.d.ts (HIGH); A2 range to include :252; A5 z-index wording; Select/Cascader follow spec bottom-sheet; counts 38/17; id-coverage script; useOverlay deps note; phases split to 25-minute worker tasks. Open: none.
