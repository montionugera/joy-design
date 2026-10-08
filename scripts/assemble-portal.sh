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
mkdir -p "$HUB_DIST"

echo "==> Building Joy Design System Hub & Tokens..."
node "$REPO_ROOT/packages/tokens/build.js"
node "$REPO_ROOT/apps/storybook-hub/build.js"

# 1. Node Server Decorator (Astro Starlight)
DECORATOR_DIR="$WORKSPACE_ROOT/node-server-decorator"
if [ -d "$DECORATOR_DIR" ]; then
  echo "==> Found node-server-decorator repository at $DECORATOR_DIR"
  if [ -d "$DECORATOR_DIR/website/dist" ]; then
    echo "    Copying existing website/dist to $HUB_DIST/server-decorator..."
    rm -rf "$HUB_DIST/server-decorator"
    cp -r "$DECORATOR_DIR/website/dist" "$HUB_DIST/server-decorator"
  elif [ -f "$DECORATOR_DIR/website/package.json" ]; then
    echo "    Building node-server-decorator docs..."
    (cd "$DECORATOR_DIR" && pnpm run docs:build)
    rm -rf "$HUB_DIST/server-decorator"
    cp -r "$DECORATOR_DIR/website/dist" "$HUB_DIST/server-decorator"
  fi
else
  echo "    node-server-decorator repository not found at sibling path, creating stub index..."
  mkdir -p "$HUB_DIST/server-decorator"
  cat <<'EOF' > "$HUB_DIST/server-decorator/index.html"
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Node Server Decorator Documentation</title><meta http-equiv="refresh" content="0; url=https://github.com/montionugera/node-server-decorator"></head><body>Redirecting to GitHub...</body></html>
EOF
fi

# 2. CLI State Handler (Vite Docs)
CLI_DIR="$WORKSPACE_ROOT/cli-state-handler"
if [ -d "$CLI_DIR" ]; then
  echo "==> Found cli-state-handler repository at $CLI_DIR"
  if [ -d "$CLI_DIR/apps/docs/dist" ]; then
    echo "    Copying existing apps/docs/dist to $HUB_DIST/cli-state-handler..."
    rm -rf "$HUB_DIST/cli-state-handler"
    cp -r "$CLI_DIR/apps/docs/dist" "$HUB_DIST/cli-state-handler"
  elif [ -f "$CLI_DIR/apps/docs/package.json" ]; then
    echo "    Building cli-state-handler docs..."
    (cd "$CLI_DIR/apps/docs" && pnpm run build)
    rm -rf "$HUB_DIST/cli-state-handler"
    cp -r "$CLI_DIR/apps/docs/dist" "$HUB_DIST/cli-state-handler"
  fi
else
  echo "    cli-state-handler repository not found at sibling path, creating stub index..."
  mkdir -p "$HUB_DIST/cli-state-handler"
  cat <<'EOF' > "$HUB_DIST/cli-state-handler/index.html"
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>CLI State Handler Documentation</title><meta http-equiv="refresh" content="0; url=https://github.com/montionugera/cli-state-handler"></head><body>Redirecting to GitHub...</body></html>
EOF
fi

echo "==> Successfully assembled Unified Developer Portal distribution in $HUB_DIST"
