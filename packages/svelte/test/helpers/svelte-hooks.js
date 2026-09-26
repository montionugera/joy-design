import fs from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath } from 'node:url';
import { compile } from 'svelte/compiler';

/** Compile a .svelte source for server-side rendering (lang="ts" blocks are erasable TS that Svelte 5 strips itself). */
export function compileServer(source, filename) {
  return compile(source, { generate: 'server', filename, dev: false });
}

let registered = false;

/**
 * Register (once per process) synchronous in-thread module hooks:
 *  - `load`: `.svelte` files are compiled with svelte/compiler (generate: 'server').
 *  - `resolve`: a relative `./x.js` specifier maps to `./x.ts` when only the `.ts` exists
 *    (components import `./overlay-utils.js`, which is `overlay-utils.ts` on disk).
 * `module.registerHooks` is used instead of `module.register` (no DEP0205 deprecation warning, no worker thread).
 */
export function registerSvelteHooks() {
  if (registered) return;
  registered = true;
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if (/^\.{1,2}\/.*\.js$/.test(specifier) && context.parentURL?.startsWith('file:')) {
        const asJs = new URL(specifier, context.parentURL);
        const asTs = new URL(specifier.replace(/\.js$/, '.ts'), context.parentURL);
        if (!fs.existsSync(fileURLToPath(asJs)) && fs.existsSync(fileURLToPath(asTs))) {
          return nextResolve(asTs.href, context);
        }
      }
      return nextResolve(specifier, context);
    },
    load(url, context, nextLoad) {
      if (url.startsWith('file:') && url.endsWith('.svelte')) {
        const file = fileURLToPath(url);
        const { js } = compileServer(fs.readFileSync(file, 'utf8'), file);
        return { format: 'module', source: js.code, shortCircuit: true };
      }
      return nextLoad(url, context);
    },
  });
}
