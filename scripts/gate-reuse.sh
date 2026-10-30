#!/usr/bin/env bash
# Decides whether a push to main can reuse the Gate 1 result of the PR it came from.
# Prints "reuse=true" only when ALL hold: an associated merged PR whose merge commit is $SHA, the PR head tree equals
# the tree of $SHA, and a successful "Build & Check" check run exists on the PR head. Anything else (no PR, tree
# differs, check missing or failed, any API error) prints "reuse=false": it fails closed and the full gate runs.
# Env: GITHUB_REPOSITORY, SHA (commit pushed to main), GH_TOKEN. Always exits 0 so the caller reads the output.
set -uo pipefail

no() { echo "gate-reuse: $1 -> running the full gate" >&2; echo "reuse=false"; exit 0; }

: "${GITHUB_REPOSITORY:?}" "${SHA:?}"
repo="$GITHUB_REPOSITORY"

pr_head=$(gh api "repos/$repo/commits/$SHA/pulls" \
  --jq "[.[] | select(.merged_at != null and .merge_commit_sha == \"$SHA\")] | first | .head.sha // empty") \
  || no "pulls lookup failed"
[ -n "$pr_head" ] || no "no merged PR with merge commit $SHA"

main_tree=$(gh api "repos/$repo/commits/$SHA" --jq '.commit.tree.sha') || no "commit lookup failed"
head_tree=$(gh api "repos/$repo/commits/$pr_head" --jq '.commit.tree.sha') || no "PR head lookup failed"
[ -n "$main_tree" ] && [ "$main_tree" = "$head_tree" ] || no "tree differs (main $main_tree, PR head $head_tree)"

verdict=$(gh api "repos/$repo/commits/$pr_head/check-runs?per_page=100" \
  --jq '[.check_runs[] | select(.name | contains("Build & Check"))] | if length > 0 and all(.conclusion == "success") then "ok" else "bad" end') \
  || no "check-runs lookup failed"
[ "$verdict" = "ok" ] || no "no green Build & Check on $pr_head"

echo "gate-reuse: tree $main_tree already verified on PR head $pr_head" >&2
echo "reuse=true"
