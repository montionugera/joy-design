// Runs under `node --conditions=browser` (see the "test" script) so svelte and react-dom load their client builds.
import test from 'node:test';
import assert from 'node:assert';
import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register();
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.__mascotCompile = 'client';
await import('../helpers.js');

const { mount, unmount, flushSync } = await import('svelte');
const { createElement: h, act } = await import('react');
const { createRoot } = await import('react-dom/client');
const { default: SvelteMascot } = await import('../../src/Mascot.svelte');
const { Mascot: ReactMascot } = await import('../../src/react/Mascot.tsx');

const twins = {
  svelte: {
    async render(props) {
      const target = document.createElement('div');
      document.body.append(target);
      const app = mount(SvelteMascot, { target, props });
      flushSync();
      return { target, update: () => flushSync(), done: () => unmount(app) };
    },
  },
  react: {
    async render(props) {
      const target = document.createElement('div');
      document.body.append(target);
      const root = createRoot(target);
      await act(async () => root.render(h(ReactMascot, props)));
      return {
        target,
        update: (next) => act(async () => root.render(h(ReactMascot, next))),
        done: () => act(async () => root.unmount()),
      };
    },
  },
};

const fail = async (twin, el) => {
  if (twin === 'react') await act(async () => el.dispatchEvent(new Event('error')));
  else {
    el.dispatchEvent(new Event('error'));
    flushSync();
  }
};

for (const [twin, { render }] of Object.entries(twins)) {
  test(`${twin}: a broken picture becomes a soft circle with the initial, same size`, async () => {
    const m = await render({ name: 'rex', pose: 'cheer', size: 120, label: 'Rex' });
    const img = m.target.querySelector('img');
    assert.ok(img, 'starts as a picture');
    await fail(twin, img);
    assert.strictEqual(m.target.querySelector('img'), null, 'the picture is gone');
    const span = m.target.querySelector('span.joy-mascot--fallback');
    assert.ok(span, 'fallback element');
    assert.strictEqual(span.textContent.trim(), 'R');
    assert.strictEqual(span.style.width, '120px');
    assert.strictEqual(span.style.height, '120px');
    assert.strictEqual(span.getAttribute('role'), 'img');
    assert.strictEqual(span.getAttribute('aria-label'), 'Rex');
    await m.done();
  });

  test(`${twin}: without a label the fallback is hidden from assistive tech`, async () => {
    const m = await render({ name: 'luna' });
    await fail(twin, m.target.querySelector('img'));
    const span = m.target.querySelector('span.joy-mascot--fallback');
    assert.strictEqual(span.textContent.trim(), 'L');
    assert.strictEqual(span.getAttribute('aria-hidden'), 'true');
    assert.strictEqual(span.getAttribute('role'), null);
    assert.strictEqual(span.style.width, '96px');
    await m.done();
  });

  test(`${twin}: glow 0 sets the glow variable to 0 and no glow class`, async () => {
    const m = await render({ name: 'rex', glow: 0 });
    const img = m.target.querySelector('img');
    assert.strictEqual(img.style.getPropertyValue('--joy-mascot-glow'), '0');
    assert.strictEqual(img.getAttribute('class'), 'joy-mascot', 'no glow class, so the stylesheet applies no accent drop-shadow');
    await m.done();
  });

  test(`${twin}: glow above 0 adds the glow class`, async () => {
    const m = await render({ name: 'rex', glow: 3 });
    const img = m.target.querySelector('img');
    assert.strictEqual(img.getAttribute('class'), 'joy-mascot joy-mascot--glow');
    assert.strictEqual(img.style.getPropertyValue('--joy-mascot-glow'), '3');
    await m.done();
  });
}

test('react: a new pose brings the picture back after a failure', async () => {
  const m = await twins.react.render({ name: 'rex', pose: 'cheer' });
  await fail('react', m.target.querySelector('img'));
  assert.ok(m.target.querySelector('span.joy-mascot--fallback'));
  await m.update({ name: 'rex', pose: 'sleepy' });
  assert.ok(m.target.querySelector('img'), 'picture again');
  await m.done();
});
