// Prints {"react": "<html>", "svelte": "<html>"}: the SSR markup of the REAL LandingPage twins with default props.
// Used by apps/storybook-hub/tests/landing-component-page.spec.ts, which runs it in a child process so the test runner's
// module loader never has to load .tsx / .svelte sources itself. Reads sources only; never builds or writes anything.
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const load = (rel) => import(pathToFileURL(path.join(root, rel)).href);

const { loadComponent, requireFromHere } = await load('packages/react/test/helpers/load-tsx.js');
const { renderSvelte } = await load('packages/svelte/test/helpers/render-svelte.js');

const React = requireFromHere('react');
const { renderToStaticMarkup } = requireFromHere('react-dom/server');
const { LandingPage } = loadComponent('LandingPage');

const react = renderToStaticMarkup(React.createElement(LandingPage));
const svelte = await renderSvelte('LandingPage');
process.stdout.write(JSON.stringify({ react, svelte }));
