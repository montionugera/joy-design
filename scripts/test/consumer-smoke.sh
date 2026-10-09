#!/usr/bin/env bash
# Tarball test for the four published packages (spec I-077, Phase 2 part 3).
#
# Packs @montionugera/joy-tokens, joy-icons, joy-brand and joy-react exactly as `pnpm publish`
# would, installs the tarballs into a fresh Vite + React 19 app in a temporary folder outside
# this workspace, then type-checks, builds and renders that app. It is the only check that
# loads the built output: the unit tests load src/ through their helpers.
#
# Usage: scripts/test/consumer-smoke.sh   (from anywhere; needs network for the app's own deps)
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
packages=(tokens icons brand react)

fail() {
  echo "consumer-smoke: FAIL: $*" >&2
  exit 1
}

work="$(mktemp -d "${TMPDIR:-/tmp}/joy-consumer-smoke.XXXXXX")"
work="$(cd "$work" && pwd -P)"
trap 'rm -rf "$work"' EXIT

case "$work/" in
  "$repo_root"/*) fail "temporary folder $work is inside the repo" ;;
esac

# Paths every tarball may contain, as one anchored pattern per package (the `files` table).
allowed_pattern() {
  case "$1" in
    tokens | react) echo '^package/(package\.json|dist/.+)$' ;;
    icons) echo '^package/(package\.json|PROVENANCE\.md|dist/.+|src/index\.ts|src/index\.d\.ts|src/[^/]+\.svelte)$' ;;
    brand) echo '^package/(package\.json|PROVENANCE\.md|src/.+|assets/.+)$' ;;
  esac
}

# Paths every tarball must contain: each entry point named in that package's exports.
required_files() {
  case "$1" in
    tokens) echo "dist/theme.css dist/tailwind-theme.css dist/index.js dist/index.cjs dist/index.d.ts" ;;
    icons) echo "dist/react.js dist/react.d.ts dist/react/Check.js dist/react/Check.d.ts src/index.ts src/index.d.ts src/Check.svelte PROVENANCE.md" ;;
    brand) echo "src/index.js src/index.d.ts src/geometry.js src/render.js src/layout.js src/outlines.generated.js assets/mark.svg assets/favicon.svg PROVENANCE.md" ;;
    react) echo "dist/index.js dist/index.d.ts dist/Button.js dist/Button.d.ts dist/Tabs.js dist/BrandMark.js" ;;
  esac
}

tarball_of() {
  echo "$work/tarballs/$1"/*.tgz
}

echo "==> 1/7 Building joy-icons and joy-react"
(cd "$repo_root" && pnpm --filter @montionugera/joy-icons build)
(cd "$repo_root" && pnpm --filter @montionugera/joy-react build)

echo "==> 2/7 Packing the four packages"
for pkg in "${packages[@]}"; do
  mkdir -p "$work/tarballs/$pkg"
  (cd "$repo_root/packages/$pkg" && pnpm pack --pack-destination "$work/tarballs/$pkg" > /dev/null)
  [ -f "$(tarball_of "$pkg")" ] || fail "pnpm pack produced no single tarball for $pkg"
done

echo "==> 3/7 Checking tarball contents"
for pkg in "${packages[@]}"; do
  tgz="$(tarball_of "$pkg")"
  list="$work/tarballs/$pkg/files.txt"
  tar -tzf "$tgz" | sort > "$list"
  echo "--- $(basename "$tgz"): $(wc -l < "$list" | tr -d ' ') files"
  if grep -E '(^|/)(test|tests|__tests__)/|\.test\.|\.spec\.|\.stories\.' "$list"; then
    fail "$pkg tarball contains a test or story file (listed above)"
  fi
  if grep -Ev "$(allowed_pattern "$pkg")" "$list"; then
    fail "$pkg tarball contains a path outside its files allowlist (listed above)"
  fi
  for required in $(required_files "$pkg"); do
    grep -qx "package/$required" "$list" || fail "$pkg tarball is missing $required"
  done
  pkg_json="$work/tarballs/$pkg/package.json"
  tar -xOzf "$tgz" package/package.json > "$pkg_json"
  if grep -n 'workspace:' "$pkg_json"; then
    fail "$pkg tarball package.json still contains a workspace: range (listed above)"
  fi
done

echo "==> 4/7 Creating the consumer app in $work/app"
app="$work/app"
mkdir -p "$app/src"

TOKENS_TGZ="$(tarball_of tokens)" ICONS_TGZ="$(tarball_of icons)" BRAND_TGZ="$(tarball_of brand)" REACT_TGZ="$(tarball_of react)" \
  node -e '
const fs = require("node:fs");
const tarballs = {
  "@montionugera/joy-tokens": "file:" + process.env.TOKENS_TGZ,
  "@montionugera/joy-icons": "file:" + process.env.ICONS_TGZ,
  "@montionugera/joy-brand": "file:" + process.env.BRAND_TGZ,
  "@montionugera/joy-react": "file:" + process.env.REACT_TGZ,
};
const pkg = {
  name: "joy-consumer-smoke",
  private: true,
  version: "0.0.0",
  type: "module",
  dependencies: { ...tarballs, react: "^19.0.0", "react-dom": "^19.0.0" },
  devDependencies: {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    typescript: "^5.9.3",
    vite: "^7.0.0",
  },
  // joy-react depends on the other three by version; the overrides make those transitive
  // dependencies resolve to the local tarballs too, so nothing is fetched from the registry.
  pnpm: { overrides: tarballs, onlyBuiltDependencies: ["esbuild"] },
};
fs.writeFileSync(process.argv[1], JSON.stringify(pkg, null, 2) + "\n");
' "$app/package.json"

cat > "$app/index.html" << 'EOF'
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>joy consumer smoke</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

cat > "$app/vite.config.ts" << 'EOF'
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({ plugins: [react()] });
EOF

cat > "$app/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": false,
    "isolatedModules": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
EOF

cat > "$app/src/main.tsx" << 'EOF'
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@montionugera/joy-tokens/theme.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
EOF

cat > "$app/src/App.tsx" << 'EOF'
import { Button, Tabs, BrandMark, type ButtonProps, type TabItem, type BrandMarkProps } from '@montionugera/joy-react';
import { Check, type IconProps } from '@montionugera/joy-icons/react';
import { MARK } from '@montionugera/joy-brand';
import { tokens } from '@montionugera/joy-tokens';

const items: TabItem[] = [
  { key: 'overview', label: 'Overview', content: <p>Overview panel</p> },
  { key: 'usage', label: 'Usage', content: <p>Usage panel</p> },
];

// Guards against the published types degrading to `any`: if they did, these two assignments
// would compile, the expect-error comments would be unused, and the type-check would fail.
// @ts-expect-error variant is a closed union of five strings
export const badVariant: ButtonProps['variant'] = 'not-a-variant';
// @ts-expect-error size is number | string, never a boolean
export const badSize: IconProps['size'] = true;
// @ts-expect-error MARK viewBox is a string, never a number
export const badMark: typeof MARK.viewBox = 123;
// @ts-expect-error surface-canvas token is a string, never a number
export const badToken: typeof tokens['surface-canvas'] = 123;
// @ts-expect-error TabItem key is a string, never a number
export const badTabKey: TabItem['key'] = 123;
// @ts-expect-error BrandMark variant is 'tile' | 'bare'
export const badBrandMarkVariant: BrandMarkProps['variant'] = 'not-a-variant';

export function App() {
  return (
    <main style={{ backgroundColor: tokens['surface-canvas'] }}>
      <BrandMark size={32} variant="tile" title={`Joymify ${MARK.viewBox}`} />
      <Button variant="solid" size="md" iconStart={<Check size={16} />}>
        Save
      </Button>
      <Tabs items={items} />
    </main>
  );
}
EOF

cat > "$app/ssr-check.mjs" << 'EOF'
// Renders the same four pieces to a string under plain Node. A Vite build only compiles the
// components; this calls them, and it resolves every package through its published exports.
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createElement as h } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, Tabs, BrandMark } from '@montionugera/joy-react';
import { Check } from '@montionugera/joy-icons/react';
import { MARK } from '@montionugera/joy-brand';
import * as tokens from '@montionugera/joy-tokens';

const require = createRequire(import.meta.url);
const cjsTokens = require('@montionugera/joy-tokens');

const html = renderToStaticMarkup(
  h(
    'main',
    null,
    h(BrandMark, { size: 32, variant: 'tile', title: 'Joymify' }),
    h(Button, { variant: 'solid', size: 'md', iconStart: h(Check, { size: 16 }) }, 'Save'),
    h(Tabs, {
      items: [
        { key: 'overview', label: 'Overview', content: 'Overview panel' },
        { key: 'usage', label: 'Usage', content: 'Usage panel' },
      ],
    }),
  ),
);

const needles = [
  'joy-brand-mark',
  MARK.viewBox,
  'joy-button--solid',
  'joy-button__label',
  '<polyline points="20 6 9 17 4 12"',
  'joy-tabs-container',
  'role="tab"',
];
const missing = needles.filter((needle) => !html.includes(needle));
if (missing.length > 0) {
  console.error('ssr-check: rendered markup is missing:', missing);
  process.exit(1);
}

const themeCss = fs.readFileSync(fileURLToPath(import.meta.resolve('@montionugera/joy-tokens/theme.css')), 'utf8');
if (!themeCss.includes('--joy-surface-canvas')) {
  console.error('ssr-check: theme.css does not define --joy-surface-canvas');
  process.exit(1);
}
if (Object.keys(tokens).length === 0) {
  console.error('ssr-check: the joy-tokens JavaScript entry exports nothing');
  process.exit(1);
}
if (!cjsTokens || !cjsTokens.tokens || !cjsTokens.tokens['surface-canvas']) {
  console.error('ssr-check: the joy-tokens CommonJS entry failed to load tokens');
  process.exit(1);
}
console.log('ssr-check: rendered', html.length, 'characters of markup');
EOF

echo "==> 5/7 Installing the tarballs"
(cd "$app" && pnpm install --no-frozen-lockfile --ignore-workspace)

for pkg in "${packages[@]}"; do
  installed="$(cd "$app/node_modules/@montionugera/joy-$pkg" || fail "joy-$pkg not installed"; pwd -P)"
  case "$installed/" in
    "$work"/*) ;;
    *) fail "joy-$pkg resolves to $installed, which is outside the temporary folder" ;;
  esac
done
if grep -nF "$repo_root" "$app/package.json" "$app/pnpm-lock.yaml"; then
  fail "the consumer app has a path into this repo (listed above)"
fi
# A copy fetched from a registry would also sit inside $work, so the path check above cannot
# tell it from a tarball. The lockfile can: a registry resolution is keyed name@<version>,
# a tarball resolution is keyed name@file:<path>. This covers the three packages joy-react
# depends on, which are installed through the overrides and not as direct dependencies only.
if grep -nE "@montionugera/joy-(tokens|icons|brand|react)@[0-9]" "$app/pnpm-lock.yaml"; then
  fail "a joy package was resolved from a registry, not from its tarball (listed above)"
fi

echo "==> 6/7 Type-checking and building the consumer app"
(cd "$app" && pnpm exec tsc --noEmit -p tsconfig.json)
(cd "$app" && pnpm exec vite build)
[ -f "$app/dist/index.html" ] || fail "vite build produced no dist/index.html"
grep -rq -e '--joy-surface-canvas' "$app/dist/assets" || fail "the built CSS does not contain the joy-tokens theme"

echo "==> 7/7 Rendering Button, Tabs, the Check icon and BrandMark"
(cd "$app" && node ssr-check.mjs)

echo "consumer-smoke: PASS"
