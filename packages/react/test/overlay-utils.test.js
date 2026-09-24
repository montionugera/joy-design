import test from 'node:test';
import assert from 'node:assert';
import { positionPanel, isOutside, isSheet, openOverlay, registerDialog, trapFocus, SHEET_MAX_WIDTH } from '../src/overlay-utils.ts';

const rect = (top, left, width, height) => ({ top, left, width, height, bottom: top + height, right: left + width });
const node = (r, name) => {
  const classes = new Set();
  const obj = {
    name,
    focused: 0,
    classes,
    style: {},
    classList: {
      add(...c) { c.forEach((x) => classes.add(x)); },
      remove(...c) { c.forEach((x) => classes.delete(x)); }
    },
    getBoundingClientRect: () => r,
    contains(n) { return n === obj || n?.owner === obj; },
    focus() { obj.focused++; }
  };
  return obj;
};
const win = (innerWidth, coarse = false) => Object.assign(new EventTarget(), { innerWidth, innerHeight: 800, matchMedia: () => ({ matches: coarse }) });
const evt = (type, props) => { const e = new Event(type); for (const [k, v] of Object.entries(props)) Object.defineProperty(e, k, { value: v }); return e; };

test('positionPanel drops below the anchor and flips above when there is no room', () => {
  const vp = { width: 1280, height: 800 };
  assert.deepStrictEqual(positionPanel(rect(100, 40, 200, 40), rect(0, 0, 240, 300), vp), { top: 144, left: 40, above: false });
  assert.deepStrictEqual(positionPanel(rect(700, 40, 200, 40), rect(0, 0, 240, 300), vp), { top: 396, left: 40, above: true });
  assert.strictEqual(positionPanel(rect(100, 1200, 200, 40), rect(0, 0, 240, 300), vp).left, 1032);
});

test('isOutside is false for the anchor, the panel and their descendants', () => {
  const anchor = node(rect(0, 0, 10, 10), 'anchor'); const panel = node(rect(0, 0, 10, 10), 'panel');
  assert.strictEqual(isOutside({ owner: panel }, [anchor, panel]), false);
  assert.strictEqual(isOutside(anchor, [anchor, panel]), false);
  assert.strictEqual(isOutside({}, [anchor, panel]), true);
});

test('isSheet: narrow viewport or coarse pointer', () => {
  assert.strictEqual(isSheet(win(SHEET_MAX_WIDTH)), false);
  assert.strictEqual(isSheet(win(SHEET_MAX_WIDTH - 1)), true);
  assert.strictEqual(isSheet(win(1280, true)), true);
});

function harness(width = 1280) {
  const anchor = node(rect(100, 40, 200, 40), 'anchor'); const panel = node(rect(0, 0, 240, 200), 'panel');
  const doc = new EventTarget(); const w = win(width);
  let closed = 0; const handle = openOverlay({ anchor, panel, onClose: () => closed++, doc, win: w });
  return { anchor, panel, doc, win: w, handle, closed: () => closed };
}

test('Escape closes, returns focus and calls onClose once', () => {
  const h = harness();
  h.doc.dispatchEvent(evt('keydown', { key: 'Escape' }));
  assert.strictEqual(h.closed(), 1); assert.strictEqual(h.anchor.focused, 1); assert.ok(!h.panel.classes.has('joy-overlay'));
  h.doc.dispatchEvent(evt('keydown', { key: 'Escape' }));
  assert.strictEqual(h.closed(), 1, 'listeners are removed on close');
});

test('outside pointerdown closes, inside pointerdown does not', () => {
  const h = harness();
  h.doc.dispatchEvent(evt('pointerdown', { target: { owner: h.panel } }));
  assert.strictEqual(h.closed(), 0);
  h.doc.dispatchEvent(evt('pointerdown', { target: {} }));
  assert.strictEqual(h.closed(), 1);
});

test('narrow viewports get the sheet class and fixed positioning; dispose never calls onClose', () => {
  const h = harness(SHEET_MAX_WIDTH - 1);
  assert.ok(h.panel.classes.has('joy-overlay--sheet')); assert.strictEqual(h.panel.style.position, 'fixed');
  h.handle.dispose(); assert.strictEqual(h.closed(), 0);
});

test('Escape is claimed (defaultPrevented) so a dialog listening for Escape can skip it', () => {
  const h = harness();
  const e = new Event('keydown', { cancelable: true }); Object.defineProperty(e, 'key', { value: 'Escape' });
  h.doc.dispatchEvent(e);
  assert.strictEqual(e.defaultPrevented, true);
  assert.strictEqual(h.closed(), 1);
});

test('registerDialog: the last registered dialog is topmost; the top switches when it unregisters', () => {
  const a = registerDialog(); const b = registerDialog();
  assert.strictEqual(a.isTopmost(), false); assert.strictEqual(b.isTopmost(), true);
  b.unregister();
  assert.strictEqual(a.isTopmost(), true);
  a.unregister();
});

test('registerDialog: unregistering out of order keeps the remaining order; double unregister is a no-op', () => {
  const a = registerDialog(); const b = registerDialog(); const c = registerDialog();
  b.unregister();
  assert.strictEqual(c.isTopmost(), true); assert.strictEqual(a.isTopmost(), false);
  b.unregister(); b.unregister();
  assert.strictEqual(c.isTopmost(), true, 'a second unregister must not remove another dialog');
  c.unregister();
  assert.strictEqual(a.isTopmost(), true);
  a.unregister(); a.unregister();
  const d = registerDialog();
  assert.strictEqual(d.isTopmost(), true, 'stack is empty again after everything unregistered');
  d.unregister();
});

test('registerDialog + Escape claim: a popover inside a dialog closes alone, the dialog stays topmost and sees defaultPrevented', () => {
  const dialog = registerDialog();
  const h = harness();
  const e = new Event('keydown', { cancelable: true }); Object.defineProperty(e, 'key', { value: 'Escape' });
  h.doc.dispatchEvent(e);
  assert.strictEqual(h.closed(), 1);
  assert.strictEqual(e.defaultPrevented, true, 'a dialog checking defaultPrevented skips this Escape');
  assert.strictEqual(dialog.isTopmost(), true);
  dialog.unregister();
});

test('trapFocus: does not steal focus from an element already focused inside the container (autoFocus input)', () => {
  const first = node(rect(0, 0, 10, 10), 'close'); const input = node(rect(0, 0, 10, 10), 'input');
  const container = node(rect(0, 0, 100, 100), 'dialog');
  container.querySelector = () => first; container.addEventListener = () => {}; container.removeEventListener = () => {};
  container.contains = (n) => n === container || n === input || n === first;
  const prev = globalThis.document;
  try {
    globalThis.document = { activeElement: input };
    trapFocus(container);
    assert.strictEqual(first.focused, 0, 'first focusable (Close button) must not take focus');
    globalThis.document = { activeElement: { name: 'opener' } };
    trapFocus(container);
    assert.strictEqual(first.focused, 1, 'focus outside the container still moves to the first focusable');
  } finally { globalThis.document = prev; }
});
