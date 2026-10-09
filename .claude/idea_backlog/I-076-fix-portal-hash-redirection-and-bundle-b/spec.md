# I-076: Fix portal hash redirection and bundle browser-safe cli-state-handler

## Problem
1. When visiting `dev.joymify.com/#primitives` or any component hash on root `/`, the previous router removed `portal-mode` and rendered the Storybook sidebar directly on the root domain instead of redirecting to `/design/#<component>`.
2. Visiting `/cli-state-handler/` loaded a blank black screen because the docs app imported `@ucsa/core` which re-exported backend SQLite/fs Node modules, causing `better-sqlite3` to throw `TypeError: i is not a function` at runtime.
3. Developers lacked a 1-command local dev script in `package.json` to assemble and verify all 3 sub-webapps on `localhost:6006`.

## Why now
Both issues directly impact live users visiting `https://dev.joymify.com/` and inspecting the sub-webapps.

## Proposed solution
1. Update `apps/storybook-hub/build.js`:
   - In `syncViewFromHash`: if on root (`isRootRoute`) and a component view hash is present, call `window.location.replace('/design/#' + hash)`.
   - In `switchView`: if `portal-mode` is active, navigate to `/design/#' + viewName`.
2. Bundle browser-safe `cli-state-handler`:
   - Built with browser entry point avoiding backend Node SQLite/fs dependencies.
   - Replaced `portal-bundles/cli-state-handler` with the working build.
3. Add `pnpm dev:portal`, `pnpm portal:build`, and `pnpm portal:serve` to root `package.json`.
4. Add Playwright tests in `apps/storybook-hub/tests/dev-portal.spec.ts` verifying hash redirection from `/#primitives` to `/design/#primitives` and confirming `#root` renders in `/cli-state-handler/`.

## Acceptance criteria
- [ ] Visiting `/#primitives` automatically redirects to `/design/#primitives` with sidebar visible.
- [ ] Root `/` strictly preserves `portal-mode` (hero banner, 3 Bento cards, no sidebar).
- [ ] Sub-path `/cli-state-handler/` renders UCSA Studio without console errors.
- [ ] Gate 1 (`./scripts/precheck.sh`) passes completely.
