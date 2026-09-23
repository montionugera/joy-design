import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { compile } from 'svelte/compiler';
import { createOpenerTracker } from '../src/lib/dialog-opener.ts';

function withDocument(fn) {
  const had = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const doc = { activeElement: { name: 'opener' } };
  Object.defineProperty(globalThis, 'document', { value: doc, configurable: true, writable: true });
  try {
    return fn(doc);
  } finally {
    if (had) Object.defineProperty(globalThis, 'document', had);
    else delete globalThis.document;
  }
}

test('F-038 final fix: the opener tracker captures on the closed -> open transition only', () => {
  withDocument((doc) => {
    const t = createOpenerTracker();
    assert.strictEqual(t.current, null, 'nothing captured before the first open');
    t.sync(false);
    assert.strictEqual(t.current, null);
    const opener = doc.activeElement;
    t.sync(true);
    assert.strictEqual(t.current, opener, 'captured when open flips to true');
    // A child then takes focus (autofocus / onMount focus()); re-syncs while open keep the first value.
    doc.activeElement = { name: 'child inside the dialog' };
    t.sync(true);
    t.sync(true);
    assert.strictEqual(t.current, opener, 'a re-run while open must not overwrite the opener');
    // Close, focus moves elsewhere, reopen: the new opener is captured.
    t.sync(false);
    const second = { name: 'second opener' };
    doc.activeElement = second;
    t.sync(true);
    assert.strictEqual(t.current, second);
  });
});

test('F-038 final fix: the opener tracker is SSR-safe (no document)', () => {
  assert.strictEqual(typeof document, 'undefined');
  const t = createOpenerTracker();
  assert.doesNotThrow(() => t.sync(true));
  assert.strictEqual(t.current, null);
});

test('F-038 final fix: Modal, Drawer and ImagePreview capture the opener in $effect.pre, before children mount', () => {
  for (const name of ['Modal', 'Drawer', 'ImagePreview']) {
    const src = fs.readFileSync(path.resolve(`./src/lib/${name}.svelte`), 'utf8');
    assert.ok(src.includes("from './dialog-opener.js'") && src.includes('createOpenerTracker()'), `${name} uses the shared tracker`);
    assert.ok(/\$effect\.pre\(\(\) => opener\.sync\(open\)\)/.test(src), `${name} syncs the opener in $effect.pre`);
    assert.ok(src.includes('const previouslyFocused = opener.current;'), `${name} restores focus to the captured opener`);
    assert.ok(!src.includes('document.activeElement'), `${name} must not read document.activeElement inside its (post-mount) effect`);
    assert.ok(src.includes('if (previouslyFocused?.isConnected) previouslyFocused.focus();'), `${name} falls back safely when the opener is detached`);
    const client = compile(src, { filename: `${name}.svelte`, generate: 'client', runes: true });
    const server = compile(src, { filename: `${name}.svelte`, generate: 'server', runes: true });
    assert.deepStrictEqual([client.warnings, server.warnings].flat().map((w) => w.code), [], `${name} compiles warning-free`);
  }
});
