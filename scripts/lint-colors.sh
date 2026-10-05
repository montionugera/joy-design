#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "$0")/.." && pwd)
allowlist="$repo_root/scripts/lint-colors.allow"

usage() {
  echo "Usage: scripts/lint-colors.sh [--strict] [paths...]" >&2
}

# Every hit is a hard failure (Wave 6 made the whole tree strict). --strict is
# still accepted so older invocations keep working; it now requires paths.
if [[ ${1:-} == "--strict" ]]; then
  shift
  if [[ $# -eq 0 ]]; then
    usage
    exit 2
  fi
fi

if [[ $# -gt 0 ]]; then
  targets=("$@")
else
  targets=(
    "packages/svelte/src"
    "packages/react/src"
    "packages/icons/src"
    "apps/storybook-hub/build.js"
    "packages/tokens/build.js"
    "packages/brand/src"
    "packages/brand/build.js"
    "packages/flutter/lib"
  )
fi

web_pattern='#(?:[0-9a-fA-F]{3,8})\b|(?:rgba?|hsla?)\(|var\(--joy-[^,)]*,[[:space:]]*[^)]*\)'
dart_pattern='#(?:[0-9a-fA-F]{3,8})\b|Color\(0x[0-9a-fA-F]+\)|\bColors\.[a-zA-Z]+|\bCupertinoColors\.[a-zA-Z]+|\.withOpacity\(|\.withAlpha\(|\.withValues\('
allow_patterns=$(mktemp)
component_styles=$(mktemp)
file_list=$(mktemp)
raw_hits=$(mktemp)
filtered_hits=$(mktemp)
hit_counts=$(mktemp)
trap 'rm -f "$allow_patterns" "$component_styles" "$file_list" "$raw_hits" "$filtered_hits" "$hit_counts"' EXIT

if [[ -f $allowlist ]]; then
  sed -E '/^[[:space:]]*(#|$)/d' "$allowlist" > "$allow_patterns"
fi

list_files() {
  local target=$1
  if [[ -f $target ]]; then
    if [[ $target == *.g.dart ]]; then
      return 0
    fi
    printf '%s\n' "$target"
  elif [[ -d $target ]]; then
    rg --files "$target" -g '!node_modules/**' -g '!dist/**' -g '!*.g.dart'
  else
    echo "FAIL lint-colors: target not found: $target" >&2
    return 2
  fi
}

hard_failures=0

scan_target() {
  local target=$1
  local file count

  # Generated Dart files (e.g. joy_tokens.g.dart) define primitive tokens and are excluded.
  if [[ $target == *.g.dart ]]; then
    printf 'PASS %s: 0 violation(s)\n' "$target"
    return
  fi

  : > "$file_list"
  : > "$raw_hits"
  : > "$filtered_hits"
  : > "$hit_counts"
  list_files "$target" > "$file_list"

  # Token definitions outside componentStyles are the intentional source of
  # generated primitive literals. Phase B's contract applies to the CSS string.
  if [[ $target == "packages/tokens/build.js" ]]; then
    awk '
      /^const componentStyles = `$/ { inside = 1 }
      inside { print }
      inside && /^`;$/ { exit }
    ' "$target" > "$component_styles"
    rg -n -e "$web_pattern" "$component_styles" > "$raw_hits" || true
    if [[ -s $allow_patterns ]]; then
      grep -Evf "$allow_patterns" "$raw_hits" > "$filtered_hits" || true
    else
      cp "$raw_hits" "$filtered_hits"
    fi
    count=$(wc -l < "$filtered_hits" | tr -d ' ')
    if [[ $count -gt 0 ]]; then
      printf 'HIT %s:componentStyles: %s violation(s)\n' "$target" "$count"
      hard_failures=$((hard_failures + 1))
    else
      printf 'PASS %s:componentStyles: 0 violation(s)\n' "$target"
    fi
    return
  fi

  if [[ -d $target ]]; then
    rg --with-filename -n --no-messages -e "$web_pattern" "$target" -g '!node_modules/**' -g '!dist/**' -g '!*.dart' > "$raw_hits" || true
    rg --with-filename -n --no-messages -e "$dart_pattern" "$target" -g '!node_modules/**' -g '!dist/**' -g '*.dart' -g '!*.g.dart' >> "$raw_hits" || true
  elif [[ $target == *.dart ]]; then
    rg --with-filename -n --no-messages -e "$dart_pattern" "$target" > "$raw_hits" || true
  else
    rg --with-filename -n --no-messages -e "$web_pattern" "$target" > "$raw_hits" || true
  fi
  if [[ -s $allow_patterns ]]; then
    grep -Evf "$allow_patterns" "$raw_hits" > "$filtered_hits" || true
  else
    cp "$raw_hits" "$filtered_hits"
  fi
  awk '
    match($0, /:[0-9]+:/) { counts[substr($0, 1, RSTART - 1)]++ }
    END { for (file in counts) print file "\t" counts[file] }
  ' "$filtered_hits" > "$hit_counts"

  while IFS= read -r file; do
    [[ -n $file ]] || continue
    count=$(awk -F '\t' -v path="$file" '$1 == path { print $2 }' "$hit_counts")
    if [[ -n $count ]]; then
      printf 'HIT %s: %s violation(s)\n' "$file" "$count"
      hard_failures=$((hard_failures + 1))
    else
      printf 'PASS %s: 0 violation(s)\n' "$file"
    fi
  done < "$file_list"
}

for target in "${targets[@]}"; do
  scan_target "$target"
done

if [[ $hard_failures -gt 0 ]]; then
  echo "FAIL lint-colors: $hard_failures file(s) with color literals or Joy fallbacks." >&2
  exit 1
fi

echo "PASS lint-colors: 0 files with color literals or Joy fallbacks."
