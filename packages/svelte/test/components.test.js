import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Svelte 5 standard library components implement Runes and enterprise contracts', () => {
  const badge = fs.readFileSync(path.resolve('./src/lib/Badge.svelte'), 'utf8');
  assert.ok(badge.includes('$props()'), 'Badge must use Svelte 5 $props()');
  assert.ok(badge.includes('joy-badge--{variant}'), 'Badge must support variants');

  const input = fs.readFileSync(path.resolve('./src/lib/Input.svelte'), 'utf8');
  assert.ok(input.includes('$bindable'), 'Input must support two-way binding');
  assert.ok(input.includes('joy-input-wrapper--error'), 'Input must support error states');

  const sw = fs.readFileSync(path.resolve('./src/lib/Switch.svelte'), 'utf8');
  assert.ok(sw.includes('role="switch"'), 'Switch must have accessible ARIA switch role');

  const tbl = fs.readFileSync(path.resolve('./src/lib/Table.svelte'), 'utf8');
  assert.ok(tbl.includes('joy-table--{density}'), 'Table must support high-density trading layouts');

  const alert = fs.readFileSync(path.resolve('./src/lib/Alert.svelte'), 'utf8');
  assert.ok(alert.includes('role="alert"'), 'Alert must have accessible role');

  const modal = fs.readFileSync(path.resolve('./src/lib/Modal.svelte'), 'utf8');
  assert.ok(modal.includes('role="dialog"'), 'Modal must implement dialog role');
  assert.ok(modal.includes('$props()'), 'Modal must use Svelte 5 runes');

  const dropdown = fs.readFileSync(path.resolve('./src/lib/Dropdown.svelte'), 'utf8');
  assert.ok(dropdown.includes('role="menu"'), 'Dropdown must implement menu role');

  const tabs = fs.readFileSync(path.resolve('./src/lib/Tabs.svelte'), 'utf8');
  assert.ok(tabs.includes('role="tablist"'), 'Tabs must implement tablist role');

  const tooltip = fs.readFileSync(path.resolve('./src/lib/Tooltip.svelte'), 'utf8');
  assert.ok(tooltip.includes('role="tooltip"'), 'Tooltip must implement tooltip role');

  // Wave 1 Enterprise Suite assertions
  const select = fs.readFileSync(path.resolve('./src/lib/Select.svelte'), 'utf8');
  assert.ok(select.includes('joy-select'), 'Select must have joy-select class');
  assert.ok(select.includes('$bindable'), 'Select must support bindable value');

  const checkbox = fs.readFileSync(path.resolve('./src/lib/Checkbox.svelte'), 'utf8');
  assert.ok(checkbox.includes('role="checkbox"'), 'Checkbox must implement role=checkbox');
  assert.ok(checkbox.includes('joy-checkbox'), 'Checkbox must have joy-checkbox class');

  const radio = fs.readFileSync(path.resolve('./src/lib/RadioGroup.svelte'), 'utf8');
  assert.ok(radio.includes('role="radiogroup"'), 'RadioGroup must implement role=radiogroup');

  const drawer = fs.readFileSync(path.resolve('./src/lib/Drawer.svelte'), 'utf8');
  assert.ok(drawer.includes('joy-drawer'), 'Drawer must have joy-drawer class');
  assert.ok(drawer.includes('role="dialog"'), 'Drawer must implement role=dialog');

  const toast = fs.readFileSync(path.resolve('./src/lib/Toast.svelte'), 'utf8');
  assert.ok(toast.includes('joy-toast'), 'Toast must have joy-toast class');
  assert.ok(toast.includes('role="status"'), 'Toast must implement role=status');

  // Wave 2 Assertions (Financial Table, Pagination, Skeleton)
  assert.ok(tbl.includes('joy-table-th--sortable'), 'Table must support sortable columns');
  assert.ok(tbl.includes('joy-table-cell--flash-up'), 'Table must support ticker flash up');
  assert.ok(tbl.includes('joy-table-cell--flash-down'), 'Table must support ticker flash down');

  const pagination = fs.readFileSync(path.resolve('./src/lib/Pagination.svelte'), 'utf8');
  assert.ok(pagination.includes('role="navigation"'), 'Pagination must implement role=navigation');
  assert.ok(pagination.includes('joy-pagination'), 'Pagination must have joy-pagination class');
  assert.ok(pagination.includes('$derived'), 'Pagination must use Svelte 5 $derived()');

  const skeleton = fs.readFileSync(path.resolve('./src/lib/Skeleton.svelte'), 'utf8');
  assert.ok(skeleton.includes('role="progressbar"'), 'Skeleton must implement role=progressbar');
  assert.ok(skeleton.includes('joy-skeleton'), 'Skeleton must have joy-skeleton class');
});


