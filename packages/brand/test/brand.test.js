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
  try {
    execFileSync(process.execPath, [path.join(root, 'build.js'), '--out', tmp]);
    for (const f of ASSETS) {
      assert.ok(fs.existsSync(path.join(root, 'assets', f)), `${f} committed`);
      if (f.endsWith('.svg')) assert.strictEqual(fs.readFileSync(path.join(tmp, f), 'utf8'), fs.readFileSync(path.join(root, 'assets', f), 'utf8'), `${f} drift`);
    }
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
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

// --- Fix round 1 (code-reviewer I1, I2) ---------------------------------

// I2: nothing previously pinned the canonical mark geometry itself. Editing
// geometry.js and rebuilding would keep every other test green, because the
// drift test only compares build output against build output, and the
// "geometry is non-empty path data" test only checks path grammar. This
// locks the exact literal from the F-043 Global Constraints.
test('F-043: canonical mark geometry is pinned exactly', () => {
  assert.deepStrictEqual(MARK, {
    viewBox: '0 0 32 32',
    tileRx: 6,
    outline: 'M16 4 28 16 16 28 4 16Z',
    outlineWidth: 1.6,
    inner: 'M16 9 23 16 16 23 9 16Z',
    dot: { cx: 16, cy: 16, r: 1.6 }
  });
});

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// I1: "every hex is *some* brand palette value" does not catch a wrong
// colour ROLE (e.g. markGroup filling the tile with markOnTile, or
// wordmarkSvg swapping ink and mark) — that would still be "a brand token",
// just the wrong one. Assert the specific role each asset is documented to
// use, reading straight from the committed files.
test('F-043: asset colours match their documented role, not just any brand token', () => {
  const p = readPalette();
  const read = (f) => fs.readFileSync(path.join(root, 'assets', f), 'utf8');
  const outlineRe = new RegExp(`<path d="${escapeRegExp(MARK.outline)}" fill="none" stroke="(#[0-9a-f]{6})" stroke-width="1\\.6"/>`, 'i');
  const innerRe = new RegExp(`<path d="${escapeRegExp(MARK.inner)}" fill="(#[0-9a-f]{6})"/>`, 'i');

  // mark.svg / favicon.svg (tile:true, default): tile rect = palette.tile,
  // outline stroke + inner fill = palette.markOnTile, dot = palette.markContrast.
  for (const f of ['mark.svg', 'favicon.svg']) {
    const svg = read(f);
    assert.match(svg, new RegExp(`<rect width="32" height="32" rx="6" fill="${p.tile}"/>`), `${f} tile rect fill`);
    assert.strictEqual(svg.match(outlineRe)?.[1]?.toLowerCase(), p.markOnTile, `${f} outline stroke`);
    assert.strictEqual(svg.match(innerRe)?.[1]?.toLowerCase(), p.markOnTile, `${f} inner fill`);
    assert.match(svg, new RegExp(`<circle cx="16" cy="16" r="1\\.6" fill="${p.markContrast}"/>`), `${f} dot fill`);
  }

  // mark-bare.svg (tile:false): no rect, no dot; outline + inner = palette.mark.
  {
    const svg = read('mark-bare.svg');
    assert.ok(!/<rect/.test(svg), 'mark-bare.svg has no tile rect');
    assert.ok(!/<circle/.test(svg), 'mark-bare.svg omits the dot');
    assert.strictEqual(svg.match(outlineRe)?.[1]?.toLowerCase(), p.mark, 'mark-bare.svg outline stroke');
    assert.strictEqual(svg.match(innerRe)?.[1]?.toLowerCase(), p.mark, 'mark-bare.svg inner fill');
  }

  // wordmark-deep.svg: transparent background, glyph fill = palette.ink.
  {
    const svg = read('wordmark-deep.svg');
    assert.ok(!/<rect/.test(svg), 'wordmark-deep.svg has no background rect');
    assert.match(svg, new RegExp(`fill="${p.ink}"`), 'wordmark-deep.svg glyph fill');
    assert.ok(!svg.includes(`fill="${p.inkOnTile}"`), 'wordmark-deep.svg does not use inkOnTile');
  }

  // wordmark-cream.svg: full-bleed tile background, glyph fill = palette.inkOnTile.
  {
    const svg = read('wordmark-cream.svg');
    assert.match(svg, new RegExp(`<rect[^>]*fill="${p.tile}"/>`), 'wordmark-cream.svg background rect');
    assert.match(svg, new RegExp(`fill="${p.inkOnTile}"`), 'wordmark-cream.svg glyph fill');
  }

  // og-card.svg: full-card background = palette.tile.
  {
    const svg = read('og-card.svg');
    assert.match(svg, new RegExp(`<rect width="1200" height="630" fill="${p.tile}"/>`), 'og-card.svg background rect');
  }
});

// I1 (colour-format half): the previous "trace to brand tokens" test only
// scanned for 6-digit hex; rgb()/hsl()/named colours or a 3-digit hex would
// pass unnoticed. Every fill/stroke attribute must be either "none" or an
// exact 6-digit hex, and no colour function may appear anywhere.
test('F-043: no rgb()/hsl()/named colours or 3-digit hex leak into assets', () => {
  for (const f of ASSETS.filter((a) => a.endsWith('.svg'))) {
    const svg = fs.readFileSync(path.join(root, 'assets', f), 'utf8');
    assert.ok(!/\b(?:rgb|rgba|hsl|hsla)\(/i.test(svg), `${f}: rgb()/hsl() colour function found`);

    const threeDigitHex = svg.match(/#[0-9a-f]{3}(?![0-9a-f])/gi) ?? [];
    assert.deepStrictEqual(threeDigitHex, [], `${f}: 3-digit hex colour(s) found: ${threeDigitHex.join(', ')}`);

    for (const attr of svg.match(/\b(?:fill|stroke)="[^"]*"/g) ?? []) {
      const value = attr.slice(attr.indexOf('"') + 1, -1);
      assert.ok(
        value === 'none' || /^#[0-9a-f]{6}$/i.test(value),
        `${f}: ${attr} is neither "none" nor a 6-digit hex colour`
      );
    }
  }
});
