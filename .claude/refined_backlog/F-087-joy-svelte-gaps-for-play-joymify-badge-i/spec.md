---
title: "joy-svelte gaps for play-joymify: Badge icon, Switch controlled, Skeleton decorative, Button loadingLabel, Alert actions, Modal role+returnFocusTo, Tabs label"
id: F-087
status: refined
from_idea: I-095
---

# joy-svelte gaps for play-joymify

## Goal
`play-joymify` (play.joymify.com) can replace its local `components/ui/*` with `@montionugera/joy-svelte` without losing behavior it already pins in tests. Confirmed by: its Privacy ("a failed save keeps the old state"), Skeleton (`aria-hidden`) and Badge-with-icon tests passing against the library components.

## Non-goals
Publishing `joy-svelte` (separate, permanent step). Migrating `play-joymify`. Flutter/Swift twins. New components (ConfirmDialog, ToastHost, LinkButton, ChipGroup, QrCode are a later idea).

## Rule for every change
Additive and opt-in: with the new prop unset, the rendered DOM is identical to today. (Raw Svelte SSR strings gain one hydration-marker comment per new `{#if}`; Badge `icon` shifts the generated hub badge text by one collapsed space, so the hub landing blocks were regenerated.) Svelte and React twins change together (parity invariant) with matching tests.

## Acceptance criteria (EARS requirements, each with Given/When/Then)
- [ ] 1. **Badge `icon?: Snippet`** (React: `icon?: ReactNode`). When `icon` is given, the badge shall render it in `<span aria-hidden="true">` before the children. Given `icon`, the HTML contains that span before the text; without `icon` output is unchanged.
- [ ] 2. **Switch `controlled?: boolean`** (default false). When `controlled` is true, a toggle shall call `onchange(!checked)` and shall NOT change its own `checked`; `aria-checked` follows the prop only. Given controlled, checked=false, click: `onchange(true)` fires and `aria-checked` stays `false` until the parent passes `true`.
- [ ] 3. **Skeleton `decorative?: boolean`** (default false). When true, the root shall have `aria-hidden="true"` and no `role` or `aria-busy`. (With `lines > 1`, the wrapper is hidden, not each row.)
- [ ] 4. **Button `loadingLabel?: string`**. When `loading` and `loadingLabel` are both set, the label span shall show `loadingLabel` instead of the children. Unset: unchanged.
- [ ] 5. **Alert `actions?: Snippet`** (React `actions?: ReactNode`) rendered in `<div class="joy-alert__actions">` after the body content; **`dismissLabel?: string`** (default `"Dismiss alert"`) used as the close button `aria-label`.
- [ ] 6. **Modal `role?: 'dialog' | 'alertdialog'`** (default `dialog`); **`closeLabel?: string`** (default `"Close dialog"`); **`returnFocusTo?: HTMLElement | null`** (React: `RefObject`/element) — on close, focus goes there if connected, else to the tracked opener as today.
- [ ] 7. **Tabs `label?: string`**. When set, the tablist shall have `aria-label={label}`.

## Failure twins
If `returnFocusTo` is disconnected at close, fall back to the opener. If `loadingLabel` is set but `loading` is false, show children. `decorative` never removes the Skeleton's classes.

## End-to-end verification
`pnpm --filter @montionugera/joy-svelte test` and `pnpm --filter @montionugera/joy-react test` green, including new tests for each of the seven props on both twins; `pnpm check` clean for both packages.

## Interfaces & files
`packages/svelte/src/lib/{Badge,Switch,Skeleton,Button,Alert,Modal,Tabs}.svelte`, `packages/react/src/{same}.tsx`, tests in `packages/{svelte,react}/test/`, styles in the CSS owner for `joy-alert__actions` (check `build.js`).

## Alternatives considered
Rebuild locally in play-joymify (status quo: what this idea removes). Wrapper components in the app (keeps drift). Do nothing.

## Assumptions
- ASSUMED: prop names above (`controlled`, `decorative`, `loadingLabel`, `dismissLabel`, `closeLabel`, `label`) — reversible: Y (before publish).
- ASSUMED: Svelte `icon` is a snippet, React is a node — reversible: Y.
- ASSUMED: no Flutter/Swift parity in this idea — reversible: Y.
- ASSUMED: version bump and publish happen later, by the user — reversible: N (publishing is permanent).

## Known gaps (recorded at review)
- `returnFocusTo` is verified by source pin only on both twins: the suites are server-render, so focus behavior is not run. Real proof comes from play-joymify's jsdom Modal/ConfirmDialog tests during migration.
- React `Switch.controlled` is a deliberate parity no-op (React Switch is always parent-owned).
