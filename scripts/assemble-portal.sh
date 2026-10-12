#!/usr/bin/env bash
set -euo pipefail

# Assembles the 3 core libraries into apps/storybook-hub/dist for 1-pod unified deployment on dev.joymify.com
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Search up for the workspace directory containing sibling repos
WORKSPACE_ROOT=""
SEARCH_DIR="$REPO_ROOT"
for i in {1..6}; do
  if [ -d "$SEARCH_DIR/node-server-decorator" ] && [ -d "$SEARCH_DIR/cli-state-handler" ]; then
    WORKSPACE_ROOT="$SEARCH_DIR"
    break
  fi
  SEARCH_DIR="$(dirname "$SEARCH_DIR")"
done

if [ -z "$WORKSPACE_ROOT" ]; then
  WORKSPACE_ROOT="$(cd "$REPO_ROOT/../../.." && pwd)"
fi

HUB_DIST="$REPO_ROOT/apps/storybook-hub/dist"
PORTAL_BUNDLES="$REPO_ROOT/apps/storybook-hub/portal-bundles"
mkdir -p "$HUB_DIST"

echo "==> Building Joy Design System Hub & Tokens..."
node "$REPO_ROOT/packages/tokens/build.js"
node "$REPO_ROOT/apps/storybook-hub/build.js"

# place_docs <name> <sibling-built-dir> <fetch-repo>: sibling build first, then the downloaded bundle, else fail
# loudly (no stub, no stale copy).
place_docs() {
  local name="$1" sibling="$2" repo="$3"
  if [ -d "$sibling" ]; then
    echo "==> Found $name build at $sibling; copying to $HUB_DIST/$name..."
    rm -rf "$HUB_DIST/$name"
    cp -r "$sibling" "$HUB_DIST/$name"
  elif [ -d "$PORTAL_BUNDLES/$name" ]; then
    echo "==> Found fetched portal-bundles for $name..."
    rm -rf "$HUB_DIST/$name"
    cp -r "$PORTAL_BUNDLES/$name" "$HUB_DIST/$name"
  else
    echo "ERROR: no $name docs found (no sibling build, no downloaded bundle)." >&2
    echo "       Download them first: GH_TOKEN=\$(gh auth token) bash scripts/fetch-portal-docs.sh $repo $name" >&2
    exit 1
  fi
}

# 1. Node Server Decorator (Astro Starlight)
place_docs server-decorator "$WORKSPACE_ROOT/node-server-decorator/website/dist" montionugera/node-server-decorator
# 2. CLI State Handler (Vite Docs)
place_docs cli-state-handler "$WORKSPACE_ROOT/cli-state-handler/apps/docs/dist" montionugera/cli-state-handler

echo "==> Successfully assembled Unified Developer Portal distribution in $HUB_DIST"
