import type { Component } from 'svelte';
import type { MascotId, MascotPose } from './data.js';

export interface MascotProps {
  name?: MascotId;
  pose?: MascotPose;
  size?: number;
  label?: string;
  glow?: number;
  eager?: boolean;
}

export const Mascot: Component<MascotProps>;
export { MASCOTS, POSES } from './data.js';
export type { MascotId, MascotPose, MascotInfo } from './data.js';
export function assetUrl(id: MascotId, pose: MascotPose, density?: 1 | 2): string;
