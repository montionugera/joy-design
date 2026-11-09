#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(__dirname, '../../..');
const assetsDir = path.join(pkgRoot, 'assets');
const srcDir = path.join(pkgRoot, 'src');
const manifestJsonPath = path.join(srcDir, 'manifest.json');
const manifestDtsPath = path.join(srcDir, 'manifest.d.ts');

function resolvePlayJoymifyDir() {
  if (process.env.PLAY_JOYMIFY_DIR) return process.env.PLAY_JOYMIFY_DIR;
  const primary = path.resolve(repoRoot, '../../../play-joymify');
  if (fs.existsSync(primary)) return primary;
  for (const candidate of [
    path.resolve(repoRoot, '../../../../play-joymify'),
    path.resolve(repoRoot, '../play-joymify'),
  ]) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return primary;
}

const playJoymifyDir = resolvePlayJoymifyDir();
const audioReadmePath = path.join(playJoymifyDir, 'web/art/audio/README.md');

// Static metadata fallback in case the external repo is absent
const KNOWN_METADATA = {
  bombBlast: { source: 'Pixabay', licence: 'Pixabay Content License', title: 'Animated Cartoon Explosion Impact' },
  dawnBreak: { source: 'Pixabay', licence: 'Pixabay Content License', title: 'Chime sound' },
  diceRoll: { source: 'Pixabay', licence: 'Pixabay Content License', title: 'rolling dice 2' },
  draw: { source: 'Pixabay', licence: 'Pixabay Content License', title: 'flipCard' },
  emotePop: { source: 'Pixabay', licence: 'Pixabay Content License', title: 'Bubble Pop 06' },
  join: { source: 'Mixkit', licence: 'Mixkit Sound Effects Free License', title: 'Kids cartoon close bells' },
  kaijuDiceRoll3D: { source: 'Pixabay', licence: 'Pixabay Content License', title: 'rolling dice 2' },
  kaijuLaserBlast: { source: 'Mixkit', licence: 'Mixkit Sound Effects Free License', title: 'Sci-fi battle laser shots' },
  kaijuRoar: { source: 'Mixkit', licence: 'Mixkit Sound Effects Free License', title: 'Giant monster roar' },
  kaijuShopBuy: { source: 'Pixabay', licence: 'Pixabay Content License', title: 'Power Up 01A' },
  laserHit: { source: 'Mixkit', licence: 'Mixkit Sound Effects Free License', title: 'Laser weapon shot' },
  loss: { source: 'Mixkit', licence: 'Mixkit Sound Effects Free License', title: 'Losing drums' },
  powerBurst: { source: 'Mixkit', licence: 'Mixkit Sound Effects Free License', title: 'Sci fi plasma gun power up' },
  shieldBlock: { source: 'Pixabay', licence: 'Pixabay Content License', title: 'Shield Block Shortsword' },
  unlockChime: { source: 'Pixabay', licence: 'Pixabay Content License', title: 'Achievement Unlocked' },
  voteLock: { source: 'Mixkit', licence: 'Mixkit Sound Effects Free License', title: 'Gaming lock' },
  warn: { source: 'Pixabay', licence: 'Pixabay Content License', title: 'Warning Notification' },
  win: { source: 'Mixkit', licence: 'Mixkit Sound Effects Free License', title: 'Video game win' },
  wireCut: { source: 'Pixabay', licence: 'Pixabay Content License', title: 'Scissors Snip 1' },
  wwDawnChime: { source: 'Pixabay', licence: 'Pixabay Content License', title: 'Single Church Bell 2' },
  wwExecutionDrum: { source: 'Mixkit', licence: 'Mixkit Sound Effects Free License', title: 'Cinematic mystery trailer drum hit' },
  wwWolfHowl: { source: 'Mixkit', licence: 'Mixkit Sound Effects Free License', title: 'Lone wolf howling' },
  yieldAlert: { source: 'Mixkit', licence: 'Mixkit Sound Effects Free License', title: 'Digital quick tone' },
  yourTurn: { source: 'Pixabay', licence: 'Pixabay Content License', title: 'New Notification - 3' },
};

const ELEVEN_LABS_GAME_CUES = new Set([
  'buyPower',
  'damageHit',
  'gameEnd',
  'nightFall',
  'reveal',
  'roar',
  'wwNightWind',
]);

function parseAudioReadme(readmePath) {
  if (!fs.existsSync(readmePath)) return {};
  const content = fs.readFileSync(readmePath, 'utf8');
  const metadata = {};
  const lines = content.split('\n');
  let inTable = false;

  for (const line of lines) {
    if (line.includes('| Cue | Source | Clip title |')) {
      inTable = true;
      continue;
    }
    if (inTable) {
      if (!line.startsWith('|')) {
        inTable = false;
        continue;
      }
      if (line.includes('|---|')) continue;
      const parts = line.split('|').map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 3) {
        const [cue, source, clipTitle] = parts;
        let licence = 'Unknown';
        if (source === 'Pixabay') licence = 'Pixabay Content License';
        else if (source === 'Mixkit') licence = 'Mixkit Sound Effects Free License';
        metadata[cue] = {
          source,
          licence,
          title: clipTitle,
        };
      }
    }
  }

  return metadata;
}

function getDurationMs(filePath) {
  try {
    const stdout = execFileSync('ffprobe', [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath,
    ], { encoding: 'utf8' }).trim();

    const sec = parseFloat(stdout);
    if (!Number.isFinite(sec) || sec <= 0) {
      throw new Error(`Invalid duration ${stdout} for ${filePath}`);
    }
    return Math.round(sec * 1000);
  } catch (err) {
    // If ffprobe fails, check if we have existing manifest duration
    if (fs.existsSync(manifestJsonPath)) {
      try {
        const existing = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));
        const fileName = path.basename(filePath);
        const match = existing.find((e) => e.file === fileName);
        if (match && match.durationMs > 0) return match.durationMs;
      } catch {}
    }
    throw err;
  }
}

function build() {
  if (!fs.existsSync(assetsDir)) {
    throw new Error(`Assets dir ${assetsDir} not found`);
  }
  fs.mkdirSync(srcDir, { recursive: true });

  const readmeMeta = parseAudioReadme(audioReadmePath);
  const files = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.mp3')).sort();

  const manifest = [];

  for (const file of files) {
    const name = file.replace(/\.mp3$/, '');
    const filePath = path.join(assetsDir, file);
    const durationMs = getDurationMs(filePath);

    let source = 'ElevenLabs';
    let licence = 'ElevenLabs (commercial terms follow-up)';
    let title = 'ElevenLabs Sound Effects take #1';

    if (readmeMeta[name]) {
      source = readmeMeta[name].source;
      licence = readmeMeta[name].licence;
      title = readmeMeta[name].title;
    } else if (KNOWN_METADATA[name]) {
      source = KNOWN_METADATA[name].source;
      licence = KNOWN_METADATA[name].licence;
      title = KNOWN_METADATA[name].title;
    } else if (ELEVEN_LABS_GAME_CUES.has(name) || name.startsWith('emote_')) {
      source = 'ElevenLabs';
      licence = 'ElevenLabs (commercial terms follow-up)';
      title = 'ElevenLabs Sound Effects take #1';
    }

    manifest.push({
      name,
      file,
      durationMs,
      source,
      licence,
      title,
    });
  }

  manifest.sort((a, b) => a.name.localeCompare(b.name));

  fs.writeFileSync(manifestJsonPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Wrote ${manifest.length} entries to ${manifestJsonPath}`);

  const dts = `// Generated by scripts/build-manifest.mjs. Do not edit by hand.

export interface SfxManifestEntry {
  name: string;
  file: string;
  durationMs: number;
  source: 'Pixabay' | 'Mixkit' | 'ElevenLabs';
  licence: string;
  title: string;
}

declare const manifest: SfxManifestEntry[];
export default manifest;
`;
  fs.writeFileSync(manifestDtsPath, dts);
  console.log(`Wrote ${manifestDtsPath}`);
}

build();
