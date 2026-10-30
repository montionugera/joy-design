#!/usr/bin/env bash
set -euo pipefail
# Break caught: skipping the post-merge gate on a tree that was never verified (main has no branch protection).
repo_root=$(cd "$(dirname "$0")/.." && pwd)
fx=$(mktemp -d); trap 'rm -rf "$fx"' EXIT
mkdir -p "$fx/bin"
cat > "$fx/bin/gh" <<'STUB'
#!/usr/bin/env bash
# Routes on the API path; FAKE_* env switches the scenario. --jq is applied with the real jq.
path="$2"; jq_expr=""
while [ $# -gt 0 ]; do [ "$1" = "--jq" ] && jq_expr="$2"; shift; done
# Defaults live in variables: a `}` inside a ${VAR:-default} would end the expansion early.
pulls_ok='[{"merged_at":"2026-01-01","merge_commit_sha":"main1","head":{"sha":"head1"}}]'
checks_ok='{"check_runs":[{"name":"🔨 Build & Check","conclusion":"success"}]}'
case "$path" in
  */commits/main1/pulls) body="${FAKE_PULLS:-$pulls_ok}" ;;
  */commits/main1) body="{\"commit\":{\"tree\":{\"sha\":\"tree-main\"}}}" ;;
  */commits/head1) body="{\"commit\":{\"tree\":{\"sha\":\"${FAKE_HEAD_TREE:-tree-main}\"}}}" ;;
  */commits/head1/check-runs*) body="${FAKE_CHECKS:-$checks_ok}" ;;
  *) exit 1 ;;
esac
[ "${FAKE_API_DOWN:-}" = 1 ] && exit 1
echo "$body" | jq -r "$jq_expr"
STUB
chmod +x "$fx/bin/gh"

run() { env PATH="$fx/bin:$PATH" GITHUB_REPOSITORY=o/r SHA=main1 "$@" bash "$repo_root/scripts/gate-reuse.sh" 2>/dev/null; }
expect() { [ "$(run "${@:2}")" = "reuse=$1" ] || { echo "FAIL: expected reuse=$1 for: ${*:2}" >&2; exit 1; }; }

command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }
expect true
expect false FAKE_HEAD_TREE=tree-other
expect false 'FAKE_PULLS=[]'
expect false 'FAKE_PULLS=[{"merged_at":null,"merge_commit_sha":"main1","head":{"sha":"head1"}}]'
expect false 'FAKE_PULLS=[{"merged_at":"2026-01-01","merge_commit_sha":"other","head":{"sha":"head1"}}]'
expect false 'FAKE_CHECKS={"check_runs":[{"name":"🔨 Build & Check","conclusion":"failure"}]}'
expect false 'FAKE_CHECKS={"check_runs":[{"name":"🔨 Build & Check","conclusion":"success"},{"name":"🔨 Build & Check","conclusion":"failure"}]}'
expect false 'FAKE_CHECKS={"check_runs":[{"name":"Detect changes","conclusion":"success"}]}'
expect false 'FAKE_CHECKS={"check_runs":[]}'
expect false FAKE_API_DOWN=1
echo "gate-reuse: all 10 scenarios behave"
