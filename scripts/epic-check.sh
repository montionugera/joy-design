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

# The portal bundles are gitignored, so a fresh detached worktree has none and the hub
# serves 404 for /server-decorator/ and /cli-state-handler/. Mirrors precheck.sh fetch_docs.
fetch_docs() {
  [[ -s "${EPIC_CHECK_BUNDLES_DIR:-apps/storybook-hub/portal-bundles}/$2/version.json" ]] && return 0
  if [[ -z "${GH_TOKEN:-}" ]]; then
    if ! command -v gh >/dev/null 2>&1 || ! gh auth status >/dev/null 2>&1; then
      echo "ERROR: GH_TOKEN is not set and the GitHub CLI is not logged in, so the $2 docs cannot be downloaded." >&2
      echo "       Run 'gh auth login' (then re-run), or export GH_TOKEN." >&2
      return 1
    fi
  fi
  GH_TOKEN="${GH_TOKEN:-$(gh auth token)}" bash "${EPIC_CHECK_FETCH_SCRIPT:-scripts/fetch-portal-docs.sh}" "$1" "$2" "$3"
}

echo "==> Epic design-system check <=="
# psrw runs this hook in a fresh detached worktree with no installed deps. Some
# node_modules/.pnpm files are tracked in git, so the dir alone proves nothing:
# .modules.yaml is untracked and written only by a completed pnpm install.
if [[ ! -f "${EPIC_CHECK_NODE_MODULES:-node_modules}/.modules.yaml" ]]; then
  run_step "dependency install" pnpm install --frozen-lockfile --prefer-offline
fi
run_step "color lint" bash scripts/lint-colors.sh
run_step "parity check" node scripts/parity-check.mjs
run_step "design doc drift" node scripts/gen-design-md.mjs --check
run_step "type check" pnpm check
run_step "pnpm workspace tests" pnpm -r test
run_step "portal docs: cli-state-handler" fetch_docs montionugera/cli-state-handler cli-state-handler "${CLI_DOCS_TAG:-}"
run_step "portal docs: server-decorator" fetch_docs montionugera/node-server-decorator server-decorator "${DECORATOR_DOCS_TAG:-}"
run_step "Storybook Hub build" node apps/storybook-hub/build.js
if ! run_playwright_contracts; then
  echo "FAIL epic-check: Playwright quality contracts" >&2
  exit 1
fi

echo "PASS epic-check: color lint, parity, design doc drift, type check, workspace tests, hub build, and Playwright contracts."
