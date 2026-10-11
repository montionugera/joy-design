---
title: "Fix flaky framework-switcher mobile test and short Playwright server timeout"
id: F-076
status: refined
from_idea: I-085
---

# Fix flaky framework-switcher mobile test and short Playwright server timeout

## Problem

apps/storybook-hub/tests/framework-switcher.spec.ts "switching frameworks" failed once then passed on retry on the mobile-chrome project (the React button click is the suspect). playwright.config.ts has a 30000 ms webServer.timeout, too short for a cold `npx serve` on a loaded machine.

## Why now

The pre-ship check (Gate 1) fails or needs retries on a busy machine; a flaky test hides real regressions.

## Sketch

Reproduce on mobile-chrome with traces, find the real cause (not a retry or sleep), fix it in the test or the page, and raise webServer.timeout (for example 120000).

## Acceptance criteria

- [ ] The root cause of the flaky click is named in the commit message and fixed without sleeps or added retries.
- [ ] apps/storybook-hub/playwright.config.ts webServer.timeout is raised.
- [ ] At least 5 consecutive runs of framework-switcher.spec.ts on mobile-chrome pass.
- [ ] Gate 1 (scripts/precheck.sh) passes.
