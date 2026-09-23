import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.resolve(__dirname, '../../../scripts/parity-check.mjs');

test('Wave 3 parity-check script exports COMPONENTS with at least 60 entries', async () => {
  assert.ok(fs.existsSync(scriptPath), 'scripts/parity-check.mjs must exist');
  const mod = await import(pathToFileURL(scriptPath).href);
  assert.ok(Array.isArray(mod.COMPONENTS), 'COMPONENTS must be exported as an array');
  assert.ok(mod.COMPONENTS.length >= 60, 'COMPONENTS must contain at least 60 names (21 Wave 2 + 39 Wave 3)');
  assert.strictEqual(new Set(mod.COMPONENTS).size, mod.COMPONENTS.length, 'COMPONENTS must not contain duplicates');
});

test('Wave 3 parity-check script exports REF_FORWARDING with exactly 19 entries', async () => {
  const mod = await import(pathToFileURL(scriptPath).href);
  assert.ok(Array.isArray(mod.REF_FORWARDING), 'REF_FORWARDING must be exported as an array');
  assert.strictEqual(mod.REF_FORWARDING.length, 19, 'REF_FORWARDING must contain exactly 19 names');
  for (const name of ['Notification', 'Popconfirm']) {
    assert.ok(!mod.REF_FORWARDING.includes(name), `${name} already uses forwardRef and must not be listed`);
  }
  for (const name of mod.REF_FORWARDING) {
    assert.ok(mod.COMPONENTS.includes(name), `${name} in REF_FORWARDING must also be in COMPONENTS`);
  }
  assert.strictEqual(typeof mod.checkRefForwarding, 'function', 'checkRefForwarding must be exported');
});
