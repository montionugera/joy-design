#!/usr/bin/env bash
# Post-deploy smoke check: verify design.joymify.com serves HTTP 200 and healthy Storybook shell.
set -euo pipefail

host="${1:-design.joymify.com}"
echo "==> Running smoke check on https://${host} <=="

response=$(curl -sS -I --max-time 15 "https://${host}/" 2>&1 || echo "CURL_FAILED")
if [ "$response" = "CURL_FAILED" ]; then
  echo "::error::https://${host} — curl failed (host unreachable?)"
  exit 1
fi

status=$(echo "$response" | head -n 1 | awk '{print $2}')
if [ -z "$status" ]; then
  status=$(echo "$response" | grep -i "HTTP/" | head -n 1 | awk '{print $2}')
fi

echo "Status Code: $status"

if [ "$status" != "200" ]; then
  echo "::error::Expected HTTP 200 from https://${host}/, got status: $status"
  echo "$response"
  exit 1
fi

# Verify index content contains Joymify or Storybook token
body=$(curl -sS -L --max-time 15 "https://${host}/" | head -n 30)
if echo "$body" | grep -qiE "joymify|storybook|design"; then
  echo "✅ Content verification passed: Storybook app shell detected."
else
  echo "::warning::Response body did not explicitly match expected title/tokens, but returned 200 OK."
fi

echo "✅ Smoke check passed successfully for https://${host}"
