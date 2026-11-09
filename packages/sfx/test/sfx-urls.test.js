import test from 'node:test';
import assert from 'node:assert/strict';
import { SFX_NAMES, sfxUrl } from '../src/index.ts';

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

  await t.test('sfxUrl resolves default base URL', () => {
    assert.equal(sfxUrl('win'), '/audio/sfx/win.mp3');
    assert.equal(sfxUrl('draw'), '/audio/sfx/draw.mp3');
    assert.equal(sfxUrl('emote_gg'), '/audio/sfx/emote_gg.mp3');
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
