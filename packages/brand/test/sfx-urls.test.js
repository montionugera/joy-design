import test from 'node:test';
import assert from 'node:assert/strict';
import { SFX_NAMES, sfxUrl } from '../src/sfx/index.js';

test('sfxUrl and SFX_NAMES helper tests', async (t) => {
  await t.test('SFX_NAMES has exactly 51 unique names', () => {
    assert.equal(SFX_NAMES.length, 51);
    const unique = new Set(SFX_NAMES);
    assert.equal(unique.size, 51);
    assert.ok(unique.has('win'));
    assert.ok(unique.has('draw'));
    assert.ok(unique.has('loss'));
    assert.ok(unique.has('emote_heart'));
  });

  await t.test('sfxUrl resolves default packaged asset via new URL', () => {
    assert.equal(sfxUrl('win'), new URL('../assets/sfx/win.mp3', import.meta.url).href);
    assert.equal(sfxUrl('draw'), new URL('../assets/sfx/draw.mp3', import.meta.url).href);
    assert.equal(sfxUrl('emote_gg'), new URL('../assets/sfx/emote_gg.mp3', import.meta.url).href);
  });

  await t.test('sfxUrl throws RangeError for unknown cue names', () => {
    assert.throws(() => sfxUrl('unknownSound'), RangeError);
    assert.throws(() => sfxUrl(''), RangeError);
    assert.throws(() => sfxUrl(null), RangeError);
  });

  await t.test('sfxUrl supports custom baseUrl string', () => {
    assert.equal(sfxUrl('win', 'https://cdn.joymify.com/audio/sfx/'), 'https://cdn.joymify.com/audio/sfx/win.mp3');
    assert.equal(sfxUrl('win', 'https://cdn.joymify.com/audio/sfx'), 'https://cdn.joymify.com/audio/sfx/win.mp3');
  });

  await t.test('sfxUrl supports options object with baseUrl', () => {
    assert.equal(sfxUrl('win', { baseUrl: '/static/sfx/' }), '/static/sfx/win.mp3');
    assert.equal(sfxUrl('win', { baseUrl: '/static/sfx' }), '/static/sfx/win.mp3');
  });
});
