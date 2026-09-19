import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'dist');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Joymify Design System & Component Portal</title>
  <link rel="stylesheet" href="/theme.css">
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
      border-bottom: 1px solid #e2e8f0;
      background: #ffffff;
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
      padding: 36px 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
      background: #fafafa;
      background-image: radial-gradient(#e2e8f0 1px, transparent 0);
      background-size: 16px 16px;
      min-height: 160px;
    }
    .controls-table {
      width: 100%;
      border-top: 1px solid #e2e8f0;
      background: #ffffff;
      border-collapse: collapse;
      font-size: 0.875rem;
    }
    .controls-table td {
      padding: 12px 20px;
      border-bottom: 1px solid #f1f5f9;
    }
    .controls-table td:first-child {
      font-weight: 600;
      color: #334155;
      width: 220px;
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
  </style>
</head>
<body>

  <!-- Sidebar -->
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-logo">J</div>
      <div class="brand-info">
        <h2>Joymify Design</h2>
        <span>v2.0 Enterprise Suite (Wave 2)</span>
      </div>
    </div>
    <nav class="nav">
      <div class="nav-section">Overview</div>
      <a class="nav-item active" onclick="switchView('overview')">
        <span class="icon">✨</span> Overview & Architecture
      </a>
      <a class="nav-item" onclick="switchView('tokens')">
        <span class="icon">🎨</span> Design Tokens & Motion
      </a>

      <div class="nav-section">Standard Components</div>
      <a class="nav-item" onclick="switchView('button')">
        <span class="icon">🔘</span> Button
      </a>
      <a class="nav-item" onclick="switchView('badge')">
        <span class="icon">🏷️</span> Badge & Tag
      </a>
      <a class="nav-item" onclick="switchView('input')">
        <span class="icon">✏️</span> Input Field
      </a>
      <a class="nav-item" onclick="switchView('switch')">
        <span class="icon">🎚️</span> Switch & Toggle
      </a>
      <a class="nav-item" onclick="switchView('alert')">
        <span class="icon">🔔</span> Alert & Notice
      </a>
      <a class="nav-item" onclick="switchView('metric')">
        <span class="icon">📊</span> MetricTile (Quant)
      </a>
      <a class="nav-item" onclick="switchView('table')">
        <span class="icon">📑</span> Table (Compact)
      </a>

      <div class="nav-section">Enterprise Overlays & Navigation</div>
      <a class="nav-item" onclick="switchView('modal')">
        <span class="icon">🪟</span> Modal / Dialog
      </a>
      <a class="nav-item" onclick="switchView('dropdown')">
        <span class="icon">🔽</span> Dropdown Menu
      </a>
      <a class="nav-item" onclick="switchView('tabs')">
        <span class="icon">🗂️</span> Tabs Layout
      </a>
      <a class="nav-item" onclick="switchView('tooltip')">
        <span class="icon">💬</span> Tooltip Overlay
      </a>

      <div class="nav-section">Wave 1: Enterprise Forms & Overlays</div>
      <a class="nav-item" onclick="switchView('select')">
        <span class="icon">📋</span> Select Dropdown
      </a>
      <a class="nav-item" onclick="switchView('checkbox')">
        <span class="icon">☑️</span> Checkbox
      </a>
      <a class="nav-item" onclick="switchView('radio')">
        <span class="icon">🔘</span> Radio Group
      </a>
      <a class="nav-item" onclick="switchView('drawer')">
        <span class="icon">🚪</span> Drawer (Sheet)
      </a>
      <a class="nav-item" onclick="switchView('toast')">
        <span class="icon">🍞</span> Toast Notifications
      </a>

      <div class="nav-section">Wave 2: Financial Trading & Skeletons</div>
      <a class="nav-item" onclick="switchView('financial-table')">
        <span class="icon">📈</span> Live Trading Orderbook
      </a>
      <a class="nav-item" onclick="switchView('pagination')">
        <span class="icon">🔢</span> Pagination Controls
      </a>
      <a class="nav-item" onclick="switchView('skeleton')">
        <span class="icon">🦴</span> Skeleton Loading States
      </a>
    </nav>
  </aside>

  <!-- Main Canvas Area -->
  <main class="main">
    <div class="topbar">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-weight: 600; font-size: 0.9375rem; color: #334155;">Target Suite:</span>
        <span class="badge joy-badge joy-badge--brand">Multi-Platform Enterprise</span>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <button class="joy-button joy-button--ghost joy-button--sm" id="btn-theme-toggle" onclick="toggleTheme()" style="gap: 6px; border: 1px solid #cbd5e1;">
          <span id="theme-icon">🌙</span> <span id="theme-label">Dark Mode</span>
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

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 36px;">
          <div style="background: #ffffff; padding: 24px; border-radius: 10px; border: 1px solid #e2e8f0; cursor: pointer;" onclick="switchView('tokens')">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="joy-badge joy-badge--success joy-badge--sm"><span class="joy-badge__dot"></span> Live Tokens & Motion</span>
            </div>
            <h3 style="margin: 0 0 8px 0;">@joymify/tokens</h3>
            <p style="color: #64748b; font-size: 0.875rem; margin: 0; line-height: 1.5;">
              W3C DTCG tokens including GPU spring motion curves, elevation shadows, z-index hierarchy, and colors.
            </p>
          </div>

          <div style="background: #ffffff; padding: 24px; border-radius: 10px; border: 1px solid #e2e8f0; cursor: pointer;" onclick="switchView('button'); setFramework('svelte');">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="joy-badge joy-badge--brand joy-badge--sm"><span class="joy-badge__dot"></span> Svelte 5 Runes</span>
            </div>
            <h3 style="margin: 0 0 8px 0;">@joymify/svelte</h3>
            <p style="color: #64748b; font-size: 0.875rem; margin: 0; line-height: 1.5;">
              Zero-overhead Runes ($state, $props, $derived, $bindable) engineered for real-time order books and high-FPS canvases.
            </p>
          </div>

          <div style="background: #ffffff; padding: 24px; border-radius: 10px; border: 1px solid #e2e8f0; cursor: pointer;" onclick="switchView('button'); setFramework('react');">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
              <span class="joy-badge joy-badge--neutral joy-badge--sm"><span class="joy-badge__dot"></span> React 19 Ready</span>
            </div>
            <h3 style="margin: 0 0 8px 0;">@joymify/react</h3>
            <p style="color: #64748b; font-size: 0.875rem; margin: 0; line-height: 1.5;">
              Strict WAI-ARIA accessible React 19 component library with forwardRef support and zero runtime CSS overhead.
            </p>
          </div>
        </div>

        <div class="joy-alert joy-alert--info">
          <div class="joy-alert__title">💡 Complete AntDesign Parity Suite</div>
          <div class="joy-alert__desc">
            Explore 11 standard & enterprise components including Modals, Dropdown menus, Tabs, and Tooltips with full GPU spring motion transitions.
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

      <!-- View: Button -->
      <section id="view-button" class="view-panel">
        <h2 style="margin: 0 0 8px 0;">Button Component</h2>
        <p class="header-tagline">Primary action element supporting solid, outline, ghost, and danger styles across 3 sizes.</p>

        <div class="playground-box">
          <div class="playground-header">
            <h4>Live Interactive Canvas</h4>
            <span class="joy-badge joy-badge--brand joy-badge--sm">Active Preview</span>
          </div>
          <div class="canvas" id="button-canvas">
            <button class="joy-button joy-button--solid joy-button--md" id="demo-btn" onclick="handleBtnClick()">
              Click Me! (Clicked: <span id="click-counter">0</span>)
            </button>
            <button class="joy-button joy-button--outline joy-button--md">Outline</button>
            <button class="joy-button joy-button--ghost joy-button--md">Ghost</button>
            <button class="joy-button joy-button--danger joy-button--md">Danger</button>
          </div>
          <table class="controls-table">
            <tr>
              <td>Variant</td>
              <td>
                <button class="joy-button joy-button--outline joy-button--sm" onclick="setBtnVariant('solid')">Solid</button>
                <button class="joy-button joy-button--outline joy-button--sm" onclick="setBtnVariant('outline')">Outline</button>
                <button class="joy-button joy-button--outline joy-button--sm" onclick="setBtnVariant('ghost')">Ghost</button>
                <button class="joy-button joy-button--outline joy-button--sm" onclick="setBtnVariant('danger')">Danger</button>
              </td>
            </tr>
            <tr>
              <td>Size</td>
              <td>
                <button class="joy-button joy-button--ghost joy-button--sm" onclick="setBtnSize('sm')">Small</button>
                <button class="joy-button joy-button--ghost joy-button--sm" onclick="setBtnSize('md')">Medium</button>
                <button class="joy-button joy-button--ghost joy-button--sm" onclick="setBtnSize('lg')">Large</button>
              </td>
            </tr>
            <tr>
              <td>Loading State</td>
              <td>
                <button class="joy-button joy-button--outline joy-button--sm" onclick="toggleBtnLoading()">Toggle Loading State</button>
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
                <button class="joy-button joy-button--outline joy-button--sm" onclick="toggleInputError()">Toggle Error State</button>
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
              <div class="joy-metric-tile__change">▲ +14.2% vs benchmark</div>
            </div>
            <div class="joy-metric-tile joy-metric-tile--down">
              <div class="joy-metric-tile__title">MAX DRAWDOWN</div>
              <div class="joy-metric-tile__value">-4.12%</div>
              <div class="joy-metric-tile__change">▼ -0.5% this session</div>
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
                Strategy Options ▾
              </button>
              <div class="joy-dropdown" id="demo-dropdown-menu" style="display: none;">
                <button class="joy-dropdown__item" onclick="selectDropdownAction('Duplicate')">📋 Duplicate Strategy</button>
                <button class="joy-dropdown__item" onclick="selectDropdownAction('Export CSV')">📥 Export Performance CSV</button>
                <button class="joy-dropdown__item" onclick="selectDropdownAction('Backtest')">⚡ Run Deep Backtest</button>
                <button class="joy-dropdown__item joy-dropdown__item--danger" style="color: #ef4444;" onclick="selectDropdownAction('Archive')">🗑️ Archive Strategy</button>
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
              👉 Open Right Sheet (Risk Analytics)
            </button>
            <button class="joy-button joy-button--outline joy-button--md" onclick="openDemoDrawer('left')">
              👈 Open Left Sheet (Navigation Tree)
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
              🟢 Fill Success
            </button>
            <button class="joy-button joy-button--outline joy-button--md" onclick="showDemoToast('WebSocket connection re-synchronized to Quant core', 'info')">
              🔵 Network Info
            </button>
            <button class="joy-button joy-button--ghost joy-button--md" onclick="showDemoToast('Order latency warning: p99 spiked to 4.2ms', 'warning')" style="border: 1px solid #e2e8f0;">
              🟡 Latency Warning
            </button>
            <button class="joy-button joy-button--danger joy-button--md" onclick="showDemoToast('Risk margin threshold exceeded! Immediate liquidation guard', 'danger')">
              🔴 Risk Danger
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
                ⚡ Random Tick
              </button>
              <button class="joy-button joy-button--outline joy-button--sm" id="btn-stream-toggle" onclick="toggleAutoStream()">
                ▶ Auto-Stream (Off)
              </button>
            </div>
          </div>
          <div style="padding: 16px;">
            <div class="joy-table-container">
              <table class="joy-table joy-table--compact" id="financial-order-table">
                <thead>
                  <tr>
                    <th class="joy-table-th--sortable" onclick="sortMarketTable('pair')">Pair <span class="joy-table-sort-icon">⇅</span></th>
                    <th class="joy-table-th--sortable" style="text-align: right;" onclick="sortMarketTable('price')">Price (USDT) <span class="joy-table-sort-icon">⇅</span></th>
                    <th class="joy-table-th--sortable" style="text-align: right;" onclick="sortMarketTable('change')">24h Change <span class="joy-table-sort-icon">⇅</span></th>
                    <th class="joy-table-th--sortable" style="text-align: right;" onclick="sortMarketTable('volume')">24h Vol (USDT) <span class="joy-table-sort-icon">⇅</span></th>
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
              🔄 Toggle Loading State
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

    </div>
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
      document.getElementById('theme-icon').innerText = next === 'dark' ? '☀️' : '🌙';
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

    function setBtnVariant(variant) {
      const btn = document.getElementById('demo-btn');
      btn.className = 'joy-button joy-button--' + variant + ' joy-button--md';
      updateCodeSnippets();
    }

    function setBtnSize(size) {
      const btn = document.getElementById('demo-btn');
      const currentVariant = btn.className.match(/joy-button--(solid|outline|ghost|danger)/)?.[1] || 'solid';
      btn.className = 'joy-button joy-button--' + currentVariant + ' joy-button--' + size;
    }

    function toggleBtnLoading() {
      isBtnLoading = !isBtnLoading;
      const btn = document.getElementById('demo-btn');
      if (isBtnLoading) {
        btn.innerHTML = '<span class="joy-button__spinner">⏳</span> Loading...';
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
      wrapper.classList.toggle('joy-input-wrapper--error');
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
      showDemoToast(marketData[idx].pair + (isUp ? ' 📈 Up' : ' 📉 Down') + ' tick: $' + marketData[idx].price.toFixed(2), isUp ? 'success' : 'warning');
      setTimeout(() => {
        marketData[idx].flash = null;
      }, 1000);
    }

    function toggleAutoStream() {
      const btn = document.getElementById('btn-stream-toggle');
      if (autoStreamTimer) {
        clearInterval(autoStreamTimer);
        autoStreamTimer = null;
        btn.innerText = '▶ Auto-Stream (Off)';
        btn.className = 'joy-button joy-button--outline joy-button--sm';
      } else {
        autoStreamTimer = setInterval(simulateRandomTick, 1500);
        btn.innerText = '⏸ Auto-Stream (Active)';
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
