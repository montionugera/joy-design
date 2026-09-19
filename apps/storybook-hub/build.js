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
  <title>Joymify Design System — Storybook Hub</title>
  <link rel="stylesheet" href="/theme.css">
  <style>
    body {
      font-family: var(--joy-font-family-sans, -apple-system, BlinkMacSystemFont, sans-serif);
      background-color: var(--joy-color-surface-subtle, #f8fafc);
      color: var(--joy-color-text-primary, #0f172a);
      margin: 0;
      padding: 40px 20px;
      display: flex;
      justify-content: center;
    }
    .container {
      max-width: 900px;
      width: 100%;
      background: #ffffff;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      border: 1px solid var(--joy-color-surface-muted, #f1f5f9);
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #ede9fe;
      color: var(--joy-color-brand-primary, #7c3aed);
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 16px;
    }
    h1 {
      margin: 0 0 16px 0;
      color: var(--joy-color-brand-primary, #7c3aed);
    }
    p {
      color: var(--joy-color-text-muted, #64748b);
      line-height: 1.6;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
      margin-top: 32px;
    }
    .card {
      padding: 24px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(124, 58, 237, 0.08);
      border-color: #7c3aed;
    }
    .card h3 {
      margin-top: 0;
      color: var(--joy-color-text-primary, #0f172a);
    }
    .status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      color: #10b981;
      font-weight: 600;
    }
    .status::before {
      content: '';
      width: 8px;
      height: 8px;
      background: #10b981;
      border-radius: 50%;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">Official Joymify Production Design System</div>
    <h1>Joymify Design System & Storybook Hub</h1>
    <p>
      Multi-platform component workshop and design tokens specification supporting 
      <strong>Svelte 5 (Runes)</strong> and <strong>React 19</strong> across Quant, JoyCoach, AssetStudio, and JoyQuest.
    </p>

    <div class="grid">
      <div class="card">
        <div class="status">Live & Synced</div>
        <h3>@joymify/tokens</h3>
        <p>Style Dictionary DTCG specification compiling to CSS custom properties and Tailwind v4 themes.</p>
      </div>
      <div class="card">
        <div class="status">Svelte 5 Runes</div>
        <h3>@joymify/svelte</h3>
        <p>Native Svelte 5 component suite built for high-throughput trading (Quant) and scoring (JoyCoach).</p>
      </div>
      <div class="card">
        <div class="status">React 19 Ready</div>
        <h3>@joymify/react</h3>
        <p>Accessible React 19 component library engineered for interactive canvases and creator suites (AssetStudio).</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync(path.join(outDir, 'index.html'), html);
const tokensSrc = path.join(__dirname, '../../packages/tokens/dist/theme.css');
if (fs.existsSync(tokensSrc)) {
  fs.copyFileSync(tokensSrc, path.join(outDir, 'theme.css'));
}
console.log("Built Storybook Hub static distribution in", outDir);
