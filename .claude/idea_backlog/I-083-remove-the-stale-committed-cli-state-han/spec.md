---
title: "Remove the stale committed cli-state-handler docs copy"
id: I-083
status: idea
---

# Remove the stale committed cli-state-handler docs copy

## Problem

The cli-state-handler docs bundle is still committed (3 files under apps/storybook-hub/portal-bundles/cli-state-handler) although CI downloads it. scripts/assemble-portal.sh silently falls back to that tracked copy, so a failed download could ship stale docs. The Docker build (apps/storybook-hub/build.js) also skips a missing bundle without a word.

## Why now

The fetch (scripts/fetch-cli-docs.sh, release 3.8) is the single source of truth; the old copy is only a trap.

## Sketch

- git rm the 3 tracked files and gitignore the folder, so the fetch script output is never committed.
- assemble-portal.sh: sibling checkout, else the fetched folder, else exit 1 telling the developer to run the fetch script. No stub, no tracked copy.
- Dockerfile: after build.js, fail the build if dist/cli-state-handler/version.json is missing.
- README: document the local way to get the bundle.

## Acceptance criteria

- [ ] git ls-files shows nothing under portal-bundles/cli-state-handler and the folder is gitignored.
- [ ] assemble-portal.sh exits non-zero with a message naming scripts/fetch-cli-docs.sh when no source exists (tested).
- [ ] The Dockerfile build fails when the bundle is missing.
- [ ] README explains the local fetch command; precheck.sh passes.
