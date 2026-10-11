---
title: "Portal build downloads the server-decorator docs from its GitHub Release"
id: F-080
status: refined
from_idea: I-082
---

# Portal build downloads the server-decorator docs from its GitHub Release

## Problem

The /server-decorator/ pages are a hand-committed copy of 197 files under apps/storybook-hub/portal-bundles/server-decorator, refreshed by hand, so they drift from upstream releases.

## Why now

Upstream v2.0.26 now ships version.json in docs-site.tgz, which removes the blocker below. cli-state-handler already uses the download pattern (release 3.9).

## Sketch

Generalise scripts/fetch-cli-docs.sh (repo and target folder as parameters), call it for both bundles in ci.yml and precheck.sh, gitignore and delete the committed copy, extend image tag and smoke-prod.sh.

## Acceptance criteria

- [ ] One fetch script downloads both bundles with version.json cross-check.
- [ ] The committed server-decorator files are gone from git; missing bundle fails assemble, Dockerfile, precheck loudly.
- [ ] ci.yml has a decorator_docs_tag input, image tag carries the decorator version, smoke checks /server-decorator/version.json.
- [ ] README documents the local fetch flow for both bundles.

## Notes

The /server-decorator/ pages come from a hand-committed copy: 197 files tracked under apps/storybook-hub/portal-bundles/server-decorator (last refreshed by hand in 203e578b, #56), copied by scripts/assemble-portal.sh:38. node-server-decorator now attaches docs-site.tgz to its Releases (latest v2.0.22). Done: ci.yml fetches that archive like scripts/fetch-cli-docs.sh (ci.yml:139) does for cli-state-handler, with a pinned tag and a self-test, and the committed copy is removed.

## Blocked 2026-10-11 (release 3.9 inspection)

node-server-decorator v2.0.24 `docs-site.tgz` is NOT a drop-in replacement. Layout is right (index.html at the root, asset base `/server-decorator/`, 404.html, pagefind), but it has no `version.json` at the root, which scripts/fetch-cli-docs.sh requires (and uses for the tag cross-check and the image-tag stamp). Needed upstream: have the docs build write `{"version":"<x.y.z>"}` (equal to the release tag without the leading v) into the archive root. After that, generalise fetch-cli-docs.sh (repo, asset, target folder as parameters), add a second fetch step, and extend the image tag and smoke-prod.sh.
