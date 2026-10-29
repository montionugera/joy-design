---
title: "Spatial workspace CSS contracts: spatial shell, lens bar, context filter bar, omni command bar"
id: I-094
status: idea
---

# Spatial workspace CSS contracts: spatial shell, lens bar, context filter bar, omni command bar

## Problem

The atlas-world World Atlas explorer (`atlas-world-svc/scripts/catalog_explorer_web.py`, served at `http://127.0.0.1:8788/`) is a Python-served vanilla-JS template-string app. It consumes joy-design only through `packages/tokens/dist/theme.css`, so it cannot import Svelte or React components.

Measured live on 2026-10-22 at 2069×1003:
- The map canvas starts 871px down a 950px scroller, about 8% of the first viewport.
- 77 controls sit above it.
- The page has 3,419 hex literals against 475 `var(--joy-*)` uses.
- Its 24px controls break the 44px touch-target rule.

The page needs canvas-first layout primitives it can consume as plain CSS classes.

Source review: `/tmp/handoff-atlas-ux-opus55-review.md` (Opus adversarial review, reconciled and approved by the Gemini 4 Argon session the same day).

## Why now

Atlas Wave UX-1b/1c (Argon, in atlas-world-svc) will rebuild the atlas chrome. If the joy-design classes exist first, Wave UX-2b swaps inline styles for them and adds 0 new literals. Otherwise the atlas grows another layer of hand-rolled styles.

## Sketch

Four class contracts, added to `packages/tokens/build.js` (`componentStyles`) and emitted into `dist/theme.css`. The state lives in `data-*` attributes, so a string-template consumer sets attributes and needs no JS framework.

1. **`.joy-spatial-shell`**: canvas-first grid with chrome, a left dock, the canvas, and a bottom dock.
   - Attributes: `data-left-open`, `data-bottom-open`, `data-theater`.
   - The canvas fills `100dvh − chrome − bottom dock`, with a floor of `--joy-spatial-min-canvas` (480px).
   - The left dock becomes a bottom sheet below 768px.
   - `__hud` is a solid floating panel: no blur, no glassmorphism.
2. **`.joy-lens-bar`**: role-mode tablist.
   - `__tab`, styled through `[aria-selected="true"]`.
   - `__badge` (neutral) and `__kbd`.
   - Text labels, with icons supplied by the consumer from joy-icons. No emoji.
3. **`.joy-context-filter-bar`**: chip group.
   - `__chip`, styled through `[aria-pressed="true"]`.
   - Context-incompatible chips are `:disabled`: they stay visible but can't be activated.
   - `__notice` uses `role="status"` with the info status tokens, for the "filter auto-adjusted" message.
4. **`.joy-omni-command-bar`**: one-row search input with a `__tray` popover.
   - The tray shows only while the bar has `:focus-within` or `data-open`.
   - `__group`, `__item` and `__kbd` style the tray content.

Plus a framework-free pure helper, `resolveFilter(requested, context, options, fallback)` → `{ effective, healed, reason }`. It keeps the user's requested filter and derives the effective one per spatial context. It ships as byte-identical `context-filter.ts` in `packages/svelte/src/lib` and `packages/react/src`, with unit tests.

Out of scope for this feature:
- Svelte/React component twins and manifests/contract-v2 scenarios for these four. That's a follow-up idea, because the only current consumer is CSS-only.
- Any atlas-world-svc edits (Argon owns those).

## Acceptance criteria

- [ ] `pnpm --filter @montionugera/joy-tokens build` emits `dist/theme.css` containing `.joy-spatial-shell`, `.joy-lens-bar`, `.joy-context-filter-bar` and `.joy-omni-command-bar`, plus their element classes. A token test asserts this.
- [ ] The new CSS blocks contain no colour literals (hex/rgb/hsl), no `backdrop-filter` and no raw z-index numbers. A test asserts this, and `bash scripts/lint-colors.sh` exits 0.
- [ ] Every interactive element in the new blocks has a `:focus-visible` rule, a disabled style where it applies, and a `min-height` of 44px or more under `@media (pointer: coarse)`. A test asserts this.
- [ ] Every new `transition` or `animation` is covered by a `prefers-reduced-motion: reduce` branch.
- [ ] Unit tests for `resolveFilter` cover: a compatible filter passes through; an incompatible one heals to the fallback with `healed: true`; an unknown filter id heals; and the requested filter is never mutated. Svelte and React copies are byte-identical, checked by `scripts/parity-check.mjs`.
- [ ] A fixture page using only `dist/theme.css` renders all four contracts correctly in light and dark themes at 375px and 1280px:
  - no horizontal scroll at 375px;
  - the canvas fills its slot in theater mode;
  - the left dock is a bottom sheet at 375px.
  Verified in a real browser.
- [ ] `pnpm -r test` and `node scripts/parity-check.mjs` pass. The `gen-design-md --check` result is unchanged or regenerated.
