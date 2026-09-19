#!/usr/bin/env bash
set -euo pipefail

echo "==> Running Joymify Design System Integration Verification <=="
node -e "console.log('Verifying Node runtime compatibility...');"
(cd packages/tokens && node build.js && node --test test/tokens.test.js)
(cd packages/svelte && node --test test/components.test.js)
(cd packages/react && node --test test/components.test.js)
echo "==> All integration checks passed! <=="
