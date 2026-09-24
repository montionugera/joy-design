import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

// Extract vector SVGs from @joymify/icons
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
    <section><h3>TreeSelect</h3>${sheetDemo(`<div class="joy-treeselect joy-treeselect--open"><div class="joy-treeselect__control" role="combobox" aria-expanded="true" aria-haspopup="tree" tabindex="0"><span class="joy-treeselect__tags"><span class="joy-treeselect__tag">Research<button type="button" class="joy-treeselect__tag-remove" aria-label="Remove Research">${closeIcon}</button></span></span><span class="joy-treeselect__arrow">${chevronDown}</span></div><div class="joy-treeselect__panel joy-overlay joy-overlay--sheet" role="tree"><div class="joy-treeselect__node joy-treeselect__node--selected" role="treeitem" aria-expanded="true" aria-selected="true"><button type="button" class="joy-treeselect__node-toggle">${chevronDown}</button><span class="joy-treeselect__node-label">Research</span></div></div></div>`, true)}</section>
    <section><h3>Cascader</h3>${sheetDemo(`<div class="joy-cascader joy-cascader--open"><div class="joy-cascader__control" role="combobox" aria-expanded="true" tabindex="0"><span class="joy-cascader__value">Markets / Futures</span><span class="joy-cascader__arrow">${chevronDown}</span></div><div class="joy-cascader__panel joy-overlay joy-overlay--sheet"><div class="joy-cascader__columns"><ul class="joy-cascader__column" role="menu"><li class="joy-cascader__item joy-cascader__item--active" role="menuitem" tabindex="0" aria-expanded="true">Markets<span class="joy-cascader__item-arrow">${chevronRight}</span></li></ul><ul class="joy-cascader__column" role="menu"><li class="joy-cascader__item" role="menuitem" tabindex="-1">Futures</li></ul></div></div></div>`, true)}</section>
    <section><h3>Transfer</h3><div class="joy-transfer"><div class="joy-transfer__list"><div class="joy-transfer__header">${checkbox("Source")}<span class="joy-transfer__header-title">Available</span><span class="joy-transfer__header-count">1 item</span></div><div class="joy-transfer__body"><div class="joy-transfer__item joy-transfer__item--selected">${checkbox("Balanced")}</div></div></div><div class="joy-transfer__operations"><button type="button" class="joy-button joy-button--solid joy-button--sm joy-button--icon-only" aria-label="Move right">${chevronRight}</button><button type="button" class="joy-button joy-button--solid joy-button--sm joy-button--icon-only" aria-label="Move left">${chevronRight}</button></div><div class="joy-transfer__list"><div class="joy-transfer__header"><span class="joy-transfer__header-title">Selected</span><span class="joy-transfer__header-count">0 items</span></div><div class="joy-transfer__empty">No selected items</div></div></div></section>
    <section><h3>MarkdownEditor</h3><div class="joy-markdown-editor"><div class="joy-markdown-editor__toolbar" role="toolbar"><button type="button" class="joy-markdown-editor__tool" aria-label="Bold" aria-pressed="true">B</button><button type="button" class="joy-markdown-editor__tool" aria-label="Preview" aria-pressed="false">${chevronRight}</button></div><div class="joy-markdown-editor__panes joy-markdown-editor__panes--split"><textarea class="joy-textarea joy-markdown-editor__textarea"># Review</textarea><div class="joy-markdown-editor__preview"><h4>Review</h4><p>Semantic token coverage.</p></div></div></div></section>
    <script>document.querySelectorAll('[data-indeterminate="true"]').forEach((input) => { input.indeterminate = true; });</script>
  </div>`;
}

const navIcons = {
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
};

// Generate navigation HTML dynamically from manifest
const navigationHtml = manifest.categories
  .map((cat) => {
    const items = cat.views
      .map((v) => {
        const iconSvg = navIcons[v.icon] || navIcons.overview;
        return `      <a class="nav-item" onclick="switchView('${v.id}')">
        <span class="icon">${iconSvg}</span> ${v.label}
      </a>`;
      })
      .join("\n");
    return `      <div class="nav-section">${cat.label}</div>\n${items}`;
  })
  .join("\n\n");

// ── Wave 3 (F-038) aspect views ──────────────────────────────────────────────
// Markup below mirrors the SSR output of the Svelte components (icons are read from @joymify/icons at
// build time, so the hub demos and the components can never drift on icon geometry).
const iconMarkupCache = {};
function iconSvg(name, size = "1em") {
  if (!iconMarkupCache[name]) {
    const file = path.join(iconsSrcDir, `${name}.svelte`);
    const match = fs.existsSync(file)
      ? fs.readFileSync(file, "utf8").match(/<svg[\s\S]*?<\/svg>/)
      : null;
    if (!match) throw new Error(`Icon ${name} not found in @joymify/icons`);
    iconMarkupCache[name] = match[0].replace(/\s*\n\s*/g, " ");
  }
  return iconMarkupCache[name]
    .replace("width={size}", `width="${size}"`)
    .replace("height={size}", `height="${size}"`)
    .replace("stroke={color}", 'stroke="currentColor"');
}
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
    hubCell("viewer", `<div class="joy-markdown" role="region" aria-label="Markdown content"><h3>Release notes</h3><p>This release ships <strong>display, feedback and navigation</strong> fixes.</p><pre class="joy-markdown__pre"><code>pnpm --filter @joymify/svelte test</code><button type="button" class="joy-markdown__copy-btn" aria-label="Copy code to clipboard" onclick="copyHubCode(this)">${iconSvg("Copy", "14")} Copy</button><span class="joy-markdown__status" role="status"></span></pre></div>`),
    " hub-matrix--stack",
  );
  return `<section id="view-navigation-workflow" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Navigation & Workflow</h2>
        <p class="header-tagline">State matrices for navigation, workflow and overlay components: Pagination, Tabs, Menu, Breadcrumb, Steps, Anchor, Timeline, Splitter, Modal, Drawer, Popconfirm, Dropdown, Tooltip and MarkdownViewer.</p>
        ${pagerCard}${tabsCard}${menuCard}${breadcrumbCard}${stepsCard}${anchorCard}${timelineCard}${splitterCard}${overlayCard}${markdownCard}
      </section>`;
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Joymify Design System & Component Portal</title>
  <style id="joy-theme-inline">
${inlinedThemeCss}
  </style>
  <link rel="stylesheet" href="/theme.css?v=2.3">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --sidebar-width: 280px;
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

    /* Sidebar */
    .sidebar {
      width: var(--sidebar-width);
      background: var(--joy-surface-card);
      border-right: 1px solid var(--joy-border-default);
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
      background: var(--joy-accent-default);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--joy-text-on-accent);
      font-weight: 700;
      font-size: 1.1rem;
      box-shadow: var(--joy-elevation-1);
    }
    .brand-info h2 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: var(--joy-text-primary);
      letter-spacing: -0.01em;
    }
    .brand-info span {
      font-size: 0.75rem;
      color: var(--joy-accent-default);
      font-weight: 600;
    }
    .nav {
      flex: 1;
      overflow-y: auto;
      padding: 16px 12px;
    }
    .nav-section {
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--joy-text-muted);
      padding: 10px 12px 6px;
      margin-top: 8px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--joy-text-secondary);
      text-decoration: none;
      cursor: pointer;
      transition: all var(--joy-duration-fast);
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
      font-size: 1rem;
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
      border-bottom: var(--joy-border-hairline);
      background: var(--joy-surface-overlay);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding: 0 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: nowrap;
      gap: var(--joy-space-2);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    #btn-theme-toggle {
      flex-shrink: 0;
    }
    .framework-pill {
      display: inline-flex;
      flex-wrap: nowrap;
      background: var(--joy-surface-sunken);
      border-radius: 9999px;
      padding: 3px;
    }
    .framework-btn {
      border: none;
      background: transparent;
      padding: 6px 14px;
      font-size: 0.8125rem;
      font-weight: 600;
      border-radius: 9999px;
      cursor: pointer;
      color: var(--joy-text-muted);
      transition: all var(--joy-duration-fast);
      white-space: nowrap;
    }
    .framework-btn.active {
      background: var(--joy-surface-card);
      color: var(--joy-accent-default);
      box-shadow: 0 1px 4px transparent;
    }
    .content-area {
      max-width: 1080px;
      width: 100%;
      margin: 0 auto;
      padding: 36px 32px 64px;
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
      font-size: 1rem;
      margin-bottom: 24px;
    }
    .playground-box {
      background: var(--joy-surface-card);
      border: 1px solid var(--joy-border-default);
      border-radius: 12px;
      box-shadow: 0 2px 8px transparent;
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
      font-size: 0.9375rem;
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
      border: 1px solid var(--joy-border-default);
      border-radius: 12px;
      box-shadow: 0 2px 8px transparent;
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
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--joy-text-primary);
      overflow-wrap: break-word;
      word-break: break-word;
    }
    .component-desc {
      font-size: 0.8125rem;
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
      background-image: radial-gradient(var(--joy-border-default) 1.2px, transparent 0);
      background-size: 20px 20px;
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
    body:has([data-hub-dialog][style*="display: block"]) .joy-tooltip[data-static] {
      visibility: hidden;
    }
    .hub-matrix__cell {
      min-width: 0;
    }
    .hub-matrix__cell > h4 {
      margin: 0 0 var(--joy-space-2);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--joy-text-muted);
    }
    .hub-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--joy-space-2);
    }
    .hub-pane {
      padding: var(--joy-space-3);
      font-size: 0.8125rem;
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
      font-size: 0.875rem;
    }
    [data-theme="dark"] .controls-table {
      background: var(--joy-surface-card);
      border-top-color: var(--joy-text-secondary);
    }
    .controls-table td {
      padding: 14px 24px;
      border-bottom: 1px solid var(--joy-surface-sunken);
      vertical-align: middle;
    }
    [data-theme="dark"] .controls-table td {
      border-bottom-color: var(--joy-surface-raised);
    }
    .controls-table td:first-child {
      font-weight: 600;
      color: var(--joy-text-secondary);
      width: 180px;
    }
    [data-theme="dark"] .controls-table td:first-child {
      color: var(--joy-text-muted);
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
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--joy-text-muted);
      border-radius: 6px;
      cursor: pointer;
      transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
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
      box-shadow: 0 1px 3px transparent, 0 1px 2px transparent;
    }
    [data-theme="dark"] .segmented-control {
      background: var(--joy-surface-canvas);
      border-color: var(--joy-text-secondary);
    }
    [data-theme="dark"] .segment-btn {
      color: var(--joy-text-muted);
    }
    [data-theme="dark"] .segment-btn:hover {
      color: var(--joy-text-primary);
    }
    [data-theme="dark"] .segment-btn.active {
      background: var(--joy-surface-raised);
      color: var(--joy-text-primary);
      box-shadow: 0 1px 3px transparent;
    }
    .code-snippet {
      background: var(--joy-surface-inverse);
      color: var(--joy-text-inverse);
      padding: 16px 20px;
      border-radius: 8px;
      font-family: var(--joy-font-family-mono);
      font-size: 0.8125rem;
      overflow-x: auto;
      margin-top: 16px;
      line-height: 1.5;
    }
    .tokens-table {
      width: 100%;
      border-collapse: collapse;
      background: var(--joy-surface-card);
      border-radius: 8px;
      border: 1px solid var(--joy-border-default);
      overflow: hidden;
      font-size: 0.875rem;
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
    .badge-runes {
      background: var(--joy-accent-default);
      color: var(--joy-text-on-accent);
      font-size: 0.6875rem;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
    }
    .badge-react {
      background: var(--joy-surface-inverse);
      color: var(--joy-text-inverse);
      font-size: 0.6875rem;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
    }

    /* ── Coherent Dark Mode Overrides for Hub UI ── */
    [data-theme="dark"] body {
      background-color: var(--joy-surface-canvas);
      color: var(--joy-surface-raised);
    }
    [data-theme="dark"] .sidebar {
      background: var(--joy-surface-card);
      border-right-color: var(--joy-surface-raised);
    }
    [data-theme="dark"] .brand {
      border-bottom-color: var(--joy-surface-raised);
    }
    [data-theme="dark"] .brand-info h2 {
      color: var(--joy-surface-raised);
    }
    [data-theme="dark"] .nav-section {
      color: var(--joy-text-muted);
    }
    [data-theme="dark"] .nav-item {
      color: var(--joy-text-muted);
    }
    [data-theme="dark"] .nav-item:hover {
      background: var(--joy-surface-raised);
      color: var(--joy-surface-raised);
    }
    [data-theme="dark"] .nav-item.active {
      background: var(--joy-accent-subtle);
      color: var(--joy-accent-text);
    }
    [data-theme="dark"] .topbar {
      background: transparent;
      border-bottom-color: var(--joy-surface-raised);
    }
    [data-theme="dark"] .framework-pill {
      background: var(--joy-surface-raised);
    }
    [data-theme="dark"] .framework-btn {
      color: var(--joy-text-muted);
    }
    [data-theme="dark"] .framework-btn.active {
      background: var(--joy-surface-card);
      color: var(--joy-accent-text);
    }
    [data-theme="dark"] .playground-box {
      background: var(--joy-surface-card);
      border-color: var(--joy-surface-raised);
      box-shadow: 0 4px 12px transparent;
    }
    [data-theme="dark"] .playground-header {
      background: var(--joy-surface-raised);
      border-bottom-color: var(--joy-text-secondary);
    }
    [data-theme="dark"] .playground-header h4 {
      color: var(--joy-surface-raised);
    }
    [data-theme="dark"] .tokens-table {
      background: var(--joy-surface-card);
      border-color: var(--joy-surface-raised);
    }
    [data-theme="dark"] .tokens-table th {
      background: var(--joy-surface-raised);
      border-bottom-color: var(--joy-text-secondary);
      color: var(--joy-surface-raised);
    }
    [data-theme="dark"] .tokens-table td {
      border-bottom-color: var(--joy-surface-raised);
      color: var(--joy-border-default);
    }
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
      transition: all 150ms ease;
    }
    .icon-card:hover {
      border-color: var(--joy-accent-default);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px transparent;
    }
    .icon-preview {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--joy-text-secondary);
    }
    .icon-name {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--joy-text-muted);
      text-align: center;
      word-break: break-all;
    }
    [data-theme="dark"] .icon-card {
      background: var(--joy-surface-card);
      border-color: var(--joy-surface-raised);
    }
    [data-theme="dark"] .icon-card:hover {
      border-color: var(--joy-accent-default);
      box-shadow: 0 4px 12px transparent;
    }
    [data-theme="dark"] .icon-preview {
      color: var(--joy-surface-raised);
    }
    [data-theme="dark"] .icon-name {
      color: var(--joy-text-muted);
    }

    /* Coherent Dark Mode for All Containers & Component Cards */
    [data-theme="dark"] .header-tagline {
      color: var(--joy-text-muted);
    }
    [data-theme="dark"] .content-area div[style*="background: var(--joy-surface-card)"] {
      background: var(--joy-surface-card) !important;
      border-color: var(--joy-surface-raised) !important;
    }
    [data-theme="dark"] .content-area div[style*="background: var(--joy-surface-raised)"] {
      background: var(--joy-surface-raised) !important;
      border-color: var(--joy-text-secondary) !important;
    }
    [data-theme="dark"] .component-card {
      background: var(--joy-surface-card);
      border-color: var(--joy-surface-raised);
      box-shadow: 0 4px 12px transparent;
    }
    [data-theme="dark"] .component-header {
      background: var(--joy-surface-raised);
      border-bottom-color: var(--joy-text-secondary);
    }
    [data-theme="dark"] .component-title {
      color: var(--joy-surface-raised);
    }
    [data-theme="dark"] .component-desc {
      color: var(--joy-text-muted);
    }
    [data-theme="dark"] .component-canvas {
      background-color: var(--joy-surface-card);
    }

    /* ── Mobile Navigation Drawer & Backdrop ── */
    .sidebar-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: transparent;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 998;
      opacity: 0;
      transition: opacity 0.25s ease;
    }
    .sidebar-backdrop.active {
      display: block;
      opacity: 1;
    }
    .mobile-menu-btn {
      display: none;
      appearance: none;
      -webkit-appearance: none;
      background: var(--joy-surface-sunken);
      border: 1px solid var(--joy-border-default);
      border-radius: 8px;
      padding: 7px 10px;
      cursor: pointer;
      color: var(--joy-text-secondary);
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      transition: all 150ms ease;
    }
    .mobile-menu-btn:hover {
      background: var(--joy-border-default);
      color: var(--joy-surface-card);
    }
    .sidebar-close-btn {
      display: none;
      appearance: none;
      -webkit-appearance: none;
      background: transparent;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--joy-text-muted);
      padding: 4px 8px;
      border-radius: 6px;
      margin-left: auto;
    }
    .sidebar-close-btn:hover {
      background: var(--joy-surface-sunken);
      color: var(--joy-surface-card);
    }
    [data-theme="dark"] .sidebar-backdrop {
      background: transparent;
    }
    [data-theme="dark"] .mobile-menu-btn {
      background: var(--joy-surface-raised);
      border-color: var(--joy-text-secondary);
      color: var(--joy-border-default);
    }
    [data-theme="dark"] .mobile-menu-btn:hover {
      background: var(--joy-text-secondary);
      color: var(--joy-surface-card);
    }
    [data-theme="dark"] .sidebar-close-btn {
      color: var(--joy-text-muted);
    }
    [data-theme="dark"] .sidebar-close-btn:hover {
      background: var(--joy-surface-raised);
      color: var(--joy-surface-card);
    }

    /* ── Interactive 3D Kinetic Particle Canvas ── */
    .kinetic-canvas-container {
      position: relative;
      width: 100%;
      min-height: 380px;
      border-radius: 14px;
      overflow: hidden;
      border: 1px solid var(--joy-border-default);
      background: var(--joy-surface-canvas);
      margin-bottom: 28px;
      box-shadow: 0 10px 30px transparent;
    }
    .kinetic-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      cursor: crosshair;
    }
    .kinetic-overlay {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px 40px;
      text-align: center;
      pointer-events: none;
      background: radial-gradient(circle at center, transparent 35%, transparent 100%);
    }
    .kinetic-overlay * {
      pointer-events: auto;
    }
    .kinetic-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: 9999px;
      background: transparent;
      border: 1px solid transparent;
      color: var(--joy-accent-text);
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 18px;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
    }
    .kinetic-badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--joy-status-success-fg);
      box-shadow: 0 0 8px var(--joy-status-success-fg);
    }
    .kinetic-title {
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      line-height: 1.2;
      color: var(--joy-surface-card);
      margin: 0 0 14px 0;
      max-width: 720px;
    }
    .kinetic-title-gradient {
      background: linear-gradient(135deg, var(--joy-accent-default) 0%, var(--joy-status-info-fg) 50%, var(--joy-accent-default) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .kinetic-subtitle {
      font-size: 1rem;
      color: var(--joy-text-muted);
      max-width: 620px;
      margin: 0 0 24px 0;
      line-height: 1.6;
    }
    .kinetic-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .kinetic-hint {
      margin-top: 20px;
      font-size: 0.75rem;
      color: var(--joy-text-muted);
      letter-spacing: 0.03em;
    }
    [data-theme="dark"] .kinetic-canvas-container {
      border-color: var(--joy-surface-raised);
      box-shadow: 0 12px 36px transparent;
    }

    /* ── Responsive Mobile & Tablet Rules ── */
    @media (max-width: 900px) {
      .mobile-menu-btn {
        display: inline-flex;
      }
      .sidebar-close-btn {
        display: inline-flex;
      }
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 280px;
        z-index: 999;
        transform: translateX(-100%);
        transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: none;
      }
      .sidebar.open {
        transform: translateX(0);
        box-shadow: 6px 0 28px transparent;
      }
      .main {
        width: 100vw;
        min-width: 0;
      }
      .topbar {
        padding: 0 16px;
        flex-wrap: nowrap;
      }
      .topbar-target-label {
        display: none;
      }
      .content-area {
        padding: 20px 14px 60px;
        max-width: 100%;
        overflow-x: hidden;
      }
      .kinetic-title {
        font-size: 1.5rem;
      }
      .kinetic-subtitle {
        font-size: 0.875rem;
      }
      .kinetic-overlay {
        padding: 32px 16px 28px;
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

    /* Full Page Simulator & Palette Engine */
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
      box-shadow: 0 2px 8px transparent;
    }
    .simulator-group {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .simulator-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--joy-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      white-space: nowrap;
    }
    .simulator-status-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      background: var(--joy-surface-sunken);
      border: 1px solid var(--joy-border-default);
      border-radius: 8px;
      font-size: 0.8125rem;
      color: var(--joy-text-secondary);
      margin-bottom: 16px;
    }
    .simulator-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
      overflow-x: auto;
      padding: 16px 0 48px;
      background: transparent;
      border-radius: 16px;
    }
    [data-theme="dark"] .simulator-wrapper {
      background: transparent;
    }
    .simulator-frame {
      width: 100%;
      max-width: 100%;
      transition: max-width 300ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease;
      background: var(--joy-surface-canvas);
      border-radius: 16px;
      border: 1px solid var(--joy-border-default);
      overflow: hidden;
      box-shadow: 0 12px 36px transparent;
    }
    [data-theme="dark"] .simulator-frame {
      box-shadow: 0 16px 48px transparent;
    }
    .palette-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 8px;
      border: 1px solid var(--joy-border-default);
      background: var(--joy-surface-card);
      color: var(--joy-text-primary);
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 150ms ease;
      font-family: inherit;
    }
    .palette-btn:hover {
      border-color: var(--joy-accent-default);
    }
    .palette-btn.active {
      border-color: var(--joy-accent-default);
      background: transparent;
      font-weight: 600;
    }
    .palette-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* Token-driven corrections keep the hub's chrome aligned with the component system. */
    [data-theme="dark"] body,
    [data-theme="dark"] .brand-info h2,
    [data-theme="dark"] .nav-item:hover,
    [data-theme="dark"] .playground-header h4,
    [data-theme="dark"] .tokens-table th,
    [data-theme="dark"] .icon-preview,
    [data-theme="dark"] .component-title {
      color: var(--joy-text-primary);
    }
    [data-theme="dark"] .topbar {
      background: var(--joy-surface-overlay);
      border-bottom-color: var(--joy-border-subtle);
    }
    [data-theme="dark"] .component-canvas {
      background-color: var(--joy-surface-card);
    }
    @media (max-width: 640px) {
      .topbar {
        padding: var(--joy-space-2) var(--joy-space-3);
        align-items: center;
        flex-wrap: nowrap;
      }
      .topbar > div {
        flex-wrap: nowrap;
      }
      #theme-label {
        display: none;
      }
      #btn-theme-toggle {
        padding: 0 var(--joy-space-2);
        min-width: var(--joy-control-height-sm);
        flex-shrink: 0;
      }
      .joy-select-wrapper--open .joy-select__listbox.joy-overlay--sheet {
        position: fixed;
      }
      .framework-pill {
        display: none;
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
        font-size: 0.75rem;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <div class="sidebar-backdrop" id="sidebar-backdrop" onclick="toggleMobileMenu(false)"></div>

  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-logo">J</div>
      <div class="brand-info">
        <h2>Joymify Design</h2>
        <span>v2.2 OpenDesign Integrated</span>
      </div>
      <button class="sidebar-close-btn" onclick="toggleMobileMenu(false)" aria-label="Close sidebar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <nav class="nav">
${navigationHtml}
    </nav>
  </aside>

  <!-- Main Canvas Area -->
  <main class="main">
    <div class="topbar">
      <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
        <button class="mobile-menu-btn" id="mobile-menu-toggle" onclick="toggleMobileMenu(true)" aria-label="Toggle navigation">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <span class="topbar-target-label" style="font-weight: 600; font-size: 0.875rem; white-space: nowrap;">Target Suite:</span>
        <span class="joy-badge joy-badge--brand joy-badge--sm" style="white-space: nowrap;">Multi-Platform Enterprise</span>
      </div>
      <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
        <button class="joy-button joy-button--ghost joy-button--sm" id="btn-theme-toggle" onclick="toggleTheme()" style="gap: 6px; border: 1px solid var(--joy-border-default); flex-shrink: 0;">
          <span id="theme-icon" style="display:inline-flex;align-items:center;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </span>
          <span id="theme-label">Dark Mode</span>
        </button>
        <div class="framework-pill">
          <button class="framework-btn active" id="btn-tab-svelte" onclick="setFramework('svelte')">
            <span class="badge-runes">SVELTE 5</span> Runes
          </button>
          <button class="framework-btn" id="btn-tab-react" onclick="setFramework('react')">
            <span class="badge-react">REACT 19</span> Modern
          </button>
        </div>
      </div>
    </div>

    <div class="content-area">

      <!-- View: Overview -->
      <section id="view-overview" class="view-panel">
        <div class="badge joy-badge joy-badge--brand joy-badge--md" style="margin-bottom: 12px;">Enterprise Component Architecture</div>
        <h1 style="margin: 0; font-size: 2rem; color: var(--joy-accent-default);">Joymify Design System</h1>
        <p class="header-tagline">
          Enterprise multi-platform design tokens specification and production component library built for 
          <strong>Quant</strong>, <strong>JoyCoach</strong>, <strong>AssetStudio</strong>, and <strong>JoyQuest</strong>.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 36px;">
          <div style="background: var(--joy-surface-card); padding: 24px; border-radius: 10px; border: var(--joy-border-hairline); cursor: pointer;" onclick="switchView('tokens')">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="joy-badge joy-badge--success joy-badge--sm"><span class="joy-badge__dot"></span> Live Tokens & Motion</span>
            </div>
            <h3 style="margin: 0 0 8px 0;">@joymify/tokens</h3>
            <p style="color: var(--joy-text-muted); font-size: 0.875rem; margin: 0; line-height: 1.5;">
              W3C DTCG tokens with OpenDesign posture integration, GPU spring motion curves, and hairline borders.
            </p>
          </div>

          <div style="background: var(--joy-surface-card); padding: 24px; border-radius: 10px; border: var(--joy-border-hairline); cursor: pointer;" onclick="switchView('button'); setFramework('svelte');">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="joy-badge joy-badge--brand joy-badge--sm"><span class="joy-badge__dot"></span> Svelte 5 Runes</span>
            </div>
            <h3 style="margin: 0 0 8px 0;">@joymify/svelte</h3>
            <p style="color: var(--joy-text-muted); font-size: 0.875rem; margin: 0; line-height: 1.5;">
              Zero-overhead Runes ($state, $props, $derived, $bindable) engineered for real-time order books and high-FPS canvases.
            </p>
          </div>

          <div style="background: var(--joy-surface-card); padding: 24px; border-radius: 10px; border: var(--joy-border-hairline); cursor: pointer;" onclick="switchView('button'); setFramework('react');">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="joy-badge joy-badge--neutral joy-badge--sm"><span class="joy-badge__dot"></span> React 19 Ready</span>
            </div>
            <h3 style="margin: 0 0 8px 0;">@joymify/react</h3>
            <p style="color: var(--joy-text-muted); font-size: 0.875rem; margin: 0; line-height: 1.5;">
              Strict WAI-ARIA accessible React 19 component library with forwardRef support and zero runtime CSS overhead.
            </p>
          </div>

          <div style="background: var(--joy-surface-card); padding: 24px; border-radius: 10px; border: var(--joy-border-hairline); cursor: pointer;" onclick="switchView('tokens')">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="joy-badge joy-badge--brand joy-badge--sm"><span class="joy-badge__dot"></span> OpenDesign Postures</span>
            </div>
            <h3 style="margin: 0 0 8px 0;">Modern & Utility</h3>
            <p style="color: var(--joy-text-muted); font-size: 0.875rem; margin: 0; line-height: 1.5;">
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

      <!-- View: Tokens -->
      <section id="view-tokens" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Design Tokens & Motion Engine</h2>
        <p class="header-tagline">Central source of truth defined in DTCG JSON format, compiled for CSS Variables and Tailwind v4.</p>

        <h3 style="margin-top: 24px;">Motion & Easing Tokens</h3>
        <table class="tokens-table" style="margin-bottom: 24px;">
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

        <h3>Core Brand & Surface Palette</h3>
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
      </section>

      <!-- View: Props & API Specs -->
      <section id="view-props-spec" class="view-panel">
        <div class="badge joy-badge joy-badge--brand joy-badge--md" style="margin-bottom: 12px;">Component API Standards</div>
        <h1 style="margin: 0 0 8px 0;">Component Props & API Specification</h1>
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

        <!-- Table & Trading Specs -->
        <div class="playground-box">
          <div class="playground-header">
            <h4>&lt;Table&gt; & Financial Trading Specification</h4>
            <span class="joy-badge joy-badge--success joy-badge--sm">Quant High-Throughput</span>
          </div>
          <div style="padding: 16px 20px;">
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

        <!-- Form Suite Specs -->
        <div class="playground-box">
          <div class="playground-header">
            <h4>&lt;Select&gt;, &lt;Checkbox&gt; & &lt;RadioGroup&gt; Specification</h4>
            <span class="joy-badge joy-badge--brand joy-badge--sm">Accessible Form Suite</span>
          </div>
          <div style="padding: 16px 20px;">
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

        <!-- Overlays Specs -->
        <div class="playground-box">
          <div class="playground-header">
            <h4>&lt;Modal&gt;, &lt;Drawer&gt; & &lt;Toast&gt; Specification</h4>
            <span class="joy-badge joy-badge--brand joy-badge--sm">Enterprise Overlays</span>
          </div>
          <div style="padding: 16px 20px;">
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

        <!-- Pagination & Skeleton Specs -->
        <div class="playground-box">
          <div class="playground-header">
            <h4>&lt;Pagination&gt; & &lt;Skeleton&gt; Specification</h4>
            <span class="joy-badge joy-badge--neutral joy-badge--sm">Navigation & Feedbacks</span>
          </div>
          <div style="padding: 16px 20px;">
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
            <div style="font-size: 0.8125rem; color: var(--joy-text-muted);">Click button or test controls below</div>
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
                  <span id="btn-loading-status" style="font-size: 0.8125rem; font-weight: 500; color: var(--joy-text-muted);">Idle</span>
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
          &nbsp;&nbsp;import { Button } from '@joymify/svelte';<br>
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
            <div style="font-size: 0.875rem; color: var(--joy-text-muted); margin-top: 8px;">
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
                  <span id="input-error-status" style="font-size: 0.8125rem; font-weight: 500; color: var(--joy-text-muted);">Normal (No Error)</span>
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
          <div class="canvas" style="min-height: 220px;">
            ${hubDropdown("demo-dropdown-menu")}
          </div>
          <div style="padding: 12px 20px; background: var(--joy-surface-raised); border-top: 1px solid var(--joy-border-default); font-size: 0.875rem;">
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
        <p class="header-tagline">Accessible single-selection dropdown with custom styled caret and native keyboard accessibility.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Order Execution Routing</h4>
          </div>
          <div class="canvas" style="flex-direction: column; max-width: 420px; margin: 0 auto;">
            <div class="joy-select-wrapper">
              <select class="joy-select" id="demo-order-select" onchange="handleSelectOrderType(this.value)">
                <option value="limit">Limit Order (Default)</option>
                <option value="market">Market Execution (Aggressive)</option>
                <option value="stop_loss">Stop Loss Market</option>
                <option value="trailing">Trailing Dynamic Stop</option>
              </select>
            </div>
            <div style="font-size: 0.875rem; color: var(--joy-text-muted); margin-top: 8px;">
              Active Mode: <strong id="demo-select-feedback" style="color: var(--joy-accent-default);">Limit Order</strong>
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
              <input type="text" id="market-search-input" class="joy-input" placeholder="Filter pairs (e.g. BTC, ETH)..." style="width: 220px; padding: 6px 12px; font-size: 0.8125rem;" oninput="handleMarketFilter(this.value)">
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
              <ul style="margin: 0; padding-left: 20px; color: var(--joy-text-muted); font-size: 0.875rem;" id="paged-records-list">
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
                  <h4 style="margin: 0; font-size: 1rem;">Joymify Quant Pool</h4>
                  <span style="font-size: 0.75rem; color: var(--joy-text-muted);">Arbitrage High-Freq Vault</span>
                </div>
              </div>
              <p style="margin: 0 0 12px; font-size: 0.875rem; color: var(--joy-text-secondary); line-height: 1.5;">
                Delta-neutral funding rate harvester with sub-millisecond execution routing on Vultr Kubernetes.
              </p>
              <div style="background: var(--joy-surface-raised); padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.8125rem; color: var(--joy-text-muted);">Annualized APY</span>
                <strong style="color: var(--joy-status-success-fg); font-size: 1.1rem; font-family: var(--joy-font-family-mono);">+28.4%</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Date & Range Picker -->
      <section id="view-date-picker" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Date & Range Picker</h2>
        <p class="header-tagline">AntDesign-grade enterprise date pickers with calendar popover triggers, two-way binding, error states, and dark mode support.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Single Date & Date Range Selectors</h4>
          </div>
          <div class="canvas" style="flex-direction: column; gap: 24px; align-items: flex-start; max-width: 600px; margin: 0 auto;">
            <div style="width: 100%;">
              <label style="display: block; font-size: 0.8125rem; font-weight: 600; margin-bottom: 6px; color: var(--joy-text-muted);">Standard Date Picker</label>
              <div class="joy-date-picker" id="demo-date-picker-wrap">
                <input type="date" class="joy-date-picker__input" id="demo-single-date" value="2026-09-19" onchange="handleDateChange(this.value)">
                <span class="joy-date-picker__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </span>
              </div>
              <div style="font-size: 0.75rem; color: var(--joy-text-muted); margin-top: 4px;">Selected Date: <strong id="single-date-feedback" style="color: var(--joy-accent-default);">2026-09-19</strong></div>
            </div>

            <div style="width: 100%;">
              <label style="display: block; font-size: 0.8125rem; font-weight: 600; margin-bottom: 6px; color: var(--joy-text-muted);">Financial Date Range Picker (Backtest Window)</label>
              <div class="joy-date-range-picker">
                <div class="joy-date-picker">
                  <input type="date" class="joy-date-picker__input" id="demo-range-start" value="2026-01-01" onchange="handleRangeChange()">
                  <span class="joy-date-picker__icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </span>
                </div>
                <span class="joy-date-range-picker__sep">&rarr;</span>
                <div class="joy-date-picker">
                  <input type="date" class="joy-date-picker__input" id="demo-range-end" value="2026-09-19" onchange="handleRangeChange()">
                  <span class="joy-date-picker__icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </span>
                </div>
              </div>
              <div style="font-size: 0.75rem; color: var(--joy-text-muted); margin-top: 4px;">Active Interval: <strong id="range-date-feedback" style="color: var(--joy-accent-default);">2026-01-01 to 2026-09-19</strong></div>
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
              <div style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 6px; color: var(--joy-text-muted);">Active Harvest Task (72%)</div>
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
              <div style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 6px; color: var(--joy-text-muted);">Completed Sync (100% Success)</div>
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
              <div style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 6px; color: var(--joy-text-muted);">Failed Execution (Exception State)</div>
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
                    <span style="color: var(--joy-text-muted); font-size: 0.75rem;">(42.8 KB)</span>
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
              <div class="joy-avatar joy-avatar--square joy-avatar--lg" style="background-color: var(--joy-status-info-fg);"><span class="joy-avatar__fallback">VT</span></div>
            </div>

            <div style="margin-top: 8px;">
              <h5 style="margin: 0 0 8px 0; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--joy-text-muted);">AvatarGroup (Overlapping Team Stack)</h5>
              <div class="joy-avatar-group">
                <div class="joy-avatar joy-avatar--circle joy-avatar--md" style="background-color: var(--joy-accent-default);"><span class="joy-avatar__fallback">AM</span></div>
                <div class="joy-avatar joy-avatar--circle joy-avatar--md" style="background-color: var(--joy-status-success-fg);"><span class="joy-avatar__fallback">BL</span></div>
                <div class="joy-avatar joy-avatar--circle joy-avatar--md" style="background-color: var(--joy-status-warning-fg);"><span class="joy-avatar__fallback">CR</span></div>
                <div class="joy-avatar joy-avatar--circle joy-avatar--md" style="background-color: var(--joy-text-muted);"><span class="joy-avatar__fallback">+4</span></div>
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
              <label style="font-size: 0.875rem; font-weight: 600;">Max Execution Leverage</label>
              <span class="joy-badge joy-badge--brand joy-badge--sm" id="demo-slider-badge">25x</span>
            </div>
            <div class="joy-slider" id="demo-slider-box">
              <div class="joy-slider__rail"></div>
              <div class="joy-slider__track" id="demo-slider-track" style="width: 25%;"></div>
              <div class="joy-slider__handle" id="demo-slider-handle" style="left: 25%;" tabindex="0" role="slider" aria-valuenow="25" aria-valuemin="1" aria-valuemax="100">
                <div class="joy-slider__tooltip" id="demo-slider-tooltip" style="display: none;">25x</div>
              </div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--joy-text-muted); margin-top: 8px;">
              <span>1x (Spot)</span>
              <span>50x</span>
              <span>100x (Max)</span>
            </div>
          </div>
        </div>
      </section>

      <!-- View: MarkdownViewer (Cherry Engine) -->
      <section id="view-markdown" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">MarkdownViewer (Cherry Engine Inspired)</h2>
        <p class="header-tagline">Stream-safe high-performance markdown renderer with syntax code blocks, one-click copy, responsive tables, and callouts.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Live Stream-Safe Markdown Preview</h4>
          </div>
          <div class="canvas" style="padding: 24px; max-width: 720px;">
            <div class="joy-markdown">
              <h2>Delta-Neutral Arbitrage Execution Spec</h2>
              <p>The <strong>Joymify Quant Strategy Engine</strong> executes cross-venue arbitrage across centralized and decentralized liquidity books.</p>
              <blockquote>
                <strong>Execution Safety:</strong> Slippage protection circuit breaker is actively enforced at 0.05% tolerance.
              </blockquote>
              <pre class="joy-markdown__pre"><code>// TypeScript Quantitative Order Router
import { Router, OrderType } from '@joymify/quant';

export async function executeHedge(symbol: string, size: number) {
  const quote = await Router.getOptimalQuote(symbol, size);
  return Router.dispatch({ symbol, size, type: OrderType.LIMIT, price: quote.bestAsk });
}</code><button type="button" class="joy-markdown__copy-btn" aria-label="Copy code to clipboard" onclick="copyHubCode(this)">${iconSvg("Copy", "14")} Copy</button><span class="joy-markdown__status" role="status"></span></pre>
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
            </div>
          </div>
        </div>
      </section>

      <!-- View: Icons Gallery -->
      <section id="view-icons-gallery" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Vector Icons Gallery (@joymify/icons)</h2>
        <p class="header-tagline">138 enterprise SVG icons covering trading, navigation, file ops, and observability with full dark-mode and stroke/fill adaptability. Click any icon to copy its component import.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Icon System Collection (138 Vector Assets &bull; Dual Svelte 5 + React 19)</h4>
            <div id="copy-toast-banner" style="font-size: 0.8125rem; color: var(--joy-status-success-fg); font-weight: 600; display: none;">Copied to clipboard!</div>
          </div>
          <div style="padding: 24px;">
            <div class="icon-grid">
              ${iconCardsHtml}
            </div>
          </div>
        </div>
      </section>

      <!-- View: Landing Page Architecture & Bento Suite -->
      <section id="view-landing-blocks" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Modern Landing Page Suite</h2>
        <p class="header-tagline">Comprehensive conversion & product architecture blocks: Interactive 3D kinetic particle canvas with mouse physics, responsive BentoGrid with glow-card dynamics, multi-tier PricingMatrix, and social proof TestimonialCards.</p>

        <!-- Interactive 3D Kinetic Particle Hero Showcase -->
        <div class="kinetic-canvas-container" id="kinetic-hero-container">
          <canvas class="kinetic-canvas" id="kinetic-particle-canvas"></canvas>
          <div class="kinetic-overlay">
            <div class="kinetic-badge">
              <span class="kinetic-badge-dot"></span>
              <span>Interactive 3D Kinetic Field &bull; 60 FPS</span>
            </div>
            <h1 class="kinetic-title">High-Velocity <span class="kinetic-title-gradient">Quantitative Execution</span> Engine</h1>
            <p class="kinetic-subtitle">Institutional order routing, dark-mode financial telemetry, and deterministic UI components engineered for maximum density and accessibility.</p>
            <div class="kinetic-actions">
              <button class="joy-button joy-button--solid joy-button--md" onclick="triggerCanvasBurst(event); showDemoToast('Primary CTA triggered: Deploying pipeline', 'success')">Deploy Solution</button>
              <button class="joy-button joy-button--outline joy-button--md" onclick="showDemoToast('Viewing API Documentation', 'info')">Read Whitepaper</button>
            </div>
            <div class="kinetic-hint">Move cursor or touch to perturb 3D particle constellation &bull; Click to pulse shockwave</div>
          </div>
        </div>

        <!-- Bento Grid Demo -->
        <div class="playground-box" style="margin-bottom: 24px;">
          <div class="playground-header">
            <h4>Bento Grid 4-Column Responsive Layout</h4>
          </div>
          <div style="padding: 24px;">
            <div class="joy-bento-grid">
              <div class="joy-bento-card joy-bento-card--col-6">
                <div class="joy-bento-card__badge">Latency Metric</div>
                <h4 class="joy-bento-card__title">Sub-millisecond Order Routing</h4>
                <p class="joy-bento-card__desc">Co-located matching engine gateway with continuous FPGA hardware acceleration and zero-allocation socket rings.</p>
                <div style="margin-top: 16px; display: flex; gap: 8px;">
                  <span class="joy-badge joy-badge--success joy-badge--subtle">0.42ms Tick-to-Trade</span>
                  <span class="joy-badge joy-badge--brand joy-badge--subtle">DPDK Enabled</span>
                </div>
              </div>
              <div class="joy-bento-card joy-bento-card--col-6">
                <div class="joy-bento-card__badge">Cross-Chain</div>
                <h4 class="joy-bento-card__title">Unified Liquidity</h4>
                <p class="joy-bento-card__desc">Continuous aggregation across 14 EVM & SVM settlement layers with automated route splits.</p>
                <div style="margin-top: 16px; display: flex; gap: 8px;">
                  <span class="joy-badge joy-badge--info joy-badge--subtle">14 Chains Live</span>
                  <span class="joy-badge joy-badge--subtle">Zero Slippage</span>
                </div>
              </div>
              <div class="joy-bento-card joy-bento-card--col-8">
                <div class="joy-bento-card__badge">Deep Analytics</div>
                <h4 class="joy-bento-card__title">Real-Time Risk & Telemetry Visualizer</h4>
                <p class="joy-bento-card__desc">Granular Greeks calculations, portfolio VAR distributions, and live liquidation distance metrics streaming at 60fps.</p>
                <div style="margin-top: 16px; display: flex; gap: 8px;">
                  <span class="joy-badge joy-badge--warning joy-badge--subtle">VAR 99.9%</span>
                  <span class="joy-badge joy-badge--brand joy-badge--subtle">60 FPS WebGL</span>
                </div>
              </div>
              <div class="joy-bento-card joy-bento-card--col-4">
                <div class="joy-bento-card__badge">Security</div>
                <h4 class="joy-bento-card__title">MPC Vaults</h4>
                <p class="joy-bento-card__desc">Hardware-isolated multi-party threshold signatures with zero single points of failure.</p>
                <div style="margin-top: 16px; display: flex; gap: 8px;">
                  <span class="joy-badge joy-badge--success joy-badge--subtle">FIPS 140-3</span>
                </div>
              </div>
              <div class="joy-bento-card joy-bento-card--col-12">
                <div class="joy-bento-card__badge">Compliance & Observability</div>
                <h4 class="joy-bento-card__title">Automated Cryptographic Audit Trails</h4>
                <p class="joy-bento-card__desc">WORM-compliant immutable ledger log trails with cryptographic proof verification and sub-second compliance export.</p>
                <div style="margin-top: 16px; display: flex; gap: 8px;">
                  <span class="joy-badge joy-badge--brand joy-badge--subtle">WORM Compliant</span>
                  <span class="joy-badge joy-badge--success joy-badge--subtle">SOC2 Type II</span>
                  <span class="joy-badge joy-badge--subtle">Real-Time Attestation</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pricing Matrix Demo -->
        <div class="playground-box" style="margin-bottom: 24px;">
          <div class="playground-header">
            <h4>Pricing Matrix & Subscription Tiers</h4>
          </div>
          <div style="padding: 24px;">
            <div class="joy-pricing-matrix">
              <div class="joy-pricing-card">
                <h3 class="joy-pricing-card__title">Developer</h3>
                <p class="joy-pricing-card__desc">Core design tokens, SVG vector icons, and standard UI primitives.</p>
                <div class="joy-pricing-card__price">
                  <span>$0</span>
                  <span class="joy-pricing-card__period">/month</span>
                </div>
                <ul class="joy-pricing-card__features">
                  <li class="joy-pricing-card__feature">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-status-success-fg); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>138 Vector Icons included</span>
                  </li>
                  <li class="joy-pricing-card__feature">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-status-success-fg); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Svelte 5 & React 19 packages</span>
                  </li>
                  <li class="joy-pricing-card__feature">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-status-success-fg); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Community Discord support</span>
                  </li>
                </ul>
                <button type="button" class="joy-button joy-button--outline joy-button--md" style="width: 100%; margin-top: auto;" onclick="showDemoToast('Developer tier selected', 'info')">Start Free</button>
              </div>

              <div class="joy-pricing-card joy-pricing-card--featured">
                <div class="joy-pricing-card__badge">Most Popular</div>
                <h3 class="joy-pricing-card__title">Professional</h3>
                <p class="joy-pricing-card__desc">Full financial suite, live orderbook tables, and Bento layout blocks.</p>
                <div class="joy-pricing-card__price">
                  <span>$149</span>
                  <span class="joy-pricing-card__period">/month</span>
                </div>
                <ul class="joy-pricing-card__features">
                  <li class="joy-pricing-card__feature">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-status-success-fg); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>All Developer tier features</span>
                  </li>
                  <li class="joy-pricing-card__feature">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-status-success-fg); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Financial High-Density Tables</span>
                  </li>
                  <li class="joy-pricing-card__feature">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-status-success-fg); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Bento & Landing Architecture</span>
                  </li>
                  <li class="joy-pricing-card__feature">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-status-success-fg); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>24/7 Priority SLA response</span>
                  </li>
                </ul>
                <button type="button" class="joy-button joy-button--solid joy-button--md" style="width: 100%; margin-top: auto;" onclick="showDemoToast('Professional tier selected', 'success')">Upgrade to Pro</button>
              </div>

              <div class="joy-pricing-card">
                <h3 class="joy-pricing-card__title">Institutional</h3>
                <p class="joy-pricing-card__desc">Dedicated infrastructure, white-label design token engine, custom audits.</p>
                <div class="joy-pricing-card__price">
                  <span>$899</span>
                  <span class="joy-pricing-card__period">/month</span>
                </div>
                <ul class="joy-pricing-card__features">
                  <li class="joy-pricing-card__feature">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-status-success-fg); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Unlimited sub-accounts & seats</span>
                  </li>
                  <li class="joy-pricing-card__feature">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-status-success-fg); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Custom token pipeline & theme export</span>
                  </li>
                  <li class="joy-pricing-card__feature">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-status-success-fg); flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <span>Dedicated Technical Account Mgr</span>
                  </li>
                </ul>
                <button type="button" class="joy-button joy-button--outline joy-button--md" style="width: 100%; margin-top: auto;" onclick="showDemoToast('Institutional sales inquiry dispatched', 'info')">Contact Enterprise</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Testimonial Cards Demo -->
        <div class="playground-box">
          <div class="playground-header">
            <h4>Social Proof & Testimonials</h4>
          </div>
          <div style="padding: 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
            <div class="joy-testimonial-card">
              <div class="joy-testimonial-card__stars">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <p class="joy-testimonial-card__quote">"The transition from generic UI kits to Joymify Design was immediate. High-density financial views and Svelte 5 Rune reactivity cut our portal re-render overhead by 40%."</p>
              <div class="joy-testimonial-card__author">
                <div class="joy-avatar joy-avatar--circle joy-avatar--md" style="background-color: var(--joy-accent-default);">
                  <span class="joy-avatar__fallback">AK</span>
                </div>
                <div class="joy-testimonial-card__author-info">
                  <h6>Alexandre K.</h6>
                  <p>Lead Architect, Quant Fund</p>
                </div>
              </div>
            </div>

            <div class="joy-testimonial-card">
              <div class="joy-testimonial-card__stars">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <p class="joy-testimonial-card__quote">"Dark mode coherence is unmatched. Zero unstyled background leaks and crisp 138-vector asset suite that matches Ant Design enterprise rigor."</p>
              <div class="joy-testimonial-card__author">
                <div class="joy-avatar joy-avatar--circle joy-avatar--md" style="background-color: var(--joy-status-info-fg);">
                  <span class="joy-avatar__fallback">ML</span>
                </div>
                <div class="joy-testimonial-card__author-info">
                  <h6>Maya Lin</h6>
                  <p>Design Director, JoyPortal</p>
                </div>
              </div>
            </div>
          </div>
        <!-- Logo Cloud Showcase -->
        <div class="playground-box" style="margin-bottom: 24px;">
          <div class="playground-header">
            <h4>Institutional Ecosystem & Partner Cloud (LogoCloud)</h4>
          </div>
          <div style="padding: 24px;">
            <div class="joy-logo-cloud">
              <p class="joy-logo-cloud__title">Trusted by Institutional Trading Desks & Tier-1 Liquidity Providers</p>
              <div class="joy-logo-cloud__logos">
                <div class="joy-logo-cloud__item">
                  <svg width="120" height="32" viewBox="0 0 120 32" fill="none">
                    <rect x="2" y="6" width="20" height="20" rx="4" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 10v12M6 16h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">QUANTUM</text>
                  </svg>
                </div>
                <div class="joy-logo-cloud__item">
                  <svg width="110" height="32" viewBox="0 0 110 32" fill="none">
                    <polygon points="12,6 22,26 2,26" stroke="currentColor" stroke-width="2"/>
                    <text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">CITADEL</text>
                  </svg>
                </div>
                <div class="joy-logo-cloud__item">
                  <svg width="120" height="32" viewBox="0 0 120 32" fill="none">
                    <circle cx="12" cy="16" r="10" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="16" r="4" fill="currentColor"/>
                    <text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">NEXUS CAP</text>
                  </svg>
                </div>
                <div class="joy-logo-cloud__item">
                  <svg width="115" height="32" viewBox="0 0 115 32" fill="none">
                    <rect x="4" y="6" width="16" height="20" rx="3" stroke="currentColor" stroke-width="2"/>
                    <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <text x="28" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">FLOW DESK</text>
                  </svg>
                </div>
                <div class="joy-logo-cloud__item">
                  <svg width="125" height="32" viewBox="0 0 125 32" fill="none">
                    <path d="M4 22L12 8L20 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <text x="28" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">APEX ALPHA</text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FeatureGrid Showcase -->
        <div class="playground-box" style="margin-bottom: 24px;">
          <div class="playground-header">
            <h4>Modular Architecture & Feature Grid (FeatureGrid)</h4>
          </div>
          <div style="padding: 24px;">
            <div class="joy-feature-grid joy-feature-grid--cols-3">
              <div class="joy-feature-card">
                <span class="joy-badge joy-badge--brand joy-feature-card__badge">Hardware Level</span>
                <div class="joy-feature-card__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="4" y="4" width="16" height="16" rx="2"/>
                    <rect x="9" y="9" width="6" height="6"/>
                    <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
                    <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
                    <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/>
                    <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/>
                  </svg>
                </div>
                <h3 class="joy-feature-card__title">Sub-Microsecond Order Matching</h3>
                <p class="joy-feature-card__desc">Co-located kernel bypass rings with DPDK socket streaming, processing up to 2.4 million orders per second with zero garbage collection spikes.</p>
                <a href="#view-financial-suite" class="joy-feature-card__link">
                  Explore telemetry
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
              </div>

              <div class="joy-feature-card">
                <span class="joy-badge joy-badge--success joy-feature-card__badge">WCAG 2.2 AA</span>
                <div class="joy-feature-card__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                </div>
                <h3 class="joy-feature-card__title">Adaptive Dark-Mode Contrast</h3>
                <p class="joy-feature-card__desc">Strict mathematical contrast verification across institutional Navy, Obsidian, and Quantum color models, eliminating white-on-white button regressions.</p>
                <a href="#view-tokens" class="joy-feature-card__link">
                  Inspect color tokens
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
              </div>

              <div class="joy-feature-card">
                <span class="joy-badge joy-badge--warning joy-feature-card__badge">100% Parity</span>
                <div class="joy-feature-card__icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="16 18 22 12 16 6"/>
                    <polyline points="8 6 2 12 8 18"/>
                  </svg>
                </div>
                <h3 class="joy-feature-card__title">Svelte 5 Runes + React 19 Parity</h3>
                <p class="joy-feature-card__desc">Complete dual framework coverage with unified CSS token architecture, keyboard navigation, and headless financial canvas charts.</p>
                <a href="#view-charts" class="joy-feature-card__link">
                  View dual chart engine
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- StatsSection Showcase -->
        <div class="playground-box" style="margin-bottom: 24px;">
          <div class="playground-header">
            <h4>Live Quantitative Telemetry & Key Metrics (StatsSection)</h4>
          </div>
          <div style="padding: 24px;">
            <div class="joy-stats-section" style="padding: 0;">
              <div class="joy-stats-grid">
                <div class="joy-stat-item">
                  <div class="joy-stat-item__value">4.2 &mu;s</div>
                  <div class="joy-stat-item__label">P99 Order Latency</div>
                  <p class="joy-stat-item__desc">FPGA colocation execution window</p>
                  <div class="joy-stat-item__change joy-stat-item__change--positive">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                    -14% vs benchmark
                  </div>
                </div>

                <div class="joy-stat-item">
                  <div class="joy-stat-item__value">99.999%</div>
                  <div class="joy-stat-item__label">Gateway Uptime</div>
                  <p class="joy-stat-item__desc">Continuous active-active failover</p>
                  <div class="joy-stat-item__change joy-stat-item__change--positive">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                    Zero unplanned downtime
                  </div>
                </div>

                <div class="joy-stat-item">
                  <div class="joy-stat-item__value">$48.2B</div>
                  <div class="joy-stat-item__label">Monthly Volume</div>
                  <p class="joy-stat-item__desc">Aggregated order routing throughput</p>
                  <div class="joy-stat-item__change joy-stat-item__change--positive">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                    +32% MoM growth
                  </div>
                </div>

                <div class="joy-stat-item">
                  <div class="joy-stat-item__value">14 Chains</div>
                  <div class="joy-stat-item__label">Settlement Networks</div>
                  <p class="joy-stat-item__desc">Unified cross-L1 & L2 bridging</p>
                  <div class="joy-stat-item__change joy-stat-item__change--positive">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                    Instant finality
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FAQSection Showcase -->
        <div class="playground-box" style="margin-bottom: 24px;">
          <div class="playground-header">
            <h4>Institutional Knowledge Base & Accordion (FAQSection)</h4>
          </div>
          <div style="padding: 24px;">
            <div class="joy-faq-section" style="padding: 0;">
              <div class="joy-faq-list">
                <div class="joy-faq-item joy-faq-item--open" id="faq-item-1">
                  <button type="button" class="joy-faq-item__trigger" onclick="toggleFaq('faq-item-1')">
                    <span>How does Joymify guarantee 60 FPS rendering under 100k candlestick points?</span>
                    <svg class="joy-faq-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <div class="joy-faq-item__content">
                    Through dual-layer canvas decoupling, O(log N) binary search viewport culling, Largest-Triangle-Three-Buckets (LTTB) downsampling, and pre-allocated circular RingBuffers that prevent garbage collection thrashing during real-time tick streaming.
                  </div>
                </div>

                <div class="joy-faq-item" id="faq-item-2">
                  <button type="button" class="joy-faq-item__trigger" onclick="toggleFaq('faq-item-2')">
                    <span>Can we hot-swap institutional theme palettes without re-rendering?</span>
                    <svg class="joy-faq-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <div class="joy-faq-item__content">
                    Yes. All styling is driven by CSS custom properties (--joy-surface-*, --joy-border, --joy-text-primary, --gold-400). Swapping theme attributes dynamically updates the entire layout instantly with zero layout shifts and verified WCAG contrast.
                  </div>
                </div>

                <div class="joy-faq-item" id="faq-item-3">
                  <button type="button" class="joy-faq-item__trigger" onclick="toggleFaq('faq-item-3')">
                    <span>How do financial tables adapt to mobile smartphone viewports?</span>
                    <svg class="joy-faq-item__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </button>
                  <div class="joy-faq-item__content">
                    With responsive stack mode enabled (.joy-table--responsive-stack), tables below 768px transform rows into individual card layouts, utilizing data-label attributes to present column keys alongside ticker values with zero horizontal cutoff.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CTASection Showcase -->
        <div class="playground-box" style="margin-bottom: 24px;">
          <div class="playground-header">
            <h4>Conversion Banner (CTASection)</h4>
          </div>
          <div style="padding: 24px;">
            <div class="joy-cta-section" style="padding: 0;">
              <div class="joy-cta-section__container">
                <h2 class="joy-cta-section__title">Ready to Elevate Your Quantitative Interface?</h2>
                <p class="joy-cta-section__desc">Join premier market makers and trading desks deploying Joymify's deterministic design tokens and low-latency financial chart suite.</p>
                <div class="joy-cta-section__actions">
                  <button type="button" class="joy-button joy-button--solid joy-button--lg" onclick="showDemoToast('Initiating Enterprise deployment pipeline', 'success')">Deploy Solution</button>
                  <button type="button" class="joy-button joy-button--outline joy-button--lg" onclick="showDemoToast('Institutional Demo schedule opened', 'info')">Schedule Institutional Demo</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SiteFooter Showcase -->
        <div class="playground-box">
          <div class="playground-header">
            <h4>Enterprise Portal Footer (SiteFooter)</h4>
          </div>
          <div style="padding: 0; overflow: hidden; border-radius: 0 0 var(--joy-radius-control) var(--joy-radius-control);">
            <footer class="joy-site-footer" style="border: none; padding: 40px 24px 24px 24px;">
              <div class="joy-site-footer__inner">
                <div class="joy-site-footer__brand">
                  <div class="joy-site-footer__brand-title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-accent-default);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span>Joymify Design</span>
                  </div>
                  <p class="joy-site-footer__brand-desc">High-velocity institutional quantitative design system and trading infrastructure engineered for modern finance.</p>
                </div>
                <div class="joy-site-footer__column">
                  <h4 class="joy-site-footer__col-title">Architecture</h4>
                  <ul class="joy-site-footer__links">
                    <li><a href="#view-charts" class="joy-site-footer__link">Financial Charts</a></li>
                    <li><a href="#view-table" class="joy-site-footer__link">Adaptive Tables</a></li>
                    <li><a href="#view-landing-blocks" class="joy-site-footer__link">Bento Grid</a></li>
                    <li><a href="#view-tokens" class="joy-site-footer__link">Design Tokens</a></li>
                  </ul>
                </div>
                <div class="joy-site-footer__column">
                  <h4 class="joy-site-footer__col-title">Frameworks</h4>
                  <ul class="joy-site-footer__links">
                    <li><a href="#" class="joy-site-footer__link">React 19 Hooks</a></li>
                    <li><a href="#" class="joy-site-footer__link">Svelte 5 Runes</a></li>
                    <li><a href="#" class="joy-site-footer__link">Tailwind Tokens</a></li>
                    <li><a href="#" class="joy-site-footer__link">Playwright E2E</a></li>
                  </ul>
                </div>
                <div class="joy-site-footer__column">
                  <h4 class="joy-site-footer__col-title">Security & Compliance</h4>
                  <ul class="joy-site-footer__links">
                    <li><a href="#" class="joy-site-footer__link">WCAG 2.2 AA</a></li>
                    <li><a href="#" class="joy-site-footer__link">Zero OS Emojis</a></li>
                    <li><a href="#" class="joy-site-footer__link">Audit Logs</a></li>
                    <li><a href="#" class="joy-site-footer__link">SOC 2 Type II</a></li>
                  </ul>
                </div>
              </div>
              <div class="joy-site-footer__bottom">
                <div>&copy; 2026 Joymify Inc. Enterprise Design System. All rights reserved.</div>
                <div class="joy-site-footer__socials">
                  <span style="font-size: 0.75rem; color: var(--joy-text-muted);">Institutional Grade Telemetry</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </section>

      <!-- View: Full Page Simulator (Preview the Look) -->
      <section id="view-landing-preview" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Full Page Simulator (Preview the Look)</h2>
        <p class="header-tagline">Simulate an end-to-end institutional landing page. Test hot-swappable institutional color palettes and responsive behavior across Desktop, Tablet, and Mobile viewports.</p>

        <!-- Top Simulator Controls Toolbar -->
        <div class="simulator-toolbar">
          <!-- Viewport Controller -->
          <div class="simulator-group">
            <span class="simulator-label">Viewport:</span>
            <div class="segmented-control" id="simulator-viewport-ctrl">
              <button type="button" class="segment-btn active" onclick="switchSimulatorViewport('100%', this)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: -2px;"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                Desktop (1440px)
              </button>
              <button type="button" class="segment-btn" onclick="switchSimulatorViewport('768px', this)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: -2px;"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                Tablet (768px)
              </button>
              <button type="button" class="segment-btn" onclick="switchSimulatorViewport('375px', this)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px; vertical-align: -2px;"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                Mobile (375px)
              </button>
            </div>
          </div>

          <!-- Institutional Palette Switcher -->
          <div class="simulator-group">
            <span class="simulator-label">Institutional Palette:</span>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button type="button" class="palette-btn active" onclick="switchSimulatorPalette('joymify', this)">
                <span class="palette-dot" style="background: var(--joy-accent-default);"></span>
                Joymify Gold
              </button>
              <button type="button" class="palette-btn" onclick="switchSimulatorPalette('obsidian', this)">
                <span class="palette-dot" style="background: var(--joy-status-success-fg);"></span>
                Obsidian Emerald
              </button>
              <button type="button" class="palette-btn" onclick="switchSimulatorPalette('quantum', this)">
                <span class="palette-dot" style="background: var(--joy-status-info-fg);"></span>
                Quantum Cobalt
              </button>
              <button type="button" class="palette-btn" onclick="switchSimulatorPalette('cyberpunk', this)">
                <span class="palette-dot" style="background: var(--joy-accent-default);"></span>
                Cyberpunk Amethyst
              </button>
              <button type="button" class="palette-btn" onclick="switchSimulatorPalette('titanium', this)">
                <span class="palette-dot" style="background: var(--joy-status-warning-fg);"></span>
                Titanium Steel
              </button>
            </div>
          </div>
        </div>

        <!-- Simulator Status Bar -->
        <div class="simulator-status-bar">
          <div>
            Active Viewport: <strong id="simulator-viewport-info">Desktop (Fluid / 1440px)</strong>
          </div>
          <div>
            Applied Palette: <strong id="simulator-palette-info">Joymify (Gold / Navy)</strong> &bull; Zero OS Emojis &bull; Fully Adaptive Mobile Grid
          </div>
        </div>

        <!-- Live Page Simulator Wrapper Frame -->
        <div class="simulator-wrapper">
          <div class="simulator-frame" id="simulator-viewport-frame" style="max-width: 100%;">
            <!-- Simulated Combined Landing Page -->
            <div id="simulator-page-container" class="joy-landing-page" data-palette="joymify">
              
              <!-- 1. Header / Navigation Bar -->
              <header style="display: flex; align-items: center; justify-content: space-between; padding: 18px 28px; background: transparent; backdrop-filter: blur(12px); border-bottom: 1px solid transparent; position: sticky; top: 0; z-index: 100;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 32px; height: 32px; border-radius: 8px; background: var(--joy-accent-default); display: flex; align-items: center; justify-content: center; color: var(--joy-surface-inverse);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <span style="font-weight: 700; font-size: 1.05rem; letter-spacing: 0.05em; color: var(--joy-surface-card);">JOYMIFY PROTOCOL</span>
                </div>
                <nav style="display: flex; align-items: center; gap: 20px;">
                  <span style="font-size: 0.875rem; color: transparent; cursor: pointer;">Markets</span>
                  <span style="font-size: 0.875rem; color: transparent; cursor: pointer;">Analytics</span>
                  <span style="font-size: 0.875rem; color: transparent; cursor: pointer;">Documentation</span>
                  <button type="button" class="joy-button joy-button--solid joy-button--sm" style="margin-left: 8px; font-weight: 600;">Launch Terminal</button>
                </nav>
              </header>

              <!-- 2. HeroSection -->
              <section class="joy-hero" style="position: relative; overflow: hidden; padding: 72px 24px; text-align: center; background: radial-gradient(circle at 50% 20%, transparent, transparent 70%), var(--joy-surface-canvas); color: var(--joy-surface-card);">
                <div style="max-width: 900px; margin: 0 auto; position: relative; z-index: 2;">
                  <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 9999px; background: transparent; border: 1px solid transparent; margin-bottom: 24px; font-size: 0.8125rem;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--joy-accent-default);"></span>
                    <span>Institutional Execution Stack 2.23 &bull; Sub-5ms Finality</span>
                  </div>
                  <h1 class="joy-hero__title" style="font-size: clamp(2rem, 5vw, 3.4rem); font-weight: 800; line-height: 1.15; margin: 0 0 20px 0; color: var(--joy-surface-card);">
                    Zero-Latency Liquidity Architecture for Algorithmic Desks
                  </h1>
                  <p class="joy-hero__subtitle" style="font-size: clamp(1rem, 2vw, 1.2rem); color: transparent; max-width: 680px; margin: 0 auto 36px auto; line-height: 1.6;">
                    Deploy high-frequency institutional trading terminals with canvas-accelerated market telemetry, deterministic risk circuits, and dual-framework React 19 / Svelte 5 parity.
                  </p>
                  <div class="joy-hero__actions" style="display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;">
                    <button type="button" class="joy-button joy-button--solid joy-button--lg" style="box-shadow: 0 4px 14px transparent;">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: -3px;"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      Deploy Production Node
                    </button>
                    <button type="button" class="joy-button joy-button--outline joy-button--lg joy-hero__secondary-cta">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: -3px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      Read Protocol Spec
                    </button>
                  </div>
                </div>
              </section>

              <!-- 3. LogoCloud -->
              <section class="joy-logo-cloud" style="padding: 40px 24px;">
                <p class="joy-logo-cloud__title">Trusted by Institutional Desks & Liquidity Providers Worldwide</p>
                <div class="joy-logo-cloud__grid">
                  <div class="joy-logo-cloud__item">
                    <svg width="130" height="32" viewBox="0 0 120 32" fill="none"><rect x="2" y="6" width="20" height="20" rx="4" stroke="currentColor" stroke-width="2"/><path d="M12 10v12M6 16h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">QUANTUM</text></svg>
                  </div>
                  <div class="joy-logo-cloud__item">
                    <svg width="120" height="32" viewBox="0 0 110 32" fill="none"><polygon points="12,6 22,26 2,26" stroke="currentColor" stroke-width="2"/><text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">CITADEL</text></svg>
                  </div>
                  <div class="joy-logo-cloud__item">
                    <svg width="130" height="32" viewBox="0 0 120 32" fill="none"><circle cx="12" cy="16" r="10" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="16" r="4" fill="currentColor"/><text x="30" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">NEXUS CAP</text></svg>
                  </div>
                  <div class="joy-logo-cloud__item">
                    <svg width="125" height="32" viewBox="0 0 115 32" fill="none"><rect x="4" y="6" width="16" height="20" rx="3" stroke="currentColor" stroke-width="2"/><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><text x="28" y="21" font-family="sans-serif" font-weight="700" font-size="14" fill="currentColor">FLOW DESK</text></svg>
                  </div>
                  <div class="joy-logo-cloud__item">
                    <svg width="130" height="32" viewBox="0 0 120 32" fill="none"><polygon points="12,4 20,16 12,28 4,16" stroke="currentColor" stroke-width="2"/><text x="28" y="21" font-family="sans-serif" font-weight="700" font-size="13" fill="currentColor">PARADIGM</text></svg>
                  </div>
                </div>
              </section>

              <!-- 4. StatsSection -->
              <section class="joy-stats-section" style="padding: 48px 24px;">
                <div class="joy-stats-section__grid">
                  <div class="joy-stat-item">
                    <div class="joy-stat-item__value">4.2 μs</div>
                    <div class="joy-stat-item__label">P99 Order Latency</div>
                    <div class="joy-stat-item__desc">Kernel bypass colocation &bull; 0 GC pauses</div>
                  </div>
                  <div class="joy-stat-item">
                    <div class="joy-stat-item__value">99.999%</div>
                    <div class="joy-stat-item__label">Historical Uptime</div>
                    <div class="joy-stat-item__desc">Dual active-active failover mesh</div>
                  </div>
                  <div class="joy-stat-item">
                    <div class="joy-stat-item__value">$48.2B</div>
                    <div class="joy-stat-item__label">Monthly Volume</div>
                    <div class="joy-stat-item__desc">Settled across 14 networks (+32% MoM)</div>
                  </div>
                  <div class="joy-stat-item">
                    <div class="joy-stat-item__value">14 Chains</div>
                    <div class="joy-stat-item__label">Settlement Mesh</div>
                    <div class="joy-stat-item__desc">Atomic cross-L2 instant finality</div>
                  </div>
                </div>
              </section>

              <!-- 5. FeatureGrid -->
              <section style="padding: 48px 24px;">
                <div style="text-align: center; max-width: 640px; margin: 0 auto 36px auto;">
                  <h2 style="font-size: 1.875rem; font-weight: 700; margin: 0 0 12px 0;">Architected for High-Stakes Financial Systems</h2>
                  <p style="color: var(--joy-text-secondary); font-size: 0.95rem; margin: 0;">Combining high-performance execution primitives with unyielding design consistency.</p>
                </div>
                <div class="joy-feature-grid joy-feature-grid--2col">
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__icon-box">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                    </div>
                    <h3 class="joy-feature-card__title">Sub-5ms Execution Engine</h3>
                    <p class="joy-feature-card__description">Zero-garbage-collection circular RingBuffers and memory-mapped state machines deliver microsecond determinism under peak order volumes.</p>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__icon-box">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                    <h3 class="joy-feature-card__title">Quant Algorithmic Arbitrage</h3>
                    <p class="joy-feature-card__description">Real-time delta-neutral hedging algorithms continuously monitor spread imbalances across centralized and decentralized venues.</p>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__icon-box">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/></svg>
                    </div>
                    <h3 class="joy-feature-card__title">Multi-Chain Liquidity Mesh</h3>
                    <p class="joy-feature-card__description">Native atomic settlement bridges 14 EVM and SVM networks with consolidated cryptographic audit trails and zero slippage traps.</p>
                  </div>
                  <div class="joy-feature-card">
                    <div class="joy-feature-card__icon-box">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h3 class="joy-feature-card__title">SOC 2 Type II & Institutional Custody</h3>
                    <p class="joy-feature-card__description">Multi-party computation (MPC) key shards and hardware security modules enforce cryptographically verifiable authorization policies.</p>
                  </div>
                </div>
              </section>

              <!-- 6. Adaptive Mobile Table Section (Demonstrating Stacking) -->
              <section style="padding: 32px 24px;">
                <div style="background: var(--joy-surface-card); border: 1px solid var(--joy-border-default); border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px transparent;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
                    <div>
                      <h3 style="margin: 0 0 4px 0; font-size: 1.15rem; font-weight: 700;">Live Execution Ledger &bull; Adaptive Table</h3>
                      <p style="margin: 0; font-size: 0.8125rem; color: var(--joy-text-secondary);">Automatically stacks into individual cards below 768px with full WCAG 2.2 AA contrast.</p>
                    </div>
                    <div style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.75rem; padding: 4px 10px; border-radius: 9999px; background: transparent; color: var(--joy-status-success-fg); font-weight: 600;">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
                      STREAMING (LIVE P99)
                    </div>
                  </div>
                  <div class="joy-table-container">
                    <table class="joy-table joy-table--striped joy-table--responsive-stack" style="width: 100%;">
                      <thead>
                        <tr>
                          <th>Asset Pair</th>
                          <th>Order Side</th>
                          <th>Fill Price</th>
                          <th>Volume</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td data-label="Asset Pair"><strong>BTC-USDC-PERP</strong></td>
                          <td data-label="Order Side"><span class="joy-badge joy-badge--success">BUY / LONG</span></td>
                          <td data-label="Fill Price" style="font-family: var(--joy-font-family-mono);">$68,492.50</td>
                          <td data-label="Volume">14.250 BTC</td>
                          <td data-label="Status"><span style="color: var(--joy-status-success-fg); font-weight: 600;">CONFIRMED</span></td>
                        </tr>
                        <tr>
                          <td data-label="Asset Pair"><strong>ETH-USDT-PERP</strong></td>
                          <td data-label="Order Side"><span class="joy-badge joy-badge--danger">SELL / SHORT</span></td>
                          <td data-label="Fill Price" style="font-family: var(--joy-font-family-mono);">$3,584.10</td>
                          <td data-label="Volume">120.000 ETH</td>
                          <td data-label="Status"><span style="color: var(--joy-status-success-fg); font-weight: 600;">CONFIRMED</span></td>
                        </tr>
                        <tr>
                          <td data-label="Asset Pair"><strong>SOL-USDC-SPOT</strong></td>
                          <td data-label="Order Side"><span class="joy-badge joy-badge--success">BUY / SPOT</span></td>
                          <td data-label="Fill Price" style="font-family: var(--joy-font-family-mono);">$182.45</td>
                          <td data-label="Volume">540.20 SOL</td>
                          <td data-label="Status"><span style="color: var(--joy-status-success-fg); font-weight: 600;">CONFIRMED</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              <!-- 7. FAQSection -->
              <section class="joy-faq-section" style="padding: 48px 24px;">
                <div style="text-align: center; max-width: 600px; margin: 0 auto 36px auto;">
                  <h2 style="font-size: 1.875rem; font-weight: 700; margin: 0 0 12px 0;">Frequently Asked Questions</h2>
                  <p style="color: var(--joy-text-secondary); font-size: 0.95rem; margin: 0;">Everything engineering teams need to know about our deterministic architecture.</p>
                </div>
                <div class="joy-faq-section__list">
                  <div class="joy-faq-item joy-faq-item--open">
                    <button type="button" class="joy-faq-item__question" onclick="toggleFaq(this)" aria-expanded="true">
                      <span>How are sub-5ms chart rendering benchmarks maintained?</span>
                      <svg class="joy-faq-item__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="joy-faq-item__answer" role="region">
                      <p>Decoupled double-buffered canvas layers, Largest-Triangle-Three-Buckets (LTTB) downsampling, and pre-allocated circular RingBuffers eliminate garbage-collection pauses even under bursts of 100k points/sec.</p>
                    </div>
                  </div>
                  <div class="joy-faq-item">
                    <button type="button" class="joy-faq-item__question" onclick="toggleFaq(this)" aria-expanded="false">
                      <span>Is there full functional parity between React 19 and Svelte 5?</span>
                      <svg class="joy-faq-item__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="joy-faq-item__answer" role="region" style="display: none;">
                      <p>Yes. Every component exists in both packages with identical visual appearance, accessibility traits, design token binding, and keyboard navigation semantics.</p>
                    </div>
                  </div>
                  <div class="joy-faq-item">
                    <button type="button" class="joy-faq-item__question" onclick="toggleFaq(this)" aria-expanded="false">
                      <span>How does the institutional color palette system work?</span>
                      <svg class="joy-faq-item__chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="joy-faq-item__answer" role="region" style="display: none;">
                      <p>Palettes are applied dynamically via the data-palette attribute on root or page containers, instantly recalibrating primary surfaces, borders, text contrast, and brand accents without CSS bundle duplication.</p>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 8. CTASection -->
              <section class="joy-cta-section" style="margin: 0 24px 48px;">
                <div class="joy-cta-section__container">
                  <h2 class="joy-cta-section__title">Ready to Deploy Institutional Infrastructure?</h2>
                  <p class="joy-cta-section__desc">Access high-performance execution primitives, Canvas charting engines, and institutional risk guards today.</p>
                  <div class="joy-cta-section__actions">
                    <button type="button" class="joy-button joy-button--solid joy-button--lg" style="box-shadow: 0 4px 14px transparent;">
                      Start Free Trial
                    </button>
                    <button type="button" class="joy-button joy-button--outline joy-button--lg">
                      Contact Institutional Sales
                    </button>
                  </div>
                </div>
              </section>

              <!-- 9. SiteFooter -->
              <footer class="joy-site-footer">
                <div class="joy-site-footer__grid">
                  <div class="joy-site-footer__brand">
                    <div class="joy-site-footer__brand-title">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-accent-default);"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      <span>JOYMIFY PROTOCOL</span>
                    </div>
                    <p class="joy-site-footer__brand-desc">High-velocity institutional quantitative design system and trading infrastructure engineered for modern finance.</p>
                  </div>
                  <div class="joy-site-footer__column">
                    <h4 class="joy-site-footer__col-title">Architecture</h4>
                    <ul class="joy-site-footer__links">
                      <li><a href="#view-charts" class="joy-site-footer__link">Financial Charts</a></li>
                      <li><a href="#view-table" class="joy-site-footer__link">Adaptive Tables</a></li>
                      <li><a href="#view-landing-preview" class="joy-site-footer__link">Page Simulator</a></li>
                    </ul>
                  </div>
                  <div class="joy-site-footer__column">
                    <h4 class="joy-site-footer__col-title">Frameworks</h4>
                    <ul class="joy-site-footer__links">
                      <li><a href="#" class="joy-site-footer__link">React 19 Hooks</a></li>
                      <li><a href="#" class="joy-site-footer__link">Svelte 5 Runes</a></li>
                      <li><a href="#" class="joy-site-footer__link">Tailwind Tokens</a></li>
                    </ul>
                  </div>
                  <div class="joy-site-footer__column">
                    <h4 class="joy-site-footer__col-title">Compliance</h4>
                    <ul class="joy-site-footer__links">
                      <li><a href="#" class="joy-site-footer__link">WCAG 2.2 AA</a></li>
                      <li><a href="#" class="joy-site-footer__link">Zero OS Emojis</a></li>
                      <li><a href="#" class="joy-site-footer__link">SOC 2 Type II</a></li>
                    </ul>
                  </div>
                </div>
                <div class="joy-site-footer__bottom">
                  <div>&copy; 2026 Joymify Inc. Enterprise Design System. All rights reserved.</div>
                  <div class="joy-site-footer__socials">
                    <span style="font-size: 0.75rem; color: var(--joy-text-muted);">Institutional Grade Telemetry</span>
                  </div>
                </div>
              </footer>

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
            <div style="margin-top: 12px; font-size: 0.75rem; color: var(--joy-text-muted); display: flex; justify-content: space-between;">
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
            <h4>Splitter (Resizable Split Panes &bull; Drag Divider or Use Arrow Keys)</h4>
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
              <div style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 8px;">Space (Auto-Gap Buttons & Badges)</div>
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
              <div style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 8px;">Flex (Justify & Align Helpers)</div>
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
              <div style="font-size: 0.8125rem; color: var(--joy-text-muted); margin-bottom: 8px;">Segmented Time Horizon:</div>
              <div class="joy-segmented" id="demo-segmented">
                <button type="button" class="joy-segmented__item joy-segmented__item--active" onclick="selectSegment(this, '1h')">1H</button>
                <button type="button" class="joy-segmented__item" onclick="selectSegment(this, '1d')">1D</button>
                <button type="button" class="joy-segmented__item" onclick="selectSegment(this, '1w')">1W</button>
                <button type="button" class="joy-segmented__item" onclick="selectSegment(this, '1m')">1M</button>
                <button type="button" class="joy-segmented__item" onclick="selectSegment(this, 'all')">ALL</button>
              </div>
            </div>

            <div>
              <div style="font-size: 0.8125rem; color: var(--joy-text-muted); margin-bottom: 8px;">Checkable Tags:</div>
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
                <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 14px; color: var(--joy-accent-default);">Vertical Layout with Validation Rules</div>
                
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
                <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 18px; color: var(--joy-accent-default);">Horizontal Layout Alignment (Right-Aligned Baselines)</div>
                
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
                <div style="font-size: 0.75rem; color: var(--joy-text-muted); margin-bottom: 6px;">Leverage Multiplier (1x - 100x):</div>
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
                <div style="font-size: 0.75rem; color: var(--joy-text-muted); margin-bottom: 6px;">Precision Sizing (step 0.05):</div>
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
                <div style="font-size: 0.75rem; color: var(--joy-text-muted); margin-bottom: 6px;">Execution Quality Rating:</div>
                <div class="joy-rate" id="demo-rate" role="radiogroup" aria-label="Rating"></div>
                <div id="rate-feedback" style="font-size: 0.8125rem; font-weight: 500; color: var(--joy-accent-default); margin-top: 6px;">4.5 Stars</div>
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
              <div style="font-size: 0.8125rem; font-weight: 600; color: var(--joy-text-muted); margin-bottom: 8px;">Horizontal Menu:</div>
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
                <div style="padding: 10px 16px; font-weight: 600; font-size: 0.8125rem; color: var(--joy-accent-default); border-bottom: 1px solid var(--joy-border-subtle);">Sidebar Subscriptions</div>
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
                <div style="font-weight: 600; font-size: 0.875rem;">Message & Notification Triggers:</div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  <button type="button" class="joy-button joy-button--solid joy-button--sm" onclick="triggerMessage('success', 'Order filled successfully at $64,250.00')">Message Success</button>
                  <button type="button" class="joy-button joy-button--outline joy-button--sm" onclick="triggerMessage('error', 'Execution rejected: Insufficient margin')">Message Error</button>
                  <button type="button" class="joy-button joy-button--outline joy-button--sm" onclick="triggerMessage('warning', 'Network latency elevated: 142ms')">Message Warning</button>
                  <button type="button" class="joy-button joy-button--solid joy-button--sm" onclick="triggerNotification('info', 'Liquidation Warning', 'ETH-PERP margin ratio has dropped below 15%. Consider adding collateral.')">Notification Card</button>
                </div>

                <div style="margin-top: 12px; font-weight: 600; font-size: 0.875rem;">Popconfirm Confirmation:</div>
                <div style="display: flex; gap: 16px; align-items: center;">
                  ${hubPopconfirm("demo-popconfirm-panel", "Revoke API Key", "Revoke DMA Master Key?")}
                  <span style="font-size: 0.8125rem; color: var(--joy-text-muted);">Prevents accidental destructive operations</span>
                </div>

                <div style="margin-top: 12px; font-weight: 600; font-size: 0.875rem;">Spin Loading Indicators:</div>
                <div style="display: flex; gap: 20px; align-items: center;">
                  <div class="joy-spin"><svg class="joy-spin__indicator" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg></div>
                  <div class="joy-spin"><svg class="joy-spin__indicator" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg></div>
                  <div class="joy-spin"><svg class="joy-spin__indicator" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg></div>
                  <button type="button" class="joy-button joy-button--outline joy-button--sm" onclick="toggleSpinMask()">Toggle Container Loading</button>
                </div>

                <!-- Wrapped Container with Spin Mask -->
                <div class="joy-spin__container" id="demo-spin-container" style="background: var(--joy-surface-raised); border: 1px solid var(--joy-border-subtle); border-radius: 8px; padding: 16px; margin-top: 8px;">
                  <div style="font-weight: 600; font-size: 0.875rem; margin-bottom: 6px;">Live Book Depth Stream</div>
                  <div style="font-size: 0.8125rem; color: var(--joy-text-muted);">Real-time aggregated L2 order depth feed from 6 venues.</div>
                  <div class="joy-spin__mask" id="demo-spin-mask" style="display: none;" role="status">
                    <div class="joy-spin" style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                      <svg class="joy-spin__indicator" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>
                      <span style="font-size: 0.8125rem; color: var(--joy-accent-default); font-weight: 500;">Rebalancing book...</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Anchor Navigation -->
              <div style="background: var(--joy-surface-sunken); border: 1px solid var(--joy-border-subtle); border-radius: 8px; padding: 16px;">
                <div style="font-weight: 600; font-size: 0.8125rem; color: var(--joy-accent-default); margin-bottom: 10px;">Anchor Navigator</div>
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

    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('joy-theme', next); } catch (e) {}
      const icon = document.getElementById('theme-icon');
      const label = document.getElementById('theme-label');
      if (icon) {
        icon.innerHTML = next === 'dark'
          ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
          : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
      }
      if (label) {
        label.innerText = next === 'dark' ? 'Light Mode' : 'Dark Mode';
      }
      redrawHubCharts();
    }

    // Restore saved theme on startup
    try {
      const savedTheme = localStorage.getItem('joy-theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
    } catch (e) {}

    function toggleMobileMenu(open) {
      const sidebar = document.querySelector('.sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');
      if (!sidebar || !backdrop) return;
      if (open === undefined) {
        open = !sidebar.classList.contains('open');
      }
      if (open) {
        sidebar.classList.add('open');
        backdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
        const closeBtn = sidebar.querySelector('.sidebar-close-btn');
        if (closeBtn) closeBtn.focus();
      } else {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        toggleMobileMenu(false);
      }
    });

    function switchView(viewName, updateHash = true) {
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

      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      const activeNav = Array.from(document.querySelectorAll('.nav-item')).find(el => {
        const oc = el.getAttribute('onclick');
        return oc && (oc.includes("'" + viewName + "'") || oc.includes('"' + viewName + '"'));
      });
      if (activeNav) activeNav.classList.add('active');

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
    }

    function syncViewFromHash() {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash && document.getElementById('view-' + hash)) {
        switchView(hash, false);
      } else {
        switchView('overview', false);
      }
    }

    // Synchronize view immediately on script load to eliminate theme/overview flash
    syncViewFromHash();
    window.addEventListener('hashchange', syncViewFromHash);

    function setFramework(fw) {
      activeFramework = fw;
      document.getElementById('btn-tab-svelte').classList.toggle('active', fw === 'svelte');
      document.getElementById('btn-tab-react').classList.toggle('active', fw === 'react');
      updateCodeSnippets();
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

    function toggleFaq(id) {
      const item = document.getElementById(id);
      if (item) {
        item.classList.toggle('joy-faq-item--open');
      }
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
      document.getElementById('range-date-feedback').innerText = start + ' to ' + end;
      showDemoToast('Backtest window set: ' + start + ' → ' + end, 'info');
    }

    function copyIconName(name) {
      const code = activeFramework === 'svelte'
        ? "import { " + name + " } from '@joymify/icons';"
        : "import { " + name + " } from '@joymify/icons/react';";
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

    document.addEventListener('pointerdown', function (e) {
      document.querySelectorAll('[data-hub-panel]:not([hidden])').forEach(function (p) {
        const root = p.closest('.joy-popconfirm, .joy-dropdown-wrapper');
        if (!root || !root.contains(e.target)) hubClosePanel(p);
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
      const target = container.querySelector(focusSelector);
      if (target) target.focus();
    }
    function hubCloseDialog(containerId) {
      hubClosePanels();
      const container = document.getElementById(containerId);
      container.style.display = 'none';
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
      const pre = btn.closest('pre');
      const code = pre.querySelector('code').innerText;
      const status = pre.querySelector('.joy-markdown__status');
      const done = function () {
        if (status) status.textContent = 'Copied to clipboard';
        setTimeout(function () { if (status) status.textContent = ''; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, done);
      else done();
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

    // ── Interactive 3D Kinetic Particle Field Engine ──
    let kineticCanvas, kineticCtx;
    let kineticParticles = [];
    let kineticAnimId = null;
    let kineticMouse = { x: -1000, y: -1000, vx: 0, vy: 0, lastX: -1000, lastY: -1000, isOver: false };
    const KINETIC_PARTICLE_COUNT = 90;
    const canvasToken = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    function initKineticCanvas() {
      kineticCanvas = document.getElementById('kinetic-particle-canvas');
      if (!kineticCanvas) return;
      kineticCtx = kineticCanvas.getContext('2d');
      resizeKineticCanvas();

      kineticParticles = [];
      const colors = [
        canvasToken('--joy-accent-default'),
        canvasToken('--joy-status-info-fg'),
        canvasToken('--joy-accent-hover'),
      ];
      for (let i = 0; i < KINETIC_PARTICLE_COUNT; i++) {
        kineticParticles.push({
          x: (Math.random() - 0.5) * 600,
          y: (Math.random() - 0.5) * 350,
          z: Math.random() * 300 - 150,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          vz: (Math.random() - 0.5) * 0.4,
          baseRadius: 1.5 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * colors.length)],
          phase: Math.random() * Math.PI * 2
        });
      }

      const container = document.getElementById('kinetic-hero-container');
      if (container) {
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
        container.addEventListener('touchmove', (e) => {
          if (e.touches.length > 0) {
            const rect = container.getBoundingClientRect();
            kineticMouse.x = e.touches[0].clientX - rect.left;
            kineticMouse.y = e.touches[0].clientY - rect.top;
            kineticMouse.isOver = true;
          }
        }, { passive: true });
        container.addEventListener('touchend', () => {
          kineticMouse.isOver = false;
          kineticMouse.x = -1000;
          kineticMouse.y = -1000;
        });
        container.addEventListener('click', triggerCanvasBurst);
      }

      window.addEventListener('resize', resizeKineticCanvas);
      if (!kineticAnimId) {
        animateKineticCanvas();
      }
    }

    function resizeKineticCanvas() {
      if (!kineticCanvas) return;
      const rect = kineticCanvas.parentElement ? kineticCanvas.parentElement.getBoundingClientRect() : null;
      if (!rect || rect.width === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      kineticCanvas.width = rect.width * dpr;
      kineticCanvas.height = rect.height * dpr;
      if (kineticCtx) {
        kineticCtx.scale(dpr, dpr);
      }
    }

    function triggerCanvasBurst(e) {
      if (!kineticCanvas) return;
      const container = document.getElementById('kinetic-hero-container');
      const rect = container ? container.getBoundingClientRect() : { left: 0, top: 0, width: 600, height: 380 };
      const clickX = e && e.clientX ? e.clientX - rect.left : rect.width / 2;
      const clickY = e && e.clientY ? e.clientY - rect.top : rect.height / 2;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const fov = 300;

      kineticParticles.forEach(p => {
        const scale = fov / (fov + p.z);
        const px = cx + p.x * scale;
        const py = cy + p.y * scale;
        const dx = px - clickX;
        const dy = py - clickY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = Math.max(0, 180 - dist) / 180;
        p.vx += (dx / dist) * force * 14;
        p.vy += (dy / dist) * force * 14;
        p.vz += (Math.random() - 0.5) * force * 10;
      });
    }

    function animateKineticCanvas() {
      // Respect user motion preference and tab visibility
      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (document.hidden || prefersReducedMotion) {
        kineticAnimId = setTimeout(animateKineticCanvas, 300);
        return;
      }

      kineticAnimId = requestAnimationFrame(animateKineticCanvas);
      if (!kineticCanvas || !kineticCtx) return;

      const panel = document.getElementById('view-landing-blocks');
      if (!panel || !panel.classList.contains('active')) return;

      const rect = kineticCanvas.parentElement ? kineticCanvas.parentElement.getBoundingClientRect() : null;
      if (!rect || rect.width === 0) return;
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      const fov = 300;

      kineticCtx.clearRect(0, 0, w, h);

      const cosRot = Math.cos(0.002);
      const sinRot = Math.sin(0.002);

      const projected = [];
      for (let i = 0; i < kineticParticles.length; i++) {
        const p = kineticParticles[i];

        const rx = p.x * cosRot - p.z * sinRot;
        const rz = p.z * cosRot + p.x * sinRot;
        p.x = rx;
        p.z = rz;

        const scale = fov / (fov + p.z);
        const px = cx + p.x * scale;
        const py = cy + p.y * scale;

        if (kineticMouse.isOver) {
          const mdx = px - kineticMouse.x;
          const mdy = py - kineticMouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 140 && mdist > 0) {
            const force = (140 - mdist) / 140;
            p.vx += (mdx / mdist) * force * 1.5 + (kineticMouse.vx * 0.05);
            p.vy += (mdy / mdist) * force * 1.5 + (kineticMouse.vy * 0.05);
          }
        }

        p.vx *= 0.94;
        p.vy *= 0.94;
        p.vz *= 0.94;
        p.x += p.vx + Math.sin(p.phase) * 0.2;
        p.y += p.vy + Math.cos(p.phase) * 0.2;
        p.z += p.vz;
        p.phase += 0.02;

        const boundaryX = w * 0.55;
        const boundaryY = h * 0.55;
        if (p.x < -boundaryX) { p.x = -boundaryX; p.vx *= -1; }
        if (p.x > boundaryX) { p.x = boundaryX; p.vx *= -1; }
        if (p.y < -boundaryY) { p.y = -boundaryY; p.vy *= -1; }
        if (p.y > boundaryY) { p.y = boundaryY; p.vy *= -1; }
        if (p.z < -160) { p.z = -160; p.vz *= -1; }
        if (p.z > 160) { p.z = 160; p.vz *= -1; }

        const finalScale = fov / (fov + p.z);
        projected.push({
          x: cx + p.x * finalScale,
          y: cy + p.y * finalScale,
          scale: finalScale,
          z: p.z,
          radius: p.baseRadius * finalScale,
          color: p.color
        });
      }

      const maxDist = 85;
      kineticCtx.lineWidth = 0.75;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * Math.min(p1.scale, p2.scale) * 0.35;
            kineticCtx.save();
            kineticCtx.globalAlpha = alpha;
            kineticCtx.strokeStyle = canvasToken('--joy-accent-default');
            kineticCtx.beginPath();
            kineticCtx.moveTo(p1.x, p1.y);
            kineticCtx.lineTo(p2.x, p2.y);
            kineticCtx.stroke();
            kineticCtx.restore();
          }
        }
      }

      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const rad = Math.max(1, p.radius);
        const glow = kineticCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 3);
        glow.addColorStop(0, p.color);
        glow.addColorStop(0.5, p.color);
        glow.addColorStop(1, 'transparent');

        kineticCtx.fillStyle = glow;
        kineticCtx.beginPath();
        kineticCtx.arc(p.x, p.y, rad * 3, 0, Math.PI * 2);
        kineticCtx.fill();

        kineticCtx.fillStyle = canvasToken('--joy-text-inverse');
        kineticCtx.beginPath();
        kineticCtx.arc(p.x, p.y, rad * 0.6, 0, Math.PI * 2);
        kineticCtx.fill();
      }
    }

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
      syncViewFromHash();
    }, 100);

    function switchSimulatorViewport(width, btn) {
      const frame = document.getElementById('simulator-viewport-frame');
      const info = document.getElementById('simulator-viewport-info');
      if (frame) {
        frame.style.maxWidth = width;
      }
      if (info) {
        info.textContent = width === '100%' ? 'Desktop (Fluid / 1440px)' : width === '768px' ? 'Tablet (768px)' : 'Mobile (375px)';
      }
      if (btn && btn.parentElement) {
        btn.parentElement.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    }

    function switchSimulatorPalette(palette, btn) {
      const container = document.getElementById('simulator-page-container');
      const info = document.getElementById('simulator-palette-info');
      if (container) {
        container.setAttribute('data-palette', palette);
      }
      if (info) {
        const names = {
          joymify: 'Joymify (Gold / Navy)',
          obsidian: 'Obsidian (Emerald / Slate)',
          quantum: 'Quantum (Cobalt / Midnight)',
          cyberpunk: 'Cyberpunk (Amethyst / Violet)',
          titanium: 'Titanium (Amber / Steel)'
        };
        info.textContent = names[palette] || palette;
      }
      if (btn && btn.parentElement) {
        btn.parentElement.querySelectorAll('.palette-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      }
    }

    function updateCodeSnippets() {
      const btnSnippet = document.getElementById('button-code');
      if (!btnSnippet) return;
      if (activeFramework === 'svelte') {
        btnSnippet.innerHTML = \`// Svelte 5 Runes Example<br>&lt;script&gt;<br>&nbsp;&nbsp;import { Button } from '@joymify/svelte';<br>&lt;/script&gt;<br><br>&lt;Button variant="solid" size="md" onclick={() => alert('Clicked')}&gt;Action&lt;/Button&gt;\`;
      } else {
        btnSnippet.innerHTML = \`// React 19 Modern Example<br>import { Button } from '@joymify/react';<br><br>&lt;Button variant="solid" size="md" onClick={() => alert('Clicked')}&gt;Action&lt;/Button&gt;\`;
      }
    }

  </script>
</body>
</html>

`;

fs.writeFileSync(path.join(outDir, "index.html"), html);
const tokensSrc = path.join(__dirname, "../../packages/tokens/dist/theme.css");
if (fs.existsSync(tokensSrc)) {
  fs.copyFileSync(tokensSrc, path.join(outDir, "theme.css"));
}
console.log("Built Storybook Hub static distribution in", outDir);
