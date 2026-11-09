import test from 'node:test';
import assert from 'node:assert/strict';
import { createSfxPlayer } from '../src/index.ts';

// Mock Web Audio Context implementation
function createMockAudioContext() {
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
      const comp = {
        threshold: { value: 0 },
        knee: { value: 0 },
        ratio: { value: 1 },
        attack: { value: 0 },
        release: { value: 0 },
        connectedTo: null,
        disconnected: false,
        connect(dest) {
          this.connectedTo = dest;
        },
        disconnect() {
          this.disconnected = true;
          this.connectedTo = null;
        },
      };
      this.compressors.push(comp);
      return comp;
    },
    createGain() {
      const gain = {
        gain: { value: 1, setValueAtTime() {} },
        connectedTo: null,
        disconnected: false,
        connect(dest) {
          this.connectedTo = dest;
        },
        disconnect() {
          this.disconnected = true;
          this.connectedTo = null;
        },
      };
      this.gains.push(gain);
      return gain;
    },
    createBufferSource() {
      const src = {
        buffer: null,
        connectedTo: null,
        disconnected: false,
        onended: null,
        startedAt: null,
        connect(dest) {
          this.connectedTo = dest;
        },
        disconnect() {
          this.disconnected = true;
          this.connectedTo = null;
        },
        start(when) {
          this.startedAt = when;
        },
      };
      this.sources.push(src);
      return src;
    },
    decodeAudioData(buffer) {
      return Promise.resolve({ duration: 1.5, length: 1000 });
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
  const originalFetch = globalThis.fetch;
  t.beforeEach(() => {
    globalThis.fetch = async () => ({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(16),
    });
  });
  t.afterEach(() => {
    globalThis.fetch = originalFetch;
  });

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

  await t.test('honours enabled flag, routes audio graph through limiter, and onended disconnects nodes', async () => {
    const mockCtx = createMockAudioContext();
    const player = createSfxPlayer({
      enabled: false,
      ctxFactory: () => mockCtx,
    });

    player.unlock();
    player.play('win');
    await new Promise((r) => setTimeout(r, 15));
    assert.equal(mockCtx.sources.length, 0, 'No sound should play when enabled is false');

    player.setEnabled(true);
    assert.equal(player.enabled, true);

    player.play('win');
    await new Promise((r) => setTimeout(r, 15));
    assert.equal(mockCtx.sources.length, 1, 'Audio should play when enabled is true');

    const src = mockCtx.sources[0];
    const gain = mockCtx.gains[0];
    const limiter = mockCtx.compressors[0];

    // Assert graph: src -> gain -> limiter -> destination
    assert.ok(limiter, 'Limiter compressor must exist in graph');
    assert.equal(src.connectedTo, gain, 'src connects to gain node');
    assert.equal(gain.connectedTo, limiter, 'gain node connects to limiter');
    assert.equal(limiter.connectedTo, mockCtx.destination, 'limiter connects to destination');
    assert.equal(src.startedAt, 0, 'src was started at 0');

    // Assert onended disconnects src and its gainNode
    assert.equal(typeof src.onended, 'function', 'src must have an onended handler attached');
    assert.equal(src.disconnected, false, 'src is not disconnected while playing');
    assert.equal(gain.disconnected, false, 'gain is not disconnected while playing');

    src.onended();
    assert.equal(src.disconnected, true, 'src must be disconnected after ended');
    assert.equal(gain.disconnected, true, 'gainNode must be disconnected after ended');

    // Assert subsequent play uses cache and custom gain
    player.play('win', { gain: 0.75 });
    assert.equal(mockCtx.sources.length, 2, 'cached buffer plays immediately');
    const src2 = mockCtx.sources[1];
    const gain2 = mockCtx.gains[1];
    assert.equal(gain2.gain.value, 0.75, 'custom gain option applied');
    assert.equal(src2.connectedTo, gain2);
    assert.equal(gain2.connectedTo, limiter);
    src2.onended();
    assert.equal(src2.disconnected, true);
    assert.equal(gain2.disconnected, true);
  });

  await t.test('honours reducedMotion flag', async () => {
    const mockCtx = createMockAudioContext();
    const player = createSfxPlayer({
      reducedMotion: true,
      ctxFactory: () => mockCtx,
    });

    player.unlock();
    player.play('win');
    await new Promise((r) => setTimeout(r, 15));
    assert.equal(mockCtx.sources.length, 0, 'No sound should play when reducedMotion is true');
  });

  await t.test('limiter is present with -12 dB threshold connected to destination', () => {
    const mockCtx = createMockAudioContext();
    const player = createSfxPlayer({
      ctxFactory: () => mockCtx,
    });

    player.unlock();
    assert.equal(mockCtx.resumeCalled, true);
    assert.ok(mockCtx.compressors.length > 0, 'Compressor limiter must be created');
    const limiter = mockCtx.compressors[0];
    assert.equal(limiter.threshold.value, -12, 'Limiter threshold must be -12 dB');
    assert.equal(limiter.connectedTo, mockCtx.destination, 'Limiter must connect to ctx.destination');
  });
});
