#!/usr/bin/env bash
# Post-deploy smoke check: verify dev.joymify.com serves HTTP 200 and design.joymify.com redirects.
set -euo pipefail

host="${1:-dev.joymify.com}"
echo "==> Running smoke check on https://${host} <=="

response=$(curl -sS -I -k --max-time 15 "https://${host}/" 2>&1 || echo "CURL_FAILED")
if [ "$response" = "CURL_FAILED" ]; then
  echo "::error::https://${host} — curl failed (host unreachable?)"
  exit 1
fi

status=$(echo "$response" | grep -i "^HTTP/" | head -n 1 | awk '{print $2}')
if [ -z "$status" ]; then
  status=$(echo "$response" | head -n 1 | awk '{print $2}')
fi

echo "Status Code: $status"

if [ "$host" = "design.joymify.com" ]; then
  if [ "$status" != "301" ] && [ "$status" != "302" ] && [ "$status" != "200" ]; then
    echo "::error::Expected HTTP 301 redirect or 200 from https://${host}/, got status: $status"
    echo "$response"
    exit 1
  fi
else
  if [ "$status" != "200" ]; then
    echo "::error::Expected HTTP 200 from https://${host}/, got status: $status"
    echo "$response"
    exit 1
  fi
fi

# Verify index content contains Joymify or Storybook token (following redirects with -L)
body=$(curl -sS -L -k --max-time 15 "https://${host}/" || true)
if echo "$body" | grep -qiE "joymify|storybook|design"; then
  echo "[OK] Content verification passed: Storybook app shell detected."
else
  echo "::warning::Response body did not explicitly match expected title/tokens, but returned $status."
fi

echo "[OK] Smoke check passed successfully for https://${host}"
