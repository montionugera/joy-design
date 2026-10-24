import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { createRawSnippet } from 'svelte';
import { compileSvelte, renderSvelte } from './helpers/render-svelte.js';

// F-087: seven opt-in props so play-joymify can use the library components. The React twin asserts the same
// expectations in packages/react/test/f087-gaps.test.js. SSR emits Svelte hydration markers, so strip them.
const render = async (name, props, opts) => (await renderSvelte(name, props, opts)).replace(/<!--[\s\S]*?-->/g, '');
const snippet = (html) => createRawSnippet(() => ({ render: () => html }));
const src = (name) => fs.readFileSync(path.resolve(`./src/lib/${name}.svelte`), 'utf8');

test('F-087: the seven touched components still compile with zero warnings', () => {
  for (const name of ['Badge', 'Switch', 'Skeleton', 'Button', 'Alert', 'Modal', 'Tabs']) {
    assert.deepStrictEqual(compileSvelte(name).warnings.map((w) => w.code), [], name);
  }
});

test('F-087 Badge: icon renders in an aria-hidden span before the text; absent without icon', async () => {
  const html = await render('Badge', { icon: snippet('<i>X</i>') }, { children: 'Hi' });
  assert.match(html, /<span aria-hidden="true"><i>X<\/i><\/span>\s*Hi/);
  assert.ok(!/aria-hidden/.test(await render('Badge', {}, { children: 'Hi' })));
});

test('F-087 Switch: controlled never assigns checked, only reports !checked', () => {
  const s = src('Switch');
  assert.match(s, /controlled = false/);
  assert.match(s, /if \(controlled\) \{\s*onchange\?\.\(!checked\);\s*return;\s*\}/);
  // Uncontrolled path is unchanged.
  assert.match(s, /checked = !checked;\s*onchange\?\.\(checked\);/);
});

test('F-087 Skeleton: decorative is aria-hidden with no role or aria-busy; default keeps progressbar', async () => {
  const deco = await render('Skeleton', { decorative: true });
  assert.match(deco, /aria-hidden="true"/);
  assert.ok(!/role=|aria-busy/.test(deco));
  assert.match(deco, /joy-skeleton--text/);
  const lines = await render('Skeleton', { decorative: true, lines: 3 });
  assert.strictEqual((lines.match(/aria-hidden/g) || []).length, 1, 'wrapper hidden, not each row');
  const plain = await render('Skeleton', {});
  assert.match(plain, /role="progressbar"/);
  assert.ok(!/aria-hidden/.test(plain));
});

test('F-087 Button: loadingLabel replaces the text only while loading', async () => {
  const on = await render('Button', { loading: true, loadingLabel: 'Saving' }, { children: 'Save' });
  assert.match(on, /joy-button__label">\s*Saving/);
  assert.ok(!/Save</.test(on));
  assert.match(await render('Button', { loadingLabel: 'Saving' }, { children: 'Save' }), /joy-button__label">\s*Save/);
  assert.match(await render('Button', { loading: true }, { children: 'Save' }), /joy-button__label">\s*Save/);
});

test('F-087 Alert: actions render in joy-alert__actions; dismissLabel names the close button', async () => {
  const html = await render('Alert', { closable: true, actions: snippet('<button>Go</button>') }, { children: 'Body' });
  assert.match(html, /Body[\s\S]*<div class="joy-alert__actions"><button>Go<\/button><\/div>/);
  assert.match(html, /aria-label="Dismiss alert"/);
  assert.match(await render('Alert', { closable: true, dismissLabel: 'Close it' }), /aria-label="Close it"/);
  assert.ok(!/joy-alert__actions/.test(await render('Alert', {}, { children: 'Body' })));
});

test('F-087 Modal: role is dialog unless alertdialog; closeLabel names the close button; other roles are ignored', async () => {
  assert.match(await render('Modal', { open: true }), /role="dialog"/);
  assert.match(await render('Modal', { open: true, role: 'alertdialog' }), /role="alertdialog"/);
  assert.match(await render('Modal', { open: true, role: 'alert' }), /role="dialog"/);
  assert.match(await render('Modal', { open: true }), /aria-label="Close dialog"/);
  assert.match(await render('Modal', { open: true, closeLabel: 'Tutup' }), /aria-label="Tutup"/);
  // Focus return is DOM-only (the suite is server-render): pin the order so a connected returnFocusTo wins.
  assert.match(src('Modal'), /if \(returnFocusTo\?\.isConnected\) returnFocusTo\.focus\(\);\s*else if \(previouslyFocused\?\.isConnected\)/);
});

test('F-087 Tabs: label becomes the tablist aria-label; absent otherwise', async () => {
  const items = [{ key: 'a', label: 'A' }];
  assert.match(await render('Tabs', { items, label: 'Leaders' }), /role="tablist"[^>]*aria-label="Leaders"/);
  assert.ok(!/aria-label="/.test(await render('Tabs', { items })));
});
