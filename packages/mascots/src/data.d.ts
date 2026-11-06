export type MascotId = 'yoji' | 'pico' | 'luna' | 'rex' | 'mochi' | 'zing' | 'byte';
export type MascotPose = 'idle' | 'cheer' | 'thinking' | 'try-again' | 'sleepy';

export interface MascotInfo {
  readonly id: MascotId;
  readonly name: string;
  readonly personality: readonly [string, string, string];
  readonly poses: readonly MascotPose[];
}
export const POSES: readonly MascotPose[];
export const MASCOTS: readonly MascotInfo[];
export const DEFAULT_ID: 'yoji';
export const DEFAULT_POSE: 'idle';
export function assetUrl(id: MascotId, pose: MascotPose, density?: 1 | 2): string;
export function resolveMascot(
  name: MascotId | undefined,
  pose: MascotPose | undefined,
  warn?: (message: string) => void,
): { id: MascotId; pose: MascotPose };
export function clampSize(size: unknown): number;
export function clampGlow(glow: unknown): number;
export function initialOf(id: MascotId): string;
