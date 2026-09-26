// SVG renderers for the Joymify brand kit. Every colour comes from the
// `palette` argument (resolved from --joy-brand-* tokens by build.js) — this
// file must never contain a hex literal. All numeric layout values are
// rounded to 2 decimals so builds are deterministic.

import { MARK, WORDMARK, TAGLINE } from './geometry.js';
import { heroLattice, wordmarkLayout, markScale, round2 } from './layout.js';

function escapeXml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Markup for the diamond mark, in its native 0..32 viewBox coordinate space.
function markGroup(palette, tile) {
  const strokeColor = tile ? palette.markOnTile : palette.mark;
  const innerColor = strokeColor;
  let markup = '';
  if (tile) markup += `<rect width="32" height="32" rx="${MARK.tileRx}" fill="${palette.tile}"/>`;
  markup += `<path d="${MARK.outline}" fill="none" stroke="${strokeColor}" stroke-width="${MARK.outlineWidth}"/>`;
  markup += `<path d="${MARK.inner}" fill="${innerColor}"/>`;
  if (tile) markup += `<circle cx="${MARK.dot.cx}" cy="${MARK.dot.cy}" r="${MARK.dot.r}" fill="${palette.markContrast}"/>`;
  return markup;
}

// Places the mark (native 0..32 space) at (x, y) scaled so it renders at `size`.
function markGroupAt({ palette, tile, x, y, size }) {
  const scale = markScale(size);
  return `<g transform="translate(${round2(x)} ${round2(y)}) scale(${scale})">${markGroup(palette, tile)}</g>`;
}

// Places an outlined glyph (WORDMARK or TAGLINE). Glyph path space has x
// starting at 0 (left edge) and y=0 at the text baseline, so (x, y) here is
// where that baseline-left point lands in the parent coordinate space.
function textGroupAt({ glyph, x, y, scale, color, opacity }) {
  const op = opacity === undefined ? '' : ` fill-opacity="${opacity}"`;
  return `<g transform="translate(${round2(x)} ${round2(y)}) scale(${round2(scale)})"><path d="${glyph.d}" fill="${color}"${op}/></g>`;
}

// Scale factor + rendered width for a glyph outline at a target cap height.
// Rounded once here and reused for every layout computation downstream, so
// the centring/width math always agrees with the transform="scale(...)" that
// actually gets rendered (an unrounded scale used for layout but a rounded
// one in the transform silently drifts the result off-centre).
function scaleGlyph(glyph, targetHeight) {
  const scale = round2(targetHeight / glyph.baseline);
  return { scale, width: round2(glyph.width * scale) };
}

// Baseline y (in the parent coordinate space) that vertically centres a
// glyph of the given scale on a feature whose own centre is at markCenterY.
function glyphBaselineY(markCenterY, glyph, scale) {
  return round2(markCenterY + scale * (glyph.baseline - glyph.height / 2));
}

export function markSvg({ palette, tile = true, size = 32, title = 'Joymify' }) {
  const s = round2(size);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK.viewBox}" width="${s}" height="${s}" role="img">` +
    `<title>${escapeXml(title)}</title>` +
    markGroup(palette, tile) +
    `</svg>`
  );
}

// Lockup height 80: the mark at 48px, x=16 y=16; the wordmark scaled to
// ~40px cap height, starting 16px after the mark, vertically centred on the
// mark. Total width = WORDMARK.width * scale + 96 (16px margin on every
// side of the 48px mark, plus the 16px gap, plus a matching 16px right
// margin after the wordmark).
export function wordmarkSvg({ palette, tone = 'deep' }) {
  const lockupHeightIn = 80;
  const { width, height: lockupHeight, markX, markY, markSize, glyphX, glyphY, glyphScale } = wordmarkLayout({
    height: lockupHeightIn,
    withMark: true,
    // The static asset's own outer whitespace (16px on an 80px lockup) — not part of the
    // mark:gap:glyph ratio, so components pass padding: 0 instead (see layout.js).
    padding: round2(lockupHeightIn * 0.2)
  });

  const isCream = tone === 'cream';
  const wordmarkColor = isCream ? palette.inkOnTile : palette.ink;

  let bg = '';
  if (isCream) bg = `<rect width="${width}" height="${lockupHeight}" fill="${palette.tile}"/>`;

  const markMarkup = markGroupAt({ palette, tile: isCream, x: markX, y: markY, size: markSize });
  const wordmarkMarkup = textGroupAt({ glyph: WORDMARK, x: glyphX, y: glyphY, scale: glyphScale, color: wordmarkColor });

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${lockupHeight}" width="${width}" height="${lockupHeight}" role="img">` +
    `<title>Joymify</title>` +
    bg +
    markMarkup +
    wordmarkMarkup +
    `</svg>`
  );
}

// 1200x630 social card: tile background, a hairline rule inset 48px from
// the bottom, the mark + wordmark lockup (tile colours) roughly centred,
// and the tagline below it at reduced opacity.
export function ogCardSvg({ palette }) {
  const width = 1200;
  const height = 630;

  const markSize = 96;
  const gap = 32;
  const wordmarkTargetHeight = 96;
  const { scale, width: wmWidth } = scaleGlyph(WORDMARK, wordmarkTargetHeight);
  const lockupWidth = round2(markSize + gap + wmWidth);
  const lockupX = round2((width - lockupWidth) / 2);
  const lockupCenterY = 260;

  const markX = lockupX;
  const markY = round2(lockupCenterY - markSize / 2);
  const markCenterY = markY + markSize / 2;
  const wordmarkX = round2(markX + markSize + gap);
  const wordmarkY = glyphBaselineY(markCenterY, WORDMARK, scale);

  const taglineTargetHeight = 36;
  const { scale: taglineScale, width: taglineWidth } = scaleGlyph(TAGLINE, taglineTargetHeight);
  const taglineX = round2((width - taglineWidth) / 2);
  // +80 (not +64): the wordmark's descenders (e.g. the "y" in Joymify) reach
  // well below its baseline, so a small gap here crowds the tagline's cap
  // line against them. +80 clears the descenders with room to spare while
  // staying well above the rule at height - 48.
  const taglineY = round2(lockupCenterY + markSize / 2 + 80);

  const ruleInset = 48;
  const ruleY = round2(height - ruleInset);

  const markMarkup = markGroupAt({ palette, tile: true, x: markX, y: markY, size: markSize });
  const wordmarkMarkup = textGroupAt({ glyph: WORDMARK, x: wordmarkX, y: wordmarkY, scale, color: palette.inkOnTile });
  const taglineMarkup = textGroupAt({
    glyph: TAGLINE,
    x: taglineX,
    y: taglineY,
    scale: taglineScale,
    color: palette.inkOnTile,
    opacity: 0.8
  });

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">` +
    `<title>Joymify</title>` +
    `<rect width="${width}" height="${height}" fill="${palette.tile}"/>` +
    `<line x1="${ruleInset}" y1="${ruleY}" x2="${round2(width - ruleInset)}" y2="${ruleY}" stroke="${palette.markOnTile}" stroke-width="1"/>` +
    markMarkup +
    wordmarkMarkup +
    taglineMarkup +
    `</svg>`
  );
}

// 1600x560 hero banner: tile background with a lattice of the mark's
// outline diamond on a 64px grid, opacity fading from 0.35 at the right
// edge to 0 at 55% width. Purely decorative — no text.
export function heroBannerSvg({ palette }) {
  const { width, height, diamondScale, diamonds: cells } = heroLattice();

  let diamonds = '';
  for (const { x, y, opacity } of cells) {
    diamonds += `<g transform="translate(${x} ${y}) scale(${diamondScale})"><path d="${MARK.outline}" fill="none" stroke="${palette.markOnTile}" stroke-width="0.5" stroke-opacity="${opacity}"/></g>`;
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img">` +
    `<title>Joymify brand banner</title>` +
    `<rect width="${width}" height="${height}" fill="${palette.tile}"/>` +
    diamonds +
    `</svg>`
  );
}
