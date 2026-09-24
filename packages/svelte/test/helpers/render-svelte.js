import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRawSnippet } from 'svelte';
import { render } from 'svelte/server';
import { compileServer, registerSvelteHooks } from './svelte-hooks.js';

registerSvelteHooks();

const componentUrl = (name) => new URL(`../../src/lib/${name}.svelte`, import.meta.url);

/**
 * Compile `src/lib/<name>.svelte` in server mode. Throws on a compile error (bad syntax, invalid runes, ...).
 * Returns the svelte/compiler result so a lane can also assert `result.warnings.length === 0`.
 */
export function compileSvelte(name) {
  const file = fileURLToPath(componentUrl(name));
  return compileServer(fs.readFileSync(file, 'utf8'), file);
}

/**
 * Server-render `src/lib/<name>.svelte` and return the SSR body string.
 * `children` may be a string (rendered as raw HTML inside the default slot snippet) or a ready-made snippet function.
 */
export async function renderSvelte(name, props = {}, { children } = {}) {
  const { default: Component } = await import(componentUrl(name).href);
  const finalProps = { ...props };
  if (typeof children === 'string') {
    finalProps.children = createRawSnippet(() => ({ render: () => children }));
  } else if (typeof children === 'function') {
    finalProps.children = children;
  }
  return render(Component, { props: finalProps }).body;
}
