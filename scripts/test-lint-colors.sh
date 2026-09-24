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

# Wave 3: display/feedback/navigation/overlay names and shared helpers are strict too;
# a non-listed name in the same directory must stay a warning.
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
(cd "$wave3_dir" && bash "$repo_root/scripts/lint-colors.sh" packages/react/src) >/dev/null 2>&1 || {
  echo "expected default mode to only warn on a literal in a non-strict file (Carousel.tsx)" >&2
  exit 1
}
rm "$wave3_dir/packages/react/src/Carousel.tsx"

# Wave 4: the 14 landing twins are strict too. Sample one hero, one svelte page and one
# matrix twin; a non-listed name in the same directory must still only warn.
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

cp "$literal_file" "$wave4_dir/packages/react/src/Carousel.tsx"
(cd "$wave4_dir" && bash "$repo_root/scripts/lint-colors.sh" packages/react/src) >/dev/null 2>&1 || {
  echo "expected default mode to only warn on a literal in a non-strict file next to landing twins (Carousel.tsx)" >&2
  exit 1
}

echo "PASS scripts/test-lint-colors.sh"
