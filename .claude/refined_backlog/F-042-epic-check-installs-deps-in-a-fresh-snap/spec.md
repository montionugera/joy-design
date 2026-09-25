---
title: "epic-check installs deps in a fresh snapshot"
id: F-042
status: refined
from_idea: I-042
---

# epic-check installs deps in a fresh snapshot

## Problem

`psrw ship` runs the epic outcome hook (`scripts/epic-check.sh`) inside a throwaway
detached worktree (`psrw-epic-*/snapshot`) that has no `node_modules`. When F-041 shipped
(release 2.24, sha 04691ab), E-001's outcome check failed at the step
`run_step "type check" pnpm check`, with `sh: turbo: command not found`. The color lint,
parity and design-doc drift steps passed because they only use plain Node. The same tree
passes Gate 1 (565 passed) in a worktree that has its dependencies installed.

## Why now

E-001 is recorded as `failed_verification`, and that blocks promoting release 2.24.

## Sketch

At the top of `scripts/epic-check.sh`, if `node_modules` is missing at the repo root, run
`pnpm install --frozen-lockfile --prefer-offline` before the first step. Fail loudly if the
install fails. Do not skip or weaken any existing step. Cover it in
`scripts/test-epic-check.sh`, which Gate 1 already runs.

## Acceptance criteria

- [ ] `scripts/epic-check.sh` installs workspace deps with `pnpm install --frozen-lockfile` when `node_modules` is absent, and skips the install when it is present.
- [ ] An install failure makes epic-check exit non-zero with a clear message. It never skips steps.
- [ ] `scripts/test-epic-check.sh` covers both branches (deps present / absent) and passes under macOS `/bin/bash` 3.2.
- [ ] `psrw epic verify E-001` passes on release/2.24 after this ships.
- [ ] Gate 1 (`scripts/precheck.sh`) exits 0.
