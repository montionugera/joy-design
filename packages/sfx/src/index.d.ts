export interface SfxManifestEntry {
  name: string;
  file: string;
  durationMs: number;
  source: 'Pixabay' | 'Mixkit' | 'ElevenLabs';
  licence: string;
  title: string;
}

export declare const MANIFEST: readonly SfxManifestEntry[];

export declare const SFX_NAMES: readonly [
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
  'yourTurn'
];

export type SfxName = (typeof SFX_NAMES)[number];

export interface SfxUrlOptions {
  baseUrl?: string;
}

export declare const DEFAULT_SFX_BASE_URL = "/audio/sfx/";

export declare function sfxUrl(name: SfxName, baseUrlOrOptions?: string | SfxUrlOptions): string;

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

export declare function createSfxPlayer(
  options?: SfxPlayerOptions,
  ctxFactoryParam?: () => AudioContext | null
): SfxPlayer;
