---
title: "Avatar contrast elevation and semantic role styling"
id: I-052
status: idea
---

# Avatar contrast elevation and semantic role styling

## Problem

In dark mode (and light mode), avatar initials and colored fallbacks suffer from critical aesthetic and contrast defects:
1. Neutral avatars (`.joy-avatar`) use `var(--joy-surface-sunken)` (`#090d16` in dark mode) without any perimeter rim, causing circular and square avatars to sink into dark navy cards (`#111b2b`) as muddy, undefined voids.
2. In the Storybook Hub demo, colored avatars manually set `style="background-color: var(--joy-status-*-fg)"` while keeping default light text (`--joy-text-secondary`). In dark mode, this places light blue-white text (`#d4dded`) on top of light pastel blue (`#8cbcf4`), light mint (`#86d98c`), and light gold (`#f4bf5b`), yielding illegible contrast (<1.3:1) that violates WCAG AA.
3. `.joy-avatar-group .joy-avatar` and `.joy-avatar__badge` hardcode `border: 2px solid var(--joy-surface-canvas);`, which creates discordant off-color halos when avatars are placed inside standard cards (`--joy-surface-card`).
4. Overlapping group overflow (`+N`) uses unrefined styling without boundary definition.

## Why now

Live production feedback identified avatars as failing visual quality and enterprise polish standards in dark mode. Fixing this establishes a robust, accessible semantic color role system for avatars across Svelte and React.

## Sketch

1. Elevate base `.joy-avatar` with `color: var(--joy-text-primary);` and `box-shadow: inset 0 0 0 1px var(--joy-border-default);` for crisp boundary definition on any surface.
2. Introduce semantic role variants on `.joy-avatar`:
   - `.joy-avatar--brand`: `background: var(--joy-accent-subtle); color: var(--joy-accent-text); box-shadow: inset 0 0 0 1px var(--joy-accent-default);`
   - `.joy-avatar--info`: `background: var(--joy-status-info-bg); color: var(--joy-status-info-fg); box-shadow: inset 0 0 0 1px var(--joy-status-info-border);`
   - `.joy-avatar--success`: `background: var(--joy-status-success-bg); color: var(--joy-status-success-fg); box-shadow: inset 0 0 0 1px var(--joy-status-success-border);`
   - `.joy-avatar--warning`: `background: var(--joy-status-warning-bg); color: var(--joy-status-warning-fg); box-shadow: inset 0 0 0 1px var(--joy-status-warning-border);`
   - `.joy-avatar--danger`: `background: var(--joy-status-danger-bg); color: var(--joy-status-danger-fg); box-shadow: inset 0 0 0 1px var(--joy-status-danger-border);`
   - `.joy-avatar--neutral`: `background: var(--joy-surface-sunken); color: var(--joy-text-primary); box-shadow: inset 0 0 0 1px var(--joy-border-default);`
3. Refine `.joy-avatar-group .joy-avatar` and badge borders to use `var(--joy-surface-card)` with proportional badge sizes (8px / 10px / 12px for sm / md / lg).
4. Refine `.joy-avatar-group__overflow` with `var(--joy-surface-raised)` and `var(--joy-text-primary)`.
5. Support `variant` prop on `Avatar` and `AvatarGroup` in both Svelte and React twins with 100% parity.

## Acceptance criteria

- [ ] `.joy-avatar` base styling includes `box-shadow: inset 0 0 0 1px var(--joy-border-default)` and `color: var(--joy-text-primary)`
- [ ] Semantic variants `.joy-avatar--brand`, `.joy-avatar--info`, `.joy-avatar--success`, `.joy-avatar--warning`, `.joy-avatar--danger` are styled with matching background, border, and foreground tokens achieving >= 4.5:1 text contrast
- [ ] `.joy-avatar-group .joy-avatar` and `.joy-avatar__badge` use card surface borders (`var(--joy-surface-card)`)
- [ ] `.joy-avatar-group__overflow` is styled with `--joy-surface-raised`, `--joy-text-primary`, and inset border
- [ ] Svelte (`Avatar.svelte`) and React (`Avatar.tsx`) twins expose matching `variant` prop with 0 parity check violations
- [ ] Storybook Hub avatar playground uses semantic classes with 0 color-lint violations, passing Gate 1 precheck and Playwright contracts
