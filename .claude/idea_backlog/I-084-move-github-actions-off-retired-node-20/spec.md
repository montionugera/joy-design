---
title: "Move GitHub Actions off retired Node 20 majors and pin the Ubuntu runner"
id: I-084
status: idea
---

# Move GitHub Actions off retired Node 20 majors and pin the Ubuntu runner

## Problem

(what hurts; concrete examples)

## Why now

(opportunity; deadline; constraint)

## Sketch

(rough shape; not a design yet)

## Acceptance criteria

- [ ] (one observable, testable outcome per item; refine refuses a spec without any)

Workflows use actions on old majors that run on retired Node 20: actions/checkout@v4 (ci.yml:40,71,132,204; publish.yml:38), pnpm/action-setup@v4 (ci.yml:74; publish.yml:70), actions/setup-node@v4 (ci.yml:79; publish.yml:75), dorny/paths-filter@v3 (ci.yml:43), docker/setup-buildx-action@v3 (:163), docker/login-action@v3 (:166), docker/build-push-action@v5 (:173), azure/setup-kubectl@v4 (:207), subosito/flutter-action@v2 (ci.yml:85,142; publish.yml:83). runs-on: ubuntu-latest at ci.yml:34,62,113,187 and publish.yml:32 moves to Ubuntu 26 on 2026-10-19. Done: Node 24 majors, runner pinned or verified on 26, CI green.
