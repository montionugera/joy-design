import manifestData from './manifest.json' with { type: 'json' };

export interface SfxManifestEntry {
  name: string;
  file: string;
  durationMs: number;
  source: 'Pixabay' | 'Mixkit' | 'ElevenLabs';
  licence: string;
  title: string;
}

export const MANIFEST: readonly SfxManifestEntry[] = manifestData as unknown as SfxManifestEntry[];

export const SFX_NAMES = [
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
] as const;

export type SfxName = (typeof SFX_NAMES)[number];

export interface SfxUrlOptions {
  baseUrl?: string;
}

export const DEFAULT_SFX_BASE_URL = '/audio/sfx/';

/**
 * Resolves the public audio asset URL for a given sound effect name.
 * Default resolves the packaged asset via new URL('../assets/<name>.mp3', import.meta.url).
 * Throws RangeError for any cue name not in SFX_NAMES.
 */
export function sfxUrl(name: SfxName, baseUrlOrOptions?: string | SfxUrlOptions): string {
  if (!SFX_NAMES.includes(name as (typeof SFX_NAMES)[number])) {
    throw new RangeError(`Unknown SFX cue: ${String(name)}`);
  }
  let base: string | undefined;
  if (typeof baseUrlOrOptions === 'string') {
    base = baseUrlOrOptions;
  } else if (baseUrlOrOptions && typeof baseUrlOrOptions.baseUrl === 'string') {
    base = baseUrlOrOptions.baseUrl;
  }
  if (base !== undefined) {
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    return `${cleanBase}${name}.mp3`;
  }
  return new URL(`../assets/${name}.mp3`, import.meta.url).href;
}

export interface SfxPlayerOptions {
  baseUrl?: string;
  enabled?: boolean;
  reducedMotion?: boolean;
  ctxFactory?: () => AudioContext | null;
}

export interface PlayOptions {
  gain?: number;
}

export interface SfxPlayer {
  play(name: SfxName, options?: PlayOptions): void;
  setEnabled(enabled: boolean): void;
  unlock(): void;
  readonly enabled: boolean;
  readonly reducedMotion: boolean;
}

function defaultAudioContextFactory(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null;
    const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
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
export function createSfxPlayer(
  options?: SfxPlayerOptions,
  ctxFactoryParam?: () => AudioContext | null
): SfxPlayer {
  let isEnabled = options?.enabled ?? true;
  const isReducedMotion = options?.reducedMotion ?? false;
  const baseUrl = options?.baseUrl;
  const factory = ctxFactoryParam ?? options?.ctxFactory ?? defaultAudioContextFactory;

  let audioCtx: AudioContext | null = null;
  let limiterNode: DynamicsCompressorNode | null = null;
  const audioBuffers = new Map<string, AudioBuffer>();
  const loadingPromises = new Map<string, Promise<AudioBuffer | null>>();

  function setupGraph(ctx: AudioContext) {
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

  function playBuffer(ctx: AudioContext, dest: AudioNode, buf: AudioBuffer, gainVal: number) {
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

  async function loadBuffer(ctx: AudioContext, name: string, url: string): Promise<AudioBuffer | null> {
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

  const player: SfxPlayer = {
    get enabled() {
      return isEnabled;
    },
    get reducedMotion() {
      return isReducedMotion;
    },
    setEnabled(enabled: boolean) {
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
    play(name: SfxName, playOptions?: PlayOptions) {
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
