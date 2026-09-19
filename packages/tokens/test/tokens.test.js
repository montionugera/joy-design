import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('compiled tokens exist and contain critical joy variables and enterprise components', () => {
  const css = fs.readFileSync(path.resolve('./dist/theme.css'), 'utf8');
  assert.ok(css.includes('--joy-color-brand-primary: #7c3aed;'), 'brand primary must exist');
  assert.ok(css.includes('--joy-spacing-4: 16px;'), 'spacing-4 must exist');
  assert.ok(css.includes('--joy-radius-md: 8px;'), 'radius-md must exist');
  assert.ok(css.includes('--joy-motion-duration-fast: 150ms;'), 'motion fast duration must exist');
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
  assert.ok(css.includes('.joy-hero'), 'hero section styles must exist');
  assert.ok(css.includes('.joy-pricing-matrix'), 'pricing matrix styles must exist');
  assert.ok(css.includes('.joy-testimonial-card'), 'testimonial card styles must exist');
  assert.ok(css.includes('.joy-steps'), 'steps workflow styles must exist');
  assert.ok(css.includes('.joy-timeline'), 'timeline audit styles must exist');
  assert.ok(css.includes('.joy-result'), 'result feedback styles must exist');
});



