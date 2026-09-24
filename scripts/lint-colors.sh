#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "$0")/.." && pwd)
allowlist="$repo_root/scripts/lint-colors.allow"
strict=false

usage() {
  echo "Usage: scripts/lint-colors.sh [--strict <paths...>]" >&2
}

if [[ ${1:-} == "--strict" ]]; then
  strict=true
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
    "apps/storybook-hub/build.js"
    "packages/tokens/build.js"
  )
fi

# Files that are hard failures even in default mode. Waves flip their own files here;
# the directory-wide flip happens when the last file in a package is clean.
strict_file_pattern='^packages/(svelte/src/lib|react/src)/(Button|Input|InputNumber|Select|Checkbox|Switch|RadioGroup|Slider|Rate|Segmented|Form|FormItem|DatePicker|TimePicker|DateRangePicker|Mentions|Upload|TreeSelect|Cascader|Transfer|MarkdownEditor|Alert|Anchor|Avatar|AvatarGroup|Badge|Breadcrumb|Divider|Drawer|Dropdown|EmptyState|Flex|Image|ImagePreview|MarkdownViewer|Menu|Message|MetricTile|Modal|Notification|Pagination|Popconfirm|Progress|Result|Skeleton|Space|Spin|Splitter|StatCard|Statistic|Steps|Table|Tabs|Tag|Timeline|Toast|Tooltip|BarChart|LineChart|CandlestickChart|HeroSection|CTASection|PricingCard|PricingMatrix|FeatureCard|FeatureGrid|BentoCard|BentoGrid|LogoCloud|FAQSection|StatsSection|TestimonialCard|SiteFooter|LandingPage)\.(svelte|tsx)$|^packages/(svelte/src/lib|react/src)/(overlay-utils|useOverlay|chart-core|delta-utils|auto-dismiss|roving-utils|pagination-utils|splitter-utils|table-utils|dialog-hooks)\.ts$'

pattern='#(?:[0-9a-fA-F]{3,8})\b|(?:rgba?|hsla?)\(|var\(--joy-[^,)]*,[[:space:]]*[^)]*\)'
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
    printf '%s\n' "$target"
  elif [[ -d $target ]]; then
    rg --files "$target" -g '!node_modules/**' -g '!dist/**'
  else
    echo "FAIL lint-colors: target not found: $target" >&2
    return 2
  fi
}

hard_failures=0
warning_failures=0

scan_target() {
  local target=$1
  local file count

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
    rg -n -e "$pattern" "$component_styles" > "$raw_hits" || true
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
    rg --with-filename -n --no-messages -e "$pattern" "$target" -g '!node_modules/**' -g '!dist/**' > "$raw_hits" || true
  else
    rg --with-filename -n --no-messages -e "$pattern" "$target" > "$raw_hits" || true
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
      if $strict || [[ $file =~ $strict_file_pattern ]]; then
        printf 'HIT %s: %s violation(s)\n' "$file" "$count"
        hard_failures=$((hard_failures + 1))
      else
        printf 'WARN %s: %s violation(s)\n' "$file" "$count"
        warning_failures=$((warning_failures + 1))
      fi
    else
      printf 'PASS %s: 0 violation(s)\n' "$file"
    fi
  done < "$file_list"
}

for target in "${targets[@]}"; do
  scan_target "$target"
done

if [[ $hard_failures -gt 0 ]]; then
  echo "FAIL lint-colors: $hard_failures strict file(s) with color literals or Joy fallbacks; $warning_failures warning file(s)." >&2
  exit 1
fi

echo "PASS lint-colors: $warning_failures warning file(s); strict checks clean."
