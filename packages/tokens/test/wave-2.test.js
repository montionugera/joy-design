import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');
const css = fs.readFileSync(path.join(distPath, 'theme.css'), 'utf8');
const dts = fs.readFileSync(path.join(distPath, 'index.d.ts'), 'utf8');
const tokens = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/tokens.json'), 'utf8'));

function blockContains(selector, declaration) {
  return new RegExp(`${selector}\\s*\\{[\\s\\S]*?${declaration}`, 'm').test(css);
}

test('Wave 2 hero button tokens are generated for both themes and typed', () => {
  const tokenKeys = [
    'accent-gradient-end',
    'accent-highlight',
    'elevation-accent-1',
    'elevation-accent-2',
    'elevation-accent-inset'
  ];

  for (const key of tokenKeys) {
    assert.ok(blockContains(':root', `--joy-${key}:`), `${key} must be declared for light theme`);
    assert.ok(blockContains('\\[data-theme="dark"\\]', `--joy-${key}:`), `${key} must be declared for dark theme`);
    assert.ok(dts.includes(`'${key}': string;`), `${key} must be a JoyTokenName member`);
  }

  assert.ok(tokens.color.gold['450'], 'gold-450 primitive token must exist');
});

test('Wave 2 hero button state matrix is compiled without transition-all or duplicate disabled rules', () => {
  for (const selector of [
    '.joy-button--link',
    '.joy-button__label',
    '.joy-button--icon-only.joy-button--md',
    '.joy-button--block',
    'linear-gradient(180deg, var(--joy-accent-default), var(--joy-accent-gradient-end))'
  ]) {
    assert.ok(css.includes(selector), `${selector} must be compiled`);
  }

  const buttonRule = css.match(/\.joy-button\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  assert.ok(buttonRule, '.joy-button rule must exist');
  assert.ok(!buttonRule.includes('transition: all'), '.joy-button must not use transition: all');
  assert.strictEqual((css.match(/\.joy-button:disabled\s*\{/g) ?? []).length, 1, 'exactly one disabled rule is required');
});

test('Wave 2 hero button full state and variant matrix coverage in theme.css', () => {
  const expectedSelectors = [
    '.joy-button',
    '.joy-button:focus:not(:focus-visible)',
    '.joy-button:focus-visible',
    '.joy-button--sm',
    '.joy-button--md',
    '.joy-button--lg',
    '.joy-button--block',
    '.joy-button--icon-only',
    '.joy-button--icon-only.joy-button--sm',
    '.joy-button--icon-only.joy-button--md',
    '.joy-button--icon-only.joy-button--lg',
    '.joy-button__icon',
    '.joy-button__label',
    '.joy-button--loading',
    '.joy-button__spinner',
    '.joy-button__spinner-svg',
    '.joy-button--solid',
    '.joy-button--solid:hover:not(:disabled)',
    '.joy-button--solid:active:not(:disabled)',
    '.joy-button--outline',
    '.joy-button--outline:hover:not(:disabled)',
    '.joy-button--outline:active:not(:disabled)',
    '.joy-button--ghost',
    '.joy-button--ghost:hover:not(:disabled)',
    '.joy-button--ghost:active:not(:disabled)',
    '.joy-button--danger',
    '.joy-button--danger:hover:not(:disabled)',
    '.joy-button--danger:active:not(:disabled)',
    '.joy-button--link',
    '.joy-button--link:hover:not(:disabled)',
    '.joy-button:disabled'
  ];

  for (const selector of expectedSelectors) {
    assert.ok(css.includes(selector), `${selector} must be compiled in theme.css`);
  }

  // Check elevation and lift on solid button
  assert.ok(css.includes('var(--joy-elevation-accent-1)'), 'solid button must use elevation-accent-1');
  assert.ok(css.includes('var(--joy-elevation-accent-2)'), 'solid button hover must use elevation-accent-2');
  assert.ok(css.includes('var(--joy-elevation-accent-inset)'), 'solid button active must use elevation-accent-inset');
  assert.ok(css.includes('var(--joy-accent-highlight)'), 'solid button must include accent-highlight inset shadow');

  // Check touch target height binding
  assert.ok(css.includes('min-height: var(--joy-control-height-sm)'));
  assert.ok(css.includes('min-height: var(--joy-control-height-md)'));
  assert.ok(css.includes('min-height: var(--joy-control-height-lg)'));
});

