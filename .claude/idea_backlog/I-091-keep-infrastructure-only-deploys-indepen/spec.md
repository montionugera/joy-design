---
title: "Keep infrastructure-only deploys independent of the docs lookup and tighten the resolve job"
id: I-091
status: idea
---

# Keep infrastructure-only deploys independent of the docs lookup and tighten the resolve job

## Problem

In ci.yml the resolve-docs job has no `if:` and is an ancestor of deploy, so a k8s-only push to main now fails to deploy when the docs lookup fails. It also inherits packages: write, silently accepts empty resolved tags, and the fetch script retries without logging.

## Why now

Review of release 3.11; merging deploys the live site.

## Sketch

resolve-docs needs changes and shares build's if condition; permissions contents: read; consuming jobs fail on empty tags (shell, env vars); fetch-portal-docs.sh logs each retry.

## Acceptance criteria

- [ ] resolve-docs is skipped when build is skipped, and deploy behaves as before for k8s-only pushes
- [ ] resolve-docs has permissions contents: read only
- [ ] consuming jobs exit non-zero on an empty resolved tag
- [ ] fetch-portal-docs.sh logs attempt, reason and delay before each retry sleep, with no token
