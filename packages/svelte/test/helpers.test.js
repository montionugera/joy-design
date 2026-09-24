import test from 'node:test';
import assert from 'node:assert';
import { compileSvelte, renderSvelte } from './helpers/render-svelte.js';
import { compileServer } from './helpers/svelte-hooks.js';

test('A2 helpers: compileSvelte accepts a valid component and rejects a broken one', () => {
  assert.doesNotThrow(() => compileSvelte('Badge'));
  assert.throws(() => compileSvelte('NoSuchComponentForA2'), /ENOENT/);
  assert.throws(() => compileServer('<div>{/* not a valid expression */}</div>', 'Broken.svelte'), /js_parse_error|Unexpected|Expected/);
});

test('A2 helpers: renderSvelte returns real SSR markup for a leaf component', async () => {
  const html = await renderSvelte('Badge', { variant: 'success', size: 'sm', dot: true });
  assert.match(html, /<span[^>]*class="[^"]*\bjoy-badge\b[^"]*\bjoy-badge--success\b[^"]*\bjoy-badge--sm\b/);
  assert.match(html, /class="joy-badge__dot"[^>]*aria-hidden="true"/);
});

test('A2 helpers: renderSvelte renders children snippets', async () => {
  const html = await renderSvelte('Badge', {}, { children: 'Hello badge' });
  assert.match(html, /joy-badge--neutral[^>]*>[\s\S]*Hello badge[\s\S]*<\/span>/);
});

test('A2 helpers: renderSvelte resolves .js->.ts imports and icon components (Drawer)', async () => {
  const html = await renderSvelte('Drawer', { open: true, title: 'Settings drawer' });
  assert.match(html, /role="dialog"/);
  assert.match(html, /<h3[^>]*class="joy-drawer__title"[^>]*>Settings drawer<\/h3>/);
  assert.match(html, /aria-labelledby="[^"]+-title"/);
});
