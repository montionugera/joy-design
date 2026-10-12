---
title: "Flutter smoke test gives its own web server only 15 seconds to start and fails the gate under load"
id: I-081
status: idea
---

# Flutter smoke test gives its own web server only 15 seconds to start and fails the gate under load

## Problem

apps/storybook-hub/tests/flutter-smoke.spec.ts starts `npx --yes serve` itself and waits at most 15 seconds for it. On a loaded machine (or a cold npx cache) that is not enough and every test in the file fails with ERR_CONNECTION_REFUSED at 127.0.0.1:6118, failing Gate 1.

## Why now

Seen again in the F-075 pre-ship run: 2 failures from exactly this, fixed only by starting the server by hand.

## Sketch

Raise the wait to a generous deadline and, if the server never comes up, fail in beforeAll with a message that says so instead of a connection refusal in the first test.

## Acceptance criteria

- [ ] The server start wait in flutter-smoke.spec.ts is at least 120 seconds.
- [ ] A server that never starts fails beforeAll with a clear message.
- [ ] flutter-smoke.spec.ts passes on both projects without a pre-started server; Gate 1 passes.
