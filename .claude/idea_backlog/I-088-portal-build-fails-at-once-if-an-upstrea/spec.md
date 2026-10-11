---
title: "Portal build fails at once if an upstream latest release is broken: add retry and resolve the docs versions once per run"
id: I-088
status: idea
---

# Portal build fails at once if an upstream latest release is broken: add retry and resolve the docs versions once per run

## Problem

The portal build resolves "latest release" of two upstream repositories separately in the Gate 1 job and the image job, so a release landing mid-run can ship docs the gate never tested. A rate-limit 403 fails at once instead of being retried.

## Why now

Both jobs run minutes apart on every push to main; a deploy to dev.joymify.com follows.

## Sketch

Extend scripts/fetch-portal-docs.sh retry (rate-limit 403/429 retried, 404/401/bad credentials permanent) and add a resolve-only mode. A first CI job resolves both tags once (honouring cli_docs_tag and decorator_docs_tag) and later jobs fetch exactly those tags.

## Acceptance criteria

- [ ] Network errors, HTTP 5xx and rate-limit 403/429 are retried; 404 and other permanent errors fail on the first attempt.
- [ ] One workflow run resolves each docs tag once; the gate and the image build use the same tags.
- [ ] The cli_docs_tag and decorator_docs_tag dispatch inputs keep their names and meaning.
