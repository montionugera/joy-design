import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const IDS = ['yoji', 'pico', 'luna', 'rex', 'mochi', 'zing', 'byte'];
const POSES = ['idle', 'cheer', 'thinking', 'try-again', 'sleepy'];
const assets = path.resolve('./assets');

test('70 WebP pictures: every character x pose x 1x/2x, right size, alpha kept', async () => {
  let total = 0;
  for (const id of IDS) {
    for (const pose of POSES) {
      for (const [px, suffix] of [[256, ''], [512, '@2x']]) {
        const file = path.join(assets, `${id}-${pose}${suffix}.webp`);
        assert.ok(fs.existsSync(file), `${file} exists`);
        const meta = await sharp(file).metadata();
        assert.strictEqual(meta.format, 'webp');
        assert.strictEqual(meta.width, px, `${id}-${pose}${suffix} width`);
        assert.strictEqual(meta.height, px);
        assert.strictEqual(meta.hasAlpha, true, `${id}-${pose}${suffix} keeps alpha`);
        total += fs.statSync(file).size;
      }
    }
  }
  assert.strictEqual(fs.readdirSync(assets).filter((f) => f.endsWith('.webp')).length, 70);
  assert.ok(total < 2 * 1024 * 1024, `all pictures together are ${total} bytes, spec estimate is under 2 MB`);
});

test('assets.js imports all 70 files statically (what Vite rewrites in SSR, client and dev)', () => {
  const source = fs.readFileSync(path.resolve('./src/assets.js'), 'utf8');
  const imports = source.match(/^import \w+ from '\.\.\/assets\/[a-z-]+(@2x)?\.webp';$/gm) ?? [];
  assert.strictEqual(imports.length, 70);
  assert.ok(!source.includes('import.meta.url'), 'no new URL in assets.js');
  assert.strictEqual((source.match(/^  '[a-z-]+(@2x)?': \w+,$/gm) ?? []).length, 70);
});

test('urls.js lists all 70 files as literal new URL(..., import.meta.url) calls', async () => {
  const source = fs.readFileSync(path.resolve('./src/urls.js'), 'utf8');
  const literals = source.match(/new URL\('\.\.\/assets\/[a-z-]+(@2x)?\.webp', import\.meta\.url\)\.href/g) ?? [];
  assert.strictEqual(literals.length, 70);
  const { URLS } = await import('../src/urls.js');
  assert.strictEqual(Object.keys(URLS).length, 70);
  for (const url of Object.values(URLS)) assert.ok(fs.existsSync(new URL(url)), `${url} exists`);
});
