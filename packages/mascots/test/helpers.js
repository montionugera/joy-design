// Loads .svelte (compiled for the server), .tsx/.ts (transpiled) and .css (ignored) through Node.
import fs from 'node:fs';
import { createRequire, registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';
import { compile } from 'svelte/compiler';

const require = createRequire(import.meta.url);
const ts = require('typescript');

registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith('.css')) return { format: 'module', source: 'export {};', shortCircuit: true };
    // Stand-in for Vite's asset handling: a .webp import becomes a site-absolute URL (as in the Vite build).
    if (url.endsWith('.webp')) {
      return { format: 'module', source: `export default ${JSON.stringify('/assets/' + url.split('/').pop())};`, shortCircuit: true };
    }
    if (url.endsWith('.svelte')) {
      const file = fileURLToPath(url);
      const { js } = compile(fs.readFileSync(file, 'utf8'), { generate: 'server', filename: file, dev: false });
      return { format: 'module', source: js.code, shortCircuit: true };
    }
    if (url.endsWith('.tsx') || url.endsWith('.ts')) {
      const out = ts.transpileModule(fs.readFileSync(fileURLToPath(url), 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
      }).outputText;
      return { format: 'module', source: out, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});

/** Attribute map of the first tag in `html`, with the style normalised (sorted, no spaces, no trailing ;).
 *  `on*` attributes are dropped: Svelte SSR adds `onerror="this.__e=event"` to <img>, React renders none. */
export function firstTagAttrs(html) {
  const tag = html.match(/<(img|span)\b[^>]*>/)[0];
  const attrs = { tag: tag.match(/^<(\w+)/)[1] };
  for (const m of tag.matchAll(/([\w-]+)="([^"]*)"/g)) {
    const key = m[1].toLowerCase();
    if (!key.startsWith('on')) attrs[key] = m[2];
  }
  if (attrs.style) attrs.style = attrs.style.replace(/\s+/g, '').split(';').filter(Boolean).sort().join(';');
  return attrs;
}
