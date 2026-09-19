import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'dist');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const tokensSrcPath = path.join(__dirname, '../../packages/tokens/dist/theme.css');
const inlinedThemeCss = fs.existsSync(tokensSrcPath) ? fs.readFileSync(tokensSrcPath, 'utf8') : '';

// Extract vector SVGs from @joymify/icons
const iconsSrcDir = path.join(__dirname, '../../packages/icons/src');
const iconCardsHtml = fs.existsSync(iconsSrcDir)
  ? fs.readdirSync(iconsSrcDir)
      .filter(f => f.endsWith('.svelte'))
      .sort()
      .map(f => {
        const name = f.replace('.svelte', '');
        const content = fs.readFileSync(path.join(iconsSrcDir, f), 'utf8');
        const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/);
        let svg = svgMatch ? svgMatch[0] : '';
        svg = svg.replace(/width=\{size\}/g, 'width="24"')
                 .replace(/height=\{size\}/g, 'height="24"')
                 .replace(/stroke=\{color\}/g, 'stroke="currentColor"')
                 .replace(/fill=\{color\}/g, 'fill="currentColor"');
        return `
          <div class="icon-card" onclick="copyIconName('${name}')" title="Click to copy import">
            <div class="icon-preview">${svg}</div>
            <div class="icon-name">${name}</div>
          </div>
        `;
      }).join('\n')
  : '';


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
  markdown: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
};

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
    }
    html {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      text-rendering: optimizeLegibility;
    }
    body {
      font-family: var(--joy-font-family-sans, 'Inter', -apple-system, sans-serif);
      background-color: var(--joy-color-surface-subtle, #f8fafc);
      color: var(--joy-color-text-primary, #0f172a);
      margin: 0;
      padding: 0;
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* Sidebar */
    .sidebar {
      width: var(--sidebar-width);
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      height: 100%;
    }
    .brand {
      padding: 24px 20px;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      width: 34px;
      height: 34px;
      background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-weight: 700;
      font-size: 1.1rem;
      box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
    }
    .brand-info h2 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      color: var(--joy-color-text-primary, #0f172a);
      letter-spacing: -0.01em;
    }
    .brand-info span {
      font-size: 0.75rem;
      color: var(--joy-color-brand-primary, #7c3aed);
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
      color: var(--joy-color-text-muted, #64748b);
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
      color: #334155;
      text-decoration: none;
      cursor: pointer;
      transition: all var(--joy-motion-duration-fast, 150ms);
    }
    .nav-item:hover {
      background: #f1f5f9;
      color: var(--joy-color-text-primary, #0f172a);
    }
    .nav-item.active {
      background: #ede9fe;
      color: var(--joy-color-brand-primary, #7c3aed);
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
      height: 60px;
      border-bottom: var(--joy-border-hairline, 1px solid #e2e8f0);
      background: var(--joy-surface-frosted, rgba(255, 255, 255, 0.82));
      backdrop-filter: var(--joy-backdrop-blur, blur(12px));
      -webkit-backdrop-filter: var(--joy-backdrop-blur, blur(12px));
      padding: 0 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .framework-pill {
      display: inline-flex;
      background: #f1f5f9;
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
      color: #64748b;
      transition: all var(--joy-motion-duration-fast, 150ms);
    }
    .framework-btn.active {
      background: #ffffff;
      color: var(--joy-color-brand-primary, #7c3aed);
      box-shadow: 0 1px 4px rgba(0,0,0,0.06);
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
      animation: joy-fade-in var(--joy-motion-duration-fast, 150ms) ease-out;
    }
    .header-tagline {
      margin-top: 4px;
      color: var(--joy-color-text-muted, #64748b);
      font-size: 1rem;
      margin-bottom: 24px;
    }
    .playground-box {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      margin-bottom: 32px;
      overflow: hidden;
    }
    .playground-header {
      padding: 16px 20px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .playground-header h4 {
      margin: 0;
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--joy-color-text-primary, #0f172a);
    }
    .canvas {
      padding: 44px 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
      background: #fafafa;
      background-image: radial-gradient(#cbd5e1 1.2px, transparent 0);
      background-size: 20px 20px;
      min-height: 180px;
      position: relative;
    }
    [data-theme="dark"] .canvas {
      background: #090d16;
      background-image: radial-gradient(#1e293b 1.2px, transparent 0);
    }
    .controls-table {
      width: 100%;
      border-top: 1px solid #e2e8f0;
      background: #ffffff;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    [data-theme="dark"] .controls-table {
      background: #0f172a;
      border-top-color: #334155;
    }
    .controls-table td {
      padding: 14px 24px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    [data-theme="dark"] .controls-table td {
      border-bottom-color: #1e293b;
    }
    .controls-table td:first-child {
      font-weight: 600;
      color: #334155;
      width: 180px;
    }
    [data-theme="dark"] .controls-table td:first-child {
      color: #94a3b8;
    }
    .segmented-control {
      display: inline-flex;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
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
      color: #64748b;
      border-radius: 6px;
      cursor: pointer;
      transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
      font-family: inherit;
    }
    .segment-btn:hover {
      color: #0f172a;
    }
    .segment-btn.active {
      background: #ffffff;
      color: #0f172a;
      font-weight: 600;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04);
    }
    [data-theme="dark"] .segmented-control {
      background: #020617;
      border-color: #334155;
    }
    [data-theme="dark"] .segment-btn {
      color: #94a3b8;
    }
    [data-theme="dark"] .segment-btn:hover {
      color: #f8fafc;
    }
    [data-theme="dark"] .segment-btn.active {
      background: #1e293b;
      color: #f8fafc;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    }
    .code-snippet {
      background: #0f172a;
      color: #f8fafc;
      padding: 16px 20px;
      border-radius: 8px;
      font-family: var(--joy-font-family-mono, monospace);
      font-size: 0.8125rem;
      overflow-x: auto;
      margin-top: 16px;
      line-height: 1.5;
    }
    .tokens-table {
      width: 100%;
      border-collapse: collapse;
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      font-size: 0.875rem;
    }
    .tokens-table th, .tokens-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #f1f5f9;
      text-align: left;
    }
    .tokens-table th {
      background: #f8fafc;
      font-weight: 600;
    }
    .color-swatch {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid rgba(0,0,0,0.1);
      display: inline-block;
      vertical-align: middle;
      margin-right: 8px;
    }
    .badge-runes {
      background: #ff3e00;
      color: #ffffff;
      font-size: 0.6875rem;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
    }
    .badge-react {
      background: #00d8ff;
      color: #0f172a;
      font-size: 0.6875rem;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 700;
    }

    /* ── Coherent Dark Mode Overrides for Hub UI ── */
    [data-theme="dark"] body {
      background-color: #0b0f19;
      color: #f8fafc;
    }
    [data-theme="dark"] .sidebar {
      background: #0f172a;
      border-right-color: #1e293b;
    }
    [data-theme="dark"] .brand {
      border-bottom-color: #1e293b;
    }
    [data-theme="dark"] .brand-info h2 {
      color: #f8fafc;
    }
    [data-theme="dark"] .nav-section {
      color: #64748b;
    }
    [data-theme="dark"] .nav-item {
      color: #94a3b8;
    }
    [data-theme="dark"] .nav-item:hover {
      background: #1e293b;
      color: #f8fafc;
    }
    [data-theme="dark"] .nav-item.active {
      background: #2e1065;
      color: #c084fc;
    }
    [data-theme="dark"] .topbar {
      background: rgba(15, 23, 42, 0.85);
      border-bottom-color: #1e293b;
    }
    [data-theme="dark"] .framework-pill {
      background: #1e293b;
    }
    [data-theme="dark"] .framework-btn {
      color: #94a3b8;
    }
    [data-theme="dark"] .framework-btn.active {
      background: #0f172a;
      color: #c084fc;
    }
    [data-theme="dark"] .playground-box {
      background: #0f172a;
      border-color: #1e293b;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
    [data-theme="dark"] .playground-header {
      background: #1e293b;
      border-bottom-color: #334155;
    }
    [data-theme="dark"] .playground-header h4 {
      color: #f8fafc;
    }
    [data-theme="dark"] .tokens-table {
      background: #0f172a;
      border-color: #1e293b;
    }
    [data-theme="dark"] .tokens-table th {
      background: #1e293b;
      border-bottom-color: #334155;
      color: #f8fafc;
    }
    [data-theme="dark"] .tokens-table td {
      border-bottom-color: #1e293b;
      color: #cbd5e1;
    }
    /* Icon Gallery Styling */
    .icon-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 12px;
      width: 100%;
    }
    .icon-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
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
      border-color: #7c3aed;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.12);
    }
    .icon-preview {
      display: flex;
      align-items: center;
      justify-content: center;
      color: #334155;
    }
    .icon-name {
      font-size: 0.75rem;
      font-weight: 500;
      color: #64748b;
      text-align: center;
      word-break: break-all;
    }
    [data-theme="dark"] .icon-card {
      background: #0f172a;
      border-color: #1e293b;
    }
    [data-theme="dark"] .icon-card:hover {
      border-color: #a855f7;
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.2);
    }
    [data-theme="dark"] .icon-preview {
      color: #f8fafc;
    }
    [data-theme="dark"] .icon-name {
      color: #94a3b8;
    }

    /* Coherent Dark Mode for All Containers */
    [data-theme="dark"] .header-tagline {
      color: #94a3b8;
    }
    [data-theme="dark"] .content-area div[style*="background: #ffffff"] {
      background: #0f172a !important;
      border-color: #1e293b !important;
    }
    [data-theme="dark"] .content-area div[style*="background: #f8fafc"] {
      background: #1e293b !important;
      border-color: #334155 !important;
    }
    [data-theme="dark"] .joy-toast {
      background: #0f172a !important;
      color: #f8fafc !important;
      border-color: #1e293b !important;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5) !important;
    }
  </style>
</head>
<body>

  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-logo">J</div>
      <div class="brand-info">
        <h2>Joymify Design</h2>
        <span>v2.2 OpenDesign Integrated</span>
      </div>
    </div>
    <nav class="nav">
      <div class="nav-section">Overview</div>
      <a class="nav-item active" onclick="switchView('overview')">
        <span class="icon">${navIcons.overview}</span> Overview & Architecture
      </a>
      <a class="nav-item" onclick="switchView('tokens')">
        <span class="icon">${navIcons.tokens}</span> Design Tokens & Motion
      </a>
      <a class="nav-item" onclick="switchView('props-spec')">
        <span class="icon">${navIcons.propsSpec}</span> Props & API Specs
      </a>

      <div class="nav-section">Standard Components</div>
      <a class="nav-item" onclick="switchView('button')">
        <span class="icon">${navIcons.button}</span> Button
      </a>
      <a class="nav-item" onclick="switchView('badge')">
        <span class="icon">${navIcons.badge}</span> Badge & Tag
      </a>
      <a class="nav-item" onclick="switchView('input')">
        <span class="icon">${navIcons.input}</span> Input Field
      </a>
      <a class="nav-item" onclick="switchView('switch')">
        <span class="icon">${navIcons.switch}</span> Switch & Toggle
      </a>
      <a class="nav-item" onclick="switchView('alert')">
        <span class="icon">${navIcons.alert}</span> Alert & Notice
      </a>
      <a class="nav-item" onclick="switchView('metric')">
        <span class="icon">${navIcons.metric}</span> MetricTile (Quant)
      </a>
      <a class="nav-item" onclick="switchView('table')">
        <span class="icon">${navIcons.table}</span> Table (Compact)
      </a>

      <div class="nav-section">Enterprise Overlays & Navigation</div>
      <a class="nav-item" onclick="switchView('modal')">
        <span class="icon">${navIcons.modal}</span> Modal / Dialog
      </a>
      <a class="nav-item" onclick="switchView('dropdown')">
        <span class="icon">${navIcons.dropdown}</span> Dropdown Menu
      </a>
      <a class="nav-item" onclick="switchView('tabs')">
        <span class="icon">${navIcons.tabs}</span> Tabs Layout
      </a>
      <a class="nav-item" onclick="switchView('tooltip')">
        <span class="icon">${navIcons.tooltip}</span> Tooltip Overlay
      </a>

      <div class="nav-section">Wave 1: Enterprise Forms & Overlays</div>
      <a class="nav-item" onclick="switchView('select')">
        <span class="icon">${navIcons.select}</span> Select Dropdown
      </a>
      <a class="nav-item" onclick="switchView('checkbox')">
        <span class="icon">${navIcons.checkbox}</span> Checkbox
      </a>
      <a class="nav-item" onclick="switchView('radio')">
        <span class="icon">${navIcons.radio}</span> Radio Group
      </a>
      <a class="nav-item" onclick="switchView('drawer')">
        <span class="icon">${navIcons.drawer}</span> Drawer (Sheet)
      </a>
      <a class="nav-item" onclick="switchView('toast')">
        <span class="icon">${navIcons.toast}</span> Toast Notifications
      </a>

      <div class="nav-section">Wave 2: Financial Trading & Skeletons</div>
      <a class="nav-item" onclick="switchView('financial-table')">
        <span class="icon">${navIcons.financialTable}</span> Live Trading Orderbook
      </a>
      <a class="nav-item" onclick="switchView('pagination')">
        <span class="icon">${navIcons.pagination}</span> Pagination Controls
      </a>
      <a class="nav-item" onclick="switchView('skeleton')">
        <span class="icon">${navIcons.skeleton}</span> Skeleton Loading States
      </a>

      <div class="nav-section">Wave 3: Data Entry & Assets</div>
      <a class="nav-item" onclick="switchView('date-picker')">
        <span class="icon">${navIcons.datePicker}</span> Date & Range Picker
      </a>
      <a class="nav-item" onclick="switchView('enterprise-display')">
        <span class="icon">${navIcons.enterpriseDisplay}</span> Breadcrumb & StatCard
      </a>
      <a class="nav-item" onclick="switchView('progress')">
        <span class="icon">${navIcons.progress}</span> Progress Bar
      </a>
      <a class="nav-item" onclick="switchView('empty-state')">
        <span class="icon">${navIcons.emptyState}</span> Empty State
      </a>

      <div class="nav-section">Wave 4: AntDesign Parity & Motion</div>
      <a class="nav-item" onclick="switchView('upload')">
        <span class="icon">${navIcons.upload}</span> Upload & Dragger
      </a>
      <a class="nav-item" onclick="switchView('avatar')">
        <span class="icon">${navIcons.avatar}</span> Avatar & Group
      </a>
      <a class="nav-item" onclick="switchView('slider')">
        <span class="icon">${navIcons.slider}</span> Slider (Range)
      </a>
      <a class="nav-item" onclick="switchView('markdown')">
        <span class="icon">${navIcons.markdown}</span> MarkdownViewer (Cherry)
      </a>
      <a class="nav-item" onclick="switchView('icons-gallery')">
        <span class="icon">${navIcons.iconsGallery}</span> Icons Gallery (138 SVGs)
      </a>
    </nav>
  </aside>

  <!-- Main Canvas Area -->
  <main class="main">
    <div class="topbar">
      <div style="display: flex; align-items: center; gap: 10px; flex-shrink: 0;">
        <span class="topbar-target-label" style="font-weight: 600; font-size: 0.875rem; white-space: nowrap;">Target Suite:</span>
        <span class="joy-badge joy-badge--brand joy-badge--sm" style="white-space: nowrap;">Multi-Platform Enterprise</span>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <button class="joy-button joy-button--ghost joy-button--sm" id="btn-theme-toggle" onclick="toggleTheme()" style="gap: 6px; border: 1px solid #cbd5e1;">
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
      <section id="view-overview" class="view-panel active">
        <div class="badge joy-badge joy-badge--brand joy-badge--md" style="margin-bottom: 12px;">Enterprise Component Architecture</div>
        <h1 style="margin: 0; font-size: 2rem; color: var(--joy-color-brand-primary);">Joymify Design System</h1>
        <p class="header-tagline">
          Enterprise multi-platform design tokens specification and production component library built for 
          <strong>Quant</strong>, <strong>JoyCoach</strong>, <strong>AssetStudio</strong>, and <strong>JoyQuest</strong>.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 36px;">
          <div style="background: #ffffff; padding: 24px; border-radius: 10px; border: var(--joy-border-hairline, 1px solid #e2e8f0); cursor: pointer;" onclick="switchView('tokens')">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="joy-badge joy-badge--success joy-badge--sm"><span class="joy-badge__dot"></span> Live Tokens & Motion</span>
            </div>
            <h3 style="margin: 0 0 8px 0;">@joymify/tokens</h3>
            <p style="color: #64748b; font-size: 0.875rem; margin: 0; line-height: 1.5;">
              W3C DTCG tokens with OpenDesign posture integration, GPU spring motion curves, and hairline borders.
            </p>
          </div>

          <div style="background: #ffffff; padding: 24px; border-radius: 10px; border: var(--joy-border-hairline, 1px solid #e2e8f0); cursor: pointer;" onclick="switchView('button'); setFramework('svelte');">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="joy-badge joy-badge--brand joy-badge--sm"><span class="joy-badge__dot"></span> Svelte 5 Runes</span>
            </div>
            <h3 style="margin: 0 0 8px 0;">@joymify/svelte</h3>
            <p style="color: #64748b; font-size: 0.875rem; margin: 0; line-height: 1.5;">
              Zero-overhead Runes ($state, $props, $derived, $bindable) engineered for real-time order books and high-FPS canvases.
            </p>
          </div>

          <div style="background: #ffffff; padding: 24px; border-radius: 10px; border: var(--joy-border-hairline, 1px solid #e2e8f0); cursor: pointer;" onclick="switchView('button'); setFramework('react');">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="joy-badge joy-badge--neutral joy-badge--sm"><span class="joy-badge__dot"></span> React 19 Ready</span>
            </div>
            <h3 style="margin: 0 0 8px 0;">@joymify/react</h3>
            <p style="color: #64748b; font-size: 0.875rem; margin: 0; line-height: 1.5;">
              Strict WAI-ARIA accessible React 19 component library with forwardRef support and zero runtime CSS overhead.
            </p>
          </div>

          <div style="background: #ffffff; padding: 24px; border-radius: 10px; border: var(--joy-border-hairline, 1px solid #e2e8f0); cursor: pointer;" onclick="switchView('tokens')">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="joy-badge joy-badge--brand joy-badge--sm"><span class="joy-badge__dot"></span> OpenDesign Postures</span>
            </div>
            <h3 style="margin: 0 0 8px 0;">Modern & Utility</h3>
            <p style="color: #64748b; font-size: 0.875rem; margin: 0; line-height: 1.5;">
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
              <td><code>color.brand.primary</code></td>
              <td><code>--joy-color-brand-primary</code></td>
              <td><span class="color-swatch" style="background: var(--joy-color-brand-primary);"></span>Primary</td>
              <td><code>#7c3aed</code></td>
            </tr>
            <tr>
              <td><code>color.brand.primary-hover</code></td>
              <td><code>--joy-color-brand-primary-hover</code></td>
              <td><span class="color-swatch" style="background: var(--joy-color-brand-primary-hover);"></span>Hover</td>
              <td><code>#6d28d9</code></td>
            </tr>
            <tr>
              <td><code>color.status.success</code></td>
              <td><code>--joy-color-status-success</code></td>
              <td><span class="color-swatch" style="background: var(--joy-color-status-success);"></span>Success</td>
              <td><code>#10b981</code></td>
            </tr>
            <tr>
              <td><code>color.status.danger</code></td>
              <td><code>--joy-color-status-danger</code></td>
              <td><span class="color-swatch" style="background: var(--joy-color-status-danger);"></span>Danger</td>
              <td><code>#ef4444</code></td>
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
                  <td><span class="joy-prop-type">'solid' | 'outline' | 'ghost' | 'danger'</span></td>
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
            <div style="font-size: 0.8125rem; color: #64748b;">Click button or test controls below</div>
          </div>
          <div class="canvas" id="button-canvas">
            <button class="joy-button joy-button--solid joy-button--md" id="demo-btn" onclick="handleBtnClick()">
              Click Me! (Clicked: <span id="click-counter">0</span>)
            </button>
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
                  <span id="btn-loading-status" style="font-size: 0.8125rem; font-weight: 500; color: #64748b;">Idle</span>
                </div>
              </td>
            </tr>
          </table>
        </div>

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
            <div style="font-size: 0.875rem; color: #64748b; margin-top: 8px;">
              Live value: <strong id="input-mirror" style="color: #7c3aed;">(empty)</strong>
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
                  <span id="input-error-status" style="font-size: 0.8125rem; font-weight: 500; color: #64748b;">Normal (No Error)</span>
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
        <p class="header-tagline">Contextual notification banners for messaging, validation, and system status.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Alert Variations</h4>
          </div>
          <div style="padding: 24px;">
            <div class="joy-alert joy-alert--info">
              <div class="joy-alert__title">System Information</div>
              <div class="joy-alert__desc">Real-time market feed connects to high-throughput WebSocket.</div>
            </div>
            <div class="joy-alert joy-alert--success">
              <div class="joy-alert__title">Order Executed</div>
              <div class="joy-alert__desc">Filled 1.5 BTC at $68,420.00 with 0.01% slippage.</div>
            </div>
            <div class="joy-alert joy-alert--warning">
              <div class="joy-alert__title">Margin Warning</div>
              <div class="joy-alert__desc">Maintenance margin usage reached 78%.</div>
            </div>
            <div class="joy-alert joy-alert--danger">
              <div class="joy-alert__title">API Disconnected</div>
              <div class="joy-alert__desc">Unable to reach gateway endpoint. Retrying in 5s...</div>
            </div>
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
              <div class="joy-metric-tile__title">PORTFOLIO SHARPE</div>
              <div class="joy-metric-tile__value">2.84</div>
              <div class="joy-metric-tile__change">+14.2% vs benchmark</div>
            </div>
            <div class="joy-metric-tile joy-metric-tile--down">
              <div class="joy-metric-tile__title">MAX DRAWDOWN</div>
              <div class="joy-metric-tile__value">-4.12%</div>
              <div class="joy-metric-tile__change">-0.5% this session</div>
            </div>
            <div class="joy-metric-tile joy-metric-tile--neutral">
              <div class="joy-metric-tile__title">ACTIVE STRATEGIES</div>
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
            <div class="joy-table-container">
              <table class="joy-table joy-table--compact">
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
                    <td><code>#ORD-8921</code></td>
                    <td><strong>BTC/USDT</strong></td>
                    <td><span style="color: #10b981; font-weight: 600;">BUY</span></td>
                    <td>$67,820.50</td>
                    <td>0.45 BTC</td>
                    <td><span class="joy-badge joy-badge--success joy-badge--sm">FILLED</span></td>
                  </tr>
                  <tr>
                    <td><code>#ORD-8922</code></td>
                    <td><strong>ETH/USDT</strong></td>
                    <td><span style="color: #ef4444; font-weight: 600;">SELL</span></td>
                    <td>$3,510.20</td>
                    <td>4.20 ETH</td>
                    <td><span class="joy-badge joy-badge--success joy-badge--sm">FILLED</span></td>
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
        <p class="header-tagline">Accessible modal dialog overlay with backdrop blur, focus trap, and escape key listener.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Interactive Dialog Trigger</h4>
          </div>
          <div class="canvas">
            <button class="joy-button joy-button--solid joy-button--md" onclick="openDemoModal()">
              Open Confirm Modal
            </button>
          </div>
        </div>

        <div id="demo-modal-container" style="display: none;">
          <div class="joy-modal-backdrop" onclick="closeDemoModal(event)">
            <div class="joy-modal">
              <div class="joy-modal__header">
                <h3 class="joy-modal__title">Confirm Liquidation Order</h3>
                <button type="button" class="joy-modal__close" onclick="closeDemoModal()">&times;</button>
              </div>
              <div class="joy-modal__body">
                Are you sure you want to trigger emergency liquidation across all connected sub-accounts? This action is immediate and non-reversible.
              </div>
              <div class="joy-modal__footer">
                <button class="joy-button joy-button--ghost joy-button--md" onclick="closeDemoModal()">Cancel</button>
                <button class="joy-button joy-button--danger joy-button--md" onclick="alert('Order submitted!'); closeDemoModal();">Confirm</button>
              </div>
            </div>
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
            <div class="joy-dropdown-wrapper">
              <button class="joy-button joy-button--outline joy-button--md" onclick="toggleDemoDropdown()">
                Strategy Options <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><path d="m6 9 6 6 6-6"/></svg>
              </button>
              <div class="joy-dropdown" id="demo-dropdown-menu" style="display: none;">
                <button class="joy-dropdown__item" onclick="selectDropdownAction('Duplicate')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Duplicate Strategy</button>
                <button class="joy-dropdown__item" onclick="selectDropdownAction('Export CSV')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Export Performance CSV</button>
                <button class="joy-dropdown__item" onclick="selectDropdownAction('Backtest')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> Run Deep Backtest</button>
                <button class="joy-dropdown__item joy-dropdown__item--danger" style="color: #ef4444;" onclick="selectDropdownAction('Archive')"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> Archive Strategy</button>
              </div>
            </div>
          </div>
          <div style="padding: 12px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 0.875rem;">
            Selected action: <strong id="dropdown-selection-text" style="color: #7c3aed;">None</strong>
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
            <div class="joy-tabs">
              <button class="joy-tab-btn joy-tab-btn--active" id="tab-btn-1" onclick="switchDemoTab('tab-btn-1', 'tab-panel-1')">Live Orders</button>
              <button class="joy-tab-btn" id="tab-btn-2" onclick="switchDemoTab('tab-btn-2', 'tab-panel-2')">Historical Fills</button>
              <button class="joy-tab-btn" id="tab-btn-3" onclick="switchDemoTab('tab-btn-3', 'tab-panel-3')">Risk Matrix</button>
            </div>
            <div id="tab-panel-1" class="tab-panel-demo">
              <p style="margin: 0; color: #334155;">Showing 3 active live limit orders awaiting counter-party match.</p>
            </div>
            <div id="tab-panel-2" class="tab-panel-demo" style="display: none;">
              <p style="margin: 0; color: #334155;">12 fills executed in the last 24 hours with zero rejected packets.</p>
            </div>
            <div id="tab-panel-3" class="tab-panel-demo" style="display: none;">
              <p style="margin: 0; color: #334155;">Value at Risk (VaR 99%): 1.42 BTC across delta-neutral positions.</p>
            </div>
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
            <div class="joy-tooltip-wrapper">
              <button class="joy-button joy-button--outline joy-button--md">
                Hover Me (Trading Fee)
              </button>
              <div class="joy-tooltip">Maker fee: 0.01% | Taker: 0.04%</div>
            </div>

            <div class="joy-tooltip-wrapper">
              <span class="joy-badge joy-badge--brand joy-badge--md" tabindex="0">
                Focus Me (Keyboard)
              </span>
              <div class="joy-tooltip">Accessible ARIA tooltip with keyboard tab support</div>
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
            <div style="font-size: 0.875rem; color: #64748b; margin-top: 8px;">
              Active Mode: <strong id="demo-select-feedback" style="color: var(--joy-color-brand-primary);">Limit Order</strong>
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
        <p class="header-tagline">Heavyweight off-canvas inspection panel for deep financial telemetry, analytics, and detail workflows.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Drawer Placement Triggers</h4>
          </div>
          <div class="canvas" style="gap: 20px;">
            <button class="joy-button joy-button--solid joy-button--md" onclick="openDemoDrawer('right')">
              Open Right Sheet (Risk Analytics) &rarr;
            </button>
            <button class="joy-button joy-button--outline joy-button--md" onclick="openDemoDrawer('left')">
              &larr; Open Left Sheet (Navigation Tree)
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
            <button class="joy-button joy-button--solid joy-button--md" onclick="showDemoToast('Limit order #89281 Filled at 68,420.00 USDT', 'success')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Fill Success
            </button>
            <button class="joy-button joy-button--outline joy-button--md" onclick="showDemoToast('WebSocket connection re-synchronized to Quant core', 'info')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
              Network Info
            </button>
            <button class="joy-button joy-button--ghost joy-button--md" onclick="showDemoToast('Order latency warning: p99 spiked to 4.2ms', 'warning')" style="border: 1px solid #e2e8f0;">
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
          <div class="playground-header" style="display: flex; justify-content: space-between; align-items: center;">
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
            <div class="joy-table-container">
              <table class="joy-table joy-table--compact" id="financial-order-table">
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
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px;" id="paged-content-box">
              <div style="font-weight: 600; color: #334155; margin-bottom: 8px;" id="paged-range-text">Showing Orders 1 to 10 of 50</div>
              <ul style="margin: 0; padding-left: 20px; color: #64748b; font-size: 0.875rem;" id="paged-records-list">
                <!-- Records list -->
              </ul>
            </div>

            <nav class="joy-pagination" role="navigation" aria-label="Pagination">
              <button type="button" class="joy-pagination__btn" id="pg-prev" onclick="handlePageNav('prev')">&larr;</button>
              <button type="button" class="joy-pagination__btn joy-pagination__btn--active" id="pg-1" onclick="goToDemoPage(1)">1</button>
              <button type="button" class="joy-pagination__btn" id="pg-2" onclick="goToDemoPage(2)">2</button>
              <button type="button" class="joy-pagination__btn" id="pg-3" onclick="goToDemoPage(3)">3</button>
              <button type="button" class="joy-pagination__btn" id="pg-4" onclick="goToDemoPage(4)">4</button>
              <button type="button" class="joy-pagination__btn" id="pg-5" onclick="goToDemoPage(5)">5</button>
              <button type="button" class="joy-pagination__btn" id="pg-next" onclick="handlePageNav('next')">&rarr;</button>

              <select class="joy-select" style="width: auto; padding: 4px 28px 4px 8px; font-size: 0.8125rem; margin-left: 12px;" onchange="handleDemoPageSize(this.value)">
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
          <div class="playground-header" style="display: flex; justify-content: space-between; align-items: center;">
            <h4>Asset Card Shimmer Placeholder</h4>
            <button class="joy-button joy-button--outline joy-button--sm" onclick="toggleSkeletonLoading()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg> Toggle Loading State
            </button>
          </div>
          <div class="canvas" style="gap: 32px; justify-content: center;">
            <div id="skeleton-card-loading" style="width: 320px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
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

            <div id="skeleton-card-loaded" style="display: none; width: 320px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
              <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <div style="width: 40px; height: 40px; border-radius: 50%; background: #ede9fe; color: #7c3aed; display: flex; align-items: center; justify-content: center; font-weight: 700;">JOY</div>
                <div>
                  <h4 style="margin: 0; font-size: 1rem;">Joymify Quant Pool</h4>
                  <span style="font-size: 0.75rem; color: #64748b;">Arbitrage High-Freq Vault</span>
                </div>
              </div>
              <p style="margin: 0 0 12px; font-size: 0.875rem; color: #334155; line-height: 1.5;">
                Delta-neutral funding rate harvester with sub-millisecond execution routing on Vultr Kubernetes.
              </p>
              <div style="background: #f8fafc; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.8125rem; color: #64748b;">Annualized APY</span>
                <strong style="color: #10b981; font-size: 1.1rem; font-family: var(--joy-font-family-mono, monospace);">+28.4%</strong>
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
              <label style="display: block; font-size: 0.8125rem; font-weight: 600; margin-bottom: 6px; color: var(--joy-color-text-muted);">Standard Date Picker</label>
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
              <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">Selected Date: <strong id="single-date-feedback" style="color: #7c3aed;">2026-09-19</strong></div>
            </div>

            <div style="width: 100%;">
              <label style="display: block; font-size: 0.8125rem; font-weight: 600; margin-bottom: 6px; color: var(--joy-color-text-muted);">Financial Date Range Picker (Backtest Window)</label>
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
              <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">Active Interval: <strong id="range-date-feedback" style="color: #7c3aed;">2026-01-01 to 2026-09-19</strong></div>
            </div>
          </div>
        </div>
      </section>

      <!-- View: Enterprise Display (Breadcrumb & StatCard) -->
      <section id="view-enterprise-display" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Breadcrumb Navigation & Stat Cards</h2>
        <p class="header-tagline">Hierarchical route tracking and trading KPI metric displays with high-contrast delta tone badges.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Breadcrumb Navigation</h4>
          </div>
          <div class="canvas" style="justify-content: flex-start; padding: 24px;">
            <nav class="joy-breadcrumb" aria-label="Breadcrumb">
              <ol>
                <li><a class="joy-breadcrumb__link" href="#overview" onclick="switchView('overview')">Home</a><span class="joy-breadcrumb__sep">/</span></li>
                <li><a class="joy-breadcrumb__link" href="#quant" onclick="switchView('financial-table')">Quant Engine</a><span class="joy-breadcrumb__sep">/</span></li>
                <li><a class="joy-breadcrumb__link" href="#vaults">Vaults</a><span class="joy-breadcrumb__sep">/</span></li>
                <li><span class="joy-breadcrumb__current" aria-current="page">Alpha-1 Delta Neutral</span></li>
              </ol>
            </nav>
          </div>
        </div>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Enterprise KPI Stat Cards</h4>
          </div>
          <div class="canvas" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
            <div class="joy-stat-card">
              <div class="joy-stat-card__label">Portfolio Value</div>
              <div class="joy-stat-card__value">$1,429,850</div>
              <div class="joy-stat-card__delta joy-stat-card__delta--positive">&uarr; +14.2% (30d)</div>
            </div>
            <div class="joy-stat-card">
              <div class="joy-stat-card__label">Max Drawdown</div>
              <div class="joy-stat-card__value">1.84%</div>
              <div class="joy-stat-card__delta joy-stat-card__delta--critical">&darr; -0.4% from peak</div>
            </div>
            <div class="joy-stat-card">
              <div class="joy-stat-card__label">Active Workers</div>
              <div class="joy-stat-card__value">32 Nodes</div>
              <div class="joy-stat-card__delta joy-stat-card__delta--info">&bull; 99.99% Vultr Uptime</div>
            </div>
          </div>
        </div>
      </section>

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
              <div style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 6px; color: var(--joy-color-text-muted);">Active Harvest Task (72%)</div>
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
              <div style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 6px; color: var(--joy-color-text-muted);">Completed Sync (100% Success)</div>
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
              <div style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 6px; color: var(--joy-color-text-muted);">Failed Execution (Exception State)</div>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" style="color: var(--joy-color-brand-primary, #7c3aed); flex-shrink: 0;">
                      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                      <polyline points="13 2 13 9 20 9"></polyline>
                    </svg>
                    <span style="font-weight: 500;">alpha_momentum_v3.json</span>
                    <span style="color: var(--joy-color-text-muted, #64748b); font-size: 0.75rem;">(42.8 KB)</span>
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
              <div class="joy-avatar joy-avatar--square joy-avatar--lg" style="background-color: #0284c7;"><span class="joy-avatar__fallback">VT</span></div>
            </div>

            <div style="margin-top: 8px;">
              <h5 style="margin: 0 0 8px 0; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--joy-color-text-muted, #64748b);">AvatarGroup (Overlapping Team Stack)</h5>
              <div class="joy-avatar-group">
                <div class="joy-avatar joy-avatar--circle joy-avatar--md" style="background-color: #7c3aed;"><span class="joy-avatar__fallback">AM</span></div>
                <div class="joy-avatar joy-avatar--circle joy-avatar--md" style="background-color: #059669;"><span class="joy-avatar__fallback">BL</span></div>
                <div class="joy-avatar joy-avatar--circle joy-avatar--md" style="background-color: #d97706;"><span class="joy-avatar__fallback">CR</span></div>
                <div class="joy-avatar joy-avatar--circle joy-avatar--md" style="background-color: #475569;"><span class="joy-avatar__fallback">+4</span></div>
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
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--joy-color-text-muted, #64748b); margin-top: 8px;">
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
}</code><button type="button" class="joy-markdown__copy-btn" onclick="navigator.clipboard?.writeText('// TypeScript Quantitative Order Router\nimport { Router, OrderType } from \'@joymify/quant\';'); showDemoToast('Code copied to clipboard', 'success');"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy</button></pre>
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
          <div class="playground-header" style="display: flex; justify-content: space-between; align-items: center;">
            <h4>Icon System Collection (138 Vector Assets &bull; Dual Svelte 5 + React 19)</h4>
            <div id="copy-toast-banner" style="font-size: 0.8125rem; color: #10b981; font-weight: 600; display: none;">Copied to clipboard!</div>
          </div>
          <div style="padding: 24px;">
            <div class="icon-grid">
              ${iconCardsHtml}
            </div>
          </div>
        </div>
      </section>
  </main>

  <!-- Interactive Demo Drawer -->
  <div id="demo-drawer-container" style="display: none;">
    <div class="joy-drawer-backdrop" id="demo-drawer-backdrop" onclick="closeDemoDrawer(event)">
      <div class="joy-drawer" id="demo-drawer-panel">
        <div class="joy-drawer__header">
          <h3 class="joy-drawer__title" id="demo-drawer-title">Risk Engine Analysis</h3>
          <button type="button" class="joy-drawer__close" onclick="closeDemoDrawer()">&times;</button>
        </div>
        <div class="joy-drawer__body" id="demo-drawer-body">
          <p><strong>Sub-account:</strong> Quant Alpha Alpha-1</p>
          <p><strong>Margin Ratio:</strong> 14.2% (Healthy)</p>
          <p><strong>Maintenance Margin:</strong> $124,500.00</p>
          <div class="joy-alert joy-alert--info" style="margin-top: 16px;">
            <div class="joy-alert__title">Liquidation Buffer</div>
            <div class="joy-alert__desc">Liquidation price is 48% below current index mark.</div>
          </div>
        </div>
        <div class="joy-drawer__footer">
          <button class="joy-button joy-button--ghost joy-button--sm" onclick="closeDemoDrawer()">Cancel</button>
          <button class="joy-button joy-button--solid joy-button--sm" onclick="showDemoToast('Audit snapshot generated successfully', 'success'); closeDemoDrawer();">Export PDF</button>
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
      document.getElementById('theme-icon').innerHTML = next === 'dark'
        ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
        : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
      document.getElementById('theme-label').innerText = next === 'dark' ? 'Light Mode' : 'Dark Mode';
    }

    function switchView(viewName) {
      document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
      const target = document.getElementById('view-' + viewName);
      if (target) target.classList.add('active');

      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      const activeNav = Array.from(document.querySelectorAll('.nav-item')).find(el => el.getAttribute('onclick')?.includes(viewName));
      if (activeNav) activeNav.classList.add('active');
    }

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
        btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="animation: spin 1s linear infinite; display: inline-block; vertical-align: middle; margin-right: 6px;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> Loading...';
        btn.disabled = true;
      } else {
        btn.innerHTML = 'Click Me! (Clicked: <span id="click-counter">' + clickCount + '</span>)';
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
      document.getElementById('demo-modal-container').style.display = 'block';
    }

    function closeDemoModal(e) {
      if (e && e.target !== e.currentTarget) return;
      document.getElementById('demo-modal-container').style.display = 'none';
    }

    function toggleDemoDropdown() {
      const menu = document.getElementById('demo-dropdown-menu');
      menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }

    function selectDropdownAction(action) {
      document.getElementById('dropdown-selection-text').innerText = action;
      document.getElementById('demo-dropdown-menu').style.display = 'none';
    }

    function switchDemoTab(btnId, panelId) {
      document.querySelectorAll('.joy-tab-btn').forEach(b => b.classList.remove('joy-tab-btn--active'));
      document.getElementById(btnId).classList.add('joy-tab-btn--active');
      document.querySelectorAll('.tab-panel-demo').forEach(p => p.style.display = 'none');
      document.getElementById(panelId).style.display = 'block';
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
      const container = document.getElementById('demo-drawer-container');
      const panel = document.getElementById('demo-drawer-panel');
      const backdrop = document.getElementById('demo-drawer-backdrop');
      backdrop.style.justifyContent = placement === 'left' ? 'flex-start' : 'flex-end';
      panel.className = 'joy-drawer ' + (placement === 'left' ? 'joy-drawer--left' : '');
      container.style.display = 'block';
    }

    function closeDemoDrawer(e) {
      if (e && e.target !== e.currentTarget) return;
      document.getElementById('demo-drawer-container').style.display = 'none';
    }

    function showDemoToast(msg, variant = 'info') {
      const container = document.getElementById('demo-toast-container');
      const toast = document.createElement('div');
      toast.className = 'joy-toast joy-toast--' + variant;
      toast.setAttribute('role', 'status');
      toast.innerHTML = '<div style="flex: 1;">' + msg + '</div><button type="button" style="background:transparent;border:none;cursor:pointer;font-size:1.1rem;color:var(--joy-color-text-muted);" onclick="this.parentElement.remove()">&times;</button>';
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
        let changeColor = r.change >= 0 ? 'var(--joy-color-status-success, #10b981)' : 'var(--joy-color-status-danger, #ef4444)';
        let changeSign = r.change >= 0 ? '+' : '';
        return '<tr>' +
          '<td style="font-weight: 600;">' + r.pair + '</td>' +
          '<td style="text-align: right; font-family: var(--joy-font-family-mono, monospace);" class="' + flashClass + '">' +
            '$' + r.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
          '</td>' +
          '<td style="text-align: right; font-weight: 600; color: ' + changeColor + ';">' +
            changeSign + r.change.toFixed(2) + '%' +
          '</td>' +
          '<td style="text-align: right; font-family: var(--joy-font-family-mono, monospace); color: #64748b;">' +
            '$' + (r.volume / 1e6).toFixed(1) + 'M' +
          '</td>' +
          '<td style="text-align: center;">' +
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

    // Initial render
    setTimeout(() => {
      renderMarketTable();
      renderPaginationDemo();
    }, 100);

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

fs.writeFileSync(path.join(outDir, 'index.html'), html);
const tokensSrc = path.join(__dirname, '../../packages/tokens/dist/theme.css');
if (fs.existsSync(tokensSrc)) {
  fs.copyFileSync(tokensSrc, path.join(outDir, 'theme.css'));
}
console.log("Built Storybook Hub static distribution in", outDir);
