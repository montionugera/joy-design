import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tokensPath = path.join(__dirname, 'src/tokens.json');
const outDir = path.join(__dirname, 'dist');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

function flattenTokens(obj, prefix = '') {
  let cssVars = [];
  let jsObj = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const newPrefix = prefix ? `${prefix}-${key}` : key;
    if (val && typeof val === 'object' && 'value' in val) {
      cssVars.push(`  --joy-${newPrefix}: ${val.value};`);
      jsObj[newPrefix] = val.value;
    } else if (val && typeof val === 'object') {
      const nested = flattenTokens(val, newPrefix);
      cssVars.push(...nested.cssVars);
      Object.assign(jsObj, nested.jsObj);
    }
  }
  return { cssVars, jsObj };
}

const { cssVars, jsObj } = flattenTokens(tokens);

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
  gap: var(--joy-spacing-2, 8px);
  font-family: var(--joy-font-family-sans, sans-serif);
  font-weight: 600;
  letter-spacing: -0.01em;
  border-radius: var(--joy-radius-md, 8px);
  cursor: pointer;
  transition: all var(--joy-motion-duration-fast, 150ms) var(--joy-motion-easing-standard, ease);
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
  box-shadow: 0 0 0 3px rgba(196, 154, 58, 0.35);
}
.joy-button--sm {
  padding: 6px 12px;
  font-size: 0.8125rem;
  border-radius: var(--joy-radius-sm, 6px);
}
.joy-button--md {
  padding: 8px 16px;
  font-size: 0.875rem;
  border-radius: var(--joy-radius-md, 8px);
}
.joy-button--lg {
  padding: 12px 24px;
  font-size: 1rem;
  border-radius: var(--joy-radius-lg, 10px);
}
.joy-button--solid {
  background: linear-gradient(180deg, #c49a3a 0%, #b3892f 100%);
  color: #14253e;
  border-color: rgba(179, 137, 47, 0.6);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
.joy-button--solid:hover:not(:disabled) {
  background: linear-gradient(180deg, #d4ab4b 0%, #c49a3a 100%);
  box-shadow: 0 2px 6px rgba(196, 154, 58, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
.joy-button--outline {
  background-color: #ffffff;
  border-color: #cbd5e1;
  color: #1e293b;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.joy-button--outline:hover:not(:disabled) {
  background-color: #f8fafc;
  border-color: #94a3b8;
  color: #0f172a;
}
.joy-button--ghost {
  background-color: transparent;
  color: var(--joy-color-text-primary, #334155);
}
.joy-button--ghost:hover:not(:disabled) {
  background-color: var(--joy-color-surface-muted, #f1f5f9);
  color: #0f172a;
}
.joy-button--danger {
  background: linear-gradient(180deg, #f43f5e 0%, #ef4444 100%);
  color: var(--joy-color-text-inverse, #ffffff);
  border-color: rgba(225, 29, 72, 0.6);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
.joy-button--danger:hover:not(:disabled) {
  background: linear-gradient(180deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
[data-theme="dark"] .joy-button--outline {
  background-color: #1e293b;
  border-color: #334155;
  color: #f8fafc;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
[data-theme="dark"] .joy-button--outline:hover:not(:disabled) {
  background-color: #334155;
  border-color: #475569;
  color: #ffffff;
}
[data-theme="dark"] .joy-button--ghost {
  color: #94a3b8;
}
[data-theme="dark"] .joy-button--ghost:hover:not(:disabled) {
  background-color: #1e293b;
  color: #f8fafc;
}
.joy-button--glass {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.25);
  color: var(--joy-text-primary, #f8f3e8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}
.joy-button--glass:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.45);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
  font-family: var(--joy-font-family-sans, sans-serif);
  font-weight: 600;
  border-radius: var(--joy-radius-full, 9999px);
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
  background: #ede9fe;
  color: var(--joy-color-brand-primary, #7c3aed);
}
.joy-badge--neutral {
  background: var(--joy-color-surface-muted, #f1f5f9);
  color: var(--joy-color-text-primary, #0f172a);
}
.joy-badge--success {
  background: #d1fae5;
  color: #065f46;
}
.joy-badge--warning {
  background: #fef3c7;
  color: #92400e;
}
.joy-badge--danger {
  background: #fee2e2;
  color: #991b1b;
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
  font-family: var(--joy-font-family-sans, sans-serif);
  padding: 8px 12px;
  font-size: 0.9375rem;
  border: 1px solid #cbd5e1;
  border-radius: var(--joy-radius-md, 8px);
  background: #ffffff;
  color: var(--joy-color-text-primary, #0f172a);
  outline: none;
  transition: all var(--joy-motion-duration-fast, 150ms);
}
.joy-input:focus {
  border-color: var(--joy-color-brand-primary, #7c3aed);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
}
.joy-input-wrapper--error .joy-input {
  border-color: var(--joy-color-status-danger, #ef4444);
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
  font-family: var(--joy-font-family-sans, sans-serif);
  font-size: 0.875rem;
  color: var(--joy-color-text-primary, #0f172a);
}
.joy-switch__thumb {
  position: relative;
  width: 42px;
  height: 24px;
  background: #cbd5e1;
  border-radius: 9999px;
  transition: background-color var(--joy-motion-duration-fast, 150ms) ease;
  display: inline-block;
}
.joy-switch__thumb::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #ffffff;
  border-radius: 50%;
  transition: transform var(--joy-motion-duration-fast, 150ms) cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.joy-switch--checked .joy-switch__thumb {
  background: var(--joy-color-brand-primary, #7c3aed);
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
  border-radius: var(--joy-radius-md, 8px);
  border-left: 4px solid transparent;
  font-family: var(--joy-font-family-sans, sans-serif);
  margin-bottom: 12px;
  animation: joy-fade-in var(--joy-motion-duration-fast, 150ms) ease-out;
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
  background: #eff6ff;
  border-left-color: #3b82f6;
  color: #1e3a8a;
}
.joy-alert--success {
  background: #ecfdf5;
  border-left-color: #10b981;
  color: #064e3b;
}
.joy-alert--warning {
  background: #fffbeb;
  border-left-color: #f59e0b;
  color: #78350f;
}
.joy-alert--danger {
  background: #fef2f2;
  border-left-color: #ef4444;
  color: #7f1d1d;
}

/* Metric Tile */
.joy-metric-tile {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: var(--joy-radius-md, 8px);
  padding: 16px 20px;
  box-shadow: var(--joy-shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
  transition: transform var(--joy-motion-duration-fast, 150ms) ease, box-shadow var(--joy-motion-duration-fast, 150ms) ease;
}
.joy-metric-tile:hover {
  transform: translateY(-2px);
  box-shadow: var(--joy-shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1));
}
.joy-metric-tile__title {
  font-size: 0.8125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--joy-color-text-muted, #64748b);
  margin-bottom: 6px;
}
.joy-metric-tile__value {
  font-size: 1.75rem;
  font-weight: 700;
  font-family: var(--joy-font-family-mono, monospace);
  color: var(--joy-color-text-primary, #0f172a);
}
.joy-metric-tile__change {
  font-size: 0.8125rem;
  font-weight: 600;
  margin-top: 4px;
}
.joy-metric-tile--up .joy-metric-tile__change {
  color: var(--joy-color-status-success, #10b981);
}
.joy-metric-tile--down .joy-metric-tile__change {
  color: var(--joy-color-status-danger, #ef4444);
}
.joy-metric-tile--neutral .joy-metric-tile__change {
  color: var(--joy-color-text-muted, #64748b);
}

/* Table */
.joy-table-container {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: var(--joy-radius-md, 8px);
  background: #ffffff;
  box-shadow: var(--joy-shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
  position: relative;
}
.joy-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--joy-font-family-sans, sans-serif);
  font-size: 0.875rem;
  text-align: left;
}
.joy-table thead {
  background: var(--joy-color-surface-subtle, #f8fafc);
  border-bottom: 1px solid #e2e8f0;
}
.joy-table th {
  padding: 10px 14px;
  font-weight: 600;
  color: var(--joy-color-text-primary, #0f172a);
}
.joy-table td {
  padding: 10px 14px;
  border-bottom: 1px solid #f1f5f9;
  color: var(--joy-color-text-primary, #0f172a);
  transition: background-color var(--joy-motion-duration-fast, 150ms);
}
.joy-table tr:last-child td {
  border-bottom: none;
}
.joy-table tr:hover td {
  background-color: #faf5ff;
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
    border: 1px solid var(--joy-color-border-subtle, #e2e8f0);
    border-radius: var(--joy-radius-md, 8px);
    background-color: var(--joy-color-surface-elevated, #ffffff);
    padding: 12px 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  .joy-table--responsive-stack td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px dashed var(--joy-color-border-subtle, #f1f5f9);
    text-align: right !important;
  }
  .joy-table--responsive-stack tr:last-child td {
    border-bottom: 1px dashed var(--joy-color-border-subtle, #f1f5f9);
  }
  .joy-table--responsive-stack td:last-child {
    border-bottom: none;
  }
  .joy-table--responsive-stack td::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--joy-color-text-muted, #64748b);
    text-align: left;
    padding-right: 12px;
    font-size: 0.8125rem;
  }
  [data-theme="dark"] .joy-table--responsive-stack tr {
    background-color: var(--joy-surface-card, #14253e);
    border-color: var(--joy-border, #23354e);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }
  [data-theme="dark"] .joy-table--responsive-stack td {
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }
  [data-theme="dark"] .joy-table--responsive-stack td::before {
    color: #94a3b8;
  }
}

/* ── Financial Ticker Flashing & Table Sorting ── */
@keyframes joy-ticker-flash-up {
  0% { background-color: rgba(16, 185, 129, 0.35); color: #065f46; }
  100% { background-color: transparent; }
}
@keyframes joy-ticker-flash-down {
  0% { background-color: rgba(239, 68, 68, 0.35); color: #991b1b; }
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
  transition: color var(--joy-motion-duration-fast, 150ms);
}
.joy-table-th--sortable:hover {
  color: var(--joy-color-brand-primary, #7c3aed);
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
  color: var(--joy-color-brand-primary, #7c3aed);
}

/* ── Pagination ── */
.joy-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--joy-font-family-sans, sans-serif);
  font-size: 0.875rem;
  padding: 12px 0;
  color: var(--joy-color-text-primary, #0f172a);
}
.joy-pagination__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: var(--joy-radius-md, 8px);
  border: 1px solid #cbd5e1;
  background: #ffffff;
  color: var(--joy-color-text-primary, #0f172a);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--joy-motion-duration-fast, 150ms) ease;
}
.joy-pagination__btn:hover:not(:disabled) {
  border-color: var(--joy-color-brand-primary, #7c3aed);
  color: var(--joy-color-brand-primary, #7c3aed);
}
.joy-pagination__btn--active {
  background: var(--joy-color-brand-primary, #7c3aed);
  border-color: var(--joy-color-brand-primary, #7c3aed);
  color: #ffffff;
}
.joy-pagination__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.joy-pagination__info {
  margin-left: auto;
  color: var(--joy-color-text-muted, #64748b);
  font-size: 0.8125rem;
}

/* ── Skeleton Loaders ── */
.joy-skeleton {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 37%, #f1f5f9 63%);
  background-size: 400% 100%;
  animation: joy-skeleton-shimmer 1.4s ease infinite;
  border-radius: var(--joy-radius-sm, 4px);
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
  border-radius: var(--joy-radius-md, 8px);
}
.joy-skeleton--circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}
[data-theme="dark"] .joy-skeleton {
  background: linear-gradient(90deg, #1e293b 25%, #334155 37%, #1e293b 63%);
  background-size: 400% 100%;
}
[data-theme="dark"] .joy-pagination__btn {
  background: #1e293b;
  border-color: #334155;
  color: #f8fafc;
}
[data-theme="dark"] .joy-pagination__btn--active {
  background: var(--joy-color-brand-primary, #7c3aed);
  border-color: var(--joy-color-brand-primary, #7c3aed);
  color: #ffffff;
}

/* ── Modal / Dialog ── */
.joy-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--joy-z-index-modal, 1050);
  animation: joy-fade-in var(--joy-motion-duration-fast, 150ms) ease-out;
  padding: 20px;
}
.joy-modal {
  background: #ffffff;
  border-radius: var(--joy-radius-lg, 12px);
  box-shadow: var(--joy-shadow-overlay, 0 20px 25px -5px rgba(0,0,0,0.15));
  width: 100%;
  max-width: 520px;
  overflow: hidden;
  animation: joy-modal-pop var(--joy-motion-duration-normal, 250ms) cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.joy-modal__header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.joy-modal__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--joy-color-text-primary, #0f172a);
}
.joy-modal__close {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--joy-color-text-muted, #64748b);
  transition: color var(--joy-motion-duration-fast, 150ms);
}
.joy-modal__close:hover {
  color: var(--joy-color-text-primary, #0f172a);
}
.joy-modal__body {
  padding: 24px;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: var(--joy-color-text-primary, #0f172a);
}
.joy-modal__footer {
  padding: 16px 24px;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
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
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: var(--joy-radius-md, 8px);
  box-shadow: var(--joy-shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1));
  min-width: 180px;
  z-index: var(--joy-z-index-dropdown, 1000);
  overflow: hidden;
  animation: joy-fade-in var(--joy-motion-duration-fast, 150ms) ease-out;
}
.joy-dropdown__item {
  display: block;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  background: transparent;
  border: none;
  font-family: var(--joy-font-family-sans, sans-serif);
  font-size: 0.875rem;
  color: var(--joy-color-text-primary, #0f172a);
  cursor: pointer;
  transition: background-color var(--joy-motion-duration-fast, 150ms);
}
.joy-dropdown__item:hover {
  background-color: #f5f3ff;
  color: var(--joy-color-brand-primary, #7c3aed);
}

/* ── Tabs ── */
.joy-tabs {
  display: flex;
  border-bottom: 2px solid #e2e8f0;
  gap: 8px;
  margin-bottom: 20px;
}
.joy-tab-btn {
  background: transparent;
  border: none;
  padding: 10px 18px;
  font-family: var(--joy-font-family-sans, sans-serif);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--joy-color-text-muted, #64748b);
  cursor: pointer;
  position: relative;
  transition: color var(--joy-motion-duration-fast, 150ms);
}
.joy-tab-btn:hover {
  color: var(--joy-color-brand-primary, #7c3aed);
}
.joy-tab-btn--active {
  color: var(--joy-color-brand-primary, #7c3aed);
}
.joy-tab-btn--active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--joy-color-brand-primary, #7c3aed);
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
  background: var(--joy-color-surface-dark-base, #0f172a);
  color: var(--joy-color-text-inverse, #ffffff);
  padding: 6px 10px;
  border-radius: var(--joy-radius-sm, 4px);
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  z-index: var(--joy-z-index-tooltip, 1100);
  box-shadow: var(--joy-shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1));
  animation: joy-fade-in var(--joy-motion-duration-fast, 150ms) ease-out;
}
.joy-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 4px;
  border-style: solid;
  border-color: var(--joy-color-surface-dark-base, #0f172a) transparent transparent transparent;
}

/* ── Dark Mode Token Overrides ── */
[data-theme="dark"] {
  --joy-color-surface-base: #0d1829;
  --joy-color-surface-canvas: #0d1829;
  --joy-color-surface-card: #14253e;
  --joy-surface-canvas: #0d1829;
  --joy-surface-card: #14253e;
  --joy-border: #23354e;
  --joy-text-primary: #f8f3e8;
  --joy-color-surface-subtle: #14253e;
  --joy-color-surface-muted: #1e3352;
  --joy-color-text-primary: #f8f3e8;
  --joy-color-text-muted: #94a3b8;
  --joy-color-border-subtle: #23354e;
  --joy-color-border-default: #2d4566;
  --joy-color-brand-primary: #c49a3a;
  --joy-color-brand-primary-hover: #d4ab4b;
  background-color: var(--joy-surface-canvas, #0d1829);
  color: var(--joy-text-primary, #f8f3e8);
}
[data-theme="dark"] .joy-metric-tile,
[data-theme="dark"] .joy-table-container,
[data-theme="dark"] .joy-modal,
[data-theme="dark"] .joy-dropdown,
[data-theme="dark"] .joy-drawer,
[data-theme="dark"] .joy-toast,
[data-theme="dark"] .joy-input,
[data-theme="dark"] .joy-select {
  background-color: var(--joy-surface-card, #14253e);
  border-color: var(--joy-border, #23354e);
  color: var(--joy-text-primary, #f8f3e8);
}
[data-theme="dark"] .joy-modal__footer,
[data-theme="dark"] .joy-drawer__footer,
[data-theme="dark"] .joy-table thead {
  background-color: #0f172a;
  border-color: #334155;
}
[data-theme="dark"] .joy-table td {
  border-color: #334155;
  color: #f8fafc;
}
[data-theme="dark"] .joy-table tr:hover td {
  background-color: #334155;
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
  font-family: var(--joy-font-family-sans, sans-serif);
  padding: 8px 36px 8px 12px;
  font-size: 0.9375rem;
  border: 1px solid #cbd5e1;
  border-radius: var(--joy-radius-md, 8px);
  background-color: #ffffff;
  color: var(--joy-color-text-primary, #0f172a);
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color var(--joy-motion-duration-fast, 150ms), box-shadow var(--joy-motion-duration-fast, 150ms);
}
.joy-select:focus {
  border-color: var(--joy-color-brand-primary, #7c3aed);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
}
.joy-select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background-color: var(--joy-color-surface-muted, #f1f5f9);
}

/* ── Checkbox ── */
.joy-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-family: var(--joy-font-family-sans, sans-serif);
  font-size: 0.9375rem;
  color: var(--joy-color-text-primary, #0f172a);
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
  border: 1.5px solid #94a3b8;
  border-radius: var(--joy-radius-sm, 4px);
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--joy-motion-duration-fast, 150ms) ease;
  flex-shrink: 0;
}
.joy-checkbox input[type="checkbox"]:focus-visible + .joy-checkbox__box {
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.25);
}
.joy-checkbox input[type="checkbox"]:checked + .joy-checkbox__box {
  background: var(--joy-color-brand-primary, #7c3aed);
  border-color: var(--joy-color-brand-primary, #7c3aed);
}
.joy-checkbox input[type="checkbox"]:checked + .joy-checkbox__box::after {
  content: '';
  width: 5px;
  height: 9px;
  border: solid #ffffff;
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
  font-family: var(--joy-font-family-sans, sans-serif);
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
  color: var(--joy-color-text-primary, #0f172a);
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
  border: 1.5px solid #94a3b8;
  border-radius: 50%;
  background: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all var(--joy-motion-duration-fast, 150ms) ease;
  flex-shrink: 0;
}
.joy-radio input[type="radio"]:focus-visible + .joy-radio__circle {
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.25);
}
.joy-radio input[type="radio"]:checked + .joy-radio__circle {
  border-color: var(--joy-color-brand-primary, #7c3aed);
}
.joy-radio input[type="radio"]:checked + .joy-radio__circle::after {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--joy-color-brand-primary, #7c3aed);
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
  background-color: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(2px);
  z-index: var(--joy-z-index-modal, 1050);
  display: flex;
  justify-content: flex-end;
  animation: joy-fade-in var(--joy-motion-duration-fast, 150ms) ease-out;
}
.joy-drawer {
  background: #ffffff;
  width: 100%;
  max-width: 400px;
  height: 100%;
  box-shadow: var(--joy-shadow-overlay, 0 20px 25px -5px rgba(0,0,0,0.15));
  display: flex;
  flex-direction: column;
  animation: joy-drawer-slide-right var(--joy-motion-duration-normal, 250ms) cubic-bezier(0.16, 1, 0.3, 1);
}
.joy-drawer--left {
  animation-name: joy-drawer-slide-left;
}
.joy-drawer__header {
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.joy-drawer__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--joy-color-text-primary, #0f172a);
}
.joy-drawer__close {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: var(--joy-color-text-muted, #64748b);
}
.joy-drawer__body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  color: var(--joy-color-text-primary, #0f172a);
}
.joy-drawer__footer {
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
  background: #f8fafc;
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
  border-radius: var(--joy-radius-md, 8px);
  background: #ffffff;
  color: var(--joy-color-text-primary, #0f172a);
  box-shadow: var(--joy-shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1));
  border: 1px solid #e2e8f0;
  animation: joy-toast-slide-in var(--joy-motion-duration-normal, 250ms) cubic-bezier(0.16, 1, 0.3, 1);
  font-family: var(--joy-font-family-sans, sans-serif);
  font-size: 0.875rem;
}
.joy-toast--info {
  border-left: 4px solid var(--joy-color-status-info, #3b82f6);
}
.joy-toast--success {
  border-left: 4px solid var(--joy-color-status-success, #10b981);
}
.joy-toast--warning {
  border-left: 4px solid var(--joy-color-status-warning, #f59e0b);
}
.joy-toast--danger {
  border-left: 4px solid var(--joy-color-status-danger, #ef4444);
}

/* ── WCAG 2.2 AA Focus Indicators ── */
:focus-visible {
  outline: 2px solid var(--joy-color-brand-primary, #7c3aed);
  outline-offset: 2px;
}

/* ── Props Documentation Specification Tables ── */
.joy-props-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  font-family: var(--joy-font-family-sans, sans-serif);
  font-size: 0.8125rem;
  border-radius: var(--joy-radius-md, 8px);
  overflow: hidden;
  border: 1px solid #e2e8f0;
}
.joy-props-table th {
  background: var(--joy-color-surface-subtle, #f8fafc);
  padding: 8px 12px;
  font-weight: 600;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  color: var(--joy-color-text-muted, #64748b);
}
.joy-props-table td {
  padding: 8px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: var(--joy-color-text-primary, #0f172a);
}
.joy-props-table tr:last-child td {
  border-bottom: none;
}
.joy-prop-name {
  font-family: var(--joy-font-family-mono, monospace);
  color: var(--joy-color-brand-primary, #7c3aed);
  font-weight: 600;
}
.joy-prop-type {
  font-family: var(--joy-font-family-mono, monospace);
  color: #0284c7;
  font-size: 0.75rem;
}
.joy-prop-default {
  font-family: var(--joy-font-family-mono, monospace);
  color: #64748b;
  font-size: 0.75rem;
}
[data-theme="dark"] .joy-props-table {
  border-color: #334155;
}
[data-theme="dark"] .joy-props-table th {
  background: #0f172a;
  border-color: #334155;
  color: #94a3b8;
}
[data-theme="dark"] .joy-props-table td {
  border-color: #334155;
  color: #f8fafc;
}

/* ── OpenDesign Posture Integration (Linear / Datadog Spec) ── */
:root {
  --joy-font-display-letter-spacing: -0.02em;
  --joy-font-variant-numeric: tabular-nums;
  --joy-border-hairline: 1px solid rgba(226, 232, 240, 0.8);
  --joy-surface-frosted: rgba(255, 255, 255, 0.82);
  --joy-backdrop-blur: blur(12px);
}
[data-theme="dark"] {
  --joy-border-hairline: 1px solid rgba(51, 65, 85, 0.6);
  --joy-surface-frosted: rgba(15, 23, 42, 0.82);
}

h1, h2, h3, .joy-display {
  letter-spacing: var(--joy-font-display-letter-spacing, -0.02em);
}

/* ── Enterprise Parity Components (Wave 3) ── */
.joy-date-picker {
  display: inline-flex;
  align-items: center;
  position: relative;
  gap: 8px;
  padding: 8px 12px;
  background: var(--joy-color-surface-base, #ffffff);
  border: 1px solid #cbd5e1;
  border-radius: var(--joy-radius-md, 8px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: all var(--joy-motion-duration-fast, 150ms) ease;
  cursor: pointer;
}
[data-theme="dark"] .joy-date-picker {
  background: var(--joy-color-surface-dark-subtle, #1e293b);
  border-color: #334155;
}
.joy-date-picker:focus-within {
  border-color: var(--joy-color-brand-primary, #7c3aed);
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
}
.joy-date-picker--error {
  border-color: var(--joy-color-status-danger, #ef4444) !important;
}
.joy-date-picker--error:focus-within {
  box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
}
.joy-date-picker--disabled {
  background: var(--joy-color-surface-muted, #f1f5f9);
  cursor: not-allowed;
  opacity: 0.6;
}
.joy-date-picker__input {
  appearance: none;
  flex: 1 1 auto;
  min-width: 0;
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--joy-color-text-primary, #0f172a);
  background: transparent;
  border: 0;
  padding: 0;
  outline: none;
  cursor: inherit;
}
[data-theme="dark"] .joy-date-picker__input {
  color: var(--joy-color-text-inverse, #f8fafc);
}
.joy-date-picker__icon {
  flex: 0 0 auto;
  color: var(--joy-color-text-muted, #64748b);
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
  color: var(--joy-color-text-muted, #64748b);
  font-size: 0.875rem;
  flex: 0 0 auto;
}
.joy-date-range-picker--disabled .joy-date-range-picker__sep {
  color: #94a3b8;
}

/* Breadcrumb */
.joy-breadcrumb {
  font-family: inherit;
  font-size: 0.875rem;
  color: var(--joy-color-text-muted, #64748b);
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
  color: var(--joy-color-text-muted, #64748b);
  text-decoration: none;
  transition: color var(--joy-motion-duration-fast, 150ms) ease;
}
.joy-breadcrumb__link:hover {
  color: var(--joy-color-brand-primary, #7c3aed);
  text-decoration: underline;
}
[data-theme="dark"] .joy-breadcrumb__link:hover {
  color: #c084fc;
}
.joy-breadcrumb__current {
  color: var(--joy-color-text-primary, #0f172a);
  font-weight: 500;
}
[data-theme="dark"] .joy-breadcrumb__current {
  color: #f8fafc;
}
.joy-breadcrumb__sep {
  color: #cbd5e1;
}
[data-theme="dark"] .joy-breadcrumb__sep {
  color: #475569;
}

/* Empty State */
.joy-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 48px 24px;
  background: var(--joy-color-surface-base, #ffffff);
  border: 1px dashed #cbd5e1;
  border-radius: var(--joy-radius-lg, 12px);
  max-width: 480px;
  margin: 0 auto;
}
[data-theme="dark"] .joy-empty-state {
  background: var(--joy-color-surface-dark-subtle, #1e293b);
  border-color: #334155;
}
.joy-empty-state__icon {
  display: inline-flex;
  color: var(--joy-color-text-muted, #64748b);
  margin-bottom: 4px;
}
.joy-empty-state__title {
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--joy-color-text-primary, #0f172a);
  margin: 0;
}
[data-theme="dark"] .joy-empty-state__title {
  color: #f8fafc;
}
.joy-empty-state__desc {
  font-size: 0.875rem;
  color: var(--joy-color-text-muted, #64748b);
  line-height: 1.5;
  margin: 0;
  max-width: 40ch;
}
.joy-empty-state__action {
  margin-top: 8px;
}

/* Stat Card */
.joy-stat-card {
  background: var(--joy-color-surface-base, #ffffff);
  border: 1px solid #cbd5e1;
  border-radius: var(--joy-radius-lg, 12px);
  padding: 20px;
  font-family: inherit;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
[data-theme="dark"] .joy-stat-card {
  background: var(--joy-color-surface-dark-subtle, #1e293b);
  border-color: #334155;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.joy-stat-card__label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--joy-color-text-muted, #64748b);
}
.joy-stat-card__value {
  font-weight: 600;
  font-size: 2rem;
  line-height: 1.1;
  margin-top: 8px;
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
  color: var(--joy-color-text-primary, #0f172a);
}
[data-theme="dark"] .joy-stat-card__value {
  color: #f8fafc;
}
.joy-stat-card__delta {
  font-size: 0.8125rem;
  margin-top: 6px;
  font-weight: 500;
}
.joy-stat-card__delta--positive {
  color: var(--joy-color-status-success, #10b981);
}
.joy-stat-card__delta--critical {
  color: var(--joy-color-status-danger, #ef4444);
}
.joy-stat-card__delta--info {
  color: var(--joy-color-status-info, #3b82f6);
}
.joy-stat-card__delta--neutral {
  color: var(--joy-color-text-muted, #64748b);
}

/* Progress */
.joy-progress {
  display: flex;
  align-items: center;
  width: 100%;
  font-size: 0.875rem;
  color: var(--joy-color-text-primary, #0f172a);
}
[data-theme="dark"] .joy-progress {
  color: #f8fafc;
}
.joy-progress__outer {
  flex: 1;
  margin-right: 8px;
}
.joy-progress__inner {
  background-color: var(--joy-color-surface-muted, #f1f5f9);
  border-radius: 100px;
  overflow: hidden;
}
[data-theme="dark"] .joy-progress__inner {
  background-color: #334155;
}
.joy-progress__bg {
  border-radius: 100px;
  transition: all 0.3s cubic-bezier(0.08, 0.82, 0.17, 1);
  background-color: var(--joy-color-brand-primary, #7c3aed);
  position: relative;
}
[data-theme="dark"] .joy-progress__bg {
  background-color: #a855f7;
}
.joy-progress--status-success .joy-progress__bg {
  background-color: var(--joy-color-status-success, #10b981) !important;
}
.joy-progress--status-success .joy-progress__text {
  color: var(--joy-color-status-success, #10b981);
}
.joy-progress--status-exception .joy-progress__bg {
  background-color: var(--joy-color-status-danger, #ef4444) !important;
}
.joy-progress--status-exception .joy-progress__text {
  color: var(--joy-color-status-danger, #ef4444);
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
    box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.4);
    opacity: 0.8;
  }
  100% {
    box-shadow: 0 0 0 6px rgba(124, 58, 237, 0);
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
  font-family: var(--joy-font-family-sans, sans-serif);
}
.joy-upload-dragger {
  position: relative;
  width: 100%;
  padding: 24px 16px;
  background-color: var(--joy-color-surface-elevated, #ffffff);
  border: 1px dashed var(--joy-color-border-subtle, #cbd5e1);
  border-radius: var(--joy-radius-md, 8px);
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s cubic-bezier(0.08, 0.82, 0.17, 1), background-color 0.2s;
  user-select: none;
}
.joy-upload-dragger:hover, .joy-upload-dragger--dragover {
  border-color: var(--joy-color-brand-primary, #7c3aed);
  background-color: rgba(124, 58, 237, 0.03);
}
[data-theme="dark"] .joy-upload-dragger {
  background-color: #1e293b;
  border-color: #334155;
}
[data-theme="dark"] .joy-upload-dragger:hover, [data-theme="dark"] .joy-upload-dragger--dragover {
  border-color: #a855f7;
  background-color: rgba(168, 85, 247, 0.08);
}
.joy-upload-dragger__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.08);
  color: var(--joy-color-brand-primary, #7c3aed);
  margin-bottom: 12px;
}
[data-theme="dark"] .joy-upload-dragger__icon {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}
.joy-upload-dragger__text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--joy-color-text-primary, #0f172a);
  margin-bottom: 4px;
}
[data-theme="dark"] .joy-upload-dragger__text {
  color: #f8fafc;
}
.joy-upload-dragger__hint {
  font-size: 0.75rem;
  color: var(--joy-color-text-muted, #64748b);
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
  background-color: var(--joy-color-surface-muted, #f8fafc);
  border: 1px solid var(--joy-color-border-subtle, #e2e8f0);
  border-radius: var(--joy-radius-sm, 6px);
  font-size: 0.8125rem;
  transition: background-color 0.15s;
}
[data-theme="dark"] .joy-upload-list__item {
  background-color: #1e293b;
  border-color: #334155;
  color: #f8fafc;
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
  color: var(--joy-color-text-muted, #64748b);
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 0.15s, background-color 0.15s;
}
.joy-upload-list__item-remove:hover {
  color: var(--joy-color-status-danger, #ef4444);
  background-color: rgba(239, 68, 68, 0.1);
}

/* Avatar & AvatarGroup */
.joy-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--joy-font-family-sans, sans-serif);
  font-weight: 600;
  color: #ffffff;
  background-color: var(--joy-color-brand-primary, #7c3aed);
  user-select: none;
  overflow: visible;
}
.joy-avatar--circle {
  border-radius: 50%;
}
.joy-avatar--square {
  border-radius: var(--joy-radius-md, 8px);
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
  border: 2px solid #ffffff;
}
[data-theme="dark"] .joy-avatar__badge {
  border-color: #0f172a;
}
.joy-avatar__badge--online {
  background-color: var(--joy-color-status-success, #10b981);
}
.joy-avatar__badge--offline {
  background-color: var(--joy-color-text-muted, #94a3b8);
}
.joy-avatar-group {
  display: inline-flex;
  align-items: center;
}
.joy-avatar-group .joy-avatar {
  margin-right: -8px;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
[data-theme="dark"] .joy-avatar-group .joy-avatar {
  border-color: #0f172a;
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
  background-color: var(--joy-color-surface-muted, #e2e8f0);
  border-radius: 3px;
  transition: background-color 0.2s;
}
[data-theme="dark"] .joy-slider__rail {
  background-color: #334155;
}
.joy-slider__track {
  position: absolute;
  height: 6px;
  background: linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%);
  border-radius: 3px;
  transition: background-color 0.2s;
}
[data-theme="dark"] .joy-slider__track {
  background: linear-gradient(90deg, #a855f7 0%, #c084fc 100%);
}
.joy-slider__handle {
  position: absolute;
  width: 18px;
  height: 18px;
  margin-left: -9px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #ffffff;
  border: 2px solid var(--joy-color-brand-primary, #7c3aed);
  border-radius: 50%;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  cursor: grab;
  transition: transform 0.15s cubic-bezier(0.08, 0.82, 0.17, 1), box-shadow 0.15s;
}
.joy-slider__handle:hover, .joy-slider__handle:focus-visible {
  transform: translateY(-50%) scale(1.2);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.25);
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
  background-color: #1e293b;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

/* MarkdownViewer (Cherry Markdown Inspired) */
.joy-markdown {
  font-family: var(--joy-font-family-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
  line-height: 1.68;
  color: var(--joy-color-text-primary, #1e293b);
  font-size: 0.9375rem;
  word-break: break-word;
}
[data-theme="dark"] .joy-markdown {
  color: #f1f5f9;
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
  background-color: #0f172a;
  color: #e2e8f0;
  padding: 16px;
  border-radius: var(--joy-radius-md, 8px);
  overflow-x: auto;
  font-family: var(--joy-font-family-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace);
  font-size: 0.84rem;
  line-height: 1.55;
  margin: 1em 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.joy-markdown code {
  font-family: var(--joy-font-family-mono, ui-monospace, monospace);
  font-size: 0.875em;
  background-color: rgba(124, 58, 237, 0.08);
  color: var(--joy-color-brand-primary, #7c3aed);
  padding: 2px 6px;
  border-radius: 4px;
}
[data-theme="dark"] .joy-markdown code {
  background-color: rgba(168, 85, 247, 0.15);
  color: #c084fc;
}
.joy-markdown pre code {
  background-color: transparent !important;
  color: inherit !important;
  padding: 0;
}
.joy-markdown blockquote {
  border-left: 4px solid var(--joy-color-brand-primary, #7c3aed);
  margin: 1em 0;
  padding: 8px 16px;
  background-color: rgba(124, 58, 237, 0.04);
  border-radius: 0 6px 6px 0;
  color: var(--joy-color-text-secondary, #475569);
}
[data-theme="dark"] .joy-markdown blockquote {
  background-color: rgba(168, 85, 247, 0.06);
  color: #94a3b8;
}
.joy-markdown table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.2em 0;
  font-size: 0.875rem;
}
.joy-markdown th, .joy-markdown td {
  border: 1px solid var(--joy-color-border-subtle, #e2e8f0);
  padding: 8px 12px;
  text-align: left;
}
[data-theme="dark"] .joy-markdown th, [data-theme="dark"] .joy-markdown td {
  border-color: #334155;
}
.joy-markdown th {
  background-color: var(--joy-color-surface-muted, #f8fafc);
  font-weight: 600;
}
[data-theme="dark"] .joy-markdown th {
  background-color: #1e293b;
}
.joy-markdown .joy-markdown__copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}
.joy-markdown .joy-markdown__copy-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
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
  border-radius: var(--joy-radius-lg, 12px);
  background-color: var(--joy-color-surface-elevated, #ffffff);
  border: 1px solid var(--joy-color-border-subtle, #e2e8f0);
  padding: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.25s cubic-bezier(0.08, 0.82, 0.17, 1), box-shadow 0.25s, border-color 0.25s;
}
.joy-bento-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  border-color: rgba(124, 58, 237, 0.4);
}
[data-theme="dark"] .joy-bento-card {
  background-color: #1e293b;
  border-color: #334155;
}
[data-theme="dark"] .joy-bento-card:hover {
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  border-color: rgba(168, 85, 247, 0.4);
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
  color: var(--joy-color-brand-primary, #7c3aed);
  margin-bottom: 12px;
}
.joy-bento-card__title {
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--joy-color-text-primary, #0f172a);
  margin: 0 0 8px 0;
}
[data-theme="dark"] .joy-bento-card__title {
  color: #f8fafc;
}
.joy-bento-card__desc {
  font-size: 0.875rem;
  color: var(--joy-color-text-muted, #64748b);
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
  background-color: rgba(196, 154, 58, 0.12);
  border: 1px solid rgba(196, 154, 58, 0.35);
  color: #c49a3a;
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 24px;
}
.joy-hero__title {
  font-size: 2.75rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: var(--joy-color-text-primary, #0f172a);
  margin: 0 0 20px 0;
}
[data-theme="dark"] .joy-hero__title {
  color: #f8fafc;
}
.joy-hero__title-gradient {
  background: linear-gradient(135deg, #7c3aed 0%, #c49a3a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.joy-hero__subtitle {
  font-size: 1.125rem;
  color: var(--joy-color-text-muted, #64748b);
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
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.28);
  color: #f8f3e8;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.joy-hero .joy-button--outline:hover:not(:disabled),
.kinetic-overlay .joy-button--outline:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.5);
  color: #ffffff;
}
.joy-hero__preview {
  position: relative;
  border-radius: var(--joy-radius-xl, 16px);
  border: 1px solid var(--joy-color-border-subtle, #e2e8f0);
  background-color: var(--joy-color-surface-elevated, #ffffff);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  padding: 16px;
  overflow: hidden;
}
[data-theme="dark"] .joy-hero__preview {
  background-color: #1e293b;
  border-color: #334155;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
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
  border-radius: var(--joy-radius-lg, 12px);
  background-color: var(--joy-color-surface-elevated, #ffffff);
  border: 1px solid var(--joy-color-border-subtle, #e2e8f0);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  transition: all 0.25s cubic-bezier(0.08, 0.82, 0.17, 1);
}
[data-theme="dark"] .joy-pricing-card {
  background-color: #1e293b;
  border-color: #334155;
}
.joy-pricing-card--featured {
  border-color: var(--joy-color-brand-primary, #7c3aed);
  box-shadow: 0 12px 30px rgba(124, 58, 237, 0.15);
  transform: scale(1.02);
}
.joy-pricing-card__badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 12px;
  border-radius: 9999px;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.joy-pricing-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--joy-color-text-primary, #0f172a);
}
[data-theme="dark"] .joy-pricing-card__title {
  color: #f8fafc;
}
.joy-pricing-card__desc {
  font-size: 0.875rem;
  color: var(--joy-color-text-muted, #64748b);
  margin: 0 0 20px 0;
}
.joy-pricing-card__price {
  font-size: 2.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--joy-color-text-primary, #0f172a);
  margin-bottom: 24px;
  display: flex;
  align-items: baseline;
  gap: 4px;
}
[data-theme="dark"] .joy-pricing-card__price {
  color: #f8fafc;
}
.joy-pricing-card__period {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--joy-color-text-muted, #64748b);
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
  color: var(--joy-color-text-secondary, #334155);
}
[data-theme="dark"] .joy-pricing-card__feature {
  color: #cbd5e1;
}

/* Testimonial Card */
.joy-testimonial-card {
  border-radius: var(--joy-radius-lg, 12px);
  background-color: var(--joy-color-surface-elevated, #ffffff);
  border: 1px solid var(--joy-color-border-subtle, #e2e8f0);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
[data-theme="dark"] .joy-testimonial-card {
  background-color: #1e293b;
  border-color: #334155;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}
.joy-testimonial-card__stars {
  display: flex;
  gap: 4px;
  color: #eab308;
}
.joy-testimonial-card__quote {
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--joy-color-text-primary, #0f172a);
  font-style: italic;
  margin: 0;
}
[data-theme="dark"] .joy-testimonial-card__quote {
  color: #f1f5f9;
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
  color: var(--joy-color-text-primary, #0f172a);
}
[data-theme="dark"] .joy-testimonial-card__author-info h6 {
  color: #f8fafc;
}
.joy-testimonial-card__author-info p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--joy-color-text-muted, #64748b);
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
  background-color: var(--joy-color-border-subtle, #e2e8f0);
}
[data-theme="dark"] .joy-steps--horizontal .joy-steps__item:not(:last-child)::after {
  background-color: #334155;
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
  background-color: var(--joy-color-surface-muted, #f1f5f9);
  color: var(--joy-color-text-muted, #64748b);
  border: 1px solid var(--joy-color-border-subtle, #cbd5e1);
  flex-shrink: 0;
  z-index: 1;
  transition: all 0.2s;
}
[data-theme="dark"] .joy-steps__icon {
  background-color: #1e293b;
  border-color: #334155;
}
.joy-steps__item--process .joy-steps__icon {
  background-color: var(--joy-color-brand-primary, #7c3aed);
  color: #ffffff;
  border-color: var(--joy-color-brand-primary, #7c3aed);
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.2);
}
.joy-steps__item--finish .joy-steps__icon {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--joy-color-status-success, #10b981);
  border-color: var(--joy-color-status-success, #10b981);
}
.joy-steps__item--error .joy-steps__icon {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--joy-color-status-danger, #ef4444);
  border-color: var(--joy-color-status-danger, #ef4444);
}
.joy-steps__content {
  display: flex;
  flex-direction: column;
}
.joy-steps__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--joy-color-text-primary, #0f172a);
}
[data-theme="dark"] .joy-steps__title {
  color: #f8fafc;
}
.joy-steps__desc {
  font-size: 0.75rem;
  color: var(--joy-color-text-muted, #64748b);
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
  background-color: var(--joy-color-border-subtle, #e2e8f0);
}
[data-theme="dark"] .joy-timeline__item:not(:last-child)::before {
  background-color: #334155;
}
.joy-timeline__dot {
  position: absolute;
  left: 0;
  top: 4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #ffffff;
  border: 2px solid var(--joy-color-brand-primary, #7c3aed);
}
[data-theme="dark"] .joy-timeline__dot {
  background-color: #0f172a;
}
.joy-timeline__dot--success { border-color: var(--joy-color-status-success, #10b981); }
.joy-timeline__dot--warning { border-color: #f59e0b; }
.joy-timeline__dot--danger { border-color: var(--joy-color-status-danger, #ef4444); }
.joy-timeline__dot--info { border-color: #3b82f6; }
.joy-timeline__content {
  font-size: 0.875rem;
  color: var(--joy-color-text-primary, #0f172a);
}
[data-theme="dark"] .joy-timeline__content {
  color: #f1f5f9;
}
.joy-timeline__time {
  font-size: 0.75rem;
  color: var(--joy-color-text-muted, #64748b);
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
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--joy-color-status-success, #10b981);
}
.joy-result--error .joy-result__icon {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--joy-color-status-danger, #ef4444);
}
.joy-result--warning .joy-result__icon {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}
.joy-result--info .joy-result__icon {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}
.joy-result--404 .joy-result__icon, .joy-result--403 .joy-result__icon {
  background-color: rgba(124, 58, 237, 0.1);
  color: var(--joy-color-brand-primary, #7c3aed);
}
.joy-result__title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: var(--joy-color-text-primary, #0f172a);
}
[data-theme="dark"] .joy-result__title {
  color: #f8fafc;
}
.joy-result__subtitle {
  font-size: 0.9375rem;
  color: var(--joy-color-text-muted, #64748b);
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
  font-family: var(--joy-font-family-mono, monospace);
  user-select: none;
  overflow: hidden;
  background-color: var(--joy-color-surface-elevated, #ffffff);
  border: 1px solid var(--joy-color-border-subtle, #e2e8f0);
  border-radius: var(--joy-radius-md, 8px);
}
[data-theme="dark"] .joy-chart {
  background-color: #0f172a;
  border-color: #1e293b;
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
  background: var(--joy-surface-frosted, rgba(255, 255, 255, 0.85));
  backdrop-filter: var(--joy-backdrop-blur, blur(10px));
  -webkit-backdrop-filter: var(--joy-backdrop-blur, blur(10px));
  border: 1px solid var(--joy-color-border-subtle, #e2e8f0);
  border-radius: var(--joy-radius-sm, 6px);
  font-size: 0.75rem;
  color: var(--joy-color-text-primary, #0f172a);
  pointer-events: none;
  z-index: 5;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}
[data-theme="dark"] .joy-chart__hud {
  background: rgba(15, 23, 42, 0.85);
  border-color: #334155;
  color: #f8fafc;
}
.joy-chart__hud-item {
  display: flex;
  gap: 4px;
}
.joy-chart__hud-label {
  color: var(--joy-color-text-muted, #64748b);
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
  border-top: 1px solid var(--joy-color-border-subtle, #e2e8f0);
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
  border-left: 1px solid var(--joy-color-border-subtle, #e2e8f0);
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
  border-top: 1px solid var(--joy-color-border-subtle, #e2e8f0);
}
.joy-divider__text {
  padding: 0 16px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--joy-color-text-muted, #64748b);
  white-space: nowrap;
}
[data-theme="dark"] .joy-divider,
[data-theme="dark"] .joy-divider--with-text::before,
[data-theme="dark"] .joy-divider--with-text::after {
  border-color: #334155;
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
  border: 1px solid var(--joy-color-border-subtle, #e2e8f0);
  border-radius: var(--joy-radius-md, 8px);
}
[data-theme="dark"] .joy-splitter {
  border-color: #334155;
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
  background-color: var(--joy-color-surface-muted, #f1f5f9);
  cursor: col-resize;
  user-select: none;
  transition: background-color 0.15s ease;
}
.joy-splitter--vertical > .joy-splitter__bar {
  cursor: row-resize;
}
.joy-splitter__bar:hover,
.joy-splitter__bar--active {
  background-color: var(--joy-color-brand-primary, #7c3aed);
}
[data-theme="dark"] .joy-splitter__bar {
  background-color: #1e293b;
}
[data-theme="dark"] .joy-splitter__bar:hover {
  background-color: #a855f7;
}

/* ── Ant Design Data Display Primitives ── */
/* Statistic */
.joy-statistic {
  box-sizing: border-box;
  font-family: var(--joy-font-family-sans, sans-serif);
}
.joy-statistic__title {
  font-size: 0.8125rem;
  color: var(--joy-color-text-muted, #64748b);
  margin-bottom: 4px;
}
.joy-statistic__content {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--joy-color-text-primary, #0f172a);
}
[data-theme="dark"] .joy-statistic__content {
  color: #f8fafc;
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
  border-radius: var(--joy-radius-sm, 4px);
  border: 1px solid var(--joy-color-border-subtle, #e2e8f0);
  background-color: var(--joy-color-surface-subtle, #f8fafc);
  color: var(--joy-color-text-primary, #0f172a);
  transition: all 0.15s ease;
  white-space: nowrap;
}
.joy-tag--primary {
  background-color: rgba(124, 58, 237, 0.08);
  border-color: rgba(124, 58, 237, 0.2);
  color: var(--joy-color-brand-primary, #7c3aed);
}
.joy-tag--success {
  background-color: rgba(16, 185, 129, 0.08);
  border-color: rgba(16, 185, 129, 0.2);
  color: #059669;
}
.joy-tag--warning {
  background-color: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.2);
  color: #d97706;
}
.joy-tag--danger {
  background-color: rgba(239, 68, 68, 0.08);
  border-color: rgba(239, 68, 68, 0.2);
  color: #dc2626;
}
.joy-tag--checkable {
  cursor: pointer;
}
.joy-tag--checkable:hover {
  opacity: 0.85;
}
.joy-tag--checked {
  background-color: var(--joy-color-brand-primary, #7c3aed);
  border-color: var(--joy-color-brand-primary, #7c3aed);
  color: #ffffff;
}
[data-theme="dark"] .joy-tag {
  background-color: #1e293b;
  border-color: #334155;
  color: #cbd5e1;
}

/* Segmented */
.joy-segmented {
  display: inline-flex;
  padding: 3px;
  background-color: var(--joy-color-surface-muted, #f1f5f9);
  border-radius: var(--joy-radius-md, 8px);
  border: 1px solid var(--joy-color-border-subtle, #e2e8f0);
}
[data-theme="dark"] .joy-segmented {
  background-color: #020617;
  border-color: #334155;
}
.joy-segmented__item {
  position: relative;
  padding: 5px 14px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--joy-color-text-muted, #64748b);
  border: none;
  background: transparent;
  border-radius: var(--joy-radius-sm, 6px);
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}
.joy-segmented__item:hover {
  color: var(--joy-color-text-primary, #0f172a);
}
[data-theme="dark"] .joy-segmented__item:hover {
  color: #f8fafc;
}
.joy-segmented__item--active {
  background-color: #ffffff;
  color: var(--joy-color-brand-primary, #7c3aed);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
[data-theme="dark"] .joy-segmented__item--active {
  background-color: #1e293b;
  color: #f8fafc;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
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
  color: var(--joy-color-text-primary, #0f172a);
  margin-bottom: 6px;
  line-height: 1.5;
}
.joy-form-item--horizontal .joy-form-item__label {
  width: var(--joy-form-label-width, 160px);
  min-width: var(--joy-form-label-width, 160px);
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
[data-theme="dark"] .joy-form-item__label {
  color: #f8fafc;
}
.joy-form-item__required {
  color: var(--joy-color-status-danger, #ef4444);
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
  margin-left: var(--joy-form-label-width, 160px);
}
.joy-form-item__explain {
  font-size: 0.75rem;
  color: var(--joy-color-status-danger, #ef4444);
  margin-top: 4px;
  min-height: 18px;
}
.joy-form-item--error input,
.joy-form-item--error textarea,
.joy-form-item--error .joy-input-wrapper {
  border-color: var(--joy-color-status-danger, #ef4444) !important;
}

/* InputNumber */
.joy-input-number {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 100%;
  max-width: 180px;
  border: 1px solid var(--joy-color-border-subtle, #cbd5e1);
  border-radius: var(--joy-radius-md, 8px);
  background-color: var(--joy-color-surface-elevated, #ffffff);
  transition: all 0.2s;
  overflow: hidden;
}
[data-theme="dark"] .joy-input-number {
  background-color: #0f172a;
  border-color: #334155;
}
.joy-input-number:focus-within {
  border-color: var(--joy-color-brand-primary, #7c3aed);
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.15);
}
.joy-input-number__input {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: none;
  background: transparent;
  color: var(--joy-color-text-primary, #0f172a);
  font-family: var(--joy-font-family-mono, monospace);
  font-size: 0.875rem;
  outline: none;
}
[data-theme="dark"] .joy-input-number__input {
  color: #f8fafc;
}
.joy-input-number__handler-wrap {
  display: flex;
  flex-direction: column;
  width: 24px;
  border-left: 1px solid var(--joy-color-border-subtle, #cbd5e1);
  background: var(--joy-color-surface-subtle, #f8fafc);
  flex-shrink: 0;
}
[data-theme="dark"] .joy-input-number__handler-wrap {
  border-left-color: #334155;
  background: #1e293b;
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
  color: var(--joy-color-text-muted, #64748b);
  padding: 0;
  transition: background-color 0.15s;
}
.joy-input-number__handler-up {
  border-bottom: 1px solid var(--joy-color-border-subtle, #cbd5e1);
}
[data-theme="dark"] .joy-input-number__handler-up {
  border-bottom-color: #334155;
}
.joy-input-number__handler-up:hover,
.joy-input-number__handler-down:hover {
  background: rgba(124, 58, 237, 0.1);
  color: var(--joy-color-brand-primary, #7c3aed);
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
  color: var(--joy-color-border-subtle, #cbd5e1);
  transition: transform 0.15s ease, color 0.15s ease;
}
.joy-rate__star:hover {
  transform: scale(1.15);
}
.joy-rate__star--full {
  color: var(--joy-color-brand-accent, #c49a3a);
}
.joy-rate__star--half {
  color: var(--joy-color-brand-accent, #c49a3a);
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
  font-family: var(--joy-font-family-sans, sans-serif);
  font-size: 0.875rem;
  border: 1px solid var(--joy-color-border-subtle, #cbd5e1);
  border-radius: var(--joy-radius-md, 8px);
  background-color: var(--joy-color-surface-elevated, #ffffff);
  color: var(--joy-color-text-primary, #0f172a);
  outline: none;
  resize: vertical;
}
[data-theme="dark"] .joy-mentions__textarea {
  background-color: #0f172a;
  border-color: #334155;
  color: #f8fafc;
}
.joy-mentions__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 200px;
  max-height: 180px;
  overflow-y: auto;
  background: var(--joy-color-surface-elevated, #ffffff);
  border: 1px solid var(--joy-color-border-subtle, #e2e8f0);
  border-radius: var(--joy-radius-md, 8px);
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
  z-index: 50;
  padding: 4px;
}
[data-theme="dark"] .joy-mentions__dropdown {
  background: #0f172a;
  border-color: #334155;
  box-shadow: 0 4px 14px rgba(0,0,0,0.4);
}
.joy-mentions__item {
  padding: 6px 10px;
  font-size: 0.8125rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--joy-color-text-primary, #0f172a);
}
[data-theme="dark"] .joy-mentions__item {
  color: #f8fafc;
}
.joy-mentions__item:hover {
  background-color: rgba(124, 58, 237, 0.08);
  color: var(--joy-color-brand-primary, #7c3aed);
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
  background: var(--joy-color-surface-elevated, #ffffff);
  border: 1px solid var(--joy-color-border-subtle, #e2e8f0);
  border-radius: var(--joy-radius-md, 8px);
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
  z-index: 50;
  overflow: hidden;
  margin-top: 4px;
}
[data-theme="dark"] .joy-time-picker__panel {
  background: #0f172a;
  border-color: #334155;
  box-shadow: 0 4px 14px rgba(0,0,0,0.4);
}
.joy-time-picker__column {
  width: 56px;
  max-height: 180px;
  overflow-y: auto;
  border-right: 1px solid var(--joy-color-border-subtle, #f1f5f9);
  padding: 4px 0;
}
[data-theme="dark"] .joy-time-picker__column {
  border-right-color: #1e293b;
}
.joy-time-picker__cell {
  height: 28px;
  line-height: 28px;
  text-align: center;
  font-size: 0.8125rem;
  cursor: pointer;
  color: var(--joy-color-text-primary, #0f172a);
}
[data-theme="dark"] .joy-time-picker__cell {
  color: #cbd5e1;
}
.joy-time-picker__cell:hover {
  background-color: rgba(124, 58, 237, 0.08);
}
.joy-time-picker__cell--selected {
  background-color: var(--joy-color-brand-primary, #7c3aed);
  color: #ffffff !important;
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
  border: 1px solid var(--joy-color-border-subtle, #cbd5e1);
  border-radius: var(--joy-radius-md, 8px);
  background-color: var(--joy-color-surface-elevated, #ffffff);
  overflow: hidden;
}
[data-theme="dark"] .joy-transfer__list {
  background-color: #0f172a;
  border-color: #334155;
}
.joy-transfer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background-color: var(--joy-color-surface-subtle, #f8fafc);
  border-bottom: 1px solid var(--joy-color-border-subtle, #e2e8f0);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--joy-color-text-primary, #0f172a);
}
[data-theme="dark"] .joy-transfer__header {
  background-color: #1e293b;
  border-bottom-color: #334155;
  color: #f8fafc;
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
  color: var(--joy-color-text-primary, #0f172a);
  transition: background-color 0.15s;
}
[data-theme="dark"] .joy-transfer__item {
  color: #cbd5e1;
}
.joy-transfer__item:hover {
  background-color: rgba(124, 58, 237, 0.06);
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
  background-color: var(--joy-color-surface-elevated, #ffffff);
  border-bottom: 1px solid var(--joy-color-border-subtle, #e2e8f0);
  font-family: var(--joy-font-family-sans, sans-serif);
  font-size: 0.875rem;
}
[data-theme="dark"] .joy-menu {
  background-color: #0f172a;
  border-bottom-color: #334155;
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
  border-right: 1px solid var(--joy-color-border-subtle, #e2e8f0);
  width: 240px;
}
[data-theme="dark"] .joy-menu--vertical,
[data-theme="dark"] .joy-menu--inline {
  border-right-color: #334155;
}
.joy-menu__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  color: var(--joy-color-text-primary, #0f172a);
  transition: all 0.15s ease;
  user-select: none;
}
[data-theme="dark"] .joy-menu__item {
  color: #cbd5e1;
}
.joy-menu__item:hover {
  color: var(--joy-color-brand-primary, #7c3aed);
}
.joy-menu__item--active {
  color: var(--joy-color-brand-primary, #7c3aed) !important;
  font-weight: 600;
}
.joy-menu--horizontal .joy-menu__item--active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--joy-color-brand-primary, #7c3aed);
}
.joy-menu--inline .joy-menu__item--active {
  background-color: rgba(124, 58, 237, 0.08);
  border-right: 3px solid var(--joy-color-brand-primary, #7c3aed);
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
  background-color: var(--joy-color-border-subtle, #e2e8f0);
}
[data-theme="dark"] .joy-anchor__ink {
  background-color: #334155;
}
.joy-anchor__ink-ball {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 2px solid var(--joy-color-brand-primary, #7c3aed);
  background-color: #ffffff;
  transition: top 0.2s ease;
}
[data-theme="dark"] .joy-anchor__ink-ball {
  background-color: #0f172a;
}
.joy-anchor__link {
  display: block;
  padding: 4px 0;
  font-size: 0.8125rem;
  color: var(--joy-color-text-muted, #64748b);
  text-decoration: none;
  transition: color 0.15s ease;
}
.joy-anchor__link:hover,
.joy-anchor__link--active {
  color: var(--joy-color-brand-primary, #7c3aed);
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
  background-color: var(--joy-color-surface-elevated, #ffffff);
  border-radius: var(--joy-radius-md, 8px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  font-size: 0.875rem;
  color: var(--joy-color-text-primary, #0f172a);
  animation: joyMessageSlideDown 0.25s ease-out;
}
[data-theme="dark"] .joy-message__notice {
  background-color: #1e293b;
  color: #f8fafc;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.4);
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
  background-color: var(--joy-color-surface-elevated, #ffffff);
  border-radius: var(--joy-radius-lg, 12px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--joy-color-border-subtle, #e2e8f0);
}
[data-theme="dark"] .joy-notification__notice {
  background-color: #0f172a;
  border-color: #334155;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}
.joy-notification__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--joy-color-text-primary, #0f172a);
  margin-bottom: 4px;
}
[data-theme="dark"] .joy-notification__title {
  color: #f8fafc;
}
.joy-notification__desc {
  font-size: 0.8125rem;
  color: var(--joy-color-text-muted, #64748b);
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
  background-color: var(--joy-color-surface-elevated, #ffffff);
  border-radius: var(--joy-radius-md, 8px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--joy-color-border-subtle, #e2e8f0);
  z-index: 100;
}
[data-theme="dark"] .joy-popconfirm__panel {
  background-color: #0f172a;
  border-color: #334155;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}
.joy-popconfirm__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--joy-color-text-primary, #0f172a);
  margin-bottom: 10px;
}
[data-theme="dark"] .joy-popconfirm__title {
  color: #f8fafc;
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
  color: var(--joy-color-brand-primary, #7c3aed);
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
  background-color: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
}
[data-theme="dark"] .joy-spin__mask {
  background-color: rgba(15, 23, 42, 0.65);
}

/* ── Tactile Micro-Animations & Wave Effects ── */
@keyframes joy-button-wave {
  0% { box-shadow: 0 0 0 0 rgba(196, 154, 58, 0.45); }
  100% { box-shadow: 0 0 0 8px rgba(196, 154, 58, 0); }
}
.joy-button:active:not(:disabled) {
  animation: joy-button-wave 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ── TreeSelect & Cascader Hierarchical Primitives ── */
.joy-treeselect, .joy-cascader {
  position: relative;
  display: inline-block;
  width: 100%;
  font-family: var(--joy-font-family-sans, sans-serif);
}
.joy-treeselect--disabled, .joy-cascader--disabled {
  opacity: 0.6;
  pointer-events: none;
}
.joy-treeselect__node--selected, .joy-cascader-menus [role="option"][aria-selected="true"] {
  background-color: rgba(196, 154, 58, 0.15) !important;
  color: var(--gold-400, #c49a3a) !important;
}

/* ── Live Markdown Editor ── */
.joy-markdown-editor {
  display: flex;
  flex-direction: column;
  font-family: var(--joy-font-family-sans, sans-serif);
  background-color: var(--joy-surface-card, #14253e);
  color: var(--joy-text-primary, #f8f3e8);
}
.joy-markdown-editor--fullscreen {
  position: fixed !important;
  inset: 0 !important;
  z-index: 1100 !important;
  height: 100vh !important;
  border-radius: 0 !important;
}

/* ── Image Preview Overlay ── */
.joy-image-preview-mask {
  animation: joy-fade-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
`;

const canonicalVars = [
  '  --navy-500: #14253e;',
  '  --gold-400: #c49a3a;',
  '  --cream-100: #f8f3e8;',
  '  --ink-500: #1f1c13;',
  '  --joy-surface-canvas: var(--joy-color-surface-canvas, #f8f3e8);',
  '  --joy-surface-card: var(--joy-color-surface-card, #ffffff);',
  '  --joy-border: var(--joy-color-border-base, #e2d9c8);',
  '  --joy-text-primary: var(--joy-color-text-primary, #1f1c13);',
].join('\n');

const themeCss = `:root {\n${cssVars.join('\n')}\n${canonicalVars}\n}\n\n${componentStyles}`;
fs.writeFileSync(path.join(outDir, 'theme.css'), themeCss);

// 2. tailwind-theme.css
const twThemeCss = `@theme {\n${cssVars.map(v => v.replace('--joy-', '--color-joy-')).join('\n')}\n}\n`;
fs.writeFileSync(path.join(outDir, 'tailwind-theme.css'), twThemeCss);

// 3. index.js (ESM) & index.cjs (CJS) & index.d.ts
const jsContent = `export const tokens = ${JSON.stringify(jsObj, null, 2)};\nexport default tokens;\n`;
fs.writeFileSync(path.join(outDir, 'index.js'), jsContent);

const cjsContent = `exports.tokens = ${JSON.stringify(jsObj, null, 2)};\nexports.default = exports.tokens;\n`;
fs.writeFileSync(path.join(outDir, 'index.cjs'), cjsContent);

const dtsContent = `export declare const tokens: Record<string, string>;\nexport default tokens;\n`;
fs.writeFileSync(path.join(outDir, 'index.d.ts'), dtsContent);

console.log("Tokens compiled successfully to", outDir);
