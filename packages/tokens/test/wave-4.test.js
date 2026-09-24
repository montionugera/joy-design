import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptPath = path.resolve(__dirname, '../../../scripts/parity-check.mjs');
const mod = await import(pathToFileURL(scriptPath).href);

function withTempSvelteDir(files, fn) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'joy-svelte-ref-'));
  try {
    fs.mkdirSync(path.join(root, 'packages/svelte/src/lib'), { recursive: true });
    for (const [name, src] of Object.entries(files)) {
      fs.writeFileSync(path.join(root, `packages/svelte/src/lib/${name}.svelte`), src);
    }
    return fn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

const OK = `<script lang="ts">
  let { title = '', ref = $bindable(null), ...rest }: { title?: string; ref?: HTMLElement | null } = $props();
</script>

<section bind:this={ref} class="joy-ok" {...rest}>{title}</section>
`;

const BAD = `<script lang="ts">
  let { title = '' }: { title?: string } = $props();
</script>

<section class="joy-bad">{title}</section>
`;

test('Wave 4 A1 SVELTE_REF_REST is exported, starts empty and the checker is a function', () => {
  assert.ok(Array.isArray(mod.SVELTE_REF_REST), 'SVELTE_REF_REST must be exported as an array');
  assert.strictEqual(typeof mod.checkSvelteRefRest, 'function', 'checkSvelteRefRest must be exported');
  assert.deepStrictEqual(mod.checkSvelteRefRest(path.resolve(__dirname, '../../..')), [], 'the shipped tree has no ref/rest failures');
});

test('Wave 4 A1 checkSvelteRefRest reports exactly the non-compliant file with the right missing entries', () => {
  withTempSvelteDir({ Ok: OK, Bad: BAD }, (root) => {
    assert.deepStrictEqual(mod.checkSvelteRefRest(root, ['Ok', 'Bad']), [
      { component: 'Bad', missing: ['ref', 'restSpread', 'bindThis'] }
    ]);
    assert.deepStrictEqual(mod.checkSvelteRefRest(root, ['Ok']), []);
  });
});

test('Wave 4 A1 checkSvelteRefRest reports each missing piece independently and a missing file', () => {
  withTempSvelteDir(
    {
      NoBind: OK.replace(' bind:this={ref}', ''),
      NoRest: OK.replace(', ...rest', '').replace(' {...rest}', ''),
      NoRef: OK.replace('ref = $bindable(null), ', '').replace(' bind:this={ref}', ' bind:this={el}'),
      // Comments must not satisfy the check.
      Commented: `<script>\n  let { title } = $props();\n  // ref = $bindable(null), ...rest\n</script>\n<!-- bind:this={ref} {...rest} -->\n<p>{title}</p>\n`
    },
    (root) => {
      const byName = Object.fromEntries(
        mod.checkSvelteRefRest(root, ['NoBind', 'NoRest', 'NoRef', 'Commented', 'Gone']).map((f) => [f.component, f.missing])
      );
      assert.deepStrictEqual(byName.NoBind, ['bindThis']);
      assert.deepStrictEqual(byName.NoRest, ['restSpread']);
      assert.deepStrictEqual(byName.NoRef, ['ref', 'bindThis']);
      assert.deepStrictEqual(byName.Commented, ['ref', 'restSpread', 'bindThis']);
      assert.deepStrictEqual(byName.Gone, ['file']);
    }
  );
});

test('Wave 4 A1 runParityCheck turns a Svelte ref/rest failure into a FAIL row in twin and svelte mode but not react mode', () => {
  const root = path.resolve(__dirname, '../../..');
  const original = mod.SVELTE_REF_REST.slice();
  try {
    withTempSvelteDir({ Bad: BAD }, (tmp) => {
      // Real theme.css is needed by runParityCheck; mirror it into the temp tree.
      fs.mkdirSync(path.join(tmp, 'packages/tokens/dist'), { recursive: true });
      fs.copyFileSync(path.join(root, 'packages/tokens/dist/theme.css'), path.join(tmp, 'packages/tokens/dist/theme.css'));
      mod.SVELTE_REF_REST.push('Bad');
      for (const side of [null, 'svelte']) {
        const result = mod.runParityCheck({ rootDir: tmp, side });
        const row = result.checks.find((c) => c.component === 'Bad' && /ref\/rest/.test(c.check));
        assert.ok(row, `side=${side}: a ref/rest row must be reported`);
        assert.strictEqual(row.status, 'FAIL');
        assert.strictEqual(result.passed, false);
        assert.match(mod.formatMarkdownTable(result), /\| Bad \| Svelte ref\/rest \(ref, restSpread, bindThis\) \| FAIL \|/);
      }
      const reactOnly = mod.runParityCheck({ rootDir: tmp, side: 'react' });
      assert.ok(!reactOnly.checks.some((c) => /ref\/rest/.test(c.check)), 'react mode must not run the Svelte check');
    });
  } finally {
    mod.SVELTE_REF_REST.length = 0;
    mod.SVELTE_REF_REST.push(...original);
  }
});
