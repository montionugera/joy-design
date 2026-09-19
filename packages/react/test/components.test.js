import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('React standard library components implement accessible traits and forwardRef contracts', () => {
  const badge = fs.readFileSync(path.resolve('./src/Badge.tsx'), 'utf8');
  assert.ok(badge.includes('joy-badge--${variant}'), 'Badge must render variant classes');

  const input = fs.readFileSync(path.resolve('./src/Input.tsx'), 'utf8');
  assert.ok(input.includes('React.forwardRef'), 'Input must forwardRef to native element');
  assert.ok(input.includes('joy-input-wrapper--error'), 'Input must support error states');

  const sw = fs.readFileSync(path.resolve('./src/Switch.tsx'), 'utf8');
  assert.ok(sw.includes('role="switch"'), 'Switch must implement ARIA switch role');

  const tbl = fs.readFileSync(path.resolve('./src/Table.tsx'), 'utf8');
  assert.ok(tbl.includes('joy-table--${density}'), 'Table must support high-density trading layouts');

  const alert = fs.readFileSync(path.resolve('./src/Alert.tsx'), 'utf8');
  assert.ok(alert.includes('role="alert"'), 'Alert must implement accessible alert role');

  const modal = fs.readFileSync(path.resolve('./src/Modal.tsx'), 'utf8');
  assert.ok(modal.includes('role="dialog"'), 'Modal must implement accessible dialog role');

  const dropdown = fs.readFileSync(path.resolve('./src/Dropdown.tsx'), 'utf8');
  assert.ok(dropdown.includes('role="menu"'), 'Dropdown must implement menu role');

  const tabs = fs.readFileSync(path.resolve('./src/Tabs.tsx'), 'utf8');
  assert.ok(tabs.includes('role="tablist"'), 'Tabs must implement tablist role');

  const tooltip = fs.readFileSync(path.resolve('./src/Tooltip.tsx'), 'utf8');
  assert.ok(tooltip.includes('role="tooltip"'), 'Tooltip must implement tooltip role');
});
