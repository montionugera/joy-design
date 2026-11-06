import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const provenance = fs.readFileSync(new URL('../PROVENANCE.md', import.meta.url), 'utf8');

test('GitHub Packages registry like the other packages, owner licence, version 0.1.0', () => {
  assert.strictEqual(pkg.name, '@montionugera/joy-mascots');
  assert.strictEqual(pkg.version, '0.1.0');
  assert.strictEqual(pkg.license, 'SEE LICENSE IN PROVENANCE.md');
  assert.strictEqual(pkg.publishConfig.registry, 'https://npm.pkg.github.com');
});

test('files ship the pictures, shared data and stylesheet; exports expose root, react, data, css', () => {
  for (const f of ['assets', 'dist', 'src/data.js', 'src/data.d.ts', 'src/urls.js', 'src/assets.js', 'src/assets.d.ts', 'src/mascot.css', 'src/*.svelte', 'PROVENANCE.md']) {
    assert.ok(pkg.files.includes(f), `files includes ${f}`);
  }
  assert.deepStrictEqual(Object.keys(pkg.exports).sort(), ['.', './data', './mascot.css', './react']);
});

test('PROVENANCE says the art is the owner\'s, all rights reserved, published publicly', () => {
  assert.match(provenance, /All rights reserved/);
  assert.match(provenance, /published publicly/i);
  assert.doesNotMatch(provenance, /private/i);
});

test('PROVENANCE names the owner, the ChatGPT redraw date and the Duolingo disclaimer', () => {
  assert.match(provenance, /owner/i);
  assert.match(provenance, /ChatGPT/);
  assert.match(provenance, /2026-11-05/);
  assert.match(provenance, /not Duolingo/i);
  assert.match(provenance, /Yoji, Pico, Luna, Rex, Mochi, Zing, Byte/);
});
