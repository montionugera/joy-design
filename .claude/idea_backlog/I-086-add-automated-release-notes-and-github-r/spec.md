---
title: "Add automated release notes and GitHub Releases for the joymify packages"
id: I-086
status: idea
---

# Add automated release notes and GitHub Releases for the joymify packages

## Problem

(what hurts; concrete examples)

## Why now

(opportunity; deadline; constraint)

## Sketch

(rough shape; not a design yet)

## Acceptance criteria

- [ ] (one observable, testable outcome per item; refine refuses a spec without any)

joy-design has no CHANGELOG, no .changeset, no GitHub Release for its packages. .github/workflows/publish.yml (220 lines) only triggers on packages-v* tags or a manual run, then gates, builds and runs pnpm publish (publish.yml:156 dry-run, :191 real) to GitHub Packages. cli-state-handler's release.yml creates notes and a Release. Done: tagging packages-v* generates release notes, a CHANGELOG entry and a GitHub Release listing the four published package versions.
