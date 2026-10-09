import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MARK, WORDMARK, heroLattice, wordmarkLayout, markScale } from "../../packages/brand/src/index.js";
import { highlightCodeToHtml } from "../../packages/react/src/syntax-highlighter.ts";
import { renderMermaidToSvg } from "../../packages/react/src/mermaid-renderer.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "dist");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const tokensSrcPath = path.join(
  __dirname,
  "../../packages/tokens/dist/theme.css",
);
const inlinedThemeCss = fs.existsSync(tokensSrcPath)
  ? fs.readFileSync(tokensSrcPath, "utf8")
  : "";

// Extract vector SVGs from @montionugera/joy-icons
const iconsSrcDir = path.join(__dirname, "../../packages/icons/src");
const iconCardsHtml = fs.existsSync(iconsSrcDir)
  ? fs
      .readdirSync(iconsSrcDir)
      .filter((f) => f.endsWith(".svelte"))
      .sort()
      .map((f) => {
        const name = f.replace(".svelte", "");
        const content = fs.readFileSync(path.join(iconsSrcDir, f), "utf8");
        const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/);
        let svg = svgMatch ? svgMatch[0] : "";
        svg = svg
          .replace(/width=\{size\}/g, 'width="24"')
          .replace(/height=\{size\}/g, 'height="24"')
          .replace(/stroke=\{color\}/g, 'stroke="currentColor"')
          .replace(/fill=\{color\}/g, 'fill="currentColor"');
        return `
          <div class="icon-card" onclick="copyIconName('${name}')" title="Click to copy import">
            <div class="icon-preview">${svg}</div>
            <div class="icon-name">${name}</div>
          </div>
        `;
      })
      .join("\n")
  : "";

// Load semantic navigation manifest
const manifestPath = path.join(__dirname, "src/navigation.manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const chevronRight = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;
const chevronDown = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;
const closeIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>`;
const checkIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
const miniSpinner = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;
const star = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12 2 15.1 8.3 22 9.3 17 14.2 18.2 21 12 17.8 5.8 21 7 14.2 2 9.3 8.9 8.3 12 2"/></svg>`;
const spinner = `<span class="joy-button__spinner" aria-hidden="true"><svg class="joy-button__spinner-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.2-8.6"/></svg></span>`;

function renderButtonMatrix() {
  const variants = ["solid", "outline", "ghost", "danger", "link"];
  const sizes = ["sm", "md", "lg"];
  const states = ["default", "hover", "focus", "active", "disabled", "loading"];
  const buttons = variants
    .flatMap((variant) =>
      sizes.flatMap((size) =>
        states.map((state) => {
          const loading = state === "loading";
          const disabled = state === "disabled" ? " disabled" : "";
          const demoClass = state === "hover" ? " joy-button--demo-hover" : state === "focus" ? " joy-button--demo-focus" : "";
          return `<button type="button" class="joy-button joy-button--${variant} joy-button--${size}${loading ? " joy-button--loading" : ""}${demoClass}"${loading ? ' aria-busy="true"' : ""}${disabled} data-state="${state}"><span class="joy-button__label">${variant} ${size} ${state}</span>${loading ? spinner : ""}</button>`;
        }),
      ),
    )
    .join("");

  return `<div class="component-canvas" data-matrix="button" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); gap: var(--joy-space-3);">
    ${buttons}
    <button type="button" class="joy-button joy-button--solid joy-button--md joy-button--icon-only" aria-label="Continue"><span class="joy-button__icon joy-button__icon--end">${chevronRight}</span></button>
    <button type="button" class="joy-button joy-button--solid joy-button--md joy-button--block"><span class="joy-button__label">Block action</span></button>
  </div>`;
}

function renderFormsMatrix() {
  const inputStates = ["default", "error", "success", "disabled", "readonly"];
  const inputSizes = ["sm", "md", "lg"];
  const inputRows = inputSizes
    .flatMap((size) =>
      inputStates.map((state) => {
        const stateClass =
          state === "default" ? "" : ` joy-input-wrapper--${state}`;
        const disabled = state === "disabled" ? " disabled" : "";
        const readonly = state === "readonly" ? " readonly" : "";
        const message =
          state === "error" || state === "success"
            ? `<p class="joy-input-wrapper__message" id="input-${size}-${state}-message">${state === "error" ? "Enter a valid value" : "Value confirmed"}</p>`
            : "";
        return `<div class="joy-input-wrapper joy-input-wrapper--${size}${stateClass}">
      <span class="joy-input-wrapper__prefix" aria-hidden="true">$</span>
      <input class="joy-input" id="input-${size}-${state}" placeholder="${size} ${state}"${disabled}${readonly}${state === "error" ? ' aria-invalid="true" aria-describedby="input-' + size + "-" + state + '-message"' : ""}>
      <span class="joy-input-wrapper__suffix" aria-hidden="true">USD</span>${message}
    </div>`;
      }),
    )
    .join("");

  const numberControl = (
    label,
    state = "",
  ) => `<div><p>${label}</p><div class="joy-input-number joy-input-number--md${state ? ` joy-input-number--${state}` : ""}">
    <input class="joy-input-number__input" type="text" inputmode="decimal" role="spinbutton" aria-valuenow="10" aria-valuemin="1" aria-valuemax="100" value="10">
    <div class="joy-input-number__handler-wrap"><button type="button" class="joy-input-number__handler-up" aria-label="Increase" tabindex="-1">${chevronDown}</button><button type="button" class="joy-input-number__handler-down" aria-label="Decrease" tabindex="-1">${chevronDown}</button></div>
  </div></div>`;
  const option = (text, selected = false, disabled = false) =>
    `<li class="joy-select__option${selected ? " joy-select__option--active" : ""}${disabled ? " joy-select__option--disabled" : ""}" role="option" aria-selected="${selected}"${disabled ? ' aria-disabled="true"' : ""}>${text}</li>`;
  const checkbox = (label, attrs = "", modifier = "") =>
    `<label class="joy-checkbox${modifier}"><input type="checkbox"${attrs}><span class="joy-checkbox__box"></span><span class="joy-checkbox__label">${label}</span></label>`;
  const radio = (label, checked = false, disabled = false) =>
    `<label class="joy-radio${disabled ? " joy-radio--disabled" : ""}"><input type="radio" name="matrix-radio"${checked ? ' checked tabindex="0"' : ' tabindex="-1"'}${disabled ? " disabled" : ""}><span class="joy-radio__circle"></span><span class="joy-radio__label">${label}</span></label>`;
  const switchControl = (
    label,
    checked = false,
    disabled = false,
    size = "md",
  ) =>
    `<button type="button" class="joy-switch joy-switch--${size}${checked ? " joy-switch--checked" : ""}" role="switch" aria-checked="${checked}"${disabled ? " disabled" : ""}><span class="joy-switch__thumb"></span><span class="joy-switch__label">${label}</span></button>`;
  const sheetDemo = (content, sheet = false) =>
    `<div class="hub-sheet-demo"${sheet ? " data-sheet-demo" : ""} style="position: relative; min-height: 360px; transform: translateZ(0);">${content}</div>`;

  return `<div class="component-canvas" data-matrix="forms" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr)); gap: var(--joy-space-3); align-items: start;">
    <section><h3>Input states and sizes</h3>${inputRows}</section>
    <section><h3>InputNumber</h3>${numberControl("Default")}${numberControl("Error", "error")}</section>
    <section><h3>Select</h3>
      <div class="joy-select-wrapper joy-select-wrapper--md"><button type="button" class="joy-select" role="combobox" aria-expanded="false" aria-haspopup="listbox"><span class="joy-select__value">Balanced</span><span class="joy-select__arrow">${chevronDown}</span></button></div>
      <div class="joy-select-wrapper joy-select-wrapper--md joy-select-wrapper--error"><button type="button" class="joy-select" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-invalid="true"><span class="joy-select__placeholder">Choose a strategy</span><span class="joy-select__arrow">${chevronDown}</span></button><p class="joy-select-wrapper__message">Select a strategy</p></div>
      <div class="joy-select-wrapper joy-select-wrapper--md joy-select-wrapper--disabled"><button type="button" class="joy-select" role="combobox" aria-expanded="false" aria-haspopup="listbox" disabled><span class="joy-select__value">Disabled</span><span class="joy-select__arrow">${chevronDown}</span></button></div>
      ${sheetDemo(`<div class="joy-select-wrapper joy-select-wrapper--md joy-select-wrapper--open"><button type="button" class="joy-select" role="combobox" aria-expanded="true" aria-haspopup="listbox" aria-controls="matrix-select-listbox"><span class="joy-select__value">Balanced</span><span class="joy-select__arrow">${chevronDown}</span></button><ul class="joy-select__listbox joy-overlay joy-overlay--sheet" id="matrix-select-listbox" role="listbox">${option("Balanced", true)}${option("Conservative")}${option("Unavailable", false, true)}</ul></div>`, true)}
    </section>
    <section><h3>Checkbox and switch</h3>${checkbox("Unchecked")}${checkbox("Checked", " checked")}${checkbox("Indeterminate", ' data-indeterminate="true"', " joy-checkbox--indeterminate")}${checkbox("Disabled", " disabled", " joy-checkbox--disabled")}${switchControl("Off")}${switchControl("On", true)}${switchControl("Disabled", false, true)}${switchControl("Small", true, false, "sm")}</section>
    <section><h3>RadioGroup and slider</h3><div class="joy-radio-group" role="radiogroup">${radio("Market")}${radio("Limit", true)}</div><div class="joy-radio-group joy-radio-group--vertical joy-radio-group--error" role="radiogroup" aria-invalid="true">${radio("Vertical", true)}${radio("Disabled", false, true)}<p class="joy-radio-group__message">Choose an order type</p></div><div class="joy-slider"><div class="joy-slider__rail"><div class="joy-slider__track" style="width: 60%;"></div><div class="joy-slider__handle" role="slider" tabindex="0" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" aria-disabled="false" style="left: 60%;"><span class="joy-slider__tooltip">60</span></div></div></div></section>
    <section><h3>Rate and segmented</h3><div class="joy-rate" role="radiogroup">${[1, 2, 3, 4, 5].map((value) => `<button type="button" class="joy-rate__star${value <= 3 ? " joy-rate__star--full" : ""}" role="radio" aria-checked="${value === 3}" aria-label="${value} of 5" tabindex="${value === 3 ? "0" : "-1"}">${star}</button>`).join("")}</div><div class="joy-rate joy-rate--readonly" role="radiogroup">${[1, 2, 3, 4, 5].map((value) => `<button type="button" class="joy-rate__star${value <= 3 ? " joy-rate__star--full" : value === 4 ? " joy-rate__star--half" : ""}" role="radio" aria-checked="${value === 3}" aria-label="${value} of 5" tabindex="-1">${star}</button>`).join("")}</div><div class="joy-rate joy-rate--disabled" role="radiogroup">${[1, 2, 3, 4, 5].map((value) => `<button type="button" class="joy-rate__star" role="radio" aria-checked="false" aria-label="${value} of 5" tabindex="-1">${star}</button>`).join("")}</div><div class="joy-segmented" role="radiogroup"><button type="button" class="joy-segmented__item joy-segmented__item--active" role="radio" aria-checked="true" tabindex="0">Daily</button><button type="button" class="joy-segmented__item" role="radio" aria-checked="false" tabindex="-1">Weekly</button><button type="button" class="joy-segmented__item" role="radio" aria-checked="false" tabindex="-1" disabled>Monthly</button></div></section>
    <section><h3>Form layouts</h3><form class="joy-form joy-form--vertical"><div class="joy-form-item joy-form-item--required"><label class="joy-form-item__label" for="vertical-name"><span class="joy-form-item__required">*</span>Name</label><div class="joy-form-item__control"><div class="joy-input-wrapper"><input class="joy-input" id="vertical-name" value="Mina"></div></div></div></form><form class="joy-form joy-form--horizontal joy-form--label-left" style="--joy-form-label-width: 10rem;"><div class="joy-form-item joy-form-item--horizontal joy-form-item--error"><label class="joy-form-item__label" for="horizontal-email"><span class="joy-form-item__required">*</span>Email</label><div class="joy-form-item__control"><div class="joy-input-wrapper joy-input-wrapper--error"><input class="joy-input" id="horizontal-email" aria-invalid="true" value="invalid"></div><p class="joy-form-item__explain" role="alert">Enter a valid email address</p></div></div></form></section>
    <section><h3>Date and time</h3><div class="joy-date-picker joy-date-picker--md"><input class="joy-date-picker__input" type="date" value="2026-09-23"><span class="joy-date-picker__icon" aria-hidden="true">${chevronDown}</span></div><div class="joy-date-range-picker"><div class="joy-date-picker joy-date-picker--md"><input class="joy-date-picker__input" type="date" value="2026-09-23"></div><span class="joy-date-range-picker__sep">to</span><div class="joy-date-picker joy-date-picker--md"><input class="joy-date-picker__input" type="date" value="2026-09-30"></div></div>${sheetDemo(`<div class="joy-time-picker"><div class="joy-input-wrapper"><input class="joy-input" readonly value="09:30"><span class="joy-input-wrapper__suffix">${chevronDown}</span></div><div class="joy-time-picker__panel joy-overlay" role="listbox"><div class="joy-time-picker__column"><button type="button" class="joy-time-picker__cell joy-time-picker__cell--selected" aria-selected="true">09</button><button type="button" class="joy-time-picker__cell" aria-selected="false">10</button></div><div class="joy-time-picker__column"><button type="button" class="joy-time-picker__cell joy-time-picker__cell--selected" aria-selected="true">30</button><button type="button" class="joy-time-picker__cell" aria-selected="false">45</button></div></div></div>`)}</section>
    <section><h3>Mentions</h3>${sheetDemo(`<div class="joy-mentions"><textarea class="joy-textarea joy-mentions__textarea" aria-autocomplete="list" aria-expanded="true" aria-controls="mentions-list">@mi</textarea><ul class="joy-mentions__dropdown joy-overlay" id="mentions-list" role="listbox"><li class="joy-mentions__item joy-mentions__item--active" role="option" aria-selected="true"><span class="joy-mentions__item-label">Mina Lee</span></li><li class="joy-mentions__item" role="option" aria-selected="false"><span class="joy-mentions__item-label">Milo Chen</span></li></ul></div>`)}</section>
    <section><h3>Upload</h3><div class="joy-upload"><input type="file" hidden><div class="joy-upload-dragger" role="button" tabindex="0"><span class="joy-upload-dragger__icon">${chevronDown}</span><p class="joy-upload-dragger__text">Drop a file here</p><p class="joy-upload-dragger__hint">or browse your device</p></div><ul class="joy-upload-list"><li class="joy-upload-list__item"><span class="joy-upload-list__item-icon">${chevronRight}</span><span class="joy-upload-list__item-info">portfolio.csv</span><button type="button" class="joy-upload-list__item-remove" aria-label="Remove portfolio.csv">${closeIcon}</button></li></ul></div></section>
    <section><h3>TreeSelect</h3>${sheetDemo(`<div class="joy-treeselect joy-treeselect--open"><div class="joy-treeselect__control" role="combobox" aria-expanded="true" aria-haspopup="tree" tabindex="0"><span class="joy-treeselect__tags"><span class="joy-treeselect__tag">Research<button type="button" class="joy-treeselect__tag-remove" aria-label="Remove Research">${closeIcon}</button></span></span><button type="button" class="joy-treeselect__clear" aria-label="Clear selection">${closeIcon}</button><span class="joy-treeselect__arrow">${chevronDown}</span></div><div class="joy-treeselect__panel joy-overlay joy-overlay--sheet" role="tree"><div class="joy-treeselect__search-wrapper"><input type="search" class="joy-treeselect__search" placeholder="Search tree..." aria-label="Filter tree"></div><div class="joy-treeselect__node joy-treeselect__node--selected" role="treeitem" aria-expanded="true" aria-selected="true"><button type="button" class="joy-treeselect__node-toggle joy-treeselect__node-toggle--expanded" aria-label="Toggle node">${chevronRight}</button><span class="joy-treeselect__node-checkbox">${checkIcon}</span><span class="joy-treeselect__node-label">Research</span></div><div class="joy-treeselect__node" role="treeitem"><span class="joy-treeselect__indent-spacer"></span><span class="joy-treeselect__node-toggle"></span><span class="joy-treeselect__node-loading">${miniSpinner}</span><span class="joy-treeselect__node-label">Deep Learning</span></div></div></div>`, true)}</section>
    <section><h3>Cascader</h3>${sheetDemo(`<div class="joy-cascader joy-cascader--open"><div class="joy-cascader__control" role="combobox" aria-expanded="true" tabindex="0"><span class="joy-cascader__value">Markets / Futures</span><button type="button" class="joy-cascader__clear" aria-label="Clear selection">${closeIcon}</button><span class="joy-cascader__arrow">${chevronDown}</span></div><div class="joy-cascader__panel joy-overlay joy-overlay--sheet"><div class="joy-cascader__columns"><ul class="joy-cascader__column" role="menu"><li class="joy-cascader__item joy-cascader__item--active" role="menuitem" tabindex="0" aria-expanded="true">Markets<span class="joy-cascader__item-arrow">${chevronRight}</span></li><li class="joy-cascader__item" role="menuitem" tabindex="-1">Equities<span class="joy-cascader__item-arrow">${chevronRight}</span></li></ul><ul class="joy-cascader__column" role="menu"><li class="joy-cascader__item joy-cascader__item--active" role="menuitem" tabindex="-1">Futures</li><li class="joy-cascader__item" role="menuitem" tabindex="-1"><span class="joy-cascader__item-loading">${miniSpinner}</span> Options</li></ul></div></div></div>`, true)}</section>
    <section><h3>Transfer</h3><div class="joy-transfer"><div class="joy-transfer__list"><div class="joy-transfer__header">${checkbox("Source")}<span class="joy-transfer__header-title">Available</span><span class="joy-transfer__header-count">1 item</span></div><div class="joy-transfer__body"><div class="joy-transfer__item joy-transfer__item--selected">${checkbox("Balanced")}</div></div></div><div class="joy-transfer__operations"><button type="button" class="joy-button joy-button--solid joy-button--sm joy-button--icon-only" aria-label="Move right">${chevronRight}</button><button type="button" class="joy-button joy-button--solid joy-button--sm joy-button--icon-only" aria-label="Move left">${chevronRight}</button></div><div class="joy-transfer__list"><div class="joy-transfer__header"><span class="joy-transfer__header-title">Selected</span><span class="joy-transfer__header-count">0 items</span></div><div class="joy-transfer__empty">No selected items</div></div></div></section>
    <section><h3>MarkdownEditor</h3><div class="joy-markdown-editor"><div class="joy-markdown-editor__toolbar" role="toolbar"><button type="button" class="joy-markdown-editor__tool" aria-label="Bold" aria-pressed="true">B</button><button type="button" class="joy-markdown-editor__tool" aria-label="Preview" aria-pressed="false">${chevronRight}</button></div><div class="joy-markdown-editor__panes joy-markdown-editor__panes--split"><textarea class="joy-textarea joy-markdown-editor__textarea"># Review</textarea><div class="joy-markdown-editor__preview"><h4>Review</h4><p>Semantic token coverage.</p></div></div></div></section>
    <script>document.querySelectorAll('[data-indeterminate="true"]').forEach((input) => { input.indeterminate = true; });</script>
  </div>`;
}

// Outline + filled-inner path pair for the diamond mark in a single `color`, shared by every mark
// render site below (the standalone mark preview and the mark embedded in the wordmark) so the two
// can't drift apart.
function markOutlineAndInner(color) {
  return `<path d="${MARK.outline}" fill="none" stroke="${color}" stroke-width="${MARK.outlineWidth}"/><path d="${MARK.inner}" fill="${color}"/>`;
}

// Brand mark: the single inline-<svg> builder for every mark rendered in the hub (the `.brand-logo`
// header sites, the Brand nav icon, and the Brand view's size/tile grid). Mirrors BrandMark.svelte's
// own tile/bare branches exactly (rect + outline + inner + contrast dot when tile, bare outline +
// inner otherwise) so it can never drift from the real component, and geometry always comes from
// @montionugera/joy-brand's MARK with var(--joy-brand-*) fills, never a resolved hex.
// `decorative` drops the img role/label for sites where an adjacent visible label already names the
// mark (the header logos sit next to "Joymify Design" text; the nav icon sits next to its own link
// label) — without it, screen readers would announce "Joymify" twice.
function brandMarkPreview(size, tile, decorative = false) {
  const color = tile ? "var(--joy-brand-mark-on-tile)" : "var(--joy-brand-mark)";
  let markup = "";
  if (tile) markup += `<rect width="32" height="32" rx="${MARK.tileRx}" fill="var(--joy-brand-tile)"/>`;
  markup += markOutlineAndInner(color);
  if (tile) markup += `<circle cx="${MARK.dot.cx}" cy="${MARK.dot.cy}" r="${MARK.dot.r}" fill="var(--joy-brand-mark-contrast)"/>`;
  const label = decorative ? 'aria-hidden="true"' : 'role="img" aria-label="Joymify"';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${MARK.viewBox}" width="${size}" height="${size}" ${label} focusable="false" class="joy-brand-mark">${markup}</svg>`;
}

// Wordmark preview for the Brand view: mirrors Wordmark.svelte's SSR output (padding: 0, the mark
// filling the full lockup height) so the hub demo can never drift from the real component.
function brandWordmarkPreview(tone, height) {
  const { width, markX, markY, markSize, glyphX, glyphY, glyphScale } = wordmarkLayout({ height, withMark: true, padding: 0 });
  const isCream = tone === "cream";
  const glyphColor = isCream ? "var(--joy-brand-ink-on-tile)" : "var(--joy-brand-ink)";
  const markColor = isCream ? "var(--joy-brand-mark-on-tile)" : "var(--joy-brand-mark)";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Joymify" class="joy-wordmark" overflow="visible"><title>Joymify</title><g transform="translate(${markX} ${markY}) scale(${markScale(markSize)})">${markOutlineAndInner(markColor)}</g><path d="${WORDMARK.d}" fill="${glyphColor}" transform="translate(${glyphX} ${glyphY}) scale(${glyphScale})"/></svg>`;
}

// Decorative diamond lattice for the BrandBanner demo: the same grid + right-edge fade as
// BrandBanner.svelte's own <svg>, sourced from the shared heroLattice() helper so the two can
// never drift apart.
function brandBannerLatticeSvg() {
  const lattice = heroLattice();
  const diamonds = lattice.diamonds
    .map(
      (d) =>
        `<g transform="translate(${d.x} ${d.y}) scale(${lattice.diamondScale})"><path d="${MARK.outline}" fill="none" stroke="var(--joy-brand-mark-on-tile)" stroke-width="0.5" stroke-opacity="${d.opacity}"/></g>`,
    )
    .join("");
  return `<svg class="joy-brand-banner__lattice" viewBox="0 0 ${lattice.width} ${lattice.height}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${diamonds}</svg>`;
}

// Every generated file in @montionugera/joy-brand's assets/ folder (mark, wordmark, favicon, hero banner, OG
// card variants): read once here so the Brand view's download links (below) and the dist copy step
// at the end of this file always list the exact same files, with no separate hardcoded list to drift
// out of sync with the folder. The <link rel="icon"> further below is unconditional, so a missing or
// empty folder must fail the build loudly rather than silently ship a 404 favicon and downloads;
// dotfiles (e.g. macOS .DS_Store) and any subfolder are skipped, only regular files are read. Sorted
// into the kit's canonical mark -> favicon -> wordmark -> banner -> OG-card order, since readdirSync's
// own order isn't guaranteed stable across filesystems.
const brandAssetsSrc = path.join(__dirname, "../../packages/brand/assets");
if (!fs.existsSync(brandAssetsSrc)) {
  throw new Error(`Brand assets folder not found: ${brandAssetsSrc}. Run "pnpm --filter @montionugera/joy-brand build" first.`);
}
const brandAssetDisplayOrder = ["mark.svg", "mark-bare.svg", "favicon.svg", "favicon-32.png", "apple-touch-icon.png", "wordmark-cream.svg", "wordmark-deep.svg", "hero-banner.svg", "og-card.svg", "og-card.png"];
const brandAssetFiles = fs
  .readdirSync(brandAssetsSrc, { withFileTypes: true })
  .filter((entry) => entry.isFile() && !entry.name.startsWith("."))
  .map((entry) => entry.name)
  .sort((a, b) => brandAssetDisplayOrder.indexOf(a) - brandAssetDisplayOrder.indexOf(b));

const navIcons = {
  brand: brandMarkPreview(16, false, true),
  overview: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
  tokens: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>`,
  propsSpec: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`,
  button: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="12" rx="4"></rect><line x1="9" y1="12" x2="15" y2="12"></line></svg>`,
  badge: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`,
  input: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`,
  switch: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="5" width="22" height="14" rx="7" ry="7"></rect><circle cx="16" cy="12" r="3"></circle></svg>`,
  alert: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
  metric: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
  table: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line></svg>`,
  modal: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`,
  dropdown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
  tabs: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>`,
  tooltip: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
  select: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
  checkbox: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
  radio: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3" fill="currentColor"></circle></svg>`,
  drawer: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`,
  toast: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><line x1="6" y1="8" x2="18" y2="8"></line><line x1="6" y1="12" x2="14" y2="12"></line></svg>`,
  financialTable: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="9" y1="3" x2="9" y2="6"></line><line x1="9" y1="18" x2="9" y2="21"></line><rect x="6" y="6" width="6" height="12" rx="1"></rect><line x1="17" y1="7" x2="17" y2="10"></line><line x1="17" y1="16" x2="17" y2="19"></line><rect x="14" y="10" width="6" height="6" rx="1"></rect></svg>`,
  pagination: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"></polyline><polyline points="6 17 11 12 6 7"></polyline></svg>`,
  skeleton: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
  datePicker: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  enterpriseDisplay: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
  progress: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  emptyState: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`,
  iconsGallery: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  upload: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
  avatar: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
  slider: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><circle cx="4" cy="12" r="2"></circle><circle cx="12" cy="10" r="2"></circle><circle cx="20" cy="14" r="2"></circle></svg>`,
  markdown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  landing: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
  workflow: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`,
  charts: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>`,
  primitives: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>`,
  forms: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  navigation: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`,
  monitor: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
};

// Generate navigation HTML dynamically from manifest
const navigationHtml = manifest.categories
  .map((cat) => {
    const items = cat.views
      .map((v) => {
        const iconSvg = navIcons[v.icon] || navIcons.overview;
        return `      <a class="nav-item" href="#${v.id}" data-view="${v.id}" data-label="${v.label}">
        <span class="icon">${iconSvg}</span> <span class="nav-item-text">${v.label}</span>
      </a>`;
      })
      .join("\n");
    return `      <div class="nav-section" data-section="${cat.label}">${cat.label}</div>\n${items}`;
  })
  .join("\n\n");

// ── Wave 3 (F-038) aspect views ──────────────────────────────────────────────
// Markup below mirrors the SSR output of the Svelte components (icons are read from @montionugera/joy-icons at
// build time, so the hub demos and the components can never drift on icon geometry).
const iconMarkupCache = {};
function iconSvg(name, size = "1em") {
  if (!iconMarkupCache[name]) {
    const file = path.join(iconsSrcDir, `${name}.svelte`);
    const match = fs.existsSync(file)
      ? fs.readFileSync(file, "utf8").match(/<svg[\s\S]*?<\/svg>/)
      : null;
    if (!match) throw new Error(`Icon ${name} not found in @montionugera/joy-icons`);
    iconMarkupCache[name] = match[0].replace(/\s*\n\s*/g, " ");
  }
  return iconMarkupCache[name]
    .replace("width={size}", `width="${size}"`)
    .replace("height={size}", `height="${size}"`)
    .replace("stroke={color}", 'stroke="currentColor"');
}
// The landing simulator mirrors the components' markup without the icon package's inline style attribute.
const simIcon = (name, size) => iconSvg(name, size).replace(/ style="[^"]*"/, "");
const svgAttrs = (size, sw) =>
  `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
const hubSvg = {
  tagClose: `<svg ${svgAttrs(12, 2.5)}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  check: `<svg ${svgAttrs(16, 2.5)} aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  cross: `<svg ${svgAttrs(16, 2.5)} aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  sortNone: `<svg ${svgAttrs(12, 2)} aria-hidden="true"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></path></svg>`,
  sortAsc: `<svg ${svgAttrs(12, 2)} aria-hidden="true"><polyline points="18 15 12 9 6 15"></polyline></svg>`,
  sortDesc: `<svg ${svgAttrs(12, 2)} aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>`,
  spin: (size) =>
    `<svg class="joy-spin__indicator" ${svgAttrs(size, 2.5)} aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>`,
  resultSuccess: `<svg ${svgAttrs(36, 2.5)}><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  resultError: `<svg ${svgAttrs(36, 2.5)}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  result404: `<svg ${svgAttrs(36, 2)}><circle cx="12" cy="12" r="10"></circle><path d="m4.93 4.93 4.24 4.24"></path><path d="m14.83 9.17 4.24-4.24"></path><path d="m14.83 14.83 4.24 4.24"></path><path d="m9.17 14.83-4.24 4.24"></path><circle cx="12" cy="12" r="4"></circle></svg>`,
};
const statusIcon = { info: "Info", success: "CheckCircle", warning: "AlertTriangle", danger: "AlertCircle", error: "AlertCircle" };

const hubCell = (label, body) => `<div class="hub-matrix__cell"><h4>${label}</h4>${body}</div>`;
const hubCard = (name, title, desc, cells, extra = "") => `<div class="component-card" data-matrix-card="${name}">
    <div class="component-header"><div><div class="component-title">${title}</div><div class="component-desc">${desc}</div></div></div>
    <div class="component-canvas"><div class="hub-matrix${extra}" data-matrix="${name}">${cells}</div></div>
  </div>`;

function renderHubCodeBlock(code, lang, title = "", showLineNumbers = true) {
  const highlighted = highlightCodeToHtml(code, lang);
  const lines = code.split("\n");
  const lineCountHtml = lines.map((_, i) => `<div>${i + 1}</div>`).join("");
  return `
    <div class="joy-code-block" role="region" aria-label="${title || lang + ' code block'}">
      <div class="joy-code-block__header">
        <div class="joy-code-block__meta">
          <span class="joy-code-block__lang">${lang.toUpperCase()}</span>
          ${title ? `<span class="joy-code-block__title">${title}</span>` : ""}
        </div>
        <button type="button" class="joy-code-block__copy-btn" aria-label="Copy code to clipboard" onclick="copyHubCode(this)">
          ${iconSvg("Copy", "14")} Copy
        </button>
        <span class="joy-markdown__status" role="status"></span>
      </div>
      <div class="joy-code-block__wrapper ${showLineNumbers ? "joy-code-block--with-lines" : ""}">
        ${showLineNumbers ? `<div class="joy-code-block__lines" aria-hidden="true">${lineCountHtml}</div>` : ""}
        <pre class="joy-code-block__body"><code>${highlighted}</code></pre>
      </div>
    </div>
  `;
}

function renderHubMermaid(code, title = "") {
  const res = renderMermaidToSvg(code);
  const svg = res.svg || "";
  const displayTitle = title || res.title || "Diagram";
  return `
    <div class="joy-mermaid" role="region" aria-label="${displayTitle}">
      <div class="joy-mermaid__header">
        <div class="joy-mermaid__title">
          <span class="joy-mermaid__badge">MERMAID</span>
          <span>${displayTitle}</span>
        </div>
        <div class="joy-mermaid__actions">
          <button type="button" class="joy-mermaid__btn" aria-label="Show mermaid source code" onclick="hubToggleMermaidView(this)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Source
          </button>
          <button type="button" class="joy-mermaid__btn" aria-label="Copy mermaid definition" onclick="copyHubCode(this)">
            ${iconSvg("Copy", "14")} Copy
          </button>
          <span class="joy-markdown__status" role="status"></span>
        </div>
      </div>
      <div class="joy-mermaid__viewport">
        ${svg}
      </div>
      <div class="joy-mermaid__source" style="display: none;">
        ${renderHubCodeBlock(code, "text", "", false)}
      </div>
    </div>
  `;
}

function renderHubPolyglotTabs(items) {
  const tabsList = items
    .map((item, idx) => {
      const isSelected = idx === 0;
      return `<button type="button" role="tab" class="joy-polyglot-tabs__tab" aria-selected="${isSelected}" tabindex="${isSelected ? 0 : -1}" onclick="hubSelectPolyglotTab(this, '${item.lang}')">${item.label}</button>`;
    })
    .join("");

  const panels = items
    .map((item, idx) => {
      return `<div class="joy-polyglot-tabs__panel-content" data-lang="${item.lang}" style="display: ${idx === 0 ? "block" : "none"};">
        ${renderHubCodeBlock(item.code, item.lang, item.filename, true)}
      </div>`;
    })
    .join("");

  return `
    <div class="joy-polyglot-tabs" role="region" aria-label="Multi-language code tabs">
      <div class="joy-polyglot-tabs__bar">
        <div class="joy-polyglot-tabs__list" role="tablist" aria-label="Programming languages">
          ${tabsList}
        </div>
      </div>
      <div class="joy-polyglot-tabs__panel" role="tabpanel">
        ${panels}
      </div>
    </div>
  `;
}

const hubRustSample = `// Joymify Delta-Neutral Arbitrage Engine
use joymify_quant::{OrderBook, RiskEngine, Venue};

pub async fn execute_arb(symbol: &str, target_spread: f64) -> Result<u64, String> {
    let book = OrderBook::fetch(symbol).await?;
    if book.spread() >= target_spread {
        let order_id = RiskEngine::dispatch_limit(Venue::Hyperliquid, symbol, book.best_bid).await?;
        Ok(order_id)
    } else {
        Err("Spread below threshold".to_string())
    }
}`;

const hubTsSample = `// TypeScript Quantitative Order Router
import { Router, OrderType, type Quote } from '@joymify/quant';

export async function executeHedge(symbol: string, size: number): Promise<Quote> {
  const quote = await Router.getOptimalQuote(symbol, size);
  return Router.dispatch({
    symbol,
    size,
    type: OrderType.LIMIT,
    price: quote.bestAsk,
  });
}`;

const hubPySample = `# Joymify Algorithmic Hedging Worker
import asyncio
from joymify.quant import BookStream, ExecutionPolicy

async def stream_and_hedge(symbol: str, threshold: float = 0.0015):
    async for tick in BookStream(symbol):
        if tick.imbalance > threshold:
            await ExecutionPolicy.rebalance(symbol, target_delta=0.0)`;

const hubFlowchartCode = `flowchart TD
  Client([Trading Terminal]) --> Gateway[Joy API Gateway]
  Gateway --> Auth{Valid Token?}
  Auth -->|Yes| Engine[Quant Execution Engine]
  Auth -->|No| Reject[401 Unauthorized]
  Engine --> OrderDB[(PostgreSQL Ledger)]
  Engine --> L1[(Hyperliquid DEX)]`;

const hubSequenceCode = `sequenceDiagram
  participant Trader
  participant Gateway as Joy Gateway
  participant Engine as Arb Engine
  participant Venue as Exchange L1
  Trader->>Gateway: POST /orders (Arbitrage)
  Gateway->>Engine: Route order intent
  Engine->>Venue: Submit atomic limit
  Venue-->>Engine: 200 OK (Fill Confirmation)
  Engine-->>Gateway: Execution receipt
  Gateway-->>Trader: Stream executed trade`;

const hubAlert = (variant, title, desc, closable = false) =>
  `<div class="joy-alert joy-alert--${variant}" role="alert"><span class="joy-alert__icon" aria-hidden="true">${iconSvg(statusIcon[variant])}</span><div class="joy-alert__body"><div class="joy-alert__title">${title}</div><div class="joy-alert__desc">${desc}</div></div>${closable ? `<button type="button" class="joy-alert__close" aria-label="Dismiss alert" onclick="this.closest('.joy-alert').remove()">${iconSvg("Close")}</button>` : ""}</div>`;
const hubBadge = (variant, label, size = "md", dot = false) =>
  `<span class="joy-badge joy-badge--${variant} joy-badge--${size}">${dot ? '<span class="joy-badge__dot" aria-hidden="true"></span> ' : ""}${label}</span>`;
const hubTag = (color, label, { closable = false, checkable = false, checked = false } = {}) =>
  checkable
    ? `<span class="joy-tag joy-tag--${color} joy-tag--checkable${checked ? " joy-tag--checked" : ""}" role="checkbox" aria-checked="${checked}" tabindex="0" onclick="toggleHubTag(this)" onkeydown="if(event.key===' '||event.key==='Enter'){event.preventDefault();toggleHubTag(this)}">${label}</span>`
    : `<span class="joy-tag joy-tag--${color}" role="status">${label}${closable ? ` <button type="button" class="joy-tag__close" aria-label="Close tag" onclick="this.closest('.joy-tag').remove()">${hubSvg.tagClose}</button>` : ""}</span>`;
const hubAvatar = (name, { size = "md", shape = "circle", status = "none" } = {}) => {
  const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return `<div class="joy-avatar joy-avatar--${shape} joy-avatar--${size}" role="img" aria-label="${name}"><span class="joy-avatar__fallback">${initials}</span>${status !== "none" ? `<span class="joy-avatar__badge joy-avatar__badge--${status}" aria-label="Status: ${status}"></span>` : ""}</div>`;
};
const hubDelta = (cls, text) => {
  const first = text.trim().charAt(0);
  const dir = first === "-" ? "down" : first === "+" ? "up" : "flat";
  const icon = dir === "up" ? iconSvg("TrendingUp") + `<span class="joy-${cls}__sr">Increase: </span>` : dir === "down" ? iconSvg("TrendingDown") + `<span class="joy-${cls}__sr">Decrease: </span>` : "";
  return `${icon}<span>${text}</span>`;
};
const hubProgress = (percent, status = "normal", { showInfo = true, stroke = 8 } = {}) => {
  const info = !showInfo ? "" : status === "success" ? `<span class="joy-progress__text">${hubSvg.check}</span>` : status === "exception" ? `<span class="joy-progress__text">${hubSvg.cross}</span>` : `<span class="joy-progress__text">${percent}%</span>`;
  return `<div class="joy-progress joy-progress--status-${status}" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><div class="joy-progress__outer"><div class="joy-progress__inner"><div class="joy-progress__bg" style="width: ${percent}%; height: ${stroke}px;"></div></div></div>${info}</div>`;
};
const hubResult = (status, icon, title, sub, actions = true) =>
  `<div class="joy-result joy-result--${status}" role="alert"><div class="joy-result__icon">${icon}</div><h2 class="joy-result__title">${title}</h2>${sub ? `<p class="joy-result__subtitle">${sub}</p>` : ""}${actions ? `<div class="joy-result__actions"><button type="button" class="joy-button joy-button--solid joy-button--md">Retry</button><button type="button" class="joy-button joy-button--outline joy-button--md">Back</button></div>` : ""}</div>`;
const hubToast = (variant, msg) =>
  `<div class="joy-toast joy-toast--${variant}" role="status" aria-live="polite"><div class="joy-toast__body">${msg}</div><button type="button" class="joy-toast__close" aria-label="Dismiss notification" onclick="this.closest('.joy-toast').remove()">${iconSvg("Close")}</button></div>`;
const hubMessage = (type, msg) =>
  `<div class="joy-message" role="alert" aria-live="polite"><div class="joy-message__notice"><span class="joy-message__icon joy-message__icon--${type}" aria-hidden="true">${iconSvg(statusIcon[type])}</span><span class="joy-message__content">${msg}</span></div></div>`;
const hubNotification = (type, title, desc) =>
  `<div class="joy-notification" role="alert" aria-live="polite"><div class="joy-notification__notice"><div class="joy-notification__row"><div class="joy-notification__main"><span class="joy-notification__icon joy-notification__icon--${type}" aria-hidden="true">${iconSvg(statusIcon[type])}</span><div><div class="joy-notification__title">${title}</div><div class="joy-notification__desc">${desc}</div></div></div><button type="button" class="joy-notification__close" aria-label="Dismiss notification" onclick="this.closest('.joy-notification').remove()">${iconSvg("Close")}</button></div></div></div>`;

const hubSortTh = (label, sort, align = "left") =>
  `<th style="text-align: ${align}" tabindex="0" aria-sort="${sort}" class="joy-table-th--sortable${sort === "ascending" ? " joy-table-th--sorted-asc" : sort === "descending" ? " joy-table-th--sorted-desc" : ""}" onclick="hubSortTable(this)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();hubSortTable(this)}"><span>${label}</span> <span class="joy-table-sort-icon">${sort === "ascending" ? hubSvg.sortAsc : sort === "descending" ? hubSvg.sortDesc : hubSvg.sortNone}</span></th>`;
const ledgerRows = [
  ["#ORD-8921", "BTC/USDT", "BUY", "67,820.50", "0.45", "FILLED", "success", "14:32", "Phoenix", "0.01%"],
  ["#ORD-8922", "ETH/USDT", "SELL", "3,510.20", "4.20", "FILLED", "success", "14:28", "Phoenix", "0.02%"],
  ["#ORD-8923", "SOL/USDT", "BUY", "184.20", "250.00", "OPEN", "warning", "14:15", "Jupiter", "0.05%"],
  ["#ORD-8924", "AVAX/USDT", "SELL", "28.90", "90.00", "REJECTED", "danger", "14:02", "Jupiter", "0.00%"],
];
const hubLedgerTable = (variant) => {
  const cols = ["Order", "Asset", "Side", "Price", "Size", "Status"];
  const scroll = variant === "scroll";
  const allCols = scroll ? [...cols, "Time", "Venue", "Fee"] : cols;
  const head = allCols
    .map((c, i) => (i === 0 ? hubSortTh(c, "ascending") : i === 3 ? hubSortTh(c, "none", "right") : i === 4 ? hubSortTh(c, "none", "right") : `<th style="text-align: left"><span>${c}</span> </th>`))
    .join("");
  const body = ledgerRows
    .map((r) => {
      const cells = [r[0], r[1], r[2], r[3], r[4], r[5]];
      const extra = [r[7], r[8], r[9]];
      return `<tr>${[...cells, ...(scroll ? extra : [])]
        .map((c, i) => {
          const align = i === 3 || i === 4 ? "right" : "left";
          const inner = i === 5 ? `<span class="joy-badge joy-badge--${r[6]} joy-badge--sm">${c}</span>` : c;
          return `<td data-label="${allCols[i]}" style="text-align: ${align};">${inner}</td>`;
        })
        .join("")}</tr>`;
    })
    .join("");
  return scroll
    ? `<div tabindex="0" role="region" aria-label="Scrollable table" class="joy-table-container joy-table-container--scroll"><table class="joy-table joy-table--compact joy-table--scroll"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`
    : `<div class="joy-table-container joy-table-container--responsive-stack"><table class="joy-table joy-table--compact joy-table--responsive-stack"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
};

const hubChartRegion = (id, label, hudItems, canvasLabel, caption, head, rows, height) =>
  `<div tabindex="0" class="joy-chart" style="height: ${height}px;" role="region" aria-label="${label}"><div class="joy-chart__hud" aria-live="polite">${hudItems}</div><div class="joy-chart__canvas-container" role="img" aria-label="${canvasLabel}"><canvas id="${id}-base" class="joy-chart__canvas-base"></canvas><canvas id="${id}-overlay" class="joy-chart__canvas-overlay"></canvas></div><div class="joy-chart__sr"><table><caption>${caption}</caption><thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div></div>`;
const hubHud = (label, value, cls = "") => `<div class="joy-chart__hud-item"><span class="joy-chart__hud-label">${label}</span> <span class="joy-chart__hud-value${cls ? " joy-chart__hud-value--" + cls : ""}">${value}</span></div>`;

// Deterministic data so the SR table, the HUD and the painted canvas always agree.
const hubMatrixCharts = (() => {
  const bars = Array.from({ length: 8 }, (_, i) => 5 + 3 * Math.abs(Math.sin(i * 1.3)));
  let price = 68200;
  const candles = Array.from({ length: 16 }, (_, i) => {
    const open = price;
    const close = open + Math.sin(i * 0.9) * 90 + (i % 3 === 0 ? -40 : 30);
    const high = Math.max(open, close) + 35 + (i % 4) * 8;
    const low = Math.min(open, close) - 30 - (i % 3) * 9;
    price = close;
    return { open, high, low, close };
  });
  return { bars, candles };
})();
const firstCandle = hubMatrixCharts.candles[0];
const lastCandle = hubMatrixCharts.candles[hubMatrixCharts.candles.length - 1];

function renderDisplayView() {
  const variants = ["info", "success", "warning", "danger"];
  const alertCards = hubCard(
    "alert", "Alert", "Four semantic variants, each with its icon; description-only and closable forms.",
    variants.map((v) => hubCell(v, hubAlert(v, `${v[0].toUpperCase()}${v.slice(1)} title`, "Real-time feed connects over a high-throughput WebSocket."))).join("") +
      hubCell("closable", hubAlert("danger", "API disconnected", "Retrying in 5s. Dismiss to hide.", true)) +
      hubCell("description only", `<div class="joy-alert joy-alert--info" role="alert"><span class="joy-alert__icon" aria-hidden="true">${iconSvg("Info")}</span><div class="joy-alert__body"><div class="joy-alert__desc">Description-only alert body.</div></div></div>`),
  );
  const badgeVariants = ["brand", "success", "warning", "danger", "neutral"];
  const badgeCard = hubCard(
    "badge", "Badge", "Variants, sizes and the status dot.",
    hubCell("variants", `<div class="hub-row">${badgeVariants.map((v) => hubBadge(v, v)).join("")}</div>`) +
      hubCell("sizes", `<div class="hub-row">${hubBadge("brand", "small", "sm")}${hubBadge("brand", "medium", "md")}</div>`) +
      hubCell("with dot", `<div class="hub-row">${badgeVariants.map((v) => hubBadge(v, v, "md", true)).join("")}</div>`),
  );
  const tagColors = ["default", "primary", "success", "warning", "danger"];
  const tagCard = hubCard(
    "tag", "Tag", "Colours, closable and checkable (click or press Space).",
    hubCell("colors", `<div class="hub-row">${tagColors.map((c) => hubTag(c, c)).join("")}</div>`) +
      hubCell("closable", `<div class="hub-row">${hubTag("primary", "Alpha-1", { closable: true })}${hubTag("success", "Live", { closable: true })}</div>`) +
      hubCell("checkable", `<div class="hub-row">${hubTag("default", "Spot", { checkable: true, checked: true })}${hubTag("default", "Perps", { checkable: true })}${hubTag("primary", "Options", { checkable: true, checked: true })}</div>`),
  );
  const avatarCard = hubCard(
    "avatar", "Avatar and AvatarGroup", "Sizes, shapes, presence status and the +N overflow.",
    hubCell("sizes", `<div class="hub-row">${["sm", "md", "lg"].map((s) => hubAvatar("Jane Doe", { size: s })).join("")}</div>`) +
      hubCell("shapes and status", `<div class="hub-row">${hubAvatar("Ada Lovelace", { status: "online" })}${hubAvatar("Alan Turing", { shape: "square", status: "offline" })}</div>`) +
      hubCell("group with overflow", `<div class="joy-avatar-group">${["Ada Lovelace", "Alan Turing", "Grace Hopper"].map((n) => hubAvatar(n)).join("")}<div class="joy-avatar joy-avatar--circle joy-avatar--md joy-avatar-group__overflow" role="img" aria-label="2 more">+2</div></div>`),
  );
  const statCard = hubCard(
    "statistic", "Statistic, MetricTile and StatCard", "Trend arrows are inline SVG; direction comes from the delta sign, tone only sets colour.",
    hubCell("Statistic", `<div class="joy-statistic"><div class="joy-statistic__title">Volume</div><div class="joy-statistic__content"><span class="joy-statistic__prefix">$</span> <span class="joy-statistic__value">1234.50</span> <span class="joy-statistic__suffix">USD</span></div></div>`) +
      [["up", "Portfolio Sharpe", "2.84", "+14.2% vs benchmark"], ["down", "Max drawdown", "-4.12%", "-0.5% this session"], ["neutral", "Active strategies", "12", "3 pending review"]]
        .map(([t, title, value, change]) => hubCell(`MetricTile ${t}`, `<div class="joy-metric-tile joy-metric-tile--${t}"><div class="joy-metric-tile__title">${title}</div><div class="joy-metric-tile__value">${value}</div><div class="joy-metric-tile__change">${t === "up" ? iconSvg("TrendingUp") + '<span class="joy-metric-tile__sr">Increase: </span>' : t === "down" ? iconSvg("TrendingDown") + '<span class="joy-metric-tile__sr">Decrease: </span>' : ""}<span>${change}</span></div></div>`)).join("") +
      [["positive", "Portfolio Value", "$1,429,850", "+14.2% (30d)"], ["critical", "Max Drawdown", "1.84%", "-0.4% from peak"], ["info", "Active Workers", "32 Nodes", "99.99% uptime"]]
        .map(([tone, label, value, delta]) => hubCell(`StatCard ${tone}`, `<div class="joy-stat-card"><div class="joy-stat-card__label">${label}</div><div class="joy-stat-card__value">${value}</div><div class="joy-stat-card__delta joy-stat-card__delta--${tone}">${hubDelta("stat-card", delta)}</div></div>`)).join(""),
  );
  const progressCard = hubCard(
    "progress", "Progress", "role=progressbar on the root; success and exception swap the percentage for an icon.",
    hubCell("default", hubProgress(60)) + hubCell("success", hubProgress(100, "success")) + hubCell("exception", hubProgress(40, "exception")) + hubCell("no info, thick", hubProgress(72, "normal", { showInfo: false, stroke: 12 })),
  );
  const loadingCard = hubCard(
    "skeleton", "Skeleton and Spin", "Loading placeholders and indicators.",
    hubCell("text lines", `<div role="progressbar" aria-busy="true" aria-label="Loading text"><div class="joy-skeleton joy-skeleton--text"></div><div class="joy-skeleton joy-skeleton--text"></div><div class="joy-skeleton joy-skeleton--text" style="width: 70%;"></div></div>`) +
      hubCell("circle and rect", `<div class="hub-row"><div class="joy-skeleton joy-skeleton--circle" role="progressbar" aria-busy="true" aria-label="Loading avatar"></div><div class="joy-skeleton joy-skeleton--rect" role="progressbar" aria-busy="true" aria-label="Loading card" style="height: 64px; flex: 1;"></div></div>`) +
      hubCell("Spin", `<div class="hub-row">${[["sm", 16], ["md", 24], ["lg", 36]].map(([s, px]) => `<div class="joy-spin" role="status" aria-busy="true">${hubSvg.spin(px)}<span class="joy-spin__tip">${s}</span></div>`).join("")}</div>`),
    "",
  );
  const imageCard = hubCard(
    "image", "Image", "Previewable wrapper (role=button, Enter or Space opens the preview), the hover and focus overlay, a plain non-previewable image and the load-error fallback. Pictures are painted from theme tokens.",
    hubCell("previewable (hover or focus)", hubImage({ kind: "a", index: 0 })) +
      hubCell("overlay shown", hubImage({ kind: "b", index: 1, hover: true, alt: "Depth heatmap" })) +
      hubCell("not previewable", hubImage({ kind: "a", preview: false })) +
      hubCell("fallback after load error", hubImage({ broken: true, preview: false, alt: "Missing chart" })),
  );
  const imagePreviewCard = hubCard(
    "image-preview", "ImagePreview", "Modal-layer mask with a labelled toolbar (zoom, rotate, reset, close); a gallery adds a counter and previous/next. Escape or the close button dismisses it and returns focus to the opener.",
    hubCell("single image", `<button type="button" class="joy-button joy-button--solid joy-button--md" data-open="image-preview" aria-haspopup="dialog" onclick="openImagePreview(0, false)">Open preview</button>`) +
      hubCell("gallery", `<button type="button" class="joy-button joy-button--outline joy-button--md" data-open="image-gallery" aria-haspopup="dialog" onclick="openImagePreview(0, true)">Open gallery</button>`),
  );
  const emptyCard = hubCard(
    "empty-state", "EmptyState", "Title, description and an action slot.",
    hubCell("empty", `<div class="joy-empty-state"><h3 class="joy-empty-state__title">No open orders</h3><p class="joy-empty-state__desc">Orders you place will appear here.</p><div class="joy-empty-state__action"><button type="button" class="joy-button joy-button--solid joy-button--md">New order</button></div></div>`),
  );
  const resultCard = hubCard(
    "result", "Result", "Outcome states with an icon, title, optional subtitle and actions.",
    hubCell("success", hubResult("success", hubSvg.resultSuccess, "Batch dispatched", "42 orders routed with zero rejections.")) +
      hubCell("error", hubResult("error", hubSvg.resultError, "Margin limit exceeded", "Deposit funds or reduce the lot size.")) +
      hubCell("404", hubResult("404", hubSvg.result404, "Page not found", "", false)),
  );
  const feedbackCard = hubCard(
    "feedback", "Toast, Message and Notification", "Static states (the live triggers live on the Toast view); fixed positioning is neutralised here so every state stays in flow.",
    variants.map((v) => hubCell(`Toast ${v}`, hubToast(v, `${v} toast message`))).join("") +
      ["info", "success", "warning", "error"].map((t) => hubCell(`Message ${t}`, hubMessage(t, `${t} message`))).join("") +
      ["info", "success", "warning", "error"].map((t) => hubCell(`Notification ${t}`, hubNotification(t, `${t[0].toUpperCase()}${t.slice(1)} notification`, "Longer description for the notification card."))).join(""),
    " hub-static-feedback",
  );
  const tableCard = hubCard(
    "table", "Table", "Default stacks into labelled cards on phones; the scroll variant keeps columns and pins the first one. Headers are sortable (click or Enter).",
    hubCell("responsive stack (default)", hubLedgerTable("stack")) + hubCell("scroll variant, sticky first column", hubLedgerTable("scroll")),
    " hub-matrix--stack",
  );
  const chartCard = hubCard(
    "chart", "Charts", "HUD, region and canvas-summary markup of BarChart and CandlestickChart; canvases are painted from theme tokens.",
    hubCell("BarChart", hubChartRegion("hub-bar", "Interactive Bar Chart. Use arrow keys to pan, plus and minus to zoom, 0 to reset.", hubHud("Interactive", "Bar Series") + hubHud("Peak", Math.max(...hubMatrixCharts.bars).toFixed(2), "accent"), `Bar chart, 1 series, ${hubMatrixCharts.bars.length} points`, `Revenue: ${hubMatrixCharts.bars.length} points`, ["Category", "Value"], hubMatrixCharts.bars.map((v, i) => `<tr><th scope="row">${i + 1}</th><td>${v.toFixed(2)}</td></tr>`).join(""), 240)) +
      hubCell("CandlestickChart", hubChartRegion("hub-candle", "Interactive Candlestick Financial Chart. Use arrow keys to pan, plus and minus to zoom, 0 to reset.", hubHud("Pair:", "BTC/USDT") + hubHud("C:", lastCandle.close.toFixed(2), lastCandle.close >= lastCandle.open ? "bull" : "bear") + hubHud("Chg:", `${(((lastCandle.close - firstCandle.open) / firstCandle.open) * 100).toFixed(2)}%`, lastCandle.close >= firstCandle.open ? "bull" : "bear"), `Candlestick chart, ${hubMatrixCharts.candles.length} candles`, `Candlestick data: ${hubMatrixCharts.candles.length} candles`, ["Time", "Open", "High", "Low", "Close"], hubMatrixCharts.candles.map((c, i) => `<tr><th scope="row">T+${i}m</th><td>${c.open.toFixed(2)}</td><td>${c.high.toFixed(2)}</td><td>${c.low.toFixed(2)}</td><td>${c.close.toFixed(2)}</td></tr>`).join(""), 240)),
    " hub-matrix--stack",
  );
  return `<section id="view-data-display-feedback" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Data Display & Feedback</h2>
        <p class="header-tagline">State matrices for the display and feedback components: Alert, Badge, Tag, Avatar, Statistic and KPI tiles, Progress, Skeleton, Spin, EmptyState, Result, Toast, Message, Notification, Table and charts.</p>
        ${alertCards}${badgeCard}${tagCard}${avatarCard}${imageCard}${imagePreviewCard}${statCard}${progressCard}${loadingCard}${emptyCard}${resultCard}${feedbackCard}${tableCard}${chartCard}
      </section>`;
}

// Same windowing rule as packages/svelte/src/lib/pagination-utils.ts (siblings = 1).
function hubPageWindow(current, last) {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const left = Math.max(current - 1, 1);
  const right = Math.min(current + 1, last);
  const showStart = left > 3;
  const showEnd = right < last - 2;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  if (!showStart && showEnd) return [...range(1, 5), "…", last];
  if (showStart && !showEnd) return [1, "…", ...range(last - 4, last)];
  return [1, "…", ...range(left, right), "…", last];
}
const hubPager = (current, last, { compact = false, sizeChanger = false, total = last * 10, id = "" } = {}) => {
  const pages = compact ? [current] : hubPageWindow(current, last);
  const btn = (aria, inner, extra = "", attrs = "") => `<button type="button" class="joy-pagination__btn${extra}" aria-label="${aria}"${attrs}>${inner}</button>`;
  return `<nav class="joy-pagination"${id ? ` id="${id}"` : ""} role="navigation" aria-label="Pagination">${btn("Previous page", iconSvg("ChevronLeft"), "", current <= 1 ? " disabled" : "")}${pages
    .map((p) => (p === "…" ? '<span class="joy-pagination__ellipsis" aria-hidden="true">…</span>' : btn(`Page ${p}`, p, p === current ? " joy-pagination__btn--active" : "", p === current ? ' aria-current="page"' : "")))
    .join("")}${btn("Next page", iconSvg("ChevronRight"), "", current >= last ? " disabled" : "")}${sizeChanger ? '<select class="joy-select joy-pagination__size" aria-label="Items per page"><option value="10" selected>10 / page</option><option value="20">20 / page</option><option value="50">50 / page</option></select>' : ""}${compact ? "" : `<span class="joy-pagination__info">Total: ${total} items</span>`}</nav>`;
};

const hubTabs = (id, tabs, active = 0) =>
  `<div class="joy-tabs-container" data-hub-tabs><div class="joy-tabs" role="tablist" aria-orientation="horizontal">${tabs
    .map((t, i) => `<button type="button" role="tab" id="${id}-tab-${i}" aria-selected="${i === active}" aria-controls="${id}-panel-${i}" tabindex="${i === active ? 0 : -1}" class="joy-tab-btn${i === active ? " joy-tab-btn--active" : ""}" onclick="hubSelectTab(this)" onkeydown="hubTabKey(event,this)">${t.label}</button>`)
    .join("")}</div>${tabs
    .map((t, i) => `<div class="joy-tab-content" role="tabpanel" id="${id}-panel-${i}" aria-labelledby="${id}-tab-${i}"${i === active ? "" : " hidden"}>${t.content || ""}</div>`)
    .join("")}</div>`;

const hubMenuItem = (label, { icon = "", active = false, disabled = false } = {}) =>
  `<li class="joy-menu__item${active ? " joy-menu__item--active" : ""}${disabled ? " joy-menu__item--disabled" : ""}" role="menuitem"${active ? ' aria-current="page"' : ""}${disabled ? ' aria-disabled="true"' : ""} tabindex="${active ? 0 : -1}"${disabled ? "" : ' onclick="selectMenuItem(this)"'}>${icon ? `<span class="joy-menu__item-icon">${iconSvg(icon, "15")}</span>` : ""}<span class="joy-menu__item-text">${label}</span></li>`;

const hubStepItem = (state, idx, title, desc = "", stepNo = 0) =>
  `<div class="joy-steps__item joy-steps__item--${state}" role="button" tabindex="0"${state === "process" || state === "error" ? ' aria-current="step"' : ""}${stepNo >= 0 ? ` onclick="setDemoStep(${idx})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();setDemoStep(${idx})}"` : ""}><div class="joy-steps__icon">${state === "finish" ? hubSvg.check : state === "error" ? hubSvg.cross : idx + 1}</div><div class="joy-steps__content"><div class="joy-steps__title">${title}</div>${desc ? `<div class="joy-steps__desc">${desc}</div>` : ""}</div></div>`;

const hubSplitter = (layout, first, second, height = 180, id = "") =>
  `<div class="joy-splitter joy-splitter--${layout}"${id ? ` id="${id}"` : ""} role="group" aria-label="Resizable Splitter Panel" style="${layout === "horizontal" ? `height: ${height}px;` : ""}"><div class="joy-splitter__pane" style="--joy-splitter-size: 40;"><div class="hub-pane">${first}</div></div><div class="joy-splitter__bar" role="separator" aria-label="Resize panes" aria-orientation="${layout === "horizontal" ? "vertical" : "horizontal"}" aria-valuenow="40" aria-valuemin="10" aria-valuemax="90" tabindex="0" data-hub-splitter></div><div class="joy-splitter__pane" style="--joy-splitter-size: 60;"><div class="hub-pane">${second}</div></div></div>`;

const hubImageOverlay = (extra = "") => `<div class="joy-image__overlay"${extra}>${iconSvg("Eye", "16")}<span>Preview</span></div>`;
const hubImage = ({ kind = "a", preview = true, index = 0, hover = false, broken = false, w = 160, h = 120, alt = "Order flow chart" } = {}) =>
  `<div class="joy-image-wrapper${preview ? " joy-image-wrapper--previewable" : ""}" style="width: ${w}px; height: ${h}px;"${preview ? ` role="button" tabindex="0" data-open="image-preview" onclick="openImagePreview(${index}, false)" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openImagePreview(${index}, false)}"${hover ? "" : ` onpointerenter="hubImageHover(this, true)" onpointerleave="hubImageHover(this, false)" onfocusin="hubImageHover(this, true)" onfocusout="hubImageHover(this, false)"`}` : ""}><img class="joy-image__img" alt="${alt}" data-hub-img="${broken ? "broken" : kind}"${broken ? ` src="data:image/gif;base64,AAAA"` : ""}>${preview && hover ? hubImageOverlay(" data-static") : ""}</div>`;

const hubTimelineItem = (status, title, desc, time) =>
  `<li class="joy-timeline__item"><div class="joy-timeline__dot joy-timeline__dot--${status}"></div><div class="joy-timeline__content"><div class="joy-timeline__title">${title}</div><div class="joy-timeline__description">${desc}</div><div class="joy-timeline__time">${time}</div></div></li>`;

const hubDropdown = (id) => {
  const item = (key, label, cls = "") => `<button type="button" role="menuitem" class="joy-dropdown__item${cls}" onclick="selectHubDropdownItem(this, '${key}')">${label}</button>`;
  return `<div class="joy-dropdown-wrapper"><div class="joy-dropdown-trigger" role="button" tabindex="0" aria-haspopup="menu" aria-expanded="false" aria-controls="${id}" onclick="toggleHubDropdown(this)" onkeydown="if(event.key==='Enter'||event.key===' '||event.key==='ArrowDown'){event.preventDefault();toggleHubDropdown(this)}"><span class="joy-button joy-button--outline joy-button--md">Strategy options ${iconSvg("ChevronDown", "12")}</span></div><div id="${id}" class="joy-dropdown" role="menu" tabindex="-1" aria-orientation="vertical" data-hub-panel hidden>${item("dup", "Duplicate strategy")}${item("csv", "Export CSV")}${item("arch", "Archive strategy", " joy-dropdown__item--danger")}<button type="button" role="menuitem" class="joy-dropdown__item" disabled>Locked action</button></div></div>`;
};

const hubDropdownSearchable = (id) => {
  const item = (key, label, cls = "") => `<button type="button" role="menuitem" class="joy-dropdown__item${cls}" onclick="selectHubDropdownItem(this, '${key}')">${label}</button>`;
  const items = [
    item("twap", "TWAP Strategy (Time-Weighted)"),
    item("vwap", "VWAP Strategy (Volume-Weighted)"),
    item("pov", "POV Percentage of Volume"),
    item("iceberg", "Iceberg Hidden Reserve"),
    item("sniper", "Sniper Immediate Execution"),
    item("grid", "Grid Trading Quantitative"),
    item("dca", "Dollar Cost Averaging"),
    item("arbitrage", "Cross-Exchange Arbitrage"),
  ].join("");

  return `<div class="joy-dropdown-wrapper">
    <div class="joy-dropdown-trigger" role="button" tabindex="0" aria-haspopup="menu" aria-expanded="false" aria-controls="${id}" onclick="toggleHubDropdown(this)" onkeydown="if(event.key==='Enter'||event.key===' '||event.key==='ArrowDown'){event.preventDefault();toggleHubDropdown(this)}">
      <span class="joy-button joy-button--outline joy-button--md">Algorithmic Strategies (8 options) ${iconSvg("ChevronDown", "12")}</span>
    </div>
    <div id="${id}" class="joy-dropdown" role="menu" tabindex="-1" aria-orientation="vertical" data-hub-panel hidden>
      <div class="joy-dropdown__search-wrapper">
        <input type="search" class="joy-dropdown__search" placeholder="Search strategies..." aria-label="Search actions" oninput="filterHubDropdown(this, '${id}')" onclick="event.stopPropagation()">
      </div>
      <div class="joy-dropdown__items" style="max-height: 200px; overflow-y: auto;">
        ${items}
      </div>
      <div class="joy-dropdown__empty" style="display: none; padding: 12px; text-align: center; color: var(--joy-text-secondary); font-size: var(--joy-font-size-sm);">No matching strategies</div>
    </div>
  </div>`;
};

const hubSelectSearchable = (wrapperId, listboxId) => {
  const options = [
    { value: "btc", label: "BTC / USDT (Bitcoin Perp)" },
    { value: "eth", label: "ETH / USDT (Ethereum Perp)" },
    { value: "sol", label: "SOL / USDT (Solana Perp)" },
    { value: "bnb", label: "BNB / USDT (Binance Coin)" },
    { value: "xrp", label: "XRP / USDT (Ripple Perp)" },
    { value: "ada", label: "ADA / USDT (Cardano Perp)" },
    { value: "avax", label: "AVAX / USDT (Avalanche Perp)" },
    { value: "link", label: "LINK / USDT (Chainlink Perp)" },
  ];
  const renderedOptions = options
    .map((o, idx) => `<li class="joy-select__option${idx === 0 ? " joy-select__option--active" : ""}" role="option" aria-selected="${idx === 0}" onclick="selectHubOption(this, '${wrapperId}', '${o.label}')">${o.label}</li>`)
    .join("");

  return `<div class="joy-select-wrapper joy-select-wrapper--md" id="${wrapperId}" style="position: relative;">
    <button type="button" class="joy-select" role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-controls="${listboxId}" onclick="toggleHubSelect(this)">
      <span class="joy-select__value">${options[0].label}</span>
      <span class="joy-select__arrow">${chevronDown}</span>
    </button>
    <div class="joy-select__listbox joy-overlay" id="${listboxId}" role="listbox" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: var(--joy-z-dropdown); background: var(--joy-surface-raised); border: 1px solid var(--joy-border-default); border-radius: var(--joy-radius-md); box-shadow: var(--joy-elevation-3); overflow: hidden;">
      <div class="joy-select__search-wrapper" style="padding: 8px; border-bottom: 1px solid var(--joy-border-subtle); background: var(--joy-surface-sunken);">
        <input type="search" class="joy-select__search" placeholder="Search trading pairs..." aria-label="Filter options" oninput="filterHubSelect(this, '${listboxId}')" onclick="event.stopPropagation()" style="width: 100%; box-sizing: border-box; padding: 6px 10px; font-size: var(--joy-font-size-sm); border: 1px solid var(--joy-border-default); border-radius: var(--joy-radius-sm); background: var(--joy-surface-card); color: var(--joy-text-primary);">
      </div>
      <ul style="max-height: 200px; overflow-y: auto; margin: 0; padding: 4px 0; list-style: none;">
        ${renderedOptions}
      </ul>
      <div class="joy-select__empty" style="display: none; padding: 12px; text-align: center; color: var(--joy-text-secondary); font-size: var(--joy-font-size-sm);">No matching pairs</div>
    </div>
  </div>`;
};

const hubCascaderInteractive = (id = "demo-cascader") => {
  return `<div class="joy-cascader" id="${id}" style="position: relative; width: 100%;">
    <div class="joy-cascader__control" role="combobox" aria-expanded="false" tabindex="0" onclick="toggleHubCascader('${id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleHubCascader('${id}');}">
      <span class="joy-cascader__value" id="${id}-val">Markets / Perpetual Futures / BTC-USDT</span>
      <button type="button" class="joy-cascader__clear" aria-label="Clear selection" onclick="clearHubCascader(event, '${id}')">${closeIcon}</button>
      <span class="joy-cascader__arrow">${chevronDown}</span>
    </div>
    <div class="joy-cascader__panel joy-overlay" id="${id}-panel" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; z-index: var(--joy-z-dropdown);">
      <div class="joy-cascader__columns" id="${id}-cols">
        <ul class="joy-cascader__column" role="menu">
          <li class="joy-cascader__item joy-cascader__item--active" role="menuitem" tabindex="0" onmouseenter="hoverHubCascaderCol('${id}', 0, 'markets')" onclick="hoverHubCascaderCol('${id}', 0, 'markets')">
            Markets
            <span class="joy-cascader__item-arrow">${chevronRight}</span>
          </li>
          <li class="joy-cascader__item" role="menuitem" tabindex="-1" onmouseenter="hoverHubCascaderCol('${id}', 0, 'options')" onclick="hoverHubCascaderCol('${id}', 0, 'options')">
            Options Surface
            <span class="joy-cascader__item-arrow">${chevronRight}</span>
          </li>
          <li class="joy-cascader__item" role="menuitem" tabindex="-1" onmouseenter="hoverHubCascaderCol('${id}', 0, 'yield')" onclick="hoverHubCascaderCol('${id}', 0, 'yield')">
            Yield Vaults
            <span class="joy-cascader__item-arrow">${chevronRight}</span>
          </li>
        </ul>
        <ul class="joy-cascader__column" role="menu" id="${id}-col-1">
          <li class="joy-cascader__item joy-cascader__item--active" role="menuitem" tabindex="0" onmouseenter="hoverHubCascaderCol('${id}', 1, 'perp')" onclick="hoverHubCascaderCol('${id}', 1, 'perp')">
            Perpetual Futures
            <span class="joy-cascader__item-arrow">${chevronRight}</span>
          </li>
          <li class="joy-cascader__item" role="menuitem" tabindex="-1" onmouseenter="hoverHubCascaderCol('${id}', 1, 'spot')" onclick="hoverHubCascaderCol('${id}', 1, 'spot')">
            Spot Liquidity
            <span class="joy-cascader__item-arrow">${chevronRight}</span>
          </li>
          <li class="joy-cascader__item" role="menuitem" tabindex="-1">
            <span class="joy-cascader__item-loading" aria-hidden="true">${miniSpinner}</span>
            Loading Index...
          </li>
        </ul>
        <ul class="joy-cascader__column" role="menu" id="${id}-col-2">
          <li class="joy-cascader__item joy-cascader__item--active" role="menuitem" tabindex="0" onclick="selectHubCascaderLeaf('${id}', 'Markets / Perpetual Futures / BTC-USDT')">
            BTC-USDT
          </li>
          <li class="joy-cascader__item" role="menuitem" tabindex="-1" onclick="selectHubCascaderLeaf('${id}', 'Markets / Perpetual Futures / ETH-USDT')">
            ETH-USDT
          </li>
          <li class="joy-cascader__item" role="menuitem" tabindex="-1" onclick="selectHubCascaderLeaf('${id}', 'Markets / Perpetual Futures / SOL-USDT')">
            SOL-USDT
          </li>
        </ul>
      </div>
    </div>
  </div>`;
};

const hubTreeSelectInteractive = (id = "demo-treeselect") => {
  return `<div class="joy-treeselect" id="${id}" style="position: relative; width: 100%;">
    <div class="joy-treeselect__control" role="combobox" aria-expanded="false" tabindex="0" onclick="toggleHubTreeSelect('${id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleHubTreeSelect('${id}');}">
      <span class="joy-treeselect__tags" id="${id}-tags">
        <span class="joy-treeselect__tag" data-val="research">Research<button type="button" class="joy-treeselect__tag-remove" aria-label="Remove Research" onclick="removeHubTreeTag(event, '${id}', 'research')">${closeIcon}</button></span>
        <span class="joy-treeselect__tag" data-val="quant">Quant Core<button type="button" class="joy-treeselect__tag-remove" aria-label="Remove Quant Core" onclick="removeHubTreeTag(event, '${id}', 'quant')">${closeIcon}</button></span>
      </span>
      <button type="button" class="joy-treeselect__clear" aria-label="Clear selection" onclick="clearHubTreeSelect(event, '${id}')">${closeIcon}</button>
      <span class="joy-treeselect__arrow">${chevronDown}</span>
    </div>
    <div class="joy-treeselect__panel joy-overlay" id="${id}-panel" style="display: none; position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: var(--joy-z-dropdown); max-height: 280px; overflow-y: auto;">
      <div class="joy-treeselect__search-wrapper" style="position: sticky; top: 0; background: var(--joy-surface-card); z-index: 1;">
        <input type="search" class="joy-treeselect__search" id="${id}-search" placeholder="Search tree nodes..." aria-label="Search tree nodes" oninput="filterHubTreeSelect(this, '${id}')" onclick="event.stopPropagation()">
      </div>
      <div class="joy-treeselect__tree-body" id="${id}-nodes">
        <div class="joy-treeselect__node joy-treeselect__node--selected" data-key="research" data-title="Research Division" onclick="toggleHubTreeNodeSelection(event, '${id}', 'research', 'Research Division')">
          <button type="button" class="joy-treeselect__node-toggle joy-treeselect__node-toggle--expanded" aria-label="Toggle node" onclick="toggleHubTreeNodeCollapse(event, this)">${chevronRight}</button>
          <span class="joy-treeselect__node-checkbox">${checkIcon}</span>
          <span class="joy-treeselect__node-label">Research Division</span>
        </div>
        <div class="joy-treeselect__node joy-treeselect__node--selected" data-key="quant" data-parent="research" data-title="Quant Core" onclick="toggleHubTreeNodeSelection(event, '${id}', 'quant', 'Quant Core')">
          <span class="joy-treeselect__indent-spacer"></span>
          <button type="button" class="joy-treeselect__node-toggle" aria-label="Toggle node" onclick="toggleHubTreeNodeCollapse(event, this)">${chevronRight}</button>
          <span class="joy-treeselect__node-checkbox">${checkIcon}</span>
          <span class="joy-treeselect__node-label">Quant Core</span>
        </div>
        <div class="joy-treeselect__node" data-key="signals" data-parent="quant" data-title="Alpha Signals" onclick="toggleHubTreeNodeSelection(event, '${id}', 'signals', 'Alpha Signals')">
          <span class="joy-treeselect__indent-spacer"></span>
          <span class="joy-treeselect__indent-spacer"></span>
          <span class="joy-treeselect__node-toggle"></span>
          <span class="joy-treeselect__node-checkbox"></span>
          <span class="joy-treeselect__node-label">Alpha Signals</span>
        </div>
        <div class="joy-treeselect__node" data-key="ml-loading" data-parent="research" data-title="Neural Models">
          <span class="joy-treeselect__indent-spacer"></span>
          <span class="joy-treeselect__node-toggle"></span>
          <span class="joy-treeselect__node-loading">${miniSpinner}</span>
          <span class="joy-treeselect__node-label">Neural Models (Async Syncing)</span>
        </div>
        <div class="joy-treeselect__node" data-key="infra" data-title="Trading Infrastructure" onclick="toggleHubTreeNodeSelection(event, '${id}', 'infra', 'Trading Infrastructure')">
          <button type="button" class="joy-treeselect__node-toggle joy-treeselect__node-toggle--expanded" aria-label="Toggle node" onclick="toggleHubTreeNodeCollapse(event, this)">${chevronRight}</button>
          <span class="joy-treeselect__node-checkbox"></span>
          <span class="joy-treeselect__node-label">Trading Infrastructure</span>
        </div>
        <div class="joy-treeselect__node" data-key="fix" data-parent="infra" data-title="FIX Gateway" onclick="toggleHubTreeNodeSelection(event, '${id}', 'fix', 'FIX Gateway')">
          <span class="joy-treeselect__indent-spacer"></span>
          <span class="joy-treeselect__node-toggle"></span>
          <span class="joy-treeselect__node-checkbox"></span>
          <span class="joy-treeselect__node-label">FIX Gateway</span>
        </div>
        <div class="joy-treeselect__empty" id="${id}-empty" style="display: none; padding: 12px; text-align: center; color: var(--joy-text-muted); font-size: var(--joy-font-size-sm);">No matching nodes</div>
      </div>
    </div>
  </div>`;
};

const hubPopconfirm = (id, triggerLabel, title = "Revoke this key?", variant = "danger") =>
  `<div class="joy-popconfirm"><div class="joy-popconfirm__trigger"><button type="button" class="joy-button joy-button--${variant} joy-button--sm" aria-haspopup="dialog" aria-expanded="false" aria-controls="${id}" onclick="toggleHubPopconfirm(this)">${triggerLabel}</button></div><div id="${id}" class="joy-popconfirm__panel" role="alertdialog" aria-labelledby="${id}-title" data-hub-panel hidden><div class="joy-popconfirm__title"><span class="joy-popconfirm__icon">${iconSvg("AlertCircle", "1rem")}</span><span id="${id}-title">${title}</span></div><div class="joy-popconfirm__buttons"><button type="button" class="joy-button joy-button--ghost joy-button--sm" onclick="closeHubPopconfirm(this)">Cancel</button><button type="button" class="joy-button joy-button--solid joy-button--sm" onclick="confirmHubPopconfirm(this)">Confirm</button></div></div></div>`;

const hubTooltip = (id, label, visible = false) =>
  `<div class="joy-tooltip-wrapper"${visible ? "" : ` onpointerenter="hubTip('${id}', true)" onpointerleave="hubTip('${id}', false)" onfocusin="hubTip('${id}', true)" onfocusout="hubTip('${id}', false)"`}><button type="button" class="joy-button joy-button--outline joy-button--md" aria-describedby="${id}">${label}</button><div id="${id}" class="joy-tooltip" role="tooltip"${visible ? " data-static" : " hidden"}>Maker 0.01% | Taker 0.04%</div></div>`;

function renderNavigationView() {
  const pagerCard = hubCard(
    "pagination", "Pagination", "Windowed list, first page, size changer, and the phone rule (only the current page between Previous and Next at 480px or less).",
    hubCell("windowed (page 5 of 20)", hubPager(5, 20)) + hubCell("first page", hubPager(1, 20)) + hubCell("with size changer", hubPager(1, 3, { sizeChanger: true })) + hubCell("compact rule", hubPager(5, 20, { compact: true })) + hubCell("live (responsive)", `<div data-live-pager>${hubPager(5, 20, { id: "hub-live-pager" })}</div>`),
  );
  const tabsCard = hubCard(
    "tabs", "Tabs", "Roving keyboard support (arrows, Home, End); the tab list scrolls with edge fades when it overflows.",
    hubCell("default", hubTabs("hub-tabs-a", [{ label: "Live Orders", content: "3 active limit orders awaiting a counter-party." }, { label: "Historical Fills", content: "12 fills in the last 24 hours." }, { label: "Risk Matrix", content: "VaR 99%: 1.42 BTC." }])) +
      hubCell("overflowing", hubTabs("hub-tabs-b", ["Overview", "Positions", "Orders", "Fills", "Funding", "Risk limits", "Reports", "Audit log"].map((label) => ({ label, content: `${label} panel` })))),
  );
  const menuCard = hubCard(
    "menu", "Menu", "Horizontal with icons, inline sidebar and a disabled item.",
    hubCell("horizontal", `<ul class="joy-menu joy-menu--horizontal" role="menu" aria-orientation="horizontal">${hubMenuItem("Terminal", { icon: "Activity", active: true })}${hubMenuItem("Wallet", { icon: "Wallet" })}${hubMenuItem("Rules", { icon: "Sliders" })}${hubMenuItem("Archived", { disabled: true })}</ul>`) +
      hubCell("inline", `<ul class="joy-menu joy-menu--inline" role="menu" aria-orientation="vertical">${hubMenuItem("Spot liquidity", { active: true })}${hubMenuItem("Perpetual futures")}${hubMenuItem("Options surface")}</ul>`),
  );
  const breadcrumbCard = hubCard(
    "breadcrumb", "Breadcrumb", "Links, separators and the current page.",
    hubCell("default", `<nav class="joy-breadcrumb" aria-label="Breadcrumb"><ol><li><a class="joy-breadcrumb__link" href="#overview" onclick="switchView('overview')">Home</a> <span class="joy-breadcrumb__sep" aria-hidden="true">/</span></li><li><a class="joy-breadcrumb__link" href="#financial-table" onclick="switchView('financial-table')">Quant Engine</a> <span class="joy-breadcrumb__sep" aria-hidden="true">/</span></li><li><span class="joy-breadcrumb__current" aria-current="page">Alpha-1 Delta Neutral</span></li></ol></nav>`),
  );
  const stepsCard = hubCard(
    "steps", "Steps", "Interactive horizontal tracker and a vertical list with an error step.",
    hubCell("horizontal (click to advance)", `<div class="joy-steps joy-steps--horizontal" id="demo-steps-nav" role="navigation" aria-label="Steps progress">${hubStepItem("finish", 0, "KYC", "Identity verified")}${hubStepItem("process", 1, "Funding", "Deposit collateral")}${hubStepItem("wait", 2, "Activation", "Deploy strategies")}</div><div class="hub-row" style="margin-top: var(--joy-space-3);"><button type="button" class="joy-button joy-button--outline joy-button--sm" onclick="advanceDemoStep(-1)">Previous step</button><button type="button" class="joy-button joy-button--solid joy-button--sm" onclick="advanceDemoStep(1)">Next step</button></div>`) +
      hubCell("vertical with error", `<div class="joy-steps joy-steps--vertical" role="navigation" aria-label="Steps progress">${hubStepItem("finish", 0, "Submitted", "", -1)}${hubStepItem("error", 1, "Compliance review", "Document rejected", -1)}${hubStepItem("wait", 2, "Settlement", "", -1)}</div>`),
  );
  const anchorCard = hubCard(
    "anchor", "Anchor", "In-page anchor track with an ink marker and aria-current on the active link.",
    hubCell("default", `<nav class="joy-anchor" role="navigation" aria-label="Anchor Navigation"><div class="joy-anchor__ink"></div><a href="#menu" class="joy-anchor__link joy-anchor__link--active" aria-current="location" onclick="selectAnchor(this, event)">Overview</a><a href="#api" class="joy-anchor__link" onclick="selectAnchor(this, event)">API</a><a href="#a11y" class="joy-anchor__link" onclick="selectAnchor(this, event)">Accessibility</a></nav>`),
  );
  const timelineCard = hubCard(
    "timeline", "Timeline", "Event trail with dot statuses from success to danger.",
    hubCell("statuses", `<ul class="joy-timeline" role="list">${hubTimelineItem("success", "Order 8841 filled", "250 SOL at 184.20 via Phoenix.", "14:32:08 UTC")}${hubTimelineItem("primary", "Risk check passed", "Portfolio beta 0.28 of 0.40.", "14:31:55 UTC")}${hubTimelineItem("warning", "Slippage rebalanced", "Tolerance moved from 5 to 12 bps.", "14:28:10 UTC")}${hubTimelineItem("danger", "Venue rejected quote", "Gateway timeout after 3 retries.", "14:20:41 UTC")}${hubTimelineItem("info", "Session authenticated", "API key from the Singapore worker.", "14:15:00 UTC")}</ul>`),
  );
  const splitterCard = hubCard(
    "splitter", "Splitter", "Drag the divider or use the arrow keys; below 640px the horizontal layout stacks.",
    hubCell("horizontal", hubSplitter("horizontal", "<strong>Controls</strong><p>Engine parameters and latency limits.</p>", "<strong>Telemetry</strong><p>Live fills and routing logs.</p>", 180)) + hubCell("vertical", hubSplitter("vertical", "<strong>Top</strong>", "<strong>Bottom</strong>")),
    " hub-matrix--stack",
  );
  const overlayCard = hubCard(
    "overlays", "Overlay openers", "Modal (with a Popconfirm inside it), Drawer, Popconfirm, Dropdown and Tooltip. Popconfirm sits on the popover layer, above the modal.",
    hubCell("Modal", `<button type="button" class="joy-button joy-button--solid joy-button--md" data-open="modal" aria-haspopup="dialog" onclick="openDemoModal()">Open modal</button>`) +
      hubCell("Drawer", `<div class="hub-row"><button type="button" class="joy-button joy-button--solid joy-button--md" data-open="drawer" aria-haspopup="dialog" onclick="openDemoDrawer('right')">Open drawer</button><button type="button" class="joy-button joy-button--outline joy-button--md" data-open="drawer-left" aria-haspopup="dialog" onclick="openDemoDrawer('left')">Open left drawer</button></div>`) +
      hubCell("Popconfirm", hubPopconfirm("hub-popconfirm-inline", "Revoke API key")) +
      hubCell("Dropdown", hubDropdown("hub-dropdown-menu")) +
      hubCell("Tooltip (hover or focus)", hubTooltip("hub-tip-a", "Trading fee")) +
      hubCell("Tooltip (open state)", `<div style="padding-top: var(--joy-space-8);">${hubTooltip("hub-tip-b", "Always shown", true)}</div>`),
  );
  const markdownCard = hubCard(
    "markdown", "MarkdownViewer", "Rendered content region with the code-block copy contract.",
    hubCell("viewer", `<div class="joy-markdown" role="region" aria-label="Markdown content"><h3>Release notes</h3><p>This release ships <strong>display, feedback and navigation</strong> fixes.</p><pre class="joy-markdown__pre"><code>pnpm --filter \\\n  @montionugera/joy-svelte test</code><button type="button" class="joy-markdown__copy-btn" aria-label="Copy code to clipboard" onclick="copyHubCode(this)">${iconSvg("Copy", "14")} Copy</button><span class="joy-markdown__status" role="status"></span></pre></div>`),
    " hub-matrix--stack",
  );
  return `<section id="view-navigation-workflow" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Navigation & Workflow</h2>
        <p class="header-tagline">State matrices for navigation, workflow and overlay components: Pagination, Tabs, Menu, Breadcrumb, Steps, Anchor, Timeline, Splitter, Modal, Drawer, Popconfirm, Dropdown, Tooltip and MarkdownViewer.</p>
        ${pagerCard}${tabsCard}${menuCard}${breadcrumbCard}${stepsCard}${anchorCard}${timelineCard}${splitterCard}${overlayCard}${markdownCard}
      </section>`;
}

function renderBauhausView() {
  return `<section id="view-bauhaus" class="view-panel">
        <div style="display: flex; align-items: center; gap: var(--joy-space-2); margin-bottom: var(--joy-space-2);">
          <span class="joy-badge joy-badge--brand joy-badge--md"><span class="joy-badge__dot"></span> Bauhaus & Joy-Coach</span>
          <span class="joy-badge joy-badge--neutral joy-badge--md">Dual Registers</span>
        </div>
        <h2 style="margin: 0 0 8px 0;">Bauhaus Dessau & Sports Analytics</h2>
        <p class="header-tagline">
          Dual-voice design architecture ported from joy-coach: warm editorial storytelling with Cormorant Garamond display serif alongside high-density performance telemetry in JetBrains Mono.
        </p>

        <!-- Dual Registers Comparison -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); gap: var(--joy-space-6); margin: var(--joy-space-6) 0;">
          
          <!-- Register 1: Editorial Voice -->
          <div class="joy-voice-card joy-voice-card--editorial joy-voice-card--ground-paper">
            <div class="joy-voice-card__eyebrow">CHAMPIONSHIP MATCH / ROLAND-GARROS</div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--joy-space-4);">
              <div>
                <h3 style="margin: 0; font-family: var(--joy-font-display); font-size: 2rem; font-weight: 400; line-height: 1.1; color: var(--joy-text-primary);">Philippe-Chatrier Court</h3>
                <p style="margin: 4px 0 0 0; font-size: var(--joy-font-size-sm); color: var(--joy-text-secondary);">Final Set / Deciding Baseline Rally</p>
              </div>
              <svg class="joy-emblem" width="64" height="64" viewBox="0 0 100 100" role="img" aria-label="Roland Garros Emblem">
                <defs>
                  <path id="emblem-hub-circle" d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" />
                </defs>
                <circle class="joy-emblem__field" cx="50" cy="50" r="48" />
                <circle class="joy-emblem__ring" cx="50" cy="50" r="44" stroke-width="1.5" />
                <circle class="joy-emblem__disc" cx="50" cy="50" r="22" />
                <text class="joy-emblem__text">
                  <textPath href="#emblem-hub-circle" startOffset="50%" text-anchor="middle">ROLAND-GARROS 2026</textPath>
                </text>
                <text class="joy-emblem__text" x="50" y="54" text-anchor="middle" font-weight="700" font-size="12">RG</text>
              </svg>
            </div>

            <div class="joy-stat-card joy-stat-card--editorial" style="margin-bottom: var(--joy-space-4);">
              <div class="joy-stat-card__eyebrow">FIRST SERVE WIN %</div>
              <div class="joy-stat-card__row">
                <div class="joy-stat-card__figure">84.2</div>
                <span class="joy-stat-card__unit">%</span>
                <span class="joy-stat-card__qualifier">26/31</span>
              </div>
              <div class="joy-stat-card__delta joy-stat-card__delta--positive">
                <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                <span class="joy-stat-card__sr">Increase: </span>
                <span>+6.4% vs tour avg</span>
              </div>
              <div class="joy-stat-card__progress-wrap">
                <div class="joy-stat-card__progress-bar" style="width: 84.2%;"></div>
              </div>
              <div class="joy-stat-card__note">Heavy topspin kicking out wide to opponent backhand wing.</div>
            </div>

            <div class="joy-voice-card__caption">
              Editorial voice uses Cormorant Garamond display serif, generous air, and paper-ground warmth.
            </div>
          </div>

          <!-- Register 2: Performance Voice -->
          <div class="joy-voice-card joy-voice-card--performance joy-voice-card--ground-deep">
            <div class="joy-voice-card__eyebrow">REAL-TIME TELEMETRY FEED</div>
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--joy-space-4);">
              <div class="joy-performance-figure">
                <span class="joy-performance-figure__label">SERVE VELOCITY</span>
                <div class="joy-performance-figure__val-row">
                  <span class="joy-performance-figure__figure">214</span>
                  <span class="joy-performance-figure__unit">KM/H</span>
                  <span class="joy-performance-figure__tally">PEAK ACE</span>
                </div>
              </div>
              <svg class="joy-trend-line" width="80" height="32" viewBox="0 0 80 32" role="img" aria-label="Velocity Trend">
                <path class="joy-trend-line__path" d="M 0.0 24.0 L 11.4 20.0 L 22.9 22.0 L 34.3 12.0 L 45.7 15.0 L 57.1 8.0 L 68.6 6.0 L 80.0 2.0" stroke-width="2"></path>
              </svg>
            </div>

            <div class="joy-performance-bars" style="margin-bottom: var(--joy-space-4);">
              <div class="joy-performance-bars__label">LAST 8 SERVICE POINTS</div>
              <div class="joy-performance-bars__track">
                <span class="joy-performance-bars__bar joy-performance-bars__bar--win" aria-label="win"></span>
                <span class="joy-performance-bars__bar joy-performance-bars__bar--win" aria-label="win"></span>
                <span class="joy-performance-bars__bar joy-performance-bars__bar--loss" aria-label="loss"></span>
                <span class="joy-performance-bars__bar joy-performance-bars__bar--win" aria-label="win"></span>
                <span class="joy-performance-bars__bar joy-performance-bars__bar--win" aria-label="win"></span>
                <span class="joy-performance-bars__bar joy-performance-bars__bar--loss" aria-label="loss"></span>
                <span class="joy-performance-bars__bar joy-performance-bars__bar--win" aria-label="win"></span>
                <span class="joy-performance-bars__bar joy-performance-bars__bar--win" aria-label="win"></span>
              </div>
            </div>

            <div style="background: var(--joy-surface-sunken); border-radius: var(--joy-radius-inner); margin-bottom: var(--joy-space-4); overflow: hidden;">
              <div class="joy-dense-row">
                <span class="joy-dense-row__label">Break Points Saved</span>
                <div class="joy-dense-row__right">
                  <span class="joy-dense-row__figure">5/6</span>
                  <span class="joy-dense-row__delta joy-dense-row__delta--positive">+18%</span>
                </div>
              </div>
              <div class="joy-dense-row">
                <span class="joy-dense-row__label">Unforced Errors</span>
                <div class="joy-dense-row__right">
                  <span class="joy-dense-row__figure">12</span>
                  <span class="joy-dense-row__delta joy-dense-row__delta--critical">-4</span>
                </div>
              </div>
              <div class="joy-dense-row">
                <span class="joy-dense-row__label">Net Clearance</span>
                <div class="joy-dense-row__right">
                  <span class="joy-dense-row__figure">0.82m</span>
                  <span class="joy-dense-row__delta joy-dense-row__delta--neutral">avg</span>
                </div>
              </div>
            </div>

            <div style="display: flex; gap: var(--joy-space-2); flex-wrap: wrap;">
              <span class="joy-mono-chip joy-mono-chip--court">CLAY COURT</span>
              <span class="joy-mono-chip joy-mono-chip--active">LIVE FEED</span>
              <span class="joy-mono-chip joy-mono-chip--default">ID 8821</span>
              <span class="joy-mono-chip joy-mono-chip--danger">MATCH PT</span>
            </div>

            <div class="joy-voice-card__caption">
              Performance voice uses monospace tabular numbers, dense grid spacing, and high-contrast deep grounds.
            </div>
          </div>
        </div>

        <!-- Court Semantics Grid -->
        <div class="component-card" style="margin-top: var(--joy-space-6);">
          <div class="component-header">
            <div>
              <div class="component-title">Court Surface Semantics</div>
              <div class="component-desc">Specialized surface tokens for tennis and analytics engines: clay, hard, grass, and indoor.</div>
            </div>
          </div>
          <div class="component-canvas" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--joy-space-4);">
            <div style="background: var(--joy-surface-clay-bg); color: var(--joy-surface-clay-fg); padding: var(--joy-space-4); border: 1px solid var(--joy-court); border-radius: var(--joy-radius-card);">
              <div style="font-size: var(--joy-font-size-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.8;">Clay Court</div>
              <div style="font-size: var(--joy-font-size-lg); font-weight: 600; margin-top: var(--joy-space-1);">Roland-Garros</div>
              <div style="font-size: var(--joy-font-size-xs); margin-top: var(--joy-space-2); opacity: 0.9;">--joy-surface-clay-bg</div>
            </div>
            <div style="background: var(--joy-surface-hard-bg); color: var(--joy-surface-hard-fg); padding: var(--joy-space-4); border: 1px solid var(--joy-border-default); border-radius: var(--joy-radius-card);">
              <div style="font-size: var(--joy-font-size-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.8;">Hard Court</div>
              <div style="font-size: var(--joy-font-size-lg); font-weight: 600; margin-top: var(--joy-space-1);">US Open / AO</div>
              <div style="font-size: var(--joy-font-size-xs); margin-top: var(--joy-space-2); opacity: 0.9;">--joy-surface-hard-bg</div>
            </div>
            <div style="background: var(--joy-surface-grass-bg); color: var(--joy-surface-grass-fg); padding: var(--joy-space-4); border: 1px solid var(--joy-border-default); border-radius: var(--joy-radius-card);">
              <div style="font-size: var(--joy-font-size-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.8;">Grass Court</div>
              <div style="font-size: var(--joy-font-size-lg); font-weight: 600; margin-top: var(--joy-space-1);">Wimbledon</div>
              <div style="font-size: var(--joy-font-size-xs); margin-top: var(--joy-space-2); opacity: 0.9;">--joy-surface-grass-bg</div>
            </div>
            <div style="background: var(--joy-surface-indoor-bg); color: var(--joy-surface-indoor-fg); padding: var(--joy-space-4); border: 1px solid var(--joy-border-default); border-radius: var(--joy-radius-card);">
              <div style="font-size: var(--joy-font-size-xs); font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.8;">Indoor Carpet</div>
              <div style="font-size: var(--joy-font-size-lg); font-weight: 600; margin-top: var(--joy-space-1);">ATP Finals</div>
              <div style="font-size: var(--joy-font-size-xs); margin-top: var(--joy-space-2); opacity: 0.9;">--joy-surface-indoor-bg</div>
            </div>
          </div>
        </div>
      </section>`;
}

function renderCourtsideLoggerView() {
  return `<section id="view-courtside-logger" class="view-panel">
        <div style="display: flex; align-items: center; gap: var(--joy-space-2); margin-bottom: var(--joy-space-2);">
          <span class="joy-badge joy-badge--brand joy-badge--md"><span class="joy-badge__dot"></span> Live Courtside Logger</span>
          <span class="joy-badge joy-badge--neutral joy-badge--md">Bi-Manual & Thumb Ergonomics</span>
        </div>
        <h2 style="margin: 0 0 8px 0;">Courtside Live Match Logger</h2>
        <p class="header-tagline">
          Instrument-modernism courtside match analysis with sub-second thumb logging, interactive SVG court telemetry, and zero-jitter tabular scorekeeping.
        </p>

        <!-- Surface Switcher & Status Ribbon -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--joy-space-3); margin-bottom: var(--joy-space-4);">
          <div style="display: flex; align-items: center; gap: var(--joy-space-2);">
            <button type="button" class="joy-button joy-button--outline joy-button--sm" onclick="setDemoCourtSurface('clay')">Roland-Garros (Clay)</button>
            <button type="button" class="joy-button joy-button--outline joy-button--sm" onclick="setDemoCourtSurface('grass')">Wimbledon (Grass)</button>
            <button type="button" class="joy-button joy-button--solid joy-button--sm" onclick="setDemoCourtSurface('hard')">US Open (Hard)</button>
            <button type="button" class="joy-button joy-button--outline joy-button--sm" onclick="setDemoCourtSurface('indoor')">Nitto ATP (Indoor)</button>
          </div>
          <div style="display: flex; align-items: center; gap: var(--joy-space-2);">
            <span class="joy-badge joy-badge--sm joy-badge--brand">LIVE 01:42:18</span>
            <button type="button" class="joy-button joy-button--ghost joy-button--sm" onclick="clearCourtShots()">Reset Shots</button>
          </div>
        </div>

        <!-- Logger Main Grid: Scoreboard + Court Radar -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: var(--joy-space-4); margin-bottom: var(--joy-space-6);">
          <!-- Column 1: Scoreboard + Telemetry -->
          <div style="display: flex; flex-direction: column; gap: var(--joy-space-4);">
            <!-- MatchScoreboard -->
            <div class="joy-match-scoreboard" id="demo-match-scoreboard">
              <div class="joy-match-scoreboard__header">
                <span class="joy-match-scoreboard__surface" id="demo-surface-label">Arthur Ashe Stadium — DecoTurf Hard</span>
                <span class="joy-match-scoreboard__status">LIVE</span>
              </div>
              <table class="joy-match-scoreboard__table">
                <thead>
                  <tr>
                    <th class="joy-match-scoreboard__cell" style="text-align: left;">Player</th>
                    <th class="joy-match-scoreboard__cell">1</th>
                    <th class="joy-match-scoreboard__cell">2</th>
                    <th class="joy-match-scoreboard__cell">3</th>
                    <th class="joy-match-scoreboard__cell joy-match-scoreboard__cell--active">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="joy-match-scoreboard__row">
                    <td class="joy-match-scoreboard__player-cell">
                      <span class="joy-match-scoreboard__serving" aria-label="Serving"></span>
                      <span>C. Alcaraz</span>
                      <span class="joy-match-scoreboard__seed">(1)</span>
                    </td>
                    <td class="joy-match-scoreboard__cell">6</td>
                    <td class="joy-match-scoreboard__cell">4</td>
                    <td class="joy-match-scoreboard__cell">5</td>
                    <td class="joy-match-scoreboard__cell joy-match-scoreboard__cell--active">40</td>
                  </tr>
                  <tr class="joy-match-scoreboard__row">
                    <td class="joy-match-scoreboard__player-cell">
                      <span>J. Sinner</span>
                      <span class="joy-match-scoreboard__seed">(2)</span>
                    </td>
                    <td class="joy-match-scoreboard__cell">4</td>
                    <td class="joy-match-scoreboard__cell">6</td>
                    <td class="joy-match-scoreboard__cell">4</td>
                    <td class="joy-match-scoreboard__cell joy-match-scoreboard__cell--active">30</td>
                  </tr>
                </tbody>
              </table>
              <div class="joy-match-scoreboard__footer">
                <span>Men's Singles Championship Final</span>
                <span>Elapsed: 2h 18m</span>
              </div>
            </div>

            <!-- TelemetryStrip -->
            <div class="joy-telemetry-strip">
              <div class="joy-telemetry-strip__item">
                <span class="joy-telemetry-strip__label">SERVE SPEED</span>
                <span class="joy-telemetry-strip__metric">218 km/h</span>
                <span class="joy-telemetry-strip__zone">1st Flat Ace</span>
              </div>
              <div class="joy-telemetry-strip__item">
                <span class="joy-telemetry-strip__label">RALLY LENGTH</span>
                <span class="joy-telemetry-strip__metric">14 shots</span>
                <span class="joy-telemetry-strip__zone">Baseline Cross</span>
              </div>
              <div class="joy-telemetry-strip__item">
                <span class="joy-telemetry-strip__label">RPM TOPSPIN</span>
                <span class="joy-telemetry-strip__metric">3,420 rpm</span>
                <span class="joy-telemetry-strip__zone">Heavy Kick</span>
              </div>
            </div>
          </div>

          <!-- Column 2: CourtRadar (Interactive SVG) -->
          <div class="joy-court-radar joy-court-radar--surface-hard joy-court-radar--interactive" id="demo-court-radar">
            <div class="joy-court-radar__header">
              <h4 class="joy-court-radar__title">Ball Placement & Shot Heatmap</h4>
              <span class="joy-court-radar__badge" id="demo-shot-count">4 Shots Placed</span>
            </div>
            <div class="joy-court-radar__court-wrap">
              <svg id="demo-court-svg" class="joy-court-radar__svg" viewBox="0 0 360 480" role="button" aria-label="Interactive Tennis Court" tabindex="0" onclick="handleCourtClick(event)">
                <rect x="0" y="0" width="360" height="480" rx="8" class="joy-court-radar__court-bg" />
                <rect x="40" y="40" width="280" height="400" class="joy-court-radar__line" />
                <line x1="75" y1="40" x2="75" y2="440" class="joy-court-radar__line" />
                <line x1="285" y1="40" x2="285" y2="440" class="joy-court-radar__line" />
                <line x1="75" y1="130" x2="285" y2="130" class="joy-court-radar__line" />
                <line x1="75" y1="350" x2="285" y2="350" class="joy-court-radar__line" />
                <line x1="180" y1="130" x2="180" y2="350" class="joy-court-radar__line" />
                <line x1="180" y1="40" x2="180" y2="50" class="joy-court-radar__line" />
                <line x1="180" y1="430" x2="180" y2="440" class="joy-court-radar__line" />
                <line x1="30" y1="240" x2="330" y2="240" class="joy-court-radar__net" />
                <g id="demo-trajectories-layer">
                  <line x1="180" y1="430" x2="95" y2="145" class="joy-court-radar__trajectory" />
                  <line x1="180" y1="50" x2="265" y2="335" class="joy-court-radar__trajectory" />
                </g>
                <g id="demo-shots-layer">
                  <circle cx="95" cy="145" r="5" class="joy-court-radar__shot-point joy-court-radar__shot-point--in" />
                  <circle cx="265" cy="335" r="5" class="joy-court-radar__shot-point joy-court-radar__shot-point--in" />
                  <circle cx="290" cy="120" r="5" class="joy-court-radar__shot-point joy-court-radar__shot-point--out" />
                  <circle cx="180" cy="235" r="5" class="joy-court-radar__shot-point joy-court-radar__shot-point--net" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        <!-- CommandIsland: Mobile/Desktop Thumb Dock -->
        <div class="joy-command-island joy-command-island--bottom-fixed" style="margin-top: var(--joy-space-4);">
          <div class="joy-command-island__inner" role="toolbar" aria-label="Courtside Logger Action Dock">
            <button type="button" class="joy-command-island__item joy-command-island__item--active" data-action="in" onclick="setLoggerAction('in', this)">
              <span>Winner / In</span>
              <span class="joy-command-island__kbd">W</span>
            </button>
            <button type="button" class="joy-command-island__item" data-action="out" onclick="setLoggerAction('out', this)">
              <span>Out / Error</span>
              <span class="joy-command-island__kbd">O</span>
            </button>
            <button type="button" class="joy-command-island__item" data-action="net" onclick="setLoggerAction('net', this)">
              <span>Net Cord</span>
              <span class="joy-command-island__kbd">N</span>
            </button>
          </div>
        </div>
      </section>`;
}

function renderCoachDashboardView() {
  return `<section id="view-coach-dashboard" class="view-panel">
        <div style="display: flex; align-items: center; gap: var(--joy-space-2); margin-bottom: var(--joy-space-2);">
          <span class="joy-badge joy-badge--brand joy-badge--md"><span class="joy-badge__dot"></span> Coach Performance Bento</span>
          <span class="joy-badge joy-badge--neutral joy-badge--md">CSS Subgrid & Container Queries</span>
        </div>
        <h2 style="margin: 0 0 8px 0;">Athletic Performance & Kinematics Bento</h2>
        <p class="header-tagline">
          Multi-sensor telemetry, tactile chronometer timing, and stroke mechanics mapped onto responsive container grids.
        </p>

        <!-- Live Telemetry Strip Header -->
        <div class="joy-telemetry-strip" style="margin-bottom: var(--joy-space-6);">
          <div class="joy-telemetry-strip__item">
            <span class="joy-telemetry-strip__label">HEART RATE</span>
            <span class="joy-telemetry-strip__metric">178 bpm</span>
            <span class="joy-telemetry-strip__zone">Zone 4 (Threshold)</span>
          </div>
          <div class="joy-telemetry-strip__item">
            <span class="joy-telemetry-strip__label">ACTIVE DURATION</span>
            <span class="joy-telemetry-strip__metric">01:24:50</span>
            <span class="joy-telemetry-strip__zone">Set 3 In Progress</span>
          </div>
          <div class="joy-telemetry-strip__item">
            <span class="joy-telemetry-strip__label">PEAK ACCELERATION</span>
            <span class="joy-telemetry-strip__metric">4.8 g</span>
            <span class="joy-telemetry-strip__zone">Forehand Turn</span>
          </div>
          <div class="joy-telemetry-strip__item">
            <span class="joy-telemetry-strip__label">TOTAL ENERGY</span>
            <span class="joy-telemetry-strip__metric">1,140 kcal</span>
            <span class="joy-telemetry-strip__zone">High Expenditure</span>
          </div>
        </div>

        <!-- Bento Grid Container -->
        <div class="joy-bento-grid joy-bento-grid--cols-12" style="display: grid; grid-template-columns: repeat(12, 1fr); gap: var(--joy-space-4);">
          <!-- Chronometer Dial Card (col-span-6) -->
          <div class="joy-bento-card joy-bento-card--col-span-6" style="grid-column: span 6;">
            <div class="joy-bento-card__header">
              <h4 class="joy-bento-card__title">Split Lap Chronometer</h4>
              <span class="joy-badge joy-badge--sm joy-badge--brand">Tactile Dial</span>
            </div>
            <div style="display: flex; justify-content: center; padding: var(--joy-space-2) 0;">
              <div class="joy-chronometer-dial" id="demo-chrono">
                <div class="joy-chronometer-dial__dial-wrap">
                  <svg class="joy-chronometer-dial__svg" viewBox="0 0 220 220" role="img" aria-label="Stopwatch dial">
                    <circle class="joy-chronometer-dial__track" cx="110" cy="110" r="96" />
                    <circle id="demo-chrono-ring" class="joy-chronometer-dial__progress" cx="110" cy="110" r="96" stroke-dasharray="603.19" stroke-dashoffset="180.95" />
                  </svg>
                  <div class="joy-chronometer-dial__center">
                    <span class="joy-chronometer-dial__time" id="demo-chrono-time">00:42.38</span>
                    <span class="joy-chronometer-dial__label" id="demo-chrono-label">REST INTERVAL</span>
                  </div>
                </div>
                <div class="joy-chronometer-dial__controls">
                  <button type="button" class="joy-chronometer-dial__btn joy-chronometer-dial__btn--secondary" onclick="demoChronoLap()">Lap Split</button>
                  <button type="button" class="joy-chronometer-dial__btn joy-chronometer-dial__btn--primary" id="demo-chrono-toggle" onclick="demoChronoToggle()">Stop</button>
                </div>
                <div class="joy-chronometer-dial__laps" id="demo-chrono-laps">
                  <div class="joy-chronometer-dial__lap-item"><span>Lap 1</span><span>+00:18.20</span><span>00:18.20</span></div>
                  <div class="joy-chronometer-dial__lap-item"><span>Lap 2</span><span>+00:24.18</span><span>00:42.38</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mini Court Radar (col-span-6) -->
          <div class="joy-bento-card joy-bento-card--col-span-6" style="grid-column: span 6;">
            <div class="joy-bento-card__header">
              <h4 class="joy-bento-card__title">Shot Trajectory Vector</h4>
              <span class="joy-badge joy-badge--sm joy-badge--neutral">High Accuracy</span>
            </div>
            <div class="joy-court-radar joy-court-radar--surface-clay" style="border: none; box-shadow: none; padding: 0;">
              <div class="joy-court-radar__court-wrap" style="max-height: 320px;">
                <svg class="joy-court-radar__svg" viewBox="0 0 360 480" role="img" aria-label="Clay Court Telemetry">
                  <rect x="0" y="0" width="360" height="480" rx="8" class="joy-court-radar__court-bg" />
                  <rect x="40" y="40" width="280" height="400" class="joy-court-radar__line" />
                  <line x1="75" y1="40" x2="75" y2="440" class="joy-court-radar__line" />
                  <line x1="285" y1="40" x2="285" y2="440" class="joy-court-radar__line" />
                  <line x1="75" y1="130" x2="285" y2="130" class="joy-court-radar__line" />
                  <line x1="75" y1="350" x2="285" y2="350" class="joy-court-radar__line" />
                  <line x1="180" y1="130" x2="180" y2="350" class="joy-court-radar__line" />
                  <line x1="180" y1="40" x2="180" y2="50" class="joy-court-radar__line" />
                  <line x1="180" y1="430" x2="180" y2="440" class="joy-court-radar__line" />
                  <line x1="30" y1="240" x2="330" y2="240" class="joy-court-radar__net" />
                  <line x1="180" y1="430" x2="80" y2="140" class="joy-court-radar__trajectory" />
                  <circle cx="80" cy="140" r="6" class="joy-court-radar__shot-point joy-court-radar__shot-point--in" />
                  <circle cx="270" cy="340" r="5" class="joy-court-radar__shot-point joy-court-radar__shot-point--in" />
                  <circle cx="180" cy="135" r="5" class="joy-court-radar__shot-point joy-court-radar__shot-point--in" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Stat Metric 1 (col-span-4) -->
          <div class="joy-bento-card joy-bento-card--col-span-4" style="grid-column: span 4;">
            <div class="joy-stat-card joy-stat-card--editorial">
              <div class="joy-stat-card__eyebrow">FIRST SERVE %</div>
              <div class="joy-stat-card__row">
                <div class="joy-stat-card__figure">74.5</div>
                <span class="joy-stat-card__unit">%</span>
              </div>
              <div class="joy-stat-card__delta joy-stat-card__delta--positive">
                <span>+4.2% vs target</span>
              </div>
            </div>
          </div>

          <!-- Stat Metric 2 (col-span-4) -->
          <div class="joy-bento-card joy-bento-card--col-span-4" style="grid-column: span 4;">
            <div class="joy-stat-card joy-stat-card--editorial">
              <div class="joy-stat-card__eyebrow">BREAK POINTS CONVERTED</div>
              <div class="joy-stat-card__row">
                <div class="joy-stat-card__figure">5/7</div>
                <span class="joy-stat-card__unit">PTS</span>
              </div>
              <div class="joy-stat-card__delta joy-stat-card__delta--positive">
                <span>71.4% efficiency</span>
              </div>
            </div>
          </div>

          <!-- Stat Metric 3 (col-span-4) -->
          <div class="joy-bento-card joy-bento-card--col-span-4" style="grid-column: span 4;">
            <div class="joy-stat-card joy-stat-card--editorial">
              <div class="joy-stat-card__eyebrow">NET POINTS WON</div>
              <div class="joy-stat-card__row">
                <div class="joy-stat-card__figure">18/22</div>
                <span class="joy-stat-card__unit">PTS</span>
              </div>
              <div class="joy-stat-card__delta joy-stat-card__delta--positive">
                <span>81.8% success</span>
              </div>
            </div>
          </div>
        </div>
      </section>`;
}

function renderOutdoorGlareView() {
  return `<section id="view-outdoor-glare" class="view-panel">
        <div style="display: flex; align-items: center; gap: var(--joy-space-2); margin-bottom: var(--joy-space-2);">
          <span class="joy-badge joy-badge--brand joy-badge--md"><span class="joy-badge__dot"></span> High-Noon Outdoor Mode</span>
          <span class="joy-badge joy-badge--neutral joy-badge--md">50,000 Lux Contrast Rigor</span>
        </div>
        <h2 style="margin: 0 0 8px 0;">Outdoor Sunlight & Glare Simulator</h2>
        <p class="header-tagline">
          Under direct courtside sunlight, conventional SaaS cards with pastel borders and grey drop-shadows wash out completely. Joy-Design's High-Noon Outdoor mode activates AAA contrast pairs (≥7.0:1), 2px structural borders, and directional ambient bevels.
        </p>

        <!-- Interactive Mode Toggle -->
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--joy-space-4); margin: var(--joy-space-4) 0; padding: var(--joy-space-3); background: var(--joy-surface-raised); border: 1px solid var(--joy-border-default); border-radius: var(--joy-radius-card);">
          <div style="display: flex; flex-direction: column; gap: var(--joy-space-1);">
            <span style="font-weight: var(--joy-font-weight-semibold); color: var(--joy-text-primary);">Courtside Sunlight Simulator Controls</span>
            <span style="font-size: var(--joy-font-size-xs); color: var(--joy-text-secondary);">Simulates high ambient illuminance and enforces [data-mode="outdoor"] token mapping.</span>
          </div>
          <div style="display: flex; align-items: center; gap: var(--joy-space-3);">
            <button type="button" class="joy-button joy-button--outline joy-button--sm" id="btn-toggle-glare" onclick="toggleSimulatedGlare()">Toggle 50,000 Lux Glare Simulation</button>
            <button type="button" class="joy-button joy-button--solid joy-button--sm" id="btn-toggle-outdoor-mode" onclick="toggleOutdoorMode()">Toggle High-Noon Outdoor Mode</button>
          </div>
        </div>

        <!-- Comparison Rig -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr)); gap: var(--joy-space-6); margin-top: var(--joy-space-4);">
          <!-- Standard Card under sunlight -->
          <div style="display: flex; flex-direction: column; gap: var(--joy-space-3);">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: var(--joy-font-weight-semibold); font-size: var(--joy-font-size-sm); color: var(--joy-text-secondary);">STANDARD SaaS POSTURE</span>
              <span class="joy-badge joy-badge--sm joy-badge--neutral">AA 4.5:1</span>
            </div>
            <div class="joy-voice-card joy-voice-card--ground-paper">
              <div class="joy-voice-card__eyebrow">COURTSIDE TELEMETRY</div>
              <div class="joy-match-scoreboard" style="margin-bottom: var(--joy-space-4);">
                <div class="joy-match-scoreboard__header">
                  <span class="joy-match-scoreboard__surface">Standard Mode Contrast</span>
                  <span class="joy-match-scoreboard__status">LIVE</span>
                </div>
                <table class="joy-match-scoreboard__table">
                  <thead>
                    <tr>
                      <th class="joy-match-scoreboard__cell" style="text-align: left;">Player</th>
                      <th class="joy-match-scoreboard__cell">1</th>
                      <th class="joy-match-scoreboard__cell">2</th>
                      <th class="joy-match-scoreboard__cell joy-match-scoreboard__cell--active">PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="joy-match-scoreboard__row">
                      <td class="joy-match-scoreboard__player-cell"><span>Player A</span></td>
                      <td class="joy-match-scoreboard__cell">6</td>
                      <td class="joy-match-scoreboard__cell">4</td>
                      <td class="joy-match-scoreboard__cell joy-match-scoreboard__cell--active">40</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p style="font-size: var(--joy-font-size-xs); color: var(--joy-text-muted); margin: 0;">Standard 1px borders and subtle grey surfaces can lose edge definition when viewing tablets outdoors under midday sun.</p>
            </div>
          </div>

          <!-- Outdoor Mode Rig -->
          <div style="display: flex; flex-direction: column; gap: var(--joy-space-3);" data-mode="outdoor">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: var(--joy-font-weight-semibold); font-size: var(--joy-font-size-sm); color: var(--joy-accent-text);">INSTRUMENT MODERNISM (OUTDOOR MODE)</span>
              <span class="joy-badge joy-badge--sm joy-badge--brand">AAA ≥7.0:1 Guaranteed</span>
            </div>
            <div class="joy-voice-card joy-voice-card--ground-paper" style="border: 2px solid var(--joy-border-strong); box-shadow: var(--joy-elevation-bevel), var(--joy-elevation-2);">
              <div class="joy-voice-card__eyebrow" style="font-weight: var(--joy-font-weight-bold); color: var(--joy-accent-text);">COURTSIDE TELEMETRY (HIGH-NOON)</div>
              <div class="joy-match-scoreboard" style="margin-bottom: var(--joy-space-4); border: 2px solid var(--joy-border-strong);">
                <div class="joy-match-scoreboard__header">
                  <span class="joy-match-scoreboard__surface">High-Noon Outdoor Rigor</span>
                  <span class="joy-match-scoreboard__status" style="border-width: 2px;">LIVE</span>
                </div>
                <table class="joy-match-scoreboard__table">
                  <thead>
                    <tr>
                      <th class="joy-match-scoreboard__cell" style="text-align: left;">Player</th>
                      <th class="joy-match-scoreboard__cell">1</th>
                      <th class="joy-match-scoreboard__cell">2</th>
                      <th class="joy-match-scoreboard__cell joy-match-scoreboard__cell--active">PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="joy-match-scoreboard__row">
                      <td class="joy-match-scoreboard__player-cell"><span>Player A</span></td>
                      <td class="joy-match-scoreboard__cell">6</td>
                      <td class="joy-match-scoreboard__cell">4</td>
                      <td class="joy-match-scoreboard__cell joy-match-scoreboard__cell--active">40</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p style="font-size: var(--joy-font-size-xs); color: var(--joy-text-secondary); margin: 0; font-weight: var(--joy-font-weight-medium);">High-Noon Outdoor mode tokens enforce 2px high-opacity borders, deep tabular numerals, and bevel elevation highlights visible even in intense sunlight.</p>
            </div>
          </div>
        </div>
      </section>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script>
    (function () {
      var theme = null;
      try { theme = localStorage.getItem('joy-theme'); } catch (e) {}
      if (theme !== 'light' && theme !== 'dark') {
        theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', theme);
      var palette = 'classic';
      try { palette = localStorage.getItem('joy-palette') || 'classic'; } catch (e) {}
      document.documentElement.setAttribute('data-palette', palette);
    })();
  </script>
  <title>Joymify Design System & Component Portal</title>
  <link rel="icon" href="favicon.svg" type="image/svg+xml">
  <style id="joy-theme-inline">
${inlinedThemeCss}
  </style>
  <link rel="stylesheet" href="/theme.css?v=2.3">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --sidebar-width: 280px;
      --hub-sidebar-bg: var(--joy-surface-card);
      --hub-topbar-bg: var(--joy-surface-card);
      --hub-chrome-border: var(--joy-border-default);
      --hub-code-bg: var(--joy-surface-sunken);
      --hub-code-fg: var(--joy-text-primary);
      --hub-drawer-edge: var(--joy-elevation-3);
      --hub-scrim: var(--joy-surface-inverse);
    }
    [data-theme="dark"] {
      --hub-sidebar-bg: var(--joy-surface-card);
      --hub-topbar-bg: var(--joy-surface-card);
      --hub-chrome-border: var(--joy-border-strong);
      --hub-code-bg: var(--joy-surface-sunken);
      --hub-code-fg: var(--joy-text-primary);
      --hub-drawer-edge: 1px 0 0 var(--joy-border-strong);
      /* surface-inverse is cream in dark, so the scrim uses the darkest neutral to dim rather than wash out. */
      --hub-scrim: var(--joy-color-neutral-950);
    }
    .hub-glare-active {
      filter: brightness(1.2) contrast(1.15);
    }
    * {
      box-sizing: border-box;
      min-width: 0;
    }
    html, body {
      max-width: 100vw;
      overflow-x: hidden;
    }
    html {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    body {
      font-family: var(--joy-font-family-sans);
      background-color: var(--joy-surface-canvas);
      color: var(--joy-text-primary);
      margin: 0;
      padding: 0;
      display: flex;
      height: 100vh;
      overflow: hidden;
      overflow-wrap: break-word;
    }

    /* Sleek custom scrollbars: thin, pill-shaped thumb, transparent track, theme-aware */
    * {
      scrollbar-width: thin;
      scrollbar-color: var(--joy-border-default) transparent;
    }
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background-color: var(--joy-border-default);
      border-radius: var(--joy-radius-full);
    }
    ::-webkit-scrollbar-thumb:hover {
      background-color: var(--joy-border-strong);
    }

    /* Sidebar */
    .sidebar {
      width: var(--sidebar-width);
      background: var(--hub-sidebar-bg);
      border-right: 1px solid var(--hub-chrome-border);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      height: 100%;
    }
    .brand {
      padding: 24px 20px;
      border-bottom: 1px solid var(--joy-border-subtle);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-info h2 {
      margin: 0;
      font-size: var(--joy-font-size-md);
      font-weight: 700;
      color: var(--joy-text-primary);
      letter-spacing: -0.01em;
    }
    .brand-info span {
      font-size: var(--joy-font-size-xs);
      color: var(--joy-accent-text);
      font-weight: 600;
    }
    .sidebar-search {
      padding: 12px 12px 6px;
      flex-shrink: 0;
    }
    .sidebar-search__inner {
      position: relative;
      display: flex;
      align-items: center;
      background: var(--joy-surface-sunken);
      border: 1px solid var(--joy-border-default);
      border-radius: var(--joy-radius-md);
      transition: border-color var(--joy-duration-fast), box-shadow var(--joy-duration-fast);
    }
    .sidebar-search__inner:focus-within {
      border-color: var(--joy-focus-ring);
      box-shadow: 0 0 0 2px var(--joy-focus-ring);
    }
    .sidebar-search__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-left: 10px;
      color: var(--joy-text-secondary);
      pointer-events: none;
      flex-shrink: 0;
    }
    .sidebar-search__input {
      flex: 1;
      width: 100%;
      min-width: 0;
      height: 36px;
      padding: 0 8px;
      background: transparent;
      border: none;
      outline: none;
      font-size: var(--joy-font-size-sm);
      font-family: inherit;
      color: var(--joy-text-primary);
    }
    .sidebar-search__input::placeholder {
      color: var(--joy-text-secondary);
      opacity: 0.85;
    }
    .sidebar-search__input::-webkit-search-decoration,
    .sidebar-search__input::-webkit-search-cancel-button,
    .sidebar-search__input::-webkit-search-results-button,
    .sidebar-search__input::-webkit-search-results-decoration {
      display: none;
    }
    .sidebar-search__clear {
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--joy-text-secondary);
      cursor: pointer;
      padding: 4px;
      margin-right: 6px;
      border-radius: var(--joy-radius-sm);
      transition: color var(--joy-duration-fast), background-color var(--joy-duration-fast);
    }
    .sidebar-search__clear:hover {
      color: var(--joy-text-primary);
      background: var(--joy-surface-sunken);
    }
    .sidebar-search__kbd {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 2px 6px;
      margin-right: 8px;
      font-size: var(--joy-font-size-xs);
      font-family: inherit;
      font-weight: 600;
      color: var(--joy-text-secondary);
      background: var(--joy-surface-card);
      border: 1px solid var(--joy-border-default);
      border-radius: var(--joy-radius-sm);
      pointer-events: none;
      line-height: 1;
      user-select: none;
      flex-shrink: 0;
    }
    .nav {
      flex: 1;
      overflow-y: auto;
      padding: 10px 12px 16px;
    }
    .nav-section {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: var(--joy-font-size-xs);
      font-weight: 600;
      color: var(--joy-text-secondary);
      padding: 10px 12px 6px;
      margin-top: 8px;
    }
    .nav-section-count {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 1px 6px;
      font-size: 11px;
      font-weight: 600;
      border-radius: var(--joy-radius-pill);
      background: var(--joy-surface-sunken);
      color: var(--joy-text-secondary);
      border: 1px solid var(--joy-border-subtle);
      line-height: 1.2;
    }
    .nav-match-highlight {
      background: var(--joy-accent-subtle);
      color: var(--joy-accent-text);
      border-radius: var(--joy-radius-sm);
      padding: 0 2px;
      font-weight: 600;
    }
    .sidebar-search__empty {
      padding: 32px 16px;
      text-align: center;
      color: var(--joy-text-secondary);
    }
    .sidebar-search__empty-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 8px;
      opacity: 0.6;
      color: var(--joy-text-secondary);
    }
    .sidebar-search__empty-title {
      font-size: var(--joy-font-size-sm);
      font-weight: 600;
      color: var(--joy-text-primary);
      margin-bottom: 4px;
    }
    .sidebar-search__empty-desc {
      font-size: var(--joy-font-size-xs);
      color: var(--joy-text-secondary);
      line-height: 1.4;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: var(--joy-font-size-sm);
      font-weight: 500;
      color: var(--joy-text-secondary);
      text-decoration: none;
      cursor: pointer;
      transition: background-color var(--joy-duration-fast), color var(--joy-duration-fast);
    }
    .nav-item:hover {
      background: var(--joy-surface-sunken);
      color: var(--joy-text-primary);
    }
    .nav-item.active {
      background: var(--joy-accent-subtle);
      color: var(--joy-accent-text);
      font-weight: 600;
    }
    .nav-item .icon {
      font-size: var(--joy-font-size-md);
    }

    /* Main Content */
    .main {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }
    .topbar {
      min-height: 60px;
      border-bottom: 1px solid var(--hub-chrome-border);
      background: var(--hub-topbar-bg);
      padding: 0 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: nowrap;
      gap: var(--joy-space-2);
      position: sticky;
      top: 0;
      z-index: var(--joy-z-sticky);
    }
    .topbar__start,
    .topbar__end {
      display: flex;
      align-items: center;
      gap: var(--joy-space-3);
      flex-shrink: 0;
    }
    .topbar-brand {
      display: none;
      align-items: center;
      gap: var(--joy-space-2);
      font-size: var(--joy-font-size-md);
      font-weight: 700;
      color: var(--joy-text-primary);
      white-space: nowrap;
    }
    .brand-logo.brand-logo--compact {
      width: 28px;
      height: 28px;
    }
    #btn-theme-toggle.hub-theme-toggle {
      flex-shrink: 0;
      gap: var(--joy-space-2);
      border: 1px solid var(--hub-chrome-border);
    }
    .hub-theme-toggle__icon {
      display: inline-flex;
      align-items: center;
    }
    .hub-palette-picker {
      position: relative;
    }
    #btn-palette-toggle.hub-palette-toggle {
      flex-shrink: 0;
      gap: var(--joy-space-2);
      border: 1px solid var(--hub-chrome-border);
    }
    .hub-palette-swatch {
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .swatch-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 1px solid var(--joy-border-subtle);
      box-sizing: border-box;
      display: inline-block;
    }
    #hub-palette-active-swatch .swatch-dot--1 { background: var(--joy-accent-default); }
    #hub-palette-active-swatch .swatch-dot--2 { background: var(--joy-surface-raised); }
    #hub-palette-active-swatch .swatch-dot--3 { background: var(--joy-border-focus); }
    .hub-palette-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      right: 0;
      width: 260px;
      background: var(--joy-surface-card);
      border: 1px solid var(--joy-border-default);
      border-radius: var(--joy-radius-card);
      box-shadow: var(--joy-elevation-3);
      padding: var(--joy-space-1);
      z-index: var(--joy-z-dropdown);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .hub-palette-dropdown[hidden] {
      display: none;
    }
    .hub-palette-item {
      display: flex;
      align-items: center;
      gap: var(--joy-space-2);
      padding: var(--joy-space-2) var(--joy-space-3);
      border-radius: var(--joy-radius-inner);
      cursor: pointer;
      user-select: none;
      transition: background-color var(--joy-duration-fast) var(--joy-ease-out);
    }
    .hub-palette-item:hover, .hub-palette-item.active {
      background: var(--joy-surface-sunken);
    }
    .hub-palette-item:focus-visible {
      outline: 2px solid var(--joy-border-focus);
      outline-offset: -2px;
    }
    .hub-palette-text {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .hub-palette-name {
      font-size: var(--joy-font-size-sm);
      font-weight: 600;
      color: var(--joy-text-primary);
    }
    .hub-palette-sub {
      font-size: var(--joy-font-size-xs);
      color: var(--joy-text-muted);
    }
    .framework-pill {
      display: inline-flex;
      flex-wrap: nowrap;
      background: var(--joy-surface-sunken);
      border: 1px solid var(--hub-chrome-border);
      border-radius: var(--joy-radius-pill);
      padding: 3px;
    }
    .framework-pill--drawer {
      display: none;
    }
    .framework-btn {
      border: none;
      background: transparent;
      padding: 6px 14px;
      font-size: var(--joy-font-size-sm);
      font-weight: 600;
      border-radius: var(--joy-radius-pill);
      cursor: pointer;
      color: var(--joy-text-secondary);
      transition: background-color var(--joy-duration-fast), color var(--joy-duration-fast);
      white-space: nowrap;
    }
    .framework-btn:hover {
      color: var(--joy-text-primary);
    }
    .framework-btn.active {
      background: var(--joy-surface-card);
      color: var(--joy-accent-text);
      box-shadow: var(--joy-elevation-1);
    }
    .nav-item:focus-visible,
    .framework-btn:focus-visible,
    .mobile-menu-btn:focus-visible,
    .sidebar-close-btn:focus-visible {
      outline: 2px solid var(--joy-border-focus);
      outline-offset: 2px;
    }
    .content-area {
      max-width: 1080px;
      width: 100%;
      margin: 0 auto;
      padding: 36px 32px 64px;
    }
    /* Overview landing cards: keyboard-reachable (role="link" + tabindex), not inline styles. */
    /* Stacked demo controls inside a forms matrix cell get breathing room between field groups. */
    [data-matrix="forms"] > section {
      display: flex;
      flex-direction: column;
      gap: var(--joy-space-3);
    }
    [data-matrix="forms"] > section > h3 {
      margin: 0;
    }
    .hub-card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 210px), 1fr));
      gap: var(--joy-space-4);
      margin-bottom: var(--joy-space-8);
    }
    .hub-card {
      display: block;
      background: var(--joy-surface-card);
      border: 1px solid var(--hub-chrome-border);
      border-radius: var(--joy-radius-lg);
      padding: var(--joy-space-6);
      cursor: pointer;
    }
    .hub-card:focus-visible {
      outline: 2px solid var(--joy-border-focus);
      outline-offset: 2px;
    }
    .hub-card__desc {
      color: var(--joy-text-muted);
      font-size: var(--joy-font-size-sm);
      margin: 0;
      line-height: 1.5;
    }

    /* Joymify Developer Platform & Cross-Library Navigator */
    .sidebar-suite-wrap {
      border-top: 1px solid var(--hub-chrome-border);
      padding: var(--joy-space-3) var(--joy-space-3) var(--joy-space-4);
      background: var(--joy-surface-raised);
      flex-shrink: 0;
    }
    .sidebar-suite-title {
      font-size: var(--joy-font-size-xs);
      font-weight: 600;
      color: var(--joy-text-secondary);
      padding: 0 var(--joy-space-1) var(--joy-space-2);
    }
    .sidebar-suite-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sidebar-suite-item {
      display: flex;
      align-items: center;
      gap: var(--joy-space-2);
      padding: var(--joy-space-2) var(--joy-space-2);
      border-radius: var(--joy-radius-md);
      font-size: var(--joy-font-size-xs);
      color: var(--joy-text-secondary);
      text-decoration: none;
      transition: background var(--joy-duration-fast) var(--joy-ease-out-quint), color var(--joy-duration-fast) var(--joy-ease-out-quint);
    }
    .sidebar-suite-item:hover {
      background: var(--joy-surface-sunken);
      color: var(--joy-text-primary);
    }
    .sidebar-suite-item.active {
      background: var(--joy-surface-sunken);
      color: var(--joy-text-primary);
      font-weight: 600;
    }
    .sidebar-suite-item__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--joy-text-secondary);
      flex-shrink: 0;
    }
    .sidebar-suite-item.active .sidebar-suite-item__icon {
      color: var(--joy-accent-default);
    }
    .sidebar-suite-item__name {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sidebar-suite-item__badge {
      font-size: var(--joy-font-size-xs);
      padding: 1px 5px;
      border-radius: var(--joy-radius-sm);
      background: var(--joy-accent-subtle);
      color: var(--joy-accent-text);
      font-weight: 600;
    }
    .sidebar-suite-item__ext {
      opacity: 0.7;
      flex-shrink: 0;
    }

    /* Developer Portal Bento Section */
    .dev-portal-section {
      margin-bottom: var(--joy-space-8);
      margin-top: var(--joy-space-6);
    }
    .dev-portal-header {
      margin-bottom: var(--joy-space-6);
    }
    .dev-portal-header__badge {
      margin-bottom: var(--joy-space-2);
    }
    .dev-portal-heading {
      font-size: var(--joy-font-size-2xl);
      font-weight: 700;
      color: var(--joy-text-primary);
      margin: 0 0 var(--joy-space-2) 0;
      letter-spacing: -0.02em;
    }
    .dev-portal-sub {
      font-size: var(--joy-font-size-sm);
      color: var(--joy-text-secondary);
      max-width: 680px;
      margin: 0;
      line-height: 1.5;
    }
    .dev-portal-bento {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 260px), 1fr));
      gap: var(--joy-space-4);
      margin-bottom: var(--joy-space-6);
    }
    .dev-portal-card {
      background: var(--joy-surface-raised);
      border: 1px solid var(--hub-chrome-border);
      border-radius: var(--joy-radius-lg);
      padding: var(--joy-space-5);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--joy-space-4);
      transition: border-color var(--joy-duration-fast) var(--joy-ease-out-quint), box-shadow var(--joy-duration-fast) var(--joy-ease-out-quint), transform var(--joy-duration-fast) var(--joy-ease-out-quint);
    }
    .dev-portal-card:hover {
      border-color: var(--joy-accent-default);
      box-shadow: var(--joy-elevation-sm);
      transform: translateY(-2px);
    }
    .dev-portal-card__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--joy-space-2);
    }
    .dev-portal-version {
      font-size: var(--joy-font-size-xs);
      font-weight: 600;
      color: var(--joy-text-secondary);
      font-family: var(--joy-font-family-mono);
      background: var(--joy-surface-sunken);
      padding: 2px 6px;
      border-radius: var(--joy-radius-sm);
      border: 1px solid var(--joy-border-subtle);
    }
    .dev-portal-card__title {
      display: flex;
      align-items: center;
      gap: var(--joy-space-2);
      font-size: var(--joy-font-size-lg);
      font-weight: 600;
      color: var(--joy-text-primary);
      margin: 0 0 var(--joy-space-2) 0;
    }
    .dev-portal-card__desc {
      font-size: var(--joy-font-size-xs);
      color: var(--joy-text-secondary);
      line-height: 1.5;
      margin: 0 0 var(--joy-space-3) 0;
    }
    .dev-portal-card__code {
      background: var(--joy-surface-sunken);
      border: 1px solid var(--joy-border-subtle);
      border-radius: var(--joy-radius-md);
      padding: var(--joy-space-2) var(--joy-space-3);
      margin-bottom: var(--joy-space-3);
      font-family: var(--joy-font-family-mono);
      font-size: var(--joy-font-size-xs);
      color: var(--joy-text-primary);
      line-height: 1.4;
      overflow-x: auto;
    }
    .dev-portal-card__tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--joy-space-1);
    }
    .dev-portal-card__footer {
      display: flex;
      flex-wrap: wrap;
      gap: var(--joy-space-2);
      padding-top: var(--joy-space-3);
      border-top: 1px solid var(--joy-border-subtle);
    }

    /* Dedicated Developer Portal Hero Landing Page (active on dev.joymify.com root) */
    body.portal-mode {
      background: var(--joy-surface-canvas);
    }
    body.portal-mode .sidebar,
    body.portal-mode .sidebar-backdrop,
    body.portal-mode .mobile-menu-btn {
      display: none !important;
    }
    body.portal-mode .main {
      margin-left: 0 !important;
      max-width: 100% !important;
      min-height: 100vh;
    }
    body.portal-mode .topbar {
      max-width: 1240px;
      margin: 0 auto;
      padding: var(--joy-space-4) var(--joy-space-6);
      width: 100%;
      border-bottom: 1px solid var(--hub-chrome-border);
      box-sizing: border-box;
    }
    body.portal-mode .topbar-brand {
      display: inline-flex !important;
      min-width: 0;
    }
    body.portal-mode .topbar-brand__name {
      font-size: var(--joy-font-size-base);
      font-weight: 700;
      letter-spacing: -0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    body.portal-mode .framework-pill--topbar {
      display: none !important;
    }
    .topbar-portal-nav {
      display: none;
    }
    @media (min-width: 901px) {
      body.portal-mode .topbar-portal-nav {
        display: flex;
        align-items: center;
        gap: var(--joy-space-4);
        margin-left: var(--joy-space-6);
      }
    }
    .topbar-portal-link {
      font-size: var(--joy-font-size-sm);
      font-weight: 500;
      color: var(--joy-text-secondary);
      text-decoration: none;
      transition: color var(--joy-duration-fast) var(--joy-ease-out-quint);
    }
    .topbar-portal-link:hover {
      color: var(--joy-text-primary);
    }
    body.portal-mode .content-area {
      max-width: 1240px;
      margin: 0 auto;
      padding: var(--joy-space-8) var(--joy-space-6);
      box-sizing: border-box;
    }
    @media (max-width: 900px) {
      body.portal-mode .topbar {
        padding: var(--joy-space-2) var(--joy-space-3);
      }
      body.portal-mode .content-area {
        padding: var(--joy-space-4) var(--joy-space-3);
      }
      body.portal-mode .portal-hero {
        padding: var(--joy-space-8) var(--joy-space-3) var(--joy-space-6) var(--joy-space-3);
      }
    }
    body.portal-mode .joy-hero {
      display: none !important;
    }
    .portal-hero {
      display: none;
      text-align: center;
      padding: var(--joy-space-12) var(--joy-space-4) var(--joy-space-10) var(--joy-space-4);
      max-width: 860px;
      margin: 0 auto;
    }
    body.portal-mode .portal-hero {
      display: block;
    }
    .portal-hero__badge {
      display: inline-flex;
      align-items: center;
      margin-bottom: var(--joy-space-4);
    }
    .portal-hero__title {
      font-size: clamp(2rem, 5vw, 3.25rem);
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.03em;
      color: var(--joy-text-primary);
      margin: 0 0 var(--joy-space-4) 0;
    }
    .portal-hero__title-emphasis {
      color: var(--joy-accent-default);
    }
    .portal-hero__subtitle {
      font-size: clamp(1rem, 2vw, 1.25rem);
      line-height: 1.6;
      color: var(--joy-text-secondary);
      max-width: 680px;
      margin: 0 auto var(--joy-space-8) auto;
    }
    .portal-hero__ctas {
      display: flex;
      flex-wrap: wrap;
      gap: var(--joy-space-3);
      justify-content: center;
      align-items: center;
    }
    .portal-back-link {
      display: inline-flex;
      align-items: center;
      gap: var(--joy-space-2);
      font-size: var(--joy-font-size-xs);
      font-weight: 600;
      color: var(--joy-text-primary);
      text-decoration: none;
      padding: var(--joy-space-2) var(--joy-space-3);
      border-radius: var(--joy-radius-md);
      background: var(--joy-surface-sunken);
      border: 1px solid var(--joy-border-subtle);
      margin: 0 var(--joy-space-3) var(--joy-space-3) var(--joy-space-3);
      transition: background var(--joy-duration-fast) var(--joy-ease-out-quint), color var(--joy-duration-fast) var(--joy-ease-out-quint);
    }
    .portal-back-link:hover {
      background: var(--joy-surface-hover);
      color: var(--joy-accent-default);
    }

    /* Component Canvas & Docs */
    .view-panel {
      display: none;
    }
    .view-panel.active {
      display: block;
      animation: joy-fade-in var(--joy-duration-fast) ease-out;
    }
    .header-tagline {
      margin-top: 4px;
      color: var(--joy-text-muted);
      font-size: var(--joy-font-size-md);
      margin-bottom: 24px;
    }
    .playground-box {
      background: var(--joy-surface-card);
      border: 1px solid var(--hub-chrome-border);
      border-radius: 12px;
      box-shadow: none;
      margin-bottom: 32px;
      overflow: hidden;
    }
    .playground-header {
      padding: 16px 20px;
      background: var(--joy-surface-raised);
      border-bottom: 1px solid var(--joy-border-default);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      min-width: 0;
    }
    .playground-header h4 {
      margin: 0;
      font-size: var(--joy-font-size-md);
      font-weight: 600;
      color: var(--joy-text-primary);
      min-width: 0;
      flex: 1 1 auto;
      overflow-wrap: break-word;
      word-break: break-word;
    }
    .playground-header .joy-badge,
    .playground-header span[class*="joy-badge"] {
      flex-shrink: 0;
    }
    .component-card {
      background: var(--joy-surface-card);
      border: 1px solid var(--hub-chrome-border);
      border-radius: 12px;
      box-shadow: none;
      margin-bottom: 32px;
      overflow: hidden;
    }
    .component-header {
      padding: 16px 20px;
      background: var(--joy-surface-raised);
      border-bottom: 1px solid var(--joy-border-default);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      min-width: 0;
    }
    .component-header > div:first-child {
      min-width: 0;
      flex: 1 1 auto;
    }
    .component-title {
      font-size: var(--joy-font-size-md);
      font-weight: 600;
      color: var(--joy-text-primary);
      overflow-wrap: break-word;
      word-break: break-word;
    }
    .component-desc {
      font-size: var(--joy-font-size-sm);
      color: var(--joy-text-muted);
      margin-top: 4px;
      line-height: 1.4;
      overflow-wrap: break-word;
      word-break: break-word;
    }
    .component-canvas {
      padding: 24px;
      display: flex;
      background-color: var(--joy-surface-card);
      min-width: 0;
      overflow-x: auto;
    }
    .joy-select-wrapper--open .joy-select__listbox {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      min-width: 100%;
    }
    .hub-sheet-demo {
      min-width: 0;
    }
    @media (max-width: 480px) {
      .hub-sheet-demo[data-sheet-demo] {
        width: 100vw;
        margin-left: calc(50% - 50vw);
      }
    }
    /* Wave 3 (F-038) aspect views: token-only matrices */
    .hub-matrix {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
      gap: var(--joy-space-4);
      align-items: start;
      width: 100%;
      min-width: 0;
    }
    .hub-matrix--stack {
      grid-template-columns: minmax(0, 1fr);
    }
    /* The always-open Tooltip demo sits on the tooltip layer, above modals and drawers; hide it while a hub dialog is open so it does not float over the overlay. */
    body.hub-dialog-open .joy-tooltip[data-static] {
      visibility: hidden;
    }
    .hub-matrix__cell {
      min-width: 0;
    }
    .hub-matrix__cell > h4 {
      margin: 0 0 var(--joy-space-2);
      font-size: var(--joy-font-size-xs);
      font-weight: 600;
      color: var(--joy-text-secondary);
    }
    .hub-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--joy-space-2);
    }
    .hub-pane {
      padding: var(--joy-space-3);
      font-size: var(--joy-font-size-sm);
      color: var(--joy-text-secondary);
    }
    .hub-pane p {
      margin: var(--joy-space-1) 0 0;
    }
    /* Message and Notification are position: fixed toasts; keep the static states in flow. */
    .hub-static-feedback .joy-message,
    .hub-static-feedback .joy-notification {
      position: static;
      transform: none;
      max-width: 100%;
    }
    .hub-static-feedback .joy-message {
      align-items: flex-start;
    }
    .hub-static-feedback .joy-notification__notice {
      width: 100%;
    }
    .canvas {
      padding: 44px 32px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: var(--joy-space-4);
      flex-wrap: wrap;
      background: var(--joy-surface-canvas);
      background-image: radial-gradient(var(--joy-border-default) 1.2px, transparent 0);
      background-size: 20px 20px;
      min-height: 180px;
      position: relative;
    }
    [data-theme="dark"] .canvas {
      background: var(--joy-surface-canvas);
      background-image: radial-gradient(var(--joy-border-default) 1.2px, transparent 0);
    }
    .controls-table {
      width: 100%;
      border-top: 1px solid var(--joy-border-default);
      background: var(--joy-surface-card);
      border-collapse: collapse;
      font-size: var(--joy-font-size-sm);
    }
    .controls-table td {
      padding: 14px 24px;
      border-bottom: 1px solid var(--joy-surface-sunken);
      vertical-align: middle;
    }
    .controls-table td:first-child {
      font-weight: 600;
      color: var(--joy-text-secondary);
      width: 180px;
    }
    .segmented-control {
      display: inline-flex;
      flex-wrap: wrap;
      max-width: 100%;
      background: var(--joy-surface-sunken);
      border: 1px solid var(--joy-border-default);
      border-radius: 8px;
      padding: 3px;
      gap: 2px;
    }
    .segment-btn {
      appearance: none;
      -webkit-appearance: none;
      border: none;
      background: transparent;
      padding: 6px 14px;
      font-size: var(--joy-font-size-sm);
      font-weight: 500;
      color: var(--joy-text-muted);
      border-radius: 6px;
      cursor: pointer;
      transition: background-color var(--joy-duration-fast), color var(--joy-duration-fast), box-shadow var(--joy-duration-fast);
      font-family: inherit;
      white-space: nowrap;
    }
    .segment-btn:hover {
      color: var(--joy-text-primary);
    }
    .segment-btn.active {
      background: var(--joy-surface-card);
      color: var(--joy-text-primary);
      font-weight: 600;
      box-shadow: none;
    }
    .code-snippet {
      background: var(--hub-code-bg);
      color: var(--hub-code-fg);
      border: 1px solid var(--hub-chrome-border);
      padding: 16px 20px;
      border-radius: 8px;
      font-family: var(--joy-font-family-mono);
      font-size: var(--joy-font-size-sm);
      overflow-x: auto;
      margin-top: 16px;
      line-height: 1.5;
    }
    .hub-scroll-x {
      overflow-x: auto;
      max-width: 100%;
      -webkit-overflow-scrolling: touch;
      border-radius: var(--joy-radius-md);
    }
    .hub-scroll-x--spaced {
      margin-bottom: var(--joy-space-6);
    }
    .hub-scroll-x:focus-visible {
      outline: 2px solid var(--joy-border-focus);
      outline-offset: 2px;
    }
    .hub-scroll-x > table {
      min-width: 480px;
    }
    .tokens-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--joy-surface-card);
      border-radius: 8px;
      border: 1px solid var(--joy-border-default);
      overflow: hidden;
      font-size: var(--joy-font-size-sm);
    }
    .tokens-table th, .tokens-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--joy-surface-sunken);
      text-align: left;
    }
    .tokens-table th {
      background: var(--joy-surface-raised);
      font-weight: 600;
    }
    .color-swatch {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid transparent;
      display: inline-block;
      vertical-align: middle;
      margin-right: 8px;
    }

    /* ── Coherent Dark Mode Overrides for Hub UI ── */
    /* Icon Gallery Styling */
    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 12px;
      width: 100%;
    }
    .icon-card {
      background: var(--joy-surface-card);
      border: 1px solid var(--joy-border-default);
      border-radius: 8px;
      padding: 16px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      transition: background-color var(--joy-duration-fast), border-color var(--joy-duration-fast), color var(--joy-duration-fast), transform var(--joy-duration-fast);
    }
    .icon-card:hover {
      border-color: var(--joy-accent-default);
      transform: translateY(-2px);
      box-shadow: none;
    }
    .icon-preview {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--joy-text-secondary);
    }
    .icon-name {
      font-size: var(--joy-font-size-xs);
      font-weight: 500;
      color: var(--joy-text-muted);
      text-align: center;
      word-break: break-all;
    }

    [data-theme="dark"] .component-canvas {
      background-color: var(--joy-surface-card);
    }

    /* ── Mobile Navigation Drawer & Backdrop ── */
    .sidebar-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: color-mix(in srgb, var(--hub-scrim) 55%, transparent);
      z-index: var(--joy-z-backdrop);
      opacity: 0;
      transition: opacity var(--joy-duration-normal) ease;
    }
    .sidebar-backdrop.active {
      display: block;
      opacity: 1;
    }
    .mobile-menu-btn,
    .sidebar-close-btn {
      display: none;
      appearance: none;
      -webkit-appearance: none;
      min-width: 44px;
      min-height: 44px;
      padding: 0;
      align-items: center;
      justify-content: center;
      border-radius: var(--joy-radius-md);
      cursor: pointer;
      color: var(--joy-text-secondary);
      transition: background-color var(--joy-duration-fast), color var(--joy-duration-fast);
    }
    .mobile-menu-btn {
      background: transparent;
      border: 1px solid var(--hub-chrome-border);
    }
    .sidebar-close-btn {
      background: transparent;
      border: none;
      margin-left: auto;
    }
    .mobile-menu-btn:hover,
    .sidebar-close-btn:hover {
      background: var(--joy-surface-raised);
      color: var(--joy-text-primary);
    }

    /* ── Interactive 3D Kinetic Particle Canvas ── */
    /* Kinetic hero: a HeroSection over a decorative particle canvas. Only positioning glue targets .joy-hero. */
    .kinetic-canvas-container {
      position: relative;
      width: 100%;
      min-height: 380px;
      display: flex;
      align-items: center;
      border-radius: var(--joy-radius-lg);
      overflow: hidden;
      border: 1px solid var(--hub-chrome-border);
      background: var(--joy-surface-card);
      margin-bottom: var(--joy-space-6);
      transition: border-color var(--joy-duration-normal) var(--joy-ease-default), box-shadow var(--joy-duration-normal) var(--joy-ease-default);
    }
    .kinetic-canvas-container[data-archetype="gold"] {
      border-color: var(--joy-border-subtle);
      box-shadow: 0 0 32px -8px var(--joy-accent-subtle);
    }
    .kinetic-canvas-container[data-archetype="cosmos"] {
      border-color: var(--joy-border-focus);
      box-shadow: 0 0 32px -8px var(--joy-border-focus);
    }
    .kinetic-canvas-container[data-archetype="titanium"] {
      border-color: var(--joy-border-default);
      box-shadow: 0 0 24px -8px var(--joy-border-subtle);
    }
    .kinetic-canvas-container[data-archetype="cyberpunk"] {
      border-color: var(--joy-border-subtle);
      box-shadow: 0 0 32px -8px var(--joy-border-focus);
    }
    .kinetic-canvas-container[data-archetype="plasma"] {
      border-color: var(--joy-border-subtle);
      box-shadow: 0 0 32px -8px var(--joy-accent-subtle);
    }
    .kinetic-canvas-container[data-archetype="swiss"] {
      border-color: var(--joy-border-default);
      box-shadow: var(--joy-elevation-low);
    }
    .kinetic-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      cursor: crosshair;
    }
    .kinetic-canvas-container > .joy-hero {
      position: relative;
      z-index: var(--joy-z-base);
    }
    .kinetic-subvariants-bar {
      position: absolute;
      top: var(--joy-space-3);
      left: 0;
      right: 0;
      z-index: var(--joy-z-sticky);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--joy-space-xs);
      flex-wrap: wrap;
      padding: 0 var(--joy-space-4);
      pointer-events: auto;
    }
    .kinetic-subvariants-label {
      font-size: var(--joy-font-size-xs);
      font-weight: 600;
      color: var(--joy-text-secondary);
      margin-right: 4px;
      letter-spacing: 0.02em;
    }
    .kinetic-sub-btn {
      position: relative;
      z-index: var(--joy-z-sticky);
      padding: 4px 12px;
      font-size: var(--joy-font-size-xs);
      font-family: inherit;
      font-weight: 500;
      border-radius: var(--joy-radius-full);
      border: 1px solid var(--joy-border-subtle);
      background: var(--joy-surface-raised);
      color: var(--joy-text-secondary);
      cursor: pointer;
      user-select: none;
      pointer-events: auto;
      transition: all var(--joy-duration-fast) var(--joy-ease-default);
    }
    .kinetic-sub-btn:hover:not(.active) {
      background: var(--joy-surface-sunken);
      color: var(--joy-text-primary);
      border-color: var(--joy-border-default);
    }
    .kinetic-sub-btn.active {
      background: var(--joy-accent-default);
      color: var(--joy-text-on-accent);
      border-color: var(--joy-accent-default);
      font-weight: 600;
      box-shadow: var(--joy-elevation-low);
    }
    /* No animation: a still wash in the accent hue stands in for the moving field. */
    @media (pointer: coarse), (prefers-reduced-motion: reduce) {
      .kinetic-canvas-container {
        background-image:
          radial-gradient(circle at 25% 20%, var(--joy-accent-subtle), transparent 60%),
          radial-gradient(circle at 80% 85%, var(--joy-accent-subtle), transparent 55%);
      }
    }
    @media (pointer: coarse) {
      .kinetic-canvas {
        display: none;
      }
    }

    /* ── Hero Options & 3D / Editorial Landing Variants ── */
    .landing-hero-options-wrapper {
      margin-bottom: var(--joy-space-6);
    }
    .landing-hero-options-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--joy-space-4);
      flex-wrap: wrap;
      gap: 12px;
      padding: 0 4px;
    }
    .hero-option-panel {
      transition: opacity var(--joy-duration-normal) var(--joy-ease-default);
    }

    /* 3D Volumetric Wave Mesh Hero (OpenAI Codex style) */
    .mesh-3d-hero-container {
      position: relative;
      width: 100%;
      min-height: 440px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--joy-radius-lg);
      overflow: hidden;
      border: 1px solid var(--hub-chrome-border);
      background: var(--joy-surface-card);
      margin-bottom: var(--joy-space-6);
    }
    .mesh-3d-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      pointer-events: none;
    }
    .mesh-3d-hero-container > .joy-hero {
      position: relative;
      z-index: var(--joy-z-base);
    }
    @media (pointer: coarse), (prefers-reduced-motion: reduce) {
      .mesh-3d-hero-container {
        background-image:
          radial-gradient(circle at 75% 25%, var(--joy-accent-subtle), transparent 65%),
          radial-gradient(circle at 20% 80%, var(--joy-accent-subtle), transparent 60%);
      }
    }
    @media (pointer: coarse) {
      .mesh-3d-canvas {
        display: none;
      }
    }

    /* ── Hero Variants (8 Archetypes) & Apple Continuous Narrative Showcase ── */
    .hub-segmented-ctrl--wrap {
      flex-wrap: wrap;
      gap: 6px;
    }

    /* 1. Centered Luxury Editorial Image Cover (Gucci / Bottega / Vogue Style) */
    .editorial-cover-container {
      position: relative;
      width: 100%;
      min-height: 560px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      border-radius: var(--joy-radius-lg);
      overflow: hidden;
      border: 1px solid var(--hub-chrome-border);
      background: var(--joy-surface-sunken);
      padding: 64px 32px;
      margin-bottom: var(--joy-space-6);
    }
    .editorial-cover__image-backdrop {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .editorial-cover__svg-art {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .editorial-cover__topbar {
      position: absolute;
      top: 24px;
      left: 32px;
      right: 32px;
      z-index: var(--joy-z-base);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .editorial-cover__locale {
      font-size: var(--joy-font-size-xs);
      font-weight: 600;
      color: var(--joy-text-muted);
      letter-spacing: 0.15em;
    }
    .editorial-cover__brand {
      font-size: var(--joy-font-size-md);
      font-weight: 700;
      color: var(--joy-text-primary);
      letter-spacing: 0.35em;
      text-transform: uppercase;
    }
    .editorial-cover__actions {
      display: flex;
      gap: 8px;
    }
    .editorial-cover__action-label {
      font-size: var(--joy-font-size-xs);
      font-weight: 600;
      color: var(--joy-text-secondary);
      letter-spacing: 0.15em;
    }
    .editorial-cover__centerpiece {
      position: relative;
      z-index: var(--joy-z-base);
      text-align: center;
      max-width: 680px;
      margin: 0 auto;
      padding: 0 16px;
    }
    .editorial-cover__eyebrow {
      font-size: var(--joy-font-size-sm);
      font-weight: 600;
      color: var(--joy-accent-text);
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin-bottom: 16px;
    }
    .editorial-cover__title {
      font-size: clamp(2.2rem, 5vw, 3.8rem);
      font-weight: 800;
      color: var(--joy-text-primary);
      line-height: var(--joy-line-height-tight);
      margin: 0 0 16px 0;
      letter-spacing: -0.02em;
      font-family: Georgia, serif;
    }
    .editorial-cover__desc {
      font-size: var(--joy-font-size-lg);
      color: var(--joy-text-secondary);
      line-height: var(--joy-line-height-normal);
      margin: 0 0 32px 0;
    }
    .editorial-cover__cta-wrap {
      display: flex;
      justify-content: center;
    }
    .editorial-cover__btn {
      padding: 14px 36px;
      border-radius: var(--joy-radius-full);
      box-shadow: var(--joy-elevation-accent-1);
      font-weight: 600;
      letter-spacing: 0.04em;
    }
    .editorial-cover__bottombar {
      position: absolute;
      bottom: 24px;
      left: 32px;
      right: 32px;
      z-index: var(--joy-z-base);
      display: flex;
      justify-content: space-between;
      font-size: var(--joy-font-size-xs);
      font-weight: 500;
      color: var(--joy-text-muted);
      letter-spacing: 0.15em;
    }

    /* 2. Apple Keynote Hardware Hero */
    .keynote-hero-container {
      position: relative;
      width: 100%;
      min-height: 520px;
      border-radius: var(--joy-radius-lg);
      overflow: hidden;
      border: 1px solid var(--hub-chrome-border);
      background: var(--joy-surface-sunken);
      padding: 48px 32px 32px;
      margin-bottom: var(--joy-space-6);
    }
    .keynote-hero__stage {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .keynote-hero__halo {
      position: absolute;
      top: 15%;
      left: 50%;
      transform: translateX(-50%);
      width: 480px;
      height: 240px;
      background: radial-gradient(ellipse, var(--joy-accent-highlight), transparent 70%);
      opacity: 0.18;
      filter: blur(48px);
      pointer-events: none;
    }
    .keynote-hero__device-mockup {
      margin-top: 24px;
      display: flex;
      justify-content: center;
    }
    .keynote-device-frame {
      width: 320px;
      height: 180px;
      border-radius: 28px;
      border: 3px solid var(--joy-border-strong);
      background: var(--joy-surface-raised);
      box-shadow: 0 20px 40px var(--joy-elevation-3), inset 0 1px 2px var(--joy-accent-highlight);
      padding: 10px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .keynote-device-screen {
      width: 100%;
      height: 100%;
      border-radius: 20px;
      background: var(--joy-surface-canvas);
      border: 1px solid var(--joy-border-subtle);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .keynote-screen-glow {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at 50% 50%, var(--joy-accent-subtle), transparent 70%);
      opacity: 0.6;
    }
    .keynote-screen-content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .keynote-screen-time {
      font-size: var(--joy-font-size-xl);
      font-weight: 700;
      color: var(--joy-text-primary);
    }
    .keynote-screen-chip {
      font-size: var(--joy-font-size-xs);
      font-weight: 600;
      color: var(--joy-accent-text);
      background: var(--joy-accent-subtle);
      padding: 2px 8px;
      border-radius: var(--joy-radius-sm);
      border: 1px solid var(--joy-border-focus);
    }

    /* 3. SaaS Financial Cockpit Hero */
    .cockpit-hero-container {
      position: relative;
      width: 100%;
      min-height: 520px;
      border-radius: var(--joy-radius-lg);
      overflow: hidden;
      border: 1px solid var(--hub-chrome-border);
      background: var(--joy-surface-sunken);
      padding: 40px 32px 32px;
      margin-bottom: var(--joy-space-6);
    }
    .cockpit-hero__telemetry-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
      margin-bottom: 20px;
    }
    .cockpit-telemetry-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: monospace;
      font-size: var(--joy-font-size-xs);
      color: var(--joy-text-secondary);
      background: var(--joy-surface-raised);
      border: 1px solid var(--joy-border-subtle);
      padding: 4px 12px;
      border-radius: var(--joy-radius-full);
    }
    .status-indicator-dot {
      width: 8px;
      height: 8px;
      border-radius: var(--joy-radius-full);
      background: var(--joy-status-success-fg);
      box-shadow: 0 0 6px var(--joy-status-success-border);
    }
    .cockpit-hero__sparkline-dock {
      margin-top: 24px;
      display: flex;
      justify-content: center;
    }
    .cockpit-sparkline-canvas {
      max-width: 100%;
      height: 80px;
      border-radius: var(--joy-radius-md);
      background: var(--joy-surface-raised);
      border: 1px solid var(--joy-border-subtle);
    }

    /* 4. Cyberpunk Kinetic HUD Hero */
    .cyberpunk-hero-container {
      position: relative;
      width: 100%;
      min-height: 500px;
      border-radius: var(--joy-radius-lg);
      overflow: hidden;
      border: 1px solid var(--joy-border-strong);
      background: var(--joy-surface-sunken);
      padding: 48px 32px 36px;
      margin-bottom: var(--joy-space-6);
    }
    .cyberpunk-hud-reticle {
      position: absolute;
      font-family: monospace;
      font-size: var(--joy-font-size-xs);
      color: var(--joy-accent-default);
      opacity: 0.7;
      pointer-events: none;
    }
    .cyberpunk-hud-reticle--tl { top: 16px; left: 16px; }
    .cyberpunk-hud-reticle--tr { top: 16px; right: 16px; }
    .cyberpunk-hud-reticle--bl { bottom: 16px; left: 16px; }
    .cyberpunk-hud-reticle--br { bottom: 16px; right: 16px; }
    .cyberpunk-hud-status-strip {
      display: flex;
      justify-content: center;
      gap: 24px;
      font-family: monospace;
      font-size: var(--joy-font-size-xs);
      color: var(--joy-accent-text);
      margin-bottom: 20px;
      letter-spacing: 0.1em;
    }
    .cyberpunk-scanline-laser {
      position: absolute;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--joy-accent-default), transparent);
      opacity: 0.4;
      animation: scanlineMove 4s ease-in-out infinite alternate;
      pointer-events: none;
    }
    @keyframes scanlineMove {
      0% { top: 10%; }
      100% { top: 90%; }
    }

    /* 5. Swiss Typographic Poster Hero */
    .swiss-hero-container {
      position: relative;
      width: 100%;
      min-height: 500px;
      border-radius: var(--joy-radius-lg);
      overflow: hidden;
      border: 2px solid var(--joy-text-primary);
      background: var(--joy-surface-canvas);
      padding: 36px 32px 28px;
      margin-bottom: var(--joy-space-6);
    }
    .swiss-marquee-bar {
      overflow: hidden;
      white-space: nowrap;
      border-bottom: 1px solid var(--joy-text-primary);
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .swiss-marquee-content {
      display: inline-block;
      font-family: monospace;
      font-size: var(--joy-font-size-xs);
      font-weight: 700;
      color: var(--joy-text-primary);
      letter-spacing: 0.15em;
      animation: swissMarquee 25s linear infinite;
    }
    @keyframes swissMarquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .swiss-grid-footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid var(--joy-text-primary);
      display: flex;
      justify-content: space-between;
      font-family: monospace;
      font-size: var(--joy-font-size-xs);
      color: var(--joy-text-muted);
    }

    /* 6. Luminous Fluid Aura Hero */
    .aura-hero-container {
      position: relative;
      width: 100%;
      min-height: 500px;
      border-radius: var(--joy-radius-lg);
      overflow: hidden;
      border: 1px solid var(--hub-chrome-border);
      background: var(--joy-surface-sunken);
      padding: 48px 32px 36px;
      margin-bottom: var(--joy-space-6);
    }
    .aura-hero__mesh-bg {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }
    .aura-orb {
      position: absolute;
      border-radius: var(--joy-radius-full);
      filter: blur(55px);
      opacity: 0.25;
      animation: auraFloat 8s ease-in-out infinite alternate;
    }
    .aura-orb--1 {
      top: 10%;
      left: 25%;
      width: 280px;
      height: 280px;
      background: var(--joy-accent-default);
    }
    .aura-orb--2 {
      bottom: 15%;
      right: 20%;
      width: 240px;
      height: 240px;
      background: var(--joy-status-info-fg);
      animation-delay: -3s;
    }
    .aura-orb--3 {
      top: 40%;
      left: 55%;
      width: 200px;
      height: 200px;
      background: var(--joy-accent-highlight);
      animation-delay: -5s;
    }
    @keyframes auraFloat {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(25px, 20px) scale(1.1); }
    }

    /* ── Apple Continuous Narrative Scroll Landing View (#view-apple-landing) ── */
    #view-apple-landing {
      padding: 0;
      max-width: 100%;
    }
    .apple-subnav {
      position: sticky;
      top: 56px;
      z-index: 50;
      background: var(--joy-surface-raised);
      border-bottom: 1px solid var(--joy-border-subtle);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }
    .apple-subnav__inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .apple-subnav__title-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .apple-subnav__title {
      font-size: var(--joy-font-size-md);
      font-weight: 700;
      color: var(--joy-text-primary);
      letter-spacing: -0.01em;
    }
    .apple-subnav__badge {
      font-size: var(--joy-font-size-xs);
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--joy-radius-full);
      background: var(--joy-accent-subtle);
      color: var(--joy-accent-text);
      border: 1px solid var(--joy-border-focus);
    }
    .apple-subnav__actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .apple-subnav__link {
      font-size: var(--joy-font-size-sm);
      color: var(--joy-text-secondary);
      text-decoration: none;
      font-weight: 500;
      transition: color var(--joy-duration-fast) var(--joy-ease-default);
    }
    .apple-subnav__link:hover {
      color: var(--joy-text-primary);
    }

    .apple-landing-body {
      width: 100%;
    }
    .apple-scene {
      padding: 80px 24px;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .apple-eyebrow {
      font-size: var(--joy-font-size-sm);
      font-weight: 600;
      color: var(--joy-accent-text);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 8px;
      display: block;
      text-align: center;
    }
    .apple-headline {
      font-size: clamp(2.2rem, 5vw, 4rem);
      font-weight: 800;
      line-height: 1.08;
      text-align: center;
      margin: 0 0 16px 0;
      color: var(--joy-text-primary);
      letter-spacing: -0.03em;
    }
    .apple-tagline {
      font-size: var(--joy-font-size-lg);
      color: var(--joy-text-secondary);
      max-width: 640px;
      text-align: center;
      margin: 0 0 32px 0;
      line-height: var(--joy-line-height-normal);
    }
    .apple-intro__cta-group {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-bottom: 48px;
    }

    /* Scene 2: Interactive Posture & Fold Mechanics */
    .apple-scene__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      align-items: center;
      width: 100%;
    }
    @media (max-width: 900px) {
      .apple-scene__grid {
        grid-template-columns: 1fr;
      }
    }
    .apple-posture__callout-card {
      background: var(--joy-surface-raised);
      border: 1px solid var(--joy-border-subtle);
      border-radius: var(--joy-radius-lg);
      padding: 28px;
      box-shadow: 0 10px 30px var(--joy-elevation-2);
      margin-bottom: 24px;
    }
    .apple-posture__card-title {
      font-size: var(--joy-font-size-md);
      font-weight: 700;
      color: var(--joy-text-primary);
      margin: 0 0 8px 0;
      line-height: var(--joy-line-height-tight);
    }
    .apple-posture__card-desc {
      font-size: var(--joy-font-size-xs);
      color: var(--joy-text-muted);
      margin: 0 0 20px 0;
    }
    .apple-scrub-container {
      position: relative;
      margin: 16px 0;
    }
    .apple-scrub-slider {
      width: 100%;
      height: 8px;
      border-radius: var(--joy-radius-full);
      background: var(--joy-border-subtle);
      outline: none;
      -webkit-appearance: none;
    }
    .apple-scrub-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 32px;
      height: 32px;
      border-radius: var(--joy-radius-full);
      background: var(--joy-accent-default);
      cursor: pointer;
      box-shadow: 0 2px 8px var(--joy-elevation-2);
      border: 2px solid var(--joy-surface-canvas);
    }
    .apple-posture__status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
    }
    .apple-posture__angle-label {
      font-family: monospace;
      font-size: var(--joy-font-size-sm);
      font-weight: 700;
      color: var(--joy-text-primary);
    }
    .apple-posture__mode-badge {
      font-size: var(--joy-font-size-xs);
      font-weight: 600;
      color: var(--joy-accent-text);
      background: var(--joy-accent-subtle);
      padding: 2px 10px;
      border-radius: var(--joy-radius-full);
      border: 1px solid var(--joy-border-focus);
    }
    .apple-posture__pills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .apple-posture-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--joy-surface-raised);
      border: 1px solid var(--joy-border-subtle);
      border-radius: var(--joy-radius-full);
      padding: 8px 16px;
      font-size: var(--joy-font-size-sm);
      font-weight: 600;
      color: var(--joy-text-secondary);
      cursor: pointer;
      transition: all var(--joy-duration-fast) var(--joy-ease-default);
    }
    .apple-posture-pill:hover {
      border-color: var(--joy-accent-default);
      color: var(--joy-text-primary);
    }
    .apple-posture-pill.active {
      background: var(--joy-accent-default);
      color: var(--joy-text-on-accent);
      border-color: var(--joy-accent-default);
    }
    .apple-posture-pill .pill-plus {
      font-weight: 700;
    }

    /* 3D Fold Device Stage */
    .apple-posture__stage {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 480px;
    }
    .apple-fold-stage {
      perspective: 1200px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px 0;
    }
    .apple-fold-device {
      display: flex;
      transform-style: preserve-3d;
      transition: transform 0.1s ease-out;
      box-shadow: 0 30px 60px var(--joy-elevation-3);
      border-radius: 28px;
    }
    .apple-fold-wing {
      width: 220px;
      height: 380px;
      background: var(--joy-surface-inverse);
      border: 4px solid var(--joy-border-strong);
      border-radius: 24px;
      overflow: hidden;
      position: relative;
      box-shadow: inset 0 1px 3px var(--joy-accent-highlight);
    }
    .apple-fold-wing--left {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
      border-right: 1px solid var(--joy-border-subtle);
    }
    .apple-fold-wing--right {
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      border-left: 1px solid var(--joy-border-subtle);
      transform-origin: left center;
      transform: rotateY(-70deg);
      transition: transform 0.1s ease-out;
    }
    .apple-fold-screen {
      width: 100%;
      height: 100%;
      background: var(--joy-surface-canvas);
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    .apple-fold-time {
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--joy-text-primary);
      line-height: 1;
      margin-top: 20px;
    }
    .apple-fold-date {
      font-size: var(--joy-font-size-xs);
      color: var(--joy-text-muted);
      margin-top: 4px;
    }
    .apple-fold-widget {
      width: 48px;
      height: 48px;
      border-radius: var(--joy-radius-full);
      background: var(--joy-surface-raised);
      border: 1px solid var(--joy-border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--joy-text-primary);
    }
    .apple-fold-hinge {
      width: 6px;
      height: 380px;
      background: var(--joy-border-strong);
      z-index: 10;
    }

    /* Scene 3: Cinematic Screen Immersion */
    .apple-cinema__screen-frame {
      position: relative;
      width: 100%;
      max-width: 960px;
      margin: 40px auto 24px;
      display: flex;
      justify-content: center;
    }
    .apple-cinema__ambient-glow {
      position: absolute;
      inset: -20px;
      background: radial-gradient(circle at 50% 50%, var(--joy-accent-highlight), transparent 70%);
      opacity: 0.25;
      filter: blur(40px);
      pointer-events: none;
    }
    .apple-cinema__bezel {
      width: 100%;
      border-radius: 28px;
      border: 4px solid var(--joy-border-strong);
      background: var(--joy-surface-sunken);
      padding: 12px;
      box-shadow: 0 30px 60px var(--joy-elevation-3);
      transition: max-width 0.4s var(--joy-ease-default);
    }
    .apple-cinema__display-canvas {
      width: 100%;
      aspect-ratio: 21 / 9;
      border-radius: 18px;
      background: var(--joy-surface-inverse);
      overflow: hidden;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: aspect-ratio 0.4s var(--joy-ease-default);
    }
    .apple-cinema__art-bg {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--joy-color-navy-900), var(--joy-color-navy-700));
      display: flex;
      align-items: flex-end;
      padding: 32px;
    }
    .apple-cinema__title-card {
      display: flex;
      justify-content: space-between;
      width: 100%;
      align-items: center;
    }
    .apple-cinema__movie-title {
      font-size: 2.2rem;
      font-weight: 900;
      color: var(--joy-color-cream-100);
      letter-spacing: 0.35em;
    }
    .apple-cinema__service-logo {
      font-size: var(--joy-font-size-md);
      font-weight: 700;
      color: var(--joy-color-cream-100);
      opacity: 0.85;
    }
    .apple-cinema__controls-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      width: 100%;
      max-width: 960px;
      gap: 16px;
      align-items: center;
      margin-top: 16px;
    }

    /* Scene 4 & 5: Specs & Finish Customizer */
    .apple-specs-bento {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 20px;
      width: 100%;
      max-width: 1080px;
      margin: 32px auto;
    }
    .apple-bento-tile {
      background: var(--joy-surface-raised);
      border: 1px solid var(--joy-border-subtle);
      border-radius: var(--joy-radius-lg);
      padding: 28px;
    }
    .apple-bento-tile--col-6 { grid-column: span 6; }
    .apple-bento-tile--col-12 { grid-column: span 12; }
    @media (max-width: 768px) {
      .apple-bento-tile--col-6 { grid-column: span 12; }
    }
    .apple-customizer-tray {
      background: var(--joy-surface-raised);
      border: 1px solid var(--joy-border-subtle);
      border-radius: var(--joy-radius-lg);
      padding: 36px;
      max-width: 760px;
      width: 100%;
      margin: 32px auto 0;
      box-shadow: 0 20px 40px var(--joy-elevation-2);
    }
    .apple-finish-swatches {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin: 20px 0 28px;
    }
    .apple-swatch-btn {
      width: 44px;
      height: 44px;
      border-radius: var(--joy-radius-full);
      border: 3px solid var(--joy-surface-raised);
      outline: 2px solid var(--joy-border-subtle);
      cursor: pointer;
      transition: all var(--joy-duration-fast) var(--joy-ease-default);
    }
    .apple-swatch-btn.active {
      outline: 2px solid var(--joy-accent-default);
      transform: scale(1.1);
    }
    .apple-storage-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 28px;
    }
    @media (max-width: 600px) {
      .apple-storage-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    .apple-storage-btn {
      padding: 16px 12px;
      border-radius: var(--joy-radius-md);
      border: 1px solid var(--joy-border-subtle);
      background: var(--joy-surface-sunken);
      color: var(--joy-text-primary);
      cursor: pointer;
      text-align: center;
      font-weight: 600;
    }
    .apple-storage-btn.active {
      border-color: var(--joy-accent-default);
      background: var(--joy-accent-subtle);
      color: var(--joy-accent-text);
    }

    /* ── Smart Glasses Head-Up Display (HUD) (#view-glasses-hud) ── */
    #view-glasses-hud {
      padding: 0;
      max-width: 100%;
    }
    .hud-hero-header {
      padding: 32px 0 24px;
      border-bottom: 1px solid var(--joy-border-subtle);
      margin-bottom: 32px;
    }
    .hud-ambient-switcher {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
      margin-top: 16px;
      max-width: 100%;
    }
    .hud-ambient-switcher .segmented-control {
      max-width: 100%;
      flex-wrap: wrap;
    }
    .hud-ambient-label {
      font-size: var(--joy-font-size-xs);
      font-weight: 600;
      color: var(--joy-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-right: 8px;
    }

    /* Optical Visor Outer Frame — Always Optical Dark in All Cases */
    .hud-visor-frame {
      position: relative;
      width: 100%;
      min-height: 600px;
      border-radius: var(--joy-radius-lg);
      border: 2px solid var(--joy-color-navy-800);
      overflow: hidden;
      background-color: var(--joy-color-navy-950) !important;
      box-shadow: 0 24px 60px var(--joy-elevation-3);
      display: flex;
      flex-direction: column;
      margin-bottom: 32px;
      transition: background 0.3s var(--joy-ease-default);
      color: var(--joy-status-success-fg);
    }
    .hud-visor-frame[data-scene="cyberpunk"] {
      background-color: var(--joy-color-navy-950) !important;
      background-image: radial-gradient(circle at 80% 20%, var(--joy-color-navy-900) 0%, var(--joy-color-navy-950) 70%) !important;
    }
    .hud-visor-frame[data-scene="daylight"] {
      background-color: var(--joy-color-navy-950) !important;
      background-image: radial-gradient(circle at 50% 50%, var(--joy-color-navy-900) 0%, var(--joy-color-navy-950) 100%) !important;
    }
    .hud-visor-frame[data-scene="optical"] {
      background-color: var(--joy-color-navy-950) !important;
      background-image: none !important;
    }
    .hud-reticle-overlay {
      position: absolute;
      inset: 0;
      pointer-events: none;
      border: 1px dashed var(--joy-color-navy-800);
      margin: 12px;
      border-radius: var(--joy-radius-md);
      opacity: 0.35;
    }
    .hud-reticle-corner {
      position: absolute;
      width: 16px;
      height: 16px;
      border-color: var(--joy-status-success-fg);
      border-style: solid;
      border-width: 0;
    }
    .hud-reticle-tl { top: 12px; left: 12px; border-top-width: 2px; border-left-width: 2px; }
    .hud-reticle-tr { top: 12px; right: 12px; border-top-width: 2px; border-right-width: 2px; }
    .hud-reticle-bl { bottom: 12px; left: 12px; border-bottom-width: 2px; border-left-width: 2px; }
    .hud-reticle-br { bottom: 12px; right: 12px; border-bottom-width: 2px; border-right-width: 2px; }

    /* HUD Top Telemetry Bar */
    .hud-telemetry-bar {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid var(--joy-color-navy-800);
      background: var(--joy-color-navy-900);
      font-size: var(--joy-font-size-xs);
      font-family: monospace;
      color: var(--joy-status-success-fg);
    }
    .hud-telemetry-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 700;
      color: var(--joy-status-success-fg);
      letter-spacing: 0.05em;
    }
    .hud-telemetry-metrics {
      display: flex;
      align-items: center;
      gap: 16px;
      color: var(--joy-status-success-fg);
      opacity: 0.9;
    }
    .hud-live-meter {
      display: inline-flex;
      gap: 2px;
      align-items: flex-end;
      height: 12px;
    }
    .hud-meter-bar {
      width: 3px;
      background: var(--joy-status-success-fg);
      border-radius: 1px;
      animation: hudMeterPulse 0.8s ease-in-out infinite alternate;
    }
    @keyframes hudMeterPulse {
      0% { height: 3px; opacity: 0.4; }
      100% { height: 12px; opacity: 1; }
    }

    /* HUD Split Monocular Display (50% / 50%) */
    .hud-display-grid {
      position: relative;
      z-index: 10;
      display: grid;
      grid-template-columns: 1fr 1fr;
      flex: 1;
      gap: 0;
      min-height: 440px;
    }
    @media (max-width: 768px) {
      .hud-ambient-switcher {
        flex-direction: column;
        align-items: flex-start;
      }
      .hud-ambient-switcher .segmented-control {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
      }
      .hud-ambient-switcher .segment-btn {
        flex: 1 1 auto;
        min-width: 80px;
        padding: 6px 8px;
        font-size: var(--joy-font-size-xs);
        text-align: center;
      }
      .hud-telemetry-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 12px 16px;
      }
      .hud-telemetry-metrics {
        flex-wrap: wrap;
        gap: 8px 12px;
        font-size: 11px;
      }
      .hud-display-grid {
        grid-template-columns: 1fr;
      }
      .hud-left-panel {
        padding: 16px;
        border-right: none !important;
        border-bottom: 1px solid var(--joy-color-navy-800);
      }
      .hud-right-panel {
        padding: 16px;
      }
      .hud-temple-controller {
        flex-direction: column;
        align-items: stretch;
        padding: 12px 16px;
      }
      .hud-event-feed {
        max-width: 100% !important;
        width: 100%;
        text-align: center;
      }
      .hud-assist-guide-badge {
        font-size: 10px;
        padding: 2px 6px;
      }
      .hud-assist-header {
        flex-wrap: wrap;
        gap: 6px;
      }
    }

    /* Left Panel: Communication Stream */
    .hud-left-panel {
      padding: 24px;
      border-right: 1px solid var(--joy-color-navy-800);
      display: flex;
      flex-direction: column;
    }
    .hud-com-pill-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 18px;
    }
    .hud-com-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: var(--joy-radius-pill);
      background: var(--joy-color-navy-900);
      border: 1px solid var(--joy-status-success-border);
      color: var(--joy-status-success-fg);
      font-size: var(--joy-font-size-xs);
      font-weight: 600;
      letter-spacing: 0.02em;
      white-space: nowrap;
      flex-shrink: 0;
      font-family: monospace;
    }
    .hud-status-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--joy-status-success-fg);
      box-shadow: 0 0 8px var(--joy-status-success-fg);
    }
    .hud-com-pill[data-state="watching"] .hud-status-indicator {
      background: var(--joy-status-success-fg);
      box-shadow: 0 0 8px var(--joy-status-success-fg);
    }
    .hud-com-pill[data-state="talking"] .hud-status-indicator {
      background: var(--joy-status-success-fg);
      box-shadow: 0 0 8px var(--joy-status-success-fg);
    }
    .hud-com-pill[data-state="recording"] .hud-status-indicator {
      background: var(--joy-status-success-fg);
      box-shadow: 0 0 8px var(--joy-status-success-fg);
      animation: recordingBlink 0.6s infinite alternate;
    }
    @keyframes recordingBlink {
      0% { opacity: 0.3; }
      100% { opacity: 1; }
    }

    .hud-transcript-box {
      flex: 1;
      background: var(--joy-color-navy-900);
      border: 1px solid var(--joy-color-navy-800);
      border-radius: var(--joy-radius-md);
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      gap: 16px;
      overflow-y: auto;
      max-height: 340px;
    }
    .hud-msg-turn {
      animation: hudMsgFade 0.3s ease-out;
    }
    @keyframes hudMsgFade {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .hud-msg-speaker {
      font-size: var(--joy-font-size-xs);
      font-weight: 700;
      color: var(--joy-status-success-fg);
      opacity: 0.75;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: monospace;
    }
    .hud-msg-text {
      font-size: var(--joy-font-size-sm);
      line-height: 1.5;
      color: var(--joy-status-success-fg);
      font-family: monospace;
    }
    .hud-msg-text--user {
      opacity: 0.85;
    }
    .hud-msg-text--agent {
      font-weight: 600;
    }
    .hud-typing-cursor {
      display: inline-block;
      width: 6px;
      height: 14px;
      background: var(--joy-status-success-fg);
      margin-left: 4px;
      vertical-align: middle;
      animation: cursorBlink 0.8s infinite;
    }
    @keyframes cursorBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    /* Right Panel: Assist & Hierarchical Control */
    .hud-right-panel {
      padding: 24px;
      display: flex;
      flex-direction: column;
    }
    .hud-assist-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--joy-color-navy-800);
    }
    .hud-assist-title {
      font-size: var(--joy-font-size-sm);
      font-weight: 700;
      color: var(--joy-status-success-fg);
      letter-spacing: 0.02em;
      font-family: monospace;
    }
    .hud-assist-guide-badge {
      font-size: var(--joy-font-size-xs);
      font-family: monospace;
      color: var(--joy-status-success-fg);
      background: var(--joy-color-navy-900);
      border: 1px solid var(--joy-color-navy-800);
      padding: 4px 10px;
      border-radius: var(--joy-radius-pill);
    }
    .hud-assist-view {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    /* HUD List Item Row */
    .hud-list-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: var(--joy-radius-md);
      background: var(--joy-color-navy-900);
      border: 1px solid var(--joy-color-navy-800);
      font-size: var(--joy-font-size-sm);
      color: var(--joy-status-success-fg);
      font-family: monospace;
      cursor: pointer;
      transition: all var(--joy-duration-fast) var(--joy-ease-default);
    }
    .hud-list-item:hover {
      border-color: var(--joy-status-success-border);
    }
    .hud-cursor-arrow {
      font-family: monospace;
      font-weight: 800;
      color: var(--joy-status-success-fg);
      width: 14px;
      display: inline-block;
    }
    .hud-checkbox-box {
      width: 24px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--joy-status-success-fg);
      font-family: monospace;
      font-weight: 700;
      font-size: 13px;
      letter-spacing: -0.05em;
    }

    /* REVERSE-VIDEO Selection Highlight & Optical Phosphor Tokens */
    .hud-visor-frame[data-phosphor="green"] {
      --hud-phosphor-color: var(--joy-status-success-fg);
      color: var(--hud-phosphor-color);
      border-color: var(--joy-color-navy-800);
    }
    :root:not([data-theme="dark"]) .hud-visor-frame[data-phosphor="green"] {
      --hud-phosphor-color: var(--joy-status-success-border);
    }
    .hud-visor-frame[data-phosphor="green"] .hud-telemetry-brand,
    .hud-visor-frame[data-phosphor="green"] .hud-telemetry-metrics,
    .hud-visor-frame[data-phosphor="green"] .hud-reticle-corner,
    .hud-visor-frame[data-phosphor="green"] .hud-com-pill,
    .hud-visor-frame[data-phosphor="green"] .hud-msg-speaker,
    .hud-visor-frame[data-phosphor="green"] .hud-msg-text,
    .hud-visor-frame[data-phosphor="green"] .hud-assist-title,
    .hud-visor-frame[data-phosphor="green"] .hud-assist-guide-badge,
    .hud-visor-frame[data-phosphor="green"] .hud-list-item,
    .hud-visor-frame[data-phosphor="green"] .hud-cursor-arrow,
    .hud-visor-frame[data-phosphor="green"] .hud-checkbox-box,
    .hud-visor-frame[data-phosphor="green"] .hud-touch-btn,
    .hud-visor-frame[data-phosphor="green"] .hud-event-feed,
    .hud-visor-frame[data-phosphor="green"] #hud-detail-title,
    .hud-visor-frame[data-phosphor="green"] #hud-guide-cycle {
      color: var(--hud-phosphor-color) !important;
      border-color: var(--hud-phosphor-color) !important;
    }
    .hud-visor-frame[data-phosphor="green"] .hud-meter-bar,
    .hud-visor-frame[data-phosphor="green"] .hud-typing-cursor,
    .hud-visor-frame[data-phosphor="green"] .hud-status-indicator {
      background: var(--hud-phosphor-color) !important;
      box-shadow: 0 0 8px var(--hud-phosphor-color);
    }
    .hud-visor-frame[data-phosphor="green"] .hud-list-item.selected {
      background: var(--hud-phosphor-color) !important;
      color: var(--joy-color-navy-950) !important;
      border-color: var(--hud-phosphor-color) !important;
      font-weight: 700;
    }
    .hud-visor-frame[data-phosphor="green"] .hud-list-item.selected * {
      color: var(--joy-color-navy-950) !important;
      border-color: var(--joy-color-navy-950) !important;
    }
    .hud-visor-frame .joy-button--subtle {
      background: var(--joy-color-navy-950) !important;
      border: 1px solid var(--joy-color-navy-800) !important;
      color: var(--hud-phosphor-color, var(--joy-status-success-fg)) !important;
    }
    .hud-visor-frame .joy-button--subtle:hover {
      border-color: var(--hud-phosphor-color, var(--joy-status-success-fg)) !important;
    }

    /* Amber Phosphor Mode (P20 Phosphor, 585nm Gold) */
    .hud-visor-frame[data-phosphor="amber"] {
      border-color: var(--joy-accent-default);
      color: var(--joy-accent-default);
    }
    .hud-visor-frame[data-phosphor="amber"] .hud-reticle-corner {
      border-color: var(--joy-accent-default);
    }
    .hud-visor-frame[data-phosphor="amber"] .hud-telemetry-brand,
    .hud-visor-frame[data-phosphor="amber"] .hud-telemetry-metrics,
    .hud-visor-frame[data-phosphor="amber"] .hud-com-pill,
    .hud-visor-frame[data-phosphor="amber"] .hud-assist-title,
    .hud-visor-frame[data-phosphor="amber"] .hud-assist-guide-badge,
    .hud-visor-frame[data-phosphor="amber"] .hud-msg-speaker,
    .hud-visor-frame[data-phosphor="amber"] .hud-msg-text,
    .hud-visor-frame[data-phosphor="amber"] .hud-list-item,
    .hud-visor-frame[data-phosphor="amber"] .hud-cursor-arrow,
    .hud-visor-frame[data-phosphor="amber"] .hud-checkbox-box,
    .hud-visor-frame[data-phosphor="amber"] .hud-touch-btn,
    .hud-visor-frame[data-phosphor="amber"] .hud-event-feed {
      color: var(--joy-accent-default);
      border-color: var(--joy-accent-default);
    }
    .hud-visor-frame[data-phosphor="amber"] .hud-meter-bar,
    .hud-visor-frame[data-phosphor="amber"] .hud-typing-cursor,
    .hud-visor-frame[data-phosphor="amber"] .hud-status-indicator {
      background: var(--joy-accent-default);
      box-shadow: 0 0 8px var(--joy-accent-default);
    }
    .hud-visor-frame[data-phosphor="amber"] .hud-list-item.selected {
      background: var(--joy-accent-default) !important;
      color: var(--joy-color-navy-950) !important;
      border-color: var(--joy-accent-default) !important;
      font-weight: 700;
    }
    .hud-visor-frame[data-phosphor="amber"] .hud-list-item.selected * {
      color: var(--joy-color-navy-950) !important;
      border-color: var(--joy-color-navy-950) !important;
    }

    /* Polychrome Dual-RGB Mode */
    .hud-visor-frame[data-phosphor="dual"] {
      border-color: var(--joy-border-strong);
      color: var(--joy-text-primary);
    }
    .hud-visor-frame[data-phosphor="dual"] .hud-reticle-corner {
      border-color: var(--joy-accent-default);
    }
    .hud-visor-frame[data-phosphor="dual"] .hud-telemetry-brand {
      color: var(--joy-accent-default);
    }
    .hud-visor-frame[data-phosphor="dual"] .hud-telemetry-metrics {
      color: var(--joy-text-secondary);
    }
    .hud-visor-frame[data-phosphor="dual"] .hud-meter-bar {
      background: var(--joy-accent-default);
    }
    .hud-visor-frame[data-phosphor="dual"] .hud-com-pill {
      color: var(--joy-text-primary);
      border-color: var(--joy-border-default);
    }
    .hud-visor-frame[data-phosphor="dual"] .hud-msg-speaker {
      color: var(--joy-text-muted);
    }
    .hud-visor-frame[data-phosphor="dual"] .hud-msg-text--user {
      color: var(--joy-text-secondary);
    }
    .hud-visor-frame[data-phosphor="dual"] .hud-msg-text--agent {
      color: var(--joy-text-primary);
    }
    .hud-visor-frame[data-phosphor="dual"] .hud-assist-title {
      color: var(--joy-text-primary);
    }
    .hud-visor-frame[data-phosphor="dual"] .hud-assist-guide-badge {
      color: var(--joy-accent-default);
    }
    .hud-visor-frame[data-phosphor="dual"] .hud-list-item {
      color: var(--joy-text-primary);
    }
    .hud-visor-frame[data-phosphor="dual"] .hud-list-item.selected {
      background: var(--joy-color-navy-800) !important;
      border-color: var(--joy-accent-default) !important;
      color: var(--joy-text-primary) !important;
    }
    .hud-visor-frame[data-phosphor="dual"] .hud-cursor-arrow {
      color: var(--joy-accent-default);
    }
    .hud-visor-frame[data-phosphor="dual"] .hud-touch-btn {
      color: var(--joy-text-primary);
    }
    .hud-visor-frame[data-phosphor="dual"] .hud-event-feed {
      color: var(--joy-accent-default);
    }

    /* Temple Touchpad Controller Bar */
    .hud-temple-controller {
      position: relative;
      z-index: 10;
      padding: 16px 24px;
      border-top: 1px solid var(--joy-color-navy-800);
      background: var(--joy-color-navy-900);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    .hud-temple-touchbar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .hud-touch-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: var(--joy-radius-md);
      background: var(--joy-color-navy-950);
      border: 1px solid var(--joy-color-navy-800);
      color: var(--joy-status-success-fg);
      font-size: var(--joy-font-size-xs);
      font-weight: 600;
      font-family: monospace;
      cursor: pointer;
      transition: all var(--joy-duration-fast) var(--joy-ease-default);
    }
    .hud-touch-btn:hover {
      border-color: var(--joy-status-success-fg);
    }
    .hud-touch-btn:active {
      transform: scale(0.96);
    }
    .hud-event-feed {
      font-family: monospace;
      font-size: var(--joy-font-size-xs);
      color: var(--joy-status-success-fg);
      background: var(--joy-color-navy-950);
      padding: 6px 12px;
      border-radius: var(--joy-radius-pill);
      border: 1px solid var(--joy-color-navy-800);
      max-width: 480px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    /* ── Responsive Mobile & Tablet Rules ── */
    @media (max-width: 900px) {
      .mobile-menu-btn,
      .sidebar-close-btn,
      .topbar-brand {
        display: inline-flex;
      }
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 280px;
        z-index: var(--joy-z-drawer);
        transform: translateX(-100%);
        /* Closed drawer leaves the tab order: visibility flips after the slide-out, before the slide-in. */
        visibility: hidden;
        transition: transform var(--joy-duration-normal) var(--joy-motion-easing-decelerate), visibility 0s linear var(--joy-duration-normal);
        box-shadow: none;
      }
      .sidebar.open {
        transform: translateX(0);
        visibility: visible;
        transition: transform var(--joy-duration-normal) var(--joy-motion-easing-decelerate), visibility 0s;
        box-shadow: var(--hub-drawer-edge);
      }
      .main {
        width: 100vw;
        min-width: 0;
      }
      .topbar {
        padding: 0 16px;
        flex-wrap: nowrap;
      }
      .framework-pill--topbar {
        display: none;
      }
      .framework-pill--drawer {
        display: flex;
        margin: var(--joy-space-3) var(--joy-space-4) 0;
      }
      .framework-pill--drawer .framework-btn {
        flex: 1 1 0;
        min-height: 44px;
      }
      .content-area {
        padding: var(--joy-space-5) var(--joy-space-4) var(--joy-space-12);
        max-width: 100%;
      }
      .form-showcase-grid {
        grid-template-columns: 1fr !important;
      }
      .joy-transfer {
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .joy-transfer__operations {
        flex-direction: row !important;
        justify-content: center !important;
        padding: 8px 0 !important;
      }
    }

    /* Full Page Simulator */
    .simulator-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 16px 20px;
      background: var(--joy-surface-card);
      border: 1px solid var(--joy-border-default);
      border-radius: 12px;
      margin-bottom: 24px;
    }
    .simulator-group {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .simulator-label {
      font-size: var(--joy-font-size-sm);
      font-weight: 600;
      color: var(--joy-text-secondary);
      white-space: nowrap;
    }
    /* Frame width switcher: three short segments that never overprint. The px size is a second line of detail that goes away on phones. */
    .segmented-control--frames .segment-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      min-width: 0;
    }
    .segmented-control--frames .simulator-icon {
      margin-right: 0;
      vertical-align: baseline;
      flex-shrink: 0;
    }
    .segment-btn__size {
      color: var(--joy-text-secondary);
      font-weight: 400;
    }
    @media (max-width: 480px) {
      /* Two classes: the phone rule for every .segmented-control (further down) must not win with its own column count. */
      .segmented-control.segmented-control--frames {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      .segmented-control--frames .segment-btn {
        justify-content: center;
        padding: 6px 4px;
      }
      .segmented-control--frames .segment-btn__size {
        display: none;
      }
    }
    .simulator-status-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 4px 16px;
      padding: 8px 14px;
      background: var(--joy-surface-sunken);
      border: 1px solid var(--joy-border-default);
      border-radius: 8px;
      font-size: var(--joy-font-size-sm);
      color: var(--joy-text-secondary);
      margin-bottom: 16px;
    }
    .simulator-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
      overflow-x: auto;
      padding: 16px 0 48px;
      border-radius: 16px;
    }
    .simulator-frame {
      width: 100%;
      max-width: 100%;
      transition: max-width var(--joy-duration-normal) var(--joy-motion-easing-decelerate);
      background: var(--joy-surface-canvas);
      border-radius: 16px;
      border: 1px solid var(--joy-border-default);
      overflow: hidden;
    }
    .simulator-icon {
      margin-right: 4px;
      vertical-align: -2px;
    }
    .simulator-note {
      margin: 0;
      font-size: var(--joy-font-size-sm);
      color: var(--joy-text-secondary);
    }

    /* ── Full Page Simulator Viewport Emulation ── */
    /* When emulating mobile (375px) on desktop windows, media queries targeting window width
       do not trigger. These scoped rules activate the authentic mobile layout inside the simulator frame. */
    .simulator-frame[data-viewport="mobile"] .joy-landing-header {
      padding: var(--joy-space-3) var(--joy-space-4);
    }
    .simulator-frame[data-viewport="mobile"] .joy-landing-header__nav {
      display: none !important;
    }
    .simulator-frame[data-viewport="mobile"] .joy-landing-header .joy-landing-header__menu {
      display: inline-flex !important;
    }
    .simulator-frame[data-viewport="mobile"] .joy-landing-header__brand {
      font-size: var(--joy-font-size-lg);
      white-space: nowrap;
    }
    .simulator-frame[data-viewport="mobile"] .joy-hero {
      padding: 48px 16px;
    }
    .simulator-frame[data-viewport="mobile"] .joy-hero__title {
      font-size: var(--joy-font-size-display-sm);
    }
    .simulator-frame[data-viewport="mobile"] .joy-hero__ctas {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    .simulator-frame[data-viewport="mobile"] .joy-hero__ctas .joy-button {
      width: 100% !important;
    }
    .simulator-frame[data-viewport="mobile"] .joy-feature-grid--lead {
      grid-template-columns: minmax(0, 1fr) !important;
      gap: 16px;
    }
    .simulator-frame[data-viewport="mobile"] .joy-feature-grid--lead > * {
      grid-column: 1 / -1 !important;
    }
    .simulator-frame[data-viewport="mobile"] .joy-feature-grid--lead > :first-child .joy-feature-card__title {
      font-size: var(--joy-font-size-xl) !important;
    }
    .simulator-frame[data-viewport="mobile"] .joy-feature-card {
      padding: 20px 18px;
    }
    .simulator-frame[data-viewport="mobile"] .joy-feature-card__title {
      overflow-wrap: break-word;
      word-break: normal;
    }
    .simulator-frame[data-viewport="mobile"] .joy-feature-card__desc {
      overflow-wrap: break-word;
      word-break: normal;
    }
    .simulator-frame[data-viewport="mobile"] .joy-pricing-matrix:not(.joy-pricing-matrix--table) {
      gap: 16px;
    }
    .simulator-frame[data-viewport="mobile"] .joy-pricing-matrix:not(.joy-pricing-matrix--table) > * {
      flex-basis: 100% !important;
    }
    .simulator-frame[data-viewport="mobile"] .joy-pricing-card {
      padding: 24px 18px;
    }
    .simulator-frame[data-viewport="mobile"] .joy-pricing-matrix__table th:first-child {
      max-inline-size: 110px !important;
      font-size: var(--joy-font-size-xs);
      padding: 8px 10px;
    }
    .simulator-frame[data-viewport="mobile"] .joy-pricing-matrix__table th,
    .simulator-frame[data-viewport="mobile"] .joy-pricing-matrix__table td {
      padding: 8px 10px;
      font-size: var(--joy-font-size-xs);
      min-width: 72px;
    }
    .simulator-frame[data-viewport="mobile"] .joy-cta-section {
      padding: 32px 16px;
    }
    .simulator-frame[data-viewport="mobile"] .joy-cta-section__container {
      padding: 36px 18px;
    }
    .simulator-frame[data-viewport="mobile"] .joy-cta-section__title {
      font-size: var(--joy-font-size-xl);
    }
    .simulator-frame[data-viewport="mobile"] .joy-cta-section__actions {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    .simulator-frame[data-viewport="mobile"] .joy-cta-section__actions .joy-button {
      width: 100% !important;
    }
    .simulator-frame[data-viewport="mobile"] .joy-site-footer {
      padding: 40px 16px 24px 16px;
    }
    .simulator-frame[data-viewport="mobile"] .joy-site-footer__inner {
      display: grid !important;
      grid-template-columns: 1fr !important;
      gap: 28px;
    }
    .simulator-frame[data-viewport="mobile"] .joy-site-footer__bottom {
      flex-direction: column-reverse !important;
      align-items: flex-start !important;
      margin-top: 24px;
    }

    /* Tablet emulation overrides (768px) */
    .simulator-frame[data-viewport="tablet"] .joy-feature-grid--lead {
      grid-template-columns: minmax(0, 1fr) !important;
    }
    .simulator-frame[data-viewport="tablet"] .joy-feature-grid--lead > * {
      grid-column: 1 / -1 !important;
    }

    /* Landing blocks view: layout for the demo wrappers only; the blocks themselves are styled by theme.css. */
    .view-panel > h2,
    .landing-demo-title {
      margin: 0 0 var(--joy-space-2);
      font-size: var(--joy-font-size-xl);
      line-height: 1.25;
    }
    .hub-demo-label {
      margin: 0 0 var(--joy-space-2);
      font-size: var(--joy-font-size-sm);
      font-weight: 600;
      color: var(--joy-text-secondary);
    }
    .hub-header-note {
      font-size: var(--joy-font-size-sm);
      color: var(--joy-text-muted);
    }
    .landing-demo {
      padding: 24px;
      min-width: 0;
    }
    .landing-demo--flush {
      padding: 0;
    }
    /* Phones: the demo wrapper and the stats section would both pad the grid (24px + 16px each side), leaving ~127px cards
       at 375px. The wrapper takes 12px and the stats section adds none, so the two columns fill the frame. */
    @media (max-width: 479px) {
      .landing-demo {
        padding: 12px;
      }
      .landing-demo--flush {
        padding: 0;
      }
      .landing-demo .joy-stats-section {
        padding-inline: 0;
      }
    }
    .landing-demo__note {
      margin: 0 0 20px 0;
      font-size: var(--joy-font-size-sm);
      color: var(--joy-text-secondary);
      max-width: 72ch;
    }
    .landing-demo__stack {
      display: grid;
      gap: 32px;
      min-width: 0;
    }
    .landing-demo__group {
      min-width: 0;
    }
    .landing-demo__label {
      margin: 0 0 12px 0;
      font-size: var(--joy-font-size-sm);
      font-weight: 600;
      color: var(--joy-text-secondary);
    }
    .landing-demo__frame {
      border: 1px solid var(--joy-border-subtle);
      border-radius: var(--joy-radius-card);
      background: var(--joy-surface-canvas);
      min-width: 0;
    }
    .landing-demo__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    /* Filler tiles (spans 1 and 2) only make sense beside other tiles: drop them once the grid is one column. */
    @media (max-width: 899px) {
      .landing-demo .joy-bento-card[aria-hidden="true"] {
        display: none;
      }
    }
    .landing-demo__columns {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
      gap: 16px;
    }

    .hub-demo-footer {
      padding: var(--joy-space-3) var(--joy-space-5);
      background: var(--joy-surface-raised);
      border-top: 1px solid var(--hub-chrome-border);
      font-size: var(--joy-font-size-sm);
    }
    .hub-metric-row {
      background: var(--joy-surface-raised);
      padding: var(--joy-space-3);
      border-radius: var(--joy-radius-md);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--joy-space-3);
    }
    .hub-market-search {
      width: min(100%, 220px);
      padding: 6px 12px;
      font-size: var(--joy-font-size-sm);
    }
    @media (prefers-reduced-motion: reduce) {
      .sidebar, .sidebar.open, .sidebar-backdrop, .nav-item, .framework-btn, .mobile-menu-btn, .sidebar-close-btn,
      .segment-btn, .icon-card, .hub-card, .view-panel.active, .simulator-frame {
        transition: none;
        animation: none;
      }
    }
    /* Phone tier: the topbar is menu + brand + theme toggle; the framework switcher moves into the drawer. */
    @media (max-width: 767px) {
      .topbar {
        padding: var(--joy-space-2) var(--joy-space-4);
      }
      .topbar__start,
      .topbar__end {
        gap: var(--joy-space-2);
      }
      #btn-theme-toggle.hub-theme-toggle,
      #btn-palette-toggle.hub-palette-toggle {
        min-height: 44px;
        min-width: 44px;
      }
      .framework-pill--topbar {
        display: none;
      }
      .framework-pill--drawer {
        display: flex;
        margin: var(--joy-space-3) var(--joy-space-4) 0;
      }
      .framework-pill--drawer .framework-btn {
        flex: 1 1 0;
        min-height: 44px;
      }
      .canvas {
        padding: var(--joy-space-6) var(--joy-space-4);
      }
      /* 16px text keeps iOS Safari from zooming the page when the field takes focus. */
      .hub-market-search {
        font-size: var(--joy-font-size-md);
      }
    }
    @media (max-width: 480px) {
      .topbar {
        padding: var(--joy-space-2) var(--joy-space-3);
      }
      .topbar__start,
      .topbar__end {
        gap: var(--joy-space-2);
      }
      #theme-label,
      #hub-palette-label {
        display: none;
      }
      #btn-theme-toggle.hub-theme-toggle,
      #btn-palette-toggle.hub-palette-toggle {
        padding: 0 var(--joy-space-2);
        min-width: 44px;
        min-height: 44px;
      }
    }
    @media (max-width: 360px) {
      .topbar-brand__name {
        display: none;
      }
    }
    @media (max-width: 640px) {
      .joy-select-wrapper--open .joy-select__listbox.joy-overlay--sheet {
        position: fixed;
      }
      .controls-table,
      .controls-table tbody,
      .controls-table tr,
      .controls-table td {
        display: block;
        width: 100%;
      }
      .controls-table td:first-child {
        width: auto;
        padding-bottom: 0;
      }
      .controls-table td:last-child {
        padding-top: var(--joy-space-2);
      }
      .segmented-control {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(75px, 1fr));
      }
      .segment-btn {
        flex: 1 0 auto;
        padding: 6px 4px;
        font-size: var(--joy-font-size-xs);
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="toggleMobileMenu(false)"></div>

  <!-- Sidebar -->
  <aside class="sidebar" id="hub-sidebar" aria-label="Component navigation">
    <div class="brand">
      <div class="brand-logo">${brandMarkPreview(20, true, true)}</div>
      <div class="brand-info">
        <h2>Joymify Design</h2>
        <span>v2.2 OpenDesign Integrated</span>
      </div>
      <button type="button" class="sidebar-close-btn" onclick="toggleMobileMenu(false)" aria-label="Close navigation">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <a href="/" class="portal-back-link" title="Return to Joymify Developer Portal">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
      <span>Developer Portal Home</span>
    </a>
    <div class="framework-pill framework-pill--drawer" role="group" aria-label="Code framework">
      <button type="button" class="framework-btn active" data-framework="svelte" aria-pressed="true" onclick="setFramework('svelte')">Svelte 5</button>
      <button type="button" class="framework-btn" data-framework="react" aria-pressed="false" onclick="setFramework('react')">React 19</button>
      <button type="button" class="framework-btn" data-framework="flutter" aria-pressed="false" onclick="setFramework('flutter')">Flutter 3.32</button>
    </div>
    <div class="sidebar-search" role="search">
      <div class="sidebar-search__inner">
        <span class="sidebar-search__icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </span>
        <input
          type="search"
          class="sidebar-search__input"
          id="sidebar-search-input"
          placeholder="Search components..."
          aria-label="Search components and views"
          autocomplete="off"
          spellcheck="false"
        >
        <button
          type="button"
          class="sidebar-search__clear"
          id="sidebar-search-clear"
          aria-label="Clear search"
          tabindex="-1"
          style="display: none;"
          onclick="clearSidebarSearch()"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg>
        </button>
        <kbd class="sidebar-search__kbd" id="sidebar-search-kbd" aria-hidden="true"><abbr title="Command" style="text-decoration: none;">⌘</abbr>K</kbd>
      </div>
    </div>
    <nav class="nav">
${navigationHtml}
      <div class="sidebar-search__empty" id="sidebar-search-empty" style="display: none;">
        <div class="sidebar-search__empty-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
        <div class="sidebar-search__empty-title">No matching components</div>
        <div class="sidebar-search__empty-desc">Try another keyword or press <kbd style="padding: 1px 4px; font-size: 11px; background: var(--joy-surface-sunken); border: 1px solid var(--joy-border-default); border-radius: var(--joy-radius-sm);">Esc</kbd> to clear.</div>
      </div>
    </nav>
    <div class="sidebar-suite-wrap" aria-label="Joymify Developer Platform">
      <div class="sidebar-suite-title">Joymify Platform</div>
      <nav class="sidebar-suite-list" aria-label="Platform Libraries">
        <a href="#overview" class="sidebar-suite-item active" data-suite="design" title="Joy Design System">
          <span class="sidebar-suite-item__icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </span>
          <span class="sidebar-suite-item__name">Design System</span>
          <span class="sidebar-suite-item__badge">v3.3</span>
        </a>
        <a href="/server-decorator/" class="sidebar-suite-item" data-suite="server-decorator" title="Node Server Decorator" target="_blank" rel="noopener noreferrer">
          <span class="sidebar-suite-item__icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </span>
          <span class="sidebar-suite-item__name">Server Decorator</span>
          <svg class="sidebar-suite-item__ext" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
        <a href="/cli-state-handler/" class="sidebar-suite-item" data-suite="cli-state" title="CLI State Handler" target="_blank" rel="noopener noreferrer">
          <span class="sidebar-suite-item__icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          </span>
          <span class="sidebar-suite-item__name">CLI State Handler</span>
          <svg class="sidebar-suite-item__ext" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </nav>
    </div>
  </aside>

  <!-- Main Canvas Area -->
  <main class="main">
    <div class="topbar">
      <div class="topbar__start">
        <button type="button" class="mobile-menu-btn" id="mobile-menu-toggle" onclick="toggleMobileMenu(true)" aria-label="Open navigation" aria-controls="hub-sidebar" aria-expanded="false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <a href="/" class="topbar-brand" style="text-decoration: none; color: inherit;"><span class="brand-logo brand-logo--compact" aria-hidden="true">${brandMarkPreview(16, true, true)}</span><span class="topbar-brand__name" id="topbar-brand-title">Joymify Design</span></a>
        <nav class="topbar-portal-nav" aria-label="Developer Portal Navigation">
          <a href="/design/" class="topbar-portal-link">Design System</a>
          <a href="/server-decorator/" class="topbar-portal-link">Server Decorator</a>
          <a href="/cli-state-handler/" class="topbar-portal-link">CLI State Handler</a>
          <a href="https://github.com/montionugera/joy-design" target="_blank" rel="noopener noreferrer" class="topbar-portal-link">GitHub</a>
        </nav>
      </div>
      <div class="topbar__end">
        <div class="hub-palette-picker" id="hub-palette-picker">
          <button type="button" class="joy-button joy-button--ghost joy-button--sm hub-palette-toggle" id="btn-palette-toggle" onclick="togglePaletteMenu()" aria-haspopup="listbox" aria-expanded="false" aria-label="Select color palette preset">
            <span class="hub-palette-swatch" id="hub-palette-active-swatch">
              <span class="swatch-dot swatch-dot--1"></span>
              <span class="swatch-dot swatch-dot--2"></span>
              <span class="swatch-dot swatch-dot--3"></span>
            </span>
            <span id="hub-palette-label">Joy Classic</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <div class="hub-palette-dropdown" id="hub-palette-dropdown" role="listbox" aria-label="Color palette presets" hidden>
            <div class="hub-palette-item" role="option" data-palette="classic" onclick="setPalette('classic')" tabindex="0">
              <span class="hub-palette-swatch">
                <span class="swatch-dot" style="background: var(--joy-color-navy-800);"></span>
                <span class="swatch-dot" style="background: var(--joy-color-gold-500);"></span>
                <span class="swatch-dot" style="background: var(--joy-color-cream-100);"></span>
              </span>
              <div class="hub-palette-text">
                <span class="hub-palette-name">Joy Classic</span>
                <span class="hub-palette-sub">Oxford Navy & Ochre Gold</span>
              </div>
            </div>
            <div class="hub-palette-item" role="option" data-palette="bauhaus-primary" onclick="setPalette('bauhaus-primary')" tabindex="0">
              <span class="hub-palette-swatch">
                <span class="swatch-dot" style="background: var(--joy-color-navy-700);"></span>
                <span class="swatch-dot" style="background: var(--joy-result-lost);"></span>
                <span class="swatch-dot" style="background: var(--joy-color-gold-500);"></span>
              </span>
              <div class="hub-palette-text">
                <span class="hub-palette-name">Bauhaus Primary</span>
                <span class="hub-palette-sub">Dessau Geometric Triad</span>
              </div>
            </div>
            <div class="hub-palette-item" role="option" data-palette="clay-court" onclick="setPalette('clay-court')" tabindex="0">
              <span class="hub-palette-swatch">
                <span class="swatch-dot" style="background: var(--joy-color-clay-500);"></span>
                <span class="swatch-dot" style="background: var(--joy-color-clay-300);"></span>
                <span class="swatch-dot" style="background: var(--joy-color-clay-50);"></span>
              </span>
              <div class="hub-palette-text">
                <span class="hub-palette-name">Clay Court</span>
                <span class="hub-palette-sub">Roland-Garros Terracotta</span>
              </div>
            </div>
            <div class="hub-palette-item" role="option" data-palette="nordic-slate" onclick="setPalette('nordic-slate')" tabindex="0">
              <span class="hub-palette-swatch">
                <span class="swatch-dot" style="background: var(--joy-color-navy-600);"></span>
                <span class="swatch-dot" style="background: var(--joy-color-status-info-fg);"></span>
                <span class="swatch-dot" style="background: var(--joy-color-cream-50);"></span>
              </span>
              <div class="hub-palette-text">
                <span class="hub-palette-name">Nordic Slate</span>
                <span class="hub-palette-sub">Minimalist Slate & Cerulean</span>
              </div>
            </div>
            <div class="hub-palette-item" role="option" data-palette="verdant-lawn" onclick="setPalette('verdant-lawn')" tabindex="0">
              <span class="hub-palette-swatch">
                <span class="swatch-dot" style="background: var(--joy-color-status-success-fg);"></span>
                <span class="swatch-dot" style="background: var(--joy-color-gold-400);"></span>
                <span class="swatch-dot" style="background: var(--joy-color-cream-50);"></span>
              </span>
              <div class="hub-palette-text">
                <span class="hub-palette-name">Verdant Lawn</span>
                <span class="hub-palette-sub">Wimbledon Green & Champagne</span>
              </div>
            </div>
          </div>
        </div>
        <button type="button" class="joy-button joy-button--ghost joy-button--sm hub-theme-toggle" id="btn-theme-toggle" onclick="toggleTheme()" aria-label="Switch to dark theme">
          <span id="theme-icon" class="hub-theme-toggle__icon" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </span>
          <span id="theme-label">Dark theme</span>
        </button>
        <div class="framework-pill framework-pill--topbar" role="group" aria-label="Code framework">
          <button type="button" class="framework-btn active" id="btn-tab-svelte" data-framework="svelte" aria-pressed="true" onclick="setFramework('svelte')">Svelte 5</button>
          <button type="button" class="framework-btn" id="btn-tab-react" data-framework="react" aria-pressed="false" onclick="setFramework('react')">React 19</button>
          <button type="button" class="framework-btn" id="btn-tab-flutter" data-framework="flutter" aria-pressed="false" onclick="setFramework('flutter')">Flutter 3.32</button>
        </div>
      </div>
    </div>

    <div class="content-area">

      <!-- View: Overview -->
      <section id="view-overview" class="view-panel">
        <!-- Developer Portal Dedicated Hero Landing Banner (active in portal-mode) -->
        <section class="portal-hero" aria-label="Developer Portal Hero">
          <div class="portal-hero__badge">
            <span class="joy-badge joy-badge--brand joy-badge--sm"><span class="joy-badge__dot"></span> dev.joymify.com / Developer Portal</span>
          </div>
          <h1 class="portal-hero__title">
            The Unified Engineering Ecosystem for <span class="portal-hero__title-emphasis">Joymify</span>
          </h1>
          <p class="portal-hero__subtitle">
            A single portal connecting Joymify's core open-source libraries: enterprise design systems, polyglot microservice decorators, and terminal state orchestration.
          </p>
          <div class="portal-hero__ctas">
            <a href="/design/" class="joy-button joy-button--solid joy-button--lg" style="text-decoration: none;">
              <span class="joy-button__label">Launch Design System</span>
            </a>
            <a href="/server-decorator/" class="joy-button joy-button--outline joy-button--lg" style="text-decoration: none;">
              <span class="joy-button__label">Server Decorator Docs</span>
            </a>
            <a href="/cli-state-handler/" class="joy-button joy-button--outline joy-button--lg" style="text-decoration: none;">
              <span class="joy-button__label">CLI State Handler</span>
            </a>
          </div>
        </section>

        <!-- overview-hero:generated:start -->
        <!-- Generated by apps/storybook-hub/scripts/gen-landing-blocks.mjs from the HeroSection component: do not edit by hand. -->
        <section class="joy-hero">
          <div class="joy-hero__badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Design system
          </div>
          <h1 class="joy-hero__title">
            Joymify Design <span class="joy-hero__title-emphasis">System</span>
          </h1>
          <p class="joy-hero__subtitle">
            Design tokens and production components for Quant, JoyCoach, AssetStudio and JoyQuest, in Svelte 5 and React 19.
          </p>
          <div class="joy-hero__ctas">
            <button type="button" class="joy-button joy-button--solid joy-button--lg"> <span class="joy-button__label">Browse components</span>  </button> <button type="button" class="joy-button joy-button--outline joy-button--lg joy-hero__secondary-cta"> <span class="joy-button__label">Read the tokens</span>  </button>
          </div>
        </section>
        <!-- overview-hero:generated:end -->

        <!-- Joymify Developer Platform: Core Libraries Bento Grid (3 Sub-Webapps) -->
        <div class="dev-portal-section" aria-label="Joymify Core Libraries">
          <div class="dev-portal-header">
            <div class="dev-portal-header__badge">
              <span class="joy-badge joy-badge--brand joy-badge--sm"><span class="joy-badge__dot"></span> dev.joymify.com</span>
            </div>
            <h2 class="dev-portal-heading">Core Open-Source Libraries</h2>
            <p class="dev-portal-sub">The foundational building blocks powering Joymify web interfaces, microservice backends, and autonomous developer tooling.</p>
          </div>

          <div class="dev-portal-bento">
            <!-- Bento Card 1: Joy Design System -->
            <div class="dev-portal-card" id="portal-card-design">
              <div class="dev-portal-card__header">
                <span class="joy-badge joy-badge--brand joy-badge--sm"><span class="joy-badge__dot"></span> UI Components &amp; Tokens</span>
                <span class="dev-portal-version">v3.4</span>
              </div>
              <div class="dev-portal-card__body">
                <h3 class="dev-portal-card__title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  <span>Joy Design System</span>
                </h3>
                <p class="dev-portal-card__desc">
                  Ant Design 5 benchmarked component suite built for high-FPS trading dashboards and SaaS workflows with Svelte 5 Runes, React 19 forwardRef, and Flutter 3.32 parity. Strictly tokenized with zero color literals.
                </p>
                <div class="dev-portal-card__tags">
                  <span class="joy-tag joy-tag--sm">React 19</span>
                  <span class="joy-tag joy-tag--sm">Svelte 5</span>
                  <span class="joy-tag joy-tag--sm">Flutter 3.32</span>
                  <span class="joy-tag joy-tag--sm">W3C DTCG Tokens</span>
                  <span class="joy-tag joy-tag--sm">WCAG 2.2 AA</span>
                </div>
              </div>
              <div class="dev-portal-card__footer">
                <button type="button" class="joy-button joy-button--solid joy-button--sm" onclick="if(document.body.classList.contains('portal-mode')){ window.location.href='/design/'; } else { switchView('button'); }">
                  <span>Explore 70+ Components</span>
                </button>
                <button type="button" class="joy-button joy-button--ghost joy-button--sm" onclick="if(document.body.classList.contains('portal-mode')){ window.location.href='/design/#tokens'; } else { switchView('tokens'); }">
                  <span>Tokens &amp; Motion</span>
                </button>
              </div>
            </div>

            <!-- Bento Card 2: Node Server Decorator -->
            <div class="dev-portal-card" id="portal-card-decorator">
              <div class="dev-portal-card__header">
                <span class="joy-badge joy-badge--success joy-badge--sm"><span class="joy-badge__dot"></span> Microservices</span>
                <span class="dev-portal-version">v0.0.1</span>
              </div>
              <div class="dev-portal-card__body">
                <h3 class="dev-portal-card__title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <span>Node Server Decorator</span>
                </h3>
                <p class="dev-portal-card__desc">
                  Polyglot microservices decorator library for TypeScript, Python, Go, and Nim with distributed caching, queue emission, resilient retries, circuit breaking, and real-time SSE streaming.
                </p>
                <div class="dev-portal-card__code">
                  <code>@cache({ ttl: '5m' })<br/>@tracking('order.executed')<br/>@circuit_breaker({ maxFailures: 3 })</code>
                </div>
                <div class="dev-portal-card__tags">
                  <span class="joy-tag joy-tag--sm">TypeScript</span>
                  <span class="joy-tag joy-tag--sm">Python</span>
                  <span class="joy-tag joy-tag--sm">Go</span>
                  <span class="joy-tag joy-tag--sm">Nim</span>
                </div>
              </div>
              <div class="dev-portal-card__footer">
                <a href="/server-decorator/" target="_blank" rel="noopener noreferrer" class="joy-button joy-button--outline joy-button--sm" style="text-decoration: none;">
                  <span>Open Starlight Studio</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
                <a href="https://github.com/montionugera/node-server-decorator" target="_blank" rel="noopener noreferrer" class="joy-button joy-button--ghost joy-button--sm" style="text-decoration: none;">
                  <span>GitHub</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              </div>
            </div>

            <!-- Bento Card 3: CLI State Handler -->
            <div class="dev-portal-card" id="portal-card-cli">
              <div class="dev-portal-card__header">
                <span class="joy-badge joy-badge--neutral joy-badge--sm"><span class="joy-badge__dot"></span> CLI &amp; Agents</span>
                <span class="dev-portal-version">v0.1.0</span>
              </div>
              <div class="dev-portal-card__body">
                <h3 class="dev-portal-card__title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                  <span>CLI State Handler</span>
                </h3>
                <p class="dev-portal-card__desc">
                  Deterministic terminal state machine and workflow coordinator for high-reliability CLI tooling, interactive prompts, and autonomous agent execution loops.
                </p>
                <div class="dev-portal-card__code">
                  <code>const machine = defineStateMachine({<br/>&nbsp;&nbsp;states: { idle, running, verified }<br/>});</code>
                </div>
                <div class="dev-portal-card__tags">
                  <span class="joy-tag joy-tag--sm">UCSA Core</span>
                  <span class="joy-tag joy-tag--sm">State Machine</span>
                  <span class="joy-tag joy-tag--sm">React Ink</span>
                  <span class="joy-tag joy-tag--sm">Vite Docs</span>
                </div>
              </div>
              <div class="dev-portal-card__footer">
                <a href="/cli-state-handler/" target="_blank" rel="noopener noreferrer" class="joy-button joy-button--outline joy-button--sm" style="text-decoration: none;">
                  <span>Explore CLI Engine</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
                <a href="https://github.com/montionugera/cli-state-handler" target="_blank" rel="noopener noreferrer" class="joy-button joy-button--ghost joy-button--sm" style="text-decoration: none;">
                  <span>GitHub</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="hub-card-grid">
          <div class="hub-card" role="link" tabindex="0" aria-label="Open @montionugera/joy-tokens" onclick="switchView('tokens')" onkeydown="hubCardActivate(event)">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="joy-badge joy-badge--success joy-badge--sm"><span class="joy-badge__dot"></span> Live Tokens & Motion</span>
            </div>
            <h3 style="margin: 0 0 8px 0;">@montionugera/joy-tokens</h3>
            <p class="hub-card__desc">
              W3C DTCG tokens with OpenDesign posture integration, GPU spring motion curves, and hairline borders.
            </p>
          </div>

          <div class="hub-card" role="link" tabindex="0" aria-label="Open @montionugera/joy-svelte" onclick="switchView('button'); setFramework('svelte');" onkeydown="hubCardActivate(event)">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="joy-badge joy-badge--brand joy-badge--sm"><span class="joy-badge__dot"></span> Svelte 5 Runes</span>
            </div>
            <h3 style="margin: 0 0 8px 0;">@montionugera/joy-svelte</h3>
            <p class="hub-card__desc">
              Zero-overhead Runes ($state, $props, $derived, $bindable) engineered for real-time order books and high-FPS canvases.
            </p>
          </div>

          <div class="hub-card" role="link" tabindex="0" aria-label="Open @montionugera/joy-react" onclick="switchView('button'); setFramework('react');" onkeydown="hubCardActivate(event)">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="joy-badge joy-badge--neutral joy-badge--sm"><span class="joy-badge__dot"></span> React 19 Ready</span>
            </div>
            <h3 style="margin: 0 0 8px 0;">@montionugera/joy-react</h3>
            <p class="hub-card__desc">
              Strict WAI-ARIA accessible React 19 component library with forwardRef support and zero runtime CSS overhead.
            </p>
          </div>

          <div class="hub-card" role="link" tabindex="0" aria-label="Open Modern & Utility postures" onclick="switchView('tokens')" onkeydown="hubCardActivate(event)">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="joy-badge joy-badge--brand joy-badge--sm"><span class="joy-badge__dot"></span> OpenDesign Postures</span>
            </div>
            <h3 style="margin: 0 0 8px 0;">Modern & Utility</h3>
            <p class="hub-card__desc">
              Unified Linear/Vercel modern-minimal and Datadog/GitHub tech-utility postures with frosted surfaces & hairline borders.
            </p>
          </div>
        </div>

        <div class="joy-alert joy-alert--info">
          <div class="joy-alert__title">Complete Ant Design Parity Suite + OpenDesign Posture Engine</div>
          <div class="joy-alert__desc">
            Explore 18 standard & enterprise components including Modals, Drawers, Dropdown menus, Selects, and Live Trading Orderbooks with full GPU spring motion transitions and OpenDesign posture styling.
          </div>
        </div>
      </section>

      <!-- View: Flutter Showcase (F-065) -->
      <section id="view-flutter" class="view-panel">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--joy-space-3); margin-bottom: var(--joy-space-4);">
          <div>
            <h2 style="margin: 0 0 6px 0;">Flutter 3.32 Multi-Platform Workshop</h2>
            <p class="header-tagline" style="margin: 0;">Full token and component parity running on Flutter Web CanvasKit with live JoyHubBridge theme synchronization.</p>
          </div>
          <div style="display: flex; gap: var(--joy-space-2); flex-wrap: wrap; align-items: center;">
            <span class="joy-badge joy-badge--brand joy-badge--sm"><span class="joy-badge__dot"></span> Dart 3.8.1</span>
            <span class="joy-badge joy-badge--success joy-badge--sm"><span class="joy-badge__dot"></span> 35+ Widgets</span>
            <span class="joy-badge joy-badge--neutral joy-badge--sm"><span class="joy-badge__dot"></span> 44px Hit Bounds</span>
            <a href="/flutter/index.html" target="_blank" rel="noopener" class="joy-button joy-button--outline joy-button--sm">Full Screen &nearr;</a>
          </div>
        </div>

        <div class="playground-box" style="padding: 0; overflow: hidden; border-radius: var(--joy-radius-lg); border: 1px solid var(--hub-chrome-border); background: var(--joy-surface-canvas);">
          <div class="playground-header" style="padding: 12px 16px; border-bottom: 1px solid var(--hub-chrome-border); display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <h4>Live Flutter Web Canvas</h4>
              <span class="joy-badge joy-badge--brand joy-badge--sm"><span class="joy-badge__dot"></span> CanvasKit / Wasm</span>
            </div>
            <div style="font-size: var(--joy-font-size-xs); color: var(--joy-text-secondary);">
              Theme synchronized with Storybook Hub controls
            </div>
          </div>
          <div style="position: relative; width: 100%; height: 860px; min-height: 520px; background: var(--joy-surface-canvas);">
            <iframe id="flutter-hub-iframe" src="about:blank" data-src="/flutter/index.html" style="width: 100%; height: 100%; border: none; display: block;" title="Joymify Flutter Showcase"></iframe>
          </div>
        </div>
      </section>

      <!-- View: Brand Assets (F-043) -->
      <section id="view-brand" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Brand Assets</h2>
        <p class="header-tagline">The Joymify diamond mark, wordmark and hero lattice: live renders sourced from @montionugera/joy-brand, plus the downloadable asset kit generated from the same geometry.</p>

        <div class="playground-box">
          <div class="playground-header"><h4>Mark: sizes and surfaces</h4></div>
          <div class="canvas" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--joy-space-4);">
            <div>
              <p>On canvas</p>
              <div style="display: flex; align-items: flex-end; flex-wrap: wrap; gap: var(--joy-space-3);">${[16, 32, 64, 128].map((s) => brandMarkPreview(s, false)).join("")}</div>
            </div>
            <div>
              <p>On tile</p>
              <div style="display: flex; align-items: flex-end; flex-wrap: wrap; gap: var(--joy-space-3);">${[16, 32, 64, 128].map((s) => brandMarkPreview(s, true)).join("")}</div>
            </div>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header"><h4>Wordmark</h4></div>
          <div class="canvas" style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: var(--joy-space-4);">
            <div>${brandWordmarkPreview("deep", 40)}</div>
            <div style="background: var(--joy-brand-tile); padding: var(--joy-space-4); border-radius: var(--joy-radius-md);">${brandWordmarkPreview("cream", 40)}</div>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header"><h4>Clear space</h4></div>
          <div class="canvas">
            <p>Keep one diamond-width of space around the lockup; minimum 16px mark, 96px wordmark.</p>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header"><h4>Colour tokens</h4></div>
          <div class="hub-scroll-x" tabindex="0" role="region" aria-label="Brand colour tokens (token table, scrolls sideways)">
          <table class="tokens-table">
            <thead>
              <tr><th>CSS Custom Property</th><th>Preview</th><th>Resolved value</th></tr>
            </thead>
            <tbody>
              ${["--joy-brand-tile", "--joy-brand-mark", "--joy-brand-mark-on-tile", "--joy-brand-mark-contrast", "--joy-brand-ink", "--joy-brand-ink-on-tile"]
                .map(
                  (token) =>
                    `<tr><td><code>${token}</code></td><td><span class="color-swatch" style="background: var(${token});"></span></td><td><code class="token-value" data-token="${token}"></code></td></tr>`,
                )
                .join("")}
            </tbody>
          </table>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header"><h4>Ribbon</h4></div>
          <div class="canvas" style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--joy-space-4);">
            <span class="joy-ribbon joy-ribbon--inline joy-ribbon--gold">New</span>
            <span class="joy-ribbon joy-ribbon--inline joy-ribbon--navy">Beta</span>
            <div style="position: relative; overflow: hidden; width: 200px; height: 120px; border: 1px solid var(--joy-border-subtle); border-radius: var(--joy-radius-md);">
              <span class="joy-ribbon joy-ribbon--corner joy-ribbon--gold">Sale</span>
            </div>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header"><h4>Brand banner</h4></div>
          <div class="canvas">
            <section class="joy-brand-banner">
              ${brandBannerLatticeSvg()}
              <div class="joy-brand-banner__content">
                <p class="joy-brand-banner__eyebrow">Joymify</p>
                <h2 class="joy-brand-banner__title">Trade with clarity</h2>
                <p class="joy-brand-banner__lede">A calmer way to see your portfolio.</p>
                <div class="joy-brand-banner__ctas">
                  <a class="joy-button joy-button--solid joy-button--md" href="#brand"><span class="joy-button__label">Get started</span></a>
                  <a class="joy-button joy-button--outline joy-button--md" href="#brand"><span class="joy-button__label">Learn more</span></a>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header"><h4>Do and don't</h4></div>
          <div class="canvas" style="display: flex; flex-direction: column; gap: var(--joy-space-3);">
            ${hubAlert("success", "Do", "Keep the diamond mark's proportions and clear space intact; use the --joy-brand-* tokens for colour.")}
            ${hubAlert("danger", "Don't", "Recolor the mark outside the --joy-brand-* tokens, stretch it off its aspect ratio, or crowd it inside the clear-space margin. Do not substitute the square mark some products still ship — the diamond is canonical. Gold is a signature, not a wash: never a large field, a page background or a card background.")}
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header"><h4>Download the asset kit</h4></div>
          <div class="canvas" style="display: flex; flex-wrap: wrap; gap: var(--joy-space-2);">
            ${brandAssetFiles
              .map(
                (file) =>
                  `<a class="joy-button joy-button--outline joy-button--sm" download href="brand/${file}"><span class="joy-button__label">${file}</span></a>`,
              )
              .join("")}
          </div>
        </div>
      </section>

      <!-- View: Tokens -->
      <section id="view-tokens" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Design Tokens & Motion Engine</h2>
        <p class="header-tagline">Central source of truth defined in DTCG JSON format, compiled for CSS Variables and Tailwind v4.</p>

        <h3 style="margin-top: 24px;">Motion & Easing Tokens</h3>
        <div class="hub-scroll-x hub-scroll-x--spaced" tabindex="0" role="region" aria-label="Motion & Easing Tokens (token table, scrolls sideways)">
        <table class="tokens-table">
          <thead>
            <tr>
              <th>Token Name</th>
              <th>CSS Custom Property</th>
              <th>Value</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>motion.duration.fast</code></td>
              <td><code>--joy-motion-duration-fast</code></td>
              <td><code>150ms</code></td>
              <td>Micro-interactions, button hovers, badge transitions</td>
            </tr>
            <tr>
              <td><code>motion.duration.normal</code></td>
              <td><code>--joy-motion-duration-normal</code></td>
              <td><code>250ms</code></td>
              <td>Dropdown expands, modal pop, drawer slides</td>
            </tr>
            <tr>
              <td><code>motion.easing.spring</code></td>
              <td><code>--joy-motion-easing-spring</code></td>
              <td><code>cubic-bezier(0.175, 0.885, 0.32, 1.275)</code></td>
              <td>Natural organic bounce effect for popovers & dialogs</td>
            </tr>
          </tbody>
        </table>
        </div>

        <h3>Core Brand & Surface Palette</h3>
        <div class="hub-scroll-x" tabindex="0" role="region" aria-label="Core Brand & Surface Palette (token table, scrolls sideways)">
        <table class="tokens-table">
          <thead>
            <tr>
              <th>Token Name</th>
              <th>CSS Custom Property</th>
              <th>Preview</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>accent.default</code></td>
              <td><code>--joy-accent-default</code></td>
              <td><span class="color-swatch" style="background: var(--joy-accent-default);"></span>Primary</td>
              <td><code>var(--joy-accent-default)</code></td>
            </tr>
            <tr>
              <td><code>accent.hover</code></td>
              <td><code>--joy-accent-hover</code></td>
              <td><span class="color-swatch" style="background: var(--joy-accent-hover);"></span>Hover</td>
              <td><code>var(--joy-accent-active)</code></td>
            </tr>
            <tr>
              <td><code>status.success.fg</code></td>
              <td><code>--joy-status-success-fg</code></td>
              <td><span class="color-swatch" style="background: var(--joy-status-success-fg);"></span>Success</td>
              <td><code>var(--joy-status-success-fg)</code></td>
            </tr>
            <tr>
              <td><code>status.danger.fg</code></td>
              <td><code>--joy-status-danger-fg</code></td>
              <td><span class="color-swatch" style="background: var(--joy-status-danger-fg);"></span>Danger</td>
              <td><code>var(--joy-status-danger-fg)</code></td>
            </tr>
          </tbody>
        </table>
        </div>
      </section>

      <!-- View: Props & API Specs -->
      <section id="view-props-spec" class="view-panel">
        <div class="badge joy-badge joy-badge--brand joy-badge--md" style="margin-bottom: 12px;">Component API Standards</div>
        <h2>Component props and API specification</h2>
        <p class="header-tagline">
          Complete cross-framework contract specification for all 18 Joymify components across 
          <strong>Svelte 5 Runes</strong> and <strong>React 19 forwardRef</strong>.
        </p>

        <!-- Button Specs -->
        <div class="playground-box">
          <div class="playground-header">
            <h4>&lt;Button&gt; Specification</h4>
            <span class="joy-badge joy-badge--neutral joy-badge--sm">Action Primitive</span>
          </div>
          <div style="padding: 16px 20px;">
            <div class="hub-scroll-x" tabindex="0" role="region" aria-label="&lt;Button&gt; Specification (props table, scrolls sideways)">
            <table class="joy-props-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="joy-prop-name">variant</span></td>
                  <td><span class="joy-prop-type">'solid' | 'outline' | 'ghost' | 'danger' | 'link'</span></td>
                  <td><span class="joy-prop-default">'solid'</span></td>
                  <td>Visual hierarchy styling</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">size</span></td>
                  <td><span class="joy-prop-type">'sm' | 'md' | 'lg'</span></td>
                  <td><span class="joy-prop-default">'md'</span></td>
                  <td>Padding and font size scale</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">block</span></td>
                  <td><span class="joy-prop-type">boolean</span></td>
                  <td><span class="joy-prop-default">false</span></td>
                  <td>Expands button to full container width</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">iconOnly</span></td>
                  <td><span class="joy-prop-type">boolean</span></td>
                  <td><span class="joy-prop-default">false</span></td>
                  <td>Equal width and height square icon button</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">iconStart</span></td>
                  <td><span class="joy-prop-type">ReactNode / Snippet</span></td>
                  <td><span class="joy-prop-default">undefined</span></td>
                  <td>Leading icon slot</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">iconEnd</span></td>
                  <td><span class="joy-prop-type">ReactNode / Snippet</span></td>
                  <td><span class="joy-prop-default">undefined</span></td>
                  <td>Trailing icon slot</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">disabled</span></td>
                  <td><span class="joy-prop-type">boolean</span></td>
                  <td><span class="joy-prop-default">false</span></td>
                  <td>Disables button click and reduces opacity</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">loading</span></td>
                  <td><span class="joy-prop-type">boolean</span></td>
                  <td><span class="joy-prop-default">false</span></td>
                  <td>Replaces icon/text with animated loading spinner</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">onclick / onClick</span></td>
                  <td><span class="joy-prop-type">() =&gt; void</span></td>
                  <td><span class="joy-prop-default">undefined</span></td>
                  <td>Click event handler</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>

        <!-- Table & Trading Specs -->
        <div class="playground-box">
          <div class="playground-header">
            <h4>&lt;Table&gt; & Financial Trading Specification</h4>
            <span class="joy-badge joy-badge--success joy-badge--sm">Quant High-Throughput</span>
          </div>
          <div style="padding: 16px 20px;">
            <div class="hub-scroll-x" tabindex="0" role="region" aria-label="&lt;Table&gt; & Financial Trading Specification (props table, scrolls sideways)">
            <table class="joy-props-table">
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="joy-prop-name">columns</span></td>
                  <td><span class="joy-prop-type">Column&lt;T&gt;[]</span></td>
                  <td><span class="joy-prop-default">required</span></td>
                  <td>Column definitions ({ key, title, width, sortable, align })</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">data</span></td>
                  <td><span class="joy-prop-type">T[]</span></td>
                  <td><span class="joy-prop-default">required</span></td>
                  <td>Array of tabular row objects</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">density</span></td>
                  <td><span class="joy-prop-type">'compact' | 'normal'</span></td>
                  <td><span class="joy-prop-default">'compact'</span></td>
                  <td>Spacing density optimized for order books vs general tables</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">variant</span></td>
                  <td><span class="joy-prop-type">'stack' | 'scroll'</span></td>
                  <td><span class="joy-prop-default">follows responsive</span></td>
                  <td>Phone layout: <code>stack</code> turns rows into labelled cards; <code>scroll</code> keeps the columns and pins the first one while scrolling sideways</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">sortKey</span></td>
                  <td><span class="joy-prop-type">string</span></td>
                  <td><span class="joy-prop-default">''</span></td>
                  <td>Currently sorted column key</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">sortDirection</span></td>
                  <td><span class="joy-prop-type">'asc' | 'desc'</span></td>
                  <td><span class="joy-prop-default">'asc'</span></td>
                  <td>Sort direction indicator</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">onsort / onSort</span></td>
                  <td><span class="joy-prop-type">(key, dir) =&gt; void</span></td>
                  <td><span class="joy-prop-default">undefined</span></td>
                  <td>Callback when a sortable column header is clicked</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>

        <!-- Form Suite Specs -->
        <div class="playground-box">
          <div class="playground-header">
            <h4>&lt;Select&gt;, &lt;Checkbox&gt; & &lt;RadioGroup&gt; Specification</h4>
            <span class="joy-badge joy-badge--brand joy-badge--sm">Accessible Form Suite</span>
          </div>
          <div style="padding: 16px 20px;">
            <div class="hub-scroll-x" tabindex="0" role="region" aria-label="&lt;Select&gt;, &lt;Checkbox&gt; & &lt;RadioGroup&gt; Specification (props table, scrolls sideways)">
            <table class="joy-props-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Key Props</th>
                  <th>Types</th>
                  <th>Accessibility Traits</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="joy-prop-name">&lt;Select&gt;</span></td>
                  <td>options, value, placeholder, disabled</td>
                  <td><span class="joy-prop-type">SelectOption[], string</span></td>
                  <td>Native select keyboard navigation, styled caret</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">&lt;Checkbox&gt;</span></td>
                  <td>checked, label, disabled</td>
                  <td><span class="joy-prop-type">boolean, ReactNode / Snippet</span></td>
                  <td>role="checkbox", aria-checked, keyboard focus ring</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">&lt;RadioGroup&gt;</span></td>
                  <td>name, value, options, direction</td>
                  <td><span class="joy-prop-type">string, RadioOption[], 'horizontal' | 'vertical'</span></td>
                  <td>role="radiogroup", aria-orientation, arrow key selection</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>

        <!-- Overlays Specs -->
        <div class="playground-box">
          <div class="playground-header">
            <h4>&lt;Modal&gt;, &lt;Drawer&gt; & &lt;Toast&gt; Specification</h4>
            <span class="joy-badge joy-badge--brand joy-badge--sm">Enterprise Overlays</span>
          </div>
          <div style="padding: 16px 20px;">
            <div class="hub-scroll-x" tabindex="0" role="region" aria-label="&lt;Modal&gt;, &lt;Drawer&gt; & &lt;Toast&gt; Specification (props table, scrolls sideways)">
            <table class="joy-props-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Key Props</th>
                  <th>Types</th>
                  <th>Keyboard & Motion Traits</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="joy-prop-name">&lt;Modal&gt;</span></td>
                  <td>open, title, onclose / onClose</td>
                  <td><span class="joy-prop-type">boolean, string, () =&gt; void</span></td>
                  <td>role="dialog", Escape key to close, backdrop dismiss, spring pop</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">&lt;Drawer&gt;</span></td>
                  <td>open, title, placement, onclose</td>
                  <td><span class="joy-prop-type">boolean, 'left' | 'right', () =&gt; void</span></td>
                  <td>role="dialog", Escape key to close, side sheet slide animation</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">&lt;Toast&gt;</span></td>
                  <td>open, variant, message, onclose</td>
                  <td><span class="joy-prop-type">boolean, 'info' | 'success' | 'warning' | 'danger'</span></td>
                  <td>role="status", aria-live="polite", automatic decay</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>

        <!-- Pagination & Skeleton Specs -->
        <div class="playground-box">
          <div class="playground-header">
            <h4>&lt;Pagination&gt; & &lt;Skeleton&gt; Specification</h4>
            <span class="joy-badge joy-badge--neutral joy-badge--sm">Navigation & Feedbacks</span>
          </div>
          <div style="padding: 16px 20px;">
            <div class="hub-scroll-x" tabindex="0" role="region" aria-label="&lt;Pagination&gt; & &lt;Skeleton&gt; Specification (props table, scrolls sideways)">
            <table class="joy-props-table">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Key Props</th>
                  <th>Types</th>
                  <th>Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span class="joy-prop-name">&lt;Pagination&gt;</span></td>
                  <td>current, pageSize, total, showSizeChanger</td>
                  <td><span class="joy-prop-type">number, number, number, boolean</span></td>
                  <td>role="navigation", aria-current="page", trade ledger slicing</td>
                </tr>
                <tr>
                  <td><span class="joy-prop-name">&lt;Skeleton&gt;</span></td>
                  <td>variant, width, height, lines</td>
                  <td><span class="joy-prop-type">'text' | 'rect' | 'circle', string, number</span></td>
                  <td>role="progressbar", aria-busy="true", GPU shimmer placeholder</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>
        </div>
      </section>


      <!-- View: Button -->
      <section id="view-button" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Button Component</h2>
        <p class="header-tagline">Primary action element supporting solid, outline, ghost, and danger styles across 3 sizes.</p>

        <div class="playground-box">
          <div class="playground-header">
            <div style="display: flex; align-items: center; gap: 10px;">
              <h4>Live Interactive Canvas</h4>
              <span class="joy-badge joy-badge--brand joy-badge--sm"><span class="joy-badge__dot"></span> Active Preview</span>
            </div>
            <div class="hub-header-note">Click the button or use the controls below</div>
          </div>
          <div class="canvas" id="button-canvas">
            <button class="joy-button joy-button--solid joy-button--md" id="demo-btn" onclick="handleBtnClick()"><span class="joy-button__label">Click Me! (Clicked: <span id="click-counter">0</span>)</span></button>
            <button class="joy-button joy-button--outline joy-button--md" onclick="setBtnVariant('outline')">Outline</button>
            <button class="joy-button joy-button--ghost joy-button--md" onclick="setBtnVariant('ghost')">Ghost</button>
            <button class="joy-button joy-button--danger joy-button--md" onclick="setBtnVariant('danger')">Danger</button>
          </div>
          <table class="controls-table">
            <tr>
              <td>Variant</td>
              <td>
                <div class="segmented-control" id="seg-variant">
                  <button class="segment-btn active" id="seg-v-solid" onclick="setBtnVariant('solid')">Solid</button>
                  <button class="segment-btn" id="seg-v-outline" onclick="setBtnVariant('outline')">Outline</button>
                  <button class="segment-btn" id="seg-v-ghost" onclick="setBtnVariant('ghost')">Ghost</button>
                  <button class="segment-btn" id="seg-v-danger" onclick="setBtnVariant('danger')">Danger</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>Size</td>
              <td>
                <div class="segmented-control" id="seg-size">
                  <button class="segment-btn" id="seg-s-sm" onclick="setBtnSize('sm')">Small (sm)</button>
                  <button class="segment-btn active" id="seg-s-md" onclick="setBtnSize('md')">Medium (md)</button>
                  <button class="segment-btn" id="seg-s-lg" onclick="setBtnSize('lg')">Large (lg)</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>Loading State</td>
              <td>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <button class="joy-switch" id="btn-loading-switch" role="switch" aria-checked="false" onclick="toggleBtnLoading()">
                    <span class="joy-switch__thumb"></span>
                  </button>
                  <span id="btn-loading-status" style="font-size: var(--joy-font-size-sm); font-weight: 500; color: var(--joy-text-muted);">Idle</span>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <h3>State matrix</h3>
        ${renderButtonMatrix()}

        <h3>Code Usage</h3>
        <div class="code-snippet" id="button-code">
          // Svelte 5 Runes Example<br>
          &lt;script&gt;<br>
          &nbsp;&nbsp;import { Button } from '@montionugera/joy-svelte';<br>
          &lt;/script&gt;<br><br>
          &lt;Button variant="solid" size="md" onclick={() => alert('Clicked')}&gt;Action&lt;/Button&gt;
        </div>
      </section>

      <!-- View: Badge -->
      <section id="view-badge" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Badge & Status Tag</h2>
        <p class="header-tagline">Visual status indicator with optional indicator dot and semantic status palettes.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Live Interactive Canvas</h4>
          </div>
          <div class="canvas">
            <span class="joy-badge joy-badge--brand joy-badge--md"><span class="joy-badge__dot"></span> Brand</span>
            <span class="joy-badge joy-badge--success joy-badge--md"><span class="joy-badge__dot"></span> Completed</span>
            <span class="joy-badge joy-badge--warning joy-badge--md"><span class="joy-badge__dot"></span> Pending</span>
            <span class="joy-badge joy-badge--danger joy-badge--md"><span class="joy-badge__dot"></span> Rejected</span>
            <span class="joy-badge joy-badge--neutral joy-badge--md">Draft</span>
          </div>
        </div>
      </section>

      <!-- View: Input -->
      <section id="view-input" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Input Field</h2>
        <p class="header-tagline">Form text field with error styling, clear outlines, and native keyboard navigation.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Interactive Form Input</h4>
          </div>
          <div class="canvas" style="flex-direction: column; max-width: 440px; margin: 0 auto;">
            <div class="joy-input-wrapper">
              <input class="joy-input" id="demo-input" placeholder="Type something here..." oninput="updateInputMirror(this.value)">
            </div>
            <div style="font-size: var(--joy-font-size-sm); color: var(--joy-text-muted); margin-top: 8px;">
              Live value: <strong id="input-mirror" style="color: var(--joy-accent-default);">(empty)</strong>
            </div>
          </div>
          <table class="controls-table">
            <tr>
              <td>Error State</td>
              <td>
                <div style="display: flex; align-items: center; gap: 12px;">
                  <button class="joy-switch" id="input-error-switch" role="switch" aria-checked="false" onclick="toggleInputError()">
                    <span class="joy-switch__thumb"></span>
                  </button>
                  <span id="input-error-status" style="font-size: var(--joy-font-size-sm); font-weight: 500; color: var(--joy-text-muted);">Normal (No Error)</span>
                </div>
              </td>
            </tr>
          </table>
        </div>
      </section>

      <!-- View: Switch -->
      <section id="view-switch" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Switch Component</h2>
        <p class="header-tagline">Accessible toggle switch with keyboard support and custom label positioning.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Interactive Toggle</h4>
          </div>
          <div class="canvas">
            <button type="button" role="switch" class="joy-switch" id="demo-switch" onclick="toggleSwitch()">
              <span class="joy-switch__thumb"></span>
              <span class="joy-switch__label" id="switch-status-label">Auto-Refresh: OFF</span>
            </button>
          </div>
        </div>
      </section>

      <!-- View: Alert -->
      <section id="view-alert" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Alert Component</h2>
        <p class="header-tagline">Contextual notification banners for messaging, validation, and system status. Every variant renders its status icon; closable alerts add a dismiss button.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Alert Variations</h4>
          </div>
          <div style="padding: 24px; display: flex; flex-direction: column; gap: var(--joy-space-3);">
            ${hubAlert("info", "System Information", "Real-time market feed connects to high-throughput WebSocket.")}
            ${hubAlert("success", "Order Executed", "Filled 1.5 BTC at $68,420.00 with 0.01% slippage.")}
            ${hubAlert("warning", "Margin Warning", "Maintenance margin usage reached 78%.", true)}
            ${hubAlert("danger", "API Disconnected", "Unable to reach gateway endpoint. Retrying in 5s...", true)}
          </div>
        </div>
      </section>

      <!-- View: Metric -->
      <section id="view-metric" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">MetricTile Component (Quant)</h2>
        <p class="header-tagline">High-density KPI metric display engineered for live trading dashboards and performance cards.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>KPI Tiles</h4>
          </div>
          <div class="canvas" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; width: 100%;">
            <div class="joy-metric-tile joy-metric-tile--up">
              <div class="joy-metric-tile__title">Portfolio Sharpe</div>
              <div class="joy-metric-tile__value">2.84</div>
              <div class="joy-metric-tile__change">+14.2% vs benchmark</div>
            </div>
            <div class="joy-metric-tile joy-metric-tile--down">
              <div class="joy-metric-tile__title">Max drawdown</div>
              <div class="joy-metric-tile__value">-4.12%</div>
              <div class="joy-metric-tile__change">-0.5% this session</div>
            </div>
            <div class="joy-metric-tile joy-metric-tile--neutral">
              <div class="joy-metric-tile__title">Active strategies</div>
              <div class="joy-metric-tile__value">12</div>
              <div class="joy-metric-tile__change">3 pending review</div>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Table -->
      <section id="view-table" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Compact Data Table</h2>
        <p class="header-tagline">High-frequency compact tabular data layout optimized for financial transactions and audit logs.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Execution Ledger</h4>
          </div>
          <div style="padding: 20px;">
            <div class="joy-table-container joy-table-container--responsive-stack">
              <table class="joy-table joy-table--compact joy-table--responsive-stack">
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>ASSET</th>
                    <th>SIDE</th>
                    <th>PRICE</th>
                    <th>SIZE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td data-label="ORDER ID"><code>#ORD-8921</code></td>
                    <td data-label="ASSET"><strong>BTC/USDT</strong></td>
                    <td data-label="SIDE"><span style="color: var(--joy-status-success-fg); font-weight: 600;">BUY</span></td>
                    <td data-label="PRICE">$67,820.50</td>
                    <td data-label="SIZE">0.45 BTC</td>
                    <td data-label="STATUS"><span class="joy-badge joy-badge--success joy-badge--sm">FILLED</span></td>
                  </tr>
                  <tr>
                    <td data-label="ORDER ID"><code>#ORD-8922</code></td>
                    <td data-label="ASSET"><strong>ETH/USDT</strong></td>
                    <td data-label="SIDE"><span style="color: var(--joy-status-danger-fg); font-weight: 600;">SELL</span></td>
                    <td data-label="PRICE">$3,510.20</td>
                    <td data-label="SIZE">4.20 ETH</td>
                    <td data-label="STATUS"><span class="joy-badge joy-badge--success joy-badge--sm">FILLED</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Modal -->
      <section id="view-modal" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Modal / Dialog Component</h2>
        <p class="header-tagline">Accessible modal dialog overlay with backdrop blur, focus trap, and escape key listener. The dialog contains a Popconfirm that opens above it on the popover layer; at 480px or less the dialog is full-bleed and the Popconfirm becomes a bottom sheet.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Interactive Dialog Trigger</h4>
          </div>
          <div class="canvas">
            <button type="button" class="joy-button joy-button--solid joy-button--md" aria-haspopup="dialog" onclick="openDemoModal()">
              Open Confirm Modal
            </button>
          </div>
        </div>

        <h3>Code Usage</h3>
        <div class="code-snippet">
          // Svelte 5<br>
          &lt;Modal open={isOpen} title="Confirm Order" onclose={() => isOpen = false}&gt;<br>
          &nbsp;&nbsp;Are you sure you want to proceed?<br>
          &lt;/Modal&gt;
        </div>
      </section>

      <!-- View: Dropdown -->
      <section id="view-dropdown" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Dropdown Menu Component</h2>
        <p class="header-tagline">Action menu with keyboard navigation, danger items, and animated spring popover.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Interactive Dropdown</h4>
          </div>
          <div class="canvas" style="min-height: 360px; gap: 32px; flex-wrap: wrap; justify-content: center; align-items: start;">
            <div>
              <div style="font-size: var(--joy-font-size-xs); font-weight: 600; color: var(--joy-text-secondary); margin-bottom: 8px;">STANDARD MENU (&lt; 6 ACTIONS)</div>
              ${hubDropdown("demo-dropdown-menu")}
            </div>
            <div>
              <div style="font-size: var(--joy-font-size-xs); font-weight: 600; color: var(--joy-text-secondary); margin-bottom: 8px;">AUTO SMART SEARCH MENU (&ge; 6 ACTIONS)</div>
              ${hubDropdownSearchable("demo-dropdown-searchable")}
            </div>
          </div>
          <div class="hub-demo-footer">
            Selected action: <strong id="dropdown-selection-text" style="color: var(--joy-accent-default);">None</strong>
          </div>
        </div>
      </section>

      <!-- View: Tabs -->
      <section id="view-tabs" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Tabs Layout Component</h2>
        <p class="header-tagline">Smooth tabbed navigation supporting controlled and uncontrolled active state transitions.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Interactive Tabs</h4>
          </div>
          <div style="padding: 24px;">
            ${hubTabs("demo-tabs", [{ label: "Live Orders", content: '<p style="margin: 0; color: var(--joy-text-secondary);">Showing 3 active live limit orders awaiting counter-party match.</p>' }, { label: "Historical Fills", content: '<p style="margin: 0; color: var(--joy-text-secondary);">12 fills executed in the last 24 hours with zero rejected packets.</p>' }, { label: "Risk Matrix", content: '<p style="margin: 0; color: var(--joy-text-secondary);">Value at Risk (VaR 99%): 1.42 BTC across delta-neutral positions.</p>' }])}
          </div>
        </div>
      </section>

      <!-- View: Tooltip -->
      <section id="view-tooltip" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Tooltip Overlay Component</h2>
        <p class="header-tagline">Informational micro-popover triggered on hover and keyboard focus with arrow pointer.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Interactive Tooltips</h4>
          </div>
          <div class="canvas" style="gap: 32px;">
            ${hubTooltip("demo-tip-a", "Hover me (trading fee)")}
            <div class="joy-tooltip-wrapper" onpointerenter="hubTip('demo-tip-b', true)" onpointerleave="hubTip('demo-tip-b', false)" onfocusin="hubTip('demo-tip-b', true)" onfocusout="hubTip('demo-tip-b', false)">
              <span class="joy-badge joy-badge--brand joy-badge--md" tabindex="0" aria-describedby="demo-tip-b">Focus me (keyboard)</span>
              <div id="demo-tip-b" class="joy-tooltip" role="tooltip" hidden>Accessible ARIA tooltip with keyboard tab support</div>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Select -->
      <section id="view-select" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Select Dropdown Component</h2>
        <p class="header-tagline">Accessible single-selection dropdown with custom styled caret, keyboard accessibility, and auto smart search.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Order Execution Routing &amp; Instrument Picker</h4>
          </div>
          <div class="canvas" style="min-height: 380px; flex-direction: column; max-width: 480px; margin: 0 auto; gap: 24px;">
            <div style="width: 100%;">
              <div style="font-size: var(--joy-font-size-xs); font-weight: 600; color: var(--joy-text-secondary); margin-bottom: 6px;">STANDARD SELECT (&lt; 6 OPTIONS)</div>
              <div class="joy-select-wrapper">
                <select class="joy-select" id="demo-order-select" onchange="handleSelectOrderType(this.value)">
                  <option value="limit">Limit Order (Default)</option>
                  <option value="market">Market Execution (Aggressive)</option>
                  <option value="stop_loss">Stop Loss Market</option>
                  <option value="trailing">Trailing Dynamic Stop</option>
                </select>
              </div>
              <div style="font-size: var(--joy-font-size-sm); color: var(--joy-text-muted); margin-top: 8px;">
                Active Mode: <strong id="demo-select-feedback" style="color: var(--joy-accent-default);">Limit Order</strong>
              </div>
            </div>

            <div style="width: 100%;">
              <div style="font-size: var(--joy-font-size-xs); font-weight: 600; color: var(--joy-text-secondary); margin-bottom: 6px;">AUTO SMART SEARCH SELECT (&ge; 6 OPTIONS)</div>
              ${hubSelectSearchable("demo-instrument-select-wrap", "demo-instrument-listbox")}
            </div>
          </div>
        </div>

        <div class="playground-box" style="margin-top: 24px; overflow: visible;">
          <div class="playground-header">
            <h4>Advanced Hierarchical Selects: Cascader &amp; TreeSelect (Ant Design 5 Benchmark)</h4>
          </div>
          <div class="canvas" style="min-height: 580px; padding-bottom: 240px; flex-direction: column; max-width: 540px; margin: 0 auto; gap: 32px; overflow: visible;">
            <div style="width: 100%;">
              <div style="font-size: var(--joy-font-size-xs); font-weight: 600; color: var(--joy-text-secondary); margin-bottom: 6px;">CASCADER: MULTI-COLUMN HIERARCHICAL NAVIGATION (HOVER REVEAL &amp; ASYNC LOADING)</div>
              ${hubCascaderInteractive("demo-cascader")}
            </div>

            <div style="width: 100%;">
              <div style="font-size: var(--joy-font-size-xs); font-weight: 600; color: var(--joy-text-secondary); margin-bottom: 6px;">TREESELECT: HIERARCHICAL SEARCH &amp; MULTI-CHECKBOX SELECTION (AUTO-EXPAND BRANCHES)</div>
              ${hubTreeSelectInteractive("demo-treeselect")}
            </div>
          </div>
        </div>
      </section>

      <!-- View: Checkbox -->
      <section id="view-checkbox" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Checkbox Control</h2>
        <p class="header-tagline">High-contrast binary state control with custom checkmark vector and keyboard focus outline.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Execution Constraints</h4>
          </div>
          <div class="canvas" style="gap: 28px;">
            <label class="joy-checkbox">
              <input type="checkbox" id="chk-post-only" checked onchange="handleCheckboxToggle('Post-Only', this.checked)">
              <span class="joy-checkbox__box"></span>
              <span>Post-Only (Maker Guarantee)</span>
            </label>

            <label class="joy-checkbox">
              <input type="checkbox" id="chk-reduce-only" onchange="handleCheckboxToggle('Reduce-Only', this.checked)">
              <span class="joy-checkbox__box"></span>
              <span>Reduce-Only</span>
            </label>

            <label class="joy-checkbox joy-checkbox--disabled">
              <input type="checkbox" disabled checked>
              <span class="joy-checkbox__box"></span>
              <span>Locked Margin (Disabled)</span>
            </label>
          </div>
        </div>
      </section>

      <!-- View: Radio Group -->
      <section id="view-radio" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Radio Group Component</h2>
        <p class="header-tagline">Accessible single-choice selection group with WAI-ARIA radiogroup traits.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Time In Force (TIF)</h4>
          </div>
          <div class="canvas">
            <div class="joy-radio-group" role="radiogroup">
              <label class="joy-radio">
                <input type="radio" name="tif" value="gtc" checked onchange="handleRadioSelect('Good \'Til Cancelled (GTC)')">
                <span class="joy-radio__circle"></span>
                <span>GTC (Good 'Til Cancelled)</span>
              </label>

              <label class="joy-radio">
                <input type="radio" name="tif" value="ioc" onchange="handleRadioSelect('Immediate Or Cancel (IOC)')">
                <span class="joy-radio__circle"></span>
                <span>IOC (Immediate Or Cancel)</span>
              </label>

              <label class="joy-radio">
                <input type="radio" name="tif" value="fok" onchange="handleRadioSelect('Fill Or Kill (FOK)')">
                <span class="joy-radio__circle"></span>
                <span>FOK (Fill Or Kill)</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Drawer -->
      <section id="view-drawer" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Drawer / Slide-out Sheet</h2>
        <p class="header-tagline">Heavyweight off-canvas inspection panel for deep financial telemetry, analytics, and detail workflows. At 480px or less it renders as a bottom sheet from either side.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Drawer Placement Triggers</h4>
          </div>
          <div class="canvas" style="gap: 20px;">
            <button type="button" class="joy-button joy-button--solid joy-button--md" aria-haspopup="dialog" onclick="openDemoDrawer('right')">
              Open right drawer (risk analytics)
            </button>
            <button type="button" class="joy-button joy-button--outline joy-button--md" aria-haspopup="dialog" onclick="openDemoDrawer('left')">
              Open left drawer (navigation tree)
            </button>
          </div>
        </div>
      </section>

      <!-- View: Toast -->
      <section id="view-toast" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Toast Notification System</h2>
        <p class="header-tagline">Non-blocking live notification system for market fills, margin calls, and system events.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Trigger Notification</h4>
          </div>
          <div class="canvas" style="gap: 16px;">
            <button class="joy-button joy-button--solid joy-button--md" onclick="showDemoToast('Limit order 89281 Filled at 68,420.00 USDT', 'success')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Fill Success
            </button>
            <button class="joy-button joy-button--outline joy-button--md" onclick="showDemoToast('WebSocket connection re-synchronized to Quant core', 'info')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              Network Info
            </button>
            <button class="joy-button joy-button--ghost joy-button--md" onclick="showDemoToast('Order latency warning: p99 spiked to 4.2ms', 'warning')" style="border: 1px solid var(--joy-border-default);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Latency Warning
            </button>
            <button class="joy-button joy-button--danger joy-button--md" onclick="showDemoToast('Risk margin threshold exceeded! Immediate liquidation guard', 'danger')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
              Risk Danger
            </button>
          </div>
        </div>
      </section>

      <!-- View: Financial Table -->
      <section id="view-financial-table" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Enterprise Financial Orderbook & Trading Table</h2>
        <p class="header-tagline">High-throughput sortable market tape with real-time green/red ticker flash animations and client-side filtering.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Live Quant Market Feeds</h4>
            <div style="display: flex; gap: 10px; align-items: center;">
              <input type="search" id="market-search-input" class="joy-input hub-market-search" placeholder="Filter pairs, e.g. BTC" aria-label="Filter pairs" oninput="handleMarketFilter(this.value)">
              <button class="joy-button joy-button--solid joy-button--sm" onclick="simulateRandomTick()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Random Tick
              </button>
              <button class="joy-button joy-button--outline joy-button--sm" id="btn-stream-toggle" onclick="toggleAutoStream()">
                <span id="autostream-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></span> Auto-Stream (Off)
              </button>
            </div>
          </div>
          <div style="padding: 16px;">
            <div class="joy-table-container joy-table-container--responsive-stack">
              <table class="joy-table joy-table--compact joy-table--responsive-stack" id="financial-order-table">
                <thead>
                  <tr>
                    <th class="joy-table-th--sortable" onclick="sortMarketTable('pair')">Pair <span class="joy-table-sort-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; opacity: 0.6;"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg></span></th>
                    <th class="joy-table-th--sortable" style="text-align: right;" onclick="sortMarketTable('price')">Price (USDT) <span class="joy-table-sort-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; opacity: 0.6;"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg></span></th>
                    <th class="joy-table-th--sortable" style="text-align: right;" onclick="sortMarketTable('change')">24h Change <span class="joy-table-sort-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; opacity: 0.6;"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg></span></th>
                    <th class="joy-table-th--sortable" style="text-align: right;" onclick="sortMarketTable('volume')">24h Vol (USDT) <span class="joy-table-sort-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; opacity: 0.6;"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg></span></th>
                    <th style="text-align: center;">Execution Status</th>
                  </tr>
                </thead>
                <tbody id="market-table-body">
                  <!-- Rendered dynamically -->
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Pagination -->
      <section id="view-pagination" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Pagination Controls</h2>
        <p class="header-tagline">Accessible ARIA navigation bar with quick page stepping, custom page sizes, and total count metadata.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Trade Ledger Pagination</h4>
          </div>
          <div class="canvas" style="flex-direction: column; align-items: stretch; max-width: 680px; margin: 0 auto;">
            <div style="background: var(--joy-surface-card); border: 1px solid var(--joy-border-default); border-radius: 8px; padding: 16px; margin-bottom: 16px;" id="paged-content-box">
              <div style="font-weight: 600; color: var(--joy-text-secondary); margin-bottom: 8px;" id="paged-range-text">Showing Orders 1 to 10 of 50</div>
              <ul style="margin: 0; padding-left: 20px; color: var(--joy-text-muted); font-size: var(--joy-font-size-sm);" id="paged-records-list">
                <!-- Records list -->
              </ul>
            </div>

            <nav class="joy-pagination" role="navigation" aria-label="Pagination">
              <button type="button" class="joy-pagination__btn" id="pg-prev" aria-label="Previous page" onclick="handlePageNav('prev')">${iconSvg("ChevronLeft")}</button>
              <button type="button" class="joy-pagination__btn joy-pagination__btn--active" id="pg-1" aria-label="Page 1" aria-current="page" onclick="goToDemoPage(1)">1</button>
              <button type="button" class="joy-pagination__btn" id="pg-2" aria-label="Page 2" onclick="goToDemoPage(2)">2</button>
              <button type="button" class="joy-pagination__btn" id="pg-3" aria-label="Page 3" onclick="goToDemoPage(3)">3</button>
              <button type="button" class="joy-pagination__btn" id="pg-4" aria-label="Page 4" onclick="goToDemoPage(4)">4</button>
              <button type="button" class="joy-pagination__btn" id="pg-5" aria-label="Page 5" onclick="goToDemoPage(5)">5</button>
              <button type="button" class="joy-pagination__btn" id="pg-next" aria-label="Next page" onclick="handlePageNav('next')">${iconSvg("ChevronRight")}</button>

              <select class="joy-select joy-pagination__size" aria-label="Items per page" onchange="handleDemoPageSize(this.value)">
                <option value="10">10 / page</option>
                <option value="20">20 / page</option>
                <option value="50">50 / page</option>
              </select>

              <span class="joy-pagination__info" id="pg-info-text">Total: 50 orders</span>
            </nav>
          </div>
        </div>
      </section>

      <!-- View: Skeleton -->
      <section id="view-skeleton" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Skeleton Loading States</h2>
        <p class="header-tagline">High-performance GPU gradient shimmer placeholders preventing layout shift during async order book fetches.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Asset Card Shimmer Placeholder</h4>
            <button class="joy-button joy-button--outline joy-button--sm" onclick="toggleSkeletonLoading()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg> Toggle Loading State
            </button>
          </div>
          <div class="canvas" style="gap: 32px; justify-content: center;">
            <div id="skeleton-card-loading" style="width: 320px; background: var(--joy-surface-card); border: 1px solid var(--joy-border-default); border-radius: 12px; padding: 20px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div class="joy-skeleton joy-skeleton--circle"></div>
                <div style="flex: 1;">
                  <div class="joy-skeleton joy-skeleton--text" style="width: 60%;"></div>
                  <div class="joy-skeleton joy-skeleton--text" style="width: 40%; margin-bottom: 0;"></div>
                </div>
              </div>
              <div class="joy-skeleton joy-skeleton--text"></div>
              <div class="joy-skeleton joy-skeleton--text" style="width: 80%;"></div>
              <div class="joy-skeleton joy-skeleton--rect" style="height: 60px; margin-top: 12px;"></div>
            </div>

            <div id="skeleton-card-loaded" style="display: none; width: 320px; background: var(--joy-surface-card); border: 1px solid var(--joy-border-default); border-radius: 12px; padding: 20px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--joy-accent-subtle); color: var(--joy-accent-default); display: flex; align-items: center; justify-content: center; font-weight: 700;">JOY</div>
                <div>
                  <h4 style="margin: 0; font-size: var(--joy-font-size-md);">Joymify Quant Pool</h4>
                  <span style="font-size: var(--joy-font-size-xs); color: var(--joy-text-muted);">Arbitrage High-Freq Vault</span>
                </div>
              </div>
              <p style="margin: 0 0 12px; font-size: var(--joy-font-size-sm); color: var(--joy-text-secondary); line-height: 1.5;">
                Delta-neutral funding rate harvester with sub-millisecond execution routing on Vultr Kubernetes.
              </p>
              <div class="hub-metric-row">
                <span style="font-size: var(--joy-font-size-sm); color: var(--joy-text-muted);">Annualized APY</span>
                <strong style="color: var(--joy-status-success-fg); font-size: var(--joy-font-size-lg); font-family: var(--joy-font-family-mono);">+28.4%</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Date & Range Picker -->
      <section id="view-date-picker" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Date & Range Picker</h2>
        <p class="header-tagline">AntDesign-grade enterprise date pickers with calendar popover triggers, two-way binding, error states, and dark mode support.</p>

        <div class="playground-box" style="overflow: visible;">
          <div class="playground-header">
            <h4>Single Date & Date Range Selectors</h4>
          </div>
          <div class="canvas" style="flex-direction: column; gap: 24px; align-items: flex-start; max-width: 600px; margin: 0 auto; position: relative; padding-bottom: 360px;">
            <div style="width: 100%;">
              <label style="display: block; font-size: var(--joy-font-size-sm); font-weight: 600; margin-bottom: 6px; color: var(--joy-text-muted);">Standard Date Picker</label>
              <div class="joy-date-picker" id="demo-date-picker-wrap" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="dialog" style="cursor: pointer; position: relative;">
                <input type="text" readonly class="joy-date-picker__input" id="demo-single-date" value="2026-09-19" placeholder="Select date">
                <div class="joy-date-picker__actions">
                  <button type="button" class="joy-date-picker__clear" id="demo-single-date-clear" aria-label="Clear date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  <span class="joy-date-picker__icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </span>
                </div>
                <div id="demo-single-calendar-popover" class="joy-calendar-overlay" role="dialog" aria-label="Choose date" style="display: none; top: calc(100% + 4px); left: 0;"></div>
              </div>
              <div style="font-size: var(--joy-font-size-xs); color: var(--joy-text-muted); margin-top: 4px;">Selected Date: <strong id="single-date-feedback" style="color: var(--joy-accent-default);">2026-09-19</strong></div>
            </div>

            <div style="width: 100%;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; margin-bottom: 6px;">
                <label style="font-size: var(--joy-font-size-sm); font-weight: 600; color: var(--joy-text-muted); overflow-wrap: anywhere;">Constrained Picker (Min/Max, Blackout, Weekends)</label>
                <span class="joy-tag joy-tag--subtle joy-tag--warning" style="font-size: 11px;">Restricted</span>
              </div>
              <div class="joy-date-picker" id="demo-constrained-date-picker-wrap" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="dialog" style="cursor: pointer; position: relative;">
                <input type="text" readonly class="joy-date-picker__input" id="demo-constrained-date" value="2026-09-15" placeholder="Select weekday in range">
                <div class="joy-date-picker__actions">
                  <button type="button" class="joy-date-picker__clear" id="demo-constrained-date-clear" aria-label="Clear date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  <span class="joy-date-picker__icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </span>
                </div>
                <div id="demo-constrained-calendar-popover" class="joy-calendar-overlay" role="dialog" aria-label="Choose date" style="display: none; top: calc(100% + 4px); left: 0;"></div>
              </div>
              <div style="font-size: var(--joy-font-size-xs); color: var(--joy-text-muted); margin-top: 4px;">Valid Date: <strong id="constrained-date-feedback" style="color: var(--joy-accent-default);">2026-09-15</strong></div>
            </div>

            <div style="width: 100%;">
              <label style="display: block; font-size: var(--joy-font-size-sm); font-weight: 600; margin-bottom: 6px; color: var(--joy-text-muted); overflow-wrap: anywhere;">Financial Date Range Picker (Backtest Window)</label>
              <div class="joy-date-range-picker joy-date-range-picker--unified" id="demo-range-picker-wrap" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="dialog" style="cursor: pointer; position: relative;">
                <input type="text" readonly class="joy-date-range-picker__input" id="demo-range-start" value="2026-01-01" placeholder="Start date">
                <span class="joy-date-range-picker__sep joy-date-range-picker__separator" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </span>
                <input type="text" readonly class="joy-date-range-picker__input" id="demo-range-end" value="2026-09-19" placeholder="End date">
                <div class="joy-date-range-picker__actions">
                  <button type="button" class="joy-date-range-picker__clear" id="demo-range-clear" aria-label="Clear range">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  <span class="joy-date-range-picker__icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </span>
                </div>
                <div id="demo-range-calendar-popover" class="joy-calendar-overlay joy-calendar-overlay--dual" role="dialog" aria-label="Choose date range" style="display: none; top: calc(100% + 4px); left: 0;"></div>
              </div>
              <div style="font-size: var(--joy-font-size-xs); color: var(--joy-text-muted); margin-top: 4px;">Active Interval: <strong id="range-date-feedback" style="color: var(--joy-accent-default);">2026-01-01 to 2026-09-19</strong></div>
            </div>

            <div style="width: 100%;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px; margin-bottom: 6px;">
                <label style="font-size: var(--joy-font-size-sm); font-weight: 600; color: var(--joy-text-muted); overflow-wrap: anywhere;">Trading Blackout Range (No Cross-Spans)</label>
                <span class="joy-tag joy-tag--subtle joy-tag--danger" style="font-size: 11px;">Cross-Blackout Blocked</span>
              </div>
              <div class="joy-date-range-picker joy-date-range-picker--unified" id="demo-blackout-range-picker-wrap" tabindex="0" role="combobox" aria-expanded="false" aria-haspopup="dialog" style="cursor: pointer; position: relative;">
                <input type="text" readonly class="joy-date-range-picker__input" id="demo-blackout-start" value="2026-01-05" placeholder="Start date">
                <span class="joy-date-range-picker__sep joy-date-range-picker__separator" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </span>
                <input type="text" readonly class="joy-date-range-picker__input" id="demo-blackout-end" value="2026-01-09" placeholder="End date">
                <div class="joy-date-range-picker__actions">
                  <button type="button" class="joy-date-range-picker__clear" id="demo-blackout-clear" aria-label="Clear range">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                  <span class="joy-date-range-picker__icon" aria-hidden="true">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </span>
                </div>
                <div id="demo-blackout-range-calendar-popover" class="joy-calendar-overlay joy-calendar-overlay--dual" role="dialog" aria-label="Choose date range" style="display: none; top: calc(100% + 4px); left: 0;"></div>
              </div>
              <div style="font-size: var(--joy-font-size-xs); color: var(--joy-text-muted); margin-top: 4px;">Booking Window: <strong id="blackout-range-feedback" style="color: var(--joy-accent-default);">2026-01-05 to 2026-01-09</strong></div>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Data Display & Feedback (Wave 3 aspect view) -->
      ${renderDisplayView()}

      <!-- View: Progress -->
      <section id="view-progress" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Progress Bars</h2>
        <p class="header-tagline">AntDesign status bar parity with active gradient shimmer, success indicators, and failure states.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Interactive Progress Engine</h4>
          </div>
          <div class="canvas" style="flex-direction: column; gap: 20px; align-items: stretch; max-width: 600px; margin: 0 auto;">
            <div>
              <div style="font-size: var(--joy-font-size-sm); font-weight: 600; margin-bottom: 6px; color: var(--joy-text-muted);">Active Harvest Task (72%)</div>
              <div class="joy-progress">
                <div class="joy-progress__outer">
                  <div class="joy-progress__inner">
                    <div class="joy-progress__bg" style="width: 72%; height: 8px;"></div>
                  </div>
                </div>
                <span class="joy-progress__text">72%</span>
              </div>
            </div>

            <div>
              <div style="font-size: var(--joy-font-size-sm); font-weight: 600; margin-bottom: 6px; color: var(--joy-text-muted);">Completed Sync (100% Success)</div>
              <div class="joy-progress joy-progress--status-success">
                <div class="joy-progress__outer">
                  <div class="joy-progress__inner">
                    <div class="joy-progress__bg" style="width: 100%; height: 8px;"></div>
                  </div>
                </div>
                <span class="joy-progress__text">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </span>
              </div>
            </div>

            <div>
              <div style="font-size: var(--joy-font-size-sm); font-weight: 600; margin-bottom: 6px; color: var(--joy-text-muted);">Failed Execution (Exception State)</div>
              <div class="joy-progress joy-progress--status-exception">
                <div class="joy-progress__outer">
                  <div class="joy-progress__inner">
                    <div class="joy-progress__bg" style="width: 45%; height: 8px;"></div>
                  </div>
                </div>
                <span class="joy-progress__text">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Empty State -->
      <section id="view-empty-state" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Empty State</h2>
        <p class="header-tagline">Centered feedback view for zero-data scenarios, unconfigured vaults, or empty search queries.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>No Active Positions Placeholder</h4>
          </div>
          <div class="canvas" style="padding: 40px 20px;">
            <div class="joy-empty-state">
              <div class="joy-empty-state__icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <h3 class="joy-empty-state__title">No Active Arbitrage Vaults</h3>
              <p class="joy-empty-state__desc">You have not deployed any high-frequency quant vaults. Deploy a delta-neutral liquidity vault to start harvesting yields.</p>
              <div class="joy-empty-state__action">
                <button class="joy-button joy-button--solid joy-button--sm" onclick="showDemoToast('Vault deployment wizard initialized', 'info')">
                  Deploy First Vault
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Upload & Dragger -->
      <section id="view-upload" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Upload & Dragger Component</h2>
        <p class="header-tagline">Ant Design compliant drag-and-drop file upload with progress feedback, file metadata cards, and removal actions.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Interactive Dragger Zone</h4>
          </div>
          <div class="canvas" style="padding: 24px; max-width: 600px; margin: 0 auto;">
            <div class="joy-upload">
              <input type="file" id="demo-upload-input" style="display: none;" onchange="handleDemoUpload(this.files)" multiple />
              <div
                class="joy-upload-dragger"
                id="demo-upload-dragger"
                onclick="document.getElementById('demo-upload-input').click()"
                ondragover="event.preventDefault(); this.classList.add('joy-upload-dragger--dragover');"
                ondragleave="this.classList.remove('joy-upload-dragger--dragover');"
                ondrop="event.preventDefault(); this.classList.remove('joy-upload-dragger--dragover'); handleDemoUpload(event.dataTransfer.files);"
              >
                <div class="joy-upload-dragger__icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <div class="joy-upload-dragger__text">Click or drag files to this area to upload</div>
                <div class="joy-upload-dragger__hint">Support for single or bulk strategy JSON, backtest CSV, or KYC document upload.</div>
              </div>
              <div class="joy-upload-list" id="demo-upload-list">
                <div class="joy-upload-list__item" id="demo-file-1">
                  <div class="joy-upload-list__item-info">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-accent-default); flex-shrink: 0;">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                      <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                    <span style="font-weight: 500;">alpha_momentum_v3.json</span>
                    <span style="color: var(--joy-text-muted); font-size: var(--joy-font-size-xs);">(42.8 KB)</span>
                  </div>
                  <button type="button" class="joy-upload-list__item-remove" onclick="document.getElementById('demo-file-1').remove(); showDemoToast('Removed alpha_momentum_v3.json', 'info');">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Avatar & AvatarGroup -->
      <section id="view-avatar" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Avatar & AvatarGroup Component</h2>
        <p class="header-tagline">Circle and square avatars with image fallbacks, initials generation, active status indicators, and overlapping team stacks.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Avatar Sizes, Status Indicators & Overlapping Groups</h4>
          </div>
          <div class="canvas" style="padding: 32px; display: flex; flex-direction: column; gap: 24px; align-items: flex-start;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <div class="joy-avatar joy-avatar--circle joy-avatar--sm"><span class="joy-avatar__fallback">QA</span></div>
              <div class="joy-avatar joy-avatar--circle joy-avatar--md"><span class="joy-avatar__fallback">JD</span><span class="joy-avatar__badge joy-avatar__badge--online"></span></div>
              <div class="joy-avatar joy-avatar--circle joy-avatar--lg"><span class="joy-avatar__fallback">TC</span><span class="joy-avatar__badge joy-avatar__badge--offline"></span></div>
              <div class="joy-avatar joy-avatar--square joy-avatar--lg joy-avatar--info"><span class="joy-avatar__fallback">VT</span></div>
            </div>

            <div style="margin-top: 8px;">
              <h5 class="hub-demo-label">Avatar group, overlapping team stack</h5>
              <div class="joy-avatar-group">
                <div class="joy-avatar joy-avatar--circle joy-avatar--md joy-avatar--brand"><span class="joy-avatar__fallback">AM</span></div>
                <div class="joy-avatar joy-avatar--circle joy-avatar--md joy-avatar--success"><span class="joy-avatar__fallback">BL</span></div>
                <div class="joy-avatar joy-avatar--circle joy-avatar--md joy-avatar--warning"><span class="joy-avatar__fallback">CR</span></div>
                <div class="joy-avatar joy-avatar--circle joy-avatar--md joy-avatar-group__overflow" role="img" aria-label="4 more">+4</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Slider -->
      <section id="view-slider" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Slider & Stepped Range Input</h2>
        <p class="header-tagline">Continuous and stepped value slider with customized gradient track, dragging tooltip bubbles, and keyboard accessible handles.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Interactive Quant Leverage & Threshold Slider</h4>
          </div>
          <div class="canvas" style="padding: 40px 32px; max-width: 540px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <label style="font-size: var(--joy-font-size-sm); font-weight: 600;">Max Execution Leverage</label>
              <span class="joy-badge joy-badge--brand joy-badge--sm" id="demo-slider-badge">25x</span>
            </div>
            <div class="joy-slider" id="demo-slider-box">
              <div class="joy-slider__rail"></div>
              <div class="joy-slider__track" id="demo-slider-track" style="width: 25%;"></div>
              <div class="joy-slider__handle" id="demo-slider-handle" style="left: 25%;" tabindex="0" role="slider" aria-valuenow="25" aria-valuemin="1" aria-valuemax="100">
                <div class="joy-slider__tooltip" id="demo-slider-tooltip" style="display: none;">25x</div>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: var(--joy-font-size-xs); color: var(--joy-text-muted); margin-top: 8px;">
              <span>1x (Spot)</span>
              <span>50x</span>
              <span>100x (Max)</span>
            </div>
          </div>
        </div>
      </section>

      <!-- View: MarkdownViewer & Code Box Suite -->
      <section id="view-markdown" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Markdown, Code Box & Mermaid Suite</h2>
        <p class="header-tagline">Stream-safe high-performance markdown renderer with semantic syntax highlighting (Rust, TypeScript, Python, SQL, Bash), line numbering, polyglot language tabs, and interactive Mermaid diagram rendering.</p>

        <!-- 1. Standalone CodeBlock (Rust) -->
        <div class="playground-box">
          <div class="playground-header">
            <h4>Standalone CodeBlock (Rust with Semantic Token Highlighting & Line Numbers)</h4>
          </div>
          <div class="canvas" style="padding: 24px;">
            ${renderHubCodeBlock(hubRustSample, "rust", "src/arbitrage.rs", true)}
          </div>
        </div>

        <!-- 2. Polyglot Code Tabs -->
        <div class="playground-box">
          <div class="playground-header">
            <h4>PolyglotCodeTabs (Interactive Multi-Language Switching)</h4>
          </div>
          <div class="canvas" style="padding: 24px;">
            ${renderHubPolyglotTabs([
              { label: "Rust", lang: "rust", filename: "src/arbitrage.rs", code: hubRustSample },
              { label: "TypeScript", lang: "typescript", filename: "src/router.ts", code: hubTsSample },
              { label: "Python", lang: "python", filename: "src/hedge.py", code: hubPySample }
            ])}
          </div>
        </div>

        <!-- 3. Mermaid Diagrams -->
        <div class="playground-box">
          <div class="playground-header">
            <h4>MermaidViewer (Flowchart & Sequence Diagrams with Diagram/Source Switcher)</h4>
          </div>
          <div class="canvas" style="padding: 24px;">
            ${renderHubMermaid(hubFlowchartCode, "Quant Execution Architecture")}
            ${renderHubMermaid(hubSequenceCode, "Atomic Order Routing Sequence")}
          </div>
        </div>

        <!-- 4. MarkdownViewer Live Document -->
        <div class="playground-box">
          <div class="playground-header">
            <h4>MarkdownViewer (Stream-Safe Rich Technical Document with Code & Mermaid)</h4>
          </div>
          <div class="canvas" style="padding: 24px; max-width: 760px;">
            <div class="joy-markdown">
              <h2>Delta-Neutral Arbitrage Execution Spec</h2>
              <p>The <strong>Joymify Quant Strategy Engine</strong> executes cross-venue arbitrage across centralized and decentralized liquidity books.</p>
              <blockquote>
                <strong>Execution Safety:</strong> Slippage protection circuit breaker is actively enforced at 0.05% tolerance.
              </blockquote>
              ${renderHubCodeBlock(hubTsSample, "typescript", "router.ts", false)}
              <table class="joy-markdown__table">
                <thead>
                  <tr>
                    <th>Venue</th>
                    <th>Latency</th>
                    <th>Fee Tier</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Binance Futures</td>
                    <td>1.2ms</td>
                    <td>0.015%</td>
                    <td>Active</td>
                  </tr>
                  <tr>
                    <td>Bybit Perps</td>
                    <td>1.8ms</td>
                    <td>0.020%</td>
                    <td>Active</td>
                  </tr>
                  <tr>
                    <td>Hyperliquid L1</td>
                    <td>0.6ms</td>
                    <td>0.000%</td>
                    <td>Optimal</td>
                  </tr>
                </tbody>
              </table>
              <h3>System Topology</h3>
              ${renderHubMermaid(hubFlowchartCode, "System Topology")}
            </div>
          </div>
        </div>
      </section>

      <!-- View: Icons Gallery -->
      <section id="view-icons-gallery" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Vector Icons Gallery (@montionugera/joy-icons)</h2>
        <p class="header-tagline">138 enterprise SVG icons covering trading, navigation, file ops, and observability with full dark-mode and stroke/fill adaptability. Click any icon to copy its component import.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Icon system (138 vector assets for Svelte 5 and React 19)</h4>
            <div id="copy-toast-banner" style="font-size: var(--joy-font-size-sm); color: var(--joy-status-success-fg); font-weight: 600; display: none;">Copied to clipboard</div>
          </div>
          <div style="padding: 24px;">
            <div class="icon-grid">
              ${iconCardsHtml}
            </div>
          </div>
        </div>
      </section>

      <!-- landing-blocks:generated:start -->
      <!-- Generated by apps/storybook-hub/scripts/gen-landing-blocks.mjs from the Svelte components: do not edit by hand. -->
      <section id="view-landing-blocks" class="view-panel">
        <h2 class="landing-demo-title">
          Landing Blocks
        </h2>
        <p class="header-tagline">
          Every landing block in the states it can be in: hero (default, loading, disabled), feature grid with 3 to 6 cards, bento spans 1 to 12, pricing cards and comparison table, stats, testimonials, FAQ, logo cloud, call to action and footer. The markup is what the components render.
        </p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>
              Hero states (HeroSection)
            </h4>
          </div>
          <div class="landing-demo">
            <p class="landing-demo__note">
              Default with a title emphasis, then the primary button loading, disabled, and both buttons as links. The secondary button stays available in every state.
            </p>
            <div class="landing-demo__stack">
              <div class="landing-demo__group">
                <h5 class="landing-demo__label">
                  Default with title emphasis
                </h5>
                <div class="landing-demo__frame">
                  <section class="joy-hero">
                    <div class="joy-hero__badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> New: landing blocks
                    </div>
                    <h1 class="joy-hero__title">
                      Launch pages that feel <span class="joy-hero__title-emphasis">finished</span>
                    </h1>
                    <p class="joy-hero__subtitle">
                      Ready-made sections that share tokens, states and keyboard behaviour with the rest of the system.
                    </p>
                    <div class="joy-hero__ctas">
                      <button type="button" class="joy-button joy-button--solid joy-button--lg"> <span class="joy-button__label">Get started free</span>  </button> <button type="button" class="joy-button joy-button--outline joy-button--lg joy-hero__secondary-cta"> <span class="joy-button__label">Read the docs</span>  </button>
                    </div>
                  </section>
                </div>
              </div>
              <div class="landing-demo__group">
                <h5 class="landing-demo__label">
                  Primary loading
                </h5>
                <div class="landing-demo__frame">
                  <section class="joy-hero">
                    <h1 class="joy-hero__title">
                      Primary action while loading
                    </h1>
                    <p class="joy-hero__subtitle">
                      The button shows a spinner, ignores clicks and reports aria-busy.
                    </p>
                    <div class="joy-hero__ctas">
                      <button type="button" class="joy-button joy-button--solid joy-button--lg joy-button--loading" disabled="" aria-busy="true"> <span class="joy-button__label">Creating account</span>  <span class="joy-button__spinner" aria-hidden="true"><svg class="joy-button__spinner-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg></span></button> <button type="button" class="joy-button joy-button--outline joy-button--lg joy-hero__secondary-cta"> <span class="joy-button__label">Read the docs</span>  </button>
                    </div>
                  </section>
                </div>
              </div>
              <div class="landing-demo__group">
                <h5 class="landing-demo__label">
                  Primary disabled
                </h5>
                <div class="landing-demo__frame">
                  <section class="joy-hero">
                    <h1 class="joy-hero__title">
                      Primary action disabled
                    </h1>
                    <p class="joy-hero__subtitle">
                      The button is dimmed and skipped by the keyboard until the form is ready.
                    </p>
                    <div class="joy-hero__ctas">
                      <button type="button" class="joy-button joy-button--solid joy-button--lg" disabled=""> <span class="joy-button__label">Get started free</span>  </button> <button type="button" class="joy-button joy-button--outline joy-button--lg joy-hero__secondary-cta"> <span class="joy-button__label">Read the docs</span>  </button>
                    </div>
                  </section>
                </div>
              </div>
              <div class="landing-demo__group">
                <h5 class="landing-demo__label">
                  Both as links
                </h5>
                <div class="landing-demo__frame">
                  <section class="joy-hero">
                    <h1 class="joy-hero__title">
                      Primary action as a link
                    </h1>
                    <p class="joy-hero__subtitle">
                      With an href both buttons render as anchors and keep the same look.
                    </p>
                    <div class="joy-hero__ctas">
                      <a class="joy-button joy-button--solid joy-button--lg" href="#"><span class="joy-button__label">Open the docs</span> </a> <a class="joy-button joy-button--outline joy-button--lg joy-hero__secondary-cta" href="#"><span class="joy-button__label">See pricing</span> </a>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="landing-hero-options-wrapper" id="landing-hero-options">
          <div class="landing-hero-options-header">
            <div>
              <h3 style="margin: 0 0 4px 0; font-size: var(--joy-font-size-md); font-weight: 700; color: var(--joy-text-primary);">
                Interactive Hero &amp; 3D Cover Variants (8 Archetypes)
              </h3>
              <p style="margin: 0; font-size: var(--joy-font-size-xs); color: var(--joy-text-secondary);">
                Toggle between 8 production-grade hero section archetypes: Antigravity particles, 3D wave mesh, centered luxury editorial image cover, Apple keynote, SaaS financial cockpit, Cyberpunk HUD, Swiss typographic poster, and Luminous fluid aura.
              </p>
            </div>
            <div class="hub-segmented-ctrl hub-segmented-ctrl--wrap" role="tablist" aria-label="Hero section variant switcher">
              <button class="segment-btn active" id="btn-hero-opt-antigravity" onclick="switchHeroOption('antigravity')" role="tab" aria-selected="true">Antigravity</button>
              <button class="segment-btn" id="btn-hero-opt-mesh3d" onclick="switchHeroOption('mesh3d')" role="tab" aria-selected="false">3D Wave</button>
              <button class="segment-btn" id="btn-hero-opt-editorial" onclick="switchHeroOption('editorial')" role="tab" aria-selected="false">Editorial Cover</button>
              <button class="segment-btn" id="btn-hero-opt-keynote" onclick="switchHeroOption('keynote')" role="tab" aria-selected="false">Apple Keynote</button>
              <button class="segment-btn" id="btn-hero-opt-cockpit" onclick="switchHeroOption('cockpit')" role="tab" aria-selected="false">SaaS Cockpit</button>
              <button class="segment-btn" id="btn-hero-opt-cyberpunk" onclick="switchHeroOption('cyberpunk')" role="tab" aria-selected="false">Cyberpunk HUD</button>
              <button class="segment-btn" id="btn-hero-opt-swiss" onclick="switchHeroOption('swiss')" role="tab" aria-selected="false">Swiss Poster</button>
              <button class="segment-btn" id="btn-hero-opt-aura" onclick="switchHeroOption('aura')" role="tab" aria-selected="false">Fluid Aura</button>
            </div>
          </div>
          <div class="kinetic-canvas-container hero-option-panel active" id="kinetic-hero-container">
            <canvas class="kinetic-canvas" id="kinetic-particle-canvas" aria-hidden="true"></canvas>
            <div class="kinetic-subvariants-bar" id="kinetic-subvariants-bar" role="tablist" aria-label="Particle animation presets">
              <span class="kinetic-subvariants-label">Physics Archetype:</span>
              <button type="button" class="kinetic-sub-btn active" id="btn-sub-gold" onclick="switchKineticSubvariant('gold')" role="tab" aria-selected="true">Obsidian &amp; 24K Gold</button>
              <button type="button" class="kinetic-sub-btn" id="btn-sub-cosmos" onclick="switchKineticSubvariant('cosmos')" role="tab" aria-selected="false">Cosmos Aurora</button>
              <button type="button" class="kinetic-sub-btn" id="btn-sub-titanium" onclick="switchKineticSubvariant('titanium')" role="tab" aria-selected="false">Titanium Prism</button>
              <button type="button" class="kinetic-sub-btn" id="btn-sub-cyberpunk" onclick="switchKineticSubvariant('cyberpunk')" role="tab" aria-selected="false">Cyberpunk HUD</button>
              <button type="button" class="kinetic-sub-btn" id="btn-sub-plasma" onclick="switchKineticSubvariant('plasma')" role="tab" aria-selected="false">Solar Plasma</button>
              <button type="button" class="kinetic-sub-btn" id="btn-sub-swiss" onclick="switchKineticSubvariant('swiss')" role="tab" aria-selected="false">Swiss Halftone</button>
            </div>
            <section class="joy-hero">
              <div class="joy-hero__badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Interactive Antigravity particle field
              </div>
              <h1 class="joy-hero__title">
                Fast, clear <span class="joy-hero__title-emphasis">order screens for busy desks</span>
              </h1>
              <p class="joy-hero__subtitle">
                Order routing, dark-mode telemetry and steady UI parts built for dense, accessible screens.
              </p>
              <div class="joy-hero__ctas">
                <button type="button" class="joy-button joy-button--solid joy-button--lg"> <span class="joy-button__label">Deploy solution</span>  </button> <button type="button" class="joy-button joy-button--outline joy-button--lg joy-hero__secondary-cta"> <span class="joy-button__label">Read the guide</span>  </button>
              </div>
            </section>
          </div>
          <div class="mesh-3d-hero-container hero-option-panel" id="mesh-hero-container" style="display: none;">
            <canvas class="mesh-3d-canvas" id="mesh-3d-canvas" aria-hidden="true"></canvas>
            <section class="joy-hero">
              <div class="joy-hero__badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> 3D Volumetric Wave Mesh
              </div>
              <h1 class="joy-hero__title">
                Build anything with <span class="joy-hero__title-emphasis">real-time speed</span>
              </h1>
              <p class="joy-hero__subtitle">
                Move faster, go further, and bring your biggest ideas to life with dynamic spatial computing and responsive primitives.
              </p>
              <div class="joy-hero__ctas">
                <button type="button" class="joy-button joy-button--solid joy-button--lg"> <span class="joy-button__label">Download for macOS</span>  </button> <button type="button" class="joy-button joy-button--outline joy-button--lg joy-hero__secondary-cta"> <span class="joy-button__label">Try on web</span>  </button>
              </div>
            </section>
          </div>
          <div class="editorial-cover-container hero-option-panel" id="editorial-cover-container" style="display: none;">
            <div class="editorial-cover__image-backdrop" aria-hidden="true">
              <svg class="editorial-cover__svg-art" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="ed-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="var(--joy-surface-sunken)" stop-opacity="0.95"/>
                    <stop offset="50%" stop-color="var(--joy-surface-raised)" stop-opacity="0.85"/>
                    <stop offset="100%" stop-color="var(--joy-surface-sunken)" stop-opacity="0.98"/>
                  </linearGradient>
                  <radialGradient id="ed-gold-glow" cx="50%" cy="45%" r="50%">
                    <stop offset="0%" stop-color="var(--joy-accent-default)" stop-opacity="0.22"/>
                    <stop offset="50%" stop-color="var(--joy-accent-subtle)" stop-opacity="0.08"/>
                    <stop offset="100%" stop-color="transparent" stop-opacity="0"/>
                  </radialGradient>
                  <linearGradient id="ed-gold-ribbon" x1="0%" y1="0%" x2="100%" y2="50%">
                    <stop offset="0%" stop-color="var(--joy-accent-default)" stop-opacity="0.6"/>
                    <stop offset="50%" stop-color="var(--joy-accent-highlight)" stop-opacity="0.9"/>
                    <stop offset="100%" stop-color="var(--joy-accent-hover)" stop-opacity="0.4"/>
                  </linearGradient>
                  <linearGradient id="ed-shadow-overlay" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="var(--joy-surface-sunken)" stop-opacity="0.65"/>
                    <stop offset="50%" stop-color="var(--joy-surface-sunken)" stop-opacity="0.2"/>
                    <stop offset="100%" stop-color="var(--joy-surface-sunken)" stop-opacity="0.85"/>
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#ed-bg)"/>
                <circle cx="600" cy="300" r="380" fill="url(#ed-gold-glow)"/>
                <path d="M 200,550 C 350,220 520,120 700,160 C 880,200 980,380 1100,550" fill="none" stroke="url(#ed-gold-ribbon)" stroke-width="2" opacity="0.6"/>
                <path d="M 150,580 C 320,180 560,80 780,130 C 1000,180 1060,420 1150,580" fill="none" stroke="var(--joy-border-default)" stroke-width="1" opacity="0.3" stroke-dasharray="4,6"/>
                <path d="M 420,480 C 460,340 540,240 680,260 C 760,270 820,360 840,480 Z" fill="var(--joy-surface-inverse)" opacity="0.12"/>
                <path d="M 440,460 C 480,350 550,270 660,285 C 730,295 780,370 800,460 Z" fill="none" stroke="var(--joy-accent-default)" stroke-width="1.5" opacity="0.45"/>
                <rect width="100%" height="100%" fill="url(#ed-shadow-overlay)"/>
              </svg>
              <div class="editorial-cover__grain" aria-hidden="true">
              </div>
            </div>
            <div class="editorial-cover__topbar">
              <span class="editorial-cover__locale">JOYMIFY STUDIO</span>
              <div class="editorial-cover__brand">
                J O Y M I F Y
              </div>
              <div class="editorial-cover__actions">
                <span class="editorial-cover__action-label">ISSUE 04 // 2026</span>
              </div>
            </div>
            <div class="editorial-cover__centerpiece">
              <div class="editorial-cover__eyebrow">
                Autumn / Winter 2026 Collection
              </div>
              <h2 class="editorial-cover__title">
                กระเป๋าถือสำหรับผู้หญิง
              </h2>
              <p class="editorial-cover__desc">
                Architectural form meets tactile precision in obsidian leather and brushed gold hardware.
              </p>
              <div class="editorial-cover__cta-wrap">
                <button type="button" class="joy-button joy-button--solid joy-button--md editorial-cover__btn" onclick="showDemoToast('Exploring the luxury collection', 'success')">
                  <span class="joy-button__label">ค้นหาเพิ่มเติม</span>
                </button>
              </div>
            </div>
            <div class="editorial-cover__bottombar">
              <span>PARIS • MILAN • TOKYO • BANGKOK</span>
              <span>LIMITED EDITION 01/50</span>
            </div>
          </div>
          <div class="keynote-hero-container hero-option-panel" id="keynote-hero-container" style="display: none;">
            <div class="keynote-hero__stage">
              <div class="keynote-hero__halo" aria-hidden="true">
              </div>
              <section class="joy-hero">
                <div class="joy-hero__badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Titanium • M4 Max • Super Retina XDR
                </div>
                <h1 class="joy-hero__title">
                  Pro beyond measure <span class="joy-hero__title-emphasis">in every dimension</span>
                </h1>
                <p class="joy-hero__subtitle">
                  Precision-milled aerospace titanium housing unmatched silicon performance and all-day thermal stability.
                </p>
                <div class="joy-hero__ctas">
                  <button type="button" class="joy-button joy-button--solid joy-button--lg"> <span class="joy-button__label">Pre-order now</span>  </button> <button type="button" class="joy-button joy-button--outline joy-button--lg joy-hero__secondary-cta"> <span class="joy-button__label">Watch keynote</span>  </button>
                </div>
              </section>
              <div class="keynote-hero__device-mockup" aria-hidden="true">
                <div class="keynote-device-frame">
                  <div class="keynote-device-screen">
                    <div class="keynote-screen-glow">
                    </div>
                    <div class="keynote-screen-notch">
                    </div>
                    <div class="keynote-screen-content">
                      <span class="keynote-screen-time">9:41</span>
                      <span class="keynote-screen-chip">M4 Max</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="cockpit-hero-container hero-option-panel" id="cockpit-hero-container" style="display: none;">
            <div class="cockpit-hero__telemetry-bar">
              <div class="cockpit-telemetry-pill">
                <span class="status-indicator-dot"></span>
                <span>Gateway: 0.42ms DPDK</span>
              </div>
              <div class="cockpit-telemetry-pill">
                <span>Order Book: 1,420,890 evt/s</span>
              </div>
              <div class="cockpit-telemetry-pill">
                <span>Settlement: 14 Chains Active</span>
              </div>
            </div>
            <section class="joy-hero">
              <div class="joy-hero__badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Live Tick Engine // 0.42ms DPDK
              </div>
              <h1 class="joy-hero__title">
                Execution at the <span class="joy-hero__title-emphasis">speed of light</span>
              </h1>
              <p class="joy-hero__subtitle">
                Direct market access with microsecond order routing, cross-margin risk telemetry, and unified multi-venue settlement.
              </p>
              <div class="joy-hero__ctas">
                <button type="button" class="joy-button joy-button--solid joy-button--lg"> <span class="joy-button__label">Launch terminal</span>  </button> <button type="button" class="joy-button joy-button--outline joy-button--lg joy-hero__secondary-cta"> <span class="joy-button__label">API reference</span>  </button>
              </div>
            </section>
            <div class="cockpit-hero__sparkline-dock">
              <canvas class="cockpit-sparkline-canvas" id="cockpit-sparkline-canvas" width="600" height="80" aria-label="Real-time order latency telemetry"></canvas>
            </div>
          </div>
          <div class="cyberpunk-hero-container hero-option-panel" id="cyberpunk-hero-container" style="display: none;">
            <div class="cyberpunk-hud-reticle cyberpunk-hud-reticle--tl" aria-hidden="true">
              [ + ]
            </div>
            <div class="cyberpunk-hud-reticle cyberpunk-hud-reticle--tr" aria-hidden="true">
              [ + ]
            </div>
            <div class="cyberpunk-hud-reticle cyberpunk-hud-reticle--bl" aria-hidden="true">
              [ + ]
            </div>
            <div class="cyberpunk-hud-reticle cyberpunk-hud-reticle--br" aria-hidden="true">
              [ + ]
            </div>
            <div class="cyberpunk-hud-status-strip">
              <span>SYS_CLK // 4.80GHz</span>
              <span>BUFFER // LOCKED</span>
              <span>NODE // US-EAST-01</span>
            </div>
            <section class="joy-hero">
              <div class="joy-hero__badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> NEURAL_HUD // SEC_LVL: ALPHA
              </div>
              <h1 class="joy-hero__title">
                Tactical telemetry <span class="joy-hero__title-emphasis">engineered for zero failure</span>
              </h1>
              <p class="joy-hero__subtitle">
                Real-time neural interface protocols with sub-millisecond heartbeat monitoring and hardened cryptography.
              </p>
              <div class="joy-hero__ctas">
                <button type="button" class="joy-button joy-button--solid joy-button--lg"> <span class="joy-button__label">Initialize link</span>  </button> <button type="button" class="joy-button joy-button--outline joy-button--lg joy-hero__secondary-cta"> <span class="joy-button__label">Telemetry logs</span>  </button>
              </div>
            </section>
            <div class="cyberpunk-scanline-laser" aria-hidden="true">
            </div>
          </div>
          <div class="swiss-hero-container hero-option-panel" id="swiss-hero-container" style="display: none;">
            <div class="swiss-marquee-bar" aria-hidden="true">
              <div class="swiss-marquee-content">
                <span>JOYMIFY DESIGN SYSTEM • MODERNIST CANON • SVELTE 5 &amp; REACT 19 • SEMANTIC TOKENS • WCAG 2.2 AA • ZERO DECORATIVE SLOP • PURE COMPONENT PARITY •</span>
                <span>JOYMIFY DESIGN SYSTEM • MODERNIST CANON • SVELTE 5 &amp; REACT 19 • SEMANTIC TOKENS • WCAG 2.2 AA • ZERO DECORATIVE SLOP • PURE COMPONENT PARITY •</span>
              </div>
            </div>
            <section class="joy-hero">
              <div class="joy-hero__badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Modernist Grid // Zurich 1957
              </div>
              <h1 class="joy-hero__title">
                Pure typographic <span class="joy-hero__title-emphasis">structure and form</span>
              </h1>
              <p class="joy-hero__subtitle">
                Strict mathematical ratios, absolute semantic tokens, and uncompromising contrast across light and dark canvases.
              </p>
              <div class="joy-hero__ctas">
                <button type="button" class="joy-button joy-button--solid joy-button--lg"> <span class="joy-button__label">Inspect system</span>  </button> <button type="button" class="joy-button joy-button--outline joy-button--lg joy-hero__secondary-cta"> <span class="joy-button__label">Read manifesto</span>  </button>
              </div>
            </section>
            <div class="swiss-grid-footer">
              <span>GRID: 12-COL MODULAR</span>
              <span>SPEC: DIN 1451 / HELVETICA</span>
              <span>CONTRAST: 7:1 AAA</span>
            </div>
          </div>
          <div class="aura-hero-container hero-option-panel" id="aura-hero-container" style="display: none;">
            <div class="aura-hero__mesh-bg" aria-hidden="true">
              <div class="aura-orb aura-orb--1">
              </div>
              <div class="aura-orb aura-orb--2">
              </div>
              <div class="aura-orb aura-orb--3">
              </div>
            </div>
            <section class="joy-hero">
              <div class="joy-hero__badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Chromatic Ambient Mesh
              </div>
              <h1 class="joy-hero__title">
                Crafted with soul <span class="joy-hero__title-emphasis">and luminous precision</span>
              </h1>
              <p class="joy-hero__subtitle">
                Organic fluid gradient orbs designed to breathe life into modern product interfaces with smooth ambient physics.
              </p>
              <div class="joy-hero__ctas">
                <button type="button" class="joy-button joy-button--solid joy-button--lg"> <span class="joy-button__label">Explore tokens</span>  </button> <button type="button" class="joy-button joy-button--outline joy-button--lg joy-hero__secondary-cta"> <span class="joy-button__label">View showcase</span>  </button>
              </div>
            </section>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header">
            <h4>
              Feature grid (FeatureGrid)
            </h4>
          </div>
          <div class="landing-demo">
            <p class="landing-demo__note">
              The lead layout is the default: from 900px the first card spans two of three columns and the last card fills its row, so any number of cards leaves no empty cell. Below 900px it is one column.
            </p>
            <div class="landing-demo__stack">
              <div class="landing-demo__group">
                <h5 class="landing-demo__label">
                  3 cards, lead layout
                </h5>
                <div class="joy-feature-grid joy-feature-grid--cols-3 joy-feature-grid--lead" id="blocks-feature-lead-3">
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--brand joy-badge--sm"> Speed</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Cpu", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Fast order matching
                    </h3>
                    <p class="joy-feature-card__desc">
                      Orders route through a co-located gateway and reach the book in microseconds, with no pauses from garbage collection.
                    </p>
                    <a href="#charts" class="joy-feature-card__link">Explore charts</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--success joy-badge--sm"> WCAG 2.2 AA</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Shield", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Dark mode that holds up
                    </h3>
                    <p class="joy-feature-card__desc">
                      Every text and surface pair is checked for contrast in both themes, so no button turns white on white.
                    </p>
                    <a href="#tokens" class="joy-feature-card__link">Inspect tokens</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--warning joy-badge--sm"> Twin packages</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Layers", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Svelte 5 and React 19
                    </h3>
                    <p class="joy-feature-card__desc">
                      Both packages share one token set, the same class names and the same keyboard behaviour.
                    </p>
                    <a href="#overview" class="joy-feature-card__link">See the overview</a>
                  </div>
                </div>
              </div>
              <div class="landing-demo__group">
                <h5 class="landing-demo__label">
                  4 cards, lead layout
                </h5>
                <div class="joy-feature-grid joy-feature-grid--cols-3 joy-feature-grid--lead" id="blocks-feature-lead-4">
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--brand joy-badge--sm"> Speed</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Cpu", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Fast order matching
                    </h3>
                    <p class="joy-feature-card__desc">
                      Orders route through a co-located gateway and reach the book in microseconds, with no pauses from garbage collection.
                    </p>
                    <a href="#charts" class="joy-feature-card__link">Explore charts</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--success joy-badge--sm"> WCAG 2.2 AA</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Shield", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Dark mode that holds up
                    </h3>
                    <p class="joy-feature-card__desc">
                      Every text and surface pair is checked for contrast in both themes, so no button turns white on white.
                    </p>
                    <a href="#tokens" class="joy-feature-card__link">Inspect tokens</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--warning joy-badge--sm"> Twin packages</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Layers", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Svelte 5 and React 19
                    </h3>
                    <p class="joy-feature-card__desc">
                      Both packages share one token set, the same class names and the same keyboard behaviour.
                    </p>
                    <a href="#overview" class="joy-feature-card__link">See the overview</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--neutral joy-badge--sm"> Data</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Database", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Dense financial tables
                    </h3>
                    <p class="joy-feature-card__desc">
                      Sticky headers, aligned numbers and a stacked layout for phones keep long ledgers readable.
                    </p>
                    <a href="#financial-table" class="joy-feature-card__link">Open the ledger</a>
                  </div>
                </div>
              </div>
              <div class="landing-demo__group">
                <h5 class="landing-demo__label">
                  5 cards, lead layout
                </h5>
                <div class="joy-feature-grid joy-feature-grid--cols-3 joy-feature-grid--lead" id="blocks-feature-lead-5">
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--brand joy-badge--sm"> Speed</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Cpu", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Fast order matching
                    </h3>
                    <p class="joy-feature-card__desc">
                      Orders route through a co-located gateway and reach the book in microseconds, with no pauses from garbage collection.
                    </p>
                    <a href="#charts" class="joy-feature-card__link">Explore charts</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--success joy-badge--sm"> WCAG 2.2 AA</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Shield", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Dark mode that holds up
                    </h3>
                    <p class="joy-feature-card__desc">
                      Every text and surface pair is checked for contrast in both themes, so no button turns white on white.
                    </p>
                    <a href="#tokens" class="joy-feature-card__link">Inspect tokens</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--warning joy-badge--sm"> Twin packages</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Layers", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Svelte 5 and React 19
                    </h3>
                    <p class="joy-feature-card__desc">
                      Both packages share one token set, the same class names and the same keyboard behaviour.
                    </p>
                    <a href="#overview" class="joy-feature-card__link">See the overview</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--neutral joy-badge--sm"> Data</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Database", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Dense financial tables
                    </h3>
                    <p class="joy-feature-card__desc">
                      Sticky headers, aligned numbers and a stacked layout for phones keep long ledgers readable.
                    </p>
                    <a href="#financial-table" class="joy-feature-card__link">Open the ledger</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--brand joy-badge--sm"> Security</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("LockClose", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Safe by default
                    </h3>
                    <p class="joy-feature-card__desc">
                      Forms, dialogs and drawers trap focus, restore it on close and label every control for screen readers.
                    </p>
                    <a href="#modal" class="joy-feature-card__link">See dialogs</a>
                  </div>
                </div>
              </div>
              <div class="landing-demo__group">
                <h5 class="landing-demo__label">
                  6 cards, lead layout
                </h5>
                <div class="joy-feature-grid joy-feature-grid--cols-3 joy-feature-grid--lead" id="blocks-feature-lead-6">
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--brand joy-badge--sm"> Speed</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Cpu", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Fast order matching
                    </h3>
                    <p class="joy-feature-card__desc">
                      Orders route through a co-located gateway and reach the book in microseconds, with no pauses from garbage collection.
                    </p>
                    <a href="#charts" class="joy-feature-card__link">Explore charts</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--success joy-badge--sm"> WCAG 2.2 AA</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Shield", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Dark mode that holds up
                    </h3>
                    <p class="joy-feature-card__desc">
                      Every text and surface pair is checked for contrast in both themes, so no button turns white on white.
                    </p>
                    <a href="#tokens" class="joy-feature-card__link">Inspect tokens</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--warning joy-badge--sm"> Twin packages</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Layers", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Svelte 5 and React 19
                    </h3>
                    <p class="joy-feature-card__desc">
                      Both packages share one token set, the same class names and the same keyboard behaviour.
                    </p>
                    <a href="#overview" class="joy-feature-card__link">See the overview</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--neutral joy-badge--sm"> Data</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Database", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Dense financial tables
                    </h3>
                    <p class="joy-feature-card__desc">
                      Sticky headers, aligned numbers and a stacked layout for phones keep long ledgers readable.
                    </p>
                    <a href="#financial-table" class="joy-feature-card__link">Open the ledger</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--brand joy-badge--sm"> Security</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("LockClose", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Safe by default
                    </h3>
                    <p class="joy-feature-card__desc">
                      Forms, dialogs and drawers trap focus, restore it on close and label every control for screen readers.
                    </p>
                    <a href="#modal" class="joy-feature-card__link">See dialogs</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--success joy-badge--sm"> Charts</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("CandlestickChart", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Live charts at 60 FPS
                    </h3>
                    <p class="joy-feature-card__desc">
                      Canvas charts cull off-screen points and reuse buffers, so a busy tick stream stays smooth.
                    </p>
                    <a href="#charts" class="joy-feature-card__link">View charts</a>
                  </div>
                </div>
              </div>
              <div class="landing-demo__group">
                <h5 class="landing-demo__label">
                  Uniform layout, up to 3 columns
                </h5>
                <div class="joy-feature-grid joy-feature-grid--cols-3" id="blocks-feature-uniform">
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--brand joy-badge--sm"> Speed</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Cpu", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Fast order matching
                    </h3>
                    <p class="joy-feature-card__desc">
                      Orders route through a co-located gateway and reach the book in microseconds, with no pauses from garbage collection.
                    </p>
                    <a href="#charts" class="joy-feature-card__link">Explore charts</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--success joy-badge--sm"> WCAG 2.2 AA</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Shield", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Dark mode that holds up
                    </h3>
                    <p class="joy-feature-card__desc">
                      Every text and surface pair is checked for contrast in both themes, so no button turns white on white.
                    </p>
                    <a href="#tokens" class="joy-feature-card__link">Inspect tokens</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--warning joy-badge--sm"> Twin packages</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Layers", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Svelte 5 and React 19
                    </h3>
                    <p class="joy-feature-card__desc">
                      Both packages share one token set, the same class names and the same keyboard behaviour.
                    </p>
                    <a href="#overview" class="joy-feature-card__link">See the overview</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--neutral joy-badge--sm"> Data</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("Database", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Dense financial tables
                    </h3>
                    <p class="joy-feature-card__desc">
                      Sticky headers, aligned numbers and a stacked layout for phones keep long ledgers readable.
                    </p>
                    <a href="#financial-table" class="joy-feature-card__link">Open the ledger</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--brand joy-badge--sm"> Security</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("LockClose", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Safe by default
                    </h3>
                    <p class="joy-feature-card__desc">
                      Forms, dialogs and drawers trap focus, restore it on close and label every control for screen readers.
                    </p>
                    <a href="#modal" class="joy-feature-card__link">See dialogs</a>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__badge">
                      <span class="joy-badge joy-badge--success joy-badge--sm"> Charts</span>
                    </div>
                    <div class="joy-feature-card__icon">
                      ${simIcon("CandlestickChart", "22")}
                    </div>
                    <h3 class="joy-feature-card__title">
                      Live charts at 60 FPS
                    </h3>
                    <p class="joy-feature-card__desc">
                      Canvas charts cull off-screen points and reuse buffers, so a busy tick stream stays smooth.
                    </p>
                    <a href="#charts" class="joy-feature-card__link">View charts</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header">
            <h4>
              Bento grid (BentoGrid, BentoCard)
            </h4>
          </div>
          <div class="landing-demo">
            <p class="landing-demo__note">
              A 12-column grid. Under 900px every card is full width.
            </p>
            <div class="joy-bento-grid" id="blocks-bento-showcase">
              <div class="joy-bento-card joy-bento-card--col-6">
                <div>
                  <div class="joy-bento-card__badge">
                    Latency
                  </div>
                  <h4 class="joy-bento-card__title">
                    Fast order routing
                  </h4>
                  <p class="joy-bento-card__desc">
                    A co-located gateway keeps the path from click to book short and steady.
                  </p>
                </div>
                <div class="joy-bento-card__content">
                  <div class="landing-demo__chips">
                    <span class="joy-badge joy-badge--success joy-badge--sm"> 0.42 ms</span><span class="joy-badge joy-badge--brand joy-badge--sm"> DPDK</span>
                  </div>
                </div>
              </div>
              <div class="joy-bento-card joy-bento-card--col-6">
                <div>
                  <div class="joy-bento-card__badge">
                    Liquidity
                  </div>
                  <h4 class="joy-bento-card__title">
                    One view of every venue
                  </h4>
                  <p class="joy-bento-card__desc">
                    Quotes from 14 settlement layers merge into one book with automatic route splits.
                  </p>
                </div>
                <div class="joy-bento-card__content">
                  <div class="landing-demo__chips">
                    <span class="joy-badge joy-badge--brand joy-badge--sm"> 14 chains</span><span class="joy-badge joy-badge--neutral joy-badge--sm"> No slippage</span>
                  </div>
                </div>
              </div>
              <div class="joy-bento-card joy-bento-card--col-8">
                <div>
                  <div class="joy-bento-card__badge">
                    Analytics
                  </div>
                  <h4 class="joy-bento-card__title">
                    Risk and telemetry in real time
                  </h4>
                  <p class="joy-bento-card__desc">
                    Greeks, value at risk and distance to liquidation stream to the screen at 60 FPS.
                  </p>
                </div>
                <div class="joy-bento-card__content">
                  <div class="landing-demo__chips">
                    <span class="joy-badge joy-badge--warning joy-badge--sm"> VAR 99.9%</span><span class="joy-badge joy-badge--brand joy-badge--sm"> 60 FPS</span>
                  </div>
                </div>
              </div>
              <div class="joy-bento-card joy-bento-card--col-4">
                <div>
                  <div class="joy-bento-card__badge">
                    Security
                  </div>
                  <h4 class="joy-bento-card__title">
                    Split-key vaults
                  </h4>
                  <p class="joy-bento-card__desc">
                    Keys are shared across separate devices, so no single failure exposes funds.
                  </p>
                </div>
                <div class="joy-bento-card__content">
                  <div class="landing-demo__chips">
                    <span class="joy-badge joy-badge--success joy-badge--sm"> FIPS 140-3</span>
                  </div>
                </div>
              </div>
              <div class="joy-bento-card joy-bento-card--col-12">
                <div>
                  <div class="joy-bento-card__badge">
                    Audit
                  </div>
                  <h4 class="joy-bento-card__title">
                    Tamper-proof audit trail
                  </h4>
                  <p class="joy-bento-card__desc">
                    Every action lands in a write-once log with proofs you can check and export in seconds.
                  </p>
                </div>
                <div class="joy-bento-card__content">
                  <div class="landing-demo__chips">
                    <span class="joy-badge joy-badge--brand joy-badge--sm"> Write once</span><span class="joy-badge joy-badge--success joy-badge--sm"> SOC 2 Type II</span><span class="joy-badge joy-badge--neutral joy-badge--sm"> Live attestation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header">
            <h4>
              Bento spans 1 to 12
            </h4>
          </div>
          <div class="landing-demo">
            <p class="landing-demo__note">
              Every span in use. Tiles narrower than 3 columns are decorative only. The first grid uses the classes BentoCard emits, the second uses the documented aliases.
            </p>
            <div class="landing-demo__stack">
              <div class="landing-demo__group">
                <h5 class="landing-demo__label">
                  Spans from BentoCard colSpan
                </h5>
                <div class="joy-bento-grid" id="blocks-bento-cols">
                  <div class="joy-bento-card joy-bento-card--col-12">
                    <div>
                      <h4 class="joy-bento-card__title">
                        12 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-1" aria-hidden="true">
                    <div>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-11">
                    <div>
                      <h4 class="joy-bento-card__title">
                        11 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-2" aria-hidden="true">
                    <div>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-10">
                    <div>
                      <h4 class="joy-bento-card__title">
                        10 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-3">
                    <div>
                      <h4 class="joy-bento-card__title">
                        3 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-9">
                    <div>
                      <h4 class="joy-bento-card__title">
                        9 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-4">
                    <div>
                      <h4 class="joy-bento-card__title">
                        4 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-8">
                    <div>
                      <h4 class="joy-bento-card__title">
                        8 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-5">
                    <div>
                      <h4 class="joy-bento-card__title">
                        5 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-7">
                    <div>
                      <h4 class="joy-bento-card__title">
                        7 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-6">
                    <div>
                      <h4 class="joy-bento-card__title">
                        6 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-6">
                    <div>
                      <h4 class="joy-bento-card__title">
                        6 of 12
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
              <div class="landing-demo__group">
                <h5 class="landing-demo__label">
                  Spans from the col-span-N alias
                </h5>
                <div class="joy-bento-grid" id="blocks-bento-spans">
                  <div class="joy-bento-card joy-bento-card--col-span-12">
                    <div>
                      <h4 class="joy-bento-card__title">
                        12 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-span-1" aria-hidden="true">
                    <div>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-span-11">
                    <div>
                      <h4 class="joy-bento-card__title">
                        11 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-span-2" aria-hidden="true">
                    <div>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-span-10">
                    <div>
                      <h4 class="joy-bento-card__title">
                        10 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-span-3">
                    <div>
                      <h4 class="joy-bento-card__title">
                        3 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-span-9">
                    <div>
                      <h4 class="joy-bento-card__title">
                        9 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-span-4">
                    <div>
                      <h4 class="joy-bento-card__title">
                        4 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-span-8">
                    <div>
                      <h4 class="joy-bento-card__title">
                        8 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-span-5">
                    <div>
                      <h4 class="joy-bento-card__title">
                        5 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-span-7">
                    <div>
                      <h4 class="joy-bento-card__title">
                        7 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-span-6">
                    <div>
                      <h4 class="joy-bento-card__title">
                        6 of 12
                      </h4>
                    </div>
                  </div>
                  <div class="joy-bento-card joy-bento-card--col-span-6">
                    <div>
                      <h4 class="joy-bento-card__title">
                        6 of 12
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header">
            <h4>
              Pricing cards (PricingCard)
            </h4>
          </div>
          <div class="landing-demo">
            <p class="landing-demo__note">
              Three plans with the featured card marked, then the loading and disabled button states.
            </p>
            <div class="landing-demo__stack">
              <div class="landing-demo__group">
                <h5 class="landing-demo__label">
                  Default and featured
                </h5>
                <div class="joy-pricing-matrix" role="region" aria-label="Pricing plans">
                  <div class="joy-pricing-card">
                    <h3 class="joy-pricing-card__title">
                      Developer
                    </h3>
                    <p class="joy-pricing-card__desc">
                      Core tokens, icons and the base components.
                    </p>
                    <div class="joy-pricing-card__price">
                      <span>$0</span> <span class="joy-pricing-card__period">/month</span>
                    </div>
                    <ul class="joy-pricing-card__features">
                      <li class="joy-pricing-card__feature">
                        <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>138 vector icons</span>
                      </li>
                      <li class="joy-pricing-card__feature">
                        <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Svelte 5 and React 19 packages</span>
                      </li>
                      <li class="joy-pricing-card__feature">
                        <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Community chat support</span>
                      </li>
                    </ul>
                    <button type="button" class="joy-button joy-button--outline joy-button--md joy-button--block joy-pricing-card__cta"> <span class="joy-button__label">Start free</span>  </button>
                  </div>
                  <div class="joy-pricing-card joy-pricing-card--featured">
                    <div class="joy-pricing-card__badge">
                      Most popular
                    </div>
                    <h3 class="joy-pricing-card__title">
                      Professional
                    </h3>
                    <p class="joy-pricing-card__desc">
                      The full financial suite and every landing block.
                    </p>
                    <div class="joy-pricing-card__price">
                      <span>$149</span> <span class="joy-pricing-card__period">/month</span>
                    </div>
                    <ul class="joy-pricing-card__features">
                      <li class="joy-pricing-card__feature">
                        <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Everything in Developer</span>
                      </li>
                      <li class="joy-pricing-card__feature">
                        <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Dense financial tables</span>
                      </li>
                      <li class="joy-pricing-card__feature">
                        <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Landing block library</span>
                      </li>
                      <li class="joy-pricing-card__feature">
                        <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Priority support, 24/7</span>
                      </li>
                    </ul>
                    <button type="button" class="joy-button joy-button--solid joy-button--md joy-button--block joy-pricing-card__cta"> <span class="joy-button__label">Upgrade to Pro</span>  </button>
                  </div>
                  <div class="joy-pricing-card">
                    <h3 class="joy-pricing-card__title">
                      Team
                    </h3>
                    <p class="joy-pricing-card__desc">
                      Shared themes and seats for a whole desk.
                    </p>
                    <div class="joy-pricing-card__price">
                      <span>$899</span> <span class="joy-pricing-card__period">/month</span>
                    </div>
                    <ul class="joy-pricing-card__features">
                      <li class="joy-pricing-card__feature">
                        <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Unlimited seats</span>
                      </li>
                      <li class="joy-pricing-card__feature">
                        <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Custom theme export</span>
                      </li>
                      <li class="joy-pricing-card__feature">
                        <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Named account manager</span>
                      </li>
                    </ul>
                    <button type="button" class="joy-button joy-button--outline joy-button--md joy-button--block joy-pricing-card__cta"> <span class="joy-button__label">Contact sales</span>  </button>
                  </div>
                </div>
              </div>
              <div class="landing-demo__group">
                <h5 class="landing-demo__label">
                  Loading and disabled
                </h5>
                <div class="joy-pricing-matrix" role="region" aria-label="Pricing plan states">
                  <div class="joy-pricing-card joy-pricing-card--featured">
                    <h3 class="joy-pricing-card__title">
                      Loading
                    </h3>
                    <p class="joy-pricing-card__desc">
                      The button is busy and ignores clicks.
                    </p>
                    <div class="joy-pricing-card__price">
                      <span>$149</span> <span class="joy-pricing-card__period">/month</span>
                    </div>
                    <ul class="joy-pricing-card__features">
                      <li class="joy-pricing-card__feature">
                        <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Spinner in the button</span>
                      </li>
                      <li class="joy-pricing-card__feature">
                        <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>aria-busy is set</span>
                      </li>
                    </ul>
                    <button type="button" class="joy-button joy-button--solid joy-button--md joy-button--loading joy-button--block joy-pricing-card__cta" disabled="" aria-busy="true"> <span class="joy-button__label">Upgrade to Pro</span>  <span class="joy-button__spinner" aria-hidden="true"><svg class="joy-button__spinner-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg></span></button>
                  </div>
                  <div class="joy-pricing-card">
                    <h3 class="joy-pricing-card__title">
                      Disabled
                    </h3>
                    <p class="joy-pricing-card__desc">
                      The plan cannot be picked right now.
                    </p>
                    <div class="joy-pricing-card__price">
                      <span>$0</span> <span class="joy-pricing-card__period">/month</span>
                    </div>
                    <ul class="joy-pricing-card__features">
                      <li class="joy-pricing-card__feature">
                        <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Button is dimmed</span>
                      </li>
                      <li class="joy-pricing-card__feature">
                        <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Skipped by the keyboard</span>
                      </li>
                    </ul>
                    <button type="button" class="joy-button joy-button--outline joy-button--md joy-button--block joy-pricing-card__cta" disabled=""> <span class="joy-button__label">Start free</span>  </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header">
            <h4>
              Plan comparison table
            </h4>
          </div>
          <div class="landing-demo">
            <p class="landing-demo__note">
              A real table in a scroll region. The first column stays pinned when the table scrolls sideways.
            </p>
            <div class="joy-pricing-matrix joy-pricing-matrix--table" id="blocks-matrix">
              <div class="joy-pricing-matrix__scroll" role="region" tabindex="0" aria-label="Compare plans">
                <table class="joy-table joy-table--scroll joy-pricing-matrix__table">
                  <thead>
                    <tr>
                      <th scope="col">
                        Feature
                      </th>
                      <th scope="col">
                        Developer
                      </th>
                      <th scope="col">
                        Professional
                      </th>
                      <th scope="col">
                        Team
                      </th>
                      <th scope="col">
                        Enterprise
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">
                        Vector icons
                      </th>
                      <td>
                        138
                      </td>
                      <td>
                        138
                      </td>
                      <td>
                        138
                      </td>
                      <td>
                        138
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        Financial tables
                      </th>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"></circle></svg></span>
                      </td>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                      </td>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                      </td>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        Landing block library
                      </th>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"></circle></svg></span>
                      </td>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                      </td>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                      </td>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        Custom theme export
                      </th>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"></circle></svg></span>
                      </td>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"></circle></svg></span>
                      </td>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                      </td>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        Seats included
                      </th>
                      <td>
                        1
                      </td>
                      <td>
                        5
                      </td>
                      <td>
                        Unlimited
                      </td>
                      <td>
                        Unlimited
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        Priority support
                      </th>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"></circle></svg></span>
                      </td>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                      </td>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                      </td>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">
                        Dedicated manager
                      </th>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"></circle></svg></span>
                      </td>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"></circle></svg></span>
                      </td>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"></circle></svg></span>
                      </td>
                      <td>
                        <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header">
            <h4>
              Key metrics (StatsSection)
            </h4>
          </div>
          <div class="landing-demo">
            <p class="landing-demo__note">
              Up, down and neutral trends. The trend arrow is decoration and the change text carries the meaning.
            </p>
            <section class="joy-stats-section">
              <div class="joy-stats-grid">
                <div class="joy-stat-item">
                  <div class="joy-stat-item__value">
                    4.2 µs
                  </div>
                  <div class="joy-stat-item__label">
                    P99 order latency
                  </div>
                  <p class="joy-stat-item__desc">
                    Measured inside the colocation window
                  </p>
                  <div class="joy-stat-item__change joy-stat-item__change--positive">
                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> <span class="joy-stat-item__sr">Trend up:</span> <span class="joy-stat-item__change-text">14% faster</span>
                  </div>
                </div>
                <div class="joy-stat-item">
                  <div class="joy-stat-item__value">
                    99.999%
                  </div>
                  <div class="joy-stat-item__label">
                    Gateway uptime
                  </div>
                  <p class="joy-stat-item__desc">
                    Two-site failover
                  </p>
                  <div class="joy-stat-item__change joy-stat-item__change--positive">
                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> <span class="joy-stat-item__sr">Trend up:</span> <span class="joy-stat-item__change-text">No outages</span>
                  </div>
                </div>
                <div class="joy-stat-item">
                  <div class="joy-stat-item__value">
                    $48.2B
                  </div>
                  <div class="joy-stat-item__label">
                    Monthly volume
                  </div>
                  <p class="joy-stat-item__desc">
                    Routed across all venues
                  </p>
                  <div class="joy-stat-item__change joy-stat-item__change--negative">
                    <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg> <span class="joy-stat-item__sr">Trend down:</span> <span class="joy-stat-item__change-text">3% lower</span>
                  </div>
                </div>
                <div class="joy-stat-item">
                  <div class="joy-stat-item__value">
                    14 chains
                  </div>
                  <div class="joy-stat-item__label">
                    Settlement networks
                  </div>
                  <p class="joy-stat-item__desc">
                    Bridged through one API
                  </p>
                  <div class="joy-stat-item__change">
                    <span class="joy-stat-item__change-text">No change</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header">
            <h4>
              Testimonials
            </h4>
          </div>
          <div class="landing-demo">
            <p class="landing-demo__note">
              Five-star and four-star ratings.
            </p>
            <div class="landing-demo__columns">
              <div class="joy-testimonial-card">
                <div class="joy-testimonial-card__stars" role="img" aria-label="Rated 5 out of 5">
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
                <p class="joy-testimonial-card__quote">
                  "The switch from a generic kit was quick. Dense financial views and Svelte 5 runes cut our portal re-render cost by 40%."
                </p>
                <div class="joy-testimonial-card__author">
                  <div class="joy-avatar joy-avatar--circle joy-avatar--md">
                    <span class="joy-avatar__fallback" aria-hidden="true">AK</span>
                  </div>
                  <div class="joy-testimonial-card__author-info">
                    <h6>
                      Alex Kim
                    </h6>
                    <p>
                      Lead engineer, Quant Fund
                    </p>
                  </div>
                </div>
              </div>
              <div class="joy-testimonial-card">
                <div class="joy-testimonial-card__stars" role="img" aria-label="Rated 4 out of 5">
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
                <p class="joy-testimonial-card__quote">
                  "Dark mode just works. No stray white panels, and the icon set matches the rest of our product."
                </p>
                <div class="joy-testimonial-card__author">
                  <div class="joy-avatar joy-avatar--circle joy-avatar--md">
                    <span class="joy-avatar__fallback" aria-hidden="true">ML</span>
                  </div>
                  <div class="joy-testimonial-card__author-info">
                    <h6>
                      Maya Lin
                    </h6>
                    <p>
                      Design lead, JoyPortal
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header">
            <h4>
              FAQ accordion (FAQSection)
            </h4>
          </div>
          <div class="landing-demo">
            <p class="landing-demo__note">
              Each question is a button that reports whether its answer is open. The answer stays in the page and is hidden while closed.
            </p>
            <section class="joy-faq-section">
              <div class="joy-faq-section__header">
                <h2 class="joy-faq-section__title">
                  Questions we hear most
                </h2>
                <p class="joy-faq-section__subtitle">
                  Short answers about charts, themes and tables.
                </p>
              </div>
              <div class="joy-faq-list">
                <div class="joy-faq-item joy-faq-item--open">
                  <button type="button" id="blocks-faq-trigger-0" aria-expanded="true" aria-controls="blocks-faq-answer-0" class="joy-faq-item__trigger" onclick="toggleFaq(this)"><span class="joy-faq-item__label">How do charts stay at 60 FPS with 100k candles?</span> <span class="joy-faq-item__icon" aria-hidden="true"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="6 9 12 15 18 9"></polyline></svg></span></button>
                  <div id="blocks-faq-answer-0" role="region" aria-labelledby="blocks-faq-trigger-0" class="joy-faq-item__content">
                    Two stacked canvases split static and live drawing, points outside the view are skipped, and ring buffers avoid garbage collection pauses.
                  </div>
                </div>
                <div class="joy-faq-item">
                  <button type="button" id="blocks-faq-trigger-1" aria-expanded="false" aria-controls="blocks-faq-answer-1" class="joy-faq-item__trigger" onclick="toggleFaq(this)"><span class="joy-faq-item__label">Can we switch themes without a re-render?</span> <span class="joy-faq-item__icon" aria-hidden="true"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="6 9 12 15 18 9"></polyline></svg></span></button>
                  <div id="blocks-faq-answer-1" role="region" aria-labelledby="blocks-faq-trigger-1" class="joy-faq-item__content" hidden="">
                    Yes. Colour comes from CSS custom properties, so changing the theme attribute restyles the page at once with no layout shift.
                  </div>
                </div>
                <div class="joy-faq-item">
                  <button type="button" id="blocks-faq-trigger-2" aria-expanded="false" aria-controls="blocks-faq-answer-2" class="joy-faq-item__trigger" onclick="toggleFaq(this)"><span class="joy-faq-item__label">How do tables behave on a phone?</span> <span class="joy-faq-item__icon" aria-hidden="true"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="6 9 12 15 18 9"></polyline></svg></span></button>
                  <div id="blocks-faq-answer-2" role="region" aria-labelledby="blocks-faq-trigger-2" class="joy-faq-item__content" hidden="">
                    With the stacked layout on, each row becomes a small card under 768px and every value keeps its column label.
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header">
            <h4>
              Partner cloud (LogoCloud)
            </h4>
          </div>
          <div class="landing-demo">
            <p class="landing-demo__note">
              Static logos and one linked logo (the last one).
            </p>
            <section class="joy-logo-cloud" aria-labelledby="joy-logo-cloud-title-blocks-logos">
              <p class="joy-logo-cloud__title" id="joy-logo-cloud-title-blocks-logos">
                Trusted by trading desks and liquidity providers
              </p>
              <div class="joy-logo-cloud__logos">
                <div class="joy-logo-cloud__item" title="Quantum" role="img" aria-label="Quantum">
                  <svg width="120" height="32" viewBox="0 0 120 32" fill="none" aria-hidden="true" focusable="false"><rect x="2" y="6" width="20" height="20" rx="4" stroke="currentColor" stroke-width="2"/><path d="M12 10v12M6 16h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">QUANTUM</text></svg>
                </div>
                <div class="joy-logo-cloud__item" title="Citadel" role="img" aria-label="Citadel">
                  <svg width="110" height="32" viewBox="0 0 110 32" fill="none" aria-hidden="true" focusable="false"><polygon points="12,6 22,26 2,26" stroke="currentColor" stroke-width="2"/><text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">CITADEL</text></svg>
                </div>
                <div class="joy-logo-cloud__item" title="Nexus Capital" role="img" aria-label="Nexus Capital">
                  <svg width="120" height="32" viewBox="0 0 120 32" fill="none" aria-hidden="true" focusable="false"><circle cx="12" cy="16" r="10" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="16" r="4" fill="currentColor"/><text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">NEXUS CAP</text></svg>
                </div>
                <div class="joy-logo-cloud__item" title="Flow Desk" role="img" aria-label="Flow Desk">
                  <svg width="115" height="32" viewBox="0 0 115 32" fill="none" aria-hidden="true" focusable="false"><rect x="4" y="6" width="16" height="20" rx="3" stroke="currentColor" stroke-width="2"/><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">FLOW DESK</text></svg>
                </div>
                <a href="https://github.com/montionugera/joy-design" class="joy-logo-cloud__item" title="Apex Alpha" aria-label="Apex Alpha (opens in a new tab)" target="_blank" rel="noreferrer noopener"><svg width="125" height="32" viewBox="0 0 125 32" fill="none" aria-hidden="true" focusable="false"><path d="M4 22L12 8L20 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">APEX ALPHA</text></svg></a>
              </div>
            </section>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header">
            <h4>
              Call to action (CTASection)
            </h4>
          </div>
          <div class="landing-demo">
            <p class="landing-demo__note">
              Default band, then the loading and disabled button states on the inverse surface.
            </p>
            <div class="landing-demo__stack">
              <div class="landing-demo__group">
                <h5 class="landing-demo__label">
                  Default
                </h5>
                <section class="joy-cta-section" aria-labelledby="joy-cta-title-blocks-cta-default">
                  <div class="joy-cta-section__container">
                    <h2 class="joy-cta-section__title" id="joy-cta-title-blocks-cta-default">
                      Ready to ship a clearer interface?
                    </h2>
                    <p class="joy-cta-section__desc">
                      Join the desks building on Joymify tokens and its low-latency chart suite.
                    </p>
                    <div class="joy-cta-section__actions">
                      <button type="button" class="joy-button joy-button--solid joy-button--lg"> <span class="joy-button__label">Deploy now</span>  </button> <button type="button" class="joy-button joy-button--outline joy-button--lg"> <span class="joy-button__label">Book a demo</span>  </button>
                    </div>
                  </div>
                </section>
              </div>
              <div class="landing-demo__group">
                <h5 class="landing-demo__label">
                  Primary loading, secondary disabled
                </h5>
                <section class="joy-cta-section" aria-labelledby="joy-cta-title-blocks-cta-states">
                  <div class="joy-cta-section__container">
                    <h2 class="joy-cta-section__title" id="joy-cta-title-blocks-cta-states">
                      Busy and unavailable states
                    </h2>
                    <p class="joy-cta-section__desc">
                      The primary button spins while a request runs; the secondary button can be disabled on its own.
                    </p>
                    <div class="joy-cta-section__actions">
                      <button type="button" class="joy-button joy-button--solid joy-button--lg joy-button--loading" disabled="" aria-busy="true"> <span class="joy-button__label">Deploying</span>  <span class="joy-button__spinner" aria-hidden="true"><svg class="joy-button__spinner-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg></span></button> <button type="button" class="joy-button joy-button--outline joy-button--lg" disabled=""> <span class="joy-button__label">Book a demo</span>  </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header">
            <h4>
              Footer (SiteFooter)
            </h4>
          </div>
          <div class="landing-demo landing-demo--flush">
            <footer class="joy-site-footer">
              <div class="joy-site-footer__inner">
                <div class="joy-site-footer__brand">
                  <div class="joy-site-footer__brand-title">
                    <span>Joymify Design</span>
                  </div>
                  <p class="joy-site-footer__brand-desc">
                    A design system for building clear, fast financial apps.
                  </p>
                </div>
                <div class="joy-site-footer__column">
                  <h4 class="joy-site-footer__col-title">
                    Explore
                  </h4>
                  <ul class="joy-site-footer__links">
                    <li>
                      <a href="#charts" class="joy-site-footer__link">Financial charts</a>
                    </li>
                    <li>
                      <a href="#table" class="joy-site-footer__link">Adaptive tables</a>
                    </li>
                    <li>
                      <a href="#landing-blocks" class="joy-site-footer__link">Landing blocks</a>
                    </li>
                    <li>
                      <a href="#tokens" class="joy-site-footer__link">Design tokens</a>
                    </li>
                  </ul>
                </div>
                <div class="joy-site-footer__column">
                  <h4 class="joy-site-footer__col-title">
                    Frameworks
                  </h4>
                  <ul class="joy-site-footer__links">
                    <li>
                      <a href="#" class="joy-site-footer__link">React 19 hooks</a>
                    </li>
                    <li>
                      <a href="#" class="joy-site-footer__link">Svelte 5 runes</a>
                    </li>
                    <li>
                      <a href="#tokens" class="joy-site-footer__link">Token theming</a>
                    </li>
                  </ul>
                </div>
                <div class="joy-site-footer__column">
                  <h4 class="joy-site-footer__col-title">
                    Trust
                  </h4>
                  <ul class="joy-site-footer__links">
                    <li>
                      <a href="#" class="joy-site-footer__link">WCAG 2.2 AA</a>
                    </li>
                    <li>
                      <a href="#" class="joy-site-footer__link">Audit logs</a>
                    </li>
                    <li>
                      <a href="#" class="joy-site-footer__link">SOC 2 Type II</a>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="joy-site-footer__bottom">
                <div>
                  © 2026 Joymify Inc. All rights reserved.
                </div>
                <div class="joy-site-footer__socials">
                  <a href="https://github.com/montionugera/joy-design" class="joy-site-footer__social-link" title="GitHub" aria-label="GitHub (opens in a new tab)" target="_blank" rel="noopener noreferrer"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg></a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </section>
      <!-- landing-blocks:generated:end -->

      <!-- View: Full page simulator -->
      <section id="view-landing-preview" class="view-panel">
        <h2 class="landing-demo-title">Full page simulator</h2>
        <p class="header-tagline">The LandingPage component output, generated from the real components, with a features heading and a pricing section that the simulator adds around it (LandingPage does not render those two yet). Switch the frame width, then narrow the browser window to see the mobile menu open as a drawer.</p>

        <!-- Top Simulator Controls Toolbar -->
        <div class="simulator-toolbar">
          <!-- Viewport Controller -->
          <div class="simulator-group">
            <span class="simulator-label" id="simulator-viewport-label">Frame width</span>
            <div class="segmented-control segmented-control--frames" id="simulator-viewport-ctrl" role="group" aria-labelledby="simulator-viewport-label">
              <button type="button" class="segment-btn active" onclick="switchSimulatorViewport('100%', this)">
                <svg class="simulator-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                Desktop
              </button>
              <button type="button" class="segment-btn" onclick="switchSimulatorViewport('768px', this)">
                <svg class="simulator-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                Tablet <span class="segment-btn__size">768px</span>
              </button>
              <button type="button" class="segment-btn" onclick="switchSimulatorViewport('375px', this)">
                <svg class="simulator-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                Mobile <span class="segment-btn__size">375px</span>
              </button>
            </div>
          </div>
          <p class="simulator-note">The frame emulates responsive mobile and tablet layouts. You can also resize the browser window directly.</p>
        </div>

        <!-- Simulator Status Bar -->
        <div class="simulator-status-bar">
          <div>
            Active frame: <strong id="simulator-viewport-info">Full width</strong>
          </div>
          <div>LandingPage output plus a features heading and pricing</div>
        </div>

        <!-- Live Page Simulator Wrapper Frame -->
        <div class="simulator-wrapper">
          <div class="simulator-frame" id="simulator-viewport-frame" style="max-width: 100%;">
            <!-- Simulated Combined Landing Page: mirrors the markup the LandingPage components render (packages/svelte/src/lib/LandingPage.svelte). -->
            <div id="simulator-page-container" class="joy-landing-page" data-palette="joymify">
              <!-- landing-header:start -->
              <a class="joy-landing-skip" href="#sim-main">Skip to main content</a>

              <header class="joy-landing-header">
                <div class="joy-landing-header__brand">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  <span>Joymify Design</span>
                </div>
                <nav class="joy-landing-header__nav" aria-label="Primary">
                  <a class="joy-landing-header__link" href="#sim-features">Features</a>
                  <a class="joy-landing-header__link" href="#sim-pricing">Pricing</a>
                  <a class="joy-landing-header__link" href="#sim-telemetry">Telemetry</a>
                  <a class="joy-landing-header__link" href="#sim-faq">FAQ</a>
                  <button type="button" class="joy-button joy-button--solid joy-button--sm">Launch Terminal</button>
                </nav>
                <button type="button" class="joy-button joy-button--ghost joy-button--icon-only joy-landing-header__menu" aria-label="Open menu" aria-expanded="false" aria-controls="sim-menu" onclick="openLandingDrawer(this)">
                  ${simIcon("Menu", "1.25rem")}
                </button>
              </header>

              <!-- Below 768px the inline nav is hidden; the same links live in this drawer (a bottom sheet at 480px and below). -->
              <div id="landing-drawer-container" data-hub-dialog style="display: none;">
                <div class="joy-drawer-backdrop" role="presentation" onclick="closeLandingDrawer(event)">
                  <div class="joy-drawer" id="sim-menu" role="dialog" aria-modal="true" aria-labelledby="sim-menu-title">
                    <div class="joy-drawer__header">
                      <h3 class="joy-drawer__title" id="sim-menu-title">Menu</h3>
                      <button type="button" class="joy-drawer__close" aria-label="Close drawer" onclick="closeLandingDrawer()">${simIcon("Close", "1.25rem")}</button>
                    </div>
                    <div class="joy-drawer__body">
                      <nav class="joy-landing-drawer__nav" aria-label="Mobile">
                        <a class="joy-landing-drawer__link" href="#sim-features">Features</a>
                        <a class="joy-landing-drawer__link" href="#sim-pricing">Pricing</a>
                        <a class="joy-landing-drawer__link" href="#sim-telemetry">Telemetry</a>
                        <a class="joy-landing-drawer__link" href="#sim-faq">FAQ</a>
                      </nav>
                    </div>
                    <div class="joy-drawer__footer">
                      <button type="button" class="joy-button joy-button--solid joy-button--lg joy-button--block" onclick="closeLandingDrawer()">Launch Terminal</button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- landing-header:end -->

              <main id="sim-main" tabindex="-1">
                <!-- landing-simulator:generated:start -->
                <!-- Generated by apps/storybook-hub/scripts/gen-landing-blocks.mjs from the real LandingPage render (default copy), plus a features heading and a pricing section that only the hub adds. Do not edit by hand. -->
                <section class="joy-hero">
                  <div class="joy-hero__badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Sub-5μs execution engine
                  </div>
                  <h1 class="joy-hero__title">
                    Live market data and <span class="joy-hero__title-emphasis">fast trading screens</span>
                  </h1>
                  <p class="joy-hero__subtitle">
                    Built for trading desks and portals that need every chart, table and price to render in under 5 ms.
                  </p>
                  <div class="joy-hero__ctas">
                    <button type="button" class="joy-button joy-button--solid joy-button--lg"> <span class="joy-button__label">Deploy a node</span>  </button> <button type="button" class="joy-button joy-button--outline joy-button--lg joy-hero__secondary-cta"> <span class="joy-button__label">Read the whitepaper</span>  </button>
                  </div>
                </section>
                <section class="joy-logo-cloud" aria-labelledby="joy-logo-cloud-title-sim3">
                  <p class="joy-logo-cloud__title" id="joy-logo-cloud-title-sim3">
                    Trusted by trading desks and liquidity providers
                  </p>
                  <div class="joy-logo-cloud__logos">
                    <div class="joy-logo-cloud__item" title="Quantum Capital" role="img" aria-label="Quantum Capital">
                      <svg width="120" height="32" viewBox="0 0 120 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="4" stroke="currentColor" stroke-width="2"/><path d="M12 10v12M6 16h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">QUANTUM</text></svg>
                    </div>
                    <div class="joy-logo-cloud__item" title="Citadel Trading" role="img" aria-label="Citadel Trading">
                      <svg width="110" height="32" viewBox="0 0 110 32" fill="none"><polygon points="12,6 22,26 2,26" stroke="currentColor" stroke-width="2"/><text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">CITADEL</text></svg>
                    </div>
                    <div class="joy-logo-cloud__item" title="Nexus Alpha" role="img" aria-label="Nexus Alpha">
                      <svg width="120" height="32" viewBox="0 0 120 32" fill="none"><circle cx="12" cy="16" r="10" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="16" r="4" fill="currentColor"/><text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">NEXUS CAP</text></svg>
                    </div>
                    <div class="joy-logo-cloud__item" title="Flow Desk" role="img" aria-label="Flow Desk">
                      <svg width="115" height="32" viewBox="0 0 115 32" fill="none"><rect x="4" y="6" width="16" height="20" rx="3" stroke="currentColor" stroke-width="2"/><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="28" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">FLOW DESK</text></svg>
                    </div>
                  </div>
                </section>
                <div id="sim-telemetry">
                  <section class="joy-stats-section">
                    <div class="joy-stats-grid">
                      <div class="joy-stat-item">
                        <div class="joy-stat-item__value">
                          4.2 μs
                        </div>
                        <div class="joy-stat-item__label">
                          P99 Order Latency
                        </div>
                        <p class="joy-stat-item__desc">
                          Kernel bypass colocation
                        </p>
                        <div class="joy-stat-item__change joy-stat-item__change--positive">
                          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> <span class="joy-stat-item__sr">Trend up:</span> <span class="joy-stat-item__change-text">14% faster vs L1</span>
                        </div>
                      </div>
                      <div class="joy-stat-item">
                        <div class="joy-stat-item__value">
                          99.999%
                        </div>
                        <div class="joy-stat-item__label">
                          Historical Uptime
                        </div>
                        <p class="joy-stat-item__desc">
                          Two live sites, instant failover
                        </p>
                        <div class="joy-stat-item__change joy-stat-item__change--positive">
                          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> <span class="joy-stat-item__sr">Trend up:</span> <span class="joy-stat-item__change-text">Zero downtime</span>
                        </div>
                      </div>
                      <div class="joy-stat-item">
                        <div class="joy-stat-item__value">
                          $48.2B
                        </div>
                        <div class="joy-stat-item__label">
                          Monthly Volume
                        </div>
                        <p class="joy-stat-item__desc">
                          Settled across 14 networks
                        </p>
                        <div class="joy-stat-item__change joy-stat-item__change--positive">
                          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> <span class="joy-stat-item__sr">Trend up:</span> <span class="joy-stat-item__change-text">+32% MoM</span>
                        </div>
                      </div>
                      <div class="joy-stat-item">
                        <div class="joy-stat-item__value">
                          14 Chains
                        </div>
                        <div class="joy-stat-item__label">
                          Settlement Chains
                        </div>
                        <p class="joy-stat-item__desc">
                          Instant cross-L2 finality
                        </p>
                        <div class="joy-stat-item__change joy-stat-item__change--positive">
                          <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> <span class="joy-stat-item__sr">Trend up:</span> <span class="joy-stat-item__change-text">EVM &amp; SVM</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
                <div id="sim-features" class="joy-landing-page__features">
                  <div class="joy-landing-page__section-header">
                    <h2 class="joy-landing-page__section-title">
                      Built for busy trading desks
                    </h2>
                    <p class="joy-landing-page__section-subtitle">
                      Fast screens, clear tables and themes that stay readable in light and dark.
                    </p>
                  </div>
                  <div class="joy-feature-grid joy-feature-grid--cols-3 joy-feature-grid--lead">
                    <div class="joy-feature-card">
                      <div class="joy-feature-card__badge">
                        <span class="joy-badge joy-badge--brand joy-badge--sm"> FPGA-Core</span>
                      </div>
                      <div class="joy-feature-card__icon">
                        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><rect x="4" y="4" width="16" height="16" rx="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                      </div>
                      <h3 class="joy-feature-card__title">
                        Fast order matching
                      </h3>
                      <p class="joy-feature-card__desc">
                        Co-located matching engines process up to 2.4M orders a second with steady, predictable timing.
                      </p>
                      <a href="#sim-features" class="joy-feature-card__link">See the engine</a>
                    </div>
                    <div class="joy-feature-card">
                      <div class="joy-feature-card__badge">
                        <span class="joy-badge joy-badge--success joy-badge--sm"> WCAG AA</span>
                      </div>
                      <div class="joy-feature-card__icon">
                        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                      </div>
                      <h3 class="joy-feature-card__title">
                        Tested light and dark themes
                      </h3>
                      <p class="joy-feature-card__desc">
                        Light and dark themes keep text at WCAG 2.2 AA contrast on every component.
                      </p>
                      <a href="#sim-features" class="joy-feature-card__link">Browse tokens</a>
                    </div>
                    <div class="joy-feature-card">
                      <div class="joy-feature-card__badge">
                        <span class="joy-badge joy-badge--warning joy-badge--sm"> Adaptive</span>
                      </div>
                      <div class="joy-feature-card__icon">
                        <svg width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                      </div>
                      <h3 class="joy-feature-card__title">
                        Tables that fit phones
                      </h3>
                      <p class="joy-feature-card__desc">
                        Wide market tables turn into clear stacked cards on small screens.
                      </p>
                      <a href="#sim-features" class="joy-feature-card__link">Try the demo</a>
                    </div>
                  </div>
                </div>
                <div id="sim-pricing" class="joy-landing-page__pricing">
                  <div class="joy-landing-page__section-header">
                    <h2 class="joy-landing-page__section-title">
                      Simple plans for every desk
                    </h2>
                    <p class="joy-landing-page__section-subtitle">
                      Start free, then add seats and tools as your team grows.
                    </p>
                  </div>
                  <div class="joy-pricing-matrix" role="region" aria-label="Pricing plans">
                    <div class="joy-pricing-card">
                      <h3 class="joy-pricing-card__title">
                        Developer
                      </h3>
                      <p class="joy-pricing-card__desc">
                        Core tokens, icons and the base components.
                      </p>
                      <div class="joy-pricing-card__price">
                        <span>$0</span> <span class="joy-pricing-card__period">/month</span>
                      </div>
                      <ul class="joy-pricing-card__features">
                        <li class="joy-pricing-card__feature">
                          <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>138 vector icons</span>
                        </li>
                        <li class="joy-pricing-card__feature">
                          <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Svelte 5 and React 19 packages</span>
                        </li>
                        <li class="joy-pricing-card__feature">
                          <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Community chat support</span>
                        </li>
                      </ul>
                      <button type="button" class="joy-button joy-button--outline joy-button--md joy-button--block joy-pricing-card__cta"> <span class="joy-button__label">Start free</span>  </button>
                    </div>
                    <div class="joy-pricing-card joy-pricing-card--featured">
                      <div class="joy-pricing-card__badge">
                        Most popular
                      </div>
                      <h3 class="joy-pricing-card__title">
                        Professional
                      </h3>
                      <p class="joy-pricing-card__desc">
                        The full financial suite and every landing block.
                      </p>
                      <div class="joy-pricing-card__price">
                        <span>$149</span> <span class="joy-pricing-card__period">/month</span>
                      </div>
                      <ul class="joy-pricing-card__features">
                        <li class="joy-pricing-card__feature">
                          <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Everything in Developer</span>
                        </li>
                        <li class="joy-pricing-card__feature">
                          <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Dense financial tables</span>
                        </li>
                        <li class="joy-pricing-card__feature">
                          <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Landing block library</span>
                        </li>
                        <li class="joy-pricing-card__feature">
                          <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Priority support, 24/7</span>
                        </li>
                      </ul>
                      <button type="button" class="joy-button joy-button--solid joy-button--md joy-button--block joy-pricing-card__cta"> <span class="joy-button__label">Upgrade to Pro</span>  </button>
                    </div>
                    <div class="joy-pricing-card">
                      <h3 class="joy-pricing-card__title">
                        Team
                      </h3>
                      <p class="joy-pricing-card__desc">
                        Shared themes and seats for a whole desk.
                      </p>
                      <div class="joy-pricing-card__price">
                        <span>$899</span> <span class="joy-pricing-card__period">/month</span>
                      </div>
                      <ul class="joy-pricing-card__features">
                        <li class="joy-pricing-card__feature">
                          <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Unlimited seats</span>
                        </li>
                        <li class="joy-pricing-card__feature">
                          <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Custom theme export</span>
                        </li>
                        <li class="joy-pricing-card__feature">
                          <span class="joy-pricing-card__check"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span> <span>Named account manager</span>
                        </li>
                      </ul>
                      <button type="button" class="joy-button joy-button--outline joy-button--md joy-button--block joy-pricing-card__cta"> <span class="joy-button__label">Contact sales</span>  </button>
                    </div>
                  </div>
                  <div class="joy-pricing-matrix joy-pricing-matrix--table" id="sim-matrix">
                    <div class="joy-pricing-matrix__scroll" role="region" tabindex="0" aria-label="Compare plans">
                      <table class="joy-table joy-table--scroll joy-pricing-matrix__table">
                        <thead>
                          <tr>
                            <th scope="col">
                              Feature
                            </th>
                            <th scope="col">
                              Developer
                            </th>
                            <th scope="col">
                              Professional
                            </th>
                            <th scope="col">
                              Team
                            </th>
                            <th scope="col">
                              Enterprise
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th scope="row">
                              Vector icons
                            </th>
                            <td>
                              138
                            </td>
                            <td>
                              138
                            </td>
                            <td>
                              138
                            </td>
                            <td>
                              138
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">
                              Financial tables
                            </th>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"></circle></svg></span>
                            </td>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                            </td>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                            </td>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">
                              Landing block library
                            </th>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"></circle></svg></span>
                            </td>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                            </td>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                            </td>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">
                              Custom theme export
                            </th>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"></circle></svg></span>
                            </td>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"></circle></svg></span>
                            </td>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                            </td>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">
                              Seats included
                            </th>
                            <td>
                              1
                            </td>
                            <td>
                              5
                            </td>
                            <td>
                              Unlimited
                            </td>
                            <td>
                              Unlimited
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">
                              Priority support
                            </th>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"></circle></svg></span>
                            </td>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                            </td>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                            </td>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                            </td>
                          </tr>
                          <tr>
                            <th scope="row">
                              Dedicated manager
                            </th>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"></circle></svg></span>
                            </td>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"></circle></svg></span>
                            </td>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--no" role="img" aria-label="Not included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M7 12H17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"></circle></svg></span>
                            </td>
                            <td>
                              <span class="joy-pricing-matrix__mark joy-pricing-matrix__mark--yes" role="img" aria-label="Included"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div id="sim-faq">
                  <section class="joy-faq-section">
                    <div class="joy-faq-section__header">
                      <h2 class="joy-faq-section__title">
                        Frequently asked questions
                      </h2>
                      <p class="joy-faq-section__subtitle">
                        Answers on architecture, speed and security.
                      </p>
                    </div>
                    <div class="joy-faq-list">
                      <div class="joy-faq-item joy-faq-item--open">
                        <button type="button" id="sim4-trigger-0" aria-expanded="true" aria-controls="sim4-answer-0" class="joy-faq-item__trigger" onclick="toggleFaq(this)"><span class="joy-faq-item__label">How do charts stay under 5 ms?</span> <span class="joy-faq-item__icon" aria-hidden="true"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="6 9 12 15 18 9"></polyline></svg></span></button>
                        <div id="sim4-answer-0" role="region" aria-labelledby="sim4-trigger-0" class="joy-faq-item__content">
                          Charts draw on two canvas layers, thin out dense data with a downsampling step and reuse preallocated buffers, so garbage collection never stalls a frame.
                        </div>
                      </div>
                      <div class="joy-faq-item">
                        <button type="button" id="sim4-trigger-1" aria-expanded="false" aria-controls="sim4-answer-1" class="joy-faq-item__trigger" onclick="toggleFaq(this)"><span class="joy-faq-item__label">Can the color theme change at runtime?</span> <span class="joy-faq-item__icon" aria-hidden="true"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="6 9 12 15 18 9"></polyline></svg></span></button>
                        <div id="sim4-answer-1" role="region" aria-labelledby="sim4-trigger-1" class="joy-faq-item__content" hidden="">
                          Yes. Every component reads shared CSS custom properties, so a new theme applies the moment the variables change.
                        </div>
                      </div>
                      <div class="joy-faq-item">
                        <button type="button" id="sim4-trigger-2" aria-expanded="false" aria-controls="sim4-answer-2" class="joy-faq-item__trigger" onclick="toggleFaq(this)"><span class="joy-faq-item__label">How do tables look on phones?</span> <span class="joy-faq-item__icon" aria-hidden="true"><svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><polyline points="6 9 12 15 18 9"></polyline></svg></span></button>
                        <div id="sim4-answer-2" role="region" aria-labelledby="sim4-trigger-2" class="joy-faq-item__content" hidden="">
                          Below 768px each row becomes a stacked card and every value keeps its label, so nothing is cut off.
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
                <section class="joy-cta-section" aria-labelledby="joy-cta-title-sim5">
                  <div class="joy-cta-section__container">
                    <h2 class="joy-cta-section__title" id="joy-cta-title-sim5">
                      Build fast, exact trading interfaces
                    </h2>
                    <p class="joy-cta-section__desc">
                      Get low-latency screens, dense financial tables and verified WCAG 2.2 contrast in one design system.
                    </p>
                    <div class="joy-cta-section__actions">
                      <button type="button" class="joy-button joy-button--solid joy-button--lg"> <span class="joy-button__label">Deploy a node</span>  </button> <button type="button" class="joy-button joy-button--outline joy-button--lg"> <span class="joy-button__label">Contact sales</span>  </button>
                    </div>
                  </div>
                </section>
                <!-- landing-simulator:generated:end -->
              </main>

              <!-- landing-simulator-footer:generated:start -->
              <!-- Generated by apps/storybook-hub/scripts/gen-landing-blocks.mjs from the real LandingPage render: do not edit by hand. -->
              <footer class="joy-site-footer">
                <div class="joy-site-footer__inner">
                  <div class="joy-site-footer__brand">
                    <div class="joy-site-footer__brand-title">
                      <span>Joymify Design</span>
                    </div>
                    <p class="joy-site-footer__brand-desc">
                      Design tokens and UI parts for trading products.
                    </p>
                  </div>
                  <div class="joy-site-footer__column">
                    <h4 class="joy-site-footer__col-title">
                      Platform
                    </h4>
                    <ul class="joy-site-footer__links">
                      <li>
                        <a href="#sim-features" class="joy-site-footer__link">Financial Charts</a>
                      </li>
                      <li>
                        <a href="#sim-features" class="joy-site-footer__link">Adaptive Table</a>
                      </li>
                      <li>
                        <a href="#sim-features" class="joy-site-footer__link">Bento Grid</a>
                      </li>
                    </ul>
                  </div>
                  <div class="joy-site-footer__column">
                    <h4 class="joy-site-footer__col-title">
                      Resources
                    </h4>
                    <ul class="joy-site-footer__links">
                      <li>
                        <a href="#" class="joy-site-footer__link">Docs</a>
                      </li>
                      <li>
                        <a href="#" class="joy-site-footer__link">Design Tokens</a>
                      </li>
                      <li>
                        <a href="#" class="joy-site-footer__link">API Reference</a>
                      </li>
                    </ul>
                  </div>
                  <div class="joy-site-footer__column">
                    <h4 class="joy-site-footer__col-title">
                      Compliance
                    </h4>
                    <ul class="joy-site-footer__links">
                      <li>
                        <a href="#" class="joy-site-footer__link">WCAG 2.2 AA</a>
                      </li>
                      <li>
                        <a href="#" class="joy-site-footer__link">Zero Emoji Policy</a>
                      </li>
                      <li>
                        <a href="#" class="joy-site-footer__link">SOC 2 Type II</a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="joy-site-footer__bottom">
                  <div>
                    © 2026 Joymify Inc. All rights reserved.
                  </div>
                </div>
              </footer>
              <!-- landing-simulator-footer:generated:end -->
            </div>
          </div>
        </div>
      </section>

      <!-- View: Narrative Continuous Scroll (Apple Keynote) -->
      <section id="view-apple-landing" class="view-panel">
        <!-- Sticky Sub-Nav (Glassmorphic) -->
        <div class="apple-subnav">
          <div class="apple-subnav__inner">
            <div class="apple-subnav__title-group">
              <span class="apple-subnav__title">iPhone Duo</span>
              <span class="apple-subnav__badge">Pro Foldable</span>
            </div>
            <div class="apple-subnav__actions">
              <a href="#apple-scene-posture" class="apple-subnav__link" onclick="scrollToAppleScene('apple-scene-posture'); return false;">ดูข้อมูล</a>
              <button type="button" class="joy-button joy-button--solid joy-button--sm apple-subnav__buy" onclick="scrollToAppleScene('apple-scene-customizer')">ดูราคา</button>
            </div>
          </div>
        </div>

        <div class="apple-landing-body">
          <!-- Scene 1: The Monumental Intro & Keynote Silhouette Reveal -->
          <div class="apple-scene apple-scene--intro" id="apple-scene-intro">
            <span class="apple-eyebrow">ความอเนกประสงค์</span>
            <h1 class="apple-headline">iOS ที่พลิกโฉมมาใหม่<br>อะไรๆ ก็จัดท่าได้</h1>
            <p class="apple-tagline">ดีไซน์แบบพับได้ที่เบาที่สุด พร้อมบานพับไทเทเนียมเจเนอเรชันใหม่และจอแสดงผลคู่ Super Retina XDR</p>
            <div class="apple-intro__cta-group">
              <button type="button" class="joy-button joy-button--solid joy-button--lg" onclick="scrollToAppleScene('apple-scene-customizer')">สั่งซื้อล่วงหน้า</button>
              <button type="button" class="joy-button joy-button--outline joy-button--lg" onclick="showDemoToast('เปิดตัวภาพยนตร์แนะนำ iPhone Duo', 'info')">ชมภาพยนตร์เปิดตัว</button>
            </div>
            <div class="apple-intro__device-wrapper">
              <div class="keynote-device-frame" style="width: 480px; height: 260px; max-width: 90vw;">
                <div class="keynote-device-screen">
                  <div class="keynote-screen-glow"></div>
                  <div class="keynote-screen-content">
                    <span class="apple-eyebrow" style="margin-bottom: 4px;">Joymify Studio Pro</span>
                    <span style="font-size: var(--joy-font-size-2xl); font-weight: 800; color: var(--joy-text-primary);">A18 Pro Dual Silicon</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Scene 2: Interactive Posture & Fold Mechanics (Matches User Image 3) -->
          <div class="apple-scene apple-scene--posture" id="apple-scene-posture">
            <div class="apple-scene__grid">
              <!-- Left: Interactive controls & narrative callouts -->
              <div class="apple-posture__controls">
                <div class="apple-posture__callout-card">
                  <h3 class="apple-posture__card-title">ดีไซน์แบบพับได้ พบกับประสบการณ์การดูที่ยอดเยี่ยมในดีไซน์แบบพอดีกระเป๋า</h3>
                  <p class="apple-posture__card-desc">ลากที่ด้านล่างเพื่อเปิดและปิด</p>
                  <!-- Interactive Drag/Scrub Slider (< >) -->
                  <div class="apple-scrub-container">
                    <input type="range" class="apple-scrub-slider" id="apple-posture-slider" min="0" max="180" value="110" oninput="updateDevicePosture(this.value)">
                  </div>
                  <div class="apple-posture__status-row">
                    <span class="apple-posture__angle-label" id="apple-posture-angle-label">มุมพับ: 110°</span>
                    <span class="apple-posture__mode-badge" id="apple-posture-mode-badge">โหมดแนวนอน (Laptop)</span>
                  </div>
                </div>

                <!-- Posture Pills (Matches Image 3) -->
                <div class="apple-posture__pills-list">
                  <button type="button" class="apple-posture-pill active" id="pill-posture-horizontal" onclick="setDevicePosturePreset(110, 'horizontal', this)">
                    <span class="pill-plus">+</span> แนวนอน
                  </button>
                  <button type="button" class="apple-posture-pill" id="pill-posture-vertical" onclick="setDevicePosturePreset(90, 'vertical', this)">
                    <span class="pill-plus">+</span> แนวตั้ง
                  </button>
                  <button type="button" class="apple-posture-pill" id="pill-posture-folded" onclick="setDevicePosturePreset(0, 'folded', this)">
                    <span class="pill-plus">+</span> พับปิด
                  </button>
                  <button type="button" class="apple-posture-pill" id="pill-posture-flat" onclick="setDevicePosturePreset(180, 'flat', this)">
                    <span class="pill-plus">+</span> วางเปิด
                  </button>
                  <button type="button" class="apple-posture-pill" id="pill-posture-tent" onclick="setDevicePosturePreset(65, 'tent', this)">
                    <span class="pill-plus">+</span> กางตั้ง
                  </button>
                  <button type="button" class="apple-posture-pill" id="pill-posture-durability" onclick="runDurabilityCycle()">
                    <span class="pill-plus">+</span> ความทนทาน
                  </button>
                </div>
              </div>

              <!-- Right: 3D Folding Hardware Render (Real-time 3D CSS transform) -->
              <div class="apple-posture__stage">
                <div class="apple-fold-stage" id="apple-fold-stage">
                  <div class="apple-fold-device" id="apple-fold-device">
                    <div class="apple-fold-wing apple-fold-wing--left">
                      <div class="apple-fold-screen">
                        <div class="apple-fold-screen__content">
                          <div class="apple-fold-time">9:41</div>
                          <div class="apple-fold-date">Wednesday, April 1</div>
                        </div>
                      </div>
                    </div>
                    <div class="apple-fold-hinge" id="apple-fold-hinge"></div>
                    <div class="apple-fold-wing apple-fold-wing--right" id="apple-fold-wing-right">
                      <div class="apple-fold-screen">
                        <div class="apple-fold-screen__content" style="align-items: flex-end;">
                          <div class="apple-fold-widget">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Scene 3: Cinematic Ultra-Wide Display Immersion (Matches User Image 4) -->
          <div class="apple-scene apple-scene--cinema" id="apple-scene-cinema">
            <span class="apple-eyebrow">จอแสดงผลระดับสตูดิโอ</span>
            <h2 class="apple-headline">โรงภาพยนตร์ขนาดยักษ์<br>ที่พับเก็บได้ในมือคุณ</h2>
            <p class="apple-tagline">ขยายหน้าจอสู่ 8.2 นิ้ว เต็มตาไร้รอยต่อ รองรับ Dolby Vision HDR และระบบเสียงรอบทิศทางตามตำแหน่งศีรษะ</p>

            <div class="apple-cinema__screen-frame" id="apple-cinema-frame">
              <div class="apple-cinema__ambient-glow" id="apple-cinema-glow"></div>
              <div class="apple-cinema__bezel">
                <div class="apple-cinema__display-canvas" id="apple-cinema-canvas">
                  <div class="apple-cinema__art-bg">
                    <div class="apple-cinema__title-card">
                      <span class="apple-cinema__movie-title">S I L O</span>
                      <span class="apple-cinema__service-logo">Apple TV+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="apple-cinema__controls-bar">
              <div class="segmented-control">
                <button type="button" class="segment-btn active" onclick="switchCinemaAspect('21-9', this)">21:9 Widescreen</button>
                <button type="button" class="segment-btn" onclick="switchCinemaAspect('16-9', this)">16:9 Cinema</button>
                <button type="button" class="segment-btn" onclick="switchCinemaAspect('4-3', this)">4:3 Full Display</button>
              </div>
              <div style="display: flex; gap: 8px;">
                <span class="joy-badge joy-badge--brand joy-badge--sm">Spatial Audio</span>
                <span class="joy-badge joy-badge--warning joy-badge--sm">Peak 2,000 Nits</span>
                <span class="joy-badge joy-badge--success joy-badge--sm">120Hz ProMotion</span>
              </div>
            </div>
          </div>

          <!-- Scene 4: Bionic Silicon & Thermal Specs Bento -->
          <div class="apple-scene apple-scene--specs" id="apple-scene-specs">
            <span class="apple-eyebrow">สถาปัตยกรรมชิป</span>
            <h2 class="apple-headline">พลังประมวลผลที่ฉีกทุกกฎ</h2>
            <p class="apple-tagline">สถาปัตยกรรม A18 Pro พร้อม Neural Engine 16 คอร์และห้องระบายความร้อนไอน้ำแกรไฟต์</p>

            <div class="apple-specs-bento">
              <div class="apple-bento-tile apple-bento-tile--col-6">
                <span class="apple-eyebrow">3 นาโนเมตร เจเนอเรชันที่ 2</span>
                <h3 style="font-size: var(--joy-font-size-xl); font-weight: 700; margin: 0 0 12px 0;">GPU ระดับโปร 6 คอร์</h3>
                <p style="color: var(--joy-text-secondary); margin: 0 0 16px 0;">ฮาร์ดแวร์เร่งความเร็ว Ray Tracing ที่เร็วขึ้นสูงสุด 2 เท่า สำหรับเกมระดับคอนโซล</p>
                <div style="display: flex; gap: 8px;">
                  <span class="joy-badge joy-badge--success joy-badge--sm">+35% GPU Speed</span>
                  <span class="joy-badge joy-badge--brand joy-badge--sm">Hardware Ray Tracing</span>
                </div>
              </div>
              <div class="apple-bento-tile apple-bento-tile--col-6">
                <span class="apple-eyebrow">โครงสร้างอากาศยาน</span>
                <h3 style="font-size: var(--joy-font-size-xl); font-weight: 700; margin: 0 0 12px 0;">ไทเทเนียมเกรด 5 แกร่งพิเศษ</h3>
                <p style="color: var(--joy-text-secondary); margin: 0 0 16px 0;">การผสมผสานระหว่างไทเทเนียมและโครงอะลูมิเนียมรีไซเคิล 100% เชื่อมด้วยเทคโนโลยี Diffusion Bonding</p>
                <div style="display: flex; gap: 8px;">
                  <span class="joy-badge joy-badge--warning joy-badge--sm">Armor Hinge</span>
                  <span class="joy-badge joy-badge--neutral joy-badge--sm">IP68 Water Resistant</span>
                </div>
              </div>
              <div class="apple-bento-tile apple-bento-tile--col-12">
                <span class="apple-eyebrow">ประสิทธิภาพพลังงาน</span>
                <h3 style="font-size: var(--joy-font-size-xl); font-weight: 700; margin: 0 0 12px 0;">แบตเตอรี่ใช้งานได้ตลอดวัน นานขึ้น 4 ชั่วโมง</h3>
                <p style="color: var(--joy-text-secondary); margin: 0;">ระบบจัดการพลังงานขั้นสูงขับเคลื่อนหน้าจอคู่ได้อย่างมีประสิทธิภาพสูงสุด</p>
              </div>
            </div>
          </div>

          <!-- Scene 5: Studio Finish Customizer & Configuration Tray -->
          <div class="apple-scene apple-scene--customizer" id="apple-scene-customizer">
            <span class="apple-eyebrow">เลือกสีและปรับแต่ง</span>
            <h2 class="apple-headline">สร้าง iPhone Duo ในสไตล์ของคุณ</h2>
            <p class="apple-tagline">มีให้เลือก 4 สีไทเทเนียมธรรมชาติ พร้อมความจุสูงสุด 2TB</p>

            <div class="apple-customizer-tray">
              <div style="text-align: center; margin-bottom: 8px;">
                <span style="font-size: var(--joy-font-size-sm); color: var(--joy-text-secondary);">สีที่เลือก: </span>
                <strong id="apple-finish-name" style="color: var(--joy-text-primary);">Natural Titanium</strong>
              </div>
              <div class="apple-finish-swatches">
                <button type="button" class="apple-swatch-btn active" style="background: var(--joy-border-default);" onclick="setDeviceFinish('Natural Titanium', 'var(--joy-border-default)', this)" aria-label="Natural Titanium"></button>
                <button type="button" class="apple-swatch-btn" style="background: var(--joy-accent-default);" onclick="setDeviceFinish('Desert Titanium', 'var(--joy-accent-default)', this)" aria-label="Desert Titanium"></button>
                <button type="button" class="apple-swatch-btn" style="background: var(--joy-color-navy-800);" onclick="setDeviceFinish('Obsidian Navy', 'var(--joy-color-navy-800)', this)" aria-label="Obsidian Navy"></button>
                <button type="button" class="apple-swatch-btn" style="background: var(--joy-color-cream-100);" onclick="setDeviceFinish('Liquid Silver', 'var(--joy-color-cream-100)', this)" aria-label="Liquid Silver"></button>
              </div>

              <div style="text-align: center; margin-bottom: 12px; font-weight: 600; color: var(--joy-text-primary);">
                เลือกความจุ
              </div>
              <div class="apple-storage-grid">
                <button type="button" class="apple-storage-btn active" onclick="selectStorageTier('256GB', '43,900', this)">
                  <div>256GB</div>
                  <small style="opacity: 0.8;">฿43,900</small>
                </button>
                <button type="button" class="apple-storage-btn" onclick="selectStorageTier('512GB', '49,900', this)">
                  <div>512GB</div>
                  <small style="opacity: 0.8;">฿49,900</small>
                </button>
                <button type="button" class="apple-storage-btn" onclick="selectStorageTier('1TB', '57,900', this)">
                  <div>1TB</div>
                  <small style="opacity: 0.8;">฿57,900</small>
                </button>
                <button type="button" class="apple-storage-btn" onclick="selectStorageTier('2TB', '65,900', this)">
                  <div>2TB</div>
                  <small style="opacity: 0.8;">฿65,900</small>
                </button>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 24px; border-top: 1px solid var(--joy-border-subtle);">
                <div>
                  <span style="font-size: var(--joy-font-size-xs); color: var(--joy-text-muted); display: block;">ราคารวมเริ่มต้น</span>
                  <span id="apple-customizer-price" style="font-size: 1.8rem; font-weight: 800; color: var(--joy-text-primary);">฿43,900</span>
                </div>
                <button type="button" class="joy-button joy-button--solid joy-button--lg" onclick="showDemoToast('บันทึกการสั่งซื้อ iPhone Duo เข้าสู่ตะกร้าเรียบร้อย', 'success')">
                  สั่งซื้อเลย
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Glasses HUD (Optical AR) (F-056 / F-057) -->
      <section id="view-glasses-hud" class="view-panel">
        <div class="hud-hero-header">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span class="joy-badge joy-badge--success joy-badge--sm">P43 PHOSPHOR GREEN (530nm)</span>
            <span class="joy-badge joy-badge--brand joy-badge--sm">OPTICAL OST HUD</span>
            <span class="joy-badge joy-badge--neutral joy-badge--sm">WAVEGUIDE AR</span>
          </div>
          <h2 style="margin: 0 0 8px 0;">Smart Glasses Head-Up Display (Glasses HUD)</h2>
          <p class="header-tagline">Dual-panel monocular optical see-through interface with conversational speech streaming, single-color symbolic selection, and temple touchpad gesture control.</p>
          
          <div class="hud-ambient-switcher" style="margin-bottom: 12px;">
            <span class="hud-ambient-label">Optical Emitter Phosphor:</span>
            <div class="segmented-control" role="group" aria-label="Select optical phosphor emitter mode">
              <button type="button" class="segment-btn active" id="btn-phosphor-green" onclick="switchHudPhosphor('green', this)">P43 Phosphor Green (530nm Mono)</button>
              <button type="button" class="segment-btn" id="btn-phosphor-amber" onclick="switchHudPhosphor('amber', this)">P20 Amber Phosphor (585nm)</button>
              <button type="button" class="segment-btn" id="btn-phosphor-dual" onclick="switchHudPhosphor('dual', this)">Polychrome Dual-RGB</button>
            </div>
          </div>

          <div class="hud-ambient-switcher">
            <span class="hud-ambient-label">Ambient Optic Scene:</span>
            <div class="segmented-control" role="group" aria-label="Select ambient environment">
              <button type="button" class="segment-btn active" id="btn-scene-cyberpunk" onclick="switchHudAmbientScene('cyberpunk', this)">Cyberpunk Night</button>
              <button type="button" class="segment-btn" id="btn-scene-daylight" onclick="switchHudAmbientScene('daylight', this)">Daylight Walk</button>
              <button type="button" class="segment-btn" id="btn-scene-optical" onclick="switchHudAmbientScene('optical', this)">Optical Bench</button>
            </div>
          </div>
        </div>

        <!-- The Glasses HUD Eyebox Visor Viewport -->
        <div class="hud-visor-frame" id="hud-visor-frame" data-scene="cyberpunk" data-phosphor="green" tabindex="0" role="region" aria-label="Smart Glasses Head Up Display Simulator">
          <div class="hud-reticle-overlay" aria-hidden="true"></div>
          <div class="hud-reticle-corner hud-reticle-tl" aria-hidden="true"></div>
          <div class="hud-reticle-corner hud-reticle-tr" aria-hidden="true"></div>
          <div class="hud-reticle-corner hud-reticle-bl" aria-hidden="true"></div>
          <div class="hud-reticle-corner hud-reticle-br" aria-hidden="true"></div>

          <!-- Top Telemetry & Health Bar -->
          <div class="hud-telemetry-bar">
            <div class="hud-telemetry-brand">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              <span>JOYMIFY AR // GLASSES HUD v2.6</span>
            </div>
            <div class="hud-telemetry-metrics">
              <span>FOV: 25° MONO</span>
              <span>P43: 530nm</span>
              <span>LUM: 3,500 NITS</span>
              <span>BAT: 84%</span>
              <div style="display: flex; align-items: center; gap: 4px;">
                <span>MIC:</span>
                <div class="hud-live-meter" id="hud-audio-meter">
                  <div class="hud-meter-bar" style="animation-delay: 0.1s;"></div>
                  <div class="hud-meter-bar" style="animation-delay: 0.3s;"></div>
                  <div class="hud-meter-bar" style="animation-delay: 0.2s;"></div>
                  <div class="hud-meter-bar" style="animation-delay: 0.4s;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Dual-Panel Split Monocular Area (50% Left / 50% Right) -->
          <div class="hud-display-grid">
            <!-- Left Panel: Communication Mode & Conversation Stream -->
            <div class="hud-left-panel">
              <div class="hud-com-pill-row">
                <div class="hud-com-pill" id="hud-com-pill" data-state="talking">
                  <span class="hud-status-indicator" id="hud-status-dot"></span>
                  <span id="hud-mode-label">Voice</span>
                  <span style="opacity: 0.5;">/</span>
                  <span id="hud-state-label">▶ TALKING (AI Talking)</span>
                </div>
                <div style="display: flex; gap: 6px;">
                  <button type="button" class="joy-button joy-button--subtle joy-button--xs" onclick="simulateSpeechInput('Morning, show me the checklist')">Prompt: Checklist</button>
                  <button type="button" class="joy-button joy-button--subtle joy-button--xs" onclick="simulateSpeechInput('What is my next meeting?')">Prompt: Meeting</button>
                </div>
              </div>

              <!-- Conversation Transcript Box -->
              <div class="hud-transcript-box" id="hud-transcript-box" aria-live="polite">
                <div class="hud-msg-turn">
                  <div class="hud-msg-speaker">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>User</span>
                  </div>
                  <div class="hud-msg-text hud-msg-text--user" id="hud-user-speech">Hi, Show Me the today Todos</div>
                </div>
                <div class="hud-msg-turn">
                  <div class="hud-msg-speaker">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
                    <span>Claudia (Agent)</span>
                  </div>
                  <div class="hud-msg-text hud-msg-text--agent" id="hud-agent-speech">
                    Morning, here Todos:<br>1. Walk 3 Km<br>2. Prepare Meeting note<br>3. Meeting with John<span class="hud-typing-cursor" id="hud-cursor"></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Panel: Navigation Locator & Hierarchical Assist Views -->
            <div class="hud-right-panel">
              <div class="hud-assist-header">
                <div class="hud-assist-title" id="hud-assist-title">Today Todos</div>
                <div class="hud-assist-guide-badge" id="hud-assist-guide">◄ double tap : to Control Center</div>
              </div>

              <!-- View 1: Control Center (Root Launcher) -->
              <div class="hud-assist-view" id="hud-view-control-center" style="display: none;">
                <div class="hud-list-item selected" data-index="0" onclick="selectHudControlItem(0)">
                  <span class="hud-cursor-arrow">▶</span>
                  <span>Conversation Control</span>
                </div>
                <div class="hud-list-item" data-index="1" onclick="selectHudControlItem(1)">
                  <span class="hud-cursor-arrow">&nbsp;</span>
                  <span style="display: flex; justify-content: space-between; width: 100%;">
                    <span>Daily Todos</span>
                    <span class="joy-badge joy-badge--neutral joy-badge--xs" id="hud-todos-badge">[ 1 / 3 ]</span>
                  </span>
                </div>
                <div class="hud-list-item" data-index="2" onclick="selectHudControlItem(2)">
                  <span class="hud-cursor-arrow">&nbsp;</span>
                  <span style="display: flex; justify-content: space-between; width: 100%;">
                    <span>Notifications</span>
                    <span class="joy-badge joy-badge--brand joy-badge--xs">[ 2 ] 10m ago</span>
                  </span>
                </div>
                <div class="hud-list-item" data-index="3" onclick="selectHudControlItem(3)">
                  <span class="hud-cursor-arrow">&nbsp;</span>
                  <span>Optical Ambient Display</span>
                </div>
              </div>

              <!-- View 2: Today Todos (Checklist) -->
              <div class="hud-assist-view" id="hud-view-todos" style="display: flex;">
                <div class="hud-list-item selected" data-index="0" onclick="selectHudTodoItem(0)">
                  <span class="hud-cursor-arrow">▶</span>
                  <div class="hud-checkbox-box" id="todo-box-0">[ ]</div>
                  <span>Walk 3 Km</span>
                </div>
                <div class="hud-list-item" data-index="1" onclick="selectHudTodoItem(1)">
                  <span class="hud-cursor-arrow">&nbsp;</span>
                  <div class="hud-checkbox-box checked" id="todo-box-1">[x]</div>
                  <span style="text-decoration: line-through;">Prepare Meeting note</span>
                </div>
                <div class="hud-list-item" data-index="2" onclick="selectHudTodoItem(2)">
                  <span class="hud-cursor-arrow">&nbsp;</span>
                  <div class="hud-checkbox-box" id="todo-box-2">[ ]</div>
                  <span>Meeting with John</span>
                </div>
              </div>

              <!-- View 3: Todo Detail Action Tray -->
              <div class="hud-assist-view" id="hud-view-todo-detail" style="display: none;">
                <div style="font-weight: 700; font-size: var(--joy-font-size-sm); margin-bottom: 8px; color: var(--joy-status-success-fg);" id="hud-detail-title">Walk 3 Km</div>
                <div class="hud-list-item selected" data-action="mark_done" onclick="executeHudAction('mark_done')">
                  <span class="hud-cursor-arrow">▶</span>
                  <span>[x] [ Mark done ]</span>
                </div>
                <div class="hud-list-item" data-action="mark_undone" onclick="executeHudAction('mark_undone')">
                  <span class="hud-cursor-arrow">&nbsp;</span>
                  <span>[ ] [ Mark not done ]</span>
                </div>
                <div class="hud-list-item" data-action="delete" onclick="executeHudAction('delete')">
                  <span class="hud-cursor-arrow">&nbsp;</span>
                  <span>[×] [ Delete ]</span>
                </div>
              </div>

              <!-- View 4: Communication State Control Guide -->
              <div class="hud-assist-view" id="hud-view-com-guide" style="display: none;">
                <div style="font-size: var(--joy-font-size-xs); font-family: monospace; color: var(--joy-status-success-fg); margin-bottom: 8px; opacity: 0.85;">
                  Mode: <span id="hud-guide-cycle" style="color: var(--joy-status-success-fg); font-weight: 700;">[ listen ◄► pause ◄► watch ]</span>
                </div>
                <div class="hud-list-item" style="cursor: default;">
                  <span style="font-size: var(--joy-font-size-xs); line-height: 1.5;">
                    <strong>▶ tap : to Interrupt</strong><br>
                    State machine: interrupt • record • resume AI talking
                  </span>
                </div>
                <div class="hud-list-item" style="cursor: default;">
                  <span style="font-size: var(--joy-font-size-xs); line-height: 1.5;">
                    <strong>▲▼ swipe : to switch mode</strong><br>
                    Cycle between listening, watching, and paused glance
                  </span>
                </div>
                <div class="hud-list-item" style="cursor: default;">
                  <span style="font-size: var(--joy-font-size-xs); line-height: 1.5;">
                    <strong>◄ double tap : to back</strong><br>
                    Return to root Control Center
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Temple Touchpad Simulator Bar -->
          <div class="hud-temple-controller">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; width: 100%;">
              <span style="font-size: var(--joy-font-size-xs); font-weight: 700; color: var(--joy-status-success-fg); opacity: 0.75;">TEMPLE TOUCHPAD:</span>
              <div class="hud-temple-touchbar">
                <button type="button" class="hud-touch-btn" id="btn-touch-tap" onclick="triggerHudGesture('tap')">
                  <span>▶ Tap (Select / ⏸ Interrupt)</span>
                </button>
                <button type="button" class="hud-touch-btn" id="btn-touch-double" onclick="triggerHudGesture('double_tap')">
                  <span>◄ Double Tap (Back)</span>
                </button>
                <button type="button" class="hud-touch-btn" id="btn-touch-swipe-down" onclick="triggerHudGesture('swipe_down')">
                  <span>▼ Swipe (Next)</span>
                </button>
                <button type="button" class="hud-touch-btn" id="btn-touch-swipe-up" onclick="triggerHudGesture('swipe_up')">
                  <span>▲ Swipe (Prev)</span>
                </button>
                <button type="button" class="hud-touch-btn" id="btn-touch-hold" onclick="triggerHudGesture('hold')">
                  <span>● Hold (Record Memo)</span>
                </button>
              </div>
            </div>
            <div class="hud-event-feed" id="hud-event-feed">[READY] Awaiting temple gesture or voice prompt...</div>
          </div>
        </div>

        <!-- Design Guidelines Bento Matrix -->
        <div style="margin-top: 40px;">
          <h3 style="margin: 0 0 16px 0;">Glasses HUD UI & Interaction Guidelines</h3>
          <div class="apple-specs-bento">
            <div class="apple-bento-tile apple-bento-tile--col-6">
              <span class="apple-eyebrow">Optical Waveguide Physics</span>
              <h4 style="font-size: var(--joy-font-size-lg); margin: 0 0 8px 0;">All-Case Dark Background & Additive Light</h4>
              <p style="color: var(--joy-text-secondary); margin: 0 0 12px 0;">MicroLED waveguides emit photons onto transparent optical glass. Photons are purely additive; 0-emission true black equals 100% transparent reality. Opaque white cards do not exist in optical waveguides and would cause total vision occlusion and rapid battery drainage.</p>
              <span class="joy-badge joy-badge--brand joy-badge--sm">Additive MicroLED</span>
            </div>
            <div class="apple-bento-tile apple-bento-tile--col-6">
              <span class="apple-eyebrow">Monochrome Green MicroLED</span>
              <h4 style="font-size: var(--joy-font-size-lg); margin: 0 0 8px 0;">P43 Phosphor (530nm) & Photopic Peak V(λ)</h4>
              <p style="color: var(--joy-text-secondary); margin: 0 0 12px 0;">Human eye photopic sensitivity peaks at 555nm (green). A single-wavelength P43 green emitter produces 4× to 5× higher perceived luminance per milliwatt than blue or red, achieving 3,500+ nits to punch through direct outdoor sunlight all day.</p>
              <span class="joy-badge joy-badge--success joy-badge--sm">Photopic V(λ) 555nm</span>
            </div>
            <div class="apple-bento-tile apple-bento-tile--col-6">
              <span class="apple-eyebrow">Symbolic State Matrix</span>
              <h4 style="font-size: var(--joy-font-size-lg); margin: 0 0 8px 0;">Single-Color Geometric Symbols & Reverse-Video</h4>
              <p style="color: var(--joy-text-secondary); margin: 0 0 12px 0;">Without color hue variance, all state distinctions use high-contrast geometric symbols: <code>▶</code> cursor with solid reverse-video rectangular fill (green background with black text), <code>[x]</code> completed, <code>[ ]</code> pending, <code>[×]</code> delete, and directional cues <code>▲ / ▼ / ◄</code>.</p>
              <span class="joy-badge joy-badge--warning joy-badge--sm">Reverse-Video Selection</span>
            </div>
            <div class="apple-bento-tile apple-bento-tile--col-6">
              <span class="apple-eyebrow">Zero Emoji Policy</span>
              <h4 style="font-size: var(--joy-font-size-lg); margin: 0 0 8px 0;">Enterprise Optical Contract</h4>
              <p style="color: var(--joy-text-secondary); margin: 0 0 12px 0;">OS emojis render unpredictable multi-color bitmaps that ruin optical waveguides. All symbols use standard non-emoji geometric unicode (U+25B6, U+00D7, U+25C4) or scalable vector SVGs from <code>@montionugera/joy-icons</code>.</p>
              <span class="joy-badge joy-badge--neutral joy-badge--sm">Zero OS Emojis</span>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Navigation & Workflow (Wave 3 aspect view) -->
      ${renderNavigationView()}

      <!-- View: High-Performance Financial Charts -->
      <section id="view-charts" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">High-Performance Financial & Large-Dataset Charts</h2>
        <p class="header-tagline">Dual-canvas accelerated charting engine supporting 100,000+ data points with Largest-Triangle-Three-Buckets (LTTB) decimation, interactive wheel zoom, inertial pan, magnetic crosshair snap, and floating HUD telemetry.</p>

        <!-- Candlestick Financial Chart Demo -->
        <div class="playground-box" style="margin-bottom: 24px;">
          <div class="playground-header">
            <h4>Candlestick Chart & Bull/Bear Telemetry (BTC/USDT 1m)</h4>
            <div style="display: flex; gap: 8px;">
              <button class="joy-button joy-button--outline joy-button--sm" onclick="resetChartZoom()">Reset Zoom</button>
              <button class="joy-button joy-button--solid joy-button--sm" onclick="simulateLiveCandleTick()">Stream Live Tick</button>
            </div>
          </div>
          <div style="padding: 24px;">
            <div class="joy-chart" id="candlestick-demo-chart" style="height: 380px;" tabindex="0" role="region" aria-label="Interactive Candlestick Financial Chart. Use arrow keys to pan, plus and minus to zoom, 0 to reset.">
              <div class="joy-chart__hud" id="candlestick-hud" aria-live="polite">
                <div class="joy-chart__hud-item"><span class="joy-chart__hud-label">Pair:</span><span class="joy-chart__hud-value">BTC/USDT</span></div>
                <div class="joy-chart__hud-item"><span class="joy-chart__hud-label">O:</span><span class="joy-chart__hud-value" id="hud-o">68,420.00</span></div>
                <div class="joy-chart__hud-item"><span class="joy-chart__hud-label">H:</span><span class="joy-chart__hud-value" id="hud-h">68,790.50</span></div>
                <div class="joy-chart__hud-item"><span class="joy-chart__hud-label">L:</span><span class="joy-chart__hud-value" id="hud-l">68,310.00</span></div>
                <div class="joy-chart__hud-item"><span class="joy-chart__hud-label">C:</span><span class="joy-chart__hud-value joy-chart__hud-value--bull" id="hud-c">68,720.00</span></div>
                <div class="joy-chart__hud-item"><span class="joy-chart__hud-label">Vol:</span><span class="joy-chart__hud-value">1,428 BTC</span></div>
              </div>
              <div class="joy-chart__canvas-container" role="img" aria-label="Candlestick chart, 500 candles">
                <canvas id="candle-base-canvas" class="joy-chart__canvas-base"></canvas>
                <canvas id="candle-overlay-canvas" class="joy-chart__canvas-overlay"></canvas>
              </div>
            </div>
            <div style="margin-top: 12px; font-size: var(--joy-font-size-xs); color: var(--joy-text-muted); display: flex; justify-content: space-between;">
              <span>Tip: Scroll mouse wheel on canvas to zoom; drag to pan across time horizons.</span>
              <span id="chart-points-count">Dataset: 500 OHLC Bars</span>
            </div>
          </div>
        </div>

        <!-- Large-Dataset Line Chart Demo -->
        <div class="playground-box">
          <div class="playground-header">
            <h4>High-Density Line Chart (10,000 Data Points with LTTB Decimation)</h4>
            <span class="joy-badge joy-badge--brand joy-badge--subtle">60 FPS Hardware Scaled</span>
          </div>
          <div style="padding: 24px;">
            <div class="joy-chart" id="line-demo-chart" style="height: 320px;" tabindex="0" role="region" aria-label="Interactive Line Chart. Use arrow keys to pan, plus and minus to zoom, 0 to reset.">
              <div class="joy-chart__hud" id="line-hud" aria-live="polite">
                <div class="joy-chart__hud-item"><span class="joy-chart__hud-label">Telemetry:</span><span class="joy-chart__hud-value">Solana TPS Feed</span></div>
                <div class="joy-chart__hud-item"><span class="joy-chart__hud-label">Value:</span><span class="joy-chart__hud-value joy-chart__hud-value--accent" id="line-hud-val">3,420 TPS</span></div>
              </div>
              <div class="joy-chart__canvas-container" role="img" aria-label="Line chart, 10,000 points">
                <canvas id="line-base-canvas" class="joy-chart__canvas-base"></canvas>
                <canvas id="line-overlay-canvas" class="joy-chart__canvas-overlay"></canvas>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Layout & AntD Primitives -->
      <section id="view-primitives" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Layout & Ant Design Core Primitives</h2>
        <p class="header-tagline">Ant Design v5 / v6 layout primitives and data display components: Splitter resizable panes, Flex & Space containers, Divider, Statistic counters, Tag badges, and Segmented toggles.</p>

        <!-- Splitter Demo -->
        <div class="playground-box" style="margin-bottom: 24px;">
          <div class="playground-header">
            <h4>Splitter (drag the divider or use the arrow keys)</h4>
          </div>
          <div style="padding: 24px;">
            ${hubSplitter("horizontal", "<strong>Strategy Controls</strong><p>Arbitrage engine parameters, exchange API keys, and latency tolerances.</p>", "<strong>Execution Telemetry</strong><p>Live order matching logs, routing fills, and execution slip statistics.</p>", 200, "demo-splitter")}
          </div>
        </div>

        <!-- Space & Flex Demo -->
        <div class="playground-box" style="margin-bottom: 24px;">
          <div class="playground-header">
            <h4>Flex & Space Layout Containers</h4>
          </div>
          <div style="padding: 24px; display: flex; flex-direction: column; gap: 20px;">
            <div>
              <div style="font-size: var(--joy-font-size-sm); font-weight: 600; margin-bottom: 8px;">Space (Auto-Gap Buttons & Badges)</div>
              <div class="joy-space" style="gap: 12px; flex-wrap: wrap;">
                <button class="joy-button joy-button--solid joy-button--sm">Deposit</button>
                <button class="joy-button joy-button--outline joy-button--sm">Withdraw</button>
                <button class="joy-button joy-button--ghost joy-button--sm">Transfer</button>
                <span class="joy-tag joy-tag--primary">Auto-rebalance ON</span>
                <span class="joy-tag joy-tag--success">All Nodes Green</span>
              </div>
            </div>

            <div class="joy-divider joy-divider--with-text"><span class="joy-divider__text">Dividers with Text</span></div>

            <div>
              <div style="font-size: var(--joy-font-size-sm); font-weight: 600; margin-bottom: 8px;">Flex (Justify & Align Helpers)</div>
              <div class="joy-flex" style="justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--joy-surface-sunken); border-radius: 6px;">
                <span>Total Staked Assets</span>
                <span style="font-weight: 700; color: var(--joy-accent-default);">$4,892,120.00</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Statistic & Tag & Segmented Demo -->
        <div class="playground-box">
          <div class="playground-header">
            <h4>Statistic, Tag (Checkable), & Segmented Controls</h4>
          </div>
          <div style="padding: 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
            <div>
              <div class="joy-statistic">
                <div class="joy-statistic__title">24h Trading Volume</div>
                <div class="joy-statistic__content">
                  <span class="joy-statistic__prefix">$</span>
                  <span class="joy-statistic__value">124,592,840</span>
                  <span class="joy-statistic__suffix">USD</span>
                </div>
              </div>
            </div>

            <div>
              <div style="font-size: var(--joy-font-size-sm); color: var(--joy-text-muted); margin-bottom: 8px;">Segmented Time Horizon:</div>
              <div class="joy-segmented" id="demo-segmented">
                <button type="button" class="joy-segmented__item joy-segmented__item--active" onclick="selectSegment(this, '1h')">1H</button>
                <button type="button" class="joy-segmented__item" onclick="selectSegment(this, '1d')">1D</button>
                <button type="button" class="joy-segmented__item" onclick="selectSegment(this, '1w')">1W</button>
                <button type="button" class="joy-segmented__item" onclick="selectSegment(this, '1m')">1M</button>
                <button type="button" class="joy-segmented__item" onclick="selectSegment(this, 'all')">ALL</button>
              </div>
            </div>

            <div>
              <div style="font-size: var(--joy-font-size-sm); color: var(--joy-text-muted); margin-bottom: 8px;">Checkable Tags:</div>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <span class="joy-tag joy-tag--checkable joy-tag--checked" onclick="this.classList.toggle('joy-tag--checked')">BTC</span>
                <span class="joy-tag joy-tag--checkable joy-tag--checked" onclick="this.classList.toggle('joy-tag--checked')">ETH</span>
                <span class="joy-tag joy-tag--checkable" onclick="this.classList.toggle('joy-tag--checked')">SOL</span>
                <span class="joy-tag joy-tag--checkable" onclick="this.classList.toggle('joy-tag--checked')">AVAX</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Form Suite & Advanced Data Entry Parity -->
      <section id="view-forms" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Form Suite & Advanced Data Entry Parity</h2>
        <p class="header-tagline">Ant Design v5 / v6 data entry parity: Form with validation rules & explains, InputNumber spinbutton stepper, Rate interactive star rating, Mentions autocomplete, TimePicker column selector, and Transfer dual-panel list migration.</p>

        ${renderFormsMatrix()}

        <!-- Form & Validation Showcase -->
        <div class="component-card">
          <div class="component-header">
            <div>
              <div class="component-title">Form & FormItem Validation Engine</div>
              <div class="component-desc">Standardized enterprise form containers supporting horizontal, vertical, and inline layouts with automatic validation state and explain indicators.</div>
            </div>
            <span class="joy-badge joy-badge--brand joy-badge--sm">Ant Design Parity</span>
          </div>
          <div class="component-canvas">
            <div class="form-showcase-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: 28px; width: 100%;">
              <!-- Vertical Form -->
              <div class="joy-form joy-form--vertical" style="background: var(--joy-surface-sunken); padding: 20px; border-radius: 8px; border: 1px solid var(--joy-border-subtle);">
                <div style="font-weight: 600; font-size: var(--joy-font-size-sm); margin-bottom: 14px; color: var(--joy-accent-default);">Vertical Layout with Validation Rules</div>
                
                <div class="joy-form-item">
                  <label class="joy-form-item__label"><span class="joy-form-item__required">*</span>Asset Symbol</label>
                  <div class="joy-form-item__control">
                    <div class="joy-input-wrapper">
                      <input class="joy-input" placeholder="e.g. BTC-USDT" value="ETH-PERP" />
                    </div>
                  </div>
                </div>

                <div class="joy-form-item joy-form-item--error">
                  <label class="joy-form-item__label"><span class="joy-form-item__required">*</span>Order Execution Size</label>
                  <div class="joy-form-item__control">
                    <div class="joy-input-wrapper joy-input-wrapper--error">
                      <input class="joy-input" placeholder="Min 0.01" value="0.005" />
                    </div>
                    <div class="joy-form-item__explain" role="alert">Order size must be at least 0.01 contracts for high-liquidity books</div>
                  </div>
                </div>

                <div class="joy-form-item">
                  <label class="joy-form-item__label">Execution Strategy</label>
                  <div class="joy-form-item__control">
                    <div class="joy-select-wrapper joy-select-wrapper--md">
                      <button type="button" class="joy-select" role="combobox" aria-expanded="false" aria-haspopup="listbox">
                        <span class="joy-select__value">TWAP (Time-Weighted Average Price)</span>
                        <span class="joy-select__arrow" aria-hidden="true">${chevronDown}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button type="button" class="joy-button joy-button--solid joy-button--md" style="align-self: flex-start; margin-top: 8px;">Submit Order</button>
              </div>

              <!-- Horizontal Form -->
              <div class="joy-form joy-form--horizontal" style="background: var(--joy-surface-sunken); padding: 24px; border-radius: 8px; border: 1px solid var(--joy-border-subtle); --joy-form-label-width: 160px;">
                <div style="font-weight: 600; font-size: var(--joy-font-size-sm); margin-bottom: 18px; color: var(--joy-accent-default);">Horizontal Layout Alignment (Right-Aligned Baselines)</div>
                
                <div class="joy-form-item joy-form-item--horizontal">
                  <label class="joy-form-item__label"><span class="joy-form-item__required">*</span>Account Name</label>
                  <div class="joy-form-item__control">
                    <div class="joy-input-wrapper">
                      <input class="joy-input" value="Trading Ops Prime #01" />
                    </div>
                  </div>
                </div>

                <div class="joy-form-item joy-form-item--horizontal">
                  <label class="joy-form-item__label">Routing Venue</label>
                  <div class="joy-form-item__control">
                    <div class="joy-input-wrapper">
                      <input class="joy-input" value="Direct DMA Gateway 4" />
                    </div>
                  </div>
                </div>

                <div class="joy-form-item joy-form-item--horizontal joy-form-item--error">
                  <label class="joy-form-item__label"><span class="joy-form-item__required">*</span>Daily Max Drawdown</label>
                  <div class="joy-form-item__control">
                    <div class="joy-input-wrapper joy-input-wrapper--error">
                      <input class="joy-input" value="35%" />
                    </div>
                    <div class="joy-form-item__explain" role="alert">Max permitted risk threshold is 25% per fund policy</div>
                  </div>
                </div>

                <div class="joy-form-actions">
                  <button type="button" class="joy-button joy-button--solid joy-button--md">Save Policy</button>
                  <button type="button" class="joy-button joy-button--outline joy-button--md">Reset</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- InputNumber, Rate, Mentions, TimePicker Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 24px; margin-top: 24px;">
          <!-- InputNumber Card -->
          <div class="component-card">
            <div class="component-header">
              <div>
                <div class="component-title">InputNumber Stepper</div>
                <div class="component-desc">High-density numeric spinbutton with min, max, precision, and keyboard arrow controls.</div>
              </div>
            </div>
            <div class="component-canvas" style="flex-direction: column; align-items: flex-start; gap: 16px;">
              <div>
                <div style="font-size: var(--joy-font-size-xs); color: var(--joy-text-muted); margin-bottom: 6px;">Leverage Multiplier (1x - 100x):</div>
                <div class="joy-input-number" role="spinbutton" aria-valuenow="10" aria-valuemin="1" aria-valuemax="100" tabindex="0">
                  <input type="text" class="joy-input-number__input" id="demo-num-input" value="10" />
                  <div class="joy-input-number__handler-wrap">
                    <button type="button" class="joy-input-number__handler-up" aria-label="Increase" onclick="stepNumberDemo(1)">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                    </button>
                    <button type="button" class="joy-input-number__handler-down" aria-label="Decrease" onclick="stepNumberDemo(-1)">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div style="font-size: var(--joy-font-size-xs); color: var(--joy-text-muted); margin-bottom: 6px;">Precision Sizing (step 0.05):</div>
                <div class="joy-input-number" role="spinbutton" aria-valuenow="1.25" tabindex="0">
                  <input type="text" class="joy-input-number__input" id="demo-num-step" value="1.25" />
                  <div class="joy-input-number__handler-wrap">
                    <button type="button" class="joy-input-number__handler-up" aria-label="Increase" onclick="stepFloatDemo(0.05)">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                    </button>
                    <button type="button" class="joy-input-number__handler-down" aria-label="Decrease" onclick="stepFloatDemo(-0.05)">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Rate Card -->
          <div class="component-card">
            <div class="component-header">
              <div>
                <div class="component-title">Rate Rating Scale</div>
                <div class="component-desc">Accessible radiogroup rating scale with full and half-star granularity and hover feedback.</div>
              </div>
            </div>
            <div class="component-canvas" style="flex-direction: column; align-items: flex-start; gap: 16px;">
              <div>
                <div style="font-size: var(--joy-font-size-xs); color: var(--joy-text-muted); margin-bottom: 6px;">Execution Quality Rating:</div>
                <div class="joy-rate" id="demo-rate" role="radiogroup" aria-label="Rating"></div>
                <div id="rate-feedback" style="font-size: var(--joy-font-size-sm); font-weight: 500; color: var(--joy-accent-default); margin-top: 6px;">4.5 Stars</div>
              </div>
            </div>
          </div>

          <!-- Mentions Card -->
          <div class="component-card">
            <div class="component-header">
              <div>
                <div class="component-title">Mentions Autocomplete</div>
                <div class="component-desc">Trigger-based (@ and #) entity tagging with smart suggestion dropdown menu.</div>
              </div>
            </div>
            <div class="component-canvas" style="flex-direction: column; width: 100%;">
              <div class="joy-mentions" style="width: 100%;">
                <textarea class="joy-mentions__textarea" rows="3" placeholder="Type @ to mention risk officer or analyst, e.g. @alice" id="demo-mentions" oninput="handleMentionsInput(event)"></textarea>
                <div class="joy-mentions__dropdown" id="demo-mentions-dropdown" style="display: none;" role="listbox">
                  <div class="joy-mentions__item" onclick="insertMention('alice')"><span>@alice</span> (Senior Quant)</div>
                  <div class="joy-mentions__item" onclick="insertMention('bob')"><span>@bob</span> (Risk Manager)</div>
                  <div class="joy-mentions__item" onclick="insertMention('carol')"><span>@carol</span> (Portfolio Lead)</div>
                </div>
              </div>
            </div>
          </div>

          <!-- TimePicker Card -->
          <div class="component-card">
            <div class="component-header">
              <div>
                <div class="component-title">TimePicker Column Selector</div>
                <div class="component-desc">Precise time selection with hours, minutes, and seconds scrollable columns.</div>
              </div>
            </div>
            <div class="component-canvas" style="flex-direction: column; align-items: flex-start;">
              <div class="joy-time-picker" style="width: 220px;">
                <div class="joy-input-wrapper" onclick="toggleTimePickerDemo()" style="cursor: pointer;">
                  <input type="text" class="joy-input" id="demo-time-input" readonly value="09:30:00" style="cursor: pointer;" />
                  <span style="padding-right: 10px; display: flex; align-items: center; color: var(--joy-text-muted);">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </span>
                </div>
                <div class="joy-time-picker__panel" id="demo-time-panel" style="display: none;" role="dialog">
                  <div class="joy-time-picker__column" id="demo-time-h"></div>
                  <div class="joy-time-picker__column" id="demo-time-m"></div>
                  <div class="joy-time-picker__column" id="demo-time-s"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Transfer Component Showcase (Screenshot 5 parity) -->
        <div class="component-card" style="margin-top: 24px;">
          <div class="component-header">
            <div>
              <div class="component-title">Transfer Dual-Panel Migration (Ant Design Screenshot 5 Parity)</div>
              <div class="component-desc">High-throughput transfer list migration engine with multi-item checkbox selection, dynamic count headers, and directional migration controls.</div>
            </div>
            <span class="joy-badge joy-badge--brand joy-badge--sm">Direct AntD Parity</span>
          </div>
          <div class="component-canvas">
            <div class="joy-transfer" style="max-width: 640px; margin: 0 auto; width: 100%;" id="demo-transfer-container">
              <!-- Left Panel -->
              <div class="joy-transfer__list">
                <div class="joy-transfer__header">
                  <span>Available Liquidity Pools</span>
                  <span class="joy-transfer__header-count" id="transfer-source-count">0/5 items</span>
                </div>
                <div class="joy-transfer__body" id="transfer-source-list"></div>
              </div>

              <!-- Operation Controls -->
              <div class="joy-transfer__operations">
                <button type="button" class="joy-button joy-button--solid joy-button--sm" id="btn-transfer-right" onclick="executeTransfer('right')" aria-label="Migrate right">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
                <button type="button" class="joy-button joy-button--solid joy-button--sm" id="btn-transfer-left" onclick="executeTransfer('left')" aria-label="Migrate left">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
              </div>

              <!-- Right Panel -->
              <div class="joy-transfer__list">
                <div class="joy-transfer__header">
                  <span>Active Routing Targets</span>
                  <span class="joy-transfer__header-count" id="transfer-target-count">0/2 items</span>
                </div>
                <div class="joy-transfer__body" id="transfer-target-list"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Navigation & Feedback Suite Parity -->
      <section id="view-nav-feedback" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Navigation & Feedback Suite Parity</h2>
        <p class="header-tagline">Ant Design v5 / v6 navigation & feedback parity: Menu (horizontal & inline), Anchor in-page track navigation, Message top-center toasts, Notification rich cards, Popconfirm action confirmation, and Spin loading indicators.</p>

        <!-- Menu Showcase -->
        <div class="component-card">
          <div class="component-header">
            <div>
              <div class="component-title">Menu Navigation (Horizontal & Inline)</div>
              <div class="component-desc">Multi-mode navigation menus supporting horizontal topbars and inline collapsible sidebars with active indicators and icons.</div>
            </div>
            <span class="joy-badge joy-badge--brand joy-badge--sm">Ant Design Parity</span>
          </div>
          <div class="component-canvas" style="flex-direction: column; gap: 24px; align-items: stretch;">
            <!-- Horizontal Menu -->
            <div>
              <div style="font-size: var(--joy-font-size-sm); font-weight: 600; color: var(--joy-text-muted); margin-bottom: 8px;">Horizontal Menu:</div>
              <ul class="joy-menu joy-menu--horizontal" role="menu" id="demo-menu-horiz">
                <li class="joy-menu__item joy-menu__item--active" role="menuitem" tabindex="0" onclick="selectMenuItem(this)">
                  <span class="joy-menu__item-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"></path><path d="m19 9-5 5-4-4-3 3"></path></svg>
                  </span>
                  <span>Trading Terminal</span>
                </li>
                <li class="joy-menu__item" role="menuitem" tabindex="0" onclick="selectMenuItem(this)">
                  <span class="joy-menu__item-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  </span>
                  <span>Portfolio Risk</span>
                </li>
                <li class="joy-menu__item" role="menuitem" tabindex="0" onclick="selectMenuItem(this)">
                  <span class="joy-menu__item-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                  </span>
                  <span>Execution Rules</span>
                </li>
              </ul>
            </div>

            <!-- Inline Sidebar Menu & Anchor Split -->
            <div style="display: grid; grid-template-columns: 260px 1fr 220px; gap: 24px; align-items: start;">
              <!-- Inline Menu -->
              <div style="background: var(--joy-surface-sunken); border: 1px solid var(--joy-border-subtle); border-radius: 8px; overflow: hidden;">
                <div style="padding: 10px 16px; font-weight: 600; font-size: var(--joy-font-size-sm); color: var(--joy-accent-default); border-bottom: 1px solid var(--joy-border-subtle);">Sidebar Subscriptions</div>
                <ul class="joy-menu joy-menu--inline" role="menu" style="width: 100%; border: none;">
                  <li class="joy-menu__item joy-menu__item--active" role="menuitem" tabindex="0" onclick="selectMenuItem(this)">
                    <span>Spot Liquidity (AMM)</span>
                  </li>
                  <li class="joy-menu__item" role="menuitem" tabindex="0" onclick="selectMenuItem(this)">
                    <span>Perpetual Futures</span>
                  </li>
                  <li class="joy-menu__item" role="menuitem" tabindex="0" onclick="selectMenuItem(this)">
                    <span>Options Volatility Surface</span>
                  </li>
                  <li class="joy-menu__item" role="menuitem" tabindex="0" onclick="selectMenuItem(this)">
                    <span>Yield Arbitrage Tracker</span>
                  </li>
                </ul>
              </div>

              <!-- Center Interactive Feedback Grid -->
              <div style="display: flex; flex-direction: column; gap: 16px;">
                <div style="font-weight: 600; font-size: var(--joy-font-size-sm);">Message & Notification Triggers:</div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  <button type="button" class="joy-button joy-button--solid joy-button--sm" onclick="triggerMessage('success', 'Order filled successfully at $64,250.00')">Message Success</button>
                  <button type="button" class="joy-button joy-button--outline joy-button--sm" onclick="triggerMessage('error', 'Execution rejected: Insufficient margin')">Message Error</button>
                  <button type="button" class="joy-button joy-button--outline joy-button--sm" onclick="triggerMessage('warning', 'Network latency elevated: 142ms')">Message Warning</button>
                  <button type="button" class="joy-button joy-button--solid joy-button--sm" onclick="triggerNotification('info', 'Liquidation Warning', 'ETH-PERP margin ratio has dropped below 15%. Consider adding collateral.')">Notification Card</button>
                </div>

                <div style="margin-top: 12px; font-weight: 600; font-size: var(--joy-font-size-sm);">Popconfirm Confirmation:</div>
                <div style="display: flex; gap: 16px; align-items: center;">
                  ${hubPopconfirm("demo-popconfirm-panel", "Revoke API Key", "Revoke DMA Master Key?")}
                  <span style="font-size: var(--joy-font-size-sm); color: var(--joy-text-muted);">Prevents accidental destructive operations</span>
                </div>

                <div style="margin-top: 12px; font-weight: 600; font-size: var(--joy-font-size-sm);">Spin Loading Indicators:</div>
                <div style="display: flex; gap: 20px; align-items: center;">
                  <div class="joy-spin"><svg class="joy-spin__indicator" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg></div>
                  <div class="joy-spin"><svg class="joy-spin__indicator" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg></div>
                  <div class="joy-spin"><svg class="joy-spin__indicator" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg></div>
                  <button type="button" class="joy-button joy-button--outline joy-button--sm" onclick="toggleSpinMask()">Toggle Container Loading</button>
                </div>

                <!-- Wrapped Container with Spin Mask -->
                <div class="joy-spin__container" id="demo-spin-container" style="background: var(--joy-surface-raised); border: 1px solid var(--joy-border-subtle); border-radius: 8px; padding: 16px; margin-top: 8px;">
                  <div style="font-weight: 600; font-size: var(--joy-font-size-sm); margin-bottom: 6px;">Live Book Depth Stream</div>
                  <div style="font-size: var(--joy-font-size-sm); color: var(--joy-text-muted);">Real-time aggregated L2 order depth feed from 6 venues.</div>
                  <div class="joy-spin__mask" id="demo-spin-mask" style="display: none;" role="status">
                    <div class="joy-spin" style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                      <svg class="joy-spin__indicator" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                      <span style="font-size: var(--joy-font-size-sm); color: var(--joy-accent-default); font-weight: 500;">Rebalancing book...</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Anchor Navigation -->
              <div style="background: var(--joy-surface-sunken); border: 1px solid var(--joy-border-subtle); border-radius: 8px; padding: 16px;">
                <div style="font-weight: 600; font-size: var(--joy-font-size-sm); color: var(--joy-accent-default); margin-bottom: 10px;">Anchor Navigator</div>
                <nav class="joy-anchor" role="navigation" aria-label="Demo Anchor">
                  <div class="joy-anchor__ink"></div>
                  <a href="#menu-demo" class="joy-anchor__link joy-anchor__link--active" aria-current="location" onclick="selectAnchor(this, event)">#menu-demo</a>
                  <a href="#feedback-demo" class="joy-anchor__link" onclick="selectAnchor(this, event)">#feedback-demo</a>
                  <a href="#popconfirm-demo" class="joy-anchor__link" onclick="selectAnchor(this, event)">#popconfirm-demo</a>
                  <a href="#spin-demo" class="joy-anchor__link" onclick="selectAnchor(this, event)">#spin-demo</a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
      ${renderBauhausView()}
      ${renderCourtsideLoggerView()}
      ${renderCoachDashboardView()}
      ${renderOutdoorGlareView()}
    </div>
  </main>

  <!-- Interactive Demo Modal (body level so any view can open it) -->
  <div id="demo-modal-container" data-hub-dialog style="display: none;">
    <div class="joy-modal-backdrop" role="presentation" onclick="closeDemoModal(event)">
      <div class="joy-modal" role="dialog" aria-modal="true" aria-labelledby="demo-modal-title">
        <div class="joy-modal__header">
          <h3 id="demo-modal-title" class="joy-modal__title">Confirm Liquidation Order</h3>
          <button type="button" class="joy-modal__close" aria-label="Close dialog" onclick="closeDemoModal()">${iconSvg("Close")}</button>
        </div>
        <div class="joy-modal__body">
          <p style="margin: 0 0 var(--joy-space-4) 0;">Are you sure you want to trigger emergency liquidation across all connected sub-accounts? This action is immediate and non-reversible.</p>
          ${hubPopconfirm("hub-popconfirm-modal", "Review sub-accounts first", "Open the sub-account list?", "outline")}
        </div>
        <div class="joy-modal__footer">
          <button type="button" class="joy-button joy-button--ghost joy-button--md" onclick="closeDemoModal()">Cancel</button>
          <button type="button" class="joy-button joy-button--danger joy-button--md" onclick="showDemoToast('Order submitted', 'success'); closeDemoModal();">Confirm</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Interactive Demo ImagePreview -->
  <div id="demo-image-preview-container" data-hub-dialog style="display: none;">
    <div class="joy-image-preview-mask" role="dialog" aria-modal="true" aria-label="Image preview" onclick="if (event.target === this) closeImagePreview()">
      <div class="joy-image-preview-toolbar" role="toolbar" aria-label="Preview tools">
        <button type="button" title="Zoom in (+)" aria-label="Zoom in" class="joy-image-preview-btn" onclick="hubPreviewZoom(1.25)">${iconSvg("ZoomIn", "1.25rem")}</button>
        <button type="button" title="Zoom out (-)" aria-label="Zoom out" class="joy-image-preview-btn" onclick="hubPreviewZoom(0.8)">${iconSvg("ZoomOut", "1.25rem")}</button>
        <button type="button" title="Rotate left" aria-label="Rotate left" class="joy-image-preview-btn" onclick="hubPreviewRotate(-90)"><span class="joy-image-preview-btn__icon--flip">${iconSvg("RefreshCw", "1.25rem")}</span></button>
        <button type="button" title="Rotate right (R)" aria-label="Rotate right" class="joy-image-preview-btn" onclick="hubPreviewRotate(90)">${iconSvg("RefreshCw", "1.25rem")}</button>
        <button type="button" title="Reset" aria-label="Reset zoom and rotation" class="joy-image-preview-btn" onclick="hubPreviewReset()">${iconSvg("Minimize2", "1.25rem")}</button>
        <button type="button" title="Close (Esc)" aria-label="Close preview" class="joy-image-preview-btn joy-image-preview-btn--close" onclick="closeImagePreview()">${iconSvg("Close", "1.25rem")}</button>
      </div>
      <div class="joy-image-preview-counter" id="hub-preview-counter" style="display: none;"></div>
      <button type="button" aria-label="Previous image" class="joy-image-preview-nav joy-image-preview-nav--prev" id="hub-preview-prev" style="display: none;" onclick="hubPreviewStep(-1)">${iconSvg("ChevronLeft", "1.5rem")}</button>
      <button type="button" aria-label="Next image" class="joy-image-preview-nav joy-image-preview-nav--next" id="hub-preview-next" style="display: none;" onclick="hubPreviewStep(1)">${iconSvg("ChevronRight", "1.5rem")}</button>
      <div class="joy-image-preview-stage">
        <img class="joy-image-preview-img" id="hub-preview-img" alt="Preview image" draggable="false">
      </div>
    </div>
  </div>

  <!-- Interactive Demo Drawer -->
  <div id="demo-drawer-container" data-hub-dialog style="display: none;">
    <div class="joy-drawer-backdrop" id="demo-drawer-backdrop" role="presentation" onclick="closeDemoDrawer(event)">
      <div class="joy-drawer" id="demo-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="demo-drawer-title">
        <div class="joy-drawer__header">
          <h3 class="joy-drawer__title" id="demo-drawer-title">Risk Engine Analysis</h3>
          <button type="button" class="joy-drawer__close" aria-label="Close drawer" onclick="closeDemoDrawer()">${iconSvg("Close")}</button>
        </div>
        <div class="joy-drawer__body" id="demo-drawer-body">
          <p><strong>Sub-account:</strong> Quant Alpha Alpha-1</p>
          <p><strong>Margin Ratio:</strong> 14.2% (Healthy)</p>
          <p><strong>Maintenance Margin:</strong> $124,500.00</p>
          <div style="margin-top: 16px;">${hubAlert("info", "Liquidation Buffer", "Liquidation price is 48% below current index mark.")}</div>
        </div>
        <div class="joy-drawer__footer">
          <button type="button" class="joy-button joy-button--ghost joy-button--sm" onclick="closeDemoDrawer()">Cancel</button>
          <button type="button" class="joy-button joy-button--solid joy-button--sm" onclick="showDemoToast('Audit snapshot generated successfully', 'success'); closeDemoDrawer();">Export PDF</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast Floating Container -->
  <div class="joy-toast-container" id="demo-toast-container"></div>

  <script>
    let activeFramework = 'svelte';
    let clickCount = 0;
    let isBtnLoading = false;
    let isSwitchOn = false;

    /** Sets the theme toggle's icon, visible label and aria-label from the CURRENT theme (the state to switch away from). */
    function syncThemeToggle(theme) {
      const btn = document.getElementById('btn-theme-toggle');
      const icon = document.getElementById('theme-icon');
      const label = document.getElementById('theme-label');
      const next = theme === 'dark' ? 'light' : 'dark';
      if (icon) {
        icon.innerHTML = theme === 'dark'
          ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
          : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
      }
      if (label) {
        label.innerText = theme === 'dark' ? 'Light theme' : 'Dark theme';
      }
      if (btn) {
        btn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
      }
    }

    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('joy-theme', next); } catch (e) {}
      syncThemeToggle(next);
      redrawHubCharts();
      syncThemeToFlutter(next);
    }

    const PALETTES = {
      'classic': 'Joy Classic',
      'bauhaus-primary': 'Bauhaus Primary',
      'clay-court': 'Clay Court',
      'nordic-slate': 'Nordic Slate',
      'verdant-lawn': 'Verdant Lawn'
    };

    function togglePaletteMenu() {
      const dd = document.getElementById('hub-palette-dropdown');
      const btn = document.getElementById('btn-palette-toggle');
      if (!dd || !btn) return;
      const isOpen = !dd.hasAttribute('hidden');
      if (isOpen) {
        dd.setAttribute('hidden', '');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        dd.removeAttribute('hidden');
        btn.setAttribute('aria-expanded', 'true');
      }
    }

    function setPalette(palette) {
      if (!PALETTES[palette]) palette = 'classic';
      document.documentElement.setAttribute('data-palette', palette);
      try { localStorage.setItem('joy-palette', palette); } catch (e) {}
      syncPalette(palette);
      const dd = document.getElementById('hub-palette-dropdown');
      const btn = document.getElementById('btn-palette-toggle');
      if (dd) dd.setAttribute('hidden', '');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      redrawHubCharts();
    }

    function syncPalette(palette) {
      if (!palette || !PALETTES[palette]) palette = 'classic';
      const label = document.getElementById('hub-palette-label');
      if (label) label.textContent = PALETTES[palette];
      document.querySelectorAll('.hub-palette-item').forEach(el => {
        const active = el.getAttribute('data-palette') === palette;
        el.classList.toggle('active', active);
        el.setAttribute('aria-selected', String(active));
      });
    }

    document.addEventListener('DOMContentLoaded', () => {
      syncThemeToggle(document.documentElement.getAttribute('data-theme'));
      syncPalette(document.documentElement.getAttribute('data-palette') || 'classic');
      initSidebarSearch();
      initAntd5DatePickers();
    });
    // Any theme change (toggle, restore, tests, devtools) keeps the toggle's icon and labels truthful,
    // and re-reads any resolved brand token values the Brand view is showing.
    new MutationObserver(() => {
      syncThemeToggle(document.documentElement.getAttribute('data-theme'));
      paintBrandTokenValues();
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    new MutationObserver(() => {
      syncPalette(document.documentElement.getAttribute('data-palette'));
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-palette'] });

    document.addEventListener('click', (e) => {
      const picker = document.getElementById('hub-palette-picker');
      if (picker && !picker.contains(e.target)) {
        const dd = document.getElementById('hub-palette-dropdown');
        const btn = document.getElementById('btn-palette-toggle');
        if (dd) dd.setAttribute('hidden', '');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });

    /** Enter activates a role="link" .hub-card the same as a click (native <a> behaviour). */
    function hubCardActivate(event) {
      if (event.key === 'Enter') {
        event.preventDefault();
        event.currentTarget.click();
      }
    }

    // The sidebar is an off-canvas drawer at the same width the stylesheet's drawer media query uses.
    const drawerMedia = window.matchMedia('(max-width: 900px)');

    function toggleMobileMenu(open) {
      const sidebar = document.getElementById('hub-sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');
      const menuBtn = document.getElementById('mobile-menu-toggle');
      if (!sidebar || !backdrop) return;
      if (open === undefined) {
        open = !sidebar.classList.contains('open');
      }
      if (open && !drawerMedia.matches) return;
      if (!open && !sidebar.classList.contains('open')) return;
      sidebar.classList.toggle('open', open);
      backdrop.classList.toggle('active', open);
      if (menuBtn) menuBtn.setAttribute('aria-expanded', String(open));
      // body is already overflow: hidden at every viewport (it never scrolls); .main is the element that
      // actually scrolls behind the drawer, so it is the one that needs locking. Mirrors openLandingDrawer's
      // scroll lock on the simulator's .main.
      const scroller = document.querySelector('.main');
      if (scroller) scroller.style.overflowY = open ? 'hidden' : '';
      if (open) {
        const closeBtn = sidebar.querySelector('.sidebar-close-btn');
        if (closeBtn) closeBtn.focus();
      } else if (menuBtn && drawerMedia.matches && sidebar.contains(document.activeElement)) {
        menuBtn.focus();
      }
    }

    /** Visible, enabled controls inside the open drawer, in tab order. */
    function drawerFocusables(sidebar) {
      return Array.from(sidebar.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter((el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden');
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggleMobileMenu(false);
        return;
      }
      const sidebar = document.getElementById('hub-sidebar');
      if (e.key !== 'Tab' || !sidebar || !sidebar.classList.contains('open')) return;
      const items = drawerFocusables(sidebar);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const inside = sidebar.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    });

    drawerMedia.addEventListener('change', (e) => {
      if (!e.matches) toggleMobileMenu(false);
    });

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
      });
    }

    function clearSidebarSearch() {
      const input = document.getElementById('sidebar-search-input');
      if (input) {
        input.value = '';
        filterSidebar('');
        input.focus();
      }
    }

    function filterSidebar(query) {
      query = (query || '').trim().toLowerCase();
      const clearBtn = document.getElementById('sidebar-search-clear');
      const kbd = document.getElementById('sidebar-search-kbd');
      const emptyState = document.getElementById('sidebar-search-empty');
      const nav = document.querySelector('.nav');
      if (!nav) return;

      if (clearBtn) clearBtn.style.display = query ? 'flex' : 'none';
      if (kbd) kbd.style.display = query ? 'none' : 'inline-flex';

      const sections = nav.querySelectorAll('.nav-section');
      let totalVisible = 0;

      sections.forEach(function (section) {
        const catName = section.getAttribute('data-section') || section.textContent.trim();
        let sibling = section.nextElementSibling;
        const items = [];
        while (sibling && sibling.classList.contains('nav-item')) {
          items.push(sibling);
          sibling = sibling.nextElementSibling;
        }

        let sectionMatches = 0;
        items.forEach(function (item) {
          const label = item.getAttribute('data-label') || item.textContent.trim();
          const view = item.getAttribute('data-view') || '';
          const labelEl = item.querySelector('.nav-item-text') || item;

          if (!query) {
            item.style.display = '';
            if (item.querySelector('.nav-item-text')) {
              labelEl.textContent = label;
            }
            sectionMatches++;
            totalVisible++;
          } else {
            const matchIndex = label.toLowerCase().indexOf(query);
            const viewMatches = view.toLowerCase().includes(query);
            if (matchIndex !== -1 || viewMatches) {
              item.style.display = '';
              sectionMatches++;
              totalVisible++;
              if (item.querySelector('.nav-item-text')) {
                if (matchIndex !== -1) {
                  const before = label.slice(0, matchIndex);
                  const matched = label.slice(matchIndex, matchIndex + query.length);
                  const after = label.slice(matchIndex + query.length);
                  labelEl.innerHTML = escapeHtml(before) + '<mark class="nav-match-highlight">' + escapeHtml(matched) + '</mark>' + escapeHtml(after);
                } else {
                  labelEl.textContent = label;
                }
              }
            } else {
              item.style.display = 'none';
              if (item.querySelector('.nav-item-text')) {
                labelEl.textContent = label;
              }
            }
          }
        });

        if (!query) {
          section.style.display = '';
          section.textContent = catName;
        } else {
          if (sectionMatches > 0) {
            section.style.display = '';
            section.innerHTML = escapeHtml(catName) + ' <span class="nav-section-count">' + sectionMatches + '</span>';
          } else {
            section.style.display = 'none';
          }
        }
      });

      if (emptyState) {
        emptyState.style.display = (query && totalVisible === 0) ? 'block' : 'none';
      }
    }

    function initSidebarSearch() {
      const input = document.getElementById('sidebar-search-input');
      if (!input) return;

      input.addEventListener('input', function (e) {
        filterSidebar(e.target.value);
      });

      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          if (input.value) {
            e.preventDefault();
            clearSidebarSearch();
          } else {
            toggleMobileMenu(false);
            input.blur();
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const firstVisible = Array.from(document.querySelectorAll('.sidebar .nav-item'))
            .find(function (el) { return el.style.display !== 'none' && !el.hidden; });
          if (firstVisible) firstVisible.focus();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const firstVisible = Array.from(document.querySelectorAll('.sidebar .nav-item'))
            .find(function (el) { return el.style.display !== 'none' && !el.hidden; });
          if (firstVisible) firstVisible.click();
        }
      });

      // Global keyboard shortcuts: Cmd+K / Ctrl+K, or /
      document.addEventListener('keydown', function (e) {
        const isCmdK = (e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K');
        const isSlash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey;

        if (isCmdK || isSlash) {
          const active = document.activeElement;
          const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT' || active.isContentEditable);
          if (isSlash && isInput) return;

          e.preventDefault();
          if (drawerMedia.matches) {
            toggleMobileMenu(true);
          }
          input.focus();
          input.select();
        }
      });
    }

    function switchView(viewName, updateHash = true) {
      if (viewName !== 'overview' && viewName !== 'portal') {
        if (document.body.classList.contains('portal-mode')) {
          window.location.href = '/design/#' + viewName;
          return;
        }
        document.body.classList.remove('portal-mode');
        const titleEl = document.getElementById('topbar-brand-title');
        if (titleEl) titleEl.textContent = 'Joymify Design';
      }

      if (updateHash && window.location.hash !== '#' + viewName) {
        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', '#' + viewName);
        } else {
          window.location.hash = viewName;
        }
      }
      document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
      const target = document.getElementById('view-' + viewName);
      if (target) {
        target.classList.add('active');
      }

      document.querySelectorAll('.nav-item').forEach(i => {
        const current = i.dataset.view === viewName;
        i.classList.toggle('active', current);
        if (current) i.setAttribute('aria-current', 'page');
        else i.removeAttribute('aria-current');
      });

      const main = document.querySelector('.main');
      if (main) main.scrollTop = 0;

      // Close mobile drawer on item selection
      toggleMobileMenu(false);

      // Trigger 3D particle canvas resize when entering landing blocks
      if (viewName === 'landing-blocks') {
        setTimeout(resizeKineticCanvas, 40);
      }

      // Canvases are zero-sized while their view is hidden, so paint them once the view is visible
      if (viewName === 'charts' || viewName === 'data-display-feedback') {
        requestAnimationFrame(redrawHubCharts);
      }

      // The brand colour token table shows resolved values read at runtime, not hardcoded hex.
      if (viewName === 'brand') {
        paintBrandTokenValues();
      }

      // Lazy load Flutter Web iframe on demand
      if (viewName === 'flutter') {
        const iframe = document.getElementById('flutter-hub-iframe');
        if (iframe) {
          const dataSrc = iframe.getAttribute('data-src') || '/flutter/index.html';
          if (!iframe.src || iframe.src === 'about:blank' || iframe.getAttribute('src') === 'about:blank') {
            iframe.onload = () => syncThemeToFlutter();
            iframe.setAttribute('src', dataSrc);
          } else {
            syncThemeToFlutter();
          }
        }
      }
    }
    window.switchView = switchView;

    /** Fills every .token-value[data-token] in the Brand view with that custom property's current
        resolved value, so the table never hardcodes a hex the active theme might change. */
    function paintBrandTokenValues() {
      const root = getComputedStyle(document.documentElement);
      document.querySelectorAll('.token-value[data-token]').forEach((el) => {
        el.textContent = root.getPropertyValue(el.getAttribute('data-token')).trim();
      });
    }

    function syncViewFromHash() {
      const hash = window.location.hash.replace(/^#/, '');
      const isDesignRoute = window.location.pathname.startsWith('/design');
      const isRootRoute = !isDesignRoute;

      if (isRootRoute && (!hash || hash === 'overview' || hash === 'portal')) {
        document.body.classList.add('portal-mode');
        const titleEl = document.getElementById('topbar-brand-title');
        if (titleEl) titleEl.textContent = 'Joymify Developer Portal';
        document.title = 'Joymify Developer Portal · dev.joymify.com';
        switchView('overview', false);
      } else if (isRootRoute && hash && document.getElementById('view-' + hash)) {
        window.location.replace('/design/#' + hash);
        return;
      } else if (isDesignRoute) {
        document.body.classList.remove('portal-mode');
        const titleEl = document.getElementById('topbar-brand-title');
        if (titleEl) titleEl.textContent = 'Joymify Design';
        if (hash && document.getElementById('view-' + hash)) {
          switchView(hash, false);
        } else {
          switchView('overview', false);
        }
      } else {
        switchView('overview', false);
      }
    }

    // Synchronize view immediately on script load to eliminate theme/overview flash
    syncViewFromHash();
    window.addEventListener('hashchange', syncViewFromHash);
    // Following a link to the current hash fires no hashchange, so close the drawer on every nav pick.
    document.querySelectorAll('.nav-item').forEach(i => i.addEventListener('click', () => toggleMobileMenu(false)));

    function syncThemeToFlutter(theme) {
      if (!theme) {
        theme = document.documentElement.getAttribute('data-theme') || 'light';
      }
      try {
        const iframe = document.getElementById('flutter-hub-iframe');
        if (iframe && iframe.contentWindow && iframe.contentWindow.__joyHub) {
          iframe.contentWindow.__joyHub.setTheme(theme);
        }
      } catch (e) {}
    }
    window.syncThemeToFlutter = syncThemeToFlutter;

    function setFramework(fw) {
      activeFramework = fw;
      document.querySelectorAll('[data-framework]').forEach((btn) => {
        const on = btn.getAttribute('data-framework') === fw;
        btn.classList.toggle('active', on);
        btn.setAttribute('aria-pressed', String(on));
      });
      updateCodeSnippets();
      if (fw === 'flutter') {
        const iframe = document.getElementById('flutter-hub-iframe');
        if (iframe) {
          const dataSrc = iframe.getAttribute('data-src') || '/flutter/index.html';
          if (!iframe.src || iframe.src === 'about:blank' || iframe.getAttribute('src') === 'about:blank') {
            iframe.onload = () => syncThemeToFlutter();
            iframe.setAttribute('src', dataSrc);
          }
        }
      }
      syncThemeToFlutter();
    }

    function handleBtnClick() {
      clickCount++;
      document.getElementById('click-counter').innerText = clickCount;
    }

    let currentBtnVariant = 'solid';
    let currentBtnSize = 'md';

    function setBtnVariant(variant) {
      currentBtnVariant = variant;
      const btn = document.getElementById('demo-btn');
      btn.className = 'joy-button joy-button--' + variant + ' joy-button--' + currentBtnSize;
      ['solid', 'outline', 'ghost', 'danger'].forEach(v => {
        const seg = document.getElementById('seg-v-' + v);
        if (seg) seg.classList.toggle('active', v === variant);
      });
      updateCodeSnippets();
    }

    function setBtnSize(size) {
      currentBtnSize = size;
      const btn = document.getElementById('demo-btn');
      btn.className = 'joy-button joy-button--' + currentBtnVariant + ' joy-button--' + size;
      ['sm', 'md', 'lg'].forEach(s => {
        const seg = document.getElementById('seg-s-' + s);
        if (seg) seg.classList.toggle('active', s === size);
      });
    }

    function toggleBtnLoading() {
      isBtnLoading = !isBtnLoading;
      const btn = document.getElementById('demo-btn');
      const sw = document.getElementById('btn-loading-switch');
      const statusText = document.getElementById('btn-loading-status');
      if (sw) {
        sw.classList.toggle('joy-switch--checked', isBtnLoading);
        sw.setAttribute('aria-checked', isBtnLoading ? 'true' : 'false');
      }
      if (statusText) {
        statusText.innerText = isBtnLoading ? 'Loading Active' : 'Idle';
      }
      if (isBtnLoading) {
        btn.innerHTML = '<span class="joy-button__spinner" aria-hidden="true"><svg class="joy-button__spinner-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="animation: spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg></span><span class="joy-button__label">Loading...</span>';
        btn.disabled = true;
      } else {
        btn.innerHTML = '<span class="joy-button__label">Click Me! (Clicked: <span id="click-counter">' + clickCount + '</span>)</span>';
        btn.disabled = false;
      }
    }

    function updateInputMirror(val) {
      document.getElementById('input-mirror').innerText = val || '(empty)';
    }

    function toggleInputError() {
      const wrapper = document.querySelector('.joy-input-wrapper');
      const sw = document.getElementById('input-error-switch');
      const statusText = document.getElementById('input-error-status');
      const hasErr = wrapper.classList.toggle('joy-input-wrapper--error');
      if (sw) {
        sw.classList.toggle('joy-switch--checked', hasErr);
        sw.setAttribute('aria-checked', hasErr ? 'true' : 'false');
      }
      if (statusText) {
        statusText.innerText = hasErr ? 'Error State Active (Red Border)' : 'Normal (No Error)';
      }
    }

    function toggleSwitch() {
      isSwitchOn = !isSwitchOn;
      const sw = document.getElementById('demo-switch');
      const label = document.getElementById('switch-status-label');
      sw.classList.toggle('joy-switch--checked', isSwitchOn);
      sw.setAttribute('aria-checked', isSwitchOn);
      label.innerText = 'Auto-Refresh: ' + (isSwitchOn ? 'ON' : 'OFF');
    }

    function openDemoModal() {
      hubOpenDialog('demo-modal-container', '.joy-modal__close');
    }

    function closeDemoModal(e) {
      if (e && e.target !== e.currentTarget) return;
      hubCloseDialog('demo-modal-container');
    }

    function selectDropdownAction(action) {
      const out = document.getElementById('dropdown-selection-text');
      if (out) out.innerText = action;
    }

    function handleSelectOrderType(val) {
      const map = {
        limit: 'Limit Order',
        market: 'Market Execution',
        stop_loss: 'Stop Loss Market',
        trailing: 'Trailing Dynamic Stop'
      };
      document.getElementById('demo-select-feedback').innerText = map[val] || val;
      showDemoToast('Order type changed to: ' + (map[val] || val), 'info');
    }

    function handleCheckboxToggle(name, checked) {
      showDemoToast(name + (checked ? ' enabled' : ' disabled'), 'info');
    }

    function handleRadioSelect(label) {
      showDemoToast('TIF set to: ' + label, 'info');
    }

    function openDemoDrawer(placement = 'right') {
      const panel = document.getElementById('demo-drawer-panel');
      const backdrop = document.getElementById('demo-drawer-backdrop');
      backdrop.className = 'joy-drawer-backdrop' + (placement === 'left' ? ' joy-drawer-backdrop--left' : '');
      panel.className = 'joy-drawer ' + (placement === 'left' ? 'joy-drawer--left' : '');
      hubOpenDialog('demo-drawer-container', '.joy-drawer__close');
    }

    function closeDemoDrawer(e) {
      if (e && e.target !== e.currentTarget) return;
      hubCloseDialog('demo-drawer-container');
    }

    function toggleFaq(ref) {
      const item = typeof ref === 'string' ? document.getElementById(ref) : ref && ref.closest('.joy-faq-item');
      if (!item) return;
      const open = item.classList.toggle('joy-faq-item--open');
      const trigger = item.querySelector('[aria-expanded]');
      if (trigger) trigger.setAttribute('aria-expanded', String(open));
      const content = item.querySelector('.joy-faq-item__content');
      if (content) content.hidden = !open;
    }

    function showDemoToast(msg, variant = 'info') {
      const container = document.getElementById('demo-toast-container');
      const toast = document.createElement('div');
      if (variant === 'error') variant = 'danger';
      toast.className = 'joy-toast joy-toast--' + variant;
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.innerHTML = '<div class="joy-toast__body"></div><button type="button" class="joy-toast__close" aria-label="Dismiss notification">' + HUB_ICONS.close + '</button>';
      toast.querySelector('.joy-toast__body').textContent = msg;
      toast.querySelector('.joy-toast__close').addEventListener('click', function () { toast.remove(); });
      container.appendChild(toast);
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 4000);
    }

    // Wave 2 Market Data & Ticker Logic
    let marketData = [
      { pair: 'BTC/USDT', price: 68420.50, change: 3.42, volume: 1420500120, status: 'Active', flash: null },
      { pair: 'ETH/USDT', price: 3540.25, change: -1.18, volume: 854200450, status: 'Active', flash: null },
      { pair: 'SOL/USDT', price: 154.80, change: 8.92, volume: 492100800, status: 'Active', flash: null },
      { pair: 'JOY/USDT', price: 12.45, change: 14.60, volume: 128400500, status: 'Active', flash: null },
      { pair: 'AVAX/USDT', price: 28.90, change: -2.45, volume: 64120300, status: 'Active', flash: null }
    ];
    let marketFilter = '';
    let sortColumnKey = '';
    let sortDirection = 'asc';
    let autoStreamTimer = null;

    function renderMarketTable() {
      const tbody = document.getElementById('market-table-body');
      if (!tbody) return;
      let rows = marketData.filter(d => d.pair.toLowerCase().includes(marketFilter.toLowerCase()));
      if (sortColumnKey) {
        rows.sort((a, b) => {
          let vA = a[sortColumnKey];
          let vB = b[sortColumnKey];
          if (typeof vA === 'string') {
            return sortDirection === 'asc' ? vA.localeCompare(vB) : vB.localeCompare(vA);
          }
          return sortDirection === 'asc' ? vA - vB : vB - vA;
        });
      }

      tbody.innerHTML = rows.map(r => {
        let flashClass = r.flash === 'up' ? 'joy-table-cell--flash-up' : (r.flash === 'down' ? 'joy-table-cell--flash-down' : '');
        let changeColor = r.change >= 0 ? 'var(--joy-status-success-fg)' : 'var(--joy-status-danger-fg)';
        let changeSign = r.change >= 0 ? '+' : '';
        return '<tr>' +
          '<td data-label="Pair" style="font-weight: 600;">' + r.pair + '</td>' +
          '<td data-label="Price (USDT)" style="text-align: right; font-family: var(--joy-font-family-mono);" class="' + flashClass + '">' +
            '$' + r.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
          '</td>' +
          '<td data-label="24h Change" style="text-align: right; font-weight: 600; color: ' + changeColor + ';">' +
            changeSign + r.change.toFixed(2) + '%' +
          '</td>' +
          '<td data-label="24h Vol (USDT)" style="text-align: right; font-family: var(--joy-font-family-mono); color: var(--joy-text-muted);">' +
            '$' + (r.volume / 1e6).toFixed(1) + 'M' +
          '</td>' +
          '<td data-label="Status" style="text-align: center;">' +
            '<span class="joy-badge joy-badge--success joy-badge--sm"><span class="joy-badge__dot"></span> ' + r.status + '</span>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    function simulateRandomTick() {
      const idx = Math.floor(Math.random() * marketData.length);
      const isUp = Math.random() > 0.45;
      const deltaPercent = (Math.random() * 0.8 + 0.1);
      const mult = isUp ? (1 + deltaPercent / 100) : (1 - deltaPercent / 100);
      marketData[idx].price = +(marketData[idx].price * mult).toFixed(2);
      marketData[idx].change += isUp ? deltaPercent : -deltaPercent;
      marketData[idx].flash = isUp ? 'up' : 'down';
      renderMarketTable();
      showDemoToast(marketData[idx].pair + (isUp ? ' + Up' : ' - Down') + ' tick: $' + marketData[idx].price.toFixed(2), isUp ? 'success' : 'warning');
      setTimeout(() => {
        marketData[idx].flash = null;
      }, 1000);
    }

    function toggleAutoStream() {
      const btn = document.getElementById('btn-stream-toggle');
      if (autoStreamTimer) {
        clearInterval(autoStreamTimer);
        autoStreamTimer = null;
        btn.innerText = '<span id="autostream-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg></span> Auto-Stream (Off)';
        btn.className = 'joy-button joy-button--outline joy-button--sm';
      } else {
        autoStreamTimer = setInterval(simulateRandomTick, 1500);
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg> Auto-Stream (Active)';
        btn.className = 'joy-button joy-button--solid joy-button--sm';
      }
    }

    function sortMarketTable(key) {
      if (sortColumnKey === key) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumnKey = key;
        sortDirection = 'asc';
      }
      renderMarketTable();
    }

    function handleMarketFilter(val) {
      marketFilter = val;
      renderMarketTable();
    }

    // Pagination Demo Logic
    let currentDemoPage = 1;
    let demoPageSize = 10;
    const totalOrders = 50;

    function renderPaginationDemo() {
      const list = document.getElementById('paged-records-list');
      const rangeText = document.getElementById('paged-range-text');
      const start = (currentDemoPage - 1) * demoPageSize + 1;
      const end = Math.min(totalOrders, currentDemoPage * demoPageSize);
      if (rangeText) rangeText.innerText = 'Showing Orders ' + start + ' to ' + end + ' of ' + totalOrders;

      if (list) {
        list.innerHTML = '';
        for (let i = start; i <= end; i++) {
          const li = document.createElement('li');
          li.style.padding = '4px 0';
          li.innerHTML = 'Order #ORD-2026-' + String(i).padStart(4, '0') + ' &mdash; <strong>' + (Math.random() * 2 + 0.1).toFixed(3) + ' BTC</strong> @ $68,' + Math.floor(Math.random() * 800 + 100) + ' Limit Fill';
          list.appendChild(li);
        }
      }

      for (let p = 1; p <= 5; p++) {
        const btn = document.getElementById('pg-' + p);
        if (btn) btn.classList.toggle('joy-pagination__btn--active', p === currentDemoPage);
      }
      const prevBtn = document.getElementById('pg-prev');
      const nextBtn = document.getElementById('pg-next');
      if (prevBtn) prevBtn.disabled = currentDemoPage <= 1;
      if (nextBtn) nextBtn.disabled = currentDemoPage >= Math.ceil(totalOrders / demoPageSize);
    }

    function goToDemoPage(p) {
      currentDemoPage = p;
      renderPaginationDemo();
    }

    function handlePageNav(dir) {
      const maxPages = Math.ceil(totalOrders / demoPageSize);
      if (dir === 'prev' && currentDemoPage > 1) currentDemoPage--;
      if (dir === 'next' && currentDemoPage < maxPages) currentDemoPage++;
      renderPaginationDemo();
    }

    function handleDemoPageSize(size) {
      demoPageSize = Number(size);
      currentDemoPage = 1;
      renderPaginationDemo();
    }

    // Skeleton Demo Logic
    let isSkeletonLoading = true;
    function toggleSkeletonLoading() {
      isSkeletonLoading = !isSkeletonLoading;
      document.getElementById('skeleton-card-loading').style.display = isSkeletonLoading ? 'block' : 'none';
      document.getElementById('skeleton-card-loaded').style.display = isSkeletonLoading ? 'none' : 'block';
    }

    // Wave 3 Date Picker & Icon Demo Handlers
    function handleDateChange(val) {
      document.getElementById('single-date-feedback').innerText = val;
      showDemoToast('Date set to: ' + val, 'info');
    }

    function handleRangeChange() {
      const start = document.getElementById('demo-range-start').value;
      const end = document.getElementById('demo-range-end').value;
      const fb = document.getElementById('range-date-feedback');
      if (fb) fb.innerText = (start || '...') + ' to ' + (end || '...');
      showDemoToast('Backtest window set: ' + start + ' to ' + end, 'info');
    }

    function initAntd5DatePickers() {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

      function pad(n) { return n < 10 ? '0' + n : String(n); }
      function fmt(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
      function parse(s) {
        if (!s) return null;
        const p = s.split('-');
        if (p.length !== 3) return null;
        return new Date(parseInt(p[0], 10), parseInt(p[1], 10) - 1, parseInt(p[2], 10));
      }

      function getMatrix(year, month) {
        const todayStr = fmt(new Date());
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrev = new Date(year, month, 0).getDate();
        const cells = [];
        for (let i = firstDay - 1; i >= 0; i--) {
          const d = daysInPrev - i;
          const dt = new Date(year, month - 1, d);
          const s = fmt(dt);
          cells.push({ date: dt, dateString: s, dayNumber: d, isCurrentMonth: false, isToday: s === todayStr });
        }
        for (let d = 1; d <= daysInMonth; d++) {
          const dt = new Date(year, month, d);
          const s = fmt(dt);
          cells.push({ date: dt, dateString: s, dayNumber: d, isCurrentMonth: true, isToday: s === todayStr });
        }
        const remaining = 42 - cells.length;
        for (let d = 1; d <= remaining; d++) {
          const dt = new Date(year, month + 1, d);
          const s = fmt(dt);
          cells.push({ date: dt, dateString: s, dayNumber: d, isCurrentMonth: false, isToday: s === todayStr });
        }
        return cells;
      }

      const allPickers = [];
      function closeAllPickers() {
        allPickers.forEach(p => p.close());
      }

      // Single Picker Factory
      function createSinglePicker(wrapId, inputId, clearId, popoverId, feedbackId, opts = {}) {
        const wrap = document.getElementById(wrapId);
        const input = document.getElementById(inputId);
        const clear = document.getElementById(clearId);
        const popover = document.getElementById(popoverId);
        const feedback = document.getElementById(feedbackId);
        if (!wrap || !popover || !input) return null;

        let year = 2026;
        let month = 8; // September

        function isCellDisabled(d, dateStr) {
          if (opts.min && d < parse(opts.min)) return true;
          if (opts.max && d > parse(opts.max)) return true;
          if (opts.blackoutDates && opts.blackoutDates.includes(dateStr)) return true;
          if (opts.disabledDate && opts.disabledDate(d)) return true;
          return false;
        }

        function render() {
          const curVal = input.value;
          const matrix = getMatrix(year, month);
          const isDemoSingle = popoverId === 'demo-single-calendar-popover';

          let html = '<div class="joy-calendar__pane">' +
            '<div class="joy-calendar__header">' +
              '<div style="display: flex; gap: 2px;">' +
                '<button type="button" class="joy-calendar__nav-btn"' + (isDemoSingle ? ' id="single-prev-year"' : '') + ' data-act="prev-yr" title="Previous Year">' +
                  '<span style="display: inline-flex; letter-spacing: -6px;">' +
                    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
                    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
                  '</span>' +
                '</button>' +
                '<button type="button" class="joy-calendar__nav-btn"' + (isDemoSingle ? ' id="single-prev-month"' : '') + ' data-act="prev-mo" title="Previous Month">' +
                  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
                '</button>' +
              '</div>' +
              '<div class="joy-calendar__title">' +
                '<span>' + monthNames[month] + '</span>' +
                '<span>' + year + '</span>' +
              '</div>' +
              '<div style="display: flex; gap: 2px;">' +
                '<button type="button" class="joy-calendar__nav-btn"' + (isDemoSingle ? ' id="single-next-month"' : '') + ' data-act="next-mo" title="Next Month">' +
                  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
                '</button>' +
                '<button type="button" class="joy-calendar__nav-btn"' + (isDemoSingle ? ' id="single-next-year"' : '') + ' data-act="next-yr" title="Next Year">' +
                  '<span style="display: inline-flex; letter-spacing: -6px;">' +
                    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
                    '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
                  '</span>' +
                '</button>' +
              '</div>' +
            '</div>' +
            '<div class="joy-calendar__grid" role="grid">' +
              weekdays.map(w => '<div class="joy-calendar__weekday">' + w + '</div>').join('') +
              matrix.map(c => {
                const sel = c.dateString === curVal;
                const dis = isCellDisabled(c.date, c.dateString);
                const cls = [
                  'joy-calendar__cell',
                  !c.isCurrentMonth ? 'joy-calendar__cell--muted' : '',
                  c.isToday ? 'joy-calendar__cell--today' : '',
                  sel ? 'joy-calendar__cell--selected' : '',
                  dis ? 'joy-calendar__cell--disabled' : ''
                ].filter(Boolean).join(' ');
                return '<button type="button" class="' + cls + '" data-date="' + c.dateString + '"' + (dis ? ' disabled aria-disabled="true"' : '') + '>' + c.dayNumber + '</button>';
              }).join('') +
            '</div>' +
            '<div class="joy-calendar__footer">' +
              '<button type="button" class="joy-calendar__action-btn"' + (isDemoSingle ? ' id="single-today-btn"' : '') + ' data-act="today">Today</button>' +
            '</div>' +
          '</div>';
          popover.innerHTML = html;

          popover.querySelector('[data-act="prev-yr"]').onclick = (e) => { e.stopPropagation(); year--; render(); };
          popover.querySelector('[data-act="next-yr"]').onclick = (e) => { e.stopPropagation(); year++; render(); };
          popover.querySelector('[data-act="prev-mo"]').onclick = (e) => {
            e.stopPropagation();
            month--;
            if (month < 0) { month = 11; year--; }
            render();
          };
          popover.querySelector('[data-act="next-mo"]').onclick = (e) => {
            e.stopPropagation();
            month++;
            if (month > 11) { month = 0; year++; }
            render();
          };
          popover.querySelector('[data-act="today"]').onclick = (e) => {
            e.stopPropagation();
            const today = new Date();
            const todayStr = fmt(today);
            if (isCellDisabled(today, todayStr)) return;
            input.value = todayStr;
            if (feedback) feedback.innerText = todayStr;
            showDemoToast('Date set to: ' + todayStr, 'info');
            close();
          };
          popover.querySelectorAll('.joy-calendar__cell:not(.joy-calendar__cell--disabled)').forEach(btn => {
            btn.onclick = (e) => {
              e.stopPropagation();
              const dStr = btn.getAttribute('data-date');
              input.value = dStr;
              if (feedback) feedback.innerText = dStr;
              showDemoToast('Date set to: ' + dStr, 'info');
              close();
            };
          });
        }

        function open() {
          closeAllPickers();
          const p = parse(input.value);
          if (p) { year = p.getFullYear(); month = p.getMonth(); }
          render();
          popover.style.display = 'block';
          wrap.classList.add('joy-date-picker--open');
          wrap.setAttribute('aria-expanded', 'true');
        }

        function close() {
          popover.style.display = 'none';
          wrap.classList.remove('joy-date-picker--open');
          wrap.setAttribute('aria-expanded', 'false');
        }

        wrap.onclick = (e) => {
          if (e.target.closest('#' + clearId)) return;
          if (e.target.closest('.joy-calendar-overlay')) return;
          if (popover.style.display === 'block') close();
          else open();
        };
        wrap.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (popover.style.display === 'block') close();
            else open();
          } else if (e.key === 'Escape') {
            close();
          }
        };
        if (clear) {
          clear.onclick = (e) => {
            e.stopPropagation();
            input.value = '';
            if (feedback) feedback.innerText = '...';
            showDemoToast('Date cleared', 'info');
          };
        }

        const instance = { close, popover, wrap };
        allPickers.push(instance);
        return instance;
      }

      // Range Picker Factory
      function createRangePicker(wrapId, startId, endId, clearId, popoverId, feedbackId, opts = {}) {
        const wrap = document.getElementById(wrapId);
        const startInput = document.getElementById(startId);
        const endInput = document.getElementById(endId);
        const clear = document.getElementById(clearId);
        const popover = document.getElementById(popoverId);
        const feedback = document.getElementById(feedbackId);
        if (!wrap || !popover || !startInput || !endInput) return null;

        let leftYear = 2026;
        let leftMonth = 0; // January
        let pickingStart = null;
        let hoverDate = null;

        function isDateInRangeBlackout(d) {
          if (!opts.blackoutRanges) return false;
          for (const [rStart, rEnd] of opts.blackoutRanges) {
            const s = parse(rStart);
            const e = parse(rEnd);
            if (s && e && d >= s && d <= e) return true;
          }
          return false;
        }

        function isSingleDisabled(d, dateStr) {
          if (opts.min && d < parse(opts.min)) return true;
          if (opts.max && d > parse(opts.max)) return true;
          if (opts.blackoutDates && opts.blackoutDates.includes(dateStr)) return true;
          if (isDateInRangeBlackout(d)) return true;
          if (opts.disabledDate && opts.disabledDate(d)) return true;
          return false;
        }

        function isCrossBlackoutInvalid(targetDate) {
          if (!opts.forbidCrossBlackout || !pickingStart) return false;
          const s = parse(pickingStart);
          if (!s) return false;
          const [d1, d2] = s < targetDate ? [s, targetDate] : [targetDate, s];
          const cur = new Date(d1);
          cur.setDate(cur.getDate() + 1);
          while (cur < d2) {
            if (isSingleDisabled(cur, fmt(cur))) return true;
            cur.setDate(cur.getDate() + 1);
          }
          return false;
        }

        function isRangeCellDisabled(d, dateStr) {
          if (isSingleDisabled(d, dateStr)) return true;
          if (pickingStart && isCrossBlackoutInvalid(d)) return true;
          return false;
        }

        function render() {
          const curStart = pickingStart || startInput.value;
          const curEnd = pickingStart ? '' : endInput.value;
          const sDate = parse(curStart);
          const eDate = parse(curEnd);
          const hDate = hoverDate;

          const leftMatrix = getMatrix(leftYear, leftMonth);
          const rightMonth = leftMonth === 11 ? 0 : leftMonth + 1;
          const rightYear = leftMonth === 11 ? leftYear + 1 : leftYear;
          const rightMatrix = getMatrix(rightYear, rightMonth);
          const isDemoRange = popoverId === 'demo-range-calendar-popover';

          function cellClass(c) {
            const d = c.date;
            const isStart = sDate && c.dateString === curStart;
            const isEnd = eDate && c.dateString === curEnd;
            let inRange = false;
            if (sDate && eDate) {
              inRange = d > sDate && d < eDate;
            } else if (sDate && !eDate && hDate) {
              inRange = (d > sDate && d < hDate) || (d > hDate && d < sDate);
            }
            const isHoverEnd = sDate && !eDate && hDate && c.dateString === fmt(hDate) && hDate > sDate;
            const dis = isRangeCellDisabled(c.date, c.dateString);

            return [
              'joy-calendar__cell',
              !c.isCurrentMonth ? 'joy-calendar__cell--muted' : '',
              c.isToday ? 'joy-calendar__cell--today' : '',
              isStart ? 'joy-calendar__cell--selected joy-calendar__cell--range-start' : '',
              isEnd || isHoverEnd ? 'joy-calendar__cell--selected joy-calendar__cell--range-end' : '',
              inRange && !isStart && !isEnd ? 'joy-calendar__cell--in-range' : '',
              dis ? 'joy-calendar__cell--disabled' : ''
            ].filter(Boolean).join(' ');
          }

          const presets = [
            { label: 'Today', val: () => { const t = fmt(new Date()); return [t, t]; } },
            { label: 'Last 7 Days', val: () => { const t = new Date(); const d = new Date(); d.setDate(d.getDate() - 6); return [fmt(d), fmt(t)]; } },
            { label: 'Last 30 Days', val: () => { const t = new Date(); const d = new Date(); d.setDate(d.getDate() - 29); return [fmt(d), fmt(t)]; } },
            { label: 'Month to Date', val: () => { const t = new Date(); const m = new Date(t.getFullYear(), t.getMonth(), 1); return [fmt(m), fmt(t)]; } },
            { label: 'Year to Date', val: () => { const t = new Date(); const y = new Date(t.getFullYear(), 0, 1); return [fmt(y), fmt(t)]; } }
          ];

          let html = '<div class="joy-calendar__body">' +
            '<div class="joy-calendar__pane">' +
              '<div class="joy-calendar__header">' +
                '<div style="display: flex; gap: 2px;">' +
                  '<button type="button" class="joy-calendar__nav-btn"' + (isDemoRange ? ' id="range-prev-year"' : '') + ' data-act="prev-yr" title="Previous Year">' +
                    '<span style="display: inline-flex; letter-spacing: -6px;">' +
                      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
                      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
                    '</span>' +
                  '</button>' +
                  '<button type="button" class="joy-calendar__nav-btn"' + (isDemoRange ? ' id="range-prev-month"' : '') + ' data-act="prev-mo" title="Previous Month">' +
                    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>' +
                  '</button>' +
                '</div>' +
                '<div class="joy-calendar__title">' +
                  '<span>' + monthNames[leftMonth] + '</span>' +
                  '<span>' + leftYear + '</span>' +
                '</div>' +
                '<div style="width: 24px;"></div>' +
              '</div>' +
              '<div class="joy-calendar__grid" role="grid">' +
                weekdays.map(w => '<div class="joy-calendar__weekday">' + w + '</div>').join('') +
                leftMatrix.map(c => {
                  const dis = isRangeCellDisabled(c.date, c.dateString);
                  return '<button type="button" class="' + cellClass(c) + '" data-date="' + c.dateString + '"' + (dis ? ' disabled aria-disabled="true"' : '') + '>' + c.dayNumber + '</button>';
                }).join('') +
              '</div>' +
            '</div>' +
            '<div class="joy-calendar__pane">' +
              '<div class="joy-calendar__header">' +
                '<div style="width: 24px;"></div>' +
                '<div class="joy-calendar__title">' +
                  '<span>' + monthNames[rightMonth] + '</span>' +
                  '<span>' + rightYear + '</span>' +
                '</div>' +
                '<div style="display: flex; gap: 2px;">' +
                  '<button type="button" class="joy-calendar__nav-btn"' + (isDemoRange ? ' id="range-next-month"' : '') + ' data-act="next-mo" title="Next Month">' +
                    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
                  '</button>' +
                  '<button type="button" class="joy-calendar__nav-btn"' + (isDemoRange ? ' id="range-next-year"' : '') + ' data-act="next-yr" title="Next Year">' +
                    '<span style="display: inline-flex; letter-spacing: -6px;">' +
                      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
                      '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>' +
                    '</span>' +
                  '</button>' +
                '</div>' +
              '</div>' +
              '<div class="joy-calendar__grid" role="grid">' +
                weekdays.map(w => '<div class="joy-calendar__weekday">' + w + '</div>').join('') +
                rightMatrix.map(c => {
                  const dis = isRangeCellDisabled(c.date, c.dateString);
                  return '<button type="button" class="' + cellClass(c) + '" data-date="' + c.dateString + '"' + (dis ? ' disabled aria-disabled="true"' : '') + '>' + c.dayNumber + '</button>';
                }).join('') +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="joy-calendar__footer">' +
            '<div class="joy-calendar__presets">' +
              presets.map((p, idx) => '<button type="button" class="joy-calendar__preset-btn" data-preset="' + idx + '">' + p.label + '</button>').join('') +
            '</div>' +
          '</div>';
          popover.innerHTML = html;

          popover.querySelector('[data-act="prev-yr"]').onclick = (e) => { e.stopPropagation(); leftYear--; render(); };
          popover.querySelector('[data-act="next-yr"]').onclick = (e) => { e.stopPropagation(); leftYear++; render(); };
          popover.querySelector('[data-act="prev-mo"]').onclick = (e) => {
            e.stopPropagation();
            leftMonth--;
            if (leftMonth < 0) { leftMonth = 11; leftYear--; }
            render();
          };
          popover.querySelector('[data-act="next-mo"]').onclick = (e) => {
            e.stopPropagation();
            leftMonth++;
            if (leftMonth > 11) { leftMonth = 0; leftYear++; }
            render();
          };

          popover.querySelectorAll('.joy-calendar__preset-btn').forEach(btn => {
            btn.onclick = (e) => {
              e.stopPropagation();
              const idx = parseInt(btn.getAttribute('data-preset'), 10);
              const res = presets[idx].val();
              const pStart = parse(res[0]);
              const pEnd = parse(res[1]);
              if (pStart && isSingleDisabled(pStart, res[0])) return;
              if (pEnd && isSingleDisabled(pEnd, res[1])) return;
              startInput.value = res[0];
              endInput.value = res[1];
              if (feedback) feedback.innerText = res[0] + ' to ' + res[1];
              showDemoToast('Interval set: ' + res[0] + ' to ' + res[1], 'info');
              close();
            };
          });

          function updateHoverCells() {
            popover.querySelectorAll('.joy-calendar__cell').forEach(cBtn => {
              const dateStr = cBtn.getAttribute('data-date');
              const d = parse(dateStr);
              let inRange = false;
              let isHoverEnd = false;
              if (pickingStart && hoverDate && d) {
                const sDate = parse(pickingStart);
                if (sDate) {
                  inRange = (d > sDate && d < hoverDate) || (d > hoverDate && d < sDate);
                  isHoverEnd = dateStr === fmt(hoverDate) && hoverDate.getTime() !== sDate.getTime();
                }
              }
              cBtn.classList.toggle('joy-calendar__cell--in-range', inRange);
              cBtn.classList.toggle('joy-calendar__cell--range-end', isHoverEnd);
            });
          }

          popover.querySelectorAll('.joy-calendar__cell:not(.joy-calendar__cell--disabled)').forEach(btn => {
            btn.onmouseenter = () => {
              if (pickingStart) {
                hoverDate = parse(btn.getAttribute('data-date'));
                updateHoverCells();
              }
            };
            btn.onclick = (e) => {
              e.stopPropagation();
              const clicked = btn.getAttribute('data-date');
              if (!pickingStart) {
                pickingStart = clicked;
                hoverDate = null;
                render();
              } else {
                let s = pickingStart;
                let end = clicked;
                if (s > end) { const tmp = s; s = end; end = tmp; }
                startInput.value = s;
                endInput.value = end;
                if (feedback) feedback.innerText = s + ' to ' + end;
                showDemoToast('Interval set: ' + s + ' to ' + end, 'info');
                close();
              }
            };
          });
        }

        function open() {
          closeAllPickers();
          pickingStart = null;
          hoverDate = null;
          const p = parse(startInput.value);
          if (p) { leftYear = p.getFullYear(); leftMonth = p.getMonth(); }
          render();
          popover.style.display = 'block';
          wrap.classList.add('joy-date-range-picker--open');
          wrap.setAttribute('aria-expanded', 'true');
        }

        function close() {
          pickingStart = null;
          hoverDate = null;
          popover.style.display = 'none';
          wrap.classList.remove('joy-date-range-picker--open');
          wrap.setAttribute('aria-expanded', 'false');
        }

        wrap.onclick = (e) => {
          if (e.target.closest('#' + clearId)) return;
          if (e.target.closest('.joy-calendar-overlay')) return;
          if (popover.style.display === 'block') close();
          else open();
        };
        wrap.onkeydown = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (popover.style.display === 'block') close();
            else open();
          } else if (e.key === 'Escape') {
            close();
          }
        };
        if (clear) {
          clear.onclick = (e) => {
            e.stopPropagation();
            startInput.value = '';
            endInput.value = '';
            if (feedback) feedback.innerText = '... to ...';
            showDemoToast('Interval cleared', 'info');
          };
        }

        const instance = { close, popover, wrap };
        allPickers.push(instance);
        return instance;
      }

      // Initialize all 4 pickers
      // 1. Standard Single Picker
      createSinglePicker('demo-date-picker-wrap', 'demo-single-date', 'demo-single-date-clear', 'demo-single-calendar-popover', 'single-date-feedback');

      // 2. Constrained Single Picker (Min: 2026-09-05, Max: 2026-09-25, Blackout: 09-11 & 09-18, No Weekends)
      createSinglePicker('demo-constrained-date-picker-wrap', 'demo-constrained-date', 'demo-constrained-date-clear', 'demo-constrained-calendar-popover', 'constrained-date-feedback', {
        min: '2026-09-05',
        max: '2026-09-25',
        blackoutDates: ['2026-09-11', '2026-09-18'],
        disabledDate: (d) => d.getDay() === 0 || d.getDay() === 6
      });

      // 3. Financial Range Picker
      createRangePicker('demo-range-picker-wrap', 'demo-range-start', 'demo-range-end', 'demo-range-clear', 'demo-range-calendar-popover', 'range-date-feedback');

      // 4. Blackout-Restricted Range Picker (Blackout: 2026-01-12 to 2026-01-16, Forbid cross-blackout)
      createRangePicker('demo-blackout-range-picker-wrap', 'demo-blackout-start', 'demo-blackout-end', 'demo-blackout-clear', 'demo-blackout-range-calendar-popover', 'blackout-range-feedback', {
        blackoutRanges: [['2026-01-12', '2026-01-16']],
        forbidCrossBlackout: true
      });

      document.addEventListener('click', (e) => {
        allPickers.forEach(p => {
          if (p.popover && p.popover.style.display === 'block') {
            if (!p.wrap.contains(e.target) && !p.popover.contains(e.target)) {
              p.close();
            }
          }
        });
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeAllPickers();
        }
      });
    }

    function copyIconName(name) {
      const code = activeFramework === 'svelte'
        ? "import { " + name + " } from '@montionugera/joy-icons';"
        : activeFramework === 'flutter'
        ? "JoyIcons." + (name.charAt(0).toLowerCase() + name.slice(1))
        : "import { " + name + " } from '@montionugera/joy-icons/react';";
      navigator.clipboard.writeText(code).then(() => {
        showDemoToast('Copied: ' + code, 'success');
        const banner = document.getElementById('copy-toast-banner');
        if (banner) {
          banner.style.display = 'inline';
          setTimeout(() => banner.style.display = 'none', 2000);
        }
      }).catch(() => {
        showDemoToast('Import: ' + code, 'info');
      });
    }

    // ── Wave 3 (F-038) hub handlers: aspect views, overlays and charts ──
    const HUB_ICONS = ${JSON.stringify({ close: iconSvg("Close"), chevronLeft: iconSvg("ChevronLeft"), chevronRight: iconSvg("ChevronRight"), sortNone: hubSvg.sortNone, sortAsc: hubSvg.sortAsc, sortDesc: hubSvg.sortDesc })};
    const HUB_MATRIX_CHARTS = ${JSON.stringify(hubMatrixCharts)};

    function toggleHubTag(el) {
      const on = el.getAttribute('aria-checked') !== 'true';
      el.setAttribute('aria-checked', String(on));
      el.classList.toggle('joy-tag--checked', on);
    }

    function hubSortTable(th) {
      const table = th.closest('table');
      const idx = Array.from(th.parentElement.children).indexOf(th);
      const next = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
      table.querySelectorAll('th.joy-table-th--sortable').forEach(function (h) {
        h.setAttribute('aria-sort', 'none');
        h.classList.remove('joy-table-th--sorted-asc', 'joy-table-th--sorted-desc');
        h.querySelector('.joy-table-sort-icon').innerHTML = HUB_ICONS.sortNone;
      });
      th.setAttribute('aria-sort', next);
      th.classList.add(next === 'ascending' ? 'joy-table-th--sorted-asc' : 'joy-table-th--sorted-desc');
      th.querySelector('.joy-table-sort-icon').innerHTML = next === 'ascending' ? HUB_ICONS.sortAsc : HUB_ICONS.sortDesc;
      const tbody = table.tBodies[0];
      const rows = Array.from(tbody.rows);
      const text = function (r) { return r.cells[idx].textContent.trim(); };
      rows.sort(function (a, b) {
        const x = text(a);
        const y = text(b);
        const nx = parseFloat(x.replace(/[^0-9.-]/g, ''));
        const ny = parseFloat(y.replace(/[^0-9.-]/g, ''));
        const c = (!isNaN(nx) && !isNaN(ny)) ? nx - ny : x.localeCompare(y);
        return next === 'ascending' ? c : -c;
      });
      rows.forEach(function (r) { tbody.appendChild(r); });
    }

    function hubSelectTab(btn) {
      const root = btn.closest('[data-hub-tabs]');
      root.querySelectorAll('[role="tab"]').forEach(function (t) {
        const on = t === btn;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        t.classList.toggle('joy-tab-btn--active', on);
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    }

    function hubTabKey(e, btn) {
      const tabs = Array.from(btn.parentElement.querySelectorAll('[role="tab"]'));
      let i = tabs.indexOf(btn);
      if (e.key === 'ArrowRight') i = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') i = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') i = 0;
      else if (e.key === 'End') i = tabs.length - 1;
      else return;
      e.preventDefault();
      tabs[i].focus();
      hubSelectTab(tabs[i]);
    }

    function hubTip(id, show) {
      const tip = document.getElementById(id);
      if (tip) tip.hidden = !show;
    }

    // Overlay panels (Popconfirm, Dropdown) follow the openOverlay contract: .joy-overlay + position: fixed,
    // or a bottom sheet on phones. Being fixed, they escape overflow: hidden ancestors such as .joy-modal.
    function hubPlaceOverlay(anchor, panel) {
      panel.classList.add('joy-overlay');
      panel.style.position = 'fixed';
      const narrow = window.innerWidth < 480 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
      if (narrow) {
        panel.classList.add('joy-overlay--sheet');
        panel.classList.remove('joy-overlay--above');
        panel.style.top = '';
        panel.style.left = '';
        panel.style.minWidth = '';
        return;
      }
      panel.classList.remove('joy-overlay--sheet');
      const a = anchor.getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      const left = Math.min(Math.max(a.left, 8), Math.max(8, window.innerWidth - p.width - 8));
      let top = a.bottom + 4;
      const above = top + p.height > window.innerHeight - 8 && a.top - 4 - p.height >= 8;
      if (above) top = a.top - 4 - p.height;
      panel.classList.toggle('joy-overlay--above', above);
      panel.style.top = top + 'px';
      panel.style.left = left + 'px';
      panel.style.minWidth = a.width + 'px';
    }

    // restore: true refocuses the opener when focus was inside the panel; 'force' always refocuses it (Escape).
    function hubClosePanel(panel, restore) {
      const trigger = panel.parentElement.querySelector('[aria-expanded]');
      const focusInside = panel.contains(document.activeElement);
      panel.hidden = true;
      panel.classList.remove('joy-overlay', 'joy-overlay--sheet', 'joy-overlay--above');
      ['position', 'top', 'left', 'minWidth'].forEach(function (k) { panel.style[k] = ''; });
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (restore && trigger && (restore === 'force' || focusInside)) trigger.focus();
    }

    function hubClosePanels(except, restore) {
      let any = false;
      document.querySelectorAll('[data-hub-panel]:not([hidden])').forEach(function (p) {
        if (p !== except) {
          hubClosePanel(p, restore);
          any = true;
        }
      });
      return any;
    }

    function hubTogglePanel(trigger, panel) {
      if (!panel.hidden) {
        hubClosePanel(panel, true);
        return;
      }
      hubClosePanels();
      panel.hidden = false;
      trigger.setAttribute('aria-expanded', 'true');
      hubPlaceOverlay(trigger, panel);
      // Like the components: focus moves into the panel (first item / first button)
      const first = panel.matches('.joy-dropdown') ? panel.querySelector('[role="menuitem"]:not([disabled])') : panel.querySelector('button:not([disabled])');
      if (first) first.focus({ preventScroll: true });
    }

    function toggleHubPopconfirm(btn) {
      hubTogglePanel(btn, btn.closest('.joy-popconfirm').querySelector('.joy-popconfirm__panel'));
    }
    function closeHubPopconfirm(el) {
      hubClosePanel(el.closest('.joy-popconfirm__panel'), true);
    }
    function confirmHubPopconfirm(el) {
      closeHubPopconfirm(el);
      showDemoToast('Action confirmed', 'success');
    }
    function toggleHubDropdown(trigger) {
      hubTogglePanel(trigger, trigger.parentElement.querySelector('.joy-dropdown'));
    }
    function selectHubDropdownItem(btn, key) {
      hubClosePanel(btn.closest('.joy-dropdown'), true);
      showDemoToast('Dropdown action: ' + key, 'info');
    }

    function filterHubDropdown(input, id) {
      const dropdown = document.getElementById(id);
      if (!dropdown) return;
      const q = (input.value || '').trim().toLowerCase();
      const items = dropdown.querySelectorAll('.joy-dropdown__item');
      const empty = dropdown.querySelector('.joy-dropdown__empty');
      let visible = 0;
      items.forEach(el => {
        const text = el.textContent.toLowerCase();
        const match = !q || text.includes(q);
        el.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      if (empty) empty.style.display = (q && visible === 0) ? 'block' : 'none';
    }

    function toggleHubSelect(btn) {
      const wrapper = btn.closest('.joy-select-wrapper');
      if (!wrapper) return;
      const listbox = wrapper.querySelector('.joy-select__listbox');
      if (!listbox) return;
      const isOpen = listbox.style.display !== 'none';
      if (isOpen) {
        listbox.style.display = 'none';
        btn.setAttribute('aria-expanded', 'false');
      } else {
        listbox.style.display = 'block';
        btn.setAttribute('aria-expanded', 'true');
        const searchInput = listbox.querySelector('.joy-select__search');
        if (searchInput) {
          setTimeout(() => searchInput.focus(), 50);
        }
      }
    }

    function selectHubOption(opt, wrapperId, valueText) {
      const wrapper = document.getElementById(wrapperId);
      if (!wrapper) return;
      const valEl = wrapper.querySelector('.joy-select__value');
      if (valEl) valEl.textContent = valueText;
      wrapper.querySelectorAll('.joy-select__option').forEach(o => {
        o.classList.remove('joy-select__option--active');
        o.setAttribute('aria-selected', 'false');
      });
      opt.classList.add('joy-select__option--active');
      opt.setAttribute('aria-selected', 'true');
      const listbox = wrapper.querySelector('.joy-select__listbox');
      if (listbox) listbox.style.display = 'none';
      const btn = wrapper.querySelector('.joy-select');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      showDemoToast('Selected instrument: ' + valueText, 'info');
    }

    function filterHubSelect(input, listboxId) {
      const listbox = document.getElementById(listboxId);
      if (!listbox) return;
      const q = (input.value || '').trim().toLowerCase();
      const options = listbox.querySelectorAll('.joy-select__option');
      const empty = listbox.querySelector('.joy-select__empty');
      let visible = 0;
      options.forEach(el => {
        const text = el.textContent.toLowerCase();
        const match = !q || text.includes(q);
        el.style.display = match ? '' : 'none';
        if (match) visible++;
      });
      if (empty) empty.style.display = (q && visible === 0) ? 'block' : 'none';
    }

    function toggleHubCascader(id) {
      const root = document.getElementById(id);
      if (!root) return;
      const panel = document.getElementById(id + '-panel');
      const ctrl = root.querySelector('.joy-cascader__control');
      if (!panel || !ctrl) return;
      const isOpen = panel.style.display !== 'none';
      if (isOpen) {
        panel.style.display = 'none';
        root.classList.remove('joy-cascader--open');
        ctrl.setAttribute('aria-expanded', 'false');
      } else {
        panel.style.display = 'block';
        root.classList.add('joy-cascader--open');
        ctrl.setAttribute('aria-expanded', 'true');
      }
    }

    function hoverHubCascaderCol(id, colIdx, key) {
      const root = document.getElementById(id);
      if (!root) return;
      const cols = root.querySelectorAll('.joy-cascader__column');
      if (colIdx >= cols.length) return;
      const items = cols[colIdx].querySelectorAll('.joy-cascader__item');
      items.forEach(it => it.classList.remove('joy-cascader__item--active'));
      const target = event.currentTarget || event.target.closest('.joy-cascader__item');
      if (target) target.classList.add('joy-cascader__item--active');
    }

    function selectHubCascaderLeaf(id, fullPath) {
      const valEl = document.getElementById(id + '-val');
      if (valEl) valEl.textContent = fullPath;
      const root = document.getElementById(id);
      const panel = document.getElementById(id + '-panel');
      const ctrl = root ? root.querySelector('.joy-cascader__control') : null;
      if (panel) panel.style.display = 'none';
      if (root) root.classList.remove('joy-cascader--open');
      if (ctrl) ctrl.setAttribute('aria-expanded', 'false');
      showDemoToast('Cascader selected: ' + fullPath, 'info');
    }

    function clearHubCascader(e, id) {
      e.stopPropagation();
      const valEl = document.getElementById(id + '-val');
      if (valEl) valEl.textContent = 'Select market path...';
      showDemoToast('Cascader cleared', 'info');
    }

    function toggleHubTreeSelect(id) {
      const root = document.getElementById(id);
      if (!root) return;
      const panel = document.getElementById(id + '-panel');
      const ctrl = root.querySelector('.joy-treeselect__control');
      if (!panel || !ctrl) return;
      const isOpen = panel.style.display !== 'none';
      if (isOpen) {
        panel.style.display = 'none';
        root.classList.remove('joy-treeselect--open');
        ctrl.setAttribute('aria-expanded', 'false');
      } else {
        panel.style.display = 'block';
        root.classList.add('joy-treeselect--open');
        ctrl.setAttribute('aria-expanded', 'true');
        const searchInput = document.getElementById(id + '-search');
        if (searchInput) setTimeout(() => searchInput.focus(), 50);
      }
    }

    function filterHubTreeSelect(input, id) {
      const q = (input.value || '').trim().toLowerCase();
      const root = document.getElementById(id);
      if (!root) return;
      const nodes = root.querySelectorAll('.joy-treeselect__node');
      const empty = document.getElementById(id + '-empty');
      let visible = 0;
      nodes.forEach(node => {
        const title = (node.getAttribute('data-title') || '').toLowerCase();
        const match = !q || title.includes(q);
        if (match) {
          node.style.display = '';
          visible++;
          const parentKey = node.getAttribute('data-parent');
          if (parentKey && q) {
            const parentNode = root.querySelector('.joy-treeselect__node[data-key="' + parentKey + '"]');
            if (parentNode) {
              parentNode.style.display = '';
              const toggleBtn = parentNode.querySelector('.joy-treeselect__node-toggle');
              if (toggleBtn) toggleBtn.classList.add('joy-treeselect__node-toggle--expanded');
            }
          }
        } else {
          const key = node.getAttribute('data-key');
          const hasMatchingChild = q && Array.from(nodes).some(n => n.getAttribute('data-parent') === key && (n.getAttribute('data-title') || '').toLowerCase().includes(q));
          if (hasMatchingChild) {
            node.style.display = '';
            visible++;
            const toggleBtn = node.querySelector('.joy-treeselect__node-toggle');
            if (toggleBtn) toggleBtn.classList.add('joy-treeselect__node-toggle--expanded');
          } else {
            node.style.display = q ? 'none' : '';
          }
        }
      });
      if (empty) empty.style.display = (q && visible === 0) ? 'block' : 'none';
    }

    function toggleHubTreeNodeCollapse(e, btn) {
      e.stopPropagation();
      btn.classList.toggle('joy-treeselect__node-toggle--expanded');
      const parentNode = btn.closest('.joy-treeselect__node');
      if (!parentNode) return;
      const key = parentNode.getAttribute('data-key');
      const isExpanded = btn.classList.contains('joy-treeselect__node-toggle--expanded');
      const treeBody = parentNode.closest('.joy-treeselect__tree-body');
      if (treeBody && key) {
        treeBody.querySelectorAll('.joy-treeselect__node[data-parent="' + key + '"]').forEach(child => {
          child.style.display = isExpanded ? '' : 'none';
        });
      }
    }

    function toggleHubTreeNodeSelection(e, id, key, label) {
      if (e.target.closest('.joy-treeselect__node-toggle')) return;
      const nodeEl = e.currentTarget || e.target.closest('.joy-treeselect__node');
      if (!nodeEl) return;
      const isSelected = nodeEl.classList.toggle('joy-treeselect__node--selected');
      const checkbox = nodeEl.querySelector('.joy-treeselect__node-checkbox');
      if (checkbox) {
        checkbox.innerHTML = isSelected ? ${JSON.stringify(checkIcon)} : '';
      }
      const tagsContainer = document.getElementById(id + '-tags');
      if (tagsContainer) {
        let existingTag = tagsContainer.querySelector('.joy-treeselect__tag[data-val="' + key + '"]');
        if (isSelected && !existingTag) {
          const newTag = document.createElement('span');
          newTag.className = 'joy-treeselect__tag';
          newTag.setAttribute('data-val', key);
          newTag.innerHTML = label + '<button type="button" class="joy-treeselect__tag-remove" aria-label="Remove ' + label + '" onclick="removeHubTreeTag(event, \\'' + id + '\\', \\'' + key + '\\')">' + ${JSON.stringify(closeIcon)} + '</button>';
          tagsContainer.appendChild(newTag);
        } else if (!isSelected && existingTag) {
          existingTag.remove();
        }
      }
      showDemoToast((isSelected ? 'Selected ' : 'Deselected ') + label, 'info');
    }

    function removeHubTreeTag(e, id, key) {
      e.stopPropagation();
      const root = document.getElementById(id);
      if (!root) return;
      const tag = root.querySelector('.joy-treeselect__tag[data-val="' + key + '"]');
      if (tag) tag.remove();
      const node = root.querySelector('.joy-treeselect__node[data-key="' + key + '"]');
      if (node) {
        node.classList.remove('joy-treeselect__node--selected');
        const cb = node.querySelector('.joy-treeselect__node-checkbox');
        if (cb) cb.innerHTML = '';
      }
    }

    function clearHubTreeSelect(e, id) {
      e.stopPropagation();
      const root = document.getElementById(id);
      if (!root) return;
      const tagsContainer = document.getElementById(id + '-tags');
      if (tagsContainer) tagsContainer.innerHTML = '';
      root.querySelectorAll('.joy-treeselect__node--selected').forEach(node => {
        node.classList.remove('joy-treeselect__node--selected');
        const cb = node.querySelector('.joy-treeselect__node-checkbox');
        if (cb) cb.innerHTML = '';
      });
      showDemoToast('TreeSelect cleared', 'info');
    }

    document.addEventListener('pointerdown', function (e) {
      document.querySelectorAll('[data-hub-panel]:not([hidden])').forEach(function (p) {
        const root = p.closest('.joy-popconfirm, .joy-dropdown-wrapper');
        if (!root || !root.contains(e.target)) hubClosePanel(p);
      });
      document.querySelectorAll('.joy-select-wrapper').forEach(function (sw) {
        if (!sw.contains(e.target)) {
          const lb = sw.querySelector('.joy-select__listbox');
          if (lb) lb.style.display = 'none';
          const b = sw.querySelector('.joy-select');
          if (b) b.setAttribute('aria-expanded', 'false');
        }
      });
      document.querySelectorAll('.joy-cascader').forEach(function (c) {
        if (!c.contains(e.target)) {
          const p = c.querySelector('.joy-cascader__panel');
          if (p) p.style.display = 'none';
          c.classList.remove('joy-cascader--open');
          const ctrl = c.querySelector('.joy-cascader__control');
          if (ctrl) ctrl.setAttribute('aria-expanded', 'false');
        }
      });
      document.querySelectorAll('.joy-treeselect').forEach(function (ts) {
        if (!ts.contains(e.target)) {
          const p = ts.querySelector('.joy-treeselect__panel');
          if (p) p.style.display = 'none';
          ts.classList.remove('joy-treeselect--open');
          const ctrl = ts.querySelector('.joy-treeselect__control');
          if (ctrl) ctrl.setAttribute('aria-expanded', 'false');
        }
      });
    });
    window.addEventListener('resize', function () { hubClosePanels(); });
    document.addEventListener('scroll', function (e) {
      const t = e.target;
      if (t && t.closest && t.closest('[data-hub-panel]')) return;
      hubClosePanels();
    }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      let tipHidden = false;
      document.querySelectorAll('.joy-tooltip[role="tooltip"]:not([hidden]):not([data-static])').forEach(function (t) {
        t.hidden = true;
        tipHidden = true;
      });
      if (tipHidden) return;
      if (hubClosePanels(null, 'force')) return;
      const open = Array.from(document.querySelectorAll('[data-hub-dialog]')).filter(function (c) { return c.style.display === 'block'; }).pop();
      if (open) hubCloseDialog(open.id);
    });

    // Dropdown menu: arrow keys, Home/End; Tab leaves the menu (refocusing the trigger first)
    document.addEventListener('keydown', function (e) {
      const menu = e.target.closest && e.target.closest('.joy-dropdown[data-hub-panel]');
      if (!menu) return;
      const items = Array.from(menu.querySelectorAll('[role="menuitem"]:not([disabled])'));
      const i = items.indexOf(document.activeElement);
      let n;
      if (e.key === 'ArrowDown') n = (i + 1) % items.length;
      else if (e.key === 'ArrowUp') n = (i - 1 + items.length) % items.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = items.length - 1;
      else if (e.key === 'Tab') { hubClosePanel(menu, 'force'); return; }
      else return;
      e.preventDefault();
      items[n].focus();
    });

    // Modal, Drawer and ImagePreview trap Tab inside the open dialog
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Tab') return;
      const open = Array.from(document.querySelectorAll('[data-hub-dialog]')).filter(function (c) { return c.style.display === 'block'; }).pop();
      if (!open) return;
      const root = open.querySelector('[role="dialog"]');
      const focusable = Array.from(root.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(function (el) { return !el.closest('[hidden]') && el.getClientRects().length > 0; });
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (!root.contains(active)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    });

    function hubOpenDialog(containerId, focusSelector) {
      const container = document.getElementById(containerId);
      container._hubOpener = document.activeElement;
      container.style.display = 'block';
      document.body.classList.add('hub-dialog-open');
      const target = container.querySelector(focusSelector);
      if (target) target.focus();
    }
    function hubCloseDialog(containerId) {
      hubClosePanels();
      const container = document.getElementById(containerId);
      container.style.display = 'none';
      const stillOpen = Array.from(document.querySelectorAll('[data-hub-dialog]')).some(function (c) { return c.style.display === 'block'; });
      document.body.classList.toggle('hub-dialog-open', stillOpen);
      const opener = container._hubOpener;
      container._hubOpener = null;
      if (opener && opener.isConnected && opener.focus) opener.focus();
    }

    // Image and ImagePreview: pictures are SVG data URIs built from theme tokens (an img cannot resolve var()).
    function hubImageUri(kind) {
      const s = getComputedStyle(document.documentElement);
      const v = function (name) { return s.getPropertyValue(name).trim(); };
      const bg = v('--joy-surface-sunken');
      const accent = v('--joy-accent-default');
      const bull = v('--joy-status-success-fg');
      const bear = v('--joy-status-danger-fg');
      const line = v('--joy-border-default');
      let art;
      if (kind === 'b') {
        art = '<rect x="30" y="40" width="70" height="160" fill="' + bull + '"/><rect x="110" y="90" width="70" height="110" fill="' + accent + '"/><rect x="190" y="60" width="70" height="140" fill="' + bear + '"/>';
      } else if (kind === 'fallback') {
        art = '<circle cx="160" cy="120" r="48" fill="none" stroke="' + line + '" stroke-width="10"/><path d="M128 152 L192 88" stroke="' + line + '" stroke-width="10"/>';
      } else {
        art = '<polyline points="20,180 80,120 130,150 190,70 300,40" fill="none" stroke="' + accent + '" stroke-width="10" stroke-linejoin="round"/><circle cx="190" cy="70" r="12" fill="' + bull + '"/>';
      }
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice"><rect width="320" height="240" fill="' + bg + '"/>' + art + '</svg>';
      return 'data:image/svg+xml,' + encodeURIComponent(svg);
    }
    function hubPaintImages() {
      document.querySelectorAll('img[data-hub-img]').forEach(function (img) {
        const kind = img.getAttribute('data-hub-img');
        if (kind !== 'broken') img.src = hubImageUri(kind);
      });
      const preview = document.getElementById('hub-preview-img');
      if (preview && document.getElementById('demo-image-preview-container').style.display === 'block') preview.src = hubImageUri(HUB_PREVIEW.items[HUB_PREVIEW.index]);
    }
    function hubImgError(img) {
      img.onerror = null;
      img.setAttribute('data-hub-img', 'fallback');
      img.src = hubImageUri('fallback');
    }
    function hubImageHover(wrapper, show) {
      // Like the components: the overlay is rendered only while hovered or focused (a [hidden] attribute would
      // lose to the overlay's display: flex)
      const overlay = wrapper.querySelector('.joy-image__overlay');
      if (show && !overlay) wrapper.insertAdjacentHTML('beforeend', HUB_IMAGE_OVERLAY);
      else if (!show && overlay) overlay.remove();
    }
    const HUB_IMAGE_OVERLAY = ${JSON.stringify(hubImageOverlay())};
    const HUB_PREVIEW = { items: ['a'], index: 0, scale: 1, rotate: 0 };
    function hubPreviewRender() {
      const img = document.getElementById('hub-preview-img');
      img.src = hubImageUri(HUB_PREVIEW.items[HUB_PREVIEW.index]);
      img.style.transform = 'translate(0px, 0px) scale(' + HUB_PREVIEW.scale + ') rotate(' + HUB_PREVIEW.rotate + 'deg)';
      const many = HUB_PREVIEW.items.length > 1;
      document.getElementById('hub-preview-counter').style.display = many ? '' : 'none';
      document.getElementById('hub-preview-prev').style.display = many ? '' : 'none';
      document.getElementById('hub-preview-next').style.display = many ? '' : 'none';
      document.getElementById('hub-preview-counter').textContent = (HUB_PREVIEW.index + 1) + ' / ' + HUB_PREVIEW.items.length;
    }
    function hubPreviewZoom(factor) { HUB_PREVIEW.scale = Math.max(0.5, Math.min(4, HUB_PREVIEW.scale * factor)); hubPreviewRender(); }
    function hubPreviewRotate(deg) { HUB_PREVIEW.rotate += deg; hubPreviewRender(); }
    function hubPreviewReset() { HUB_PREVIEW.scale = 1; HUB_PREVIEW.rotate = 0; hubPreviewRender(); }
    function hubPreviewStep(delta) {
      const n = HUB_PREVIEW.items.length;
      HUB_PREVIEW.index = (HUB_PREVIEW.index + delta + n) % n;
      hubPreviewReset();
    }
    function openImagePreview(index, gallery) {
      HUB_PREVIEW.items = gallery ? ['a', 'b'] : [index === 1 ? 'b' : 'a'];
      HUB_PREVIEW.index = 0;
      HUB_PREVIEW.scale = 1;
      HUB_PREVIEW.rotate = 0;
      hubPreviewRender();
      hubOpenDialog('demo-image-preview-container', '.joy-image-preview-btn');
    }
    function closeImagePreview() { hubCloseDialog('demo-image-preview-container'); }
    // The broken source may already have failed while the page was parsing, before this script ran
    document.querySelectorAll('img[data-hub-img="broken"]').forEach(function (img) {
      if (img.complete && !img.naturalWidth) hubImgError(img);
      else img.addEventListener('error', function () { hubImgError(img); }, { once: true });
    });
    hubPaintImages();

    function copyHubCode(btn) {
      const container = btn.closest('.joy-code-block') || btn.closest('.joy-mermaid') || btn.closest('pre');
      const codeEl = container ? container.querySelector('code') : null;
      const code = codeEl ? codeEl.innerText : '';
      const status = container ? container.querySelector('.joy-markdown__status') : null;
      const done = function () {
        if (status) status.textContent = 'Copied to clipboard';
        setTimeout(function () { if (status) status.textContent = ''; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, done);
      else done();
    }

    function hubSelectPolyglotTab(tabBtn, itemKey) {
      const tabs = tabBtn.closest('.joy-polyglot-tabs');
      if (!tabs) return;
      tabs.querySelectorAll('.joy-polyglot-tabs__tab').forEach(function (t) {
        const isSelected = t === tabBtn;
        t.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        t.tabIndex = isSelected ? 0 : -1;
      });
      tabs.querySelectorAll('.joy-polyglot-tabs__panel-content').forEach(function (p) {
        p.style.display = p.getAttribute('data-lang') === itemKey ? 'block' : 'none';
      });
    }

    function hubToggleMermaidView(btn) {
      const container = btn.closest('.joy-mermaid');
      if (!container) return;
      const viewport = container.querySelector('.joy-mermaid__viewport');
      const source = container.querySelector('.joy-mermaid__source');
      const isDiagram = viewport.style.display !== 'none';
      if (isDiagram) {
        viewport.style.display = 'none';
        source.style.display = 'block';
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Diagram';
        btn.setAttribute('aria-label', 'Show diagram preview');
      } else {
        viewport.style.display = 'flex';
        source.style.display = 'none';
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Source';
        btn.setAttribute('aria-label', 'Show mermaid source code');
      }
    }

    // Live Pagination: same windowing and phone rule (current page only at 480px or less) as the component.
    let hubPagerPage = 5;
    const HUB_PAGER_LAST = 20;
    function hubPageWindowJs(current, last) {
      const range = function (a, b) { return Array.from({ length: b - a + 1 }, function (_, i) { return a + i; }); };
      if (last <= 7) return range(1, last);
      const left = Math.max(current - 1, 1);
      const right = Math.min(current + 1, last);
      const showStart = left > 3;
      const showEnd = right < last - 2;
      if (!showStart && showEnd) return range(1, 5).concat(['…', last]);
      if (showStart && !showEnd) return [1, '…'].concat(range(last - 4, last));
      return [1, '…'].concat(range(left, right), ['…', last]);
    }
    function renderHubPager(focusLabel) {
      const nav = document.getElementById('hub-live-pager');
      if (!nav) return;
      const compact = window.matchMedia('(max-width: 480px)').matches;
      const pages = compact ? [hubPagerPage] : hubPageWindowJs(hubPagerPage, HUB_PAGER_LAST);
      const btn = function (label, inner, active, disabled) {
        return '<button type="button" class="joy-pagination__btn' + (active ? ' joy-pagination__btn--active' : '') + '" aria-label="' + label + '"' + (active ? ' aria-current="page"' : '') + (disabled ? ' disabled' : '') + '>' + inner + '</button>';
      };
      nav.innerHTML = btn('Previous page', HUB_ICONS.chevronLeft, false, hubPagerPage <= 1) +
        pages.map(function (p) { return p === '…' ? '<span class="joy-pagination__ellipsis" aria-hidden="true">…</span>' : btn('Page ' + p, p, p === hubPagerPage, false); }).join('') +
        btn('Next page', HUB_ICONS.chevronRight, false, hubPagerPage >= HUB_PAGER_LAST) +
        (compact ? '' : '<span class="joy-pagination__info">Total: ' + (HUB_PAGER_LAST * 10) + ' items</span>');
      if (focusLabel) {
        const again = nav.querySelector('[aria-label="' + focusLabel + '"]:not([disabled])');
        if (again) again.focus();
      }
    }
    (function () {
      const nav = document.getElementById('hub-live-pager');
      if (!nav) return;
      nav.addEventListener('click', function (e) {
        const b = e.target.closest('button');
        if (!b) return;
        const label = b.getAttribute('aria-label');
        if (label === 'Previous page') hubPagerPage = Math.max(1, hubPagerPage - 1);
        else if (label === 'Next page') hubPagerPage = Math.min(HUB_PAGER_LAST, hubPagerPage + 1);
        else hubPagerPage = Number(label.replace('Page ', ''));
        renderHubPager(label);
      });
      window.matchMedia('(max-width: 480px)').addEventListener('change', function () { renderHubPager(); });
      renderHubPager();
    })();

    // Splitter: drag the divider or use the arrow keys (stacked below 640px, so orientation is read from layout).
    function hubSetSplit(bar, pct) {
      const min = Number(bar.getAttribute('aria-valuemin'));
      const max = Number(bar.getAttribute('aria-valuemax'));
      const v = Math.max(min, Math.min(max, pct));
      const panes = bar.parentElement.querySelectorAll(':scope > .joy-splitter__pane');
      panes[0].style.setProperty('--joy-splitter-size', String(v));
      panes[1].style.setProperty('--joy-splitter-size', String(100 - v));
      bar.setAttribute('aria-valuenow', String(Math.round(v)));
      bar.setAttribute('aria-orientation', getComputedStyle(bar.parentElement).flexDirection === 'column' ? 'horizontal' : 'vertical');
    }
    (function () {
      let dragging = null;
      document.addEventListener('pointerdown', function (e) {
        const bar = e.target.closest && e.target.closest('[data-hub-splitter]');
        if (!bar) return;
        dragging = bar;
        bar.classList.add('joy-splitter__bar--active');
        if (bar.setPointerCapture) bar.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      document.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        const split = dragging.parentElement;
        const rect = split.getBoundingClientRect();
        const vertical = getComputedStyle(split).flexDirection === 'column';
        hubSetSplit(dragging, vertical ? ((e.clientY - rect.top) / rect.height) * 100 : ((e.clientX - rect.left) / rect.width) * 100);
      });
      const end = function () {
        if (dragging) dragging.classList.remove('joy-splitter__bar--active');
        dragging = null;
      };
      document.addEventListener('pointerup', end);
      document.addEventListener('pointercancel', end);
      document.addEventListener('keydown', function (e) {
        const bar = e.target.closest && e.target.closest('[data-hub-splitter]');
        if (!bar) return;
        const now = Number(bar.getAttribute('aria-valuenow'));
        const step = { ArrowLeft: -5, ArrowUp: -5, ArrowRight: 5, ArrowDown: 5 }[e.key];
        if (step !== undefined) hubSetSplit(bar, now + step);
        else if (e.key === 'Home') hubSetSplit(bar, 0);
        else if (e.key === 'End') hubSetSplit(bar, 100);
        else return;
        e.preventDefault();
      });
    })();

    // Charts paint from theme tokens: a canvas cannot resolve var(), so read the computed values.
    function hubPalette() {
      const s = getComputedStyle(document.documentElement);
      const v = function (name) { return s.getPropertyValue(name).trim(); };
      return { bull: v('--joy-status-success-fg'), bear: v('--joy-status-danger-fg'), accent: v('--joy-accent-default'), border: v('--joy-border-subtle') };
    }
    function hubPrepCanvas(id) {
      const canvas = document.getElementById(id);
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      return { ctx: ctx, w: rect.width, h: rect.height };
    }
    function drawHubMatrixCharts() {
      const pal = hubPalette();
      const top = 72;
      const bar = hubPrepCanvas('hub-bar-base');
      if (bar) {
        const data = HUB_MATRIX_CHARTS.bars;
        const max = Math.max.apply(null, data) * 1.1;
        const slot = bar.w / data.length;
        bar.ctx.fillStyle = pal.accent;
        data.forEach(function (v, i) {
          const bh = (v / max) * (bar.h - top - 8);
          bar.ctx.fillRect(i * slot + slot * 0.2, bar.h - bh - 8, slot * 0.6, bh);
        });
      }
      const candle = hubPrepCanvas('hub-candle-base');
      if (candle) {
        const data = HUB_MATRIX_CHARTS.candles;
        let min = Infinity;
        let max = -Infinity;
        data.forEach(function (c) { min = Math.min(min, c.low); max = Math.max(max, c.high); });
        const y = function (p) { return candle.h - 8 - ((p - min) / (max - min)) * (candle.h - top - 8); };
        const slot = candle.w / data.length;
        data.forEach(function (c, i) {
          const color = c.close >= c.open ? pal.bull : pal.bear;
          const x = i * slot + slot / 2;
          candle.ctx.strokeStyle = color;
          candle.ctx.fillStyle = color;
          candle.ctx.lineWidth = 1.5;
          candle.ctx.beginPath();
          candle.ctx.moveTo(x, y(c.high));
          candle.ctx.lineTo(x, y(c.low));
          candle.ctx.stroke();
          const bodyTop = Math.min(y(c.open), y(c.close));
          candle.ctx.fillRect(x - slot * 0.3, bodyTop, slot * 0.6, Math.max(2, Math.abs(y(c.open) - y(c.close))));
        });
      }
    }
    function redrawHubCharts() {
      drawCandlestickCanvas();
      drawLineCanvas();
      drawHubMatrixCharts();
      hubPaintImages();
    }
    let hubResizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(hubResizeTimer);
      hubResizeTimer = setTimeout(redrawHubCharts, 120);
    });

    // Wave 5 Steps Demo Handlers
    let currentWorkflowStep = 1;
    function setDemoStep(idx) {
      currentWorkflowStep = idx;
      updateStepsUi();
    }
    function advanceDemoStep(delta) {
      currentWorkflowStep = Math.max(0, Math.min(2, currentWorkflowStep + delta));
      updateStepsUi();
    }
    function updateStepsUi() {
      const stepItems = document.querySelectorAll('#demo-steps-nav .joy-steps__item');
      stepItems.forEach((item, idx) => {
        item.classList.remove('joy-steps__item--finish', 'joy-steps__item--process', 'joy-steps__item--wait');
        const iconDiv = item.querySelector('.joy-steps__icon');
        if (idx < currentWorkflowStep) {
          item.classList.add('joy-steps__item--finish');
          item.removeAttribute('aria-current');
          if (iconDiv) iconDiv.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        } else if (idx === currentWorkflowStep) {
          item.classList.add('joy-steps__item--process');
          item.setAttribute('aria-current', 'step');
          if (iconDiv) iconDiv.innerText = String(idx + 1);
        } else {
          item.classList.add('joy-steps__item--wait');
          item.removeAttribute('aria-current');
          if (iconDiv) iconDiv.innerText = String(idx + 1);
        }
      });
      showDemoToast('Workflow advanced to step ' + (currentWorkflowStep + 1), 'info');
    }

      // Wave 6 Charts & Layout Client Engine
      let candleData = [];
      let lineData = [];
      let chartZoomSpan = 60; // bars visible
      let chartOffset = 0;

      function generateMockMarketData() {
        let price = 68200;
        const now = Date.now();
        candleData = [];
        for (let i = 0; i < 500; i++) {
          const t = now - (500 - i) * 60000;
          const open = price;
          const delta = (Math.random() - 0.49) * 120;
          const close = open + delta;
          const high = Math.max(open, close) + Math.random() * 60;
          const low = Math.min(open, close) - Math.random() * 60;
          price = close;
          candleData.push({ time: t, open, high, low, close });
        }

        // Line dataset (10,000 points)
        lineData = [];
        let val = 3000;
        for (let i = 0; i < 10000; i++) {
          val += (Math.random() - 0.498) * 25;
          lineData.push({ x: i, y: Math.max(100, val) });
        }
      }

      function drawCandlestickCanvas() {
        const baseCanvas = document.getElementById('candle-base-canvas');
        if (!baseCanvas) return;
        const rect = baseCanvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const dpr = window.devicePixelRatio || 1;
        baseCanvas.width = rect.width * dpr;
        baseCanvas.height = rect.height * dpr;

        const ctx = baseCanvas.getContext('2d');
        ctx.resetTransform?.();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, rect.width, rect.height);

        const pal = hubPalette();
        const visible = candleData.slice(Math.max(0, candleData.length - chartZoomSpan));
        if (visible.length === 0) return;

        let min = Infinity, max = -Infinity;
        visible.forEach(c => {
          if (c.low < min) min = c.low;
          if (c.high > max) max = c.high;
        });
        const pad = (max - min) * 0.08 || 1;
        min -= pad;
        max += pad;

        const candleWidth = Math.max(2, (rect.width / visible.length) * 0.7);

        // Grid
        ctx.strokeStyle = document.documentElement.getAttribute('data-theme') === 'dark' ? 'transparent' : 'transparent';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 4; i++) {
          const y = (rect.height / 5) * i;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(rect.width, y);
          ctx.stroke();
        }

        visible.forEach((c, idx) => {
          const x = (idx / visible.length) * rect.width + candleWidth / 2;
          const openY = rect.height - ((c.open - min) / (max - min)) * rect.height;
          const closeY = rect.height - ((c.close - min) / (max - min)) * rect.height;
          const highY = rect.height - ((c.high - min) / (max - min)) * rect.height;
          const lowY = rect.height - ((c.low - min) / (max - min)) * rect.height;

          const isBull = c.close >= c.open;
          const color = isBull ? pal.bull : pal.bear;

          ctx.strokeStyle = color;
          ctx.fillStyle = color;
          ctx.lineWidth = 1.5;

          // Wick
          ctx.beginPath();
          ctx.moveTo(Math.floor(x) + 0.5, highY);
          ctx.lineTo(Math.floor(x) + 0.5, lowY);
          ctx.stroke();

          // Body
          const top = Math.min(openY, closeY);
          const height = Math.max(2, Math.abs(closeY - openY));
          ctx.fillRect(x - candleWidth / 2, top, candleWidth, height);
        });

        const last = visible[visible.length - 1];
        if (last) {
          document.getElementById('hud-o').innerText = last.open.toFixed(2);
          document.getElementById('hud-h').innerText = last.high.toFixed(2);
          document.getElementById('hud-l').innerText = last.low.toFixed(2);
          const cEl = document.getElementById('hud-c');
          cEl.innerText = last.close.toFixed(2);
          const up = last.close >= last.open;
          cEl.classList.toggle('joy-chart__hud-value--bull', up);
          cEl.classList.toggle('joy-chart__hud-value--bear', !up);
        }
      }

      function drawLineCanvas() {
        const baseCanvas = document.getElementById('line-base-canvas');
        if (!baseCanvas) return;
        const rect = baseCanvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const dpr = window.devicePixelRatio || 1;
        baseCanvas.width = rect.width * dpr;
        baseCanvas.height = rect.height * dpr;

        const ctx = baseCanvas.getContext('2d');
        ctx.resetTransform?.();
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, rect.width, rect.height);

        // LTTB downsampling to ~rect.width points
        const step = Math.ceil(lineData.length / rect.width);
        const sampled = [];
        for (let i = 0; i < lineData.length; i += step) {
          sampled.push(lineData[i]);
        }

        let minY = Infinity, maxY = -Infinity;
        sampled.forEach(p => {
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        });
        const pad = (maxY - minY) * 0.08 || 1;
        minY -= pad;
        maxY += pad;

        ctx.strokeStyle = hubPalette().accent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        sampled.forEach((p, idx) => {
          const x = (idx / sampled.length) * rect.width;
          const y = rect.height - ((p.y - minY) / (maxY - minY)) * rect.height;
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();

        ctx.lineTo(rect.width, rect.height);
        ctx.lineTo(0, rect.height);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, 0, 0, rect.height);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();
      }

      function resetChartZoom() {
        chartZoomSpan = 60;
        drawCandlestickCanvas();
        showDemoToast('Zoom reset to 60 bars', 'info');
      }

      function simulateLiveCandleTick() {
        const last = candleData[candleData.length - 1];
        const delta = (Math.random() - 0.49) * 80;
        const close = last.close + delta;
        const high = Math.max(last.high, close);
        const low = Math.min(last.low, close);
        last.close = close;
        last.high = high;
        last.low = low;
        drawCandlestickCanvas();
        showDemoToast('Live tick: $' + close.toFixed(2), 'success');
      }

      function selectSegment(btn, val) {
        document.querySelectorAll('#demo-segmented .joy-segmented__item').forEach(b => b.classList.remove('joy-segmented__item--active'));
        btn.classList.add('joy-segmented__item--active');
        showDemoToast('Time horizon set: ' + val.toUpperCase(), 'info');
      }

      // Wave 7 Interactive Handlers
      function stepNumberDemo(delta) {
        const inp = document.getElementById('demo-num-input');
        if (!inp) return;
        let v = parseInt(inp.value, 10) || 0;
        v = Math.max(1, Math.min(100, v + delta));
        inp.value = v;
        inp.parentElement.setAttribute('aria-valuenow', v);
      }

      function stepFloatDemo(delta) {
        const inp = document.getElementById('demo-num-step');
        if (!inp) return;
        let v = parseFloat(inp.value) || 0;
        v = Math.max(0, parseFloat((v + delta).toFixed(2)));
        inp.value = v.toFixed(2);
        inp.parentElement.setAttribute('aria-valuenow', v);
      }

      let currentRate = 4.5;
      function renderRateDemo(val) {
        currentRate = val;
        const container = document.getElementById('demo-rate');
        const feedback = document.getElementById('rate-feedback');
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < 5; i++) {
          const isFull = val >= i + 1;
          const isHalf = !isFull && val >= i + 0.5;
          const star = document.createElement('div');
          star.className = 'joy-rate__star' + (isFull ? ' joy-rate__star--full' : '') + (isHalf ? ' joy-rate__star--half' : '');
          star.setAttribute('role', 'radio');
          star.setAttribute('aria-checked', isFull ? 'true' : 'false');
          star.setAttribute('tabindex', '0');
          star.onclick = () => renderRateDemo(i + 1);
          const fill = isFull || isHalf ? 'currentColor' : 'none';
          star.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="' + fill + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
          container.appendChild(star);
        }
        if (feedback) feedback.innerText = val + ' Stars';
      }

      function handleMentionsInput(e) {
        const text = e.target.value;
        const dropdown = document.getElementById('demo-mentions-dropdown');
        if (!dropdown) return;
        if (text.includes('@')) {
          dropdown.style.display = 'block';
        } else {
          dropdown.style.display = 'none';
        }
      }

      function insertMention(name) {
        const ta = document.getElementById('demo-mentions');
        const dropdown = document.getElementById('demo-mentions-dropdown');
        if (!ta || !dropdown) return;
        const atIndex = ta.value.lastIndexOf('@');
        ta.value = ta.value.slice(0, atIndex) + '@' + name + ' ';
        dropdown.style.display = 'none';
        ta.focus();
        showDemoToast('Mentioned @' + name, 'info');
      }

      function toggleTimePickerDemo() {
        const panel = document.getElementById('demo-time-panel');
        if (!panel) return;
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
      }

      function renderTimePickerCols() {
        const hCol = document.getElementById('demo-time-h');
        const mCol = document.getElementById('demo-time-m');
        const sCol = document.getElementById('demo-time-s');
        if (!hCol || !mCol || !sCol) return;

        hCol.innerHTML = '';
        mCol.innerHTML = '';
        sCol.innerHTML = '';

        for (let i = 0; i < 24; i++) {
          const val = String(i).padStart(2, '0');
          const cell = document.createElement('div');
          cell.className = 'joy-time-picker__cell' + (val === '09' ? ' joy-time-picker__cell--selected' : '');
          cell.innerText = val;
          cell.onclick = () => {
            hCol.querySelectorAll('.joy-time-picker__cell').forEach(c => c.classList.remove('joy-time-picker__cell--selected'));
            cell.classList.add('joy-time-picker__cell--selected');
            updateTimeInput();
          };
          hCol.appendChild(cell);
        }

        for (let i = 0; i < 60; i += 5) {
          const val = String(i).padStart(2, '0');
          const cell = document.createElement('div');
          cell.className = 'joy-time-picker__cell' + (val === '30' ? ' joy-time-picker__cell--selected' : '');
          cell.innerText = val;
          cell.onclick = () => {
            mCol.querySelectorAll('.joy-time-picker__cell').forEach(c => c.classList.remove('joy-time-picker__cell--selected'));
            cell.classList.add('joy-time-picker__cell--selected');
            updateTimeInput();
          };
          mCol.appendChild(cell);
        }

        for (let i = 0; i < 60; i += 10) {
          const val = String(i).padStart(2, '0');
          const cell = document.createElement('div');
          cell.className = 'joy-time-picker__cell' + (val === '00' ? ' joy-time-picker__cell--selected' : '');
          cell.innerText = val;
          cell.onclick = () => {
            sCol.querySelectorAll('.joy-time-picker__cell').forEach(c => c.classList.remove('joy-time-picker__cell--selected'));
            cell.classList.add('joy-time-picker__cell--selected');
            updateTimeInput();
          };
          sCol.appendChild(cell);
        }
      }

      function updateTimeInput() {
        const h = document.querySelector('#demo-time-h .joy-time-picker__cell--selected')?.innerText || '00';
        const m = document.querySelector('#demo-time-m .joy-time-picker__cell--selected')?.innerText || '00';
        const s = document.querySelector('#demo-time-s .joy-time-picker__cell--selected')?.innerText || '00';
        const inp = document.getElementById('demo-time-input');
        if (inp) inp.value = h + ':' + m + ':' + s;
      }

      // Transfer demo data
      let transferData = [
        { key: 'p1', title: 'Uniswap v3 ETH/USDC 0.05%', target: false },
        { key: 'p2', title: 'Curve 3pool DAI/USDC/USDT', target: false },
        { key: 'p3', title: 'Balancer Boosted Aave Pool', target: false },
        { key: 'p4', title: 'Raydium SOL/USDC CLMM', target: false },
        { key: 'p5', title: 'TraderJoe AVAX/USDC 0.20%', target: false },
        { key: 'p6', title: 'Binance Central Order Book Spot', target: true },
        { key: 'p7', title: 'Coinbase Institutional Prime Gateway', target: true }
      ];

      function renderTransferDemo() {
        const sList = document.getElementById('transfer-source-list');
        const tList = document.getElementById('transfer-target-list');
        if (!sList || !tList) return;

        sList.innerHTML = '';
        tList.innerHTML = '';

        const sources = transferData.filter(d => !d.target);
        const targets = transferData.filter(d => d.target);

        sources.forEach(item => {
          const row = document.createElement('label');
          row.className = 'joy-transfer__item';
          row.innerHTML = '<input type="checkbox" data-key="' + item.key + '" class="transfer-source-chk" onchange="updateTransferCounts()" /> <span>' + item.title + '</span>';
          sList.appendChild(row);
        });

        targets.forEach(item => {
          const row = document.createElement('label');
          row.className = 'joy-transfer__item';
          row.innerHTML = '<input type="checkbox" data-key="' + item.key + '" class="transfer-target-chk" onchange="updateTransferCounts()" /> <span>' + item.title + '</span>';
          tList.appendChild(row);
        });

        updateTransferCounts();
      }

      function updateTransferCounts() {
        const sChecked = document.querySelectorAll('.transfer-source-chk:checked').length;
        const sTotal = document.querySelectorAll('.transfer-source-chk').length;
        const tChecked = document.querySelectorAll('.transfer-target-chk:checked').length;
        const tTotal = document.querySelectorAll('.transfer-target-chk').length;

        const sCount = document.getElementById('transfer-source-count');
        const tCount = document.getElementById('transfer-target-count');
        if (sCount) sCount.innerText = sChecked + '/' + sTotal + ' items';
        if (tCount) tCount.innerText = tChecked + '/' + tTotal + ' items';
      }

      function executeTransfer(direction) {
        if (direction === 'right') {
          const checked = Array.from(document.querySelectorAll('.transfer-source-chk:checked')).map(c => c.getAttribute('data-key'));
          if (checked.length === 0) return;
          transferData.forEach(d => { if (checked.includes(d.key)) d.target = true; });
          showDemoToast('Migrated ' + checked.length + ' pools to Target routing', 'success');
        } else {
          const checked = Array.from(document.querySelectorAll('.transfer-target-chk:checked')).map(c => c.getAttribute('data-key'));
          if (checked.length === 0) return;
          transferData.forEach(d => { if (checked.includes(d.key)) d.target = false; });
          showDemoToast('Returned ' + checked.length + ' pools to Source pool', 'info');
        }
        renderTransferDemo();
      }

      // Wave 8 Interactive Handlers
      function selectMenuItem(el) {
        const parent = el.parentElement;
        if (!parent) return;
        parent.querySelectorAll('.joy-menu__item').forEach(i => {
          i.classList.remove('joy-menu__item--active');
          i.removeAttribute('aria-current');
          i.tabIndex = -1;
        });
        el.classList.add('joy-menu__item--active');
        el.setAttribute('aria-current', 'page');
        el.tabIndex = 0;
        const text = el.querySelector('span:last-child')?.innerText || 'Menu Item';
        showDemoToast('Navigated to ' + text, 'info');
      }

      function selectAnchor(el, e) {
        // Demo hrefs are not hub views: stay on the page and only move the active link
        if (e) e.preventDefault();
        const parent = el.parentElement;
        if (!parent) return;
        parent.querySelectorAll('.joy-anchor__link').forEach(a => {
          a.classList.remove('joy-anchor__link--active');
          a.removeAttribute('aria-current');
        });
        el.classList.add('joy-anchor__link--active');
        el.setAttribute('aria-current', 'location');
        showDemoToast('Scrolled to ' + el.innerText, 'info');
      }

      function triggerMessage(type, text) {
        showDemoToast(text, type);
      }

      function triggerNotification(type, title, desc) {
        showDemoToast(title + ': ' + desc, type);
      }

      function toggleSpinMask() {
        const mask = document.getElementById('demo-spin-mask');
        if (!mask) return;
        mask.style.display = mask.style.display === 'none' ? 'flex' : 'none';
        if (mask.style.display === 'flex') {
          setTimeout(() => {
            if (mask) mask.style.display = 'none';
          }, 2500);
        }
      }

    // ── Kinetic particle hero ──
    // A decorative canvas behind the HeroSection in #view-landing-blocks. Its colours come from the theme tokens
    // (hubKineticPalette, re-read whenever data-theme changes). Features 6 distinct physics archetypes with
    // polymorphic geometry (pills, 4-point sparkle stars, diamond shards, data streams, convection embers, halftones).
    let kineticCanvas, kineticCtx;
    let kineticParticles = [];
    let kineticAnimId = null;
    let kineticVisible = false;
    let kineticLastFrame = 0;
    let kineticPalette = null;
    let kineticMouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: -1000, lastY: -1000, isOver: false };
    let kineticSubvariant = 'gold';
    const KINETIC_FRAME_MS = 1000 / 60 - 1;
    const KINETIC_FOV = 300;
    const kineticReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const kineticCoarse = window.matchMedia('(pointer: coarse)');
    let kineticCamX = 0;
    let kineticCamY = 0;
    let kineticRipples = [];
    let kineticComets = [];
    let kineticLastCometTime = 0;

    let kineticSubPalette = null;

    function hubKineticPalette() {
      const cs = getComputedStyle(document.documentElement);
      const v = (name) => cs.getPropertyValue(name).trim();
      return {
        accents: [v('--joy-accent-default'), v('--joy-accent-hover'), v('--joy-accent-active')],
        muted: v('--joy-text-muted'),
      };
    }
    window.hubKineticPalette = hubKineticPalette;

    function hubSubvariantPalette() {
      const cs = getComputedStyle(document.documentElement);
      const v = (name) => cs.getPropertyValue(name).trim();
      return {
        accentDefault: v('--joy-accent-default'),
        accentHover: v('--joy-accent-hover'),
        accentActive: v('--joy-accent-active'),
        accentHighlight: v('--joy-accent-highlight') || v('--joy-accent-hover'),
        accentSubtle: v('--joy-accent-subtle'),
        info: v('--joy-status-info-fg'),
        infoBorder: v('--joy-status-info-border'),
        success: v('--joy-status-success-fg'),
        warning: v('--joy-status-warning-fg'),
        danger: v('--joy-status-danger-fg'),
        textPrimary: v('--joy-text-primary'),
        textSecondary: v('--joy-text-secondary'),
        textMuted: v('--joy-text-muted'),
        borderDefault: v('--joy-border-default'),
        borderSubtle: v('--joy-border-subtle'),
        borderFocus: v('--joy-border-focus'),
        surfaceRaised: v('--joy-surface-raised'),
        surfaceCard: v('--joy-surface-card'),
      };
    }
    window.kineticSubvariant = kineticSubvariant;

    function switchKineticSubvariant(sub) {
      kineticSubvariant = sub;
      window.kineticSubvariant = sub;
      const subBtns = document.querySelectorAll('.kinetic-sub-btn');
      subBtns.forEach((btn) => {
        const active = btn.id === 'btn-sub-' + sub;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      const container = document.getElementById('kinetic-hero-container');
      if (container) {
        container.setAttribute('data-archetype', sub);
      }
      const badge = document.querySelector('#kinetic-hero-container .joy-hero__badge');
      const names = {
        gold: 'Obsidian & 24K Gold',
        cosmos: 'Cosmos Aurora',
        titanium: 'Titanium Prism',
        cyberpunk: 'Cyberpunk HUD',
        plasma: 'Solar Plasma',
        swiss: 'Swiss Halftone'
      };
      if (badge && names[sub]) {
        const svg = badge.querySelector('svg');
        const svgHtml = svg ? svg.outerHTML + ' ' : '';
        badge.innerHTML = svgHtml + 'Particle Archetype: ' + names[sub];
      }
      initKineticParticles();
      if (!kineticShouldAnimate()) {
        drawKineticFrame(false);
      }
      if (typeof showDemoToast === 'function' && names[sub]) {
        showDemoToast('Switched particle preset: ' + names[sub], 'info');
      }
    }
    window.switchKineticSubvariant = switchKineticSubvariant;

    function kineticShouldAnimate() {
      return !!kineticCanvas && kineticVisible && !document.hidden && !kineticReduce.matches && !kineticCoarse.matches;
    }

    function stopKinetic() {
      if (kineticAnimId !== null) cancelAnimationFrame(kineticAnimId);
      kineticAnimId = null;
    }

    function kineticTick(now) {
      kineticAnimId = null;
      if (!kineticShouldAnimate()) return;
      if (now - kineticLastFrame >= KINETIC_FRAME_MS) {
        kineticLastFrame = now;
        drawKineticFrame(true);
      }
      kineticAnimId = requestAnimationFrame(kineticTick);
    }

    function syncKinetic() {
      if (kineticShouldAnimate()) {
        if (kineticAnimId === null) kineticAnimId = requestAnimationFrame(kineticTick);
        return;
      }
      stopKinetic();
      if (kineticCanvas && kineticVisible && kineticReduce.matches && !kineticCoarse.matches) drawKineticFrame(false);
    }

    function initKineticParticles() {
      kineticParticles = [];
      const count = kineticSubvariant === 'cosmos' ? 190 : 170;
      // Peripheral anchor coordinates for soft photographic bokeh floaters (never behind center copy)
      const bokehAnchors = [
        { x: -500, y: -170 },
        { x: 500, y: -170 },
        { x: -500, y: 170 },
        { x: 500, y: 170 },
        { x: -560, y: 0 },
        { x: 560, y: 0 }
      ];

      for (let i = 0; i < count; i++) {
        let p = {
          x: (Math.random() - 0.5) * 760,
          y: (Math.random() - 0.5) * 440,
          z: Math.random() * 320 - 160,
          vx: (Math.random() - 0.5) * 0.45,
          vy: -0.15 - Math.random() * 0.35,
          vz: (Math.random() - 0.5) * 0.25,
          baseRadius: 1.2 + Math.random() * 1.6,
          length: 0,
          thickness: 0,
          isPill: false,
          shape: 'dust',
          angle: Math.random() * Math.PI * 2,
          omega: (Math.random() - 0.5) * 0.02,
          tone: i % 3,
          phase: Math.random() * Math.PI * 2,
          alpha: 0.85,
          fadeAlpha: 1.0,
          rotX: Math.random() * Math.PI * 2,
          rotY: Math.random() * Math.PI * 2,
          rotZ: Math.random() * Math.PI * 2,
          vRotX: (Math.random() - 0.5) * 0.025,
          vRotY: (Math.random() - 0.5) * 0.025,
          vRotZ: (Math.random() - 0.5) * 0.025,
          originX: (Math.random() - 0.5) * 700,
          originY: (Math.random() - 0.5) * 380,
          freqA: 1 + (i % 3),
          freqB: 1 + ((i + 1) % 3),
          lensScale: 1,
          isSurging: false,
          surgeTimer: 0,
        };

        if (i < 6) {
          // Tier 3: Optical Camera Bokeh Floaters (ultra-soft peripheral ambient light anchors)
          p.shape = 'bokeh';
          p.baseRadius = 40 + Math.random() * 35;
          p.alpha = 0.035 + Math.random() * 0.025;
          p.z = 120 + Math.random() * 40;
          const anchor = bokehAnchors[i % bokehAnchors.length];
          p.x = anchor.x + (Math.random() - 0.5) * 50;
          p.y = anchor.y + (Math.random() - 0.5) * 30;
          p.originX = anchor.x;
          p.originY = anchor.y;
          p.vx = (Math.random() - 0.5) * 0.08;
          p.vy = (Math.random() - 0.5) * 0.08;
        } else {
          // Initial spawn clearance: never start particles directly inside the text exclusion zone
          const qx = Math.max(0, Math.abs(p.x) - 170) / 180;
          const qy = Math.abs(p.y) / 165;
          const d = Math.sqrt(qx * qx + qy * qy);
          if (d < 1.15) {
            if (Math.random() < 0.5) {
              p.x = (p.x >= 0 ? 1 : -1) * (260 + Math.random() * 180);
            } else {
              p.y = (p.y >= 0 ? 1 : -1) * (150 + Math.random() * 90);
            }
          }

          if (i < 48) {
            // Tier 2: Interactive Focal Entities & Velocity Light Streaks
            if (kineticSubvariant === 'gold') {
              if (i % 3 === 0) {
                p.shape = 'star';
                p.baseRadius = 3.5 + Math.random() * 3.5;
                p.vy = -0.15 - Math.random() * 0.25;
              } else if (i % 3 === 1) {
                p.shape = 'pill';
                p.length = 8 + Math.random() * 12;
                p.thickness = 1.2 + Math.random() * 0.6;
                p.isPill = true;
                p.vy = -0.25 - Math.random() * 0.35;
              } else {
                p.shape = 'orb';
                p.baseRadius = 1.8 + Math.random() * 2.0;
                p.vy = -0.18 - Math.random() * 0.3;
              }
            } else if (kineticSubvariant === 'cosmos') {
              if (i % 3 === 0) {
                p.shape = 'diamond';
                p.length = 6 + Math.random() * 8;
                p.thickness = 2.2 + Math.random() * 1.4;
              } else if (i % 3 === 1) {
                p.shape = 'ring';
                p.baseRadius = 6 + Math.random() * 6;
              } else {
                p.shape = 'orb';
                p.baseRadius = 1.6 + Math.random() * 1.8;
              }
            } else if (kineticSubvariant === 'titanium') {
              if (i % 3 === 0) {
                p.shape = 'flare';
                p.length = 14 + Math.random() * 12;
                p.thickness = 1.0;
              } else if (i % 3 === 1) {
                p.shape = 'shard';
                p.length = 8 + Math.random() * 10;
                p.thickness = 2.2 + Math.random() * 1.8;
              } else {
                p.shape = 'orb';
                p.baseRadius = 1.6 + Math.random() * 2.0;
              }
            } else if (kineticSubvariant === 'cyberpunk') {
              if (i % 3 === 0) {
                p.shape = 'cross';
                p.baseRadius = 3.5 + Math.random() * 1.5;
              } else if (i % 3 === 1) {
                p.shape = 'stream';
                p.length = 10 + Math.random() * 14;
                p.thickness = 1.4;
                p.vy = 1.6 + Math.random() * 1.2;
              } else {
                p.shape = 'pixel';
                p.length = 3;
                p.thickness = 3;
                p.vy = 0.8 + Math.random() * 1.0;
              }
            } else if (kineticSubvariant === 'plasma') {
              if (i % 3 === 0) {
                p.shape = 'spark';
                p.baseRadius = 2.0 + Math.random() * 2.0;
                p.vy = -0.35 - Math.random() * 0.5;
              } else if (i % 3 === 1) {
                p.shape = 'ember';
                p.baseRadius = 2.2 + Math.random() * 2.4;
                p.vy = -0.25 - Math.random() * 0.4;
              } else {
                p.shape = 'pill';
                p.length = 7 + Math.random() * 9;
                p.thickness = 1.2 + Math.random() * 0.6;
                p.isPill = true;
                p.vy = -0.3 - Math.random() * 0.4;
              }
            } else if (kineticSubvariant === 'swiss') {
              if (i % 3 === 0) {
                p.shape = 'cross';
                p.baseRadius = 4.5;
              } else if (i % 3 === 1) {
                p.shape = 'ring';
                p.baseRadius = 7 + Math.random() * 6;
              } else {
                p.shape = 'halftone';
                p.baseRadius = 2.2 + Math.random() * 2.4;
              }
            }
          } else {
            // Tier 1: Atmospheric Micro-Stardust (rich, living celestial field)
            p.shape = 'dust';
            p.baseRadius = 0.6 + Math.random() * 0.85;
            p.alpha = 0.35 + Math.random() * 0.45;
            p.isPill = false;
          }
        }
        kineticParticles.push(p);
      }
    }

    function initKineticCanvas() {
      kineticCanvas = document.getElementById('kinetic-particle-canvas');
      const container = document.getElementById('kinetic-hero-container');
      if (!kineticCanvas || !container) return;
      kineticCtx = kineticCanvas.getContext('2d');
      kineticPalette = hubKineticPalette();
      kineticSubPalette = hubSubvariantPalette();
      container.setAttribute('data-archetype', kineticSubvariant);
      initKineticParticles();

      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        kineticMouse.vx = (mx - kineticMouse.lastX) * 0.3;
        kineticMouse.vy = (my - kineticMouse.lastY) * 0.3;
        kineticMouse.lastX = kineticMouse.x;
        kineticMouse.lastY = kineticMouse.y;
        kineticMouse.x = mx;
        kineticMouse.y = my;
        kineticMouse.isOver = true;
      });
      container.addEventListener('mouseleave', () => {
        kineticMouse.isOver = false;
        kineticMouse.x = -1000;
        kineticMouse.y = -1000;
      });
      container.addEventListener('click', triggerCanvasBurst);

      new IntersectionObserver((entries) => {
        kineticVisible = entries[entries.length - 1].isIntersecting;
        if (kineticVisible) resizeKineticCanvas();
        syncKinetic();
      }).observe(container);
      new MutationObserver(() => {
        kineticPalette = hubKineticPalette();
        kineticSubPalette = hubSubvariantPalette();
        if (kineticAnimId === null) syncKinetic();
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      if (document.fonts) document.fonts.ready.then(() => {
        if (kineticAnimId === null) syncKinetic();
      });
      document.addEventListener('visibilitychange', syncKinetic);
      kineticReduce.addEventListener('change', syncKinetic);
      kineticCoarse.addEventListener('change', syncKinetic);
      window.addEventListener('resize', () => {
        resizeKineticCanvas();
        if (kineticAnimId === null) syncKinetic();
      });
    }

    function resizeKineticCanvas() {
      if (!kineticCanvas) return;
      const rect = kineticCanvas.parentElement ? kineticCanvas.parentElement.getBoundingClientRect() : null;
      if (!rect || rect.width === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      kineticCanvas.width = rect.width * dpr;
      kineticCanvas.height = rect.height * dpr;
      if (kineticCtx) kineticCtx.scale(dpr, dpr);
    }

    function triggerCanvasBurst(e) {
      if (!kineticCanvas || !kineticShouldAnimate()) return;
      const container = document.getElementById('kinetic-hero-container');
      const rect = container.getBoundingClientRect();
      const clickX = e && e.clientX ? e.clientX - rect.left : rect.width / 2;
      const clickY = e && e.clientY ? e.clientY - rect.top : rect.height / 2;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      const pal = kineticSubPalette || kineticPalette;
      let waveColor = pal.accentHighlight || pal.accentDefault || (pal.accents && pal.accents[0]);
      if (kineticSubvariant === 'cosmos') waveColor = pal.info || waveColor;
      else if (kineticSubvariant === 'titanium') waveColor = pal.textPrimary || waveColor;
      else if (kineticSubvariant === 'cyberpunk') waveColor = pal.success || waveColor;
      else if (kineticSubvariant === 'plasma') waveColor = pal.accentHighlight || waveColor;
      else if (kineticSubvariant === 'swiss') waveColor = pal.accentDefault || waveColor;

      kineticRipples.push({
        x: clickX,
        y: clickY,
        r: 6,
        maxR: Math.min(rect.width * 0.45, 280),
        speed: 8.5,
        color: waveColor,
        alpha: 0.55
      });

      kineticParticles.forEach((p) => {
        const scale = KINETIC_FOV / (KINETIC_FOV + p.z);
        const dx = cx + p.x * scale - clickX;
        const dy = cy + p.y * scale - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = Math.max(0, 200 - dist) / 200;
        p.vx += (dx / dist) * force * 16;
        p.vy += (dy / dist) * force * 16;
        p.vz += (Math.random() - 0.5) * force * 10;
        p.omega += (Math.random() - 0.5) * force * 0.15;
      });
    }

    /* ── Distinct Physics Engines per Sub-Variant ── */
    function stepKineticParticle(p, w, h) {
      if (p.shape === 'bokeh') {
        p.x += p.vx;
        p.y += p.vy;
        if (Math.abs(p.x - p.originX) > 40) p.vx = -p.vx;
        if (Math.abs(p.y - p.originY) > 25) p.vy = -p.vy;
      } else {
        const bx = w * 0.55;
        const by = h * 0.55;

      if (kineticSubvariant === 'gold') {
        // Obsidian & 24K Gold: Laminar buoyancy + wave sway + capsule orientation
        p.angle += p.omega;
        const rx = p.x * Math.cos(0.002) - p.z * Math.sin(0.002);
        p.z = p.z * Math.cos(0.002) + p.x * Math.sin(0.002);
        p.x = rx;
        if (kineticMouse.isOver) {
          const scale = KINETIC_FOV / (KINETIC_FOV + p.z);
          const mdx = w / 2 + p.x * scale - kineticMouse.x;
          const mdy = h / 2 + p.y * scale - kineticMouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 160 && mdist > 0) {
            const force = (160 - mdist) / 160;
            p.vx += (mdx / mdist) * force * 2.2 + kineticMouse.vx * 0.05;
            p.vy += (mdy / mdist) * force * 2.2 + kineticMouse.vy * 0.05;
            p.omega += (mdx / mdist) * force * 0.03;
          }
        }
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.vz *= 0.95;
        p.omega *= 0.98;
        p.x += p.vx + Math.sin(p.phase) * 0.28;
        p.y += p.vy - 0.25;
        p.z += p.vz;
        p.phase += 0.02;

        if (p.shape === 'pill') {
          p.angle = Math.atan2(p.vy - 0.25, p.vx + Math.sin(p.phase) * 0.28) + Math.PI / 2;
        }

        if (p.x < -bx) { p.x = bx; } else if (p.x > bx) { p.x = -bx; }
        if (p.y < -by) { p.y = by; p.vy = -0.2 - Math.random() * 0.45; }
        if (p.z < -160 || p.z > 160) { p.z = Math.max(-160, Math.min(160, p.z)); p.vz *= -1; }

      } else if (kineticSubvariant === 'cosmos') {
        // Cosmos Aurora: Orbital gravitational vortex + cursor slingshot lens
        const centerDist = Math.sqrt(p.x * p.x + p.y * p.y) || 1;
        p.vx += (-p.y / centerDist) * 0.16 - (p.x / centerDist) * 0.02;
        p.vy += (p.x / centerDist) * 0.16 - (p.y / centerDist) * 0.02;

        if (kineticMouse.isOver) {
          const scale = KINETIC_FOV / (KINETIC_FOV + p.z);
          const mdx = kineticMouse.x - (w / 2 + p.x * scale);
          const mdy = kineticMouse.y - (h / 2 + p.y * scale);
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy) || 1;
          if (mdist < 220) {
            const gForce = (220 - mdist) / 220;
            p.vx += (mdx / mdist) * gForce * 1.5 + (-mdy / mdist) * gForce * 1.8;
            p.vy += (mdy / mdist) * gForce * 1.5 + (mdx / mdist) * gForce * 1.8;
          }
        }
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.vz *= 0.96;
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz + Math.sin(p.phase) * 0.2;
        p.phase += 0.025;
        p.angle += 0.015;

        if (p.x < -bx) { p.x = bx; } else if (p.x > bx) { p.x = -bx; }
        if (p.y < -by) { p.y = by; } else if (p.y > by) { p.y = -by; }
        if (p.z < -160 || p.z > 160) { p.z = Math.max(-160, Math.min(160, p.z)); p.vz *= -1; }

      } else if (kineticSubvariant === 'titanium') {
        // Titanium Prism: 3D tumbling across Euler angles + microgravity fluid damping
        p.rotX += p.vRotX;
        p.rotY += p.vRotY;
        p.rotZ += p.vRotZ;
        p.angle = p.rotZ;

        if (kineticMouse.isOver) {
          const scale = KINETIC_FOV / (KINETIC_FOV + p.z);
          const mdx = w / 2 + p.x * scale - kineticMouse.x;
          const mdy = h / 2 + p.y * scale - kineticMouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 180 && mdist > 0) {
            const force = (180 - mdist) / 180;
            p.vx += (mdx / mdist) * force * 1.6;
            p.vy += (mdy / mdist) * force * 1.6;
            p.vRotX += (Math.random() - 0.5) * force * 0.05;
            p.vRotY += (Math.random() - 0.5) * force * 0.05;
          }
        }
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.vz *= 0.92;
        p.vRotX *= 0.97;
        p.vRotY *= 0.97;
        p.x += p.vx + Math.sin(p.phase * 0.5) * 0.15;
        p.y += p.vy + Math.cos(p.phase * 0.7) * 0.15;
        p.z += p.vz;
        p.phase += 0.015;

        if (p.x < -bx) { p.x = bx; } else if (p.x > bx) { p.x = -bx; }
        if (p.y < -by) { p.y = by; } else if (p.y > by) { p.y = -by; }
        if (p.z < -160 || p.z > 160) { p.z = Math.max(-160, Math.min(160, p.z)); p.vz *= -1; }

      } else if (kineticSubvariant === 'cyberpunk') {
        // Cyberpunk HUD: 8px quantized channels, stream drops, periodic packet surges
        if (p.surgeTimer > 0) {
          p.surgeTimer--;
          if (p.surgeTimer === 0) p.isSurging = false;
        } else if (Math.random() < 0.005) {
          p.isSurging = true;
          p.surgeTimer = 14;
        }

        const dropSpeed = (p.isSurging ? 5.2 : 1.2) * (p.shape === 'stream' ? 1.6 : 0.9);
        p.y += dropSpeed;

        if (kineticMouse.isOver) {
          const scale = KINETIC_FOV / (KINETIC_FOV + p.z);
          const mdx = w / 2 + p.x * scale - kineticMouse.x;
          const mdy = h / 2 + p.y * scale - kineticMouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 140 && mdist > 0) {
            p.x += (mdx > 0 ? 8 : -8);
          }
        }
        p.x = Math.round(p.x / 8) * 8;

        if (p.y > by) {
          p.y = -by;
          p.x = (Math.random() - 0.5) * w;
        }

      } else if (kineticSubvariant === 'plasma') {
        // Solar Plasma: Thermal buoyancy (hot/large particles rise faster) + curl eddies
        const thermalLift = 0.35 + (p.baseRadius / 3.0) * 0.45;
        p.vy -= 0.04 * thermalLift;
        p.vx += Math.cos(p.y * 0.015 + p.phase) * 0.35;

        if (kineticMouse.isOver) {
          const scale = KINETIC_FOV / (KINETIC_FOV + p.z);
          const mdx = w / 2 + p.x * scale - kineticMouse.x;
          const mdy = h / 2 + p.y * scale - kineticMouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 170 && mdist > 0) {
            const force = (170 - mdist) / 170;
            p.vx += (mdx / mdist) * force * 2.8 + kineticMouse.vx * 0.12;
            p.vy += (mdy / mdist) * force * 2.8 + kineticMouse.vy * 0.12;
          }
        }
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.x += p.vx;
        p.y += p.vy;
        p.phase += 0.03;

        if (p.x < -bx) { p.x = bx; } else if (p.x > bx) { p.x = -bx; }
        if (p.y < -by) {
          p.y = by;
          p.vy = -0.4 - Math.random() * 0.5;
        }

      } else if (kineticSubvariant === 'swiss') {
        // Swiss Halftone: Lissajous harmonic curves + proximity lens zoom
        p.phase += 0.012;
        p.x = p.originX + Math.sin(p.phase * p.freqA) * 35;
        p.y = p.originY + Math.cos(p.phase * p.freqB) * 25;

        if (kineticMouse.isOver) {
          const scale = KINETIC_FOV / (KINETIC_FOV + p.z);
          const mdx = w / 2 + p.x * scale - kineticMouse.x;
          const mdy = h / 2 + p.y * scale - kineticMouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 140) {
            const factor = (140 - mdist) / 140;
            p.lensScale = 1 + factor * 0.85;
          } else {
            p.lensScale = 1;
          }
        } else {
          p.lensScale = 1;
        }
      }
      }

      // Continuous organic avoidance zone around hero headline & CTA area
      const hScale = KINETIC_FOV / (KINETIC_FOV + p.z);
      const hx = p.x * hScale;
      const hy = p.y * hScale;
      const qx = Math.max(0, Math.abs(hx) - 170) / 180;
      const qy = Math.abs(hy) / 165;
      const textDist = Math.sqrt(qx * qx + qy * qy);

      // Smooth alpha dissolution: particle dissolves completely before reaching text edge
      const isBokeh = p.shape === 'bokeh';
      const clearThresh = isBokeh ? 1.6 : 1.35;
      const zeroThresh = isBokeh ? 1.25 : 0.96;
      if (textDist < clearThresh) {
        const t = Math.max(0, (textDist - zeroThresh) / (clearThresh - zeroThresh));
        p.fadeAlpha = t * t * (3 - 2 * t);
      } else {
        p.fadeAlpha = 1.0;
      }

      // Aerodynamic vector repulsion gently steers particles around the text capsule
      if (!isBokeh && textDist < 1.4 && textDist > 0.01) {
        const repel = (1.4 - textDist) * 0.42;
        const nx = hx !== 0 ? (hx > 0 ? 1 : -1) : (Math.random() - 0.5);
        const ny = hy !== 0 ? (hy > 0 ? 1 : -1) : -1;
        p.vx += nx * repel * 1.4;
        p.vy += ny * repel * 1.4;
      }

      if (p.shape === 'dust') {
        p.alpha = 0.28 + 0.52 * Math.abs(Math.sin(p.phase));
      }
    }

    /* ── Polymorphic Geometry Renderers with Additive Bloom & Luminous Gradients ── */
    function drawSparkle(ctx, x, y, radius, angle, color, alpha) {
      if (radius <= 0) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(1, radius));
      grad.addColorStop(0, color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1, radius), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-radius * 2.5, 0);
      ctx.lineTo(radius * 2.5, 0);
      ctx.moveTo(0, -radius * 2.5);
      ctx.lineTo(0, radius * 2.5);
      ctx.stroke();
      ctx.restore();
    }

    function drawShard(ctx, x, y, length, thickness, angle, color, alpha) {
      if (length <= 0 || thickness <= 0) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      const grad = ctx.createLinearGradient(0, -length / 2, 0, length / 2);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.5, color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, -length / 2);
      ctx.lineTo(thickness / 2, 0);
      ctx.lineTo(0, length / 2);
      ctx.lineTo(-thickness / 2, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawRing(ctx, x, y, radius, color, alpha) {
      if (radius <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha * 0.7;
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1, radius), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    function drawCross(ctx, x, y, radius, color, alpha) {
      if (radius <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(x - radius, y);
      ctx.lineTo(x + radius, y);
      ctx.moveTo(x, y - radius);
      ctx.lineTo(x, y + radius);
      ctx.stroke();
      ctx.restore();
    }

    function drawPixel(ctx, x, y, len, thick, color, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.fillRect(x - len / 2, y - thick / 2, len, thick);
      ctx.restore();
    }

    function drawStream(ctx, x, y, thick, len, color, alpha) {
      if (len <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      const grad = ctx.createLinearGradient(0, y - len, 0, y);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, color);
      ctx.fillStyle = grad;
      ctx.fillRect(x - thick / 2, y - len, thick, len);
      ctx.restore();
    }

    function drawCapsule(ctx, x, y, length, thickness, angle, color, alpha) {
      if (length <= 0 || thickness <= 0) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = alpha;
      const grad = ctx.createLinearGradient(-length / 2, 0, length / 2, 0);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(0.25, color);
      grad.addColorStop(0.75, color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      const rad = Math.max(0.5, thickness / 2);
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-length / 2, -thickness / 2, length, thickness, rad);
      } else {
        ctx.rect(-length / 2, -thickness / 2, length, thickness);
      }
      ctx.fill();
      ctx.restore();
    }

    function drawBokeh(ctx, x, y, radius, color, alpha) {
      if (radius <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0.01, Math.min(0.08, alpha));
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, color);
      grad.addColorStop(0.35, color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawOrb(ctx, x, y, radius, color, alpha, glow = true) {
      if (radius <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      if (glow && radius >= 1.5) {
        ctx.save();
        ctx.globalAlpha = alpha * 0.45;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius * 2.2);
        grad.addColorStop(0, color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.65, radius), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function drawDust(ctx, x, y, radius, color, alpha) {
      if (radius <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.6, radius), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function getParticleColor(p) {
      if (!kineticPalette) return 'transparent';
      const pal = kineticSubPalette || kineticPalette;
      if (kineticSubvariant === 'gold') {
        if (p.shape === 'star') return pal.accentHighlight || pal.accents[1];
        if (p.shape === 'bokeh') return pal.accentDefault || pal.accents[0];
        if (p.shape === 'dust') return p.tone === 0 ? (pal.accentHighlight || pal.accents[1]) : (pal.accentDefault || pal.accents[0]);
        if (p.tone === 1) return pal.accentHover || pal.accents[1];
        if (p.tone === 2) return pal.accentActive || pal.accents[2];
        return pal.accentDefault || pal.accents[0];
      } else if (kineticSubvariant === 'cosmos') {
        if (p.shape === 'ring') return pal.borderFocus || pal.accents[0];
        if (p.shape === 'diamond') return pal.info || pal.accents[1];
        if (p.shape === 'bokeh') return pal.info || pal.accents[1];
        if (p.shape === 'dust') return p.tone === 0 ? (pal.info || pal.accents[1]) : (pal.borderFocus || pal.accents[0]);
        if (p.tone === 1) return pal.borderFocus || pal.accents[0];
        return pal.textPrimary || pal.muted;
      } else if (kineticSubvariant === 'titanium') {
        if (p.shape === 'flare') return pal.textPrimary || pal.muted;
        if (p.shape === 'shard') return (p.tone === 0 ? (pal.borderDefault || pal.muted) : (pal.info || pal.accents[1]));
        if (p.shape === 'bokeh') return pal.borderDefault || pal.muted;
        if (p.shape === 'dust') return p.tone === 0 ? (pal.borderFocus || pal.muted) : (pal.textPrimary || pal.muted);
        return pal.textPrimary || pal.muted;
      } else if (kineticSubvariant === 'cyberpunk') {
        if (p.shape === 'cross') return pal.warning || pal.accents[0];
        if (p.shape === 'stream') return pal.success || pal.accents[1];
        if (p.shape === 'dust') return p.tone === 0 ? (pal.success || pal.accents[1]) : (pal.warning || pal.accents[0]);
        if (p.isSurging) return pal.warning || pal.accents[0];
        return pal.success || pal.accents[1];
      } else if (kineticSubvariant === 'plasma') {
        if (p.shape === 'spark') return pal.accentHighlight || pal.accents[1];
        if (p.shape === 'ember') return (p.tone === 0 ? (pal.accentDefault || pal.accents[0]) : (pal.warning || pal.accents[0]));
        if (p.shape === 'bokeh') return pal.accentDefault || pal.accents[0];
        if (p.shape === 'dust') return p.tone === 0 ? (pal.accentHighlight || pal.accents[1]) : (pal.warning || pal.accents[0]);
        return pal.accentDefault || pal.accents[0];
      } else if (kineticSubvariant === 'swiss') {
        if (p.shape === 'cross') return pal.accentDefault || pal.accents[0];
        if (p.shape === 'ring') return pal.textMuted || pal.muted;
        if (p.shape === 'dust') return pal.textMuted || pal.muted;
        return (p.tone === 0 ? (pal.accentDefault || pal.accents[0]) : (pal.textPrimary || pal.muted));
      }
      return kineticPalette.accents[p.tone % kineticPalette.accents.length];
    }

    /* ── Expanding Wavefront Ripples, Periodic Comets & Cursor Spotlight ── */
    function stepAndDrawRipples(ctx, advance) {
      if (kineticRipples.length === 0) return;
      for (let i = kineticRipples.length - 1; i >= 0; i--) {
        const rip = kineticRipples[i];
        if (advance) {
          rip.r += rip.speed;
          rip.alpha *= 0.94;
        }
        if (rip.r >= rip.maxR || rip.alpha <= 0.01) {
          kineticRipples.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = rip.alpha;
        ctx.strokeStyle = rip.color;
        ctx.lineWidth = Math.max(0.5, 2.5 * (1 - rip.r / rip.maxR));
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }

    function stepAndDrawComets(ctx, w, h, advance) {
      const now = performance.now();
      if (advance && kineticComets.length === 0 && now - kineticLastCometTime > 7500) {
        if (Math.random() < 0.04) {
          kineticLastCometTime = now;
          const startX = Math.random() < 0.5 ? -40 : w + 40;
          const targetX = startX < 0 ? w * (0.6 + Math.random() * 0.3) : w * (0.1 + Math.random() * 0.3);
          const startY = Math.random() * (h * 0.35);
          const angle = Math.atan2((h * 0.6 + Math.random() * h * 0.3) - startY, targetX - startX);
          const speed = 14 + Math.random() * 8;
          kineticComets.push({
            x: startX,
            y: startY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            len: 45 + Math.random() * 40,
            life: 1.0,
            decay: 0.016 + Math.random() * 0.008,
          });
        }
      }

      if (kineticComets.length === 0) return;
      const pal = kineticSubPalette || kineticPalette;
      let cometColor = pal.accentHighlight || pal.accentDefault || (pal.accents && pal.accents[0]);
      if (kineticSubvariant === 'cosmos') cometColor = pal.info || cometColor;
      else if (kineticSubvariant === 'titanium') cometColor = pal.textPrimary || cometColor;
      else if (kineticSubvariant === 'cyberpunk') cometColor = pal.warning || cometColor;
      else if (kineticSubvariant === 'plasma') cometColor = pal.accentHighlight || cometColor;

      for (let i = kineticComets.length - 1; i >= 0; i--) {
        const c = kineticComets[i];
        if (advance) {
          c.x += c.vx;
          c.y += c.vy;
          c.life -= c.decay;
        }
        if (c.life <= 0 || c.x < -100 || c.x > w + 100 || c.y > h + 100) {
          kineticComets.splice(i, 1);
          continue;
        }
        const grad = ctx.createLinearGradient(c.x, c.y, c.x - c.vx * 3.5, c.y - c.vy * 3.5);
        grad.addColorStop(0, cometColor);
        grad.addColorStop(1, 'transparent');
        ctx.save();
        ctx.globalAlpha = c.life * 0.75;
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(c.x - c.vx * 3.5, c.y - c.vy * 3.5);
        ctx.stroke();
        ctx.fillStyle = cometColor;
        ctx.beginPath();
        ctx.arc(c.x, c.y, 2.0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function drawCursorSpotlight(ctx, w, h, isDark) {
      if (!isDark || !kineticMouse.isOver || kineticMouse.x < 0 || kineticMouse.y < 0) return;
      const mx = kineticMouse.x - w / 2;
      const my = kineticMouse.y - h / 2;
      const mqx = Math.max(0, Math.abs(mx) - 170) / 180;
      const mqy = Math.abs(my) / 165;
      const mTextDist = Math.sqrt(mqx * mqx + mqy * mqy);
      let spotAlpha = 0.045;
      if (mTextDist < 1.45) {
        const t = Math.max(0, (mTextDist - 0.95) / 0.5);
        spotAlpha *= t * t * (3 - 2 * t);
      }
      if (spotAlpha <= 0.001) return;

      const pal = kineticSubPalette || kineticPalette;
      let spotColor = pal.accentHighlight || pal.accentDefault || (pal.accents && pal.accents[0]);
      if (kineticSubvariant === 'cosmos') spotColor = pal.info || spotColor;
      else if (kineticSubvariant === 'titanium') spotColor = pal.borderFocus || spotColor;
      else if (kineticSubvariant === 'cyberpunk') spotColor = pal.success || spotColor;
      else if (kineticSubvariant === 'plasma') spotColor = pal.accentHighlight || spotColor;
      else if (kineticSubvariant === 'swiss') spotColor = pal.accentDefault || spotColor;

      ctx.save();
      const grad = ctx.createRadialGradient(kineticMouse.x, kineticMouse.y, 0, kineticMouse.x, kineticMouse.y, 190);
      grad.addColorStop(0, spotColor);
      grad.addColorStop(0.4, spotColor);
      grad.addColorStop(1, 'transparent');
      ctx.globalAlpha = spotAlpha;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(kineticMouse.x, kineticMouse.y, 190, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    /** Paints the field; advance=true moves the particles one step first (false = repaint the current still frame). */
    function drawKineticFrame(advance) {
      if (!kineticCtx || !kineticPalette) return;
      const rect = kineticCanvas.parentElement.getBoundingClientRect();
      if (rect.width === 0) return;
      const w = rect.width;
      const h = rect.height;
      kineticCtx.clearRect(0, 0, w, h);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark' ||
        (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      kineticCtx.globalCompositeOperation = isDark ? 'screen' : 'source-over';

      // 3D camera parallax tilt towards cursor
      const targetCamX = (kineticMouse.isOver ? (kineticMouse.x - w / 2) : 0) * 0.08;
      const targetCamY = (kineticMouse.isOver ? (kineticMouse.y - h / 2) : 0) * 0.08;
      if (advance) {
        kineticCamX += (targetCamX - kineticCamX) * 0.06;
        kineticCamY += (targetCamY - kineticCamY) * 0.06;
      }

      const projected = kineticParticles.map((p) => {
        if (advance) stepKineticParticle(p, w, h);
        const scale = KINETIC_FOV / (KINETIC_FOV + p.z);
        const parallaxFactor = (180 - p.z) / 360;
        const px = p.x - kineticCamX * parallaxFactor;
        const py = p.y - kineticCamY * parallaxFactor;
        const screenX = w / 2 + px * scale;
        const screenY = h / 2 + py * scale;

        let spotFactor = 1.0;
        if (kineticMouse.isOver && kineticMouse.x >= 0) {
          const mDist = Math.hypot(screenX - kineticMouse.x, screenY - kineticMouse.y);
          if (mDist < 190) {
            spotFactor = 1.0 + (1 - mDist / 190) * 0.35;
          }
        }

        return {
          x: screenX,
          y: screenY,
          scale,
          radius: p.baseRadius * scale * (spotFactor > 1.0 ? 1.15 : 1.0),
          length: p.length * scale * (spotFactor > 1.0 ? 1.15 : 1.0),
          thickness: p.thickness * scale,
          isPill: p.isPill,
          shape: p.shape,
          angle: p.angle,
          tone: p.tone,
          alpha: p.alpha,
          fadeAlpha: p.fadeAlpha,
          lensScale: p.lensScale,
          isSurging: p.isSurging,
          spotFactor,
        };
      });

      drawCursorSpotlight(kineticCtx, w, h, isDark);

      for (const p of projected) {
        const baseAlpha = p.alpha != null ? p.alpha : 0.88;
        const fade = p.fadeAlpha != null ? p.fadeAlpha : 1.0;
        const alpha = Math.min(1.0, baseAlpha * fade * p.spotFactor);
        if (alpha <= 0.008) continue;
        const color = getParticleColor(p);

        if (p.shape === 'bokeh') {
          drawBokeh(kineticCtx, p.x, p.y, p.radius, color, alpha);
        } else if (p.shape === 'star') {
          drawSparkle(kineticCtx, p.x, p.y, p.radius, p.angle, color, alpha);
        } else if (p.shape === 'diamond' || p.shape === 'shard') {
          drawShard(kineticCtx, p.x, p.y, p.length, p.thickness, p.angle, color, alpha);
        } else if (p.shape === 'ring') {
          drawRing(kineticCtx, p.x, p.y, p.radius, color, alpha);
        } else if (p.shape === 'cross') {
          drawCross(kineticCtx, p.x, p.y, p.radius, color, alpha);
        } else if (p.shape === 'pixel') {
          drawPixel(kineticCtx, p.x, p.y, p.length, p.thickness, color, alpha);
        } else if (p.shape === 'stream') {
          drawStream(kineticCtx, p.x, p.y, p.thickness, p.length, color, alpha);
        } else if (p.shape === 'pill' || (p.isPill && p.length > 2)) {
          drawCapsule(kineticCtx, p.x, p.y, p.length, p.thickness, p.angle, color, alpha);
        } else if (p.shape === 'halftone') {
          drawOrb(kineticCtx, p.x, p.y, p.radius * (p.lensScale || 1), color, alpha, false);
        } else if (p.shape === 'dust') {
          drawDust(kineticCtx, p.x, p.y, p.radius, color, alpha);
        } else {
          drawOrb(kineticCtx, p.x, p.y, Math.max(1, p.radius), color, alpha, true);
        }
      }

      stepAndDrawComets(kineticCtx, w, h, advance);
      stepAndDrawRipples(kineticCtx, advance);
      kineticCtx.globalCompositeOperation = 'source-over';
      clearKineticTextArea();
    }

    /**
     * Keeps the hero copy on the plain card surface: every text line box and CTA of the HeroSection is cut out
     * of the painted field with zero extra padding, so particles never lower the text contrast while leaving
     * zero visible rectangular boundaries on the open canvas.
     */
    function clearKineticTextArea() {
      const hero = kineticCanvas.parentElement.querySelector('.joy-hero');
      if (!hero) return;
      const origin = kineticCanvas.getBoundingClientRect();
      const rects = [];
      hero.querySelectorAll('.joy-hero__title, .joy-hero__subtitle').forEach((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        rects.push(...range.getClientRects());
      });
      hero.querySelectorAll('.joy-hero__badge, .joy-hero__ctas .joy-button').forEach((el) => rects.push(el.getBoundingClientRect()));
      const subBar = kineticCanvas.parentElement.querySelector('.kinetic-subvariants-bar');
      if (subBar) {
        subBar.querySelectorAll('.kinetic-sub-btn').forEach((btn) => rects.push(btn.getBoundingClientRect()));
      }
      const pad = 1;
      kineticCtx.save();
      kineticCtx.globalCompositeOperation = 'destination-out';
      kineticCtx.fillStyle = kineticPalette.muted;
      for (const r of rects) {
        kineticCtx.fillRect(r.left - origin.left - pad, r.top - origin.top - pad, r.width + pad * 2, r.height + pad * 2);
      }
      kineticCtx.restore();
    }

    /* ── Hero Options Switcher (8 Archetypes) & Interactive Engines ── */
    function switchHeroOption(opt) {
      const panels = {
        antigravity: document.getElementById('kinetic-hero-container'),
        mesh3d: document.getElementById('mesh-hero-container'),
        editorial: document.getElementById('editorial-cover-container'),
        keynote: document.getElementById('keynote-hero-container'),
        cockpit: document.getElementById('cockpit-hero-container'),
        cyberpunk: document.getElementById('cyberpunk-hero-container'),
        swiss: document.getElementById('swiss-hero-container'),
        aura: document.getElementById('aura-hero-container'),
      };
      const btns = {
        antigravity: document.getElementById('btn-hero-opt-antigravity'),
        mesh3d: document.getElementById('btn-hero-opt-mesh3d'),
        editorial: document.getElementById('btn-hero-opt-editorial'),
        keynote: document.getElementById('btn-hero-opt-keynote'),
        cockpit: document.getElementById('btn-hero-opt-cockpit'),
        cyberpunk: document.getElementById('btn-hero-opt-cyberpunk'),
        swiss: document.getElementById('btn-hero-opt-swiss'),
        aura: document.getElementById('btn-hero-opt-aura'),
      };
      for (const [key, panel] of Object.entries(panels)) {
        if (!panel) continue;
        const active = key === opt;
        panel.style.display = active ? (key === 'editorial' ? 'flex' : 'block') : 'none';
        if (active) panel.classList.add('active');
        else panel.classList.remove('active');
      }
      for (const [key, btn] of Object.entries(btns)) {
        if (!btn) continue;
        const active = key === opt;
        btn.classList.toggle('active', active);
        btn.setAttribute('aria-selected', active ? 'true' : 'false');
      }
      if (opt === 'antigravity') {
        resizeKineticCanvas();
        syncKinetic();
      } else if (opt === 'mesh3d') {
        resizeMesh3dCanvas();
        syncMesh3d();
      } else if (opt === 'cockpit') {
        initCockpitSparkline();
      }
      const heroNames = {
        antigravity: 'Antigravity Particles',
        mesh3d: '3D Wave Mesh',
        editorial: 'Editorial Cover',
        keynote: 'Apple Keynote',
        cockpit: 'SaaS Cockpit',
        cyberpunk: 'Cyberpunk HUD',
        swiss: 'Swiss Poster',
        aura: 'Fluid Aura'
      };
      if (typeof showDemoToast === 'function' && heroNames[opt]) {
        showDemoToast('Hero archetype: ' + heroNames[opt], 'info');
      }
    }
    window.switchHeroOption = switchHeroOption;

    /* Cockpit Hero Live Telemetry Sparkline */
    let cockpitCanvas, cockpitCtx;
    let cockpitPoints = [42, 45, 41, 48, 39, 44, 46, 43, 40, 42, 47, 41, 43, 40, 38, 41, 44, 42];
    function initCockpitSparkline() {
      cockpitCanvas = document.getElementById('cockpit-sparkline-canvas');
      if (!cockpitCanvas) return;
      cockpitCtx = cockpitCanvas.getContext('2d');
      drawCockpitSparkline();
    }
    function drawCockpitSparkline() {
      if (!cockpitCtx || !cockpitCanvas) return;
      const w = cockpitCanvas.width;
      const h = cockpitCanvas.height;
      cockpitCtx.clearRect(0, 0, w, h);
      
      const cs = getComputedStyle(document.documentElement);
      const accent = cs.getPropertyValue('--joy-accent-default').trim();
      const border = cs.getPropertyValue('--joy-border-subtle').trim();
      
      // Draw grid line
      cockpitCtx.strokeStyle = border;
      cockpitCtx.lineWidth = 1;
      cockpitCtx.beginPath();
      cockpitCtx.moveTo(0, h / 2);
      cockpitCtx.lineTo(w, h / 2);
      cockpitCtx.stroke();
      
      // Draw sparkline curve
      cockpitCtx.strokeStyle = accent;
      cockpitCtx.lineWidth = 2;
      cockpitCtx.beginPath();
      const step = w / (cockpitPoints.length - 1);
      cockpitPoints.forEach((pt, idx) => {
        const y = h - ((pt - 30) / 30) * h;
        if (idx === 0) cockpitCtx.moveTo(0, y);
        else cockpitCtx.lineTo(idx * step, y);
      });
      cockpitCtx.stroke();
    }

    let mesh3dCanvas, mesh3dCtx;
    let mesh3dAnimId = null;
    let mesh3dVisible = false;
    let mesh3dTime = 0;
    let mesh3dMouse = { x: 0, y: 0, targetPitch: 0.35, targetYaw: 0, pitch: 0.35, yaw: 0 };
    const MESH_COLS = 26;
    const MESH_ROWS = 16;
    const MESH_SPACING = 36;

    function initMesh3dCanvas() {
      mesh3dCanvas = document.getElementById('mesh-3d-canvas');
      const container = document.getElementById('mesh-hero-container');
      if (!mesh3dCanvas || !container) return;
      mesh3dCtx = mesh3dCanvas.getContext('2d');

      container.addEventListener('mousemove', (e) => {
        const rect = container.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        mesh3dMouse.targetYaw = nx * 0.45;
        mesh3dMouse.targetPitch = 0.35 + ny * 0.25;
      });
      container.addEventListener('mouseleave', () => {
        mesh3dMouse.targetYaw = 0;
        mesh3dMouse.targetPitch = 0.35;
      });

      new IntersectionObserver((entries) => {
        mesh3dVisible = entries[entries.length - 1].isIntersecting;
        if (mesh3dVisible) resizeMesh3dCanvas();
        syncMesh3d();
      }).observe(container);

      window.addEventListener('resize', () => {
        resizeMesh3dCanvas();
        if (mesh3dAnimId === null && mesh3dVisible) drawMesh3dFrame();
      });
    }

    function resizeMesh3dCanvas() {
      if (!mesh3dCanvas) return;
      const rect = mesh3dCanvas.parentElement ? mesh3dCanvas.parentElement.getBoundingClientRect() : null;
      if (!rect || rect.width === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      mesh3dCanvas.width = rect.width * dpr;
      mesh3dCanvas.height = rect.height * dpr;
      if (mesh3dCtx) mesh3dCtx.scale(dpr, dpr);
    }

    function syncMesh3d() {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!mesh3dVisible || document.hidden || reduce) {
        if (mesh3dAnimId !== null) cancelAnimationFrame(mesh3dAnimId);
        mesh3dAnimId = null;
        if (mesh3dCanvas && mesh3dVisible && reduce) drawMesh3dFrame();
        return;
      }
      if (mesh3dAnimId === null) mesh3dAnimId = requestAnimationFrame(mesh3dTick);
    }

    function mesh3dTick() {
      mesh3dAnimId = null;
      mesh3dTime += 0.02;
      mesh3dMouse.pitch += (mesh3dMouse.targetPitch - mesh3dMouse.pitch) * 0.06;
      mesh3dMouse.yaw += (mesh3dMouse.targetYaw - mesh3dMouse.yaw) * 0.06;
      drawMesh3dFrame();
      syncMesh3d();
    }

    function drawMesh3dFrame() {
      if (!mesh3dCtx || !mesh3dCanvas) return;
      const rect = mesh3dCanvas.parentElement.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      if (w === 0 || h === 0) return;
      mesh3dCtx.clearRect(0, 0, w, h);

      const cs = getComputedStyle(document.documentElement);
      const accent = cs.getPropertyValue('--joy-accent-default').trim();
      const border = cs.getPropertyValue('--joy-border-default').trim();
      const fov = 320;
      const cx = w / 2;
      const cy = h / 2 + 50;

      const cosP = Math.cos(mesh3dMouse.pitch);
      const sinP = Math.sin(mesh3dMouse.pitch);
      const cosY = Math.cos(mesh3dMouse.yaw);
      const sinY = Math.sin(mesh3dMouse.yaw);

      const grid = [];
      const xOffset = ((MESH_COLS - 1) * MESH_SPACING) / 2;
      const zOffset = ((MESH_ROWS - 1) * MESH_SPACING) / 2;

      for (let r = 0; r < MESH_ROWS; r++) {
        grid[r] = [];
        for (let c = 0; c < MESH_COLS; c++) {
          const wx = c * MESH_SPACING - xOffset;
          const wz = r * MESH_SPACING - zOffset;
          const dist = Math.hypot(wx, wz) * 0.015;
          const wy = Math.sin(c * 0.35 + mesh3dTime * 1.5) * 14 + Math.cos(r * 0.4 + mesh3dTime) * 10 + Math.sin(dist * 5 - mesh3dTime * 2) * 8;

          const rx = wx * cosY - wz * sinY;
          const rz = wz * cosY + wx * sinY;
          const ry = wy * cosP - rz * sinP;
          const finalZ = rz * cosP + wy * sinP + 380;

          if (finalZ <= 10) continue;
          const scale = fov / finalZ;
          const sx = cx + rx * scale;
          const sy = cy + ry * scale;
          const alpha = Math.max(0.08, Math.min(0.7, 1 - (finalZ - 200) / 450));
          grid[r][c] = { sx, sy, alpha, finalZ };
        }
      }

      mesh3dCtx.lineWidth = 1;
      for (let r = 0; r < MESH_ROWS; r++) {
        for (let c = 0; c < MESH_COLS - 1; c++) {
          const p1 = grid[r][c];
          const p2 = grid[r][c + 1];
          if (!p1 || !p2) continue;
          mesh3dCtx.strokeStyle = r % 3 === 0 ? accent : border;
          mesh3dCtx.globalAlpha = Math.min(p1.alpha, p2.alpha) * 0.5;
          mesh3dCtx.beginPath();
          mesh3dCtx.moveTo(p1.sx, p1.sy);
          mesh3dCtx.lineTo(p2.sx, p2.sy);
          mesh3dCtx.stroke();
        }
      }
      for (let c = 0; c < MESH_COLS; c++) {
        for (let r = 0; r < MESH_ROWS - 1; r++) {
          const p1 = grid[r][c];
          const p2 = grid[r + 1][c];
          if (!p1 || !p2) continue;
          mesh3dCtx.strokeStyle = c % 4 === 0 ? accent : border;
          mesh3dCtx.globalAlpha = Math.min(p1.alpha, p2.alpha) * 0.4;
          mesh3dCtx.beginPath();
          mesh3dCtx.moveTo(p1.sx, p1.sy);
          mesh3dCtx.lineTo(p2.sx, p2.sy);
          mesh3dCtx.stroke();
        }
      }

      for (let r = 0; r < MESH_ROWS; r += 2) {
        for (let c = 0; c < MESH_COLS; c += 3) {
          const p = grid[r] && grid[r][c];
          if (!p) continue;
          mesh3dCtx.globalAlpha = p.alpha * 0.85;
          mesh3dCtx.fillStyle = accent;
          mesh3dCtx.beginPath();
          mesh3dCtx.arc(p.sx, p.sy, 2, 0, Math.PI * 2);
          mesh3dCtx.fill();
        }
      }

      mesh3dCtx.globalAlpha = 1;

      const hero = mesh3dCanvas.parentElement.querySelector('.joy-hero');
      if (hero) {
        const origin = mesh3dCanvas.getBoundingClientRect();
        const rects = [];
        hero.querySelectorAll('.joy-hero__title, .joy-hero__subtitle').forEach((el) => {
          const range = document.createRange();
          range.selectNodeContents(el);
          rects.push(...range.getClientRects());
        });
        hero.querySelectorAll('.joy-hero__badge, .joy-hero__ctas .joy-button').forEach((el) => rects.push(el.getBoundingClientRect()));
        const pad = 12;
        mesh3dCtx.save();
        mesh3dCtx.globalCompositeOperation = 'destination-out';
        mesh3dCtx.fillStyle = border;
        for (const r of rects) {
          mesh3dCtx.fillRect(r.left - origin.left - pad, r.top - origin.top - pad, r.width + pad * 2, r.height + pad * 2);
        }
        mesh3dCtx.restore();
      }
    }

    // Hero CTAs are SSR markup from the generator; their actions are wired here.
    document.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('.joy-hero__ctas .joy-button');
      if (!btn) return;
      const primary = btn.classList.contains('joy-button--solid');
      if (btn.closest('#view-overview')) {
        switchView(primary ? 'button' : 'tokens');
      } else if (btn.closest('#kinetic-hero-container')) {
        showDemoToast(primary ? 'Deploying the pipeline' : 'Opening the API guide', primary ? 'success' : 'info');
      } else if (btn.closest('#mesh-hero-container')) {
        showDemoToast(primary ? 'Downloading desktop app' : 'Opening web workspace', primary ? 'success' : 'info');
      } else if (btn.closest('#keynote-hero-container')) {
        showDemoToast(primary ? 'Configuring your iPhone Duo' : 'Streaming Apple Keynote replay', primary ? 'success' : 'info');
      } else if (btn.closest('#cockpit-hero-container')) {
        showDemoToast(primary ? 'Launching Institutional Terminal' : 'Opening WebSocket API docs', primary ? 'success' : 'info');
      } else if (btn.closest('#cyberpunk-hero-container')) {
        showDemoToast(primary ? 'Neural link synchronized' : 'Telemetry logs decrypted', primary ? 'success' : 'info');
      } else if (btn.closest('#swiss-hero-container')) {
        showDemoToast(primary ? 'Modernist design tokens active' : 'Reading 1957 Zurich Manifesto', primary ? 'success' : 'info');
      } else if (btn.closest('#aura-hero-container')) {
        showDemoToast(primary ? 'Chromatic mesh tokens loaded' : 'Viewing fluid palette showcase', primary ? 'success' : 'info');
      }
    });

    /* ── Apple Continuous Narrative Landing Page Engine ── */
    function updateDevicePosture(val) {
      const angle = parseInt(val, 10);
      const rightWing = document.getElementById('apple-fold-wing-right');
      const angleLabel = document.getElementById('apple-posture-angle-label');
      const modeBadge = document.getElementById('apple-posture-mode-badge');
      if (rightWing) {
        // Map 0 (folded) to -180deg, 180 (flat) to 0deg
        const rotY = -(180 - angle);
        rightWing.style.transform = 'rotateY(' + rotY + 'deg)';
      }
      if (angleLabel) angleLabel.textContent = 'มุมพับ: ' + angle + '°';
      if (modeBadge) {
        if (angle <= 25) modeBadge.textContent = 'โหมดพับปิด (Compact Pocket)';
        else if (angle <= 75) modeBadge.textContent = 'โหมดกางตั้ง (Tent Stand)';
        else if (angle <= 100) modeBadge.textContent = 'โหมดแนวตั้ง (Book Reading)';
        else if (angle <= 135) modeBadge.textContent = 'โหมดแนวนอน (Laptop Mode)';
        else modeBadge.textContent = 'โหมดวางเปิด (Flat Canvas)';
      }
    }
    window.updateDevicePosture = updateDevicePosture;

    function setDevicePosturePreset(angle, mode, btn) {
      const slider = document.getElementById('apple-posture-slider');
      if (slider) slider.value = angle;
      updateDevicePosture(angle);
      document.querySelectorAll('.apple-posture-pill').forEach(p => p.classList.remove('active'));
      if (btn) btn.classList.add('active');
    }
    window.setDevicePosturePreset = setDevicePosturePreset;

    function runDurabilityCycle() {
      showDemoToast('กำลังทดสอบความทนทานบานพับ Armor Hinge...', 'info');
      const slider = document.getElementById('apple-posture-slider');
      let step = 0;
      const sequence = [180, 140, 90, 45, 0, 45, 90, 110];
      const timer = setInterval(() => {
        if (step >= sequence.length) {
          clearInterval(timer);
          showDemoToast('การทดสอบความทนทานบานพับ Armor Hinge 500,000 ครั้ง สำเร็จ', 'success');
          return;
        }
        const ang = sequence[step++];
        if (slider) slider.value = ang;
        updateDevicePosture(ang);
      }, 120);
    }
    window.runDurabilityCycle = runDurabilityCycle;

    function switchCinemaAspect(aspect, btn) {
      const canvas = document.getElementById('apple-cinema-canvas');
      if (canvas) {
        if (aspect === '21-9') canvas.style.aspectRatio = '21 / 9';
        else if (aspect === '16-9') canvas.style.aspectRatio = '16 / 9';
        else if (aspect === '4-3') canvas.style.aspectRatio = '4 / 3';
      }
      if (btn && btn.parentElement) {
        btn.parentElement.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    }
    window.switchCinemaAspect = switchCinemaAspect;

    function setDeviceFinish(finishName, colorVar, btn) {
      const nameEl = document.getElementById('apple-finish-name');
      if (nameEl) nameEl.textContent = finishName;
      document.querySelectorAll('.apple-swatch-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      
      const leftWing = document.querySelector('.apple-fold-wing--left');
      const rightWing = document.querySelector('.apple-fold-wing--right');
      if (leftWing) leftWing.style.borderColor = colorVar;
      if (rightWing) rightWing.style.borderColor = colorVar;
    }
    window.setDeviceFinish = setDeviceFinish;

    function selectStorageTier(tier, price, btn) {
      const priceEl = document.getElementById('apple-customizer-price');
      if (priceEl) priceEl.textContent = '฿' + price;
      document.querySelectorAll('.apple-storage-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
    }
    window.selectStorageTier = selectStorageTier;

    function scrollToAppleScene(id) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    window.scrollToAppleScene = scrollToAppleScene;

    /* ── Smart Glasses Head-Up Display (Glasses HUD) Engine (F-056 / F-057) ── */
    let hudPhosphor = 'green'; // 'green' | 'amber' | 'dual'
    let hudState = 'talking'; // 'listening' | 'watching' | 'talking' | 'recording'
    let hudMode = 'Voice'; // 'Voice' | 'Watch' | 'Pause'
    let hudActiveView = 'todos'; // 'todos' | 'control_center' | 'todo_detail' | 'com_guide'
    let hudSelectedTodo = 0;
    let hudSelectedControl = 0;
    let hudSelectedAction = 0;
    let hudSpeechTimer = null;
    let hudTodos = [
      { id: 0, text: 'Walk 3 Km', done: false },
      { id: 1, text: 'Prepare Meeting note', done: true },
      { id: 2, text: 'Meeting with John', done: false }
    ];

    function logHudEvent(msg) {
      const feed = document.getElementById('hud-event-feed');
      if (feed) feed.textContent = msg;
    }

    function switchHudPhosphor(mode, btn) {
      hudPhosphor = mode;
      const frame = document.getElementById('hud-visor-frame');
      if (frame) frame.setAttribute('data-phosphor', mode);
      if (btn && btn.parentElement) {
        btn.parentElement.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      logHudEvent('[EMITTER] Optical phosphor set to: ' + mode.toUpperCase());
    }
    window.switchHudPhosphor = switchHudPhosphor;

    function switchHudAmbientScene(scene, btn) {
      const frame = document.getElementById('hud-visor-frame');
      if (frame) frame.setAttribute('data-scene', scene);
      if (btn && btn.parentElement) {
        btn.parentElement.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
      logHudEvent('[OPTICS] Ambient background set to: ' + scene);
    }
    window.switchHudAmbientScene = switchHudAmbientScene;

    function renderHudTodosView() {
      const container = document.getElementById('hud-view-todos');
      if (!container) return;
      container.innerHTML = '';
      hudTodos.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'hud-list-item' + (idx === hudSelectedTodo ? ' selected' : '');
        row.setAttribute('data-index', idx);
        row.onclick = () => selectHudTodoItem(idx);

        const arrow = document.createElement('span');
        arrow.className = 'hud-cursor-arrow';
        arrow.textContent = (idx === hudSelectedTodo ? '▶' : ' ');

        const box = document.createElement('div');
        box.id = 'todo-box-' + idx;
        box.className = 'hud-checkbox-box' + (item.done ? ' checked' : '');
        box.textContent = (item.done ? '[x]' : '[ ]');

        const label = document.createElement('span');
        label.textContent = item.text;
        if (item.done) label.style.textDecoration = 'line-through';

        row.appendChild(arrow);
        row.appendChild(box);
        row.appendChild(label);
        container.appendChild(row);
      });

      const badge = document.getElementById('hud-todos-badge');
      if (badge) {
        const doneCount = hudTodos.filter(t => t.done).length;
        badge.textContent = '[ ' + doneCount + ' / ' + hudTodos.length + ' ]';
      }
    }

    function renderHudControlCenterView() {
      const container = document.getElementById('hud-view-control-center');
      if (!container) return;
      const items = container.querySelectorAll('.hud-list-item');
      items.forEach((el, idx) => {
        const arrow = el.querySelector('.hud-cursor-arrow');
        if (idx === hudSelectedControl) {
          el.classList.add('selected');
          if (arrow) arrow.textContent = '▶';
        } else {
          el.classList.remove('selected');
          if (arrow) arrow.textContent = ' ';
        }
      });
    }

    function renderHudTodoDetailView() {
      const container = document.getElementById('hud-view-todo-detail');
      const titleEl = document.getElementById('hud-detail-title');
      if (!container || !titleEl) return;
      const curItem = hudTodos[hudSelectedTodo];
      if (curItem) titleEl.textContent = curItem.text;

      const items = container.querySelectorAll('.hud-list-item');
      items.forEach((el, idx) => {
        const arrow = el.querySelector('.hud-cursor-arrow');
        if (idx === hudSelectedAction) {
          el.classList.add('selected');
          if (arrow) arrow.textContent = '▶';
        } else {
          el.classList.remove('selected');
          if (arrow) arrow.textContent = ' ';
        }
      });
    }

    function updateHudStateUI() {
      const pill = document.getElementById('hud-com-pill');
      const modeLabel = document.getElementById('hud-mode-label');
      const stateLabel = document.getElementById('hud-state-label');
      const titleEl = document.getElementById('hud-assist-title');
      const guideEl = document.getElementById('hud-assist-guide');

      if (pill) pill.setAttribute('data-state', hudState);
      if (modeLabel) modeLabel.textContent = hudMode;
      if (stateLabel) {
        if (hudState === 'talking') stateLabel.textContent = '▶ TALKING (AI Talking)';
        else if (hudState === 'listening') stateLabel.textContent = '[~ LISTEN] (Listening)';
        else if (hudState === 'watching') stateLabel.textContent = '〇 WATCH (Watching)';
        else if (hudState === 'recording') stateLabel.textContent = '● REC (Recording)';
      }

      // Hide all assist views, then show active
      const vCc = document.getElementById('hud-view-control-center');
      const vTodos = document.getElementById('hud-view-todos');
      const vDetail = document.getElementById('hud-view-todo-detail');
      const vGuide = document.getElementById('hud-view-com-guide');

      if (vCc) vCc.style.display = (hudActiveView === 'control_center' ? 'flex' : 'none');
      if (vTodos) vTodos.style.display = (hudActiveView === 'todos' ? 'flex' : 'none');
      if (vDetail) vDetail.style.display = (hudActiveView === 'todo_detail' ? 'flex' : 'none');
      if (vGuide) vGuide.style.display = (hudActiveView === 'com_guide' ? 'flex' : 'none');

      if (titleEl && guideEl) {
        if (hudActiveView === 'todos') {
          titleEl.textContent = 'Today Todos';
          guideEl.textContent = '◄ double tap : to Control Center';
          renderHudTodosView();
        } else if (hudActiveView === 'control_center') {
          titleEl.textContent = 'Control Center';
          guideEl.textContent = '▶ tap : select · ▲▼ swipe : move';
          renderHudControlCenterView();
        } else if (hudActiveView === 'todo_detail') {
          const curItem = hudTodos[hudSelectedTodo];
          titleEl.textContent = 'Today Todos > ' + (curItem ? curItem.text : 'Item');
          guideEl.textContent = '◄ double tap : to back';
          renderHudTodoDetailView();
        } else if (hudActiveView === 'com_guide') {
          titleEl.textContent = 'Communication Control';
          guideEl.textContent = '◄ double tap : to back';
        }
      }
    }
    window.updateHudStateUI = updateHudStateUI;

    function selectHudTodoItem(idx) {
      hudSelectedTodo = idx;
      if (hudState === 'talking') {
        if (hudSpeechTimer) clearInterval(hudSpeechTimer);
        hudSpeechTimer = null;
        hudState = 'listening';
      }
      hudActiveView = 'todo_detail';
      hudSelectedAction = 0;
      logHudEvent('[NAV] Opened detail tray for: ' + (hudTodos[hudSelectedTodo] ? hudTodos[hudSelectedTodo].text : 'Item'));
      updateHudStateUI();
    }
    window.selectHudTodoItem = selectHudTodoItem;

    function selectHudControlItem(idx) {
      hudSelectedControl = idx;
      if (hudState === 'talking') {
        if (hudSpeechTimer) clearInterval(hudSpeechTimer);
        hudSpeechTimer = null;
        hudState = 'listening';
      }
      if (idx === 0) {
        hudActiveView = 'com_guide';
        logHudEvent('[NAV] Opened Communication Control guide');
      } else if (idx === 1) {
        hudActiveView = 'todos';
        logHudEvent('[NAV] Opened Daily Todos checklist');
      } else if (idx === 2) {
        showDemoToast('2 Notifications: Battery 84%, Workout synced', 'info');
        logHudEvent('[ALERT] Inspected recent notifications');
      } else if (idx === 3) {
        const scenes = ['cyberpunk', 'daylight', 'optical'];
        const curFrame = document.getElementById('hud-visor-frame');
        const cur = curFrame ? curFrame.getAttribute('data-scene') : 'cyberpunk';
        const nextIdx = (scenes.indexOf(cur) + 1) % scenes.length;
        switchHudAmbientScene(scenes[nextIdx]);
      }
      updateHudStateUI();
    }
    window.selectHudControlItem = selectHudControlItem;

    function executeHudAction(action) {
      const curItem = hudTodos[hudSelectedTodo];
      if (!curItem) return;
      if (action === 'mark_done') {
        curItem.done = true;
        logHudEvent('[ACTION] [x] Marked done: ' + curItem.text);
        showDemoToast('Completed: ' + curItem.text, 'success');
      } else if (action === 'mark_undone') {
        curItem.done = false;
        logHudEvent('[ACTION] [ ] Marked undone: ' + curItem.text);
        showDemoToast('Marked uncompleted: ' + curItem.text, 'info');
      } else if (action === 'delete') {
        hudTodos.splice(hudSelectedTodo, 1);
        hudSelectedTodo = Math.max(0, hudSelectedTodo - 1);
        logHudEvent('[ACTION] [×] Deleted task');
        showDemoToast('Task deleted from checklist', 'warn');
      }
      hudActiveView = 'todos';
      updateHudStateUI();
    }
    window.executeHudAction = executeHudAction;

    function triggerHudGesture(gesture) {
      if (gesture === 'tap') {
        if (hudState === 'talking') {
          if (hudSpeechTimer) clearInterval(hudSpeechTimer);
          hudSpeechTimer = null;
          hudState = 'listening';
          logHudEvent('[INTERRUPT] Speech interrupted by Tap -> Listening mode active');
          showDemoToast('Interrupted speech. Claudia listening...', 'info');
          updateHudStateUI();
          return;
        }

        if (hudActiveView === 'todos') {
          if (hudTodos.length > 0) {
            hudActiveView = 'todo_detail';
            hudSelectedAction = 0;
            logHudEvent('[NAV] Opened detail tray for: ' + hudTodos[hudSelectedTodo].text);
          }
        } else if (hudActiveView === 'control_center') {
          if (hudSelectedControl === 0) {
            hudActiveView = 'com_guide';
            logHudEvent('[NAV] Opened Communication Control guide');
          } else if (hudSelectedControl === 1) {
            hudActiveView = 'todos';
            logHudEvent('[NAV] Opened Daily Todos checklist');
          } else if (hudSelectedControl === 2) {
            showDemoToast('2 Notifications: Battery 84%, Workout synced', 'info');
            logHudEvent('[ALERT] Inspected recent notifications');
          } else if (hudSelectedControl === 3) {
            const scenes = ['cyberpunk', 'daylight', 'optical'];
            const curFrame = document.getElementById('hud-visor-frame');
            const cur = curFrame ? curFrame.getAttribute('data-scene') : 'cyberpunk';
            const nextIdx = (scenes.indexOf(cur) + 1) % scenes.length;
            switchHudAmbientScene(scenes[nextIdx]);
          }
        } else if (hudActiveView === 'todo_detail') {
          const actions = ['mark_done', 'mark_undone', 'delete'];
          executeHudAction(actions[hudSelectedAction]);
          return;
        } else if (hudActiveView === 'com_guide') {
          const modes = ['Voice', 'Watch', 'Pause'];
          const nxt = (modes.indexOf(hudMode) + 1) % modes.length;
          hudMode = modes[nxt];
          const cycleEl = document.getElementById('hud-guide-cycle');
          if (cycleEl) cycleEl.textContent = '[ ' + hudMode.toLowerCase() + ' active ]';
          logHudEvent('[MODE] Cycled communication mode to: ' + hudMode);
        }
      } else if (gesture === 'double_tap') {
        if (hudActiveView === 'todo_detail') {
          hudActiveView = 'todos';
          logHudEvent('[NAV] ◄ Double Tap -> Returned to Today Todos checklist');
        } else if (hudActiveView === 'todos' || hudActiveView === 'com_guide') {
          hudActiveView = 'control_center';
          logHudEvent('[NAV] ◄ Double Tap -> Returned to Control Center');
        } else if (hudActiveView === 'control_center') {
          hudActiveView = 'todos';
          logHudEvent('[NAV] ◄ Double Tap -> Switched to Todos view');
        }
      } else if (gesture === 'swipe_down') {
        if (hudActiveView === 'todos') {
          hudSelectedTodo = (hudSelectedTodo + 1) % Math.max(1, hudTodos.length);
          renderHudTodosView();
        } else if (hudActiveView === 'control_center') {
          hudSelectedControl = (hudSelectedControl + 1) % 4;
          renderHudControlCenterView();
        } else if (hudActiveView === 'todo_detail') {
          hudSelectedAction = (hudSelectedAction + 1) % 3;
          renderHudTodoDetailView();
        }
        logHudEvent('[GESTURE] ▼ Swiped Down -> cursor advanced');
      } else if (gesture === 'swipe_up') {
        if (hudActiveView === 'todos') {
          hudSelectedTodo = (hudSelectedTodo - 1 + hudTodos.length) % Math.max(1, hudTodos.length);
          renderHudTodosView();
        } else if (hudActiveView === 'control_center') {
          hudSelectedControl = (hudSelectedControl - 1 + 4) % 4;
          renderHudControlCenterView();
        } else if (hudActiveView === 'todo_detail') {
          hudSelectedAction = (hudSelectedAction - 1 + 3) % 3;
          renderHudTodoDetailView();
        }
        logHudEvent('[GESTURE] ▲ Swiped Up -> cursor reversed');
      } else if (gesture === 'hold') {
        hudState = 'recording';
        logHudEvent('[RECORD] ● Long press triggered -> Recording voice memo');
        showDemoToast('Recording voice memo (00:03)...', 'warn');
        setTimeout(() => {
          if (hudState === 'recording') {
            hudState = 'listening';
            logHudEvent('[RECORD] Memo recorded. Processing task...');
            showDemoToast('Memo recorded successfully', 'success');
            updateHudStateUI();
          }
        }, 3000);
      }
      updateHudStateUI();
    }
    window.triggerHudGesture = triggerHudGesture;

    function simulateSpeechInput(userText) {
      const userEl = document.getElementById('hud-user-speech');
      const agentEl = document.getElementById('hud-agent-speech');
      if (userEl) userEl.textContent = userText;

      hudState = 'talking';
      updateHudStateUI();
      logHudEvent('[VOICE] User: "' + userText + '"');

      let reply = 'Morning, here Todos:<br>1. Walk 3 Km<br>2. Prepare Meeting note<br>3. Meeting with John';
      if (userText.indexOf('meeting') !== -1) {
        reply = 'Next meeting with John is scheduled at 2:00 PM in Conference Room B.';
      }

      if (agentEl) {
        agentEl.innerHTML = '<span class="hud-typing-cursor"></span>';
        let charIndex = 0;
        if (hudSpeechTimer) clearInterval(hudSpeechTimer);
        hudSpeechTimer = setInterval(() => {
          charIndex += 4;
          if (charIndex >= reply.length) {
            clearInterval(hudSpeechTimer);
            hudSpeechTimer = null;
            agentEl.innerHTML = reply;
            hudState = 'listening';
            updateHudStateUI();
            logHudEvent('[SPEECH] Claudia finished vocalizing. Listening active.');
            return;
          }
          agentEl.innerHTML = reply.substring(0, charIndex) + '<span class="hud-typing-cursor"></span>';
        }, 50);
      }
    }
    window.simulateSpeechInput = simulateSpeechInput;

    // Initial render
    setTimeout(() => {
      renderMarketTable();
      renderPaginationDemo();
      generateMockMarketData();
      drawCandlestickCanvas();
      drawLineCanvas();
      renderRateDemo(4.5);
      renderTimePickerCols();
      renderTransferDemo();
      initKineticCanvas();
      initMesh3dCanvas();
      syncViewFromHash();
    }, 100);

    function switchSimulatorViewport(width, btn) {
      const frame = document.getElementById('simulator-viewport-frame');
      const info = document.getElementById('simulator-viewport-info');
      if (frame) {
        frame.style.maxWidth = width;
        if (width === '375px') {
          frame.setAttribute('data-viewport', 'mobile');
        } else if (width === '768px') {
          frame.setAttribute('data-viewport', 'tablet');
        } else {
          frame.removeAttribute('data-viewport');
        }
      }
      if (info) {
        info.textContent = width === '100%' ? 'Full width' : width === '768px' ? 'Tablet, 768px' : 'Mobile, 375px';
      }
      if (btn && btn.parentElement) {
        btn.parentElement.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    }

    // Landing simulator mobile menu: the same .joy-drawer markup the LandingPage renders through its Drawer twin, opened with
    // the hub dialog helpers (Tab trap, Escape, focus return). aria-expanded and the scroll lock follow the container's
    // display, so every close path (Escape, backdrop, close button, link) stays in sync.
    function openLandingDrawer(btn) {
      hubOpenDialog('landing-drawer-container', '.joy-drawer__close');
      document.getElementById('landing-drawer-container')._hubOpener = btn;
    }
    function closeLandingDrawer(e) {
      if (e && e.target !== e.currentTarget) return;
      hubCloseDialog('landing-drawer-container');
    }
    (function () {
      const drawer = document.getElementById('landing-drawer-container');
      const page = document.getElementById('simulator-page-container');
      const scroller = document.querySelector('.main');
      if (!drawer || !page) return;
      new MutationObserver(function () {
        const open = drawer.style.display === 'block';
        const menu = page.querySelector('.joy-landing-header__menu');
        if (menu) menu.setAttribute('aria-expanded', String(open));
        if (scroller) scroller.style.overflowY = open ? 'hidden' : '';
      }).observe(drawer, { attributes: true, attributeFilter: ['style'] });
      // Hub routing reads location.hash, so an in-page link must scroll instead of navigating.
      page.addEventListener('click', function (e) {
        const link = e.target.closest && e.target.closest('a[href^="#"]');
        if (!link) return;
        e.preventDefault();
        if (link.closest('.joy-drawer')) closeLandingDrawer();
        const id = link.getAttribute('href').slice(1);
        const target = id ? document.getElementById(id) : null;
        if (!target) return;
        target.scrollIntoView();
        if (target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
      });
    })();

    // Landing blocks demos are static component markup: give their buttons a toast and stop placeholder links from
    // rewriting the hub hash. The kinetic hero buttons carry their own handlers.
    (function () {
      const view = document.getElementById('view-landing-blocks');
      if (!view) return;
      view.addEventListener('click', function (e) {
        const link = e.target.closest && e.target.closest('a[href="#"]');
        if (link) e.preventDefault();
        const btn = e.target.closest && e.target.closest('.landing-demo .joy-button');
        if (!btn || btn.disabled || btn.getAttribute('aria-busy') === 'true') return;
        // A button-styled link with a real destination navigates; only inert demo buttons and "#" links toast.
        if (btn.tagName === 'A' && btn.getAttribute('href') !== '#') return;
        const label = btn.textContent.replace(/\\s+/g, ' ').trim();
        showDemoToast('Clicked: ' + label, 'info');
      });
    })();

    function updateCodeSnippets() {
      const btnSnippet = document.getElementById('button-code');
      if (!btnSnippet) return;
      if (activeFramework === 'svelte') {
        btnSnippet.innerHTML = \`// Svelte 5 Runes Example<br>&lt;script&gt;<br>&nbsp;&nbsp;import { Button } from '@montionugera/joy-svelte';<br>&lt;/script&gt;<br><br>&lt;Button variant="solid" size="md" onclick={() => alert('Clicked')}&gt;Action&lt;/Button&gt;\`;
      } else if (activeFramework === 'flutter') {
        btnSnippet.innerHTML = \`// Flutter 3.32+ Dart Example<br>import 'package:joymify_flutter/joymify_flutter.dart';<br><br>JoyButton(<br>&nbsp;&nbsp;variant: JoyButtonVariant.\${currentBtnVariant},<br>&nbsp;&nbsp;size: JoyButtonSize.\${currentBtnSize},<br>&nbsp;&nbsp;loading: \${isBtnLoading},<br>&nbsp;&nbsp;onPressed: () => print('Clicked'),<br>&nbsp;&nbsp;child: const Text('Action'),<br>)\`;
      } else {
        btnSnippet.innerHTML = \`// React 19 Modern Example<br>import { Button } from '@montionugera/joy-react';<br><br>&lt;Button variant="solid" size="md" onClick={() => alert('Clicked')}&gt;Action&lt;/Button&gt;\`;
      }
    }

    // F-052 Joy-Coach & Outdoor Mode Interactive Demo Scripts
    let activeLoggerAction = 'in';
    function setLoggerAction(action, btn) {
      activeLoggerAction = action;
      document.querySelectorAll('.joy-command-island__item').forEach(b => b.classList.remove('joy-command-island__item--active'));
      if (btn) btn.classList.add('joy-command-island__item--active');
    }

    function setDemoCourtSurface(surface) {
      const radar = document.getElementById('demo-court-radar');
      if (!radar) return;
      radar.className = 'joy-court-radar joy-court-radar--interactive joy-court-radar--surface-' + surface;
      const label = document.getElementById('demo-surface-label');
      if (label) {
        if (surface === 'clay') label.textContent = 'Court Philippe-Chatrier — Roland-Garros Clay';
        else if (surface === 'grass') label.textContent = 'Centre Court — Wimbledon Grass';
        else if (surface === 'hard') label.textContent = 'Arthur Ashe Stadium — DecoTurf Hard';
        else if (surface === 'indoor') label.textContent = 'Pala Alpitour — Nitto ATP Finals Carpet';
      }
    }

    function handleCourtClick(e) {
      const svg = document.getElementById('demo-court-svg');
      const layer = document.getElementById('demo-shots-layer');
      if (!svg || !layer) return;
      const rect = svg.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
      const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String((x / 100) * 360));
      circle.setAttribute('cy', String((y / 100) * 480));
      circle.setAttribute('r', '6');
      circle.setAttribute('class', 'joy-court-radar__shot-point joy-court-radar__shot-point--' + activeLoggerAction);
      layer.appendChild(circle);

      const count = document.getElementById('demo-shot-count');
      if (count) count.textContent = layer.children.length + ' Shots Placed';
      showDemoToast('Logged ' + activeLoggerAction.toUpperCase() + ' at (' + x + '%, ' + y + '%)', 'info');
    }

    function clearCourtShots() {
      const layer = document.getElementById('demo-shots-layer');
      if (layer) layer.innerHTML = '';
      const count = document.getElementById('demo-shot-count');
      if (count) count.textContent = '0 Shots Placed';
    }

    // Chronometer demo logic
    let chronoRunning = false;
    let chronoSeconds = 42.38;
    let chronoTimer = null;
    let chronoLapCount = 2;

    function demoChronoToggle() {
      const btn = document.getElementById('demo-chrono-toggle');
      if (!btn) return;
      chronoRunning = !chronoRunning;
      if (chronoRunning) {
        btn.textContent = 'Stop';
        btn.className = 'joy-chronometer-dial__btn joy-chronometer-dial__btn--primary';
        chronoTimer = setInterval(() => {
          chronoSeconds += 0.05;
          const mins = Math.floor(chronoSeconds / 60);
          const secs = (chronoSeconds % 60).toFixed(2);
          const timeStr = String(mins).padStart(2, '0') + ':' + String(secs).padStart(5, '0');
          const timeEl = document.getElementById('demo-chrono-time');
          if (timeEl) timeEl.textContent = timeStr;
          const ring = document.getElementById('demo-chrono-ring');
          if (ring) {
            const frac = (chronoSeconds % 60) / 60;
            ring.style.strokeDashoffset = String(603.19 * (1 - frac));
          }
        }, 50);
      } else {
        btn.textContent = 'Start';
        btn.className = 'joy-chronometer-dial__btn joy-chronometer-dial__btn--primary';
        clearInterval(chronoTimer);
      }
    }

    function demoChronoLap() {
      const laps = document.getElementById('demo-chrono-laps');
      const timeEl = document.getElementById('demo-chrono-time');
      if (!laps || !timeEl) return;
      chronoLapCount++;
      const item = document.createElement('div');
      item.className = 'joy-chronometer-dial__lap-item';
      item.innerHTML = '<span>Lap ' + chronoLapCount + '</span><span>+00:15.00</span><span>' + timeEl.textContent + '</span>';
      laps.prepend(item);
    }

    function toggleOutdoorMode() {
      const isOutdoor = document.documentElement.getAttribute('data-mode') === 'outdoor';
      if (isOutdoor) {
        document.documentElement.removeAttribute('data-mode');
        showDemoToast('Outdoor Mode: OFF', 'info');
      } else {
        document.documentElement.setAttribute('data-mode', 'outdoor');
        showDemoToast('High-Noon Outdoor Mode: ACTIVE (AAA >= 7.0:1)', 'success');
      }
    }

    function toggleSimulatedGlare() {
      const main = document.querySelector('.main');
      if (!main) return;
      main.classList.toggle('hub-glare-active');
      const active = main.classList.contains('hub-glare-active');
      showDemoToast(active ? '50,000 Lux Glare Simulation ON' : 'Glare Simulation OFF', 'info');
    }

  </script>
</body>
</html>

`;

// Portal Landing Page (dist/index.html): starts with body class="portal-mode"
const portalHtml = html
  .replace('<body>', '<body class="portal-mode">')
  .replace('<title>Joymify Design System & Component Portal</title>', '<title>Joymify Developer Portal · dev.joymify.com</title>')
  .replace('<span class="topbar-brand__name" id="topbar-brand-title">Joymify Design</span>', '<span class="topbar-brand__name" id="topbar-brand-title">Joymify Developer Portal</span>');

fs.writeFileSync(path.join(outDir, "index.html"), portalHtml);

// Joy Design Sub-Webapp directory (/design/index.html)
const designOutDir = path.join(outDir, "design");
fs.mkdirSync(designOutDir, { recursive: true });
fs.writeFileSync(path.join(designOutDir, "index.html"), html);

const tokensSrc = path.join(__dirname, "../../packages/tokens/dist/theme.css");
if (fs.existsSync(tokensSrc)) {
  fs.copyFileSync(tokensSrc, path.join(outDir, "theme.css"));
  fs.copyFileSync(tokensSrc, path.join(designOutDir, "theme.css"));
}

// Downloadable brand assets (F-043): copy the files listed in brandAssetFiles (read above) into the
// dist output, plus a copy of favicon.svg at the site root for the <link rel="icon"> above.
const brandOutDir = path.join(outDir, "brand");
fs.mkdirSync(brandOutDir, { recursive: true });
for (const file of brandAssetFiles) {
  fs.copyFileSync(path.join(brandAssetsSrc, file), path.join(brandOutDir, file));
}
fs.copyFileSync(path.join(brandAssetsSrc, "favicon.svg"), path.join(outDir, "favicon.svg"));
fs.copyFileSync(path.join(brandAssetsSrc, "favicon.svg"), path.join(designOutDir, "favicon.svg"));

// Copy Flutter Web bundle if present (F-065)
const flutterSrcDir = path.join(__dirname, "../flutter-hub/build/web");
const flutterOutDir = path.join(outDir, "flutter");
if (fs.existsSync(flutterSrcDir)) {
  fs.cpSync(flutterSrcDir, flutterOutDir, { recursive: true });
  const htmlPath = path.join(flutterOutDir, "index.html");
  if (fs.existsSync(htmlPath)) {
    let content = fs.readFileSync(htmlPath, "utf8");
    content = content.replace('<base href="/">', '<base href="/flutter/">');
    fs.writeFileSync(htmlPath, content, "utf8");
  }
  console.log("Copied Flutter Web bundle to", flutterOutDir);
}

// Copy tracked portal bundles if present into dist/server-decorator and dist/cli-state-handler
const bundlesDir = path.join(__dirname, "portal-bundles");
if (fs.existsSync(bundlesDir)) {
  const decoratorBundle = path.join(bundlesDir, "server-decorator");
  if (fs.existsSync(decoratorBundle)) {
    fs.cpSync(decoratorBundle, path.join(outDir, "server-decorator"), { recursive: true });
    console.log("Copied server-decorator bundle to dist/server-decorator");
  }
  const cliBundle = path.join(bundlesDir, "cli-state-handler");
  if (fs.existsSync(cliBundle)) {
    fs.cpSync(cliBundle, path.join(outDir, "cli-state-handler"), { recursive: true });
    console.log("Copied cli-state-handler bundle to dist/cli-state-handler");
  }
}

console.log("Built Storybook Hub static distribution in", outDir);

