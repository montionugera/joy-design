import test from 'node:test';
import assert from 'node:assert';
import { loadComponent, requireFromHere } from './helpers/load-tsx.js';

const React = requireFromHere('react');
const { renderToStaticMarkup } = requireFromHere('react-dom/server');
const { SoundController } = loadComponent('SoundController');
const { SoundTile } = loadComponent('SoundTile');
const { AudioPlayer } = loadComponent('AudioPlayer');
const { FilterChips } = loadComponent('FilterChips');
const { InspectorPane } = loadComponent('InspectorPane');
const { CommandPalette } = loadComponent('CommandPalette');
const { Modal } = loadComponent('Modal');
const { Tabs } = loadComponent('Tabs');
const r = (C, props, ...kids) => renderToStaticMarkup(React.createElement(C, props, ...kids));

test('F-093 SoundController: renders mute, BGM toggle, ducking/blocked badges, and open channel mixer', () => {
  const closed = r(SoundController, { sfxVolume: 75, bgmEnabled: true });
  assert.match(closed, /joy-sound-controller/);
  assert.match(closed, /75%/);
  assert.ok(!/joy-sound-controller__popover/.test(closed));

  const blocked = r(SoundController, { blocked: true, unlockLabel: 'Tap to unlock' });
  assert.match(blocked, /joy-sound-controller--blocked/);
  assert.match(blocked, /Tap to unlock/);

  const ducked = r(SoundController, { ducked: true, open: true });
  assert.match(ducked, /joy-sound-controller--ducked/);
  assert.match(ducked, /Ducking/);
  assert.match(ducked, /joy-sound-controller__popover/);
  assert.match(ducked, /SFX volume/);
  assert.match(ducked, /BGM volume/);
  assert.match(ducked, /Voice volume/);
});

test('F-093 SoundTile: renders category, duration, visualizer bars, and playing/pinned states', () => {
  const idle = r(SoundTile, { title: 'Sword Slash', category: 'Combat SFX', duration: '0:02' });
  assert.match(idle, /Sword Slash/);
  assert.match(idle, /Combat SFX/);
  assert.match(idle, /0:02/);
  assert.ok(!/joy-sound-tile--playing/.test(idle));

  const active = r(SoundTile, { title: 'Victory Fanfare', playing: true, pinned: true });
  assert.match(active, /joy-sound-tile--playing/);
  assert.match(active, /joy-sound-tile--pinned/);
  assert.match(active, /joy-sound-tile__pin-badge/);
});

test('F-093 AudioPlayer: renders waveform scrubber, loop/rate controls, and animation SFX cue markers', () => {
  const html = r(AudioPlayer, {
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

test('F-093 FilterChips, InspectorPane, CommandPalette: render clean semantic markup without emojis', () => {
  const chips = r(FilterChips, {
    chips: [{ key: 'cat', label: 'Category', value: 'SFX' }],
    onClear: () => {}
  });
  assert.match(chips, /joy-filter-chips/);
  assert.match(chips, /Category:/);
  assert.match(chips, /SFX/);
  assert.match(chips, /Clear all/);

  const pane = r(
    InspectorPane,
    { title: 'Asset Properties', subtitle: 'wav / 48kHz', onClose: () => {}, footer: 'Footer' },
    'Details'
  );
  assert.match(pane, /Asset Properties/);
  assert.match(pane, /wav \/ 48kHz/);
  assert.match(pane, /Details/);
  assert.match(pane, /Footer/);

  const cmd = r(CommandPalette, {
    open: true,
    items: [{ id: 'play', label: 'Preview SFX', group: 'Audio', shortcut: 'Space' }]
  });
  assert.match(cmd, /joy-command-palette/);
  assert.match(cmd, /Preview SFX/);
  assert.match(cmd, /Audio/);
  assert.match(cmd, /Space/);
});

test('F-093 Modal titleLevel & Tabs panelTabIndex parity', () => {
  const h2Modal = r(Modal, { open: true, title: 'Settings', titleLevel: 2 });
  assert.match(h2Modal, /<h2[^>]*class="joy-modal__title">Settings<\/h2>/);

  const h4Modal = r(Modal, { open: true, title: 'Subdialog', titleLevel: 4 });
  assert.match(h4Modal, /<h4[^>]*class="joy-modal__title">Subdialog<\/h4>/);

  const tabs = r(Tabs, {
    items: [{ key: 'sfx', label: 'SFX', content: 'Body' }],
    panelTabIndex: 0
  });
  assert.match(tabs, /role="tabpanel"[^>]*tabindex="0"/);
});
