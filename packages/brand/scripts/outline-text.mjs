#!/usr/bin/env node
// Outline the wordmark and tagline text with opentype.js into static SVG path
// data, so the brand kit never depends on a font being installed at runtime.
//
// Run: pnpm --filter @joymify/brand outline
// Writes: src/outlines.generated.js

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const WORDMARK_FONT = path.resolve(
  root,
  'node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff'
);
const TAGLINE_FONT = path.resolve(
  root,
  'node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-italic.woff'
);

const WORDMARK_TEXT = 'Joymify';
const TAGLINE_TEXT = 'Calm, considered tools for traders, builders, and gamers.';
const FONT_SIZE = 100;

function loadFont(fontPath) {
  const b = fs.readFileSync(fontPath);
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
}

function assertNoNotdef(font, text) {
  const glyphs = font.stringToGlyphs(text);
  for (const glyph of glyphs) {
    if (glyph.index === 0) {
      throw new Error(`Glyph maps to .notdef (index 0) for text "${text}" in font ${font.names?.fontFamily?.en ?? 'unknown'}`);
    }
  }
}

// opentype.js 2.0.0's Path#toPathData has a bug: its internal roundDecimal()
// builds a string like `${decimalPart}e+${places}`, and when a coordinate's
// decimal part is itself tiny float noise (e.g. 1e-14 from unitsPerEm
// scaling), that concatenation produces an invalid numeric string
// ("1e-14e+2"), so Math.round() returns NaN — silently corrupting the path
// data with literal "NaN" tokens. Rounding every coordinate ourselves before
// serializing avoids ever handing it a fractional part in exponential form.
const round6 = (n) => Math.round(n * 1e6) / 1e6;

function outline(fontPath, text) {
  const font = loadFont(fontPath);
  assertNoNotdef(font, text);

  const path = font.getPath(text, 0, 0, FONT_SIZE);
  const bbox = path.getBoundingBox();

  // Translate so the bbox starts at x=0, and round away float noise.
  for (const cmd of path.commands) {
    if ('x' in cmd) cmd.x = round6(cmd.x - bbox.x1);
    if ('x1' in cmd) cmd.x1 = round6(cmd.x1 - bbox.x1);
    if ('x2' in cmd) cmd.x2 = round6(cmd.x2 - bbox.x1);
    if ('y' in cmd) cmd.y = round6(cmd.y);
    if ('y1' in cmd) cmd.y1 = round6(cmd.y1);
    if ('y2' in cmd) cmd.y2 = round6(cmd.y2);
  }

  return {
    d: path.toPathData(2),
    width: Math.round((bbox.x2 - bbox.x1) * 100) / 100,
    height: Math.round((bbox.y2 - bbox.y1) * 100) / 100,
    baseline: Math.round(-bbox.y1 * 100) / 100
  };
}

const WORDMARK = outline(WORDMARK_FONT, WORDMARK_TEXT);
const TAGLINE = outline(TAGLINE_FONT, TAGLINE_TEXT);

const header = `// GENERATED FILE — do not edit by hand.
// Regenerate with: pnpm --filter @joymify/brand outline
// Source: Cormorant Garamond (SIL OFL 1.1), see PROVENANCE.md
`;

const body = `${header}
export const WORDMARK = ${JSON.stringify(WORDMARK, null, 2)};

export const TAGLINE = ${JSON.stringify(TAGLINE, null, 2)};
`;

const outPath = path.resolve(root, 'src/outlines.generated.js');
fs.writeFileSync(outPath, body);
console.log('outline-text: wrote', outPath);
