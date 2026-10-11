---
title: "Fix flaky framework-switcher mobile test and short Playwright server timeout"
id: I-085
status: idea
---

# Fix flaky framework-switcher mobile test and short Playwright server timeout

## Problem

(what hurts; concrete examples)

## Why now

(opportunity; deadline; constraint)

## Sketch

(rough shape; not a design yet)

## Acceptance criteria

- [ ] (one observable, testable outcome per item; refine refuses a spec without any)

apps/storybook-hub/tests/framework-switcher.spec.ts:35 (switching frameworks) failed once then passed on retry on the mobile-chrome project; the React button click at line 50 is the suspect (drawer animating or not yet visible). apps/storybook-hub/playwright.config.ts:40 has a 30000 ms webServer.timeout, too short on a loaded machine. Done: click waits for the drawer to be visible/stable, timeout raised (for example 120000), 10 repeated mobile-chrome runs pass.
