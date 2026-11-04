import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { compile } from 'svelte/compiler';
import { render as ssrRender } from 'svelte/server';
import { createRawSnippet } from 'svelte';
import { registerSvelteHooks } from './helpers/svelte-hooks.js';

registerSvelteHooks();

const libUrl = new URL('../src/lib/', import.meta.url);
const src = (name) => fs.readFileSync(new URL(`${name}.svelte`, libUrl), 'utf8');
const compileSvelte = (name) => compile(src(name), { generate: 'server', filename: `${name}.svelte`, dev: false });
const snippet = (html) => createRawSnippet(() => ({ render: () => html }));

async function render(name, props = {}, slots = {}) {
  const { default: Comp } = await import(new URL(`${name}.svelte`, libUrl).href);
  const full = { ...props };
  for (const [k, v] of Object.entries(slots)) full[k] = typeof v === 'string' ? snippet(v) : v;
  return ssrRender(Comp, { props: full }).body;
}

test('F-093: all new and updated Svelte components compile with zero warnings', () => {
  for (const name of [
    'SoundController',
    'SoundTile',
    'AudioPlayer',
    'FilterChips',
    'InspectorPane',
    'CommandPalette',
    'Modal',
    'Tabs',
    'Button'
  ]) {
    assert.deepStrictEqual(
      compileSvelte(name).warnings.map((w) => w.code),
      [],
      `${name} should compile with zero warnings`
    );
  }
});

test('F-093 SoundController: renders mute, BGM toggle, ducking/blocked badges, and open channel mixer', async () => {
  const closed = await render('SoundController', { sfxVolume: 75, bgmEnabled: true });
  assert.match(closed, /joy-sound-controller/);
  assert.match(closed, /75%/);
  assert.ok(!/joy-sound-controller__popover/.test(closed));

  const blocked = await render('SoundController', { blocked: true, unlockLabel: 'Tap to unlock' });
  assert.match(blocked, /joy-sound-controller--blocked/);
  assert.match(blocked, /Tap to unlock/);

  const ducked = await render('SoundController', { ducked: true, open: true });
  assert.match(ducked, /joy-sound-controller--ducked/);
  assert.match(ducked, /Ducking/);
  assert.match(ducked, /joy-sound-controller__popover/);
  assert.match(ducked, /SFX volume/);
  assert.match(ducked, /BGM volume/);
  assert.match(ducked, /Voice volume/);
});

test('F-093 SoundTile: renders category, duration, visualizer bars, and playing/pinned states', async () => {
  const idle = await render('SoundTile', { title: 'Sword Slash', category: 'Combat SFX', duration: '0:02' });
  assert.match(idle, /Sword Slash/);
  assert.match(idle, /Combat SFX/);
  assert.match(idle, /0:02/);
  assert.ok(!/joy-sound-tile--playing/.test(idle));

  const active = await render('SoundTile', { title: 'Victory Fanfare', playing: true, pinned: true });
  assert.match(active, /joy-sound-tile--playing/);
  assert.match(active, /joy-sound-tile--pinned/);
  assert.match(active, /joy-sound-tile__pin-badge/);
});

test('F-093 AudioPlayer: renders waveform scrubber, loop/rate controls, and animation SFX cue markers', async () => {
  const html = await render('AudioPlayer', {
    title: 'Boss Theme Loop',
    subtitle: 'BGM Track 04',
    duration: 65,
    currentTime: 15,
    playing: true,
    loop: true,
    playbackRate: 1.5,
    cues: [
      { id: 'c1', label: 'Footstep L', time: 2 },
      { id: 'c2', label: 'Impact Hit', time: 15 }
    ]
  });
  assert.match(html, /Boss Theme Loop/);
  assert.match(html, /BGM Track 04/);
  assert.match(html, /0:15 \/ 1:05/);
  assert.match(html, /1\.5x/);
  assert.match(html, /Footstep L/);
  assert.match(html, /joy-audio-player__cue--active/);
});

test('F-093 FilterChips, InspectorPane, CommandPalette: render clean semantic markup without emojis', async () => {
  const chips = await render('FilterChips', {
    chips: [{ key: 'cat', label: 'Category', value: 'SFX' }],
    onclear: () => {}
  });
  assert.match(chips, /joy-filter-chips/);
  assert.match(chips, /Category:/);
  assert.match(chips, /SFX/);
  assert.match(chips, /Clear all/);

  const pane = await render(
    'InspectorPane',
    { title: 'Asset Properties', subtitle: 'wav / 48kHz', onclose: () => {} },
    { children: '<p>Details</p>', footer: '<span>Footer</span>' }
  );
  assert.match(pane, /Asset Properties/);
  assert.match(pane, /wav \/ 48kHz/);
  assert.match(pane, /Details/);
  assert.match(pane, /Footer/);

  const cmd = await render('CommandPalette', {
    open: true,
    items: [{ id: 'play', label: 'Preview SFX', group: 'Audio', shortcut: 'Space' }]
  });
  assert.match(cmd, /joy-command-palette/);
  assert.match(cmd, /Preview SFX/);
  assert.match(cmd, /Audio/);
  assert.match(cmd, /Space/);
});

test('F-093 Modal titleLevel & Tabs panelTabIndex parity', async () => {
  const h2Modal = await render('Modal', { open: true, title: 'Settings', titleLevel: 2 });
  assert.match(h2Modal, /<h2[^>]*class="joy-modal__title">Settings(?:<!---->)?<\/h2>/);

  const h4Modal = await render('Modal', { open: true, title: 'Subdialog', titleLevel: 4 });
  assert.match(h4Modal, /<h4[^>]*class="joy-modal__title">Subdialog(?:<!---->)?<\/h4>/);

  const tabs = await render('Tabs', {
    items: [{ key: 'sfx', label: 'SFX' }],
    panelTabIndex: 0
  });
  assert.match(tabs, /role="tabpanel"[^>]*tabindex="0"/);
});
