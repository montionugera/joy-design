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
hub="$fx/repo/apps/storybook-hub"; dist="$hub/dist"
put() { mkdir -p "$hub/portal-bundles/$1"; echo "<html>fetched $1</html>" > "$hub/portal-bundles/$1/index.html"; }

run
[ "$code" != 0 ] && echo "$out" | grep -q 'scripts/fetch-portal-docs.sh' && [ ! -e "$dist/cli-state-handler/index.html" ] || die missing_bundles_fail_loudly_naming_fetch_script
ok missing_bundles_fail_loudly_naming_fetch_script

put cli-state-handler
run
[ "$code" != 0 ] && echo "$out" | grep -q 'server-decorator' && echo "$out" | grep -q 'scripts/fetch-portal-docs.sh' && [ ! -e "$dist/server-decorator/index.html" ] || die missing_server_decorator_bundle_fails_loudly_no_stub
ok missing_server_decorator_bundle_fails_loudly_no_stub

rm -rf "$hub/portal-bundles"; put server-decorator
run
[ "$code" != 0 ] && echo "$out" | grep -q 'cli-state-handler' || die missing_cli_bundle_fails_loudly
ok missing_cli_bundle_fails_loudly

put cli-state-handler
run
[ "$code" = 0 ] && grep -q 'fetched cli-state-handler' "$dist/cli-state-handler/index.html" && grep -q 'fetched server-decorator' "$dist/server-decorator/index.html" || die fetched_bundles_are_served
ok fetched_bundles_are_served
