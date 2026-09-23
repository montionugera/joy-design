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

test('F-038 B-L1: Tag close hit area is >=44px tall and never extends left over the label', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../dist/theme.css'), 'utf8');
  const rule = css.match(/\.joy-tag__close::before\s*\{([^}]*)\}/);
  assert.ok(rule, '.joy-tag__close::before hit-area rule must exist in dist/theme.css');
  assert.match(rule[1], /height:\s*44px/, 'hit area must be 44px tall');
  assert.match(rule[1], /left:\s*0\b/, 'hit area must be anchored at the button left edge');
  assert.doesNotMatch(rule[1], /translate\(\s*-50%\s*,/, 'hit area must not be centred horizontally');
  assert.match(css, /\.joy-tag__close\s*\{[^}]*width:\s*24px[^}]*height:\s*24px/s, 'visual close control must be 24px');
});

test('F-038 B-L2: theme.css ships the visually-hidden trend label and delta row alignment for both twins', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../dist/theme.css'), 'utf8');
  const rule = (sel) => {
    const m = css.match(new RegExp(`(^|\\n)${sel.replace(/[.]/g, '\\.')} \\{([^}]*)\\}`));
    assert.ok(m, `theme.css must contain a ${sel} rule`);
    return m[2];
  };
  for (const sel of ['.joy-metric-tile__sr', '.joy-stat-card__sr']) {
    const body = rule(sel);
    assert.match(body, /position:\s*absolute/, `${sel} must be absolutely positioned`);
    assert.match(body, /width:\s*1px/, `${sel} must be 1px wide`);
    assert.match(body, /clip:\s*rect\(0 0 0 0\)/, `${sel} must be clipped`);
    assert.doesNotMatch(body, /#|rgb|hsl/, `${sel} must carry no colour`);
  }
  assert.match(rule('.joy-metric-tile__change'), /display:\s*inline-flex/);
  assert.match(rule('.joy-stat-card__delta'), /display:\s*inline-flex/);
});
