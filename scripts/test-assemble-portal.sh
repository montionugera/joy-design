#!/usr/bin/env bash
set -euo pipefail
# Break caught: assemble-portal.sh quietly shipping a stale or missing cli-state-handler bundle.
# Runs a copy of the script inside a throwaway tree whose two build steps are no-ops.
repo_root=$(cd "$(dirname "$0")/.." && pwd)
fx=$(mktemp -d); trap 'rm -rf "$fx"' EXIT
die() { echo "FAIL: $1"; exit 1; }; ok() { echo "ok: $1"; }
mkdir -p "$fx/repo/scripts" "$fx/repo/packages/tokens" "$fx/repo/apps/storybook-hub"
cp "$repo_root/scripts/assemble-portal.sh" "$fx/repo/scripts/"
echo '' > "$fx/repo/packages/tokens/build.js"; echo '' > "$fx/repo/apps/storybook-hub/build.js"
run() { set +e; out=$(bash "$fx/repo/scripts/assemble-portal.sh" 2>&1); code=$?; set -e; }
dist="$fx/repo/apps/storybook-hub/dist/cli-state-handler"

run
[ "$code" != 0 ] && echo "$out" | grep -q 'scripts/fetch-cli-docs.sh' && [ ! -e "$dist/index.html" ] || die missing_bundle_fails_loudly_naming_fetch_script
ok missing_bundle_fails_loudly_naming_fetch_script

mkdir -p "$fx/repo/apps/storybook-hub/portal-bundles/cli-state-handler"
echo '<html>fetched</html>' > "$fx/repo/apps/storybook-hub/portal-bundles/cli-state-handler/index.html"
run
[ "$code" = 0 ] && grep -q fetched "$dist/index.html" || die fetched_bundle_is_served
ok fetched_bundle_is_served
