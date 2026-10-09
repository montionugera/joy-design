import test from 'node:test';
import assert from 'node:assert';
import { heroLattice, wordmarkLayout } from '../src/layout.js';
import { WORDMARK } from '../src/geometry.js';

// Fix round 1 (code-reviewer + typescript-reviewer Important #1): heroLattice and wordmarkLayout
// were extracted from render.js so the static assets and the @montionugera/joy-svelte / @montionugera/joy-react
// components can no longer drift apart. These tests pin the exact numbers the canonical asset
// build depends on (packages/brand/test/brand.test.js's drift test proves render.js still produces
// byte-identical output using these helpers).
//
// Fix round 2 (controller-found regression): wordmarkLayout used to bake the asset's own outer
// whitespace (16px on an 80px lockup) into every caller, so <Wordmark height={32}> rendered a
// ~19px mark with padding instead of a mark filling the full 32px. The mark:gap:glyph ratio
// (48:16:40, i.e. gap = markSize/3 and glyph cap height = markSize*5/6) is canonical; the outer
// margin is asset-only and is now an explicit `padding` option the static asset opts into and
// components leave at 0.

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

test('F-043: wordmarkLayout(height: 80, padding: 16) reproduces the canonical asset numbers (mark 48/80, margin+gap 16, glyph 40)', () => {
  // padding: 16 = 0.2 * 80, exactly what render.js's wordmarkSvg passes for the static asset.
  const layout = wordmarkLayout({ height: 80, withMark: true, padding: 16 });
  assert.strictEqual(layout.markSize, 48);
  assert.strictEqual(layout.markX, 16);
  assert.strictEqual(layout.markY, 16);
  assert.strictEqual(layout.markCenterY, 40);
  assert.strictEqual(layout.glyphX, 80); // markX(16) + markSize(48) + gap(16)

  const expectedScale = Math.round((40 / WORDMARK.baseline) * 100) / 100;
  assert.strictEqual(layout.glyphScale, expectedScale);
  assert.strictEqual(layout.width, layout.glyphWidth + 96); // 16 (mark x) + 48 + 16 (gap) + 16 (right padding)
});

test('F-043: wordmarkLayout(padding: 0) fills the full height with the mark — no asset whitespace baked in', () => {
  // This is the regression the controller found: components pass padding: 0 and must get
  // markSize === height, not the asset's 0.6-of-height mark with margin around it.
  const layout = wordmarkLayout({ height: 48, withMark: true, padding: 0 });
  assert.strictEqual(layout.markSize, 48);
  assert.strictEqual(layout.markX, 0);
  assert.strictEqual(layout.markY, 0);
  // The 48:16:40 ratio (gap = markSize/3, glyph cap height = markSize*5/6) still holds, driven by
  // the mark size rather than a fraction of a padded lockup height.
  assert.strictEqual(layout.glyphX - layout.markSize, 16); // gap = 48/3 = 16
  const expectedScale = Math.round(((48 * 5) / 6 / WORDMARK.baseline) * 100) / 100; // glyph cap height 40
  assert.strictEqual(layout.glyphScale, expectedScale);

  // And at an arbitrary height, markSize still equals height exactly with no padding.
  assert.strictEqual(wordmarkLayout({ height: 32, padding: 0 }).markSize, 32);
});

test('F-043: wordmarkLayout(withMark: false) drops the mark and scales/centres the glyph on the full height', () => {
  const withMark = wordmarkLayout({ height: 80, withMark: true, padding: 0 });
  const withoutMark = wordmarkLayout({ height: 80, withMark: false });
  assert.strictEqual(withoutMark.markSize, 0);
  assert.strictEqual(withoutMark.markX, 0);
  assert.strictEqual(withoutMark.glyphX, 0);
  assert.strictEqual(withoutMark.markCenterY, 40); // the full-height centre (80 / 2)
  // Without a mark the glyph is scaled straight off the lockup height (still 5/6 of it), so it
  // matches the with-mark case here because with-mark also has padding: 0 (markSize === height).
  assert.strictEqual(withoutMark.glyphScale, withMark.glyphScale);
  assert.ok(withoutMark.width < withMark.width);
});

test('F-043: wordmarkLayout derives markSize from height and padding at any size', () => {
  const layout = wordmarkLayout({ height: 100, withMark: true, padding: 10 });
  assert.strictEqual(layout.markSize, 80); // 100 - 2*10
  assert.strictEqual(layout.markX, 10);
  assert.strictEqual(layout.markY, 10);
  assert.strictEqual(layout.glyphX - layout.markSize - layout.markX, Math.round((80 / 3) * 100) / 100); // gap
});

// Fix round 3 (controller-found regression in round 2): WORDMARK.baseline is the glyph's height
// ABOVE the baseline, not its full ink height — the outline has a descender, so the full ink
// height (WORDMARK.height) is taller. At padding 0 the glyph is scaled off `baseline`, so its ink
// can extend past the returned `height` on both edges. This test pins that the overflow stays
// small (under 0.1*H, both with and without a mark) and that the ink is still exactly centred on
// H/2, so any future drift in the ratio or the centring math is caught here rather than only by
// eyeballing a rendered component. (The components render this with `overflow: visible` — see
// Wordmark.svelte / Wordmark.tsx — rather than clip it.)
test('F-043: at padding 0 the glyph ink is centred on H/2 and its per-edge overflow stays under 0.1*H', () => {
  for (const withMark of [true, false]) {
    const layout = wordmarkLayout({ height: 32, withMark, padding: 0 });
    const inkTop = layout.glyphY - layout.glyphScale * WORDMARK.baseline;
    const inkBottom = layout.glyphY + layout.glyphScale * (WORDMARK.height - WORDMARK.baseline);
    const inkCenter = (inkTop + inkBottom) / 2;

    assert.ok(
      Math.abs(inkCenter - layout.height / 2) < 0.01,
      `withMark=${withMark}: ink centre ${inkCenter} should sit on H/2 (${layout.height / 2})`
    );

    const overflowTop = Math.max(0, -inkTop);
    const overflowBottom = Math.max(0, inkBottom - layout.height);
    assert.ok(overflowTop < 0.1 * layout.height, `withMark=${withMark}: top overflow ${overflowTop} should be < 0.1*H`);
    assert.ok(overflowBottom < 0.1 * layout.height, `withMark=${withMark}: bottom overflow ${overflowBottom} should be < 0.1*H`);
    // The overflow is real (this is what overflow: visible is for), not a false alarm from slack bounds.
    assert.ok(overflowTop > 0 && overflowBottom > 0, `withMark=${withMark}: expected measurable overflow on both edges`);
  }
});
