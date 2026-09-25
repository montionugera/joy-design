#!/usr/bin/env bash
set -euo pipefail

# Break caught: color literals or Joy variable fallbacks can enter source without
# making the strict color gate fail.
repo_root=$(cd "$(dirname "$0")/.." && pwd)
fixture_dir=$(mktemp -d)
trap 'rm -rf "$fixture_dir"' EXIT

literal_file="$fixture_dir/has-literal.css"
clean_file="$fixture_dir/is-tokenized.css"
fallback_file="$fixture_dir/has-fallback.css"

printf '%s\n' '.example { color: #abcdef; }' > "$literal_file"
printf '%s\n' '.example { color: var(--joy-text-primary); }' > "$clean_file"
printf '%s\n' '.example { color: var(--joy-text-primary, black); }' > "$fallback_file"

if "$repo_root/scripts/lint-colors.sh" --strict "$literal_file" >/dev/null 2>&1; then
  echo "expected strict mode to reject a hex literal" >&2
  exit 1
fi

if "$repo_root/scripts/lint-colors.sh" --strict "$fallback_file" >/dev/null 2>&1; then
  echo "expected strict mode to reject a Joy variable fallback" >&2
  exit 1
fi

"$repo_root/scripts/lint-colors.sh" --strict "$clean_file" >/dev/null

mkdir -p "$fixture_dir/packages/react/src"
cp "$literal_file" "$fixture_dir/packages/react/src/Button.tsx"
if (cd "$fixture_dir" && bash "$repo_root/scripts/lint-colors.sh" packages/react/src) >/dev/null 2>&1; then
  echo "expected default mode to reject a literal in a wave-2 strict file" >&2
  exit 1
fi

# Wave 3: display/feedback/navigation/overlay names and shared helpers are strict.
# Since Wave 6 every file is strict, including names no wave listed.
wave3_dir=$(mktemp -d)
trap 'rm -rf "$fixture_dir" "$wave3_dir"' EXIT
mkdir -p "$wave3_dir/packages/react/src" "$wave3_dir/packages/svelte/src/lib"
cp "$literal_file" "$wave3_dir/packages/react/src/Alert.tsx"
if (cd "$wave3_dir" && bash "$repo_root/scripts/lint-colors.sh" packages/react/src) >/dev/null 2>&1; then
  echo "expected default mode to reject a literal in a wave-3 strict file (react Alert.tsx)" >&2
  exit 1
fi
rm "$wave3_dir/packages/react/src/Alert.tsx"

cp "$literal_file" "$wave3_dir/packages/svelte/src/lib/Modal.svelte"
if (cd "$wave3_dir" && bash "$repo_root/scripts/lint-colors.sh" packages/svelte/src/lib) >/dev/null 2>&1; then
  echo "expected default mode to reject a literal in a wave-3 strict file (svelte Modal.svelte)" >&2
  exit 1
fi
rm "$wave3_dir/packages/svelte/src/lib/Modal.svelte"

cp "$literal_file" "$wave3_dir/packages/react/src/chart-core.ts"
if (cd "$wave3_dir" && bash "$repo_root/scripts/lint-colors.sh" packages/react/src) >/dev/null 2>&1; then
  echo "expected default mode to reject a literal in a wave-3 shared helper (chart-core.ts)" >&2
  exit 1
fi
rm "$wave3_dir/packages/react/src/chart-core.ts"

cp "$literal_file" "$wave3_dir/packages/react/src/Carousel.tsx"
if (cd "$wave3_dir" && bash "$repo_root/scripts/lint-colors.sh" packages/react/src) >/dev/null 2>&1; then
  echo "expected default mode to reject a literal in a file no wave listed (Carousel.tsx)" >&2
  exit 1
fi
rm "$wave3_dir/packages/react/src/Carousel.tsx"

# Wave 4: the 14 landing twins are strict too. Sample one hero, one svelte page and one
# matrix twin.
wave4_dir=$(mktemp -d)
trap 'rm -rf "$fixture_dir" "$wave3_dir" "$wave4_dir"' EXIT
mkdir -p "$wave4_dir/packages/react/src" "$wave4_dir/packages/svelte/src/lib"
cp "$literal_file" "$wave4_dir/packages/react/src/HeroSection.tsx"
if (cd "$wave4_dir" && bash "$repo_root/scripts/lint-colors.sh" packages/react/src) >/dev/null 2>&1; then
  echo "expected default mode to reject a literal in a wave-4 landing file (react HeroSection.tsx)" >&2
  exit 1
fi
rm "$wave4_dir/packages/react/src/HeroSection.tsx"

cp "$literal_file" "$wave4_dir/packages/svelte/src/lib/LandingPage.svelte"
if (cd "$wave4_dir" && bash "$repo_root/scripts/lint-colors.sh" packages/svelte/src/lib) >/dev/null 2>&1; then
  echo "expected default mode to reject a literal in a wave-4 landing file (svelte LandingPage.svelte)" >&2
  exit 1
fi
rm "$wave4_dir/packages/svelte/src/lib/LandingPage.svelte"

cp "$literal_file" "$wave4_dir/packages/react/src/PricingMatrix.tsx"
if (cd "$wave4_dir" && bash "$repo_root/scripts/lint-colors.sh" packages/react/src) >/dev/null 2>&1; then
  echo "expected default mode to reject a literal in a wave-4 landing file (react PricingMatrix.tsx)" >&2
  exit 1
fi
rm "$wave4_dir/packages/react/src/PricingMatrix.tsx"

# LandingAction is the internal helper both hero and CTA twins use (not exported), so it is strict in both extensions.
cp "$literal_file" "$wave4_dir/packages/react/src/LandingAction.tsx"
if (cd "$wave4_dir" && bash "$repo_root/scripts/lint-colors.sh" packages/react/src) >/dev/null 2>&1; then
  echo "expected default mode to reject a literal in a wave-4 landing helper (react LandingAction.tsx)" >&2
  exit 1
fi
rm "$wave4_dir/packages/react/src/LandingAction.tsx"

cp "$literal_file" "$wave4_dir/packages/svelte/src/lib/LandingAction.svelte"
if (cd "$wave4_dir" && bash "$repo_root/scripts/lint-colors.sh" packages/svelte/src/lib) >/dev/null 2>&1; then
  echo "expected default mode to reject a literal in a wave-4 landing helper (svelte LandingAction.svelte)" >&2
  exit 1
fi
rm "$wave4_dir/packages/svelte/src/lib/LandingAction.svelte"

# Wave 6: with no arguments the lint scans every package (icons included) and the hub,
# and any literal anywhere fails. Build a clean copy of the default targets, then add one literal.
wave6_dir=$(mktemp -d)
trap 'rm -rf "$fixture_dir" "$wave3_dir" "$wave4_dir" "$wave6_dir"' EXIT
mkdir -p "$wave6_dir/packages/svelte/src" "$wave6_dir/packages/react/src" "$wave6_dir/packages/icons/src" \
  "$wave6_dir/apps/storybook-hub" "$wave6_dir/packages/tokens"
cp "$clean_file" "$wave6_dir/packages/svelte/src/Clean.svelte"
cp "$clean_file" "$wave6_dir/packages/react/src/Clean.tsx"
cp "$clean_file" "$wave6_dir/packages/icons/src/Clean.svelte"
cp "$clean_file" "$wave6_dir/apps/storybook-hub/build.js"
printf '%s\n' 'const componentStyles = `' '.x { color: var(--joy-text-primary); }' '`;' > "$wave6_dir/packages/tokens/build.js"
(cd "$wave6_dir" && bash "$repo_root/scripts/lint-colors.sh") >/dev/null 2>&1 || {
  echo "expected default mode to pass on a clean copy of every default target" >&2
  exit 1
}
cp "$literal_file" "$wave6_dir/packages/icons/src/Bad.svelte"
if (cd "$wave6_dir" && bash "$repo_root/scripts/lint-colors.sh") >/dev/null 2>&1; then
  echo "expected default mode to scan packages/icons/src and reject a literal there" >&2
  exit 1
fi

echo "PASS scripts/test-lint-colors.sh"
