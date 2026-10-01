# Avatar contrast elevation and semantic role styling Implementation Plan

## Proposed Changes

### 1. Token CSS & Avatar Theme Styling (`packages/tokens/build.js`)
- Elevate base `.joy-avatar`:
  - `color: var(--joy-text-primary);`
  - `background-color: var(--joy-surface-sunken);`
  - `box-shadow: inset 0 0 0 1px var(--joy-border-default);`
- Introduce semantic role variants:
  - `.joy-avatar--brand`: `background: var(--joy-accent-subtle); color: var(--joy-accent-text); box-shadow: inset 0 0 0 1px var(--joy-accent-default);`
  - `.joy-avatar--info`: `background: var(--joy-status-info-bg); color: var(--joy-status-info-fg); box-shadow: inset 0 0 0 1px var(--joy-status-info-border);`
  - `.joy-avatar--success`: `background: var(--joy-status-success-bg); color: var(--joy-status-success-fg); box-shadow: inset 0 0 0 1px var(--joy-status-success-border);`
  - `.joy-avatar--warning`: `background: var(--joy-status-warning-bg); color: var(--joy-status-warning-fg); box-shadow: inset 0 0 0 1px var(--joy-status-warning-border);`
  - `.joy-avatar--danger`: `background: var(--joy-status-danger-bg); color: var(--joy-status-danger-fg); box-shadow: inset 0 0 0 1px var(--joy-status-danger-border);`
  - `.joy-avatar--neutral`: `background: var(--joy-surface-sunken); color: var(--joy-text-primary); box-shadow: inset 0 0 0 1px var(--joy-border-default);`
- Refine `.joy-avatar-group`:
  - `.joy-avatar-group .joy-avatar`: `border: 2px solid var(--joy-surface-card); box-shadow: var(--joy-elevation-1);`
  - `.joy-avatar-group__overflow`: `background-color: var(--joy-surface-raised); color: var(--joy-text-primary); box-shadow: inset 0 0 0 1px var(--joy-border-default);`
- Refine `.joy-avatar__badge`:
  - `border: 2px solid var(--joy-surface-card);`
  - Responsive sizing: sm: 8px, md: 10px, lg: 12px.
- Rebuild tokens via `pnpm --filter @joymify/tokens build`.

### 2. Svelte & React Twin Component Parity
- Add `variant` prop to `packages/svelte/src/lib/Avatar.svelte` and `packages/react/src/Avatar.tsx`.
- Update `packages/svelte/src/lib/AvatarGroup.svelte` and `packages/react/src/AvatarGroup.tsx` `AvatarItem` / `AvatarGroupItem` type.
- Add unit test assertions for `variant` rendering in `packages/svelte/test/components.test.js` and `packages/react/test/components.test.js`.
- Verify parity with `node scripts/parity-check.mjs`.

### 3. Storybook Hub Playground Calibration
- In `apps/storybook-hub/build.js`:
  - Update demo to use `.joy-avatar--info`, `.joy-avatar--success`, `.joy-avatar--warning`, and `.joy-avatar-group__overflow`.
  - Eliminate invalid inline styles setting `--joy-status-*-fg` on `background-color`.
- Rebuild hub via `node apps/storybook-hub/build.js`.

### 4. Verification and Shipping
- Run workspace unit tests and parity checks.
- Run Gate 1 (`./scripts/precheck.sh`).
- Capture and inspect visual screenshots in light and dark mode.
- Execute `psrw ship --no-deploy` and `psrw promote --babysit`.
