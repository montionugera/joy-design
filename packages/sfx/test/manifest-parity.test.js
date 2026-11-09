import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(__dirname, '../../..');
const assetsDir = path.join(pkgRoot, 'assets');
const manifestPath = path.join(pkgRoot, 'src', 'manifest.json');

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
const sourceDir = path.join(playJoymifyDir, 'web/public/audio/sfx');

test('SFX assets and manifest parity', async (t) => {
  await t.test('assets directory contains exactly 51 mp3 files', () => {
    const files = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.mp3'));
    assert.equal(files.length, 51, `Expected 51 mp3 files, found ${files.length}`);
  });

  await t.test('manifest.json exists and has 51 valid entries', () => {
    assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist');
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(raw);
    assert.ok(Array.isArray(manifest), 'manifest.json must be an array');
    assert.equal(manifest.length, 51, `Expected 51 entries in manifest, found ${manifest.length}`);

    const allowedSources = new Set(['Pixabay', 'Mixkit', 'ElevenLabs']);
    const names = new Set();
    const files = new Set();

    for (const entry of manifest) {
      assert.ok(typeof entry.name === 'string' && entry.name.length > 0, `Invalid name: ${entry.name}`);
      assert.ok(typeof entry.file === 'string' && entry.file.endsWith('.mp3'), `Invalid file: ${entry.file}`);
      assert.ok(typeof entry.durationMs === 'number' && entry.durationMs > 0, `durationMs must be > 0: ${entry.name}`);
      assert.ok(allowedSources.has(entry.source), `Unknown source: ${entry.source}`);
      assert.ok(typeof entry.licence === 'string' && entry.licence.length > 0, `Missing licence: ${entry.name}`);
      assert.ok(typeof entry.title === 'string' && entry.title.length > 0, `Missing title: ${entry.name}`);

      assert.ok(!names.has(entry.name), `Duplicate name: ${entry.name}`);
      assert.ok(!files.has(entry.file), `Duplicate file: ${entry.file}`);
      names.add(entry.name);
      files.add(entry.file);

      const filePath = path.join(assetsDir, entry.file);
      assert.ok(fs.existsSync(filePath), `Asset file missing from disk: ${entry.file}`);
    }
  });

  await t.test('all 51 files match play-joymify source sha256 checksums', (sub) => {
    if (!fs.existsSync(sourceDir)) {
      sub.skip(`Source dir ${sourceDir} not found`);
      return;
    }
    const files = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.mp3'));
    for (const file of files) {
      const srcFile = path.join(sourceDir, file);
      assert.ok(fs.existsSync(srcFile), `play-joymify source missing ${file}`);
      const hash1 = crypto.createHash('sha256').update(fs.readFileSync(srcFile)).digest('hex');
      const hash2 = crypto.createHash('sha256').update(fs.readFileSync(path.join(assetsDir, file))).digest('hex');
      assert.equal(hash1, hash2, `Hash mismatch for ${file}`);
    }
  });
});
