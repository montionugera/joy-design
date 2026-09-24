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
        assert.deepStrictEqual(
          result.checks.filter((c) => c.component === 'Bad'),
          [{ component: 'Bad', check: 'Svelte ref/rest (ref, restSpread, bindThis)', status: 'FAIL' }],
          `side=${side}: exactly one Bad row with the exact missing list`
        );
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

test('Wave 4 A1 checkSvelteRefRest reads the markup only for the rest spread and bind:this', () => {
  withTempSvelteDir(
    {
      // {...rest} only inside <script> is not a spread on an element.
      ScriptOnlyRest: `<script lang="ts">
  let { ref = $bindable(null), ...rest } = $props();
  const merged = { ...rest };
</script>
<section bind:this={ref}>x</section>
`,
      // bind:this={ref} only inside a script string is not a binding.
      ScriptOnlyBind: `<script lang="ts">
  let { ref = $bindable(null), ...rest } = $props();
  const note = 'bind:this={ref}';
</script>
<section {...rest}>x</section>
`,
      // ref = $bindable(null) only in markup is not a destructure.
      MarkupOnlyRef: `<script lang="ts">
  let { ...rest } = $props();
</script>
<section bind:this={ref} {...rest}>ref = $bindable(null)</section>
`
    },
    (root) => {
      const byName = Object.fromEntries(
        mod.checkSvelteRefRest(root, ['ScriptOnlyRest', 'ScriptOnlyBind', 'MarkupOnlyRef']).map((f) => [f.component, f.missing])
      );
      assert.deepStrictEqual(byName.ScriptOnlyRest, ['restSpread']);
      assert.deepStrictEqual(byName.ScriptOnlyBind, ['bindThis']);
      assert.deepStrictEqual(byName.MarkupOnlyRef, ['ref']);
    }
  );
});

test('Wave 4 A1 checkSvelteRefRest accepts the generic $bindable<T>(null) form', () => {
  withTempSvelteDir(
    {
      Generic: OK.replace('$bindable(null)', '$bindable<HTMLElement | null>(null)'),
      Nested: OK.replace('$bindable(null)', '$bindable<Array<HTMLElement> | null>(null)'),
      // A non-null default is still not the contract.
      NotNull: OK.replace('$bindable(null)', '$bindable<HTMLElement | null>(undefined)')
    },
    (root) => {
      assert.deepStrictEqual(mod.checkSvelteRefRest(root, ['Generic', 'Nested', 'NotNull']), [
        { component: 'NotNull', missing: ['ref'] }
      ]);
    }
  );
});

test('Wave 4 A1 checkSvelteRefRest strips JS comments only in script and HTML comments only in markup', () => {
  withTempSvelteDir(
    {
      // An unbalanced "<!--" string in the script must not hide the markup that follows.
      HtmlInScript: `<script lang="ts">
  let { ref = $bindable(null), ...rest } = $props();
  const open = '<!--';
</script>
<section bind:this={ref} {...rest}>x</section>
<!-- closing -->
`,
      // A commented-out markup binding must not count.
      HtmlCommented: `<script lang="ts">
  let { ref = $bindable(null), ...rest } = $props();
</script>
<!-- <section bind:this={ref} {...rest}> -->
<section>x</section>
`,
      // A // comment inside the script must not count as a destructure.
      JsCommented: `<script lang="ts">
  // let { ref = $bindable(null), ...rest } = $props();
  let { title } = $props();
</script>
<section bind:this={ref} {...rest}>{title}</section>
`
    },
    (root) => {
      const byName = Object.fromEntries(
        mod.checkSvelteRefRest(root, ['HtmlInScript', 'HtmlCommented', 'JsCommented']).map((f) => [f.component, f.missing])
      );
      assert.strictEqual(byName.HtmlInScript, undefined, 'a "<!--" string in the script must not hide markup');
      assert.deepStrictEqual(byName.HtmlCommented, ['restSpread', 'bindThis']);
      assert.deepStrictEqual(byName.JsCommented, ['ref']);
    }
  );
});

test('Wave 4 A1 runParityCheck does not double-report a missing Svelte file that COMPONENTS already reports, but does report one that it does not', () => {
  const root = path.resolve(__dirname, '../../..');
  const original = mod.SVELTE_REF_REST.slice();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'joy-svelte-dedupe-'));
  try {
    fs.mkdirSync(path.join(tmp, 'packages/tokens/dist'), { recursive: true });
    fs.copyFileSync(path.join(root, 'packages/tokens/dist/theme.css'), path.join(tmp, 'packages/tokens/dist/theme.css'));
    const inComponents = mod.COMPONENTS[0];
    mod.SVELTE_REF_REST.push(inComponents, 'NotInComponentsGone');
    const { checks } = mod.runParityCheck({ rootDir: tmp, side: 'svelte' });
    assert.deepStrictEqual(
      checks.filter((c) => c.component === inComponents),
      [{ component: inComponents, check: 'svelte file exists', status: 'FAIL' }],
      'the COMPONENTS file-exists row is the only row for a listed component'
    );
    assert.deepStrictEqual(
      checks.filter((c) => c.component === 'NotInComponentsGone'),
      [{ component: 'NotInComponentsGone', check: 'Svelte ref/rest (file)', status: 'FAIL' }]
    );
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
    mod.SVELTE_REF_REST.length = 0;
    mod.SVELTE_REF_REST.push(...original);
  }
});
