import test from 'node:test';
import assert from 'node:assert';
import { heroLattice, wordmarkLayout } from '../src/layout.js';
import { WORDMARK } from '../src/geometry.js';

// Fix round 1 (code-reviewer + typescript-reviewer Important #1): heroLattice and wordmarkLayout
// were extracted from render.js so the static assets and the @joymify/svelte / @joymify/react
// components can no longer drift apart. These tests pin the exact numbers the canonical asset
// build depends on (packages/brand/test/brand.test.js's drift test proves render.js still produces
// byte-identical output using these helpers).

test('F-043: heroLattice defaults match the canonical hero-banner.svg grid', () => {
  const lattice = heroLattice();
  assert.strictEqual(lattice.width, 1600);
  assert.strictEqual(lattice.height, 560);
  assert.strictEqual(lattice.cell, 64);
  assert.strictEqual(lattice.diamondScale, 2);
  assert.ok(lattice.diamonds.length > 0);
  for (const { x, y, opacity } of lattice.diamonds) {
    assert.ok(Number.isFinite(x) && Number.isFinite(y));
    assert.ok(opacity > 0 && opacity <= 0.35);
  }
});

test('F-043: heroLattice fades from 0 (exclusive) at fadeStart up to exactly maxOpacity at the right edge', () => {
  const { diamonds } = heroLattice();
  const maxOpacity = Math.max(...diamonds.map((d) => d.opacity));
  assert.strictEqual(maxOpacity, 0.35);
  // Every diamond sits strictly right of the 55% fade start (width 1600 * 0.55 = 880).
  for (const { x, y } of diamonds) {
    assert.ok(x + 32 > 880, `cell centre at (${x + 32}, ${y}) should be right of the fade start`);
  }
});

test('F-043: heroLattice is a pure function of its options (no shared/mutated state)', () => {
  const a = heroLattice({ width: 320, height: 128, cell: 32, maxOpacity: 0.5 });
  const b = heroLattice({ width: 320, height: 128, cell: 32, maxOpacity: 0.5 });
  assert.deepStrictEqual(a, b);
  assert.strictEqual(a.diamondScale, 1);
});

test('F-043: wordmarkLayout(height: 80, withMark: true) reproduces the canonical asset ratios (mark 48/80, margin/gap 16/80, glyph 40/80)', () => {
  const layout = wordmarkLayout({ height: 80, withMark: true });
  assert.strictEqual(layout.markSize, 48);
  assert.strictEqual(layout.markX, 16);
  assert.strictEqual(layout.markY, 16);
  assert.strictEqual(layout.markCenterY, 40);
  assert.strictEqual(layout.glyphX, 80); // markX(16) + markSize(48) + gap(16)

  const expectedScale = Math.round((40 / WORDMARK.baseline) * 100) / 100;
  assert.strictEqual(layout.glyphScale, expectedScale);
  assert.strictEqual(layout.width, layout.glyphWidth + 96);
});

test('F-043: wordmarkLayout(withMark: false) drops the mark and centres the glyph on the full height', () => {
  const withMark = wordmarkLayout({ height: 80, withMark: true });
  const withoutMark = wordmarkLayout({ height: 80, withMark: false });
  assert.strictEqual(withoutMark.markSize, 0);
  assert.strictEqual(withoutMark.markX, 0);
  assert.strictEqual(withoutMark.glyphX, 0);
  assert.strictEqual(withoutMark.markCenterY, 40); // still the full-height centre (80 / 2)
  // The glyph itself is still scaled to 0.5 of the lockup height either way.
  assert.strictEqual(withoutMark.glyphScale, withMark.glyphScale);
  assert.ok(withoutMark.width < withMark.width);
});

test('F-043: wordmarkLayout scales proportionally at other heights', () => {
  const layout = wordmarkLayout({ height: 32, withMark: true });
  assert.strictEqual(layout.markSize, Math.round(32 * 0.6 * 100) / 100);
  assert.strictEqual(layout.markX, Math.round(32 * 0.2 * 100) / 100);
});
