import { ASSETS } from './assets.js';
import type { MascotId, MascotPose } from './data.js';

export { default as Mascot } from './Mascot.svelte';
export { MASCOTS, POSES } from './data.js';
export type { MascotId, MascotPose, MascotInfo } from './data.js';

/** Picture URL for the Svelte entry. Built from the static imports in assets.js, so it is a real URL in
 *  Vite SSR, client and dev (the new URL(..., import.meta.url) form in urls.js is only rewritten client side). */
export function assetUrl(id: MascotId, pose: MascotPose, density: 1 | 2 = 1): string {
  const key = `${id}-${pose}${density === 2 ? '@2x' : ''}`;
  const url = ASSETS[key];
  if (!url) throw new RangeError(`joy-mascots: no picture for ${key}`);
  return url;
}
