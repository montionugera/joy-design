# Fetch cli-state-handler docs from its GitHub Release — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** joy-design's CI (the GitHub Actions workflow `.github/workflows/ci.yml`) downloads `docs-site.tgz` from a `cli-state-handler` GitHub Release and unpacks it before the developer-portal image is built, so dev.joymify.com serves the docs of a named release, and fails loudly when it cannot.

**Architecture:** One new shell script does fetch, retry, unpack, validation and swap; `ci.yml` calls it in the image job, appends the docs version to the image tag (`<12-char commit hash>-cli<X.Y.Z>`), and hands the version to the post-deploy smoke script, which compares it with the served `/cli-state-handler/version.json`. `Dockerfile`, `nginx.conf`, `build.js`, `scripts/assemble-portal.sh` and the tracked docs snapshot are not changed.

**Tech Stack:** bash, `gh` (GitHub CLI), `tar`, GitHub Actions YAML, `node --test` contract tests, Docker for the local image check.

**Spec:** `.claude/idea_backlog/I-079-download-cli-state-handler-docs-archive/spec.md` (I-079 is this work item's idea id; after Task 2 the folder is copied to `.claude/refined_backlog/F-NNN-.../`). Executors read both.

## Global Constraints

- **Never create, read, print or echo a token.** No `gh auth token`, no `gh secret set`, no `set -x`. Tokens are the owner's job (Task 1).
- **No outward or irreversible step without the owner's explicit yes.** Every such step below starts with `STOP — needs the owner's yes:`. A yes covers that one step only.
- Edits happen only in the feature worktree from Task 2. The main checkout blocks edits. Never `git commit --amend`; one new commit per logical unit; stage by explicit path.
- There is deliberately **no skip switch**: every fetch failure exits non-zero with an `::error::` line.
- The token reaches only the fetch step's environment as `GH_TOKEN`. Never a Docker build argument, build secret, or file in the build context.
- The "Build and push" step keeps `context: .` (otherwise the action builds from a fresh checkout and ignores the fetched files).
- Never commit the fetched docs. Restore with `git checkout -- apps/storybook-hub/portal-bundles && git clean -fd apps/storybook-hub/portal-bundles`.
- Repository names: `montionugera/joy-design` (this one), `montionugera/cli-state-handler` (the docs source). Asset name: `docs-site.tgz`. Output line: `cli-docs: fetched vX.Y.Z (version.json X.Y.Z)`.

## File map

| File | Responsibility |
| --- | --- |
| `scripts/fetch-cli-docs.sh` (new) | Download, retry, unpack in a temp folder outside the repository, validate, swap into `apps/storybook-hub/portal-bundles/cli-state-handler/`, report the version |
| `scripts/test-fetch-cli-docs.sh` (new) | Tests for the above against fixture archives and a stub `gh` |
| `scripts/smoke-prod.sh` | New body check of `/cli-state-handler/version.json` when `EXPECTED_CLI_DOCS_VERSION` is set |
| `scripts/test-smoke-cli-docs.sh` (new) | Tests for that check with a stub `curl` |
| `scripts/test/ci-cli-docs.test.mjs` (new) | Text contract on `ci.yml` (same style as `scripts/test/publish-contract.test.mjs`) |
| `scripts/precheck.sh` | Two lines so Gate 1 (the pre-ship build and test check) runs both new shell tests |
| `.github/workflows/ci.yml` | Input, fetch step, image tag, job output, smoke environment variable |
| `README.md` | Fix line 312, add "CLI State Handler docs source" |

---

### Task 0: Has the package rename shipped into release 3.8?

Another session (feature F-073) is renaming `@montionugera/joy-*` to `@joymify/*` across about 85 files on the same release branch. This plan shares only `README.md` with it.

- [ ] **Step 1:** Run from the `_release` worktree (`joy-design/.claude/worktrees/_release`, the long-lived checkout of branch `release/3.8`):

```bash
git grep -l '"@montionugera/joy-' release/3.8 -- 'packages/*/package.json'; psrw status | head -30
```

Expected when the rename **has shipped**: the `git grep` prints nothing and `psrw status` shows F-073 as shipped. Today it prints five `package.json` paths (not shipped). Record the answer; it is re-checked in Task 7, the only task it affects.

### Task 1: OWNER ONLY — create two tokens and save them as secrets

Blocks Task 8 (the real CI run) only. Tasks 2 to 7 proceed without it. The implementer does none of this and never sees a value.

`montionugera` is a personal account, so sign in **as `montionugera`**. Path: GitHub Settings, Developer settings, Personal access tokens, Fine-grained tokens, Generate new token.

| | Token 1 "joy-design reads cli docs" | Token 2 "cli-state-handler signals portal" |
| --- | --- | --- |
| Token type | Fine-grained personal access token | Fine-grained personal access token |
| Resource owner | `montionugera` | `montionugera` |
| Repository access | Only select repositories: `cli-state-handler` | Only select repositories: `joy-design` |
| Repository permission | **Contents: Read-only** (Metadata: Read-only is added automatically); nothing else | **Actions: Read and write**; nothing else |
| Secret name | `CLI_DOCS_READ_TOKEN` | `PORTAL_DISPATCH_TOKEN` |
| Saved in (Settings, Secrets and variables, Actions, repository secret) | `montionugera/joy-design` | `montionugera/cli-state-handler` |
| Expiry | Set one, plus a calendar reminder; an expired token fails the build by design | Same |

- [ ] **Step 1 (owner):** UNVERIFIED in the spec: the permission mapping was not re-read by the audit. Before generating, confirm on GitHub's "Permissions required for fine-grained personal access tokens" page that release-asset reads sit under Contents (read) and workflow dispatch under Actions (write).
- [ ] **Step 2 (owner):** create and save both, as in the table.
- [ ] **Step 3 (implementer, names only):** `gh secret list -R montionugera/joy-design` lists `CLI_DOCS_READ_TOKEN`; `gh secret list -R montionugera/cli-state-handler` lists `PORTAL_DISPATCH_TOKEN`.

### Task 2: Feature worktree

- [ ] **Step 1:** In `joy-design`, run `psrw refine I-079` (psrw is the release tool; this mints a feature id F-NNN and commits the backlog entry locally on `release/3.8`), then `psrw claim F-NNN` (creates the isolated worktree `.claude/worktrees/F-NNN-<slug>` on branch `feat/F-NNN`). Neither command pushes or fetches (checked in the tool source, `~/.claude/ps-release-workflow/scripts/promote_idea_to_refined.py` and `init_work_refined_backlog.py`: no `push`, no `fetch`). `psrw refine` does commit in the shared `_release` worktree, where another session is also committing: run `git -C .claude/worktrees/_release status --porcelain` first and wait if it shows that session's staged or half-written files.
- [ ] **Step 2:** In the new worktree: `corepack enable && pnpm install --frozen-lockfile`. Expected: exits 0.
- [ ] **Step 3:** Baseline before any edit: `bash scripts/precheck.sh 2>&1 | tail -n 5` exits 0, and `actionlint .github/workflows/ci.yml > /tmp/actionlint-before.txt; wc -l < /tmp/actionlint-before.txt` (keep the count).

### Task 3: `scripts/fetch-cli-docs.sh`, test-first

**Files:** Create `scripts/test-fetch-cli-docs.sh`, `scripts/fetch-cli-docs.sh`. Modify `scripts/precheck.sh` (after line 44).

**Interfaces — produces:** `bash scripts/fetch-cli-docs.sh [tag]`; empty or absent tag means the latest release. Reads `GH_TOKEN`. Test seams: `CLI_DOCS_BUNDLE_DIR` (default the tracked bundle folder), `CLI_DOCS_RETRY_DELAY` (default `10` seconds). On success appends `cli_docs_version=X.Y.Z` to `$GITHUB_OUTPUT` when that variable is set and prints the output line. "Retry 3 times" is implemented as **3 attempts in total**.

- [ ] **Step 1: Write the failing test.** `scripts/test-fetch-cli-docs.sh`, modelled on `scripts/test-lint-colors.sh` (fixtures in `mktemp -d`, removed by a trap). No real network, no real token.

```bash
#!/usr/bin/env bash
set -euo pipefail
# Break caught: a missing token, a bad archive or a failed download ships stale docs silently.
repo_root=$(cd "$(dirname "$0")/.." && pwd)
fx=$(mktemp -d); trap 'rm -rf "$fx"' EXIT
mkdir -p "$fx/bin" "$fx/src/assets"
echo '<html>new</html>' > "$fx/src/index.html"; echo 'x' > "$fx/src/assets/a.js"
printf '{"version":"0.2.0"}\n' > "$fx/src/version.json"
tar -czf "$fx/good.tgz" -C "$fx/src" .
mk() { rm -rf "$fx/v" && cp -R "$fx/src" "$fx/v" && (cd "$fx/v" && eval "$2") && tar -czf "$fx/$1.tgz" -C "$fx/v" .; }
mk no-version 'rm version.json'; mk no-index 'rm index.html'; mk mismatch 'echo "{\"version\":\"0.1.0\"}" > version.json'
python3 -c "import tarfile,sys;t=tarfile.open(sys.argv[1],'w:gz');t.add(sys.argv[2],arcname='../evil.txt');t.close()" "$fx/traversal.tgz" "$fx/src/index.html"
cat > "$fx/bin/gh" <<'STUB'
#!/usr/bin/env bash
echo "$*" >> "$FAKE_GH_LOG"
case "${FAKE_GH_MODE:-ok}" in
  notfound) echo "release not found" >&2; exit 1 ;;
  flaky) n=$(cat "$FAKE_GH_COUNT" 2>/dev/null || echo 0); echo $((n + 1)) > "$FAKE_GH_COUNT"
         [ "$n" -ge "${FAKE_GH_FAILS:-2}" ] || { echo "connection reset by peer" >&2; exit 1; } ;;
esac
if [ "$2" = "view" ]; then echo "v0.2.0"; exit 0; fi
while [ $# -gt 0 ]; do [ "$1" = "-D" ] && dest="$2"; shift; done
mkdir -p "$dest"; cp "$FAKE_GH_ARCHIVE" "$dest/docs-site.tgz"
STUB
chmod +x "$fx/bin/gh"
run() { # run <archive> <tag> [VAR=value...] -> sets $code, $out; bundle starts as an "old" snapshot
  local archive="$1" tag="$2"; shift 2
  rm -rf "$fx/bundle" "$fx/count" "$fx/log" "$fx/ghout"; mkdir -p "$fx/bundle"; echo old > "$fx/bundle/index.html"
  set +e
  out=$(env PATH="$fx/bin:$PATH" GH_TOKEN=fake FAKE_GH_ARCHIVE="$fx/$archive.tgz" FAKE_GH_LOG="$fx/log" FAKE_GH_COUNT="$fx/count" \
    CLI_DOCS_BUNDLE_DIR="$fx/bundle" CLI_DOCS_RETRY_DELAY=0 GITHUB_OUTPUT="$fx/ghout" "$@" bash "$repo_root/scripts/fetch-cli-docs.sh" $tag 2>&1)
  code=$?; set -e
}
ok() { echo "ok - $1"; }; die() { echo "not ok - $1"; echo "$out"; exit 1; }
untouched() { [ "$(cat "$fx/bundle/index.html")" = old ] && [ ! -e "$fx/bundle/version.json" ]; }

run good v0.2.0
[ "$code" = 0 ] && echo "$out" | grep -qx 'cli-docs: fetched v0.2.0 (version.json 0.2.0)' && grep -qx 'cli_docs_version=0.2.0' "$fx/ghout" \
  && [ "$(cat "$fx/bundle/version.json")" = '{"version":"0.2.0"}' ] && grep -q new "$fx/bundle/index.html" || die fetches_named_tag_and_swaps_bundle
ok fetches_named_tag_and_swaps_bundle
```

Then one block per remaining case, each ending `|| die <name>; ok <name>`:

| Test name | `run` call | Must hold |
| --- | --- | --- |
| `empty_tag_resolves_latest` | `run good ""` | `code=0`; output line names `v0.2.0`; `$fx/log` contains `release view` |
| `empty_token_fails_naming_secret` | `run good v0.2.0 GH_TOKEN=` | `code≠0`; output has `::error::` and `CLI_DOCS_READ_TOKEN`; `untouched`; `$fx/log` does not exist (`gh` never called, so a stored login cannot mask it) |
| `missing_release_fails_without_retry` | `run good v9.9.9 FAKE_GH_MODE=notfound` | `code≠0`; `untouched`; `wc -l < $fx/log` is `1` |
| `transient_error_retried_then_succeeds` | `run good v0.2.0 FAKE_GH_MODE=flaky FAKE_GH_FAILS=2` | `code=0`; log has 3 lines |
| `persistent_error_fails_after_three_attempts` | `run good v0.2.0 FAKE_GH_MODE=flaky FAKE_GH_FAILS=9` | `code≠0`; log has 3 lines; `untouched` |
| `archive_without_version_json_fails` / `archive_without_index_fails` | `run no-version v0.2.0` / `run no-index v0.2.0` | `code≠0`; `::error::`; `untouched` |
| `version_mismatch_fails` | `run mismatch v0.2.0` | `code≠0`; output names both `0.1.0` and `v0.2.0`; `untouched` |
| `path_traversal_rejected` | `run traversal v0.2.0` | `code≠0`; `untouched`; `[ ! -e "$fx/evil.txt" ]` |
| `corrupt_archive_fails` | fixture `head -c 60 "$fx/good.tgz" > "$fx/corrupt.tgz"`; `run corrupt v0.2.0` | `code≠0`; `::error::` and `not a readable tar.gz`; `untouched` |
| `link_entry_rejected` | fixture `(cd "$fx/src" && ln -s /etc/hosts leak && tar -czf "$fx/symlink.tgz" . && rm leak)`; `run symlink v0.2.0` | `code≠0`; `::error::` and `link or special file`; `untouched` |
| `malformed_tag_rejected` | `run good "--skip-existing"` | `code≠0`; `::error::` and `not of the form`; `untouched`; `$fx/log` does not exist (the value never reaches `gh`) |
| `no_work_files_left_in_repo` | record `before=$(git -C "$repo_root" status --porcelain apps/)` at the top of the script; after all cases | `[ "$(git -C "$repo_root" status --porcelain apps/)" = "$before" ]` (a before/after comparison: Gate 1 must not fail just because someone has unrelated uncommitted work under `apps/`) |

- [ ] **Step 2: Run it, expect failure.** `bash scripts/test-fetch-cli-docs.sh` → `not ok - fetches_named_tag_and_swaps_bundle` (the script does not exist yet).
- [ ] **Step 3: Implement** `scripts/fetch-cli-docs.sh` (`chmod +x`):

```bash
#!/usr/bin/env bash
# Fetch cli-state-handler's docs-site.tgz from its GitHub Release and swap it into the portal bundle folder.
# Fails loudly on every error; there is no skip switch. Never prints the token; do not add `set -x`.
set -euo pipefail
repo="montionugera/cli-state-handler"; asset="docs-site.tgz"; tag="${1:-}"
repo_root=$(cd "$(dirname "$0")/.." && pwd)
bundle_dir="${CLI_DOCS_BUNDLE_DIR:-$repo_root/apps/storybook-hub/portal-bundles/cli-state-handler}"
delay="${CLI_DOCS_RETRY_DELAY:-10}"
fail() { echo "::error::cli-docs: $*" >&2; exit 1; }

[ -n "${GH_TOKEN:-}" ] || fail "secret CLI_DOCS_READ_TOKEN is empty or missing (GH_TOKEN is not set)"
work=$(mktemp -d); trap 'rm -rf "$work"' EXIT   # outside the repository: nothing may leak into apps/

gh_retry() { # permanent errors fail at once; anything else gets 3 attempts in total
  local n=1
  while ! "$@" 2>"$work/gh.err"; do
    if grep -qiE 'not found|HTTP 40[134]|bad credentials|no assets' "$work/gh.err"; then fail "$(tr '\n' ' ' < "$work/gh.err")"; fi
    [ "$n" -lt 3 ] || fail "gave up after 3 attempts: $(tr '\n' ' ' < "$work/gh.err")"
    n=$((n + 1)); sleep "$delay"
  done
}

[ -n "$tag" ] || tag=$(gh_retry gh release view -R "$repo" --json tagName -q .tagName)
[ -n "$tag" ] || fail "no release found in $repo"
[[ "$tag" =~ ^v[0-9A-Za-z._-]+$ ]] || fail "release tag '$tag' is not of the form vX.Y.Z"   # also stops a tag being read as a gh flag
mkdir "$work/dl"
gh_retry gh release download "$tag" -R "$repo" -p "$asset" -D "$work/dl" --clobber   # --clobber: a retry may meet a partial file
[ -s "$work/dl/$asset" ] || fail "release $tag has no $asset"
# Listings go to files: grep -q on a pipe would hide a match under pipefail. Every tar failure gets an ::error:: line.
tar -tzf "$work/dl/$asset" > "$work/list" 2>"$work/tar.err" || fail "$asset is not a readable tar.gz: $(tr '\n' ' ' < "$work/tar.err")"
if grep -qE '^/|(^|/)\.\.(/|$)' "$work/list"; then fail "archive contains an absolute or .. path"; fi
tar -tvzf "$work/dl/$asset" > "$work/vlist" 2>"$work/tar.err" || fail "$asset is not a readable tar.gz: $(tr '\n' ' ' < "$work/tar.err")"
if grep -qvE '^[-d]' "$work/vlist"; then fail "archive contains a link or special file (only files and folders are allowed)"; fi
mkdir "$work/out"
tar -xzf "$work/dl/$asset" --no-same-owner -C "$work/out" 2>"$work/tar.err" || fail "could not unpack $asset: $(tr '\n' ' ' < "$work/tar.err")"
[ -f "$work/out/index.html" ] || fail "archive has no index.html"
[ -f "$work/out/version.json" ] || fail "archive has no version.json"
version=$(sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$work/out/version.json" | head -n 1)
[[ "$version" =~ ^[0-9A-Za-z._-]+$ ]] || fail "version.json has no version usable in an image tag"
[ "v$version" = "$tag" ] || fail "version.json says $version but the release tag is $tag"
rm -rf "$bundle_dir"; mkdir -p "$bundle_dir"; cp -R "$work/out/." "$bundle_dir/"
[ -z "${GITHUB_OUTPUT:-}" ] || echo "cli_docs_version=$version" >> "$GITHUB_OUTPUT"
echo "cli-docs: fetched $tag (version.json $version)"
```

- [ ] **Step 4: Run, expect pass.** `bash scripts/test-fetch-cli-docs.sh` → fourteen `ok - ...` lines, exit 0. (The script and these cases were run by the audit on macOS, bash 3.2 and bsdtar, with a stub `gh`; the runner uses bash 5 and GNU tar, which Gate 1 in CI then proves.)
- [ ] **Step 5:** Add `bash scripts/test-fetch-cli-docs.sh` after line 44 of `scripts/precheck.sh`. Run `bash scripts/precheck.sh 2>&1 | tail -n 5` → exit 0.
- [ ] **Step 6: Commit.** `git add scripts/fetch-cli-docs.sh scripts/test-fetch-cli-docs.sh scripts/precheck.sh && git commit -m "feat(F-NNN): fetch cli-state-handler docs archive, fail loud"`
- [ ] **Step 7: Quality gate A** (credential-handling code, so the full gate):
  1. Implement: Steps 1 to 6.
  2. Verify: `bash scripts/test-fetch-cli-docs.sh; echo exit=$?` → `exit=0`; `grep -n '^ *set -x' scripts/fetch-cli-docs.sh` prints nothing.
  3. Independent review of `git diff release/3.8...HEAD -- scripts/`: dispatch `code-reviewer` and `security-reviewer` (token never printed, temp folder outside the repo, traversal check, no stale file survives the swap).
  4. Refactor on the findings (`/simplify`); new commit.
  5. Re-verify: repeat item 2.

### Task 4: Smoke check compares the served docs version, test-first

**Files:** Create `scripts/test-smoke-cli-docs.sh`. Modify `scripts/smoke-prod.sh` (inside the non-legacy `else` branch, after the sub-webapp loop that ends at line 47), `scripts/precheck.sh`.

**Interfaces — consumes:** environment variable `EXPECTED_CLI_DOCS_VERSION` (unset or empty skips the check).

- [ ] **Step 1: Write the failing test.** A stub `curl` on `PATH`: when its arguments contain `-I` it prints `HTTP/2 200`; when the URL ends in `/cli-state-handler/version.json` it prints `$FAKE_VERSION_BODY`; otherwise it prints `<html>joymify</html>`. Cases, each asserting the exit code of `PATH="$fx/bin:$PATH" bash scripts/smoke-prod.sh dev.joymify.com`:

| Test name | Environment | Must hold |
| --- | --- | --- |
| `matching_version_passes` | `EXPECTED_CLI_DOCS_VERSION=0.2.0`, body `{"version":"0.2.0"}` | exit 0; output has `cli-state-handler docs version 0.2.0` |
| `wrong_version_fails` | expected `0.3.0`, body `{"version":"0.2.0"}` | exit ≠ 0; `::error::` names both values |
| `index_html_instead_of_json_fails` | expected `0.2.0`, body `<html>joymify</html>` (what nginx returns with HTTP 200 for a missing file) | exit ≠ 0 |
| `unset_expected_version_skips` | variable unset, body `<html>` | exit 0; no `docs version` line |
| `legacy_host_never_checks` | expected `0.3.0`, host `design.joymify.com` | exit 0 |

- [ ] **Step 2:** `bash scripts/test-smoke-cli-docs.sh` → `not ok - wrong_version_fails` (the check does not exist; today the script exits 0).
- [ ] **Step 3: Implement**, inserted after the loop's `done`, still inside the `else`:

```bash
  if [ -n "${EXPECTED_CLI_DOCS_VERSION:-}" ]; then
    vbody=$(curl -sS -k --max-time 15 "https://${host}/cli-state-handler/version.json" || true)
    actual=$(printf '%s' "$vbody" | sed -n 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)
    if [ "$actual" != "$EXPECTED_CLI_DOCS_VERSION" ]; then
      echo "::error::cli-state-handler docs version is '${actual:-none}', expected '${EXPECTED_CLI_DOCS_VERSION}'"
      exit 1
    fi
    echo "[OK] cli-state-handler docs version ${actual} matches the fetched release"
  fi
```

- [ ] **Step 4:** `bash scripts/test-smoke-cli-docs.sh` → five `ok` lines. Add it to `scripts/precheck.sh` next to the Task 3 line.
- [ ] **Step 5: Commit** the three files: `feat(F-NNN): smoke check compares served cli docs version`.

### Task 5: Wire `ci.yml`, test-first

**Files:** Create `scripts/test/ci-cli-docs.test.mjs`. Modify `.github/workflows/ci.yml`.

- [ ] **Step 1: Write the failing contract test** (reads the workflow as text, like `publish-contract.test.mjs`). Tests: `declares the optional cli_docs_tag input` (`/cli_docs_tag:[\s\S]*?required: false[\s\S]*?default: ''/`); `fetch step sits between Checkout and Set image tag` (`indexOf('- name: Checkout') < indexOf('- name: Fetch cli-state-handler docs') < indexOf('- name: Set image tag')`); `token is passed only as GH_TOKEN of the fetch step` (exactly one occurrence of `secrets.CLI_DOCS_READ_TOKEN`, and it is on a `GH_TOKEN:` line); `image tag carries the docs version` (`-cli${CLI_DOCS_VERSION}`); `build context stays the workspace` (`context: .`); `job exports cli_docs_version`; `only the dev.joymify.com smoke call gets EXPECTED_CLI_DOCS_VERSION`; `no build-arg or secret mount carries the token` (no `build-args:` or `secrets:` key under "Build and push").
- [ ] **Step 2:** `node --test scripts/test/ci-cli-docs.test.mjs` → fails: 2 pass, 6 fail (`context: .` and "no build-arg or secret mount" already hold on today's file; the other six fail).
- [ ] **Step 3: Implement** four edits in `ci.yml`.

Under `workflow_dispatch.inputs` (after `image_tag`, line 16):

```yaml
      cli_docs_tag:
        description: 'cli-state-handler release tag whose docs to ship (e.g. v0.2.0). Blank = latest release. Ignored when image_tag is set.'
        required: false
        default: ''
```

The step keeps its `id: meta`; only `env:` and `run:` change. Job `build-push-image`: add output `cli_docs_version: ${{ steps.cli_docs.outputs.cli_docs_version }}`; add this step right after "Checkout" (so a bad token fails before the slow Flutter build); replace the body of "Set image tag (short SHA)":

```yaml
      - name: Fetch cli-state-handler docs
        id: cli_docs
        env:
          GH_TOKEN: ${{ secrets.CLI_DOCS_READ_TOKEN }}
          CLI_DOCS_TAG: ${{ inputs.cli_docs_tag }}
        run: bash scripts/fetch-cli-docs.sh "$CLI_DOCS_TAG"
```

```yaml
        env:
          CLI_DOCS_VERSION: ${{ steps.cli_docs.outputs.cli_docs_version }}
        run: |
          [ -n "$CLI_DOCS_VERSION" ] || { echo "::error::cli docs version is empty; refusing to publish an image tagged without it"; exit 1; }
          SHORT_SHA=$(echo "${{ github.sha }}" | cut -c1-12)
          IMAGE_TAG="${SHORT_SHA}-cli${CLI_DOCS_VERSION}"
          echo "image_tag=${IMAGE_TAG}" >> "$GITHUB_OUTPUT"
          echo "IMAGE_TAG=${IMAGE_TAG}" >> "$GITHUB_ENV"
```

Job `deploy`, step "Smoke check" (line 250): add `env: CLI_DOCS_VERSION: ${{ needs.build-push-image.outputs.cli_docs_version }}` and change the first call to `EXPECTED_CLI_DOCS_VERSION="$CLI_DOCS_VERSION" ./scripts/smoke-prod.sh dev.joymify.com`. The `design.joymify.com` call is unchanged. A rollback by `image_tag` skips the image job, so the value is empty and the check is skipped.

- [ ] **Step 4:** `node --test scripts/test/ci-cli-docs.test.mjs` → 8 pass. `actionlint .github/workflows/ci.yml | wc -l` → no higher than the Task 2 baseline.
- [ ] **Step 5: Commit** both files: `ci(F-NNN): fetch cli docs before image build, tag image with docs version`.
- [ ] **Step 6: Quality gate B** (covers Tasks 4 and 5; this is deploy surface):
  1. Implement: Tasks 4 and 5.
  2. Verify: `bash scripts/test-smoke-cli-docs.sh && node --test 'scripts/test/*.test.mjs' 2>&1 | tail -n 8` → `fail 0`.
  3. Independent review of `git diff release/3.8...HEAD -- .github scripts/smoke-prod.sh scripts/test`: dispatch `code-reviewer`, asking specifically: can any path publish an image without the fetch; does a pull-request run reach the fetch step; is the token in exactly one step.
  4. Refactor on the findings; new commit.
  5. Re-verify: repeat item 2, then `bash scripts/precheck.sh 2>&1 | tail -n 5` → exit 0.

### Task 6: Local end-to-end on a fixture archive, deploying nothing

No workflow is dispatched, nothing is pushed, **nothing is downloaded from GitHub**, and no token is used. An earlier agent was refused permission to download the private v0.2.0 asset, so every required gate here runs on a fixture archive built on the spot. Step 7 (the real archive) is optional and owner-run.

- [ ] **Step 1 (build the fixture and a stub `gh`, outside the repository):**

```bash
fx=$(mktemp -d); mkdir -p "$fx/src/assets" "$fx/bin"
echo '<html>cli docs fixture</html>' > "$fx/src/index.html"; echo 'x' > "$fx/src/assets/a.js"
printf '{"version":"0.2.0"}\n' > "$fx/src/version.json"
tar -czf "$fx/docs-site.tgz" -C "$fx/src" .
cat > "$fx/bin/gh" <<'STUB'
#!/usr/bin/env bash
while [ $# -gt 0 ]; do [ "$1" = "-D" ] && dest="$2"; shift; done
mkdir -p "$dest"; cp "$FAKE_GH_ARCHIVE" "$dest/docs-site.tgz"
STUB
chmod +x "$fx/bin/gh"; echo "$fx"
```

Expected: prints the fixture folder path. The archive has the same shape as the real one (no top-level folder; `./index.html`, `./assets/...`, `./version.json`).

- [ ] **Step 2 (the real script, the fixture archive):** `PATH="$fx/bin:$PATH" GH_TOKEN=fake FAKE_GH_ARCHIVE="$fx/docs-site.tgz" bash scripts/fetch-cli-docs.sh v0.2.0`. Expected: `cli-docs: fetched v0.2.0 (version.json 0.2.0)`; `cat apps/storybook-hub/portal-bundles/cli-state-handler/version.json` prints `{"version":"0.2.0"}`; `git status --porcelain apps/` lists only paths under `apps/storybook-hub/portal-bundles/cli-state-handler/`.
- [ ] **Step 3 (image tag and image content):** `TAG="$(git rev-parse HEAD | cut -c1-12)-cli0.2.0"; docker build -t "portal-test:$TAG" . && docker run -d --rm --name portal-test -p 8080:80 "portal-test:$TAG"`, then `curl -s localhost:8080/cli-state-handler/version.json` → `{"version":"0.2.0"}`; `curl -s -o /dev/null -w '%{http_code}' localhost:8080/cli-state-handler/` → `200`; `docker history --no-trunc "portal-test:$TAG" | grep -ci 'github_pat\|GH_TOKEN'` → `0`. (If port 8080 is taken, use 8081 in both places.) This proves `docker build` accepts the tag form and that the unpacked files reach nginx at the right path.
- [ ] **Step 4 (the smoke check against that container is not possible:** `smoke-prod.sh` speaks `https` only; its logic is covered by Task 4's stub tests.) Nothing to run; recorded so nobody tries to bend the script.
- [ ] **Step 5 (clean up):** `docker stop portal-test`; restore the snapshot with the command in Global Constraints; `rm -rf "$fx"`; `git status --porcelain` prints nothing.
- [ ] **Step 6 (spec UNVERIFIED: cache in front of the portal), read-only request to the public site:** `curl -sI https://dev.joymify.com/cli-state-handler/ | grep -iE 'cache-control|^age:|cf-cache-status|x-cache|^via:'`. No cache header: nothing to do. A cache header: report it to the owner before Task 8; do not add a workaround unasked.
- [ ] **Step 7 — OPTIONAL, OWNER-RUN, not a gate. STOP — needs the owner's yes:** downloading the real private asset. If the owner wants the spec's UNVERIFIED item "the v0.2.0 asset was not opened" closed before the first production run, the owner runs: `d=$(mktemp -d) && gh release download v0.2.0 -R montionugera/cli-state-handler -p docs-site.tgz -D "$d" && tar -xzOf "$d/docs-site.tgz" ./version.json`. Expected: `{"version":"0.2.0"}`. The implementer does not run this and does not wait for it. If it is skipped, the first run on `main` (Task 8) is where a missing `version.json` shows up: the fetch step fails with `archive has no version.json`, no image is published, and the live portal keeps its previous image.

**`gh` error wording (already checked by the audit, no action needed):** with `gh` 2.92.0 against a public repository, a missing release prints `release not found`, a release without a matching asset prints `no assets match the file pattern`, and a rejected token prints `HTTP 401: Bad credentials`. All three match the permanent-error pattern in `gh_retry`. Any wording the pattern does not know is retried and then **fails** after the third attempt, so an unknown error can cost 20 seconds but can never skip the fetch.

**What this task cannot prove — only a real run on `main` can:** that the real archive contains `version.json` (unless Step 7 is run); that `CLI_DOCS_READ_TOKEN` authenticates and is scoped correctly; that `gh` on the runner resolves "latest" and words its errors the same way; that the step order and job outputs behave as written; that Kubernetes pulls the new tag; that the smoke check passes against production; that a pull-request run shows no fetch step. The spec's laptop check "with a token in `GH_TOKEN`" is likewise left to the owner (optional), because the implementer may not hold a token.

### Task 7: README (last implementation task)

- [ ] **Step 1:** Re-run the Task 0 command. If the rename has shipped, bring it in first with `psrw sync` (merges `release/3.8` into this worktree; do not rebase by hand and do not force anything), resolve, and re-run `bash scripts/precheck.sh`. If it has not shipped, write the README change anyway and expect whichever lane ships second to merge the other's README hunk; keep the edit to the two places below so that merge is trivial.
- [ ] **Step 2:** In `README.md`, correct line 312: the portal image is built by the `Dockerfile` (`node apps/storybook-hub/build.js`); `scripts/assemble-portal.sh` is a local-only helper that copies from sibling checkouts. Then add a section "CLI State Handler docs source" directly below, covering, from what Tasks 3 to 6 verified: the fetch step and where it runs (image job only, never pull requests); the `cli_docs_tag` input (blank means latest; ignored with `image_tag`); the image tag form `<12-char hash>-cli<X.Y.Z>`; the secret `CLI_DOCS_READ_TOKEN`, its scope and how to renew it (Task 1 table); the fail-loud rule and that there is no skip switch; the check command `curl -s https://dev.joymify.com/cli-state-handler/version.json`; the rollback levers from "If it goes wrong". Keep the edit outside generated regions.
- [ ] **Step 3: Verify.** `node scripts/gen-design-md.mjs --check` exits 0; `pnpm exec prettier --check README.md` passes; `grep -n 'CLI_DOCS_READ_TOKEN\|cli_docs_tag' README.md` shows both.
- [ ] **Step 4: Commit** `README.md` only: `docs(F-NNN): document the cli docs fetch step`.
- [ ] **Step 5: Quality gate C:** verify (Step 3 plus `bash scripts/precheck.sh` exit 0) → independent `code-reviewer` pass over the whole feature diff, checking every README claim against the code → fix in a new commit → re-verify.

### Task 8: Release steps — every one waits for the owner

Which release-tool commands reach the remote (read from `psrw ship --help` and the source under `~/.claude/ps-release-workflow/`): `psrw refine`, `psrw claim` and `psrw sync` are local only (no push, no fetch). `psrw ship` **does not push**; it fetches `origin/main` (read-only), merges `main` and then `feat/F-NNN` into the local `release/3.8`, and removes the feature worktree. `psrw promote` is the first command that pushes.

- [ ] `psrw ship --no-deploy` from the feature worktree. Local and undoable (a merge commit on the local `release/3.8`), so no owner stop; but it lands on the branch the rename session is also shipping to, so say what you are doing first, and run it only when Gates A, B and C are green. Expected: Gate 1 passes, output ends with the feature marked shipped; `git -C .claude/worktrees/_release log --oneline -1` shows the merge. `--no-deploy` because another session is shipping to the same release (joy-design has no local deploy configured, so this is belt and braces).
- [ ] **STOP — needs the owner's yes:** any `git push`.
- [ ] **STOP — needs the owner's yes:** `psrw promote`. It runs Gate 2 (the integration check), **pushes `release/3.8` to GitHub** and opens the pull request to `main`. It carries the whole release, including the other session's package rename, so it is the release manager's call, not this feature's. Once open, check its `ci.yml` run: no "Fetch cli-state-handler docs" step, run green.
- [ ] **STOP — needs the owner's yes:** merging that pull request. **This builds and deploys the live developer portal**, and it is the first real use of `CLI_DOCS_READ_TOKEN`, so Task 1 must be done first or the build fails (by design; the live portal keeps its previous image).
- [ ] After the merge run: `gh run view <id> --log | grep 'cli-docs: fetched'` shows the release line; `grep 'Deploying Storybook Hub'` shows a tag ending `-cli0.2.0`; the run concludes `success`; `curl -s https://dev.joymify.com/cli-state-handler/version.json` prints `{"version":"0.2.0"}`. Repeat the `curl` three times a minute apart (the cache UNVERIFIED item).
- [ ] **STOP — needs the owner's yes:** the spec's dispatch acceptance check, `gh workflow run ci.yml -R montionugera/joy-design --ref main -f cli_docs_tag=v0.2.0`. **It deploys to production** (a dispatch always runs the `deploy` job). Skip it if the merge run already proved the same lines.
- [ ] **STOP — needs the owner's yes:** anything touching the cluster directly (`kubectl`), including a rollback.

## Follow-up owned elsewhere

One line in `cli-state-handler/.github/workflows/release.yml` (line 163): pass `-f cli_docs_tag=v$VERSION` when signalling the portal. **Not part of this plan.** Order: joy-design must ship the `cli_docs_tag` input to `main` first (Task 8), because a dispatch naming an undeclared input is expected to be rejected (UNVERIFIED; the order is safe either way). Checks that belong to that follow-up: that `gh workflow run -f` needs nothing beyond "Actions: Read and write" on `PORTAL_DISPATCH_TOKEN`; that the next release logs no `PORTAL_DISPATCH_TOKEN is not set` warning; that the resulting joy-design run produces a new image tag from an unchanged commit.

## If it goes wrong

The first, second and fourth are production actions and each carries its own stop.

- **STOP — needs the owner's yes:** **Bad docs, good pipeline:** re-run `ci.yml` with `cli_docs_tag` set to the previous release tag (usable from the second release; only v0.2.0 exists today).
- **STOP — needs the owner's yes:** **Bad portal image:** run `ci.yml` with `image_tag` set to the previous image tag. No build, no fetch; exact, because each tag names one commit plus one docs version.
- **Build blocked by a failed fetch:** the live portal keeps the previous image. Fix the token or the release; there is no skip switch.
- **STOP — needs the owner's yes:** **Bad change:** revert the joy-design commits (a push to `main`, which redeploys); the tracked snapshot is served again. Revoke both tokens if the feature is abandoned.

## Known limits carried from the spec's audit (not fixed here)

Gate 1 and the Playwright contracts still test the tracked snapshot, not the fetched docs. If the release signal never arrives, the portal stays on older docs until the next push to `main`. `image_tag` and `cli_docs_tag` given together: the docs tag is ignored silently (now stated in the input description).

## Audit trail

Independent audit of this plan against the approved spec, 2026-10-09 (self-grill-audit method: refute against the real files). Read-only: nothing was dispatched, pushed or downloaded. The fetch script and its test were extracted from this plan and run in a scratch folder with a stub `gh`. Verdict: **ready after fixes** (applied below).

| Severity | Finding | Change |
| --- | --- | --- |
| HIGH | Task 6 needed the real private v0.2.0 asset in three steps; an implementer refused that download could not finish any local gate. | Task 6 rewritten around a fixture archive and an inline stub; the real-archive check is Step 7, optional and owner-run. |
| HIGH | `psrw ship` was labelled "may push". It does not. Its real effects (fetches `origin/main`, merges `main` into `release/3.8`, removes the worktree) were not stated, and `psrw promote` was not said to push the whole release, rename included. | Task 8 states which commands reach the remote; ship relabelled as local, promote's stop says what it pushes. |
| HIGH | Rollback actions that redeploy production shared one sentence instead of each carrying the literal stop prefix. | Prefix added to each of the three. |
| MEDIUM | A corrupt or truncated archive exited non-zero but with a bare `tar` message, against the plan's own rule that every failure prints `::error::`. Confirmed by running it. | Each `tar` call now ends in `fail`; test `corrupt_archive_fails`. |
| MEDIUM | The traversal check read entry names only; a symbolic link entry passed it and would be copied into the image. (Both tar programs refuse to write through a link, so nothing escaped in the run.) | Links and special files rejected from the long listing; test `link_entry_rejected`. |
| MEDIUM | A `cli_docs_tag` value beginning with `-` reached `gh` as a flag. Confirmed by running it. | Tag must match `vX.Y.Z` before any `gh` call; test `malformed_tag_rejected`. |
| MEDIUM | A retry after a partial download could meet an existing file and fail three times for that reason alone. | `--clobber` (a real flag, per `gh release download --help`) and an explicit `mkdir`. |
| MEDIUM | `no_work_files_left_in_repo` required a clean `apps/`, so Gate 1 would fail for anyone with unrelated uncommitted work there. | Before/after comparison. |
| MEDIUM | An empty docs version would publish an image tagged `<hash>-cli`. | Guard in "Set image tag". |
| MEDIUM | Task 5 Step 2 predicted 1 passing contract test; 2 already pass on today's file. | Corrected. |
| LOW | The swap is delete-then-copy, not atomic; a failed copy leaves a partial folder. The script still exits non-zero, so no image is built from it, and locally `git checkout` restores it. | Left. |
| LOW | The step-order contract test uses the first of three "Checkout" steps; only its "Fetch before Set image tag" half is meaningful. | Left. |

Confirmed correct against the real files: `ci.yml` step lines 126, 139, 156, 250 and `context: .`; the image job never runs on `pull_request` (its `if`, lines 112-116), so the secret is never read there and the step is skipped, not failed; `deploy` is skipped when the image job fails (`!failure()`, line 174); the token appears only as `GH_TOKEN` of one step and never as a build argument; `inputs.cli_docs_tag` reaches the script through `env`, not through shell interpolation; `<hash>-cli<X.Y.Z>` is a legal image tag and is what the deploy job's `sed` writes into `k8s/deployment.yml` line 28; `precheck.sh` line 44 and its `scripts/test/*.test.mjs` glob (line 56); `smoke-prod.sh` lines 28 and 47; retry loop is 3 attempts in total; `gh release view --json/-q` and `gh release download -p/-D/-R` are real flags; the rename lane (94 changed files today) overlaps this plan only in `README.md`.

Still UNVERIFIED: the real v0.2.0 archive's contents; the hardened script on GNU tar and bash 5 (run only on macOS); `gh` wording on the runner's version; the fine-grained token permission mapping; a cache in front of dev.joymify.com; whether GitHub rejects an undeclared dispatch input.
