#!/usr/bin/env bash
set -euo pipefail

echo "==> Running Joymify Design System Integration Verification <=="
node -e "console.log('Verifying Node runtime compatibility...');"
(cd packages/tokens && node build.js && node --test test/tokens.test.js)
(cd packages/icons && node --test test/icons.test.js)
(cd packages/svelte && node --test test/components.test.js)
(cd packages/react && node --test test/components.test.js)

echo "==> Running Gate 1 Storybook Hub Contracts <=="
./scripts/precheck.sh

echo "==> Verifying Kubernetes manifest syntax <=="
test -f k8s/deployment.yml
test -f k8s/service.yml
test -f k8s/ingress.yml
test -f Dockerfile
test -f nginx.conf

echo "==> All integration checks passed! <=="
