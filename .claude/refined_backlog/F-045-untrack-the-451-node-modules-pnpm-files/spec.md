---
title: "untrack the 451 node_modules/.pnpm files committed in release 2.22"
id: F-045
status: refined
from_idea: I-044
---

# untrack the 451 node_modules/.pnpm files committed in release 2.22

## Problem

451 files under `node_modules/.pnpm/` (prettier, react, react-dom, @jridgewell/*, @turbo/darwin-64,
@types/estree) are tracked in git even though `.gitignore` already lists `node_modules/`. They
bloat diffs and clones, pin a darwin-only turbo binary into the tree, and can shadow what
`pnpm install` produces in fresh worktrees.

## Why now

Filed during E-001; cheap to fix while no other feature touches the root.

## Sketch

- `git rm -r --cached node_modules` (index only; local installs stay on disk).
- No `.gitignore` change needed (`node_modules/` and `**/node_modules/` already present).
- Verify a fresh worktree still installs and passes Gate 1.

## Acceptance criteria

- [ ] `git ls-files | grep -c node_modules/` prints 0.
- [ ] `git check-ignore node_modules/.pnpm` confirms the path is ignored.
- [ ] In a fresh worktree, `pnpm install --frozen-lockfile` then `scripts/precheck.sh` exits 0.
