import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

test('Phase B: componentStyles token sweep and design standards', () => {
  const buildJsPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../build.js');
  const content = fs.readFileSync(buildJsPath, 'utf8');

  // Extract componentStyles
  const startMarker = 'const componentStyles = `';
  const endMarker = 'const canonicalVars = [';
  const startIdx = content.indexOf(startMarker);
  assert.ok(startIdx !== -1, 'componentStyles must be found in build.js');
  const endIdx = content.indexOf(endMarker, startIdx);
  assert.ok(endIdx !== -1, 'canonicalVars must be found in build.js');
  const beforeEnd = content.lastIndexOf('`;', endIdx);

  const componentStyles = content.substring(startIdx + startMarker.length, beforeEnd);

  // 1. Zero foreign purple #7c3aed in build.js
  const purpleMatches = content.match(/#7c3aed/gi) || [];
  assert.strictEqual(purpleMatches.length, 0, `Expected 0 #7c3aed in build.js, found ${purpleMatches.length}`);

  // 2. Zero hex literals in componentStyles
  const hexMatches = componentStyles.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  assert.strictEqual(hexMatches.length, 0, `Expected 0 hex literals in componentStyles, found ${hexMatches.length}: ${hexMatches.slice(0, 10).join(', ')}`);

  // 3. Zero rgb/rgba/hsl literals in componentStyles
  const rgbMatches = componentStyles.match(/rgba?\([^)]+\)/gi) || [];
  assert.strictEqual(rgbMatches.length, 0, `Expected 0 rgb/rgba literals in componentStyles, found ${rgbMatches.length}: ${rgbMatches.slice(0, 10).join(', ')}`);

  const hslMatches = componentStyles.match(/hsla?\([^)]+\)/gi) || [];
  assert.strictEqual(hslMatches.length, 0, `Expected 0 hsl literals in componentStyles, found ${hslMatches.length}`);

  // 4. Zero var(--x, <literal>) fallbacks in componentStyles
  const varFallbacks = componentStyles.match(/var\(\s*--joy-[^,)]+,\s*[^)]+\)/g) || [];
  assert.strictEqual(varFallbacks.length, 0, `Expected 0 var fallbacks in componentStyles, found ${varFallbacks.length}: ${varFallbacks.slice(0, 10).join(', ')}`);

  // 5. [data-theme="dark"] .joy-* selectors <= 15
  const darkJoyMatches = content.match(/\[data-theme="dark"\]\s*\.joy/g) || [];
  assert.ok(darkJoyMatches.length <= 15, `Expected <= 15 [data-theme="dark"] .joy selectors, found ${darkJoyMatches.length}`);

  // 6. Zero background-clip: text banned pattern (TOK-020)
  assert.strictEqual(/background-clip:\s*text/i.test(componentStyles), false, 'background-clip: text must be removed');

  // 7. Zero side-stripes >= 2px (TOK-021, TOK-022, TOK-023)
  const sideStripes = componentStyles.match(/border-(left|right):\s*[2-9]px\s+solid/g) || [];
  assert.strictEqual(sideStripes.length, 0, `Expected 0 side-stripes >= 2px, found: ${sideStripes.join(', ')}`);

  // 8. No decorative backdrop-filter except modal/drawer backdrops <= 4px (TOK-024 to TOK-030)
  const backdropFilters = [];
  const bfRegex = /([^{}]+)\{[^{}]*backdrop-filter:\s*([^;]+);[^{}]*\}/g;
  let m;
  while ((m = bfRegex.exec(componentStyles)) !== null) {
    const sel = m[1].trim();
    const val = m[2].trim();
    backdropFilters.push({ selector: sel, value: val });
  }
  for (const bf of backdropFilters) {
    const isAllowedBackdrop = bf.selector.includes('modal') || bf.selector.includes('drawer');
    assert.ok(
      isAllowedBackdrop,
      `Decorative backdrop-filter found on ${bf.selector}: ${bf.value}`
    );
  }

  // 9. Tracked uppercase eyebrows lose text-transform (TOK-031 to TOK-035)
  const bannedEyebrowSelectors = [
    'joy-metric-tile__title',
    'joy-stat-card__label',
    'joy-pricing-card__popular-badge',
    'joy-logo-cloud__title',
    'joy-site-footer__col-title'
  ];
  for (const eyebrow of bannedEyebrowSelectors) {
    const eyebrowRegex = new RegExp(`\\.${eyebrow}[^{]*\\{[^}]*text-transform:\\s*uppercase`, 'i');
    assert.strictEqual(eyebrowRegex.test(componentStyles), false, `${eyebrow} must not have text-transform: uppercase`);
  }
});
