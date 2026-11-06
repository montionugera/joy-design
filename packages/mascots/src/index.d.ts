import type { Component } from 'svelte';
import type { MascotId, MascotPose, MascotProps } from './data.js';

export const Mascot: Component<MascotProps>;
export { MASCOTS, POSES } from './data.js';
export type { MascotId, MascotPose, MascotInfo, MascotProps } from './data.js';
export function assetUrl(id: MascotId, pose: MascotPose, density?: 1 | 2): string;
