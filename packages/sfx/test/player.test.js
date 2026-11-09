import test from 'node:test';
import assert from 'node:assert/strict';
import { createSfxPlayer } from '../src/index.ts';

// Mock Web Audio Context implementation
function createMockAudioContext() {
  const compressor = {
    threshold: { value: 0 },
    knee: { value: 0 },
    ratio: { value: 1 },
    attack: { value: 0 },
    release: { value: 0 },
    connect(dest) {
      this.connectedTo = dest;
    },
  };

  const destination = { id: 'destination' };

  const ctx = {
    state: 'suspended',
    currentTime: 0,
    destination,
    compressors: [],
    gains: [],
    sources: [],
    resumeCalled: false,
    createDynamicsCompressor() {
      const comp = { ...compressor, threshold: { value: 0 }, knee: { value: 0 }, ratio: { value: 1 } };
      this.compressors.push(comp);
      return comp;
    },
    createGain() {
      const gain = {
        gain: { value: 1, setValueAtTime() {} },
        connect(dest) {
          this.connectedTo = dest;
        },
      };
      this.gains.push(gain);
      return gain;
    },
    createBufferSource() {
      const src = {
        buffer: null,
        connect(dest) {
          this.connectedTo = dest;
        },
        start(when) {
          this.startedAt = when;
        },
      };
      this.sources.push(src);
      return src;
    },
    decodeAudioData(buffer) {
      return Promise.resolve({ duration: 1.5 });
    },
    resume() {
      this.resumeCalled = true;
      this.state = 'running';
      return Promise.resolve();
    },
  };

  return ctx;
}

test('createSfxPlayer tests', async (t) => {
  await t.test('null AudioContext factory never throws', () => {
    assert.doesNotThrow(() => {
      const player = createSfxPlayer({ ctxFactory: () => null });
      assert.ok(player);
      player.unlock();
      player.play('win');
      player.play('win', { gain: 0.5 });
      player.setEnabled(false);
      assert.equal(player.enabled, false);
      player.play('win');
      player.setEnabled(true);
      assert.equal(player.enabled, true);
    });
  });

  await t.test('default constructor in Node without window never throws', () => {
    assert.doesNotThrow(() => {
      const player = createSfxPlayer();
      assert.ok(player);
      player.unlock();
      player.play('win');
      player.setEnabled(false);
      player.setEnabled(true);
    });
  });

  await t.test('honours enabled flag', () => {
    let played = false;
    const mockCtx = createMockAudioContext();
    const player = createSfxPlayer({
      enabled: false,
      ctxFactory: () => mockCtx,
    });

    player.unlock();
    player.play('win');
    assert.equal(mockCtx.sources.length, 0, 'No sound should play when enabled is false');

    player.setEnabled(true);
    assert.equal(player.enabled, true);
  });

  await t.test('honours reducedMotion flag', () => {
    const mockCtx = createMockAudioContext();
    const player = createSfxPlayer({
      reducedMotion: true,
      ctxFactory: () => mockCtx,
    });

    player.unlock();
    player.play('win');
    assert.equal(mockCtx.sources.length, 0, 'No sound should play when reducedMotion is true');
  });

  await t.test('limiter is present with -12 dB threshold', () => {
    const mockCtx = createMockAudioContext();
    const player = createSfxPlayer({
      ctxFactory: () => mockCtx,
    });

    player.unlock();
    assert.equal(mockCtx.resumeCalled, true);
    assert.ok(mockCtx.compressors.length > 0, 'Compressor limiter must be created');
    const limiter = mockCtx.compressors[0];
    assert.equal(limiter.threshold.value, -12, 'Limiter threshold must be -12 dB');
  });
});
