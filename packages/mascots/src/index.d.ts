import type { Component } from 'svelte';

export interface MascotProps {
  name?: string;
  pose?: string;
  size?: number;
  label?: string;
  glow?: number;
  eager?: boolean;
}

export const Mascot: Component<MascotProps>;
export { MASCOTS, POSES, assetUrl } from './data.js';
export type { MascotInfo } from './data.js';
