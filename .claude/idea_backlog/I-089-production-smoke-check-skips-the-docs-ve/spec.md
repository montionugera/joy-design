---
title: "Production smoke check skips the docs version comparison when no image was built in the run"
id: I-089
status: idea
---

# Production smoke check skips the docs version comparison when no image was built in the run

## Problem

scripts/smoke-prod.sh skips the docs version comparison when the run built no image (expected versions empty), so a missing or malformed version.json goes unnoticed.

## Why now

Deploys without a fresh image (k8s-only changes) are smoked with nothing checked for the docs sites.

## Sketch

When expected values are empty, still fetch each docs version.json, require a well-formed version, and log plainly that only presence was checked, not equality.

## Acceptance criteria

- [ ] With no expected versions, each version.json must be served and hold a well-formed version, else the smoke fails.
- [ ] The log states that only presence was checked, not equality.
- [ ] With expected versions the equality check is unchanged.
