import test from 'node:test';
import assert from 'node:assert/strict';
import { isFlutterExported, checkManifests, runParityCheck } from '../parity-check.mjs';

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

test('runParityCheck passes in default twin mode', () => {
  const result = runParityCheck();
  assert.equal(result.passed, true);
  assert.equal(result.totalViolations, 0);
});
