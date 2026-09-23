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

test('F-038 B-L3: Alert has no side stripe, uses status triads, card radius, a 44px close hit area, and a reduced-motion override', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../dist/theme.css'), 'utf8');
  const rule = (sel) => {
    const m = css.match(new RegExp(`(^|\\n)${sel.replace(/[.]/g, '\\.')} \\{([^}]*)\\}`));
    assert.ok(m, `theme.css must contain a ${sel} rule`);
    return m[2];
  };
  assert.doesNotMatch(rule('.joy-alert'), /border-left/, 'no side stripe on the base rule');
  assert.match(rule('.joy-alert'), /border-radius:\s*var\(--joy-radius-card\)/);
  for (const v of ['info', 'success', 'warning', 'danger']) {
    const body = rule(`.joy-alert--${v}`);
    assert.doesNotMatch(body, /border-left/, `${v}: no side stripe`);
    assert.match(body, new RegExp(`background:\\s*var\\(--joy-status-${v}-bg\\)`));
    assert.match(body, new RegExp(`border-color:\\s*var\\(--joy-status-${v}-border\\)`));
    assert.match(body, new RegExp(`color:\\s*var\\(--joy-status-${v}-fg\\)`));
  }
  assert.match(css, /\.joy-alert__close::before\s*\{[^}]*width:\s*44px[^}]*height:\s*44px/s, 'close hit area is 44x44');
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{\s*\.joy-alert \{\s*animation: none;/, 'alert fade-in is disabled under reduced motion');
});

test('F-038 B-L3: Skeleton reduced-motion block comes after the shimmer rule and Result/EmptyState stay tokenized', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../dist/theme.css'), 'utf8');
  const base = css.indexOf('\n.joy-skeleton {');
  const reduced = css.search(/@media \(prefers-reduced-motion: reduce\) \{\s*\.joy-skeleton \{/);
  assert.ok(base !== -1 && reduced !== -1, 'skeleton base and reduced-motion rules must exist');
  assert.ok(reduced > base, 'reduced-motion block must follow the base rule so it wins by source order');
  assert.match(css.slice(reduced, reduced + 200), /animation:\s*none;\s*background:\s*var\(--joy-surface-sunken\)/);
  const empty = css.match(/\n\.joy-empty-state \{([^}]*)\}/)[1];
  assert.match(empty, /background:\s*var\(--joy-surface-card\)/);
  assert.match(empty, /border:\s*1px dashed var\(--joy-border-default\)/);
  assert.match(css, /\.joy-result__title \{[^}]*color:\s*var\(--joy-text-primary\)/s);
  assert.match(css, /\.joy-result--warning \.joy-result__icon \{[^}]*color:\s*var\(--joy-status-warning-fg\)/s);
  assert.doesNotMatch(css, /\.joy-(alert|empty-state|result|skeleton)[^{]*\{[^}]*#[0-9a-fA-F]{3,8}\b/, 'no hex literal in these rule blocks');
});

test('F-038 B-L4: Message/Notification/Toast use the tokenized toast z-index, no numeric literals', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../dist/theme.css'), 'utf8');
  assert.match(css, /--joy-z-toast:\s*1100;/, 'toast token resolves to 1100');
  const rules = [...css.matchAll(/(^|\n)(\.joy-(?:message|notification|toast)[^{,]*)\s*\{([^}]*)\}/g)];
  assert.ok(rules.length >= 10, 'expected the message/notification/toast rule blocks');
  for (const [, , sel, body] of rules) {
    assert.doesNotMatch(body, /z-index:\s*-?\d/, `${sel.trim()} must not use a numeric z-index literal`);
  }
  for (const sel of ['.joy-message', '.joy-notification', '.joy-toast-container']) {
    const body = css.match(new RegExp(`\\n${sel.replace('.', '\\.')} \\{([^}]*)\\}`))[1];
    assert.match(body, /z-index:\s*var\(--joy-z-toast\)/, `${sel} uses --joy-z-toast`);
  }
});

test('F-038 B-L4: Toast has no side stripe, uses status triads, a 44px close, and a reduced-motion override after the base rule', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../dist/theme.css'), 'utf8');
  const rule = (sel) => {
    const m = css.match(new RegExp(`(^|\\n)${sel.replace(/[.]/g, '\\.')} \\{([^}]*)\\}`));
    assert.ok(m, `theme.css must contain a ${sel} rule`);
    return m[2];
  };
  assert.doesNotMatch(rule('.joy-toast'), /border-left/);
  for (const v of ['info', 'success', 'warning', 'danger']) {
    const body = rule(`.joy-toast--${v}`);
    assert.doesNotMatch(body, /border-left/, `${v}: no side stripe`);
    assert.match(body, new RegExp(`background:\\s*var\\(--joy-status-${v}-bg\\)`));
    assert.match(body, new RegExp(`border:\\s*1px solid var\\(--joy-status-${v}-border\\)`));
    assert.match(body, new RegExp(`color:\\s*var\\(--joy-status-${v}-fg\\)`));
  }
  const base = css.indexOf('\n.joy-toast {');
  const reduced = css.search(/@media \(prefers-reduced-motion: reduce\) \{\s*\.joy-toast \{\s*animation: none;/);
  assert.ok(base !== -1 && reduced > base, 'toast reduced-motion override follows the base animation rule');
});

test('F-038 B-L4: Notification fits 375px screens and Message/Notification icons use status-fg tokens', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../dist/theme.css'), 'utf8');
  assert.match(css, /\.joy-notification \{[^}]*max-width:\s*calc\(100vw - var\(--joy-space-8\)\)/s, 'base notification is capped to the viewport');
  const mq = css.match(/@media \(max-width: 480px\) \{\s*\.joy-notification \{([^}]*)\}\s*\.joy-notification__notice \{([^}]*)\}/);
  assert.ok(mq, 'a max-width:480px block re-flows the notification');
  assert.match(mq[1], /left:\s*var\(--joy-space-4\)/);
  assert.match(mq[1], /right:\s*var\(--joy-space-4\)/);
  assert.match(mq[2], /min-width:\s*0/);
  assert.match(mq[2], /max-width:\s*calc\(100vw - var\(--joy-space-8\)\)/);
  for (const c of ['message', 'notification']) {
    for (const [t, tok] of [['info', 'info'], ['success', 'success'], ['warning', 'warning'], ['error', 'danger']]) {
      assert.match(css, new RegExp(`\\.joy-${c}__icon--${t} \\{ color: var\\(--joy-status-${tok}-fg\\); \\}`), `${c} ${t} icon uses status-${tok}-fg`);
    }
  }
});

test('F-038 B-L4: Progress uses tokens and explicit transition properties; Spin tip, reduced-motion (slow, not stop) and mask are tokenized', () => {
  const css = fs.readFileSync(path.resolve(__dirname, '../dist/theme.css'), 'utf8');
  const rule = (sel) => css.match(new RegExp(`\\n${sel.replace(/[.]/g, '\\.')} \\{([^}]*)\\}`))[1];
  const bg = rule('.joy-progress__bg');
  assert.doesNotMatch(bg, /transition:\s*all/, 'no transition: all');
  assert.match(bg, /transition:\s*width /);
  assert.match(bg, /background-color:\s*var\(--joy-accent-default\)/);
  assert.match(rule('.joy-progress__inner'), /background-color:\s*var\(--joy-surface-sunken\)/);
  assert.match(rule('.joy-progress--status-success .joy-progress__bg'), /var\(--joy-status-success-fg\)/);
  assert.match(rule('.joy-progress--status-exception .joy-progress__bg'), /var\(--joy-status-danger-fg\)/);
  assert.match(rule('.joy-spin__tip'), /color:\s*var\(--joy-accent-text\)/);
  const mask = rule('.joy-spin__mask');
  assert.doesNotMatch(mask, /backdrop-filter/, 'no glassmorphism blur on the spin mask');
  assert.match(mask, /background-color:\s*color-mix\(in srgb, var\(--joy-surface-overlay\) 70%, transparent\)/);
  // The global reduced-motion block forces 0.01ms / 1 iteration with !important, which would stop the
  // spinner. The Spin override must therefore be !important, more specific, and after the base rule.
  const base = css.indexOf('\n.joy-spin__indicator {');
  const reduced = css.search(/@media \(prefers-reduced-motion: reduce\) \{\s*\.joy-spin \.joy-spin__indicator \{/);
  assert.ok(base !== -1 && reduced > base, 'spin reduced-motion block follows the base rule');
  const block = css.slice(reduced, reduced + 260);
  assert.match(block, /animation-duration:\s*4s !important/);
  assert.match(block, /animation-iteration-count:\s*infinite !important/);
  assert.doesNotMatch(css.slice(css.indexOf('\n.joy-spin {'), css.indexOf('\n.joy-spin__container')), /#[0-9a-fA-F]{3,8}\b|brand-primary/);
});
