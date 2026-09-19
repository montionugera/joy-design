#!/usr/bin/env bash
set -euo pipefail

echo "==> Running Joymify Design System Integration Verification <=="
node -e "console.log('Verifying Node runtime compatibility...');"
node packages/tokens/test/tokens.test.js
node packages/svelte/test/components.test.js
node packages/react/test/components.test.js
echo "==> All integration checks passed! <=="
