import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { relativeLuminance, contrastRatio, hexToRgb } from '../scripts/color.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('hexToRgb handles 3, 4, 6, and 8-digit hex formats', () => {
  assert.deepStrictEqual(hexToRgb('#fff'), [255, 255, 255]);
  assert.deepStrictEqual(hexToRgb('#14253e'), [20, 37, 62]);
  assert.deepStrictEqual(hexToRgb('#ffff'), [255, 255, 255]);
  assert.deepStrictEqual(hexToRgb('#14253eff'), [20, 37, 62]);
});

test('primitive ramps in tokens.json maintain exact anchors and strictly decreasing luminance', () => {
  const tokensPath = path.resolve(__dirname, '../src/tokens.json');
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

  // Anchor invariants
  assert.strictEqual(tokens.color.navy['500'].value, '#14253e', 'navy-500 anchor invariant must hold');
  assert.strictEqual(tokens.color.gold['400'].value, '#c49a3a', 'gold-400 anchor invariant must hold');
  assert.strictEqual(tokens.color.ink['500'].value, '#1f1c13', 'ink-500 anchor invariant must hold');
  assert.strictEqual(tokens.color.cream['100'].value, '#f8f3e8', 'cream-100 anchor invariant must hold');

  // Ramps with 50-950 scale
  const standardRamps = ['navy', 'gold', 'ink', 'neutral'];
  for (const rampName of standardRamps) {
    const ramp = tokens.color[rampName];
    assert.ok(ramp, `Ramp ${rampName} must exist`);
    let prevY = Infinity;
    for (const [step, token] of Object.entries(ramp)) {
      const y = relativeLuminance(token.value);
      assert.ok(
        y < prevY,
        `Ramp ${rampName} step ${step} (${token.value}, Y=${y}) must have strictly lower luminance than previous (prev Y=${prevY})`
      );
      prevY = y;
    }
  }

  // Cream ramp (50-300)
  let prevCreamY = Infinity;
  for (const [step, token] of Object.entries(tokens.color.cream)) {
    const y = relativeLuminance(token.value);
    assert.ok(
      y < prevCreamY,
      `Cream step ${step} (${token.value}, Y=${y}) must have strictly lower luminance than previous (prev Y=${prevCreamY})`
    );
    prevCreamY = y;
  }

  // Status ramps (100-900)
  for (const statusName of ['success', 'warning', 'danger', 'info']) {
    const ramp = tokens.color.status[statusName];
    assert.ok(ramp, `Status ramp ${statusName} must exist`);
    let prevStatusY = Infinity;
    for (const [step, token] of Object.entries(ramp)) {
      const y = relativeLuminance(token.value);
      assert.ok(
        y < prevStatusY,
        `Status ${statusName} step ${step} (${token.value}, Y=${y}) must have strictly lower luminance than previous (prev Y=${prevStatusY})`
      );
      prevStatusY = y;
    }
  }
});
