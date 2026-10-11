---
title: "Portal build downloads the server-decorator docs from its GitHub Release"
id: I-082
status: idea
---

# Portal build downloads the server-decorator docs from its GitHub Release

## Problem

(what hurts; concrete examples)

## Why now

(opportunity; deadline; constraint)

## Sketch

(rough shape; not a design yet)

## Acceptance criteria

- [ ] (one observable, testable outcome per item; refine refuses a spec without any)

The /server-decorator/ pages come from a hand-committed copy: 197 files tracked under apps/storybook-hub/portal-bundles/server-decorator (last refreshed by hand in 203e578b, #56), copied by scripts/assemble-portal.sh:38. node-server-decorator now attaches docs-site.tgz to its Releases (latest v2.0.22). Done: ci.yml fetches that archive like scripts/fetch-cli-docs.sh (ci.yml:139) does for cli-state-handler, with a pinned tag and a self-test, and the committed copy is removed.

## Blocked 2026-10-11 (release 3.9 inspection)

node-server-decorator v2.0.24 `docs-site.tgz` is NOT a drop-in replacement. Layout is right (index.html at the root, asset base `/server-decorator/`, 404.html, pagefind), but it has no `version.json` at the root, which scripts/fetch-cli-docs.sh requires (and uses for the tag cross-check and the image-tag stamp). Needed upstream: have the docs build write `{"version":"<x.y.z>"}` (equal to the release tag without the leading v) into the archive root. After that, generalise fetch-cli-docs.sh (repo, asset, target folder as parameters), add a second fetch step, and extend the image tag and smoke-prod.sh.
