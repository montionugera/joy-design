#!/usr/bin/env bash
set -euo pipefail

export PLAYWRIGHT_PORT="${PLAYWRIGHT_PORT:-6116}"

run_step() {
  local label=$1
  shift
  if "$@"; then
    return 0
  fi

  echo "FAIL epic-check: $label" >&2
  exit 1
}

run_playwright_contracts() {
  if command -v playwright >/dev/null 2>&1; then
    (cd apps/storybook-hub && playwright test)
  elif [[ -f node_modules/.bin/playwright ]]; then
    (cd apps/storybook-hub && ../../node_modules/.bin/playwright test)
  elif [[ -f apps/storybook-hub/node_modules/.bin/playwright ]]; then
    (cd apps/storybook-hub && ./node_modules/.bin/playwright test)
  elif command -v pnpm >/dev/null 2>&1 && pnpm --filter storybook-hub exec playwright --version >/dev/null 2>&1; then
    pnpm --filter storybook-hub exec playwright test
  elif command -v pnpm >/dev/null 2>&1; then
    echo "No Playwright runner is available. Install dependencies before running the epic check." >&2
    return 1
  elif command -v npx >/dev/null 2>&1; then
    (cd apps/storybook-hub && npx playwright test)
  else
    echo "No Playwright runner is available." >&2
    return 1
  fi
}

echo "==> Epic design-system check <=="
run_step "color lint" bash scripts/lint-colors.sh
run_step "parity check" node scripts/parity-check.mjs
run_step "design doc drift" node scripts/gen-design-md.mjs --check
run_step "type check" pnpm check
run_step "pnpm workspace tests" pnpm -r test
run_step "Storybook Hub build" node apps/storybook-hub/build.js
if ! run_playwright_contracts; then
  echo "FAIL epic-check: Playwright quality contracts" >&2
  exit 1
fi

echo "PASS epic-check: color lint, parity, design doc drift, type check, workspace tests, hub build, and Playwright contracts."
