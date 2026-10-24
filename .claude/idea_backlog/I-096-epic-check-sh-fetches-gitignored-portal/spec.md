---
title: "epic-check.sh fetches gitignored portal bundles so promote passes in a fresh worktree"
id: I-096
status: idea
---

# epic-check.sh fetches gitignored portal bundles so promote passes in a fresh worktree

## Problem

`psrw promote` runs `scripts/epic-check.sh` in a fresh detached worktree. The portal
bundles (`apps/storybook-hub/portal-bundles/{cli-state-handler,server-decorator}`) are
gitignored, so the hub is built without them and the Playwright test
"Sub-webapp routes serve static documentation" gets 404 on `/server-decorator/`.
Release 3.12 promote failed on E-003 (G-E3) for this reason. `precheck.sh` already has
a `fetch_docs` helper that avoids this; `epic-check.sh` does not.

## Why now

Release 3.12 (F-084..F-087) cannot be promoted until the check passes.

## Sketch

Reuse the `fetch_docs` logic from `scripts/precheck.sh` (skip when `version.json`
exists; use `GH_TOKEN` or `gh auth token`; fail loudly if neither) in
`scripts/epic-check.sh`, called for both bundles before "Storybook Hub build".
Honour `CLI_DOCS_TAG` / `DECORATOR_DOCS_TAG`. No new fetch logic.

## Acceptance criteria

- [ ] `scripts/epic-check.sh` fetches both portal bundles before the hub build when missing.
- [ ] With bundles already present it makes no network call.
- [ ] With no token and no `gh` login it exits non-zero with a message naming `gh auth login`.
- [ ] `scripts/test-epic-check.sh` covers the three cases above and passes.
- [ ] `psrw promote` passes the E-003 check for release 3.12.
