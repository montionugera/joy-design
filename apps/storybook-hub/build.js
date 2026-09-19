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
        <span>v1.8 Enterprise Suite</span>
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
    </nav>
  </aside>

  <!-- Main Canvas Area -->
  <main class="main">
    <div class="topbar">
      <div>
        <span style="font-weight: 600; font-size: 0.9375rem; color: #334155;">Target Suite:</span>
        <span class="badge joy-badge joy-badge--brand" style="margin-left: 8px;">Multi-Platform Enterprise</span>
      </div>
      <div class="framework-pill">
        <button class="framework-btn active" id="btn-tab-svelte" onclick="setFramework('svelte')">
          <span class="badge-runes">SVELTE 5</span> Runes
        </button>
        <button class="framework-btn" id="btn-tab-react" onclick="setFramework('react')">
          <span class="badge-react">REACT 19</span> Modern
        </button>
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

    </div>
  </main>

  <script>
    let activeFramework = 'svelte';
    let clickCount = 0;
    let isBtnLoading = false;
    let isSwitchOn = false;

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
