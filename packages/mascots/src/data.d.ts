export interface MascotInfo {
  readonly id: string;
  readonly name: string;
  readonly personality: readonly [string, string, string];
  readonly poses: readonly string[];
}
export const POSES: readonly string[];
export const MASCOTS: readonly MascotInfo[];
export const DEFAULT_ID: 'yoji';
export const DEFAULT_POSE: 'idle';
export function assetUrl(id: string, pose: string, density?: 1 | 2): string;
export function resolveMascot(
  name: string | undefined,
  pose: string | undefined,
  warn?: (message: string) => void,
): { id: string; pose: string };
export function clampSize(size: unknown): number;
export function clampGlow(glow: unknown): number;
export function initialOf(id: string): string;
