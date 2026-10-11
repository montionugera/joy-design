---
id: F-081
title: Retry transient docs-fetch errors and resolve docs versions once per run
---

# F-081 (I-088)

Goal: a transient GitHub error never fails the portal build, and one workflow run ships exactly the docs it gated.

- `scripts/fetch-portal-docs.sh`: the existing `gh_retry` also treats 403 with a rate-limit message as transient (429 and 5xx already were); 404, 401, other 403 stay permanent. Delay grows linearly (`PORTAL_DOCS_RETRY_DELAY`).
- New `PORTAL_DOCS_RESOLVE_ONLY=1` mode: resolve the tag (retrying), validate its form, write `<name>_docs_tag` to `$GITHUB_OUTPUT`, download nothing.
- `ci.yml`: new first job `resolve-docs` reads the `cli_docs_tag` / `decorator_docs_tag` inputs (names unchanged) and exports both tags; `build` (Gate 1) and `build-push-image` take them from `needs.resolve-docs.outputs`.
- Proof: `scripts/test-fetch-portal-docs.sh` (fake `gh`: rate-limit/5xx retried, 404/401 not, resolve-only), `scripts/test/ci-portal-docs.test.mjs` (job wiring, inputs read once, no `${{ }}` in `run:`), `actionlint`.
- README documents the flow and the retry rules.
