import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { MARK, WORDMARK, TAGLINE, markSvg, ogCardSvg } from '../src/index.js';
import { readPalette } from '../build.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = ['mark.svg', 'mark-bare.svg', 'favicon.svg', 'favicon-32.png', 'apple-touch-icon.png',
  'wordmark-deep.svg', 'wordmark-cream.svg', 'og-card.svg', 'og-card.png', 'hero-banner.svg'];

test('F-043: geometry is non-empty path data', () => {
  for (const d of [MARK.outline, MARK.inner, WORDMARK.d, TAGLINE.d]) assert.match(d, /^M[\d.\s,MLHVCSQTAZmlhvcsqtaz-]+$/);
  assert.ok(WORDMARK.width > 0 && WORDMARK.height > 0);
});

test('F-043: every asset exists and committed SVGs match a fresh build', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'brand-'));
  execFileSync(process.execPath, [path.join(root, 'build.js'), '--out', tmp]);
  for (const f of ASSETS) {
    assert.ok(fs.existsSync(path.join(root, 'assets', f)), `${f} committed`);
    if (f.endsWith('.svg')) assert.strictEqual(fs.readFileSync(path.join(tmp, f), 'utf8'), fs.readFileSync(path.join(root, 'assets', f), 'utf8'), `${f} drift`);
  }
});

test('F-043: asset colours all trace to brand tokens; text is outlined', () => {
  const allowed = new Set(Object.values(readPalette()).map((h) => h.toLowerCase()));
  for (const f of ASSETS.filter((a) => a.endsWith('.svg'))) {
    const svg = fs.readFileSync(path.join(root, 'assets', f), 'utf8');
    for (const hex of svg.match(/#[0-9a-f]{6}\b/gi) ?? []) assert.ok(allowed.has(hex.toLowerCase()), `${f}: ${hex} not a brand token`);
    assert.ok(!/<text\b/.test(svg), `${f} has no <text>`);
    assert.match(svg, /<title>[^<]+<\/title>/, `${f} has a title`);
  }
});

test('F-043: PNG and card dimensions', () => {
  const dims = (f) => { const b = fs.readFileSync(path.join(root, 'assets', f)); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
  assert.deepStrictEqual(dims('favicon-32.png'), [32, 32]);
  assert.deepStrictEqual(dims('apple-touch-icon.png'), [180, 180]);
  assert.deepStrictEqual(dims('og-card.png'), [1200, 630]);
  assert.match(fs.readFileSync(path.join(root, 'assets/og-card.svg'), 'utf8'), /viewBox="0 0 1200 630"/);
});

test('F-043: markSvg honours tile flag and title', () => {
  const p = readPalette();
  assert.match(markSvg({ palette: p }), /<rect[^>]*rx="6"/);
  assert.ok(!/<rect/.test(markSvg({ palette: p, tile: false })));
  assert.match(ogCardSvg({ palette: p }), /<title>Joymify<\/title>/);
});
