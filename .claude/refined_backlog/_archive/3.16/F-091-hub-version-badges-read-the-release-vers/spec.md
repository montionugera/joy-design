---
title: "hub version badges read the release version from package.json"
id: F-091
status: refined
from_idea: I-099
---

# hub version badges read the release version from package.json

## Problem

`apps/storybook-hub/build.js` hardcodes `v3.3` (sidebar badge, line ~4913) and `v3.4`
(portal card, line ~5148). Production is on release 3.13+ so both labels are stale.

## Why now

Seen live on dev.joymify.com/design on 2026-10-31.

## Sketch

Read `version` from the root `package.json` (psrw keeps it equal to the release) in
`build.js` and interpolate it into both badges as `v${version}`. Update the test in
`apps/storybook-hub/tests/dev-portal.spec.ts:45` to read the same value instead of a literal.

## Acceptance criteria

- [ ] Both badges render `v` + the root package.json version.
- [ ] No literal `v3.3` / `v3.4` remains in build.js or the hub tests.
- [ ] `dev-portal.spec.ts` passes in both desktop and mobile projects.
- [ ] Gate 1 passes.
