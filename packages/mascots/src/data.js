// Plain JS, no framework. The Svelte and React Mascot both read this file; the React build imports
// it through ../../src/data.js, so there is no copy under dist/.
// assetUrl() (new URL based) serves React and plain JS; Mascot.svelte reads ASSETS from assets.js instead (static imports).
import { URLS } from './urls.js';

export const POSES = Object.freeze(['idle', 'cheer', 'thinking', 'try-again', 'sleepy']);

const make = (id, name, personality) => Object.freeze({ id, name, personality: Object.freeze(personality), poses: POSES });

export const MASCOTS = Object.freeze([
  make('yoji', 'Yoji', ['kind', 'bright', 'positive']),
  make('pico', 'Pico', ['chill', 'honest', 'real']),
  make('luna', 'Luna', ['dreamy', 'creative', 'sensitive']),
  make('rex', 'Rex', ['confident', 'bold', 'unfiltered']),
  make('mochi', 'Mochi', ['sweet', 'caring', 'supportive']),
  make('zing', 'Zing', ['fun', 'party', 'chaos']),
  make('byte', 'Byte', ['smart', 'curious', 'solver']),
]);

export const DEFAULT_ID = 'yoji';
export const DEFAULT_POSE = 'idle';

export function assetUrl(id, pose, density = 1) {
  const key = `${id}-${pose}${density === 2 ? '@2x' : ''}`;
  const url = URLS[key];
  if (!url) throw new RangeError(`joy-mascots: no picture for ${key}`);
  return url;
}

const warned = new Set();
const devWarn = (message) => {
  if (import.meta.env?.DEV) console.warn(message);
};

export function resolveMascot(name, pose, warn = devWarn) {
  const once = (key, message) => {
    if (warned.has(key)) return;
    warned.add(key);
    warn(message);
  };
  let id = name ?? DEFAULT_ID;
  if (!MASCOTS.some((m) => m.id === id)) {
    once(`name:${id}`, `joy-mascots: unknown name "${id}", showing ${DEFAULT_ID}`);
    id = DEFAULT_ID;
  }
  let p = pose ?? DEFAULT_POSE;
  if (!POSES.includes(p)) {
    once(`pose:${p}`, `joy-mascots: unknown pose "${p}", showing ${DEFAULT_POSE}`);
    p = DEFAULT_POSE;
  }
  return { id, pose: p };
}

export function clampSize(size) {
  const n = Number(size);
  if (!Number.isFinite(n)) return 96;
  return Math.min(256, Math.max(1, Math.round(n)));
}

export function clampGlow(glow) {
  const n = Number(glow);
  if (!Number.isFinite(n)) return 0;
  return Math.min(5, Math.max(0, Math.round(n)));
}

export function initialOf(id) {
  return (MASCOTS.find((m) => m.id === id)?.name ?? 'Yoji').charAt(0);
}
