import manifestData from './manifest.json' with { type: 'json' };

export const MANIFEST = Object.freeze(manifestData);

export const SFX_NAMES = Object.freeze([
  'bombBlast',
  'buyPower',
  'damageHit',
  'dawnBreak',
  'diceRoll',
  'draw',
  'emotePop',
  'emote_anger',
  'emote_bulb',
  'emote_clap',
  'emote_cockroach',
  'emote_cry',
  'emote_dots',
  'emote_exclamation',
  'emote_fire',
  'emote_gg',
  'emote_heart',
  'emote_laugh',
  'emote_music',
  'emote_paper',
  'emote_question',
  'emote_rock',
  'emote_scissors',
  'emote_shock',
  'emote_sleepy',
  'emote_sweat',
  'emote_thanks',
  'gameEnd',
  'join',
  'kaijuDiceRoll3D',
  'kaijuLaserBlast',
  'kaijuRoar',
  'kaijuShopBuy',
  'laserHit',
  'loss',
  'nightFall',
  'powerBurst',
  'reveal',
  'roar',
  'shieldBlock',
  'unlockChime',
  'voteLock',
  'warn',
  'win',
  'wireCut',
  'wwDawnChime',
  'wwExecutionDrum',
  'wwNightWind',
  'wwWolfHowl',
  'yieldAlert',
  'yourTurn',
]);

export const DEFAULT_SFX_BASE_URL = '/audio/sfx/';

/**
 * Resolves the public audio asset URL for a given sound effect name.
 * Default resolves the packaged asset via new URL('../../assets/sfx/<name>.mp3', import.meta.url).
 * Throws RangeError for any cue name not in SFX_NAMES.
 */
export function sfxUrl(name, baseUrlOrOptions) {
  if (!SFX_NAMES.includes(name)) {
    throw new RangeError(`Unknown SFX cue: ${String(name)}`);
  }
  let base;
  if (typeof baseUrlOrOptions === 'string') {
    base = baseUrlOrOptions;
  } else if (baseUrlOrOptions && typeof baseUrlOrOptions.baseUrl === 'string') {
    base = baseUrlOrOptions.baseUrl;
  }
  if (base !== undefined) {
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    return `${cleanBase}${name}.mp3`;
  }
  return new URL(`../../assets/sfx/${name}.mp3`, import.meta.url).href;
}

function defaultAudioContextFactory() {
  try {
    if (typeof window === 'undefined') return null;
    const w = window;
    const Ctor = w.AudioContext ?? w.webkitAudioContext;
    if (!Ctor) return null;
    return new Ctor();
  } catch {
    return null;
  }
}

/**
 * Creates a Web Audio player for Joymify sound effects with a -12 dB hard limiter.
 * Never throws when Web Audio is unavailable (e.g. in Node, SSR, or unsupported browsers).
 * Honours enabled and reducedMotion flags.
 */
export function createSfxPlayer(options, ctxFactoryParam) {
  let isEnabled = options?.enabled ?? true;
  const isReducedMotion = options?.reducedMotion ?? false;
  const baseUrl = options?.baseUrl;
  const factory = ctxFactoryParam ?? options?.ctxFactory ?? defaultAudioContextFactory;

  let audioCtx = null;
  let limiterNode = null;
  const audioBuffers = new Map();
  const loadingPromises = new Map();

  function setupGraph(ctx) {
    try {
      // Hard limiter at -12 dB ceiling
      const limiter = ctx.createDynamicsCompressor();
      limiter.threshold.value = -12;
      limiter.knee.value = 0;
      limiter.ratio.value = 20;
      limiter.attack.value = 0.002;
      limiter.release.value = 0.15;
      limiter.connect(ctx.destination);
      limiterNode = limiter;
    } catch {
      limiterNode = null;
    }
  }

  function playBuffer(ctx, dest, buf, gainVal) {
    try {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const gainNode = ctx.createGain();
      gainNode.gain.value = gainVal;
      src.connect(gainNode);
      gainNode.connect(dest);
      src.onended = () => {
        try {
          src.disconnect();
          gainNode.disconnect();
        } catch {}
      };
      src.start(0);
    } catch {
      // Audio playback failure must never throw or break calling app
    }
  }

  async function loadBuffer(ctx, name, url) {
    const existing = loadingPromises.get(name);
    if (existing) return existing;

    const promise = (async () => {
      try {
        if (typeof fetch !== 'function' || typeof ctx.decodeAudioData !== 'function') {
          return null;
        }
        const res = await fetch(url);
        if (!res.ok) return null;
        const arrayBuf = await res.arrayBuffer();
        const decoded = await ctx.decodeAudioData(arrayBuf);
        audioBuffers.set(name, decoded);
        return decoded;
      } catch {
        return null;
      } finally {
        loadingPromises.delete(name);
      }
    })();

    loadingPromises.set(name, promise);
    return promise;
  }

  const player = {
    get enabled() {
      return isEnabled;
    },
    get reducedMotion() {
      return isReducedMotion;
    },
    setEnabled(enabled) {
      isEnabled = Boolean(enabled);
    },
    unlock() {
      try {
        if (!audioCtx) {
          audioCtx = factory();
          if (audioCtx) {
            setupGraph(audioCtx);
          }
        }
        if (audioCtx && audioCtx.state === 'suspended' && typeof audioCtx.resume === 'function') {
          audioCtx.resume().catch(() => {});
        }
      } catch {
        // never throws
      }
    },
    play(name, playOptions) {
      if (!isEnabled || isReducedMotion) {
        return;
      }
      try {
        if (!audioCtx) {
          player.unlock();
        }
        if (!audioCtx || !limiterNode) {
          return;
        }
        const gainValue = playOptions?.gain ?? 1;
        const url = sfxUrl(name, baseUrl);

        const cached = audioBuffers.get(name);
        if (cached) {
          playBuffer(audioCtx, limiterNode, cached, gainValue);
          return;
        }

        void loadBuffer(audioCtx, name, url).then((buf) => {
          if (buf && isEnabled && !isReducedMotion && audioCtx && limiterNode) {
            playBuffer(audioCtx, limiterNode, buf, gainValue);
          }
        }).catch(() => {});
      } catch {
        // never throws
      }
    },
  };

  return player;
}
