# Implementation Plan: F-070 — Fix Portal Hash Redirection and Bundle Browser-Safe CLI State Handler

## Context & Objectives
Ensure the Developer Portal at `dev.joymify.com` strictly isolates the Hero Landing Page at `/` and routes component hashes to `/design/`, while fixing the runtime error in `/cli-state-handler/` by bundling a browser-safe `@ucsa/core` distribution.

## Tasks
1. **Router & Hash Redirection**:
   - In `apps/storybook-hub/build.js`: `syncViewFromHash` redirects `/#<component>` to `/design/#<component>`.
   - `switchView` routes to `/design/` when in `portal-mode`.
2. **Browser-Safe CLI State Handler**:
   - Exclude backend Node modules (`better-sqlite3`, `fs`, `util`).
   - Rebuild static bundle and copy into `apps/storybook-hub/portal-bundles/cli-state-handler`.
3. **Local Dev Script & README**:
   - Add `pnpm dev:portal`, `pnpm portal:build`, and `pnpm portal:serve` to `package.json`.
   - Update `README.md` with portal architecture and verification instructions.
4. **Automated Verification**:
   - Update `tests/dev-portal.spec.ts` with hash redirection and interactive render tests.
   - Run Gate 1 (`./scripts/precheck.sh`) to verify zero regressions.
