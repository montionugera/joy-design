import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tokensPath = path.join(__dirname, 'src/tokens.json');
const outDir = path.join(__dirname, 'dist');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

// Resolve reference like "{color.gold.600}"
function resolveRef(refStr, rootTokens, depth = 0, seen = new Set()) {
  if (typeof refStr !== 'string') return refStr;
  const match = refStr.match(/^\{([^}]+)\}$/);
  if (!match) return refStr;
  const refPath = match[1];
  if (seen.has(refPath) || depth > 15) {
    throw new Error(`Cyclic token reference detected: ${refStr}`);
  }
  seen.add(refPath);
  const parts = refPath.split('.');
  let current = rootTokens;
  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      throw new Error(`Unknown token reference: ${refStr} at part '${part}'`);
    }
    current = current[part];
  }
  if (!current) {
    throw new Error(`Unknown token reference: ${refStr}`);
  }
  if (typeof current === 'object' && 'value' in current) {
    return resolveRef(current.value, rootTokens, depth + 1, seen);
  }
  return typeof current === 'string' ? resolveRef(current, rootTokens, depth + 1, seen) : refStr;
}

// Extract primitives, light semantics, dark semantics
function extractTokens(rootTokens) {
  const primitiveVars = [];
  const lightVars = [];
  const darkVars = [];
  const jsObj = {};

  // 1. Primitive colors
  if (rootTokens.color) {
    for (const [rampName, rampObj] of Object.entries(rootTokens.color)) {
      for (const [step, token] of Object.entries(rampObj)) {
        const val = resolveRef(token.value, rootTokens);
        primitiveVars.push(`  --joy-color-${rampName}-${step}: ${val};`);
        jsObj[`color-${rampName}-${step}`] = val;
      }
    }
  }

  // 2. Dimension and motion scales
  const scales = [
    { key: 'z', prefix: 'z' },
    { key: 'font-size', prefix: 'font-size' },
    { key: 'line-height', prefix: 'line-height' },
    { key: 'font-weight', prefix: 'font-weight' },
    { key: 'letter-spacing', prefix: 'letter-spacing' },
    { key: 'space', prefix: 'space' },
    { key: 'radius', prefix: 'radius' },
    { key: 'duration', prefix: 'duration' },
    { key: 'ease', prefix: 'ease' },
    { key: 'control-height', prefix: 'control-height' }
  ];

  for (const { key, prefix } of scales) {
    if (rootTokens[key]) {
      for (const [name, token] of Object.entries(rootTokens[key])) {
        const val = resolveRef(token.value, rootTokens);
        const cleanName = name.replace('.', '-');
        primitiveVars.push(`  --joy-${prefix}-${cleanName}: ${val};`);
        jsObj[`${prefix}-${cleanName}`] = val;
      }
    }
  }

  // 3. Font families
  if (rootTokens.font && rootTokens.font.family) {
    for (const [name, token] of Object.entries(rootTokens.font.family)) {
      const val = resolveRef(token.value, rootTokens);
      primitiveVars.push(`  --joy-font-family-${name}: ${val};`);
      jsObj[`font-family-${name}`] = val;
    }
  }

  // 4. Semantic Light
  if (rootTokens.semantic && rootTokens.semantic.light) {
    const light = rootTokens.semantic.light;
    for (const [group, groupObj] of Object.entries(light)) {
      if (group === 'focus-ring') {
        const val = resolveRef(groupObj.value, rootTokens);
        lightVars.push(`  --joy-focus-ring: ${val};`);
        jsObj['focus-ring'] = val;
      } else if (typeof groupObj === 'object') {
        for (const [name, token] of Object.entries(groupObj)) {
          const val = resolveRef(token.value, rootTokens);
          const varName = group === 'status' ? `status-${name}` : `${group}-${name}`;
          lightVars.push(`  --joy-${varName}: ${val};`);
          jsObj[varName] = val;
        }
      }
    }
  }

  // 5. Semantic Dark
  if (rootTokens.semantic && rootTokens.semantic.dark) {
    const dark = rootTokens.semantic.dark;
    for (const [group, groupObj] of Object.entries(dark)) {
      if (group === 'focus-ring') {
        const val = resolveRef(groupObj.value, rootTokens);
        darkVars.push(`  --joy-focus-ring: ${val};`);
      } else if (typeof groupObj === 'object') {
        for (const [name, token] of Object.entries(groupObj)) {
          const val = resolveRef(token.value, rootTokens);
          const varName = group === 'status' ? `status-${name}` : `${group}-${name}`;
          darkVars.push(`  --joy-${varName}: ${val};`);
        }
      }
    }
  }

  return { primitiveVars, lightVars, darkVars, jsObj };
}

const { primitiveVars, lightVars, darkVars, jsObj } = extractTokens(tokens);

// 1. theme.css with unified component classes
const componentStyles = `
/* ── Joymify Component Base Styling & Motion Engine ── */
@keyframes joy-fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes joy-modal-pop {
  from { opacity: 0; transform: scale(0.96) translateY(8px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes joy-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.joy-button__spinner-svg {
  width: 1em;
  height: 1em;
  animation: joy-spin 0.8s linear infinite;
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}

.joy-button {
  appearance: none;
  -webkit-appearance: none;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--joy-spacing-2);
  font-family: var(--joy-font-family-sans);
  font-weight: 600;
  letter-spacing: -0.01em;
  border-radius: var(--joy-radius-control);
  cursor: pointer;
  transition: all var(--joy-duration-fast) var(--joy-motion-easing-standard);
  border: 1px solid transparent;
  outline: none;
  user-select: none;
  -webkit-user-select: none;
  line-height: 1.25;
}
.joy-button:active:not(:disabled) {
  transform: scale(0.97);
}
.joy-button:focus-visible {
  outline: var(--joy-focus-ring); outline-offset: 2px;
}
.joy-button--sm {
  padding: 6px 12px;
  font-size: 0.8125rem;
  border-radius: var(--joy-radius-control);
}
.joy-button--md {
  padding: 8px 16px;
  font-size: 0.875rem;
  border-radius: var(--joy-radius-control);
}
.joy-button--lg {
  padding: 12px 24px;
  font-size: 1rem;
  border-radius: var(--joy-radius-card);
}
.joy-button--solid {
  background: var(--joy-accent-default);
  color: var(--joy-text-on-accent);
  border-color: var(--joy-accent-hover);
  box-shadow: var(--joy-elevation-1);
}
.joy-button--solid:hover:not(:disabled) {
  background: var(--joy-accent-hover);
  box-shadow: var(--joy-elevation-2);
}
.joy-button--outline {
  background-color: transparent;
  border-color: var(--joy-border-default);
  color: var(--joy-text-primary);
  box-shadow: var(--joy-elevation-0);
}
.joy-button--outline:hover:not(:disabled) {
  background-color: var(--joy-surface-raised);
  border-color: var(--joy-border-strong);
  color: var(--joy-text-primary);
}
.joy-button--ghost {
  background-color: transparent;
  color: var(--joy-text-primary);
}
.joy-button--ghost:hover:not(:disabled) {
  background-color: var(--joy-surface-sunken);
  color: var(--joy-text-primary);
}
.joy-button--danger {
  background: var(--joy-status-danger-fg);
  color: var(--joy-text-inverse);
  border-color: var(--joy-status-danger-border);
  box-shadow: var(--joy-elevation-1);
}
.joy-button--danger:hover:not(:disabled) {
  background: var(--joy-status-danger-fg);
  box-shadow: var(--joy-elevation-2);
}
.joy-button--glass {
  background: var(--joy-surface-raised);
  border-color: var(--joy-border-subtle);
  color: var(--joy-text-primary);
  box-shadow: var(--joy-elevation-1);
}
.joy-button--glass:hover:not(:disabled) {
  background: var(--joy-surface-raised);
  border-color: var(--joy-border-default);
  color: var(--joy-text-primary);
  box-shadow: var(--joy-elevation-2);
}
.joy-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Badge */
.joy-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--joy-font-family-sans);
  font-weight: 600;
  border-radius: var(--joy-radius-pill);
  line-height: 1;
}
.joy-badge--sm {
  padding: 3px 8px;
  font-size: 0.75rem;
}
.joy-badge--md {
  padding: 4px 10px;
  font-size: 0.8125rem;
}
.joy-badge--brand {
  background: var(--joy-accent-subtle);
  color: var(--joy-accent-text);
}
.joy-badge--neutral {
  background: var(--joy-surface-sunken);
  color: var(--joy-text-primary);
}
.joy-badge--success {
  background: var(--joy-status-success-bg);
  color: var(--joy-status-success-fg);
}
.joy-badge--warning {
  background: var(--joy-status-warning-bg);
  color: var(--joy-status-warning-fg);
}
.joy-badge--danger {
  background: var(--joy-status-danger-bg);
  color: var(--joy-status-danger-fg);
}
.joy-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

/* Input */
.joy-input-wrapper {
  position: relative;
  display: inline-flex;
  width: 100%;
}
.joy-input {
  width: 100%;
  font-family: var(--joy-font-family-sans);
  padding: 8px 12px;
  font-size: 0.9375rem;
  border: 1px solid var(--joy-border-subtle);
  border-radius: var(--joy-radius-control);
  background: var(--joy-surface-card);
  color: var(--joy-text-primary);
  outline: none;
  transition: all var(--joy-duration-fast);
}
.joy-input:focus {
  border-color: var(--joy-accent-default);
  border-color: var(--joy-border-focus);
  outline: var(--joy-focus-ring);
  outline-offset: 2px;
}
.joy-input-wrapper--error .joy-input {
  border-color: var(--joy-status-danger-fg);
}

/* Switch */
.joy-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  font-family: var(--joy-font-family-sans);
  font-size: 0.875rem;
  color: var(--joy-text-primary);
}
.joy-switch__thumb {
  position: relative;
  width: 42px;
  height: 24px;
  background: var(--joy-border-default);
  border-radius: 9999px;
  transition: background-color var(--joy-duration-fast) ease;
  display: inline-block;
}
.joy-switch__thumb::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: var(--joy-surface-card);
  border-radius: 50%;
  transition: transform var(--joy-duration-fast) cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: var(--joy-elevation-1);
}
.joy-switch--checked .joy-switch__thumb {
  background: var(--joy-accent-default);
}
.joy-switch--checked .joy-switch__thumb::after {
  transform: translateX(18px);
}
.joy-switch:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Alert */
.joy-alert {
  padding: 12px 16px;
  border-radius: var(--joy-radius-control);
  border: 1px solid var(--joy-border-default);
  font-family: var(--joy-font-family-sans);
  margin-bottom: 12px;
  animation: joy-fade-in var(--joy-duration-fast) ease-out;
}
.joy-alert__title {
  font-weight: 700;
  font-size: 0.9375rem;
  margin-bottom: 4px;
}
.joy-alert__desc {
  font-size: 0.875rem;
  line-height: 1.5;
  opacity: 0.9;
}
.joy-alert--info {
  background: var(--joy-status-info-bg);
  border: 1px solid var(--joy-status-info-border);
  color: var(--joy-status-info-fg);
}
.joy-alert--success {
  background: var(--joy-status-success-bg);
  border: 1px solid var(--joy-status-success-border);
  color: var(--joy-status-success-fg);
}
.joy-alert--warning {
  background: var(--joy-status-warning-bg);
  border: 1px solid var(--joy-status-warning-border);
  color: var(--joy-status-warning-fg);
}
.joy-alert--danger {
  background: var(--joy-status-danger-bg);
  border: 1px solid var(--joy-status-danger-border);
  color: var(--joy-status-danger-fg);
}

/* Metric Tile */
.joy-metric-tile {
  background: var(--joy-surface-card);
  border: 1px solid var(--joy-border-subtle);
  border-radius: var(--joy-radius-control);
  padding: 16px 20px;
  box-shadow: var(--joy-elevation-1);
  transition: transform var(--joy-duration-fast) ease, box-shadow var(--joy-duration-fast) ease;
}
.joy-metric-tile:hover {
  transform: translateY(-2px);
  box-shadow: var(--joy-elevation-2);
}
.joy-metric-tile__title {
  font-size: 0.8125rem;
  
  color: var(--joy-text-muted);
  margin-bottom: 6px;
}
.joy-metric-tile__value {
  font-size: 1.75rem;
  font-weight: 700;
  font-family: var(--joy-font-family-mono);
  color: var(--joy-text-primary);
}
.joy-metric-tile__change {
  font-size: 0.8125rem;
  font-weight: 600;
  margin-top: 4px;
}
.joy-metric-tile--up .joy-metric-tile__change {
  color: var(--joy-status-success-fg);
}
.joy-metric-tile--down .joy-metric-tile__change {
  color: var(--joy-status-danger-fg);
}
.joy-metric-tile--neutral .joy-metric-tile__change {
  color: var(--joy-text-muted);
}

/* Table */
.joy-table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  border: 1px solid var(--joy-border-subtle);
  border-radius: var(--joy-radius-control);
  background: var(--joy-surface-card);
  box-shadow: var(--joy-elevation-1);
  position: relative;
}
.joy-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--joy-font-family-sans);
  font-size: 0.875rem;
  text-align: left;
}
.joy-table thead {
  background: var(--joy-surface-raised);
  border-bottom: 1px solid var(--joy-border-subtle);
}
.joy-table th {
  padding: 10px 14px;
  font-weight: 600;
  color: var(--joy-text-primary);
}
.joy-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--joy-border-subtle);
  color: var(--joy-text-primary);
  transition: background-color var(--joy-duration-fast);
}
.joy-table tr:last-child td {
  border-bottom: none;
}
.joy-table tr:hover td {
  background-color: var(--joy-surface-raised);
}
.joy-table--compact th, .joy-table--compact td {
  padding: 6px 10px;
  font-size: 0.8125rem;
}

/* Responsive Stacking Mode (Mobile Viewports <= 768px) */
@media (max-width: 768px) {
  .joy-table-container--responsive-stack,
  .joy-table-container--stack {
    border: none;
    background: transparent;
    box-shadow: none;
    overflow-x: visible;
  }
  .joy-table--responsive-stack {
    display: block;
    width: 100%;
  }
  .joy-table--responsive-stack thead {
    display: none;
  }
  .joy-table--responsive-stack tbody {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }
  .joy-table--responsive-stack tr {
    display: block;
    border: 1px solid var(--joy-border-subtle);
    border-radius: var(--joy-radius-control);
    background-color: var(--joy-surface-card);
    padding: 12px 16px;
    box-shadow: var(--joy-elevation-1);
  }
  .joy-table--responsive-stack td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px dashed var(--joy-border-subtle);
    text-align: right !important;
  }
  .joy-table--responsive-stack tr:last-child td {
    border-bottom: 1px dashed var(--joy-border-subtle);
  }
  .joy-table--responsive-stack td:last-child {
    border-bottom: none;
  }
  .joy-table--responsive-stack td::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--joy-text-muted);
    text-align: left;
    padding-right: 12px;
    font-size: 0.8125rem;
  }
      }

/* ── Financial Ticker Flashing & Table Sorting ── */
@keyframes joy-ticker-flash-up {
  0% { background-color: var(--joy-status-success-bg); color: var(--joy-status-success-fg); }
  100% { background-color: transparent; }
}
@keyframes joy-ticker-flash-down {
  0% { background-color: var(--joy-status-danger-bg); color: var(--joy-status-danger-fg); }
  100% { background-color: transparent; }
}
@keyframes joy-skeleton-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.joy-table-cell--flash-up {
  animation: joy-ticker-flash-up 1000ms ease-out;
}
.joy-table-cell--flash-down {
  animation: joy-ticker-flash-down 1000ms ease-out;
}
.joy-table-th--sortable {
  cursor: pointer;
  user-select: none;
  transition: color var(--joy-duration-fast);
}
.joy-table-th--sortable:hover {
  color: var(--joy-accent-default);
}
.joy-table-sort-icon {
  display: inline-block;
  margin-left: 6px;
  font-size: 0.75rem;
  opacity: 0.5;
}
.joy-table-th--sorted-asc .joy-table-sort-icon,
.joy-table-th--sorted-desc .joy-table-sort-icon {
  opacity: 1;
  color: var(--joy-accent-default);
}

/* ── Pagination ── */
.joy-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--joy-font-family-sans);
  font-size: 0.875rem;
  padding: 12px 0;
  color: var(--joy-text-primary);
}
.joy-pagination__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: var(--joy-radius-control);
  border: 1px solid var(--joy-border-default);
  background: var(--joy-surface-card);
  color: var(--joy-text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--joy-duration-fast) ease;
}
.joy-pagination__btn:hover:not(:disabled) {
  border-color: var(--joy-accent-default);
  color: var(--joy-accent-default);
}
.joy-pagination__btn--active {
  background: var(--joy-accent-default);
  border-color: var(--joy-accent-default);
  color: var(--joy-text-on-accent);
}
.joy-pagination__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.joy-pagination__info {
  margin-left: auto;
  color: var(--joy-text-muted);
  font-size: 0.8125rem;
}

/* ── Skeleton Loaders ── */
.joy-skeleton {
  background: linear-gradient(90deg, var(--joy-surface-sunken) 25%, var(--joy-surface-raised) 37%, var(--joy-surface-sunken) 63%);
  background-size: 400% 100%;
  animation: joy-skeleton-shimmer 1.4s ease infinite;
  border-radius: var(--joy-radius-control);
  display: block;
}
.joy-skeleton--text {
  height: 14px;
  margin-bottom: 8px;
  border-radius: 4px;
}
.joy-skeleton--rect {
  width: 100%;
  height: 120px;
  border-radius: var(--joy-radius-control);
}
.joy-skeleton--circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

/* ── Modal / Dialog ── */
.joy-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: color-mix(in srgb, var(--joy-color-navy-500) 60%, transparent);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--joy-z-index-modal);
  animation: joy-fade-in var(--joy-duration-fast) ease-out;
  padding: 20px;
}
.joy-modal {
  background: var(--joy-surface-card);
  border-radius: var(--joy-radius-card);
  box-shadow: var(--joy-elevation-3);
  width: 100%;
  max-width: 520px;
  overflow: hidden;
  animation: joy-modal-pop var(--joy-duration-normal) cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.joy-modal__header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--joy-border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.joy-modal__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--joy-text-primary);
}
.joy-modal__close {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--joy-text-muted);
  transition: color var(--joy-duration-fast);
}
.joy-modal__close:hover {
  color: var(--joy-text-primary);
}
.joy-modal__body {
  padding: 24px;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--joy-text-primary);
}
.joy-modal__footer {
  padding: 16px 24px;
  background: var(--joy-surface-sunken);
  border-top: 1px solid var(--joy-border-subtle);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

/* ── Dropdown Menu ── */
.joy-dropdown-wrapper {
  position: relative;
  display: inline-block;
}
.joy-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 6px;
  background: var(--joy-surface-card);
  border: 1px solid var(--joy-border-subtle);
  border-radius: var(--joy-radius-control);
  box-shadow: var(--joy-elevation-3);
  min-width: 180px;
  z-index: var(--joy-z-index-dropdown);
  overflow: hidden;
  animation: joy-fade-in var(--joy-duration-fast) ease-out;
}
.joy-dropdown__item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  background: transparent;
  border: none;
  font-family: var(--joy-font-family-sans);
  font-size: 0.875rem;
  color: var(--joy-text-primary);
  cursor: pointer;
  transition: background-color var(--joy-duration-fast);
}
.joy-dropdown__item:hover {
  background-color: var(--joy-surface-raised);
  color: var(--joy-accent-default);
}

/* ── Tabs ── */
.joy-tabs {
  display: flex;
  border-bottom: 2px solid var(--joy-border-subtle);
  gap: 8px;
  margin-bottom: 20px;
}
.joy-tab-btn {
  background: transparent;
  border: none;
  padding: 10px 18px;
  font-family: var(--joy-font-family-sans);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--joy-text-muted);
  cursor: pointer;
  position: relative;
  transition: color var(--joy-duration-fast);
}
.joy-tab-btn:hover {
  color: var(--joy-accent-default);
}
.joy-tab-btn--active {
  color: var(--joy-accent-default);
}
.joy-tab-btn--active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--joy-accent-default);
  border-radius: 2px;
}

/* ── Tooltip ── */
.joy-tooltip-wrapper {
  position: relative;
  display: inline-block;
}
.joy-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-6px);
  background: var(--joy-surface-inverse);
  color: var(--joy-text-inverse);
  padding: 6px 10px;
  border-radius: var(--joy-radius-control);
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  z-index: var(--joy-z-index-tooltip);
  box-shadow: var(--joy-elevation-2);
  animation: joy-fade-in var(--joy-duration-fast) ease-out;
}
.joy-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: var(--joy-surface-inverse) transparent transparent transparent;
}



/* ── Select ── */
.joy-select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}
.joy-select,
.joy-select select,
select.joy-select__input {
  width: 100%;
  font-family: var(--joy-font-family-sans);
  padding: 8px 36px 8px 12px;
  font-size: 0.9375rem;
  border: 1px solid var(--joy-border-default);
  border-radius: var(--joy-radius-control);
  background-color: var(--joy-surface-card);
  color: var(--joy-text-primary);
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color var(--joy-duration-fast), box-shadow var(--joy-duration-fast);
}
.joy-select:focus {
  border-color: var(--joy-accent-default);
  border-color: var(--joy-border-focus);
  outline: var(--joy-focus-ring);
  outline-offset: 2px;
}
.joy-select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background-color: var(--joy-surface-sunken);
}

/* ── Checkbox ── */
.joy-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-family: var(--joy-font-family-sans);
  font-size: 0.9375rem;
  color: var(--joy-text-primary);
  user-select: none;
}
.joy-checkbox input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.joy-checkbox__box {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--joy-border-strong);
  border-radius: var(--joy-radius-control);
  background: var(--joy-surface-card);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--joy-duration-fast) ease;
  flex-shrink: 0;
}
.joy-checkbox input[type="checkbox"]:focus-visible + .joy-checkbox__box {
  outline: var(--joy-focus-ring); outline-offset: 2px;
}
.joy-checkbox input[type="checkbox"]:checked + .joy-checkbox__box {
  background: var(--joy-accent-default);
  border-color: var(--joy-accent-default);
}
.joy-checkbox input[type="checkbox"]:checked + .joy-checkbox__box::after {
  content: '';
  width: 5px;
  height: 9px;
  border: solid var(--joy-text-on-accent);
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translate(-0.5px, -1px);
}
.joy-checkbox--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Radio & Radio Group ── */
.joy-radio-group {
  display: flex;
  gap: 16px;
  font-family: var(--joy-font-family-sans);
}
.joy-radio-group--vertical {
  flex-direction: column;
  gap: 8px;
}
.joy-radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--joy-text-primary);
  user-select: none;
}
.joy-radio input[type="radio"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.joy-radio__circle {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--joy-border-strong);
  border-radius: 50%;
  background: var(--joy-surface-card);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--joy-duration-fast) ease;
  flex-shrink: 0;
}
.joy-radio input[type="radio"]:focus-visible + .joy-radio__circle {
  outline: var(--joy-focus-ring); outline-offset: 2px;
}
.joy-radio input[type="radio"]:checked + .joy-radio__circle {
  border-color: var(--joy-accent-default);
}
.joy-radio input[type="radio"]:checked + .joy-radio__circle::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--joy-accent-default);
}
.joy-radio--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Drawer / Slide-out Panel ── */
@keyframes joy-drawer-slide-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
@keyframes joy-drawer-slide-left {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
.joy-drawer-backdrop {
  position: fixed;
  inset: 0;
  background-color: color-mix(in srgb, var(--joy-color-navy-500) 50%, transparent);
  backdrop-filter: blur(2px);
  z-index: var(--joy-z-index-modal);
  display: flex;
  justify-content: flex-end;
  animation: joy-fade-in var(--joy-duration-fast) ease-out;
}
.joy-drawer {
  background: var(--joy-surface-card);
  width: 100%;
  max-width: 400px;
  height: 100%;
  box-shadow: var(--joy-elevation-3);
  display: flex;
  flex-direction: column;
  animation: joy-drawer-slide-right var(--joy-duration-normal) cubic-bezier(0.16, 1, 0.3, 1);
}
.joy-drawer--left {
  animation-name: joy-drawer-slide-left;
}
.joy-drawer__header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--joy-border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.joy-drawer__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--joy-text-primary);
}
.joy-drawer__close {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--joy-text-muted);
}
.joy-drawer__body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  color: var(--joy-text-primary);
}
.joy-drawer__footer {
  padding: 16px 20px;
  border-top: 1px solid var(--joy-surface-sunken);
  background: var(--joy-surface-raised);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* ── Toast Notifications ── */
@keyframes joy-toast-slide-in {
  from { opacity: 0; transform: translateY(16px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.joy-toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1200;
  pointer-events: none;
}
.joy-toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 280px;
  max-width: 420px;
  padding: 12px 16px;
  border-radius: var(--joy-radius-control);
  background: var(--joy-surface-card);
  color: var(--joy-text-primary);
  box-shadow: var(--joy-elevation-3);
  border: 1px solid var(--joy-border-subtle);
  animation: joy-toast-slide-in var(--joy-duration-normal) cubic-bezier(0.16, 1, 0.3, 1);
  font-family: var(--joy-font-family-sans);
  font-size: 0.875rem;
}
.joy-toast--info {
  border: 1px solid var(--joy-status-info-border);
}
.joy-toast--success {
  border: 1px solid var(--joy-status-success-border);
}
.joy-toast--warning {
  border: 1px solid var(--joy-status-warning-border);
}
.joy-toast--danger {
  border: 1px solid var(--joy-status-danger-border);
}

/* ── WCAG 2.2 AA Focus Indicators ── */
:focus-visible {
  outline: var(--joy-focus-ring);
  outline-offset: 2px;
}

/* ── Props Documentation Specification Tables ── */
.joy-props-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  font-family: var(--joy-font-family-sans);
  font-size: 0.8125rem;
  border-radius: var(--joy-radius-control);
  overflow: hidden;
  border: 1px solid var(--joy-border-subtle);
}
.joy-props-table th {
  background: var(--joy-surface-raised);
  padding: 8px 12px;
  font-weight: 600;
  text-align: left;
  border-bottom: 1px solid var(--joy-border-subtle);
  color: var(--joy-text-muted);
}
.joy-props-table td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--joy-border-subtle);
  color: var(--joy-text-primary);
}
.joy-props-table tr:last-child td {
  border-bottom: none;
}
.joy-prop-name {
  font-family: var(--joy-font-family-mono);
  color: var(--joy-accent-default);
  font-weight: 600;
}
.joy-prop-type {
  font-family: var(--joy-font-family-mono);
  color: var(--joy-status-info-fg);
  font-size: 0.75rem;
}
.joy-prop-default {
  font-family: var(--joy-font-family-mono);
  color: var(--joy-text-muted);
  font-size: 0.75rem;
}



h1, h2, h3, .joy-display {
  letter-spacing: var(--joy-font-display-letter-spacing);
}

/* ── Enterprise Parity Components (Wave 3) ── */
.joy-date-picker {
  display: inline-flex;
  align-items: center;
  position: relative;
  gap: 8px;
  padding: 8px 12px;
  background: var(--joy-surface-canvas);
  border: 1px solid var(--joy-border-subtle);
  border-radius: var(--joy-radius-control);
  box-shadow: var(--joy-elevation-1);
  transition: all var(--joy-duration-fast) ease;
  cursor: pointer;
}
.joy-date-picker:focus-within {
  border-color: var(--joy-accent-default);
  outline: var(--joy-focus-ring); outline-offset: 2px;
}
.joy-date-picker--error {
  border-color: var(--joy-status-danger-fg) !important;
}
.joy-date-picker--error:focus-within {
  outline: 2px solid var(--joy-status-danger-border); outline-offset: 2px;
}
.joy-date-picker--disabled {
  background: var(--joy-surface-sunken);
  cursor: not-allowed;
  opacity: 0.6;
}
.joy-date-picker__input {
  appearance: none;
  flex: 1 1 auto;
  min-width: 0;
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--joy-text-primary);
  background: transparent;
  border: 0;
  padding: 0;
  outline: none;
  cursor: inherit;
}
.joy-date-picker__icon {
  flex: 0 0 auto;
  color: var(--joy-text-muted);
  pointer-events: none;
  display: inline-flex;
  align-items: center;
}
.joy-date-picker__input::-webkit-calendar-picker-indicator {
  opacity: 0;
  cursor: pointer;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
.joy-date-range-picker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.joy-date-range-picker .joy-date-picker {
  flex: 1 1 0;
  min-width: 0;
}
.joy-date-range-picker__sep {
  color: var(--joy-text-muted);
  font-size: 0.875rem;
  flex: 0 0 auto;
}
.joy-date-range-picker--disabled .joy-date-range-picker__sep {
  color: var(--joy-text-muted);
}

/* Breadcrumb */
.joy-breadcrumb {
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--joy-text-muted);
}
.joy-breadcrumb ol {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.joy-breadcrumb li {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.joy-breadcrumb__link {
  color: var(--joy-text-muted);
  text-decoration: none;
  transition: color var(--joy-duration-fast) ease;
}
.joy-breadcrumb__link:hover {
  color: var(--joy-accent-default);
  text-decoration: underline;
}
.joy-breadcrumb__current {
  color: var(--joy-text-primary);
  font-weight: 500;
}
.joy-breadcrumb__sep {
  color: var(--joy-border-default);
}

/* Empty State */
.joy-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 48px 24px;
  background: var(--joy-surface-canvas);
  border: 1px dashed var(--joy-border-default);
  border-radius: var(--joy-radius-card);
  max-width: 480px;
  margin: 0 auto;
}
.joy-empty-state__icon {
  display: inline-flex;
  color: var(--joy-text-muted);
  margin-bottom: 4px;
}
.joy-empty-state__title {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--joy-text-primary);
  margin: 0;
}
.joy-empty-state__desc {
  font-size: 0.875rem;
  color: var(--joy-text-muted);
  line-height: 1.5;
  margin: 0;
  max-width: 40ch;
}
.joy-empty-state__action {
  margin-top: 8px;
}

/* Stat Card */
.joy-stat-card {
  background: var(--joy-surface-canvas);
  border: 1px solid var(--joy-border-subtle);
  border-radius: var(--joy-radius-card);
  padding: 20px;
  font-family: inherit;
  box-shadow: var(--joy-elevation-1);
}
.joy-stat-card__label {
  font-size: 0.75rem;
  font-weight: 600;
  
  color: var(--joy-text-muted);
}
.joy-stat-card__value {
  font-weight: 600;
  font-size: 2rem;
  line-height: 1.1;
  margin-top: 8px;
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
  color: var(--joy-text-primary);
}
.joy-stat-card__delta {
  font-size: 0.8125rem;
  margin-top: 6px;
  font-weight: 500;
}
.joy-stat-card__delta--positive {
  color: var(--joy-status-success-fg);
}
.joy-stat-card__delta--critical {
  color: var(--joy-status-danger-fg);
}
.joy-stat-card__delta--info {
  color: var(--joy-status-info-fg);
}
.joy-stat-card__delta--neutral {
  color: var(--joy-text-muted);
}

/* Progress */
.joy-progress {
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 0.875rem;
  color: var(--joy-text-primary);
}
.joy-progress__outer {
  flex: 1;
  margin-right: 8px;
}
.joy-progress__inner {
  background-color: var(--joy-surface-sunken);
  border-radius: 100px;
  overflow: hidden;
}
.joy-progress__bg {
  border-radius: 100px;
  transition: all 0.3s cubic-bezier(0.08, 0.82, 0.17, 1);
  background-color: var(--joy-accent-default);
  position: relative;
}
.joy-progress--status-success .joy-progress__bg {
  background-color: var(--joy-status-success-fg) !important;
}
.joy-progress--status-success .joy-progress__text {
  color: var(--joy-status-success-fg);
}
.joy-progress--status-exception .joy-progress__bg {
  background-color: var(--joy-status-danger-fg) !important;
}
.joy-progress--status-exception .joy-progress__text {
  color: var(--joy-status-danger-fg);
}
.joy-progress__text {
  width: 2.5em;
  text-align: left;
  margin-left: 8px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  font-size: 0.8125rem;
  font-weight: 500;
}

/* ── Wave 4: Ant Design Parity (Upload, Avatar, Slider, MarkdownViewer, Micro-animations) ── */
@keyframes joy-wave-spread {
  0% {
    box-shadow: 0 0 0 0 var(--joy-accent-default);
    opacity: 0.8;
  }
  100% {
    box-shadow: 0 0 0 6px transparent;
    opacity: 0;
  }
}
.joy-button--wave {
  position: relative;
}
.joy-button--wave::after {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  border-radius: inherit;
  opacity: 0;
  pointer-events: none;
  animation: joy-wave-spread 0.4s cubic-bezier(0.08, 0.82, 0.17, 1);
}

/* Upload & Dragger */
.joy-upload {
  box-sizing: border-box;
  font-family: var(--joy-font-family-sans);
}
.joy-upload-dragger {
  position: relative;
  width: 100%;
  padding: 24px 16px;
  background-color: var(--joy-surface-card);
  border: 1px dashed var(--joy-border-subtle);
  border-radius: var(--joy-radius-control);
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s cubic-bezier(0.08, 0.82, 0.17, 1), background-color 0.2s;
  user-select: none;
}
.joy-upload-dragger:hover, .joy-upload-dragger--dragover {
  border-color: var(--joy-accent-default);
  background-color: var(--joy-accent-subtle);
}
.joy-upload-dragger__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--joy-accent-subtle);
  color: var(--joy-accent-default);
  margin-bottom: 12px;
}
.joy-upload-dragger__text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--joy-text-primary);
  margin-bottom: 4px;
}
.joy-upload-dragger__hint {
  font-size: 0.75rem;
  color: var(--joy-text-muted);
}
.joy-upload-list {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.joy-upload-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: var(--joy-surface-sunken);
  border: 1px solid var(--joy-border-subtle);
  border-radius: var(--joy-radius-control);
  font-size: 0.8125rem;
  transition: background-color 0.15s;
}
.joy-upload-list__item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.joy-upload-list__item-remove {
  background: none;
  border: none;
  color: var(--joy-text-muted);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 0.15s, background-color 0.15s;
}
.joy-upload-list__item-remove:hover {
  color: var(--joy-status-danger-fg);
  background-color: var(--joy-status-danger-bg);
}

/* Avatar & AvatarGroup */
.joy-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--joy-font-family-sans);
  font-weight: 600;
  color: var(--joy-text-inverse);
  background-color: var(--joy-accent-default);
  user-select: none;
  overflow: visible;
}
.joy-avatar--circle {
  border-radius: 50%;
}
.joy-avatar--square {
  border-radius: var(--joy-radius-control);
}
.joy-avatar--sm {
  width: 28px;
  height: 28px;
  font-size: 0.75rem;
}
.joy-avatar--md {
  width: 36px;
  height: 36px;
  font-size: 0.875rem;
}
.joy-avatar--lg {
  width: 48px;
  height: 48px;
  font-size: 1.125rem;
}
.joy-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}
.joy-avatar__badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--joy-surface-card);
}
.joy-avatar__badge--online {
  background-color: var(--joy-status-success-fg);
}
.joy-avatar__badge--offline {
  background-color: var(--joy-text-muted);
}
.joy-avatar-group {
  display: inline-flex;
  align-items: center;
}
.joy-avatar-group .joy-avatar {
  margin-right: -8px;
  border: 2px solid var(--joy-surface-card);
  box-shadow: var(--joy-elevation-1);
}
.joy-avatar-group .joy-avatar:hover {
  z-index: 2;
  transform: translateY(-2px);
  transition: transform 0.2s cubic-bezier(0.08, 0.82, 0.17, 1);
}

/* Slider */
.joy-slider {
  position: relative;
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  touch-action: none;
  user-select: none;
  cursor: pointer;
}
.joy-slider__rail {
  position: absolute;
  width: 100%;
  height: 6px;
  background-color: var(--joy-surface-sunken);
  border-radius: 3px;
  transition: background-color 0.2s;
}
.joy-slider__track {
  position: absolute;
  height: 6px;
  background: var(--joy-accent-default);
  border-radius: 3px;
  transition: background-color 0.2s;
}
.joy-slider__handle {
  position: absolute;
  width: 18px;
  height: 18px;
  margin-left: -9px;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--joy-surface-card);
  border: 2px solid var(--joy-accent-default);
  border-radius: 50%;
  box-shadow: var(--joy-elevation-1);
  cursor: grab;
  transition: transform 0.15s cubic-bezier(0.08, 0.82, 0.17, 1), box-shadow 0.15s;
}
.joy-slider__handle:hover, .joy-slider__handle:focus-visible {
  transform: translateY(-50%) scale(1.2);
  outline: var(--joy-focus-ring); outline-offset: 2px;
  outline: none;
}
.joy-slider__handle:active {
  cursor: grabbing;
  transform: translateY(-50%) scale(1.1);
}
.joy-slider__tooltip {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 3px 8px;
  background-color: var(--joy-surface-raised);
  color: var(--joy-text-inverse);
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: var(--joy-elevation-2);
}

/* MarkdownViewer (Cherry Markdown Inspired) */
.joy-markdown {
  font-family: var(--joy-font-family-sans);
  line-height: 1.68;
  color: var(--joy-text-primary);
  font-size: 0.9375rem;
  word-break: break-word;
}
.joy-markdown h1, .joy-markdown h2, .joy-markdown h3 {
  color: inherit;
  font-weight: 700;
  letter-spacing: -0.015em;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
}
.joy-markdown p {
  margin: 0.8em 0;
}
.joy-markdown pre {
  position: relative;
  background-color: var(--joy-text-primary);
  color: var(--joy-border-subtle);
  padding: 16px;
  border-radius: var(--joy-radius-control);
  overflow-x: auto;
  font-family: var(--joy-font-family-mono);
  font-size: 0.84rem;
  line-height: 1.55;
  margin: 1em 0;
  border: 1px solid var(--joy-border-subtle);
}
.joy-markdown code {
  font-family: var(--joy-font-family-mono);
  font-size: 0.875em;
  background-color: var(--joy-surface-raised);
  color: var(--joy-accent-default);
  padding: 2px 6px;
  border-radius: 4px;
}
.joy-markdown pre code {
  background-color: transparent !important;
  color: inherit !important;
  padding: 0;
}
.joy-markdown blockquote {
  border: 1px solid var(--joy-border-default);
  margin: 1em 0;
  padding: 8px 16px;
  background-color: var(--joy-surface-raised);
  border-radius: var(--joy-radius-control);
  color: var(--joy-text-secondary);
}
.joy-markdown table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.2em 0;
  font-size: 0.875rem;
}
.joy-markdown th, .joy-markdown td {
  border: 1px solid var(--joy-border-subtle);
  padding: 8px 12px;
  text-align: left;
}
.joy-markdown th {
  background-color: var(--joy-surface-sunken);
  font-weight: 600;
}
.joy-markdown .joy-markdown__copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  background: var(--joy-surface-card);
  color: var(--joy-text-secondary);
  border: 1px solid var(--joy-border-subtle);
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}
.joy-markdown .joy-markdown__copy-btn:hover {
  background: var(--joy-surface-raised);
  color: var(--joy-text-primary);
}

/* ── Wave 5: Landing Page Architecture & Enterprise Workflow Suite ── */

/* Bento Grid & Card (Framer / Linear Inspired) */
.joy-bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
  width: 100%;
}
.joy-bento-card {
  position: relative;
  border-radius: var(--joy-radius-card);
  background-color: var(--joy-surface-card);
  border: 1px solid var(--joy-border-subtle);
  padding: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.25s cubic-bezier(0.08, 0.82, 0.17, 1), box-shadow 0.25s, border-color 0.25s;
}
.joy-bento-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--joy-elevation-3);
  border-color: var(--joy-border-default);
}
.joy-bento-card--col-3, .joy-bento-card--col-span-3 { grid-column: span 3; }
.joy-bento-card--col-4, .joy-bento-card--col-span-4 { grid-column: span 4; }
.joy-bento-card--col-6, .joy-bento-card--col-span-6 { grid-column: span 6; }
.joy-bento-card--col-8, .joy-bento-card--col-span-8 { grid-column: span 8; }
.joy-bento-card--col-12, .joy-bento-card--col-span-12 { grid-column: span 12; }
.joy-bento-card--col-span-1 { grid-column: span 1; }
.joy-bento-card--col-span-2 { grid-column: span 2; }
.joy-bento-card--col-span-5 { grid-column: span 5; }
.joy-bento-card--col-span-7 { grid-column: span 7; }
.joy-bento-card--col-span-9 { grid-column: span 9; }
.joy-bento-card--col-span-10 { grid-column: span 10; }
.joy-bento-card--col-span-11 { grid-column: span 11; }
@media (max-width: 900px) {
  .joy-bento-card--col-3, .joy-bento-card--col-4, .joy-bento-card--col-6, .joy-bento-card--col-8,
  .joy-bento-card--col-span-2, .joy-bento-card--col-span-3, .joy-bento-card--col-span-4,
  .joy-bento-card--col-span-5, .joy-bento-card--col-span-6, .joy-bento-card--col-span-7,
  .joy-bento-card--col-span-8, .joy-bento-card--col-span-9, .joy-bento-card--col-span-10 {
    grid-column: span 12;
  }
}
.joy-bento-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--joy-accent-default);
  margin-bottom: 12px;
}
.joy-bento-card__title {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--joy-text-primary);
  margin: 0 0 8px 0;
}
.joy-bento-card__desc {
  font-size: 0.875rem;
  color: var(--joy-text-muted);
  line-height: 1.5;
  margin: 0 0 16px 0;
}
.joy-bento-card__content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Hero Section */
.joy-hero {
  position: relative;
  text-align: center;
  padding: 48px 24px 36px;
  max-width: 1040px;
  margin: 0 auto;
}
.joy-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  background-color: var(--joy-accent-subtle);
  border: 1px solid var(--joy-accent-default);
  color: var(--joy-accent-default);
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 24px;
}
.joy-hero__title {
  font-size: 2.75rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: var(--joy-text-primary);
  margin: 0 0 20px 0;
}
.joy-hero__title-gradient {
  color: var(--joy-text-primary);
}
.joy-hero__subtitle {
  font-size: 1.125rem;
  color: var(--joy-text-muted);
  line-height: 1.6;
  max-width: 680px;
  margin: 0 auto 32px auto;
}
.joy-hero__ctas {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 36px;
}
.joy-hero .joy-button--outline,
.kinetic-overlay .joy-button--outline {
  background: var(--joy-surface-raised);
  border-color: var(--joy-border-default);
  color: var(--joy-text-primary);
  
}
.joy-hero .joy-button--outline:hover:not(:disabled),
.kinetic-overlay .joy-button--outline:hover:not(:disabled) {
  background: var(--joy-surface-sunken);
  border-color: var(--joy-border-strong);
  color: var(--joy-text-primary);
}
.joy-hero__preview {
  position: relative;
  border-radius: var(--joy-radius-overlay);
  border: 1px solid var(--joy-border-subtle);
  background-color: var(--joy-surface-card);
  box-shadow: var(--joy-elevation-3);
  padding: 16px;
  overflow: hidden;
}

/* Pricing Matrix */
.joy-pricing-matrix {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  width: 100%;
  max-width: 1080px;
  margin: 0 auto;
}
.joy-pricing-card {
  position: relative;
  border-radius: var(--joy-radius-card);
  background-color: var(--joy-surface-card);
  border: 1px solid var(--joy-border-subtle);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  transition: all 0.25s cubic-bezier(0.08, 0.82, 0.17, 1);
}
.joy-pricing-card--featured {
  border-color: var(--joy-accent-default);
  box-shadow: var(--joy-elevation-3);
  transform: scale(1.02);
}
.joy-pricing-card__badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  border-radius: 9999px;
  background: var(--joy-accent-default);
  color: var(--joy-text-on-accent);
  color: var(--joy-text-inverse);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.joy-pricing-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--joy-text-primary);
}
.joy-pricing-card__desc {
  font-size: 0.875rem;
  color: var(--joy-text-muted);
  margin: 0 0 20px 0;
}
.joy-pricing-card__price {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--joy-text-primary);
  margin-bottom: 24px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.joy-pricing-card__period {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--joy-text-muted);
}
.joy-pricing-card__features {
  list-style: none;
  padding: 0;
  margin: 0 0 32px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}
.joy-pricing-card__feature {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
  color: var(--joy-text-secondary);
}

/* Testimonial Card */
.joy-testimonial-card {
  border-radius: var(--joy-radius-card);
  background-color: var(--joy-surface-card);
  border: 1px solid var(--joy-border-subtle);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--joy-elevation-2);
}
.joy-testimonial-card__stars {
  display: flex;
  gap: 4px;
  color: var(--joy-status-warning-fg);
}
.joy-testimonial-card__quote {
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--joy-text-primary);
  font-style: italic;
  margin: 0;
}
.joy-testimonial-card__author {
  display: flex;
  align-items: center;
  gap: 12px;
}
.joy-testimonial-card__author-info h6 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--joy-text-primary);
}
.joy-testimonial-card__author-info p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--joy-text-muted);
}

/* Steps (Ant Design Parity) */
.joy-steps {
  display: flex;
  width: 100%;
  margin: 16px 0;
}
.joy-steps--horizontal {
  flex-direction: row;
}
.joy-steps--vertical {
  flex-direction: column;
}
.joy-steps__item {
  position: relative;
  display: flex;
  flex: 1;
  overflow: hidden;
  gap: 12px;
}
.joy-steps--horizontal .joy-steps__item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 16px;
  left: calc(32px + 8px);
  right: 8px;
  height: 1px;
  background-color: var(--joy-border-subtle);
}
.joy-steps__icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  background-color: var(--joy-surface-sunken);
  color: var(--joy-text-muted);
  border: 1px solid var(--joy-border-subtle);
  flex-shrink: 0;
  z-index: 1;
  transition: all 0.2s;
}
.joy-steps__item--process .joy-steps__icon {
  background-color: var(--joy-accent-default);
  color: var(--joy-text-on-accent);
  border-color: var(--joy-accent-default);
  box-shadow: 0 0 0 4px var(--joy-accent-subtle);
}
.joy-steps__item--finish .joy-steps__icon {
  background-color: var(--joy-status-success-bg);
  color: var(--joy-status-success-fg);
  border-color: var(--joy-status-success-fg);
}
.joy-steps__item--error .joy-steps__icon {
  background-color: var(--joy-status-danger-bg);
  color: var(--joy-status-danger-fg);
  border-color: var(--joy-status-danger-fg);
}
.joy-steps__content {
  display: flex;
  flex-direction: column;
}
.joy-steps__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--joy-text-primary);
}
.joy-steps__desc {
  font-size: 0.75rem;
  color: var(--joy-text-muted);
  margin-top: 2px;
}

/* Timeline (Ant Design Parity) */
.joy-timeline {
  display: flex;
  flex-direction: column;
  position: relative;
  margin: 0;
  padding: 0;
  list-style: none;
}
.joy-timeline__item {
  position: relative;
  padding-bottom: 20px;
  padding-left: 28px;
}
.joy-timeline__item:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 10px;
  bottom: 0;
  width: 2px;
  background-color: var(--joy-border-subtle);
}
.joy-timeline__dot {
  position: absolute;
  left: 0;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--joy-surface-card);
  border: 2px solid var(--joy-accent-default);
}
.joy-timeline__dot--success { border-color: var(--joy-status-success-fg); }
.joy-timeline__dot--warning { border-color: var(--joy-status-warning-border); }
.joy-timeline__dot--danger { border-color: var(--joy-status-danger-fg); }
.joy-timeline__dot--info { border-color: var(--joy-status-info-border); }
.joy-timeline__content {
  font-size: 0.875rem;
  color: var(--joy-text-primary);
}
.joy-timeline__time {
  font-size: 0.75rem;
  color: var(--joy-text-muted);
  margin-top: 4px;
}

/* Result (Ant Design Parity) */
.joy-result {
  text-align: center;
  padding: 48px 32px;
  max-width: 600px;
  margin: 0 auto;
}
.joy-result__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  margin-bottom: 24px;
}
.joy-result--success .joy-result__icon {
  background-color: var(--joy-status-success-bg);
  color: var(--joy-status-success-fg);
}
.joy-result--error .joy-result__icon {
  background-color: var(--joy-status-danger-bg);
  color: var(--joy-status-danger-fg);
}
.joy-result--warning .joy-result__icon {
  background-color: var(--joy-status-warning-bg);
  color: var(--joy-status-warning-fg);
}
.joy-result--info .joy-result__icon {
  background-color: var(--joy-status-info-bg);
  color: var(--joy-status-info-fg);
}
.joy-result--404 .joy-result__icon, .joy-result--403 .joy-result__icon {
  background-color: var(--joy-surface-sunken);
  color: var(--joy-accent-default);
}
.joy-result__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: var(--joy-text-primary);
}
.joy-result__subtitle {
  font-size: 0.9375rem;
  color: var(--joy-text-muted);
  line-height: 1.55;
  margin: 0 0 24px 0;
}
.joy-result__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

/* ── Financial & Large-Dataset Chart Engine ── */
.joy-chart {
  position: relative;
  width: 100%;
  box-sizing: border-box;
  font-family: var(--joy-font-family-mono);
  user-select: none;
  overflow: hidden;
  background-color: var(--joy-surface-card);
  border: 1px solid var(--joy-border-subtle);
  border-radius: var(--joy-radius-control);
}
.joy-chart__canvas-container {
  position: relative;
  width: 100%;
  height: 100%;
}
.joy-chart__canvas-base,
.joy-chart__canvas-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: block;
}
.joy-chart__hud {
  position: absolute;
  top: 12px;
  left: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  background: var(--joy-surface-card);
  
  border: 1px solid var(--joy-border-subtle);
  border-radius: var(--joy-radius-control);
  font-size: 0.75rem;
  color: var(--joy-text-primary);
  pointer-events: none;
  z-index: 5;
  box-shadow: var(--joy-elevation-1);
}
.joy-chart__hud-item {
  display: flex;
  gap: 4px;
}
.joy-chart__hud-label {
  color: var(--joy-text-muted);
  font-weight: 500;
}
.joy-chart__hud-value {
  font-weight: 600;
}

/* ── Ant Design Layout Primitives ── */
/* Divider */
.joy-divider {
  display: flex;
  clear: both;
  width: 100%;
  min-width: 100%;
  margin: 16px 0;
  border-top: 1px solid var(--joy-border-subtle);
}
.joy-divider--dashed {
  border-top-style: dashed;
}
.joy-divider--vertical {
  display: inline-block;
  width: 1px;
  min-width: 1px;
  height: 0.9em;
  margin: 0 8px;
  vertical-align: middle;
  border-top: 0;
  border-left: 1px solid var(--joy-border-subtle);
}
.joy-divider--with-text {
  display: flex;
  align-items: center;
  margin: 16px 0;
  border-top: 0;
}
.joy-divider--with-text::before,
.joy-divider--with-text::after {
  content: '';
  flex: 1;
  border-top: 1px solid var(--joy-border-subtle);
}
.joy-divider__text {
  padding: 0 16px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--joy-text-muted);
  white-space: nowrap;
}

/* Flex */
.joy-flex {
  display: flex;
  box-sizing: border-box;
}

/* Space */
.joy-space {
  display: inline-flex;
  flex-wrap: nowrap;
  box-sizing: border-box;
}
.joy-space--vertical {
  flex-direction: column;
}

/* Splitter */
.joy-splitter {
  display: flex;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid var(--joy-border-subtle);
  border-radius: var(--joy-radius-control);
}
.joy-splitter--vertical {
  flex-direction: column;
}
.joy-splitter__pane {
  overflow: auto;
  box-sizing: border-box;
}
.joy-splitter__bar {
  position: relative;
  flex: 0 0 6px;
  background-color: var(--joy-surface-sunken);
  cursor: col-resize;
  user-select: none;
  transition: background-color 0.15s ease;
}
.joy-splitter--vertical > .joy-splitter__bar {
  cursor: row-resize;
}
.joy-splitter__bar:hover,
.joy-splitter__bar--active {
  background-color: var(--joy-accent-default);
}

/* ── Ant Design Data Display Primitives ── */
/* Statistic */
.joy-statistic {
  box-sizing: border-box;
  font-family: var(--joy-font-family-sans);
}
.joy-statistic__title {
  font-size: 0.8125rem;
  color: var(--joy-text-muted);
  margin-bottom: 4px;
}
.joy-statistic__content {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--joy-text-primary);
}
.joy-statistic__prefix,
.joy-statistic__suffix {
  font-size: 0.9375rem;
  font-weight: 500;
}

/* Tag */
.joy-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.5;
  border-radius: var(--joy-radius-control);
  border: 1px solid var(--joy-border-subtle);
  background-color: var(--joy-surface-raised);
  color: var(--joy-text-primary);
  transition: all 0.15s ease;
  white-space: nowrap;
}
.joy-tag--primary {
  background-color: var(--joy-surface-raised);
  border-color: var(--joy-accent-default);
  color: var(--joy-accent-default);
}
.joy-tag--success {
  background-color: var(--joy-status-success-bg);
  border-color: var(--joy-status-success-border);
  color: var(--joy-status-success-fg);
}
.joy-tag--warning {
  background-color: var(--joy-status-warning-bg);
  border-color: var(--joy-status-warning-border);
  color: var(--joy-status-warning-fg);
}
.joy-tag--danger {
  background-color: var(--joy-status-danger-bg);
  border-color: var(--joy-status-danger-border);
  color: var(--joy-status-danger-fg);
}
.joy-tag--checkable {
  cursor: pointer;
}
.joy-tag--checkable:hover {
  opacity: 0.85;
}
.joy-tag--checked {
  background-color: var(--joy-accent-default);
  border-color: var(--joy-accent-default);
  color: var(--joy-text-on-accent);
}

/* Segmented */
.joy-segmented {
  display: inline-flex;
  padding: 3px;
  background-color: var(--joy-surface-sunken);
  border-radius: var(--joy-radius-control);
  border: 1px solid var(--joy-border-subtle);
}
.joy-segmented__item {
  position: relative;
  padding: 5px 14px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--joy-text-muted);
  border: none;
  background: transparent;
  border-radius: var(--joy-radius-control);
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}
.joy-segmented__item:hover {
  color: var(--joy-text-primary);
}
.joy-segmented__item--active {
  background-color: var(--joy-surface-card);
  color: var(--joy-accent-default);
  font-weight: 600;
  box-shadow: var(--joy-elevation-1);
}

/* ── Ant Design Form & Advanced Data Entry Suite ── */
/* Form & FormItem */
.joy-form {
  box-sizing: border-box;
  width: 100%;
}
.joy-form-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}
.joy-form-item--horizontal {
  flex-direction: row;
  align-items: flex-start;
}
.joy-form-item__label {
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--joy-text-primary);
  margin-bottom: 6px;
  line-height: 1.5;
}
.joy-form-item--horizontal .joy-form-item__label {
  width: var(--joy-form-label-width);
  min-width: var(--joy-form-label-width);
  margin-bottom: 0;
  padding-right: 12px;
  justify-content: flex-end;
  text-align: right;
  flex-shrink: 0;
  box-sizing: border-box;
  height: 36px;
  white-space: nowrap;
}
.joy-form-item--horizontal .joy-form-item__label::after {
  content: ":";
  position: relative;
  margin: 0 0 0 2px;
  top: -0.5px;
}
.joy-form-item--no-colon .joy-form-item__label::after,
.joy-form--no-colon .joy-form-item__label::after {
  content: "";
}
.joy-form-item--label-left .joy-form-item__label,
.joy-form--label-left .joy-form-item__label {
  justify-content: flex-start;
  text-align: left;
}
.joy-form-item__required {
  color: var(--joy-status-danger-fg);
  margin-right: 4px;
  font-family: SimSun, sans-serif;
  line-height: 1;
}
.joy-form-item__control {
  flex: 1;
  min-width: 0;
  position: relative;
}
.joy-form-item__actions,
.joy-form-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
.joy-form-item--horizontal .joy-form-item__actions,
.joy-form--horizontal .joy-form-actions {
  margin-left: var(--joy-form-label-width);
}
.joy-form-item__explain {
  font-size: 0.75rem;
  color: var(--joy-status-danger-fg);
  margin-top: 4px;
  min-height: 18px;
}
.joy-form-item--error input,
.joy-form-item--error textarea,
.joy-form-item--error .joy-input-wrapper {
  border-color: var(--joy-status-danger-fg) !important;
}

/* InputNumber */
.joy-input-number {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  max-width: 180px;
  border: 1px solid var(--joy-border-subtle);
  border-radius: var(--joy-radius-control);
  background-color: var(--joy-surface-card);
  transition: all 0.2s;
  overflow: hidden;
}
.joy-input-number:focus-within {
  border-color: var(--joy-accent-default);
  outline: var(--joy-focus-ring); outline-offset: 2px;
}
.joy-input-number__input {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: none;
  background: transparent;
  color: var(--joy-text-primary);
  font-family: var(--joy-font-family-mono);
  font-size: 0.875rem;
  outline: none;
}
.joy-input-number__handler-wrap {
  display: flex;
  flex-direction: column;
  width: 24px;
  border-left: 1px solid var(--joy-border-subtle);
  background: var(--joy-surface-raised);
  flex-shrink: 0;
}
.joy-input-number__handler-up,
.joy-input-number__handler-down {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 18px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--joy-text-muted);
  padding: 0;
  transition: background-color 0.15s;
}
.joy-input-number__handler-up {
  border-bottom: 1px solid var(--joy-border-subtle);
}
.joy-input-number__handler-up:hover,
.joy-input-number__handler-down:hover {
  background: var(--joy-surface-raised);
  color: var(--joy-accent-default);
}

/* Rate */
.joy-rate {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  user-select: none;
}
.joy-rate__star {
  position: relative;
  display: inline-block;
  cursor: pointer;
  color: var(--joy-border-subtle);
  transition: transform 0.15s ease, color 0.15s ease;
}
.joy-rate__star:hover {
  transform: scale(1.15);
}
.joy-rate__star--full {
  color: var(--joy-accent-default);
}
.joy-rate__star--half {
  color: var(--joy-accent-default);
}

/* Mentions */
.joy-mentions {
  position: relative;
  width: 100%;
}
.joy-mentions__textarea {
  width: 100%;
  box-sizing: border-box;
  padding: 8px 12px;
  font-family: var(--joy-font-family-sans);
  font-size: 0.875rem;
  border: 1px solid var(--joy-border-subtle);
  border-radius: var(--joy-radius-control);
  background-color: var(--joy-surface-card);
  color: var(--joy-text-primary);
  outline: none;
  resize: vertical;
}
.joy-mentions__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 200px;
  max-height: 180px;
  overflow-y: auto;
  background: var(--joy-surface-card);
  border: 1px solid var(--joy-border-subtle);
  border-radius: var(--joy-radius-control);
  box-shadow: var(--joy-elevation-2);
  z-index: 50;
  padding: 4px;
}
.joy-mentions__item {
  padding: 6px 10px;
  font-size: 0.8125rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--joy-text-primary);
}
.joy-mentions__item:hover {
  background-color: var(--joy-surface-raised);
  color: var(--joy-accent-default);
}

/* TimePicker */
.joy-time-picker {
  position: relative;
  display: inline-block;
}
.joy-time-picker__panel {
  position: absolute;
  top: 100%;
  left: 0;
  display: flex;
  background: var(--joy-surface-card);
  border: 1px solid var(--joy-border-subtle);
  border-radius: var(--joy-radius-control);
  box-shadow: var(--joy-elevation-2);
  z-index: 50;
  overflow: hidden;
  margin-top: 4px;
}
.joy-time-picker__column {
  width: 56px;
  max-height: 180px;
  overflow-y: auto;
  border-right: 1px solid var(--joy-border-subtle);
  padding: 4px 0;
}
.joy-time-picker__cell {
  height: 28px;
  line-height: 28px;
  text-align: center;
  font-size: 0.8125rem;
  cursor: pointer;
  color: var(--joy-text-primary);
}
.joy-time-picker__cell:hover {
  background-color: var(--joy-surface-raised);
}
.joy-time-picker__cell--selected {
  background-color: var(--joy-accent-default);
  color: var(--joy-text-on-accent) !important;
  font-weight: 600;
}

/* Transfer (Screenshot 5 parity) */
.joy-transfer {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
}
.joy-transfer__list {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 240px;
  border: 1px solid var(--joy-border-subtle);
  border-radius: var(--joy-radius-control);
  background-color: var(--joy-surface-card);
  overflow: hidden;
}
.joy-transfer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background-color: var(--joy-surface-raised);
  border-bottom: 1px solid var(--joy-border-subtle);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--joy-text-primary);
}
.joy-transfer__body {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
}
.joy-transfer__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  font-size: 0.8125rem;
  cursor: pointer;
  color: var(--joy-text-primary);
  transition: background-color 0.15s;
}
.joy-transfer__item:hover {
  background-color: var(--joy-surface-raised);
}
.joy-transfer__operations {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ── Menu ── */
.joy-menu {
  display: flex;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  list-style: none;
  background-color: var(--joy-surface-card);
  border-bottom: 1px solid var(--joy-border-subtle);
  font-family: var(--joy-font-family-sans);
  font-size: 0.875rem;
}
.joy-menu--horizontal {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
.joy-menu--vertical,
.joy-menu--inline {
  flex-direction: column;
  border-bottom: none;
  border-right: 1px solid var(--joy-border-subtle);
  width: 240px;
}
.joy-menu__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  color: var(--joy-text-primary);
  transition: all 0.15s ease;
  user-select: none;
}
.joy-menu__item:hover {
  color: var(--joy-accent-default);
}
.joy-menu__item--active {
  color: var(--joy-accent-default) !important;
  font-weight: 600;
}
.joy-menu--horizontal .joy-menu__item--active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--joy-accent-default);
}
.joy-menu--inline .joy-menu__item--active {
  background-color: var(--joy-accent-subtle);
  border-right: 1px solid var(--joy-border-default);
}
.joy-menu__submenu {
  display: flex;
  flex-direction: column;
}

/* ── Anchor ── */
.joy-anchor {
  position: relative;
  padding-left: 12px;
}
.joy-anchor__ink {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--joy-border-subtle);
}
.joy-anchor__ink-ball {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid var(--joy-accent-default);
  background-color: var(--joy-surface-card);
  transition: top 0.2s ease;
}
.joy-anchor__link {
  display: block;
  padding: 4px 0;
  font-size: 0.8125rem;
  color: var(--joy-text-muted);
  text-decoration: none;
  transition: color 0.15s ease;
}
.joy-anchor__link:hover,
.joy-anchor__link--active {
  color: var(--joy-accent-default);
  font-weight: 600;
}

/* ── Message ── */
.joy-message {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1010;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.joy-message__notice {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background-color: var(--joy-surface-card);
  border-radius: var(--joy-radius-control);
  box-shadow: var(--joy-elevation-2);
  font-size: 0.875rem;
  color: var(--joy-text-primary);
  animation: joyMessageSlideDown 0.25s ease-out;
}
@keyframes joyMessageSlideDown {
  from { opacity: 0; transform: translateY(-16px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ── Notification ── */
.joy-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 1010;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.joy-notification__notice {
  position: relative;
  width: 340px;
  padding: 16px 20px;
  background-color: var(--joy-surface-card);
  border-radius: var(--joy-radius-card);
  box-shadow: var(--joy-elevation-3);
  border: 1px solid var(--joy-border-subtle);
}
.joy-notification__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--joy-text-primary);
  margin-bottom: 4px;
}
.joy-notification__desc {
  font-size: 0.8125rem;
  color: var(--joy-text-muted);
  line-height: 1.5;
}

/* ── Popconfirm ── */
.joy-popconfirm {
  position: relative;
  display: inline-block;
}
.joy-popconfirm__panel {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: 220px;
  padding: 14px;
  background-color: var(--joy-surface-card);
  border-radius: var(--joy-radius-control);
  box-shadow: var(--joy-elevation-2);
  border: 1px solid var(--joy-border-subtle);
  z-index: 100;
}
.joy-popconfirm__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--joy-text-primary);
  margin-bottom: 10px;
}
.joy-popconfirm__buttons {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

/* ── Spin ── */
.joy-spin {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--joy-accent-default);
}
.joy-spin__indicator {
  animation: joySpinRotate 1s linear infinite;
}
@keyframes joySpinRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.joy-spin__container {
  position: relative;
}
.joy-spin__mask {
  position: absolute;
  inset: 0;
  background-color: color-mix(in srgb, var(--joy-surface-canvas) 65%, transparent);
  
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}

/* ── Tactile Micro-Animations & Wave Effects ── */
@keyframes joy-button-wave {
  0% { box-shadow: 0 0 0 0 var(--joy-accent-default); }
  100% { box-shadow: 0 0 0 8px transparent; }
}
.joy-button:active:not(:disabled) {
  animation: joy-button-wave 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ── TreeSelect & Cascader Hierarchical Primitives ── */
.joy-treeselect, .joy-cascader {
  position: relative;
  display: inline-block;
  width: 100%;
  font-family: var(--joy-font-family-sans);
}
.joy-treeselect--disabled, .joy-cascader--disabled {
  opacity: 0.6;
  pointer-events: none;
}
.joy-treeselect__node--selected, .joy-cascader-menus [role="option"][aria-selected="true"] {
  background-color: var(--joy-accent-subtle) !important;
  color: var(--joy-accent-default) !important;
}

/* ── Live Markdown Editor ── */
.joy-markdown-editor {
  display: flex;
  flex-direction: column;
  font-family: var(--joy-font-family-sans);
  background-color: var(--joy-surface-card);
  color: var(--joy-text-primary);
}
.joy-markdown-editor--fullscreen {
  position: fixed !important;
  inset: 0 !important;
  z-index: 1100 !important;
  height: 100vh !important;
  border-radius: 0 !important;
}

/* ── Landing Page Suite: FeatureGrid ── */
.joy-feature-grid {
  display: grid;
  gap: 24px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}
.joy-feature-grid--cols-2 {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}
.joy-feature-grid--cols-3 {
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}
.joy-feature-grid--cols-4 {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
.joy-feature-card {
  position: relative;
  background-color: var(--joy-surface-card);
  border: 1px solid var(--joy-border-default);
  border-radius: var(--joy-radius-card);
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
}
.joy-feature-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--joy-elevation-2);
  border-color: var(--joy-accent-default);
}
.joy-feature-card__icon {
  width: 44px;
  height: 44px;
  border-radius: var(--joy-radius-control);
  background: var(--joy-accent-subtle);
  color: var(--joy-accent-default);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.joy-feature-card__badge {
  position: absolute;
  top: 16px;
  right: 16px;
}
.joy-feature-card__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--joy-text-primary);
  margin: 0 0 10px 0;
  line-height: 1.35;
}
.joy-feature-card__desc {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--joy-text-muted);
  margin: 0 0 16px 0;
  flex: 1;
}
.joy-feature-card__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--joy-accent-default);
  text-decoration: none;
  transition: gap 0.15s ease;
}
.joy-feature-card__link:hover {
  gap: 10px;
}

/* ── Landing Page Suite: LogoCloud ── */
.joy-logo-cloud {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
  text-align: center;
}
.joy-logo-cloud__title {
  font-size: 0.875rem;
  font-weight: 600;
  
  color: var(--joy-text-muted);
  margin: 0 0 28px 0;
}
.joy-logo-cloud__logos {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 36px 48px;
}
.joy-logo-cloud__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.65;
  transition: opacity 0.2s ease, transform 0.2s ease;
  filter: grayscale(100%);
  color: var(--joy-text-primary);
  text-decoration: none;
}
.joy-logo-cloud__item:hover {
  opacity: 1;
  filter: grayscale(0%);
  transform: scale(1.04);
}

/* ── Landing Page Suite: StatsSection ── */
.joy-stats-section {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
}
.joy-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}
.joy-stat-item {
  background-color: var(--joy-surface-card);
  border: 1px solid var(--joy-border-default);
  border-radius: var(--joy-radius-card);
  padding: 24px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.joy-stat-item__value {
  font-family: var(--joy-font-family-mono);
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--joy-accent-default);
  margin-bottom: 8px;
}
.joy-stat-item__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--joy-text-primary);
  margin-bottom: 4px;
}
.joy-stat-item__desc {
  font-size: 0.8125rem;
  color: var(--joy-text-muted);
  margin: 0;
}
.joy-stat-item__change {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-top: 8px;
  padding: 2px 8px;
  border-radius: 9999px;
}
.joy-stat-item__change--positive {
  background: var(--joy-status-success-bg);
  color: var(--joy-status-success-fg);
}
.joy-stat-item__change--negative {
  background: var(--joy-status-danger-bg);
  color: var(--joy-status-danger-fg);
}

/* ── Landing Page Suite: CTASection ── */
.joy-cta-section {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
}
.joy-cta-section__container {
  position: relative;
  background: var(--joy-surface-inverse);
  border: 1px solid var(--joy-border-default);
  border-radius: var(--joy-radius-overlay);
  padding: 64px 32px;
  box-shadow: var(--joy-elevation-3);
}
.joy-cta-section__title {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--joy-text-primary);
  margin: 0 0 16px 0;
  line-height: 1.2;
}
.joy-cta-section__desc {
  font-size: 1.125rem;
  color: var(--joy-text-secondary);
  max-width: 640px;
  margin: 0 auto 36px auto;
  line-height: 1.6;
}
.joy-cta-section__actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

/* ── Landing Page Suite: FAQSection ── */
.joy-faq-section {
  width: 100%;
  max-width: 840px;
  margin: 0 auto;
  padding: 48px 24px;
}
.joy-faq-section__header {
  text-align: center;
  margin-bottom: 36px;
}
.joy-faq-section__title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--joy-text-primary);
  margin: 0 0 12px 0;
}
.joy-faq-section__subtitle {
  font-size: 1rem;
  color: var(--joy-text-muted);
  margin: 0;
}
.joy-faq-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.joy-faq-item {
  border: 1px solid var(--joy-border-default);
  border-radius: var(--joy-radius-control);
  background-color: var(--joy-surface-card);
  overflow: hidden;
  transition: border-color 0.15s ease;
}
.joy-faq-item--open {
  border-color: var(--joy-accent-default);
}
.joy-faq-item__trigger {
  width: 100%;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--joy-text-primary);
  transition: color 0.15s ease;
}
.joy-faq-item__trigger:hover {
  color: var(--joy-accent-default);
}
.joy-faq-item__icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  color: var(--joy-accent-default);
}
.joy-faq-item--open .joy-faq-item__icon {
  transform: rotate(180deg);
}
.joy-faq-item__content {
  padding: 0 20px 20px 20px;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--joy-text-muted);
}

/* ── Landing Page Suite: SiteFooter ── */
.joy-site-footer {
  width: 100%;
  background-color: var(--joy-surface-card);
  border-top: 1px solid var(--joy-border-default);
  padding: 64px 24px 32px 24px;
}
.joy-site-footer__inner {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr repeat(auto-fit, minmax(160px, 1fr));
  gap: 48px 32px;
}
.joy-site-footer__brand-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--joy-text-primary);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}
.joy-site-footer__brand-desc {
  font-size: 0.875rem;
  color: var(--joy-text-muted);
  line-height: 1.6;
  max-width: 320px;
  margin: 0 0 20px 0;
}
.joy-site-footer__col-title {
  font-size: 0.875rem;
  font-weight: 700;
  
  color: var(--joy-text-primary);
  margin: 0 0 16px 0;
}
.joy-site-footer__links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.joy-site-footer__link {
  font-size: 0.875rem;
  color: var(--joy-text-muted);
  text-decoration: none;
  transition: color 0.15s ease;
}
.joy-site-footer__link:hover {
  color: var(--joy-accent-default);
}
.joy-site-footer__bottom {
  max-width: 1200px;
  margin: 48px auto 0 auto;
  padding-top: 24px;
  border-top: 1px solid var(--joy-border-default);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.8125rem;
  color: var(--joy-text-muted);
}
.joy-site-footer__socials {
  display: flex;
  align-items: center;
  gap: 16px;
}
.joy-site-footer__social-link {
  color: var(--joy-text-muted);
  transition: color 0.15s ease;
  display: inline-flex;
}
.joy-site-footer__social-link:hover {
  color: var(--joy-accent-default);
}

`;

const canonicalVars = [
  '  /* ── Canonical Brand Invariants ── */',
  '  --navy-500: #14253e;',
  '  --gold-400: #c49a3a;',
  '  --cream-100: #f8f3e8;',
  '  --ink-500: #1f1c13;',
].join('\n');

const legacyAliasesMap = {
  'color-brand-primary': { target: 'accent-default', cssVal: 'var(--joy-accent-default)' },
  'color-brand-primary-hover': { target: 'accent-hover', cssVal: 'var(--joy-accent-hover)' },
  'color-brand-secondary': { target: 'color-navy-500', cssVal: 'var(--joy-color-navy-500)' },
  'color-brand-accent': { target: 'accent-default', cssVal: 'var(--joy-accent-default)' },
  'color-brand-navy': { target: 'color-navy-500', cssVal: 'var(--joy-color-navy-500)' },
  'color-brand-gold': { target: 'color-gold-400', cssVal: 'var(--joy-color-gold-400)' },
  'color-brand-cream': { target: 'color-cream-100', cssVal: 'var(--joy-color-cream-100)' },
  'color-brand-ink': { target: 'color-ink-500', cssVal: 'var(--joy-color-ink-500)' },

  'color-surface-base': { target: 'surface-card', cssVal: 'var(--joy-surface-card)' },
  'color-surface-canvas': { target: 'surface-canvas', cssVal: 'var(--joy-surface-canvas)' },
  'color-surface-card': { target: 'surface-card', cssVal: 'var(--joy-surface-card)' },
  'color-surface-subtle': { target: 'surface-sunken', cssVal: 'var(--joy-surface-sunken)' },
  'color-surface-muted': { target: 'surface-sunken', cssVal: 'var(--joy-surface-sunken)' },
  'color-surface-elevated': { target: 'surface-raised', cssVal: 'var(--joy-surface-raised)' },
  'color-surface-dark-base': { target: 'color-navy-950', cssVal: 'var(--joy-color-navy-950)' },
  'color-surface-dark-card': { target: 'color-navy-900', cssVal: 'var(--joy-color-navy-900)' },
  'color-surface-dark-subtle': { target: 'color-navy-800', cssVal: 'var(--joy-color-navy-800)' },
  'surface-frosted': { target: null, cssVal: 'rgba(255, 255, 255, 0.82)' },
  'backdrop-blur': { target: null, cssVal: 'blur(12px)' },

  'color-border-base': { target: 'border-default', cssVal: 'var(--joy-border-default)' },
  'color-border-subtle': { target: 'border-subtle', cssVal: 'var(--joy-border-subtle)' },
  'color-border-default': { target: 'border-default', cssVal: 'var(--joy-border-default)' },
  'color-border-dark': { target: 'border-strong', cssVal: 'var(--joy-border-strong)' },
  'border': { target: 'border-default', cssVal: 'var(--joy-border-default)' },
  'border-hairline': { target: 'border-subtle', cssVal: 'var(--joy-border-subtle)' },

  'color-text-primary': { target: 'text-primary', cssVal: 'var(--joy-text-primary)' },
  'color-text-secondary': { target: 'text-secondary', cssVal: 'var(--joy-text-secondary)' },
  'color-text-muted': { target: 'text-muted', cssVal: 'var(--joy-text-muted)' },
  'color-text-inverse': { target: 'text-inverse', cssVal: 'var(--joy-text-inverse)' },

  'color-status-success': { target: 'status-success-fg', cssVal: 'var(--joy-status-success-fg)' },
  'color-status-warning': { target: 'status-warning-fg', cssVal: 'var(--joy-status-warning-fg)' },
  'color-status-danger': { target: 'status-danger-fg', cssVal: 'var(--joy-status-danger-fg)' },
  'color-status-info': { target: 'status-info-fg', cssVal: 'var(--joy-status-info-fg)' },

  'spacing-1': { target: 'space-1', cssVal: 'var(--joy-space-1)' },
  'spacing-2': { target: 'space-2', cssVal: 'var(--joy-space-2)' },
  'spacing-3': { target: 'space-3', cssVal: 'var(--joy-space-3)' },
  'spacing-4': { target: 'space-4', cssVal: 'var(--joy-space-4)' },
  'spacing-6': { target: 'space-6', cssVal: 'var(--joy-space-6)' },
  'spacing-8': { target: 'space-8', cssVal: 'var(--joy-space-8)' },

  'radius-sm': { target: null, cssVal: '4px' },
  'radius-md': { target: 'radius-control', cssVal: 'var(--joy-radius-control)' },
  'radius-lg': { target: 'radius-card', cssVal: 'var(--joy-radius-card)' },
  'radius-xl': { target: 'radius-overlay', cssVal: 'var(--joy-radius-overlay)' },
  'radius-full': { target: 'radius-pill', cssVal: 'var(--joy-radius-pill)' },

  'motion-duration-fast': { target: 'duration-fast', cssVal: 'var(--joy-duration-fast)' },
  'motion-duration-normal': { target: 'duration-normal', cssVal: 'var(--joy-duration-normal)' },
  'motion-duration-slow': { target: 'duration-slow', cssVal: 'var(--joy-duration-slow)' },
  'motion-easing-standard': { target: 'ease-in-out', cssVal: 'var(--joy-ease-in-out)' },
  'motion-easing-decelerate': { target: 'ease-out', cssVal: 'var(--joy-ease-out)' },
  'motion-easing-accelerate': { target: null, cssVal: 'cubic-bezier(0.4, 0.0, 1, 1)' },
  'motion-easing-spring': { target: null, cssVal: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' },

  'shadow-sm': { target: 'elevation-1', cssVal: 'var(--joy-elevation-1)' },
  'shadow-md': { target: 'elevation-2', cssVal: 'var(--joy-elevation-2)' },
  'shadow-lg': { target: 'elevation-3', cssVal: 'var(--joy-elevation-3)' },
  'shadow-overlay': { target: null, cssVal: '0 20px 25px -5px rgba(20, 37, 62, 0.15), 0 8px 10px -6px rgba(20, 37, 62, 0.1)' },

  'z-index-dropdown': { target: 'z-dropdown', cssVal: 'var(--joy-z-dropdown)' },
  'z-index-modal': { target: 'z-modal', cssVal: 'var(--joy-z-modal)' },
  'z-index-tooltip': { target: 'z-tooltip', cssVal: 'var(--joy-z-tooltip)' },

  'font-display-letter-spacing': { target: null, cssVal: '-0.02em' },
  'font-variant-numeric': { target: null, cssVal: 'tabular-nums' },
  'form-label-width': { target: null, cssVal: '120px' },
};

const legacyAliases = [
  '  /* ── Legacy Variable Compatibility Layer ── */',
  ...Object.entries(legacyAliasesMap).map(([k, cfg]) => `  --joy-${k}: ${cfg.cssVal};`)
].join('\n');

const darkLegacyRemap = [
  '  --joy-color-surface-canvas: var(--joy-surface-canvas);',
  '  --joy-color-surface-card: var(--joy-surface-card);',
  '  --joy-color-border-subtle: var(--joy-border-subtle);',
  '  --joy-color-border-default: var(--joy-border-default);',
  '  --joy-color-text-primary: var(--joy-text-primary);',
  '  --joy-color-text-secondary: var(--joy-text-secondary);',
  '  --joy-color-text-muted: var(--joy-text-muted);',
].join('\n');

const mediaReducedMotion = `
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto !important;
  }
  [class*="joy-"],
  [class*="joy-"]::before,
  [class*="joy-"]::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

const mediaCoarsePointer = `
@media (pointer: coarse) {
  :root {
    --joy-control-height-sm: 44px;
    --joy-control-height-md: 44px;
    --joy-control-height-lg: 48px;
  }
}
`;

const rootBlock = `:root {\n${primitiveVars.join('\n')}\n${lightVars.join('\n')}\n${canonicalVars}\n${legacyAliases}\n}\n`;
const darkBlock = `[data-theme="dark"] {\n${darkVars.join('\n')}\n${darkLegacyRemap}\n}\n`;
const mediaDarkBlock = `@media (prefers-color-scheme: dark) {\n  :root:not([data-theme="light"]) {\n${darkVars.join('\n')}\n${darkLegacyRemap}\n  }\n}\n`;

const themeCss = `${rootBlock}\n${darkBlock}\n${mediaDarkBlock}\n${mediaReducedMotion}\n${mediaCoarsePointer}\n\n${componentStyles}`;
fs.writeFileSync(path.join(outDir, 'theme.css'), themeCss);

// 2. tailwind-theme.css with semantic category mapping
const twEntries = [];

if (tokens.color) {
  for (const [rampName, rampObj] of Object.entries(tokens.color)) {
    for (const [step, token] of Object.entries(rampObj)) {
      twEntries.push(`  --color-joy-${rampName}-${step}: ${resolveRef(token.value, tokens)};`);
    }
  }
}
if (tokens.semantic && tokens.semantic.light) {
  const light = tokens.semantic.light;
  for (const [group, groupObj] of Object.entries(light)) {
    if (group !== 'elevation' && group !== 'focus-ring') {
      for (const [name, token] of Object.entries(groupObj)) {
        const key = group === 'status' ? `status-${name}` : `${group}-${name}`;
        twEntries.push(`  --color-joy-${key}: ${resolveRef(token.value, tokens)};`);
      }
    }
  }
}

if (tokens.space) {
  for (const [k, v] of Object.entries(tokens.space)) {
    twEntries.push(`  --spacing-joy-${k.replace('.', '-')}: ${v.value};`);
  }
}

if (tokens.radius) {
  for (const [k, v] of Object.entries(tokens.radius)) {
    twEntries.push(`  --radius-joy-${k}: ${v.value};`);
  }
}

if (tokens.font && tokens.font.family) {
  for (const [k, v] of Object.entries(tokens.font.family)) {
    twEntries.push(`  --font-joy-${k}: ${v.value};`);
  }
}

if (tokens['font-size']) {
  for (const [k, v] of Object.entries(tokens['font-size'])) {
    twEntries.push(`  --text-joy-${k}: ${v.value};`);
  }
}

if (tokens.semantic && tokens.semantic.light && tokens.semantic.light.elevation) {
  for (const [k, v] of Object.entries(tokens.semantic.light.elevation)) {
    twEntries.push(`  --shadow-joy-${k}: ${v.value};`);
  }
}

if (tokens.ease) {
  for (const [k, v] of Object.entries(tokens.ease)) {
    twEntries.push(`  --ease-joy-${k}: ${v.value};`);
  }
}

if (tokens.duration) {
  for (const [k, v] of Object.entries(tokens.duration)) {
    twEntries.push(`  --animate-joy-${k}: ${v.value};`);
  }
}

const twThemeCss = `@theme {\n${twEntries.join('\n')}\n}\n`;
fs.writeFileSync(path.join(outDir, 'tailwind-theme.css'), twThemeCss);

// 3. index.js (ESM) & index.cjs (CJS) & index.d.ts
// Populate legacy alias values in jsObj
for (const [k, cfg] of Object.entries(legacyAliasesMap)) {
  if (cfg.target && jsObj[cfg.target]) {
    jsObj[k] = jsObj[cfg.target];
  } else if (cfg.cssVal && !cfg.cssVal.startsWith('var(')) {
    jsObj[k] = cfg.cssVal;
  }
}

const jsContent = `export const tokens = ${JSON.stringify(jsObj, null, 2)};\nexport default tokens;\n`;
fs.writeFileSync(path.join(outDir, 'index.js'), jsContent);

const cjsContent = `exports.tokens = ${JSON.stringify(jsObj, null, 2)};\nexports.default = exports.tokens;\n`;
fs.writeFileSync(path.join(outDir, 'index.cjs'), cjsContent);

// Strongly typed token declaration
const standardKeys = Object.keys(jsObj).filter(k => !(k in legacyAliasesMap));
const standardDts = standardKeys.map(k => `  '${k}': string;`).join('\n');
const legacyDts = Object.entries(legacyAliasesMap).map(([k, cfg]) => {
  const depComment = cfg.target
    ? `  /**\n   * @deprecated Use '${cfg.target}' instead\n   */`
    : `  /**\n   * @deprecated Legacy alias token\n   */`;
  return `${depComment}\n  '${k}': string;`;
}).join('\n');

const dtsContent = `/**
 * Joymify Design Tokens
 */
export interface JoyTokens {
${standardDts}
${legacyDts}
}

export type JoyTokenName = keyof JoyTokens;

export declare const tokens: JoyTokens;
export default tokens;
`;
fs.writeFileSync(path.join(outDir, 'index.d.ts'), dtsContent);

console.log("Tokens compiled successfully to", outDir);
