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
if [[ $1 == install ]]; then [[ ${EPIC_CHECK_FAIL_INSTALL:-0} == 0 ]]; exit; fi
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

# psrw runs the epic hook in a fresh detached worktree with no node_modules:
# the gate must install deps first, and stop if that install fails.
missing_deps="$fixture_dir/no-such-node_modules"
: > "$EPIC_CHECK_LOG"
EPIC_CHECK_NODE_MODULES="$missing_deps" PATH="$fixture_dir/bin:$PATH" "$repo_root/scripts/epic-check.sh" >/dev/null
[[ $(cat "$EPIC_CHECK_LOG") == $'pnpm install --frozen-lockfile --prefer-offline\n'"$expected" ]] || fail "deps not installed before the steps: $(tr '\n' '|' < "$EPIC_CHECK_LOG")"

# Some node_modules/.pnpm files are tracked in git, so a fresh checkout has a
# node_modules dir that pnpm never installed into: that must still install.
tracked_only="$fixture_dir/tracked-only/node_modules"
mkdir -p "$tracked_only/.pnpm"
: > "$EPIC_CHECK_LOG"
EPIC_CHECK_NODE_MODULES="$tracked_only" PATH="$fixture_dir/bin:$PATH" "$repo_root/scripts/epic-check.sh" >/dev/null
[[ $(cat "$EPIC_CHECK_LOG") == $'pnpm install --frozen-lockfile --prefer-offline\n'"$expected" ]] || fail "a never-installed node_modules dir skipped the install: $(tr '\n' '|' < "$EPIC_CHECK_LOG")"

: > "$EPIC_CHECK_LOG"
if EPIC_CHECK_FAIL_INSTALL=1 EPIC_CHECK_NODE_MODULES="$missing_deps" PATH="$fixture_dir/bin:$PATH" "$repo_root/scripts/epic-check.sh" >"$fixture_dir/install.log" 2>&1; then
  fail "expected a failed dependency install to fail epic-check"
fi
grep -q 'FAIL epic-check: dependency install' "$fixture_dir/install.log" || fail "missing dependency-install failure message"
[[ $(cat "$EPIC_CHECK_LOG") == 'pnpm install --frozen-lockfile --prefer-offline' ]] || fail "epic-check ran steps after a failed install"

echo "PASS scripts/test-epic-check.sh"
