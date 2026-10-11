#!/usr/bin/env bash
# Usage: fetch-portal-docs.sh <owner/repo> <bundle-name> [vX.Y.Z]
# With PORTAL_DOCS_RESOLVE_ONLY=1 it only resolves the tag (blank = latest release), writes <name>_docs_tag=<tag>
# to $GITHUB_OUTPUT and downloads nothing: CI resolves once and every later job fetches exactly that tag.
# Fetch <owner/repo>'s docs-site.tgz from its GitHub Release (blank tag = latest) and swap it into
# apps/storybook-hub/portal-bundles/<bundle-name>. Used for cli-state-handler and server-decorator.
# Fails loudly on every error; there is no skip switch. Never prints the token; do not add `set -x`.
set -euo pipefail
asset="docs-site.tgz"; repo="${1:-}"; name="${2:-}"; tag="${3:-}"
fail() { echo "::error::portal-docs: $*" >&2; exit 1; }
[[ "$repo" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]] || fail "usage: fetch-portal-docs.sh <owner/repo> <bundle-name> [vX.Y.Z]; got repo '$repo'"
[[ "$name" =~ ^[a-z][a-z0-9-]*$ ]] || fail "bundle name '$name' must be lowercase letters, digits and dashes"
repo_root=$(cd "$(dirname "$0")/.." && pwd)
bundle_dir="${PORTAL_DOCS_BUNDLE_DIR:-$repo_root/apps/storybook-hub/portal-bundles/$name}"
delay="${PORTAL_DOCS_RETRY_DELAY:-10}"

[ -n "${GH_TOKEN:-}" ] || fail 'GH_TOKEN is empty or missing (CI passes the built-in github.token; locally run: GH_TOKEN=$(gh auth token) bash scripts/fetch-portal-docs.sh $repo $name)'
work=$(mktemp -d); trap 'rm -rf "$work" "$bundle_dir.new"' EXIT   # outside the repository: nothing may leak into apps/

gh_retry() { # permanent errors fail at once; network errors, 5xx and rate limits (403/429) get 3 attempts in total
  local n=1
  while ! "$@" 2>"$work/gh.err"; do
    # A 403 carrying a rate-limit message is transient; any other 403, 401, 404 is permanent.
    if ! grep -qiE 'rate limit|abuse detection' "$work/gh.err" && grep -qiE 'not found|HTTP 40[134]|bad credentials|no assets' "$work/gh.err"; then fail "$(tr '\n' ' ' < "$work/gh.err")"; fi
    [ "$n" -lt 3 ] || fail "gave up after 3 attempts: $(tr '\n' ' ' < "$work/gh.err")"
    # The reason is gh's own first stderr line (never the request headers), capped at 200 chars.
    echo "portal-docs: attempt $n of 3 failed ($(head -n 1 "$work/gh.err" | cut -c1-200)); retrying in $((delay * n))s" >&2
    sleep $((delay * n)); n=$((n + 1))   # linear back-off: a rate limit needs longer than a reset connection
  done
}

[ -n "$tag" ] || tag=$(gh_retry gh release view -R "$repo" --json tagName -q .tagName)
[ -n "$tag" ] || fail "no release found in $repo"
[[ "$tag" =~ ^v[0-9A-Za-z._-]+$ ]] || fail "release tag '$tag' is not of the form vX.Y.Z"   # also stops a tag being read as a gh flag
if [ -n "${PORTAL_DOCS_RESOLVE_ONLY:-}" ]; then
  [ -z "${GITHUB_OUTPUT:-}" ] || echo "${name//-/_}_docs_tag=$tag" >> "$GITHUB_OUTPUT"
  echo "portal-docs: resolved $name to $tag"; exit 0
fi
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
[ -z "${GITHUB_OUTPUT:-}" ] || echo "${name//-/_}_docs_version=$version" >> "$GITHUB_OUTPUT"
echo "portal-docs: fetched $name $tag (version.json $version)"
