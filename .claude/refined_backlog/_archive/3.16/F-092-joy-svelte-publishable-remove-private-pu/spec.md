---
title: "joy-svelte publishable: remove private, publishConfig, publish workflow, version bump (no publish)"
id: F-092
status: refined
from_idea: I-100
---

# joy-svelte publishable (no publish)

## Problem

`@montionugera/joy-svelte` is `"private": true`, so play-joymify cannot depend on it
from the registry. tokens, icons, brand and react are already published through
`.github/workflows/publish.yml`; svelte is not in that flow.

## Why now

F-087 added the props play-joymify needs. Migrating play-joymify to compose from
joy-svelte is the original goal.

## Sketch

In `packages/svelte/package.json`: drop `private`, add `publishConfig.registry`
(`https://npm.pkg.github.com`, as icons does) and a `files` list (`src`, README),
bump version to 0.2.0. In `publish.yml`: add svelte to the pack steps, the manifest,
and the tarball-set and `git checkout` lists, mirroring react. Extend
`scripts/test/consumer-smoke.sh` so a Svelte consumer resolves the packed tarball.
The source stays TypeScript/.svelte (consumers compile it), as today.
This feature NEVER publishes: the workflow is only run as a dry run.

## Acceptance criteria

- [ ] `packages/svelte/package.json` has no `private`, has `publishConfig` and `files`, version 0.2.0.
- [ ] `pnpm pack` in packages/svelte yields a tarball containing `src/lib/index.ts` and the components, with `workspace:*` resolved to real versions.
- [ ] `publish.yml` packs svelte alongside the other four, in both the github and npmjs sets.
- [ ] `consumer-smoke.sh` imports `@montionugera/joy-svelte` from the packed tarball and passes.
- [ ] Workflow dry run (`dry_run: true`) succeeds; nothing is published.
- [ ] Gate 1 passes.
