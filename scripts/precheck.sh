#!/usr/bin/env bash
set -euo pipefail

export PLAYWRIGHT_PORT="${PLAYWRIGHT_PORT:-6116}"

echo "==> Gate 1: Deterministic Precheck <=="

echo "0. Linking workspace packages (pnpm install --frozen-lockfile)..."
# A merge can add a workspace package (e.g. packages/brand); without a fresh
# install its node_modules links are missing and its tests cannot resolve siblings.
pnpm install --frozen-lockfile --prefer-offline >/dev/null

echo "1. Validating Zero Emoji Policy in source files..."
# Ensure no OS emoji in codebase via Python UTF-32 regex
python3 -c "
import os, re, sys
pattern = re.compile(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F700-\U0001F77F\U0001F780-\U0001F7FF\U0001F800-\U0001F8FF\U0001F900-\U0001F9FF\U0001FA00-\U0001FA6F\U0001FA70-\U0001FAFF\U00002600-\U000026FF\U00002700-\U000027BF]')
violations = []
for root, dirs, files in os.walk('.'):
    # test-results/, playwright-report/, .turbo/, graft/ are gitignored build/cache output, not codebase files.
    if any(x in root for x in ['node_modules', '.git', 'dist', 'portal-bundles', '.claude', '.turbo', 'test-results', 'playwright-report', '.adal', '.gemini', '.cursor', '.kiro', '.windsurf', '.dart_tool', 'build', '.flutter-plugins', 'graft']): continue
    for f in files:
        if f in ['pnpm-lock.yaml', 'AGENTS.md'] or (f.endswith('.html') and 'docs' in root): continue
        p = os.path.join(root, f)
        try:
            with open(p, 'r', encoding='utf-8', errors='ignore') as fh:
                for idx, line in enumerate(fh, 1):
                    if pattern.search(line):
                        violations.append(f'{p}:{idx}: {line.strip()}')
        except Exception: pass
if violations:
    print('Error: Emoji detected in tracked codebase files:')
    for v in violations:
        print('  ' + v)
    sys.exit(1)
"
echo "   Zero emoji policy verified."

echo "2. Checking color-token integrity (strict: every package and the hub)..."
bash scripts/lint-colors.sh

echo "2a. Self-testing the gate scripts (lint-colors, epic-check)..."
bash scripts/test-lint-colors.sh
bash scripts/test-epic-check.sh
bash scripts/test-fetch-cli-docs.sh
bash scripts/test-smoke-cli-docs.sh

echo "2b. Type checking (pnpm check: tsc for React, svelte-check for Svelte)..."
pnpm check

echo "2c. Running workspace unit tests (includes the WCAG 2.2 AA contrast gate, packages/tokens/test/contrast.test.js)..."
pnpm -r test

echo "2d. Checking Svelte/React parity contract..."
node scripts/parity-check.mjs

echo "2e. Running script and docs-contract tests (scripts/test/*.test.mjs)..."
node --test 'scripts/test/*.test.mjs'

echo "2f. Checking DESIGN.md and README generated regions are up to date (scripts/gen-design-md.mjs --check)..."
node scripts/gen-design-md.mjs --check

echo "2g. Checking Flutter analyze and tests..."
if command -v flutter >/dev/null 2>&1; then
  (cd packages/flutter && flutter pub get && flutter analyze --fatal-infos && flutter test)
  (cd apps/flutter-hub && flutter pub get && flutter analyze --fatal-infos && flutter build web)
else
  if [ -n "$CI" ]; then
    echo "::error::Flutter SDK is required for Gate 1 verification but not found in PATH."
    exit 1
  else
    echo "   [warn] Flutter SDK not found in PATH; skipping Flutter gate on local machine."
  fi
fi

echo "3. Compiling Storybook Hub..."
node apps/storybook-hub/build.js

echo "4. Running Playwright Quality Contracts..."
if command -v playwright >/dev/null 2>&1; then
  (cd apps/storybook-hub && playwright test)
elif [ -f "node_modules/.bin/playwright" ]; then
  (cd apps/storybook-hub && ../../node_modules/.bin/playwright test)
elif [ -f "apps/storybook-hub/node_modules/.bin/playwright" ]; then
  (cd apps/storybook-hub && ./node_modules/.bin/playwright test)
elif command -v pnpm >/dev/null 2>&1 && pnpm --filter storybook-hub exec playwright --version >/dev/null 2>&1; then
  pnpm --filter storybook-hub exec playwright test
elif command -v pnpm >/dev/null 2>&1; then
  # Self-install playwright in worktree from global pnpm store if missing
  echo "   Installing @playwright/test in workspace..."
  pnpm add -D @playwright/test --filter storybook-hub --prefer-offline >/dev/null 2>&1 || true
  pnpm --filter storybook-hub exec playwright test
elif command -v npx >/dev/null 2>&1; then
  (cd apps/storybook-hub && npx playwright test)
fi

echo "==> Gate 1 Precheck passed successfully! <=="
