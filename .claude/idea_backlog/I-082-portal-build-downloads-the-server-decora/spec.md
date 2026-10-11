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
