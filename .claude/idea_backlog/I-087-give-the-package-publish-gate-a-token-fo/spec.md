---
title: "Give the package-publish gate a token for the docs download and tidy the docs-fetch loose ends"
id: I-087
status: idea
---

# Give the package-publish gate a token for the docs download and tidy the docs-fetch loose ends

## Problem

publish.yml runs integration.sh without GH_TOKEN, but precheck.sh now downloads the cli-state-handler docs bundle on a fresh runner, and fetch-cli-docs.sh exits 1 on an empty token. The contract test only checks ci.yml. precheck swallows a failed `gh auth token`, ignores CLI_DOCS_TAG, and the README contradicts itself about PR runs.

## Why now

Found by review of release 3.9; publish would fail on a fresh runner.

## Sketch

Add env GH_TOKEN to every workflow step running the gate scripts; extend the contract test over all workflows; clear local error and CLI_DOCS_TAG passthrough in precheck.sh; fix README; prove the Dockerfile guard with a real build.

## Acceptance criteria

- [ ] Every workflow step running precheck/integration/assemble-portal provides GH_TOKEN via env, enforced by a test over all workflows
- [ ] precheck.sh honors CLI_DOCS_TAG and gives a clear message when no token is available
- [ ] README no longer contradicts ci.yml about PR runs
- [ ] Dockerfile bundle guard proven by a real build both ways (if Docker available)
