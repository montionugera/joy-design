---
title: "Move GitHub Actions off retired Node 20 majors and pin the Ubuntu runner"
id: F-078
status: refined
from_idea: I-084
---

# Move GitHub Actions off retired Node 20 majors and pin the Ubuntu runner

## Problem

ci.yml and publish.yml pin action majors that run on the retired Node 20: actions/checkout@v4, pnpm/action-setup@v4, actions/setup-node@v4, dorny/paths-filter@v3, docker/setup-buildx-action@v3, docker/login-action@v3, docker/build-push-action@v5, azure/setup-kubectl@v4. subosito/flutter-action@v2 is a composite action whose v2 tag (v2.23.0) already calls actions/cache@v5 on Node 24, so it stays.

## Why now

GitHub is retiring Node 20 for actions; a forced upgrade would hit the production deploy workflow unprepared.

## Sketch

Target majors, each checked with `using: node24` in its action.yml and its skipped release notes read for input changes: checkout v7, pnpm/action-setup v6, dorny/paths-filter v4, docker/setup-buildx v4, docker/login v4, docker/build-push v7, azure/setup-kubectl v5. setup-node stays on v6, not v7: v7 stops exporting the dummy NODE_AUTH_TOKEN that publish.yml's registry-url install step relies on. runs-on stays ubuntu-latest (no concrete reason to pin; the move to Ubuntu 26 on 2026-10-19 is watched by the pull-request run).

## Acceptance criteria

- [ ] No workflow references an action major that declares `using: node20`.
- [ ] A contract test fails on any `uses:` pinned below the verified Node 24 majors.
- [ ] Workflow inputs in use are still accepted by the new majors (checked in release notes); ci-cli-docs and publish-contract tests stay green.
- [ ] Gate 1 (scripts/precheck.sh) passes; the live pull-request run is the final proof.
