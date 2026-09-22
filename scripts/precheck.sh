#!/usr/bin/env bash
set -euo pipefail

echo "==> Gate 1: Deterministic Precheck <=="

echo "1. Validating Zero Emoji Policy in source files..."
# Ensure no OS emoji in codebase via Python UTF-32 regex
python3 -c "
import os, re, sys
pattern = re.compile(r'[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF\U0001F700-\U0001F77F\U0001F780-\U0001F7FF\U0001F800-\U0001F8FF\U0001F900-\U0001F9FF\U0001FA00-\U0001FA6F\U0001FA70-\U0001FAFF\U00002600-\U000026FF\U00002700-\U000027BF]')
violations = []
for root, dirs, files in os.walk('.'):
    if any(x in root for x in ['node_modules', '.git', 'dist', '.claude']): continue
    for f in files:
        if f in ['pnpm-lock.yaml', 'AGENTS.md']: continue
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

echo "2. Compiling Storybook Hub..."
node apps/storybook-hub/build.js

echo "3. Running Playwright Quality Contracts..."
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
