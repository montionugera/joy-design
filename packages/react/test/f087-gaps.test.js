import test from 'node:test';
import assert from 'node:assert';
import { loadComponent, requireFromHere } from './helpers/load-tsx.js';

// F-087: seven opt-in props (React twin). The Svelte twin asserts the same in packages/svelte/test.
const React = requireFromHere('react');
const { renderToStaticMarkup } = requireFromHere('react-dom/server');
const { Badge } = loadComponent('Badge');
const { Switch } = loadComponent('Switch');
const { Skeleton } = loadComponent('Skeleton');
const { Button } = loadComponent('Button');
const { Alert } = loadComponent('Alert');
const { Modal } = loadComponent('Modal');
const { Tabs } = loadComponent('Tabs');
const r = (C, props, ...kids) => renderToStaticMarkup(React.createElement(C, props, ...kids));

test('F-087: Badge icon renders aria-hidden span before text; unset unchanged', () => {
  assert.match(r(Badge, { icon: 'I' }, 'Text'), /<span aria-hidden="true">I<\/span>Text<\/span>$/);
  assert.ok(!/aria-hidden/.test(r(Badge, {}, 'Text')));
});

test('F-087: Switch controlled calls onChange(!checked) and keeps aria-checked', () => {
  let got;
  // Run the forwardRef render fn inside a host component so hooks are valid, and capture the button element.
  let tree;
  const Probe = () => {
    tree = Switch.render({ checked: false, controlled: true, onChange: (v) => (got = v) }, null);
    return null;
  };
  renderToStaticMarkup(React.createElement(Probe));
  tree.props.onClick();
  assert.strictEqual(got, true);
  assert.strictEqual(tree.props['aria-checked'], false);
  assert.ok(!('controlled' in tree.props));
  assert.match(r(Switch, { checked: false, controlled: true }), /aria-checked="false"/);
});

test('F-087: Skeleton decorative hides, drops role/aria-busy, keeps classes', () => {
  const html = r(Skeleton, { decorative: true });
  assert.match(html, /aria-hidden="true"/);
  assert.ok(!/role=|aria-busy/.test(html));
  assert.match(html, /joy-skeleton joy-skeleton--text/);
  const multi = r(Skeleton, { decorative: true, lines: 3 });
  assert.strictEqual((multi.match(/aria-hidden/g) || []).length, 1);
  assert.ok(!/role=|aria-busy/.test(multi));
  assert.match(r(Skeleton, {}), /role="progressbar" aria-busy="true"/);
});

test('F-087: Button loadingLabel only applies while loading', () => {
  assert.match(r(Button, { loading: true, loadingLabel: 'Saving' }, 'Save'), /joy-button__label">Saving</);
  assert.match(r(Button, { loadingLabel: 'Saving' }, 'Save'), /joy-button__label">Save</);
});

test('F-087: Alert actions after body content, dismissLabel default and custom', () => {
  const html = r(Alert, { actions: 'ACT', closable: true, description: 'd' }, 'child');
  assert.match(html, /child<div class="joy-alert__actions">ACT<\/div><\/div>/);
  assert.match(html, /aria-label="Dismiss alert"/);
  assert.match(r(Alert, { closable: true, dismissLabel: 'Hide' }), /aria-label="Hide"/);
  assert.ok(!/joy-alert__actions/.test(r(Alert, {})));
});

test('F-087: Modal role, closeLabel', () => {
  assert.match(r(Modal, { open: true }), /role="dialog"/);
  assert.match(r(Modal, { open: true }), /aria-label="Close dialog"/);
  const html = r(Modal, { open: true, role: 'alertdialog', closeLabel: 'Dismiss' });
  assert.match(html, /role="alertdialog"/);
  assert.match(html, /aria-label="Dismiss"/);
});

test('F-087: Tabs label sets aria-label on tablist only when given', () => {
  const items = [{ key: 'a', label: 'A', content: 'x' }];
  assert.match(r(Tabs, { items, label: 'Sections' }), /role="tablist"[^>]*aria-label="Sections"/);
  assert.ok(!/aria-label=/.test(r(Tabs, { items })));
});

test('F-087 Modal: returnFocusTo effect is declared after useDialog so it wins when connected (DOM-only; pinned by source)', async () => {
  const fs = await import('node:fs');
  const src = fs.readFileSync(new URL('../src/Modal.tsx', import.meta.url), 'utf8');
  const dialog = src.indexOf('useDialog(');
  const effect = src.indexOf('returnRef.current');
  assert.ok(dialog > -1 && effect > dialog, 'returnFocusTo effect is declared after useDialog');
  assert.match(src, /'current' in r/, 'accepts an element or a ref');
  assert.match(src, /el && el\.isConnected/, 'only focuses a connected element');
});
