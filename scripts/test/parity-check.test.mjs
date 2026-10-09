import test from 'node:test';
import assert from 'node:assert/strict';
import { isFlutterExported, checkManifests, runParityCheck, classes } from '../parity-check.mjs';

test('isFlutterExported returns true for existing tokens export', () => {
  // joy_tokens.g.dart is exported in joymify_flutter.dart
  assert.equal(isFlutterExported(process.cwd(), 'JoyThemeTokens'), true);
});

test('isFlutterExported returns false for unexported component', () => {
  assert.equal(isFlutterExported(process.cwd(), 'UnexportedFakeComponentXYZ'), false);
});

test('checkManifests parses manifests and verifies targets', () => {
  const checks = checkManifests(process.cwd(), { triplet: true });
  assert.ok(checks.length > 0, 'manifests must produce checks');

  const buttonReact = checks.find((c) => c.component === 'Button' && c.check.includes('React'));
  const buttonSvelte = checks.find((c) => c.component === 'Button' && c.check.includes('Svelte'));
  const buttonFlutter = checks.find((c) => c.component === 'Button' && c.check.includes('Flutter'));

  assert.ok(buttonReact, 'React check exists for Button');
  assert.equal(buttonReact.status, 'PASS');

  assert.ok(buttonSvelte, 'Svelte check exists for Button');
  assert.equal(buttonSvelte.status, 'PASS');

  assert.ok(buttonFlutter, 'Flutter check exists for Button');
});

test('classes ignores package import specifiers while detecting classes and css variables', () => {
  const sample = `
    import { Check } from '@joymify/icons/react';
    import { Logo } from '@joymify/brand';

    export function Component() {
      return (
        <div className="joy-button joy-button--primary" style={{ color: 'var(--joy-color-navy-900)' }}>
          <Check />
          <Logo />
        </div>
      );
    }
  `;

  const tokens = classes(sample);

  assert.equal(tokens.has('joy-icons'), false, 'must not capture joy-icons from package specifier');
  assert.equal(tokens.has('joy-brand'), false, 'must not capture joy-brand from package specifier');
  assert.equal(tokens.has('joy-button'), true, 'must capture joy-button class');
  assert.equal(tokens.has('joy-button--primary'), true, 'must capture joy-button--primary class');
  assert.equal(tokens.has('--joy-color-navy-900'), true, 'must capture --joy-color-navy-900 css variable');
});

test('runParityCheck passes in default twin mode', () => {
  const result = runParityCheck();
  assert.equal(result.passed, true);
  assert.equal(result.totalViolations, 0);
});
