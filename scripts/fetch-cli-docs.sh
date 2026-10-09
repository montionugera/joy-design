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
work=$(mktemp -d); trap 'rm -rf "$work" "$bundle_dir.new"' EXIT   # outside the repository: nothing may leak into apps/

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
# Copy beside the snapshot first so a failed copy never costs the old one; the trap removes any leftover .new
rm -rf "$bundle_dir.new"; mkdir -p "$bundle_dir.new"; cp -R "$work/out/." "$bundle_dir.new/"
rm -rf "$bundle_dir"; mv "$bundle_dir.new" "$bundle_dir"
[ -z "${GITHUB_OUTPUT:-}" ] || echo "cli_docs_version=$version" >> "$GITHUB_OUTPUT"
echo "cli-docs: fetched $tag (version.json $version)"
