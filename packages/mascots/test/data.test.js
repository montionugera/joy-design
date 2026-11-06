import test from 'node:test';
import assert from 'node:assert';
import { MASCOTS, POSES, DEFAULT_ID, DEFAULT_POSE, assetUrl, resolveMascot, clampSize, clampGlow, initialOf } from '../src/data.js';

test('seven characters in the owner order with names and three-word personalities', () => {
  assert.deepStrictEqual(MASCOTS.map((m) => m.id), ['yoji', 'pico', 'luna', 'rex', 'mochi', 'zing', 'byte']);
  assert.deepStrictEqual(MASCOTS.map((m) => m.name), ['Yoji', 'Pico', 'Luna', 'Rex', 'Mochi', 'Zing', 'Byte']);
  assert.deepStrictEqual(MASCOTS.find((m) => m.id === 'yoji').personality, ['kind', 'bright', 'positive']);
  assert.deepStrictEqual(MASCOTS.find((m) => m.id === 'pico').personality, ['chill', 'honest', 'real']);
  assert.deepStrictEqual(MASCOTS.find((m) => m.id === 'luna').personality, ['dreamy', 'creative', 'sensitive']);
  assert.deepStrictEqual(MASCOTS.find((m) => m.id === 'rex').personality, ['confident', 'bold', 'unfiltered']);
  assert.deepStrictEqual(MASCOTS.find((m) => m.id === 'mochi').personality, ['sweet', 'caring', 'supportive']);
  assert.deepStrictEqual(MASCOTS.find((m) => m.id === 'zing').personality, ['fun', 'party', 'chaos']);
  assert.deepStrictEqual(MASCOTS.find((m) => m.id === 'byte').personality, ['smart', 'curious', 'solver']);
  assert.deepStrictEqual([...POSES], ['idle', 'cheer', 'thinking', 'try-again', 'sleepy']);
  for (const m of MASCOTS) assert.deepStrictEqual([...m.poses], [...POSES]);
});

test('assetUrl returns the 1x and 2x file for every pair and throws for an unknown one', () => {
  for (const m of MASCOTS) {
    for (const pose of POSES) {
      assert.ok(assetUrl(m.id, pose).endsWith(`/assets/${m.id}-${pose}.webp`));
      assert.ok(assetUrl(m.id, pose, 2).endsWith(`/assets/${m.id}-${pose}@2x.webp`));
    }
  }
  assert.throws(() => assetUrl('nope', 'idle'), RangeError);
});

test('unknown name or pose falls back to yoji / idle and warns once per bad value', () => {
  const seen = [];
  const warn = (m) => seen.push(m);
  assert.deepStrictEqual(resolveMascot('rex', 'cheer', warn), { id: 'rex', pose: 'cheer' });
  assert.deepStrictEqual(resolveMascot('dragon', 'cheer', warn), { id: DEFAULT_ID, pose: 'cheer' });
  assert.deepStrictEqual(resolveMascot('dragon', 'cheer', warn), { id: DEFAULT_ID, pose: 'cheer' });
  assert.deepStrictEqual(resolveMascot('luna', 'flying', warn), { id: 'luna', pose: DEFAULT_POSE });
  assert.deepStrictEqual(resolveMascot(undefined, undefined, warn), { id: 'yoji', pose: 'idle' });
  assert.strictEqual(seen.length, 2, 'one warning for dragon, one for flying');
});

test('size is clamped to 1..256 with 96 for junk, glow to 0..5', () => {
  assert.strictEqual(clampSize(96), 96);
  assert.strictEqual(clampSize(999), 256);
  assert.strictEqual(clampSize(0), 1);
  assert.strictEqual(clampSize(Number.NaN), 96);
  assert.strictEqual(clampSize('64'), 64);
  assert.strictEqual(clampGlow(9), 5);
  assert.strictEqual(clampGlow(-2), 0);
  assert.strictEqual(clampGlow(2.6), 3);
  assert.strictEqual(clampGlow(undefined), 0);
});

test('the fallback letter is the first letter of the name', () => {
  assert.strictEqual(initialOf('mochi'), 'M');
  assert.strictEqual(initialOf('missing'), 'Y');
});
