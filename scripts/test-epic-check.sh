#!/usr/bin/env bash
set -euo pipefail

# Break caught: the epic gate can continue after a failed prerequisite or run
# its required checks in the wrong order.
# Assertions use explicit `|| fail`: macOS bash 3.2 does not exit on a false `[[ ]]` under set -e.
fail() { echo "FAIL scripts/test-epic-check.sh: $*" >&2; exit 1; }
repo_root=$(cd "$(dirname "$0")/.." && pwd)
fixture_dir=$(mktemp -d)
trap 'rm -rf "$fixture_dir"' EXIT
mkdir -p "$fixture_dir/bin"

cat > "$fixture_dir/bin/pnpm" <<'EOF'
#!/usr/bin/env bash
printf 'pnpm %s\n' "$*" >> "$EPIC_CHECK_LOG"
[[ ${EPIC_CHECK_FAIL_PNPM:-0} == 0 ]]
EOF
cat > "$fixture_dir/bin/node" <<'EOF'
#!/usr/bin/env bash
printf 'node %s\n' "$*" >> "$EPIC_CHECK_LOG"
EOF
cat > "$fixture_dir/bin/playwright" <<'EOF'
#!/usr/bin/env bash
printf 'playwright %s\n' "$*" >> "$EPIC_CHECK_LOG"
EOF
chmod +x "$fixture_dir/bin/pnpm" "$fixture_dir/bin/node" "$fixture_dir/bin/playwright"

export EPIC_CHECK_LOG="$fixture_dir/checks.log"
PATH="$fixture_dir/bin:$PATH" "$repo_root/scripts/epic-check.sh" >/dev/null
expected=$'node scripts/parity-check.mjs\nnode scripts/gen-design-md.mjs --check\npnpm check\npnpm -r test\nnode apps/storybook-hub/build.js\nplaywright test'
[[ $(cat "$EPIC_CHECK_LOG") == "$expected" ]] || fail "unexpected step order: $(tr '\n' '|' < "$EPIC_CHECK_LOG")"

: > "$EPIC_CHECK_LOG"
if EPIC_CHECK_FAIL_PNPM=1 PATH="$fixture_dir/bin:$PATH" "$repo_root/scripts/epic-check.sh" >"$fixture_dir/failure.log" 2>&1; then
  echo "expected a failed pnpm test step to fail epic-check" >&2
  exit 1
fi
grep -q 'FAIL epic-check: type check' "$fixture_dir/failure.log" || fail "missing type-check failure message"
[[ $(cat "$EPIC_CHECK_LOG") == $'node scripts/parity-check.mjs\nnode scripts/gen-design-md.mjs --check\npnpm check' ]] || fail "epic-check continued after a failed step"

echo "PASS scripts/test-epic-check.sh"
