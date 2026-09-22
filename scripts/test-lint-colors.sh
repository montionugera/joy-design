#!/usr/bin/env bash
set -euo pipefail

# Break caught: color literals or Joy variable fallbacks can enter source without
# making the strict color gate fail.
repo_root=$(cd "$(dirname "$0")/.." && pwd)
fixture_dir=$(mktemp -d)
trap 'rm -rf "$fixture_dir"' EXIT

literal_file="$fixture_dir/has-literal.css"
clean_file="$fixture_dir/is-tokenized.css"
fallback_file="$fixture_dir/has-fallback.css"

printf '%s\n' '.example { color: #abcdef; }' > "$literal_file"
printf '%s\n' '.example { color: var(--joy-text-primary); }' > "$clean_file"
printf '%s\n' '.example { color: var(--joy-text-primary, black); }' > "$fallback_file"

if "$repo_root/scripts/lint-colors.sh" --strict "$literal_file" >/dev/null 2>&1; then
  echo "expected strict mode to reject a hex literal" >&2
  exit 1
fi

if "$repo_root/scripts/lint-colors.sh" --strict "$fallback_file" >/dev/null 2>&1; then
  echo "expected strict mode to reject a Joy variable fallback" >&2
  exit 1
fi

"$repo_root/scripts/lint-colors.sh" --strict "$clean_file" >/dev/null
echo "PASS scripts/test-lint-colors.sh"
