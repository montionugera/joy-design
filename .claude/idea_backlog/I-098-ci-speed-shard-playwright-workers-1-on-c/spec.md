---
title: "CI speed: shard Playwright (workers=1 on CI is ~13 of 16 min), cache Flutter, path-filter heavy jobs, skip duplicate post-merge gate"
id: I-098
status: idea
---

# CI speed: parallel Playwright, Flutter path filter, reuse a verified gate on main

## Problem

Gate 1 on CI takes ~16 min, of which Playwright is ~13m20s (~1074 tests x 2 projects, `workers: 1`) and Flutter analyze/test/build ~2m. The same Playwright suite takes ~2 min locally. After a squash-merge, `ci.yml` runs the full Gate 1 again on `main` (~18 min with the `needs:` chain) before the image build and deploy. A release therefore costs about 35 min of CI wall-clock. `workers: 1` dates from the first config (2.22) with no recorded flakiness reason. The repo is public (4 vCPU runners). The Flutter SDK is already cached (`cache: true`).

## Why now

The 3.12 and 3.13 releases each waited on two full gates. `main` has no branch protection, so the post-merge gate is the only hard gate; any change to it must keep that guarantee.

## Sketch (three independent changes, each revertable)

1. **Parallel Playwright:** `workers: process.env.CI ? 4 : undefined` in `apps/storybook-hub/playwright.config.ts`. Retries stay at 2.
2. **Flutter path filter:** new `flutter` output in the `changes` job (`packages/flutter/**`, `apps/flutter-hub/**`, `packages/tokens/**`, `scripts/precheck.sh`, `scripts/integration.sh`, `apps/storybook-hub/tests/flutter-smoke.spec.ts`, `.github/workflows/**`). When false on a PR, skip the Flutter SDK setup and `precheck.sh` step 2g, and skip `flutter-smoke.spec.ts` (it serves `apps/flutter-hub/build/web`). The image build still compiles Flutter web on `push`. `workflow_dispatch` runs everything.
3. **Reuse a verified gate on main:** on `push` to `main`, a `reuse-gate` step finds the PR for the commit, compares the commit's tree SHA with the PR head's tree SHA, and requires a successful `Build & Check` check run on that head SHA. If all three hold, the `build` job (Gate 1) is skipped and the image build proceeds. In every other case (no PR, tree differs, check missing or failed, API error) the full Gate 1 runs. It fails closed: it never skips on uncertainty.

## Acceptance criteria

- [ ] CI `playwright test` uses 4 workers; a PR run's Gate 1 completes in <= 8 min with the same pass count and no new retry-flakes versus the 3.13 baseline (1074 x 2 passing).
- [ ] A PR touching only `apps/storybook-hub/**` or docs does not run Flutter setup, analyze or `flutter-smoke`; a PR touching `packages/tokens/**` or `apps/flutter-hub/**` does.
- [ ] `precheck.sh` honours an explicit skip flag for 2g and the Flutter smoke spec; unset means today's behaviour (local runs unchanged).
- [ ] A push to `main` whose tree equals a PR head tree with a green `Build & Check` skips Gate 1 and still builds, pushes and deploys the image.
- [ ] A push to `main` with a differing tree, no associated PR, a failed or missing check, or a failing lookup runs the full Gate 1 (verified by a script test with fixture inputs for each case).
- [ ] `workflow_dispatch` always runs the full gate.
- [ ] A real release (3.14 promote) completes with the new workflow and the deploy smoke check passes.

## Risks and rollback

- More parallel workers can expose test races: fall back to `workers: 2`.
- The tree comparison assumes a squash-merge of an up-to-date branch; any hotfix drift changes the tree and falls back to a full gate (safe, just slower).
- Rollback: each change is a separate commit and can be reverted on its own.
