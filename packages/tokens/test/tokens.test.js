import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('compiled tokens exist and contain critical joy variables and enterprise components', () => {
  const css = fs.readFileSync(path.resolve('./dist/theme.css'), 'utf8');
  assert.ok(css.includes('--joy-color-brand-primary:') || css.includes('--joy-accent-default: #c49a3a;'), 'brand primary must exist with canonical gold-400');
  assert.ok(css.includes('--joy-space-4: 16px;') || css.includes('--joy-spacing-4: 16px;'), 'spacing-4 must exist');
  assert.ok(css.includes('--joy-radius-control: 6px;') || css.includes('--joy-radius-md:'), 'radius-md must exist');
  assert.ok(css.includes('--joy-duration-fast: 150ms;') || css.includes('--joy-motion-duration-fast: 150ms;'), 'motion fast duration must exist');
  assert.ok(css.includes('--joy-shadow-overlay:'), 'shadow overlay must exist');
  assert.ok(css.includes('.joy-modal'), 'modal styles must be compiled into theme.css');
  assert.ok(css.includes('.joy-dropdown'), 'dropdown styles must be compiled into theme.css');
  assert.ok(css.includes('.joy-tabs'), 'tabs styles must be compiled into theme.css');
  assert.ok(css.includes('.joy-tooltip'), 'tooltip styles must be compiled into theme.css');

  // Wave 1 Assertions
  assert.ok(css.includes('[data-theme="dark"]'), 'dark mode palette override must exist');
  assert.ok(css.includes('.joy-select'), 'select component styles must exist');
  assert.ok(css.includes('.joy-checkbox'), 'checkbox component styles must exist');
  assert.ok(css.includes('.joy-radio-group'), 'radio group styles must exist');
  assert.ok(css.includes('.joy-drawer'), 'drawer panel styles must exist');
  assert.ok(css.includes('.joy-toast-container'), 'toast notifications container styles must exist');

  // Wave 2 Assertions (Financial Suite & Skeletons)
  assert.ok(css.includes('.joy-table-cell--flash-up'), 'table ticker flash-up must exist');
  assert.ok(css.includes('.joy-table-cell--flash-down'), 'table ticker flash-down must exist');
  assert.ok(css.includes('.joy-table-th--sortable'), 'table sortable header styles must exist');
  assert.ok(css.includes('.joy-pagination'), 'pagination container styles must exist');
  assert.ok(css.includes('.joy-skeleton'), 'skeleton loader styles must exist');

  // Wave 3 Assertions (Enterprise Polish & A11y)
  assert.ok(css.includes(':focus-visible'), 'WCAG 2.2 focus rings must exist');
  assert.ok(css.includes('.joy-props-table'), 'props documentation table styles must exist');

  // Wave 4 Assertions (Ant Design Parity: Upload, Avatar, Slider, MarkdownViewer, Micro-animations)
  assert.ok(css.includes('.joy-upload'), 'upload styles must exist');
  assert.ok(css.includes('.joy-avatar'), 'avatar styles must exist');
  assert.ok(css.includes('.joy-slider'), 'slider styles must exist');
  assert.ok(css.includes('.joy-markdown'), 'markdown viewer styles must exist');
  assert.ok(css.includes('.joy-button--wave'), 'button wave micro-animation must exist');

  // Wave 5 Assertions (Landing Page Architecture & Enterprise Workflow Suite)
  assert.ok(css.includes('.joy-bento-grid'), 'bento grid styles must exist');
  assert.ok(css.includes('.joy-bento-card--col-6'), 'bento card col-6 must exist');
  assert.ok(css.includes('.joy-bento-card--col-8'), 'bento card col-8 must exist');
  assert.ok(css.includes('.joy-bento-card--col-12'), 'bento card col-12 must exist');
  assert.ok(css.includes('.joy-bento-card--col-span-2'), 'bento card col-span-2 compatibility must exist');
  assert.ok(css.includes('.joy-hero'), 'hero section styles must exist');
  assert.ok(css.includes('.joy-pricing-matrix'), 'pricing matrix styles must exist');
  assert.ok(css.includes('.joy-testimonial-card'), 'testimonial card styles must exist');
  assert.ok(css.includes('.joy-steps'), 'steps workflow styles must exist');
  assert.ok(css.includes('.joy-timeline'), 'timeline audit styles must exist');
  assert.ok(css.includes('.joy-result'), 'result feedback styles must exist');

  // Wave 6 Assertions (Financial Charts & Layout Primitives)
  assert.ok(css.includes('.joy-chart'), 'chart engine styles must exist');
  assert.ok(css.includes('.joy-chart__hud'), 'chart floating HUD styles must exist');
  assert.ok(css.includes('.joy-divider'), 'divider styles must exist');
  assert.ok(css.includes('.joy-flex'), 'flex styles must exist');
  assert.ok(css.includes('.joy-space'), 'space styles must exist');
  assert.ok(css.includes('.joy-splitter'), 'splitter styles must exist');
  assert.ok(css.includes('.joy-statistic'), 'statistic styles must exist');
  assert.ok(css.includes('.joy-tag'), 'tag styles must exist');
  assert.ok(css.includes('.joy-segmented'), 'segmented styles must exist');

  // Wave 7 Assertions (Form Suite & Advanced Data Entry)
  assert.ok(css.includes('.joy-form'), 'form styles must exist');
  assert.ok(css.includes('.joy-input-number'), 'input-number styles must exist');
  assert.ok(css.includes('.joy-rate'), 'rate styles must exist');
  assert.ok(css.includes('.joy-mentions'), 'mentions styles must exist');
  assert.ok(css.includes('.joy-time-picker'), 'time-picker styles must exist');
  assert.ok(css.includes('.joy-transfer'), 'transfer styles must exist');

  // Wave 8 Assertions (Navigation & Feedback Suite)
  assert.ok(css.includes('.joy-menu'), 'menu styles must exist');
  assert.ok(css.includes('.joy-anchor'), 'anchor styles must exist');
  assert.ok(css.includes('.joy-message'), 'message styles must exist');
  assert.ok(css.includes('.joy-notification'), 'notification styles must exist');
  assert.ok(css.includes('.joy-popconfirm'), 'popconfirm styles must exist');
  assert.ok(css.includes('.joy-spin'), 'spin styles must exist');
  // Optical Alignment & Form Suite Polish
  assert.ok(css.includes('justify-content: flex-end'), 'horizontal form labels must be right-aligned');
  assert.ok(css.includes('-webkit-appearance: none'), 'select controls must reset webkit appearance');
  assert.ok(css.includes('.joy-form-item--horizontal .joy-form-item__label::after'), 'horizontal form labels must support colon punctuation');

  // Gate 0: Canonical Brand Invariants
  assert.ok(css.includes('--navy-500: #14253e;'), 'canonical navy-500 token must exist');
  assert.ok(css.includes('--gold-400: #c49a3a;'), 'canonical gold-400 token must exist');
  assert.ok(css.includes('--cream-100: #f8f3e8;'), 'canonical cream-100 token must exist');
  assert.ok(css.includes('--ink-500: #1f1c13;'), 'canonical ink-500 token must exist');
  assert.ok(css.includes('--joy-surface-canvas:'), 'semantic surface-canvas token must exist');
  assert.ok(css.includes('--joy-surface-card:'), 'semantic surface-card token must exist');
  assert.ok(css.includes('--joy-border:'), 'semantic border token must exist');
  assert.ok(css.includes('--joy-text-primary:'), 'semantic text-primary token must exist');
});

test('zero raw OS emojis across all packages source code', () => {
  const EMOJI_REGEX = /[\u2300-\u23FF\u2600-\u27BF\uD800-\uDBFF\uDC00-\uDFFF]/;
  const packagesDir = path.resolve('../');
  const violations = [];

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (/\.(tsx?|svelte|jsx?|css)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (EMOJI_REGEX.test(content)) {
          violations.push(fullPath);
        }
      }
    }
  }

  scanDir(packagesDir);
  assert.strictEqual(violations.length, 0, `Violations of Zero Emoji Policy found in: ${violations.join(', ')}`);
});



