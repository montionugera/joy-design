---
title: "Remove the stale committed cli-state-handler docs copy"
id: I-083
status: idea
---

# Remove the stale committed cli-state-handler docs copy

## Problem

(what hurts; concrete examples)

## Why now

(opportunity; deadline; constraint)

## Sketch

(rough shape; not a design yet)

## Acceptance criteria

- [ ] (one observable, testable outcome per item; refine refuses a spec without any)

The cli-state-handler docs bundle is still committed (3 tracked files under apps/storybook-hub/portal-bundles/cli-state-handler: index.html plus 2 assets) although CI now downloads it (ci.yml:139). scripts/assemble-portal.sh:58 silently falls back to the tracked copy, so a failed download could ship stale docs without notice. Done: tracked files removed, bundle path gitignored, assemble-portal fails loudly (or uses the stub) instead of using old content.
