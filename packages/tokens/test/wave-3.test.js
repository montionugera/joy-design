import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.resolve(__dirname, '../../../scripts/parity-check.mjs');
const mod = await import(pathToFileURL(scriptPath).href);

test('Wave 3 parity-check script exports COMPONENTS with at least 60 entries', () => {
  assert.ok(fs.existsSync(scriptPath), 'scripts/parity-check.mjs must exist');
  assert.ok(Array.isArray(mod.COMPONENTS), 'COMPONENTS must be exported as an array');
  assert.ok(mod.COMPONENTS.length >= 60, 'COMPONENTS must contain at least 60 names (21 Wave 2 + 39 Wave 3)');
  assert.strictEqual(new Set(mod.COMPONENTS).size, mod.COMPONENTS.length, 'COMPONENTS must not contain duplicates');
});

test('Wave 3 parity-check script exports REF_FORWARDING with exactly 19 entries', () => {
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

function withTempReactDir(files, fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'joy-ref-'));
  try {
    fs.mkdirSync(path.join(root, 'packages/react/src'), { recursive: true });
    for (const [name, src] of Object.entries(files)) {
      fs.writeFileSync(path.join(root, `packages/react/src/${name}.tsx`), src);
    }
    return fn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

const GOOD = `import React from 'react';
export const Alert = React.forwardRef<HTMLDivElement, P>(({ onClose, ...rest }, ref) => (
  <div ref={ref} onClick={() => onClose?.()} {...rest} />
));`;

test('checkRefForwarding passes forwardRef + {...rest} after an arrow handler in the same tag', () => {
  withTempReactDir({ Alert: GOOD }, (root) => {
    const alert = mod.checkRefForwarding(root).find((f) => f.component === 'Alert');
    assert.strictEqual(alert, undefined, 'Alert with forwardRef and rest spread must not be flagged');
  });
});

test('checkRefForwarding fails when forwardRef only appears in a comment', () => {
  const src = `// TODO: React.forwardRef(...)\n/* forwardRef<HTMLDivElement>( */\nexport const Alert = (props) => <div {...props} />;`;
  withTempReactDir({ Alert: src }, (root) => {
    const alert = mod.checkRefForwarding(root).find((f) => f.component === 'Alert');
    assert.deepStrictEqual(alert?.missing, ['forwardRef']);
  });
});

test('checkRefForwarding fails when forwardRef is present but there is no rest spread', () => {
  const src = `export const Alert = React.forwardRef((p, ref) => <div ref={ref} />);`;
  withTempReactDir({ Alert: src }, (root) => {
    const alert = mod.checkRefForwarding(root).find((f) => f.component === 'Alert');
    assert.deepStrictEqual(alert?.missing, ['restSpread']);
  });
});

test('checkRefForwarding reports a missing file once and does not throw', () => {
  withTempReactDir({}, (root) => {
    const failures = mod.checkRefForwarding(root).filter((f) => f.component === 'Alert');
    assert.deepStrictEqual(failures, [{ component: 'Alert', missing: ['file'] }]);
  });
});

test('runParityCheck counts a missing REF_FORWARDING React file once, not twice', () => {
  // Temp root with the real theme.css and no React sources: every component's React file is absent.
  const repoRoot = path.resolve(__dirname, '../../..');
  withTempReactDir({}, (root) => {
    fs.mkdirSync(path.join(root, 'packages/tokens/dist'), { recursive: true });
    fs.copyFileSync(
      path.join(repoRoot, 'packages/tokens/dist/theme.css'),
      path.join(root, 'packages/tokens/dist/theme.css')
    );
    const result = mod.runParityCheck({ rootDir: root, side: 'react' });
    const alertRows = result.checks.filter((c) => c.component === 'Alert');
    assert.strictEqual(alertRows.length, 1, 'missing Alert.tsx must produce exactly one check row');
  });
});

test('hasRestSpread does not false-fail real components that spread rest after inline handlers', () => {
  const reactSrc = path.resolve(__dirname, '../../react/src');
  for (const name of ['Rate', 'Switch', 'Tag']) {
    const src = fs.readFileSync(path.join(reactSrc, `${name}.tsx`), 'utf8');
    assert.ok(mod.hasRestSpread(src), `${name}.tsx spreads rest props and must not be flagged`);
  }
});
