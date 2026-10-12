---
id: F-082
title: Smoke check verifies docs version.json is served even without an expected version
---

# F-082 (I-089)

Goal: a deploy without a fresh image can no longer pass the smoke check with a missing or broken docs `version.json`.

- `scripts/smoke-prod.sh`: `check_docs_version <folder> [expected]` always runs for `cli-state-handler` and `server-decorator`. With an expected version it must equal it (unchanged). Without one, the served `version.json` must contain a version matching `^[0-9A-Za-z][0-9A-Za-z._-]*$`, else `::error::` and exit 1.
- Presence-only success logs "(presence only, not equality: ...)" so the log never implies equality was verified.
- design.joymify.com (legacy redirect host) is still not checked.
- Proof: `scripts/test-smoke-cli-docs.sh` (fake curl): presence-only pass and message, HTML / empty / malformed version fail, one expected plus one presence-only, equality tests unchanged.
- README sentence updated.
