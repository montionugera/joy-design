#!/usr/bin/env node
// Builds the static brand assets (SVG + PNG) from the resolved --joy-brand-*
// token values in @montionugera/joy-tokens' dist/theme.css. Run: node build.js [--out <dir>]

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { markSvg, wordmarkSvg, ogCardSvg, heroBannerSvg } from './src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const PALETTE_KEYS = ['tile', 'mark', 'mark-on-tile', 'mark-contrast', 'ink', 'ink-on-tile'];

function toCamelCase(key) {
  return key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function isHexColor(value) {
  return value.length === 7 && value.startsWith('#') && /^[0-9a-f]+$/i.test(value.slice(1));
}

/**
 * Locates the installed @montionugera/joy-tokens package directory via Node's own
 * node_modules search order (require.resolve.paths), rather than a
 * hardcoded relative "../tokens" path. @montionugera/joy-tokens is declared as a
 * devDependency (workspace:*) precisely so this resolves through the
 * package manager/turbo's dependency graph instead of directory layout
 * assumptions; it also gives turbo's `^build` pipeline the edge it needs to
 * build tokens before brand.
 */
function resolveTokensDir() {
  const searchPaths = require.resolve.paths('@montionugera/joy-tokens') || [];
  for (const base of searchPaths) {
    const candidate = path.join(base, '@montionugera/joy-tokens');
    if (fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }
  }
  throw new Error('readPalette: could not resolve the @montionugera/joy-tokens package directory');
}

/**
 * Reads the FIRST (light, `:root`) declaration of each --joy-brand-* token
 * from @montionugera/joy-tokens' built theme.css, and returns a camelCased palette
 * object. Builds tokens first if dist/theme.css doesn't exist yet.
 */
export function readPalette() {
  const tokensDir = resolveTokensDir();
  const themePath = path.join(tokensDir, 'dist/theme.css');

  if (!fs.existsSync(themePath)) {
    execFileSync(process.execPath, [path.join(tokensDir, 'build.js')], { stdio: 'inherit' });
  }

  const css = fs.readFileSync(themePath, 'utf8');
  const rootMatch = css.match(/:root\s*\{([^}]+)\}/);
  if (!rootMatch) {
    throw new Error('readPalette: no :root block found in dist/theme.css');
  }
  const rootBody = rootMatch[1];

  const palette = {};
  for (const key of PALETTE_KEYS) {
    const varRe = new RegExp(`--joy-brand-${key}:\\s*([^;]+);`);
    const match = rootBody.match(varRe);
    if (!match) {
      throw new Error(`readPalette: --joy-brand-${key} not found in :root`);
    }
    const value = match[1].trim();
    if (!isHexColor(value)) {
      throw new Error(`readPalette: --joy-brand-${key} is not a #rrggbb value: ${value}`);
    }
    palette[toCamelCase(key)] = value.toLowerCase();
  }

  return palette;
}

function parseOutDir(argv) {
  const idx = argv.indexOf('--out');
  if (idx !== -1 && argv[idx + 1]) {
    return path.resolve(argv[idx + 1]);
  }
  return path.resolve(__dirname, 'assets');
}

async function main() {
  const outDir = parseOutDir(process.argv.slice(2));
  fs.mkdirSync(outDir, { recursive: true });

  const palette = readPalette();
  const write = (name, content) => fs.writeFileSync(path.join(outDir, name), content);

  const mark = markSvg({ palette });
  write('mark.svg', mark);
  write('favicon.svg', mark);
  write('mark-bare.svg', markSvg({ palette, tile: false }));
  write('wordmark-deep.svg', wordmarkSvg({ palette, tone: 'deep' }));
  write('wordmark-cream.svg', wordmarkSvg({ palette, tone: 'cream' }));
  const ogCard = ogCardSvg({ palette });
  write('og-card.svg', ogCard);
  write('hero-banner.svg', heroBannerSvg({ palette }));

  const { Resvg } = await import('@resvg/resvg-js');

  const favicon32 = new Resvg(mark, { fitTo: { mode: 'width', value: 32 } }).render().asPng();
  fs.writeFileSync(path.join(outDir, 'favicon-32.png'), favicon32);

  const appleTouchIcon = new Resvg(mark, { fitTo: { mode: 'width', value: 180 } }).render().asPng();
  fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), appleTouchIcon);

  const ogCardPng = new Resvg(ogCard, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  fs.writeFileSync(path.join(outDir, 'og-card.png'), ogCardPng);

  console.log('build: wrote brand assets to', outDir);
}

function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    return import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href;
  } catch {
    return false;
  }
}

if (isMainModule()) {
  await main();
}
