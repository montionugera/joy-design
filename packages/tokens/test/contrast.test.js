import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { contrastRatio, hexToOklch } from "../scripts/color.mjs";
import { parseCssTokens } from "./helpers/css-tokens.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("WCAG 2.2 AA Contrast Gate for Semantic Tokens", () => {
  const cssPath = path.resolve(__dirname, "../dist/theme.css");
  assert.ok(
    fs.existsSync(cssPath),
    "dist/theme.css must exist before running contrast tests",
  );
  const css = fs.readFileSync(cssPath, "utf8");

  const { light, dark, duplicateDarkVars, mediaDarkVars } = parseCssTokens(css);

  // Assertion: no --joy-* variable may be declared more than once across dark blocks
  assert.strictEqual(
    duplicateDarkVars.length,
    0,
    `Duplicate --joy-* variable declarations found in dark mode blocks:\n${duplicateDarkVars.join("\n")}`,
  );

  // Assertion: media prefers-color-scheme: dark must be populated
  assert.ok(
    Object.keys(mediaDarkVars).length > 0,
    "media prefers-color-scheme: dark block must contain semantic token declarations",
  );

  const testPairs = [
    // Light text on surfaces
    {
      fg: "--joy-text-primary",
      bg: "--joy-surface-canvas",
      theme: "Light",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-primary",
      bg: "--joy-surface-card",
      theme: "Light",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-primary",
      bg: "--joy-surface-raised",
      theme: "Light",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-secondary",
      bg: "--joy-surface-canvas",
      theme: "Light",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-secondary",
      bg: "--joy-surface-card",
      theme: "Light",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-muted",
      bg: "--joy-surface-canvas",
      theme: "Light",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-muted",
      bg: "--joy-surface-card",
      theme: "Light",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-link",
      bg: "--joy-surface-canvas",
      theme: "Light",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-link",
      bg: "--joy-surface-card",
      theme: "Light",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-accent-text",
      bg: "--joy-surface-canvas",
      theme: "Light",
      role: "Accent Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-accent-text",
      bg: "--joy-surface-card",
      theme: "Light",
      role: "Accent Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-on-accent",
      bg: "--joy-accent-default",
      theme: "Light",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-on-accent",
      bg: "--joy-accent-gradient-end",
      theme: "Light",
      role: "Text / Hero Accent",
      min: 4.5,
    },

    // Light UI and borders
    {
      fg: "--joy-border-default",
      bg: "--joy-surface-canvas",
      theme: "Light",
      role: "Border / Surface",
      min: 3.0,
    },
    {
      fg: "--joy-border-default",
      bg: "--joy-surface-card",
      theme: "Light",
      role: "Border / Surface",
      min: 3.0,
    },
    {
      fg: "--joy-focus-ring",
      bg: "--joy-surface-canvas",
      theme: "Light",
      role: "Focus Ring",
      min: 3.0,
    },
    {
      fg: "--joy-focus-ring",
      bg: "--joy-surface-card",
      theme: "Light",
      role: "Focus Ring",
      min: 3.0,
    },

    // Light status
    {
      fg: "--joy-status-success-fg",
      bg: "--joy-status-success-bg",
      theme: "Light",
      role: "Status Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-status-success-fg",
      bg: "--joy-surface-canvas",
      theme: "Light",
      role: "Status Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-status-warning-fg",
      bg: "--joy-status-warning-bg",
      theme: "Light",
      role: "Status Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-status-warning-fg",
      bg: "--joy-surface-canvas",
      theme: "Light",
      role: "Status Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-status-danger-fg",
      bg: "--joy-status-danger-bg",
      theme: "Light",
      role: "Status Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-status-danger-bg",
      bg: "--joy-status-danger-fg",
      theme: "Light",
      role: "Status Surface / Text",
      min: 4.5,
    },
    {
      fg: "--joy-status-danger-fg",
      bg: "--joy-surface-canvas",
      theme: "Light",
      role: "Status Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-status-danger-solid-fg",
      bg: "--joy-status-danger-solid-bg",
      theme: "Light",
      role: "Danger Solid Button",
      min: 4.5,
    },
    {
      fg: "--joy-text-disabled",
      bg: "--joy-surface-disabled",
      theme: "Light",
      role: "Disabled Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-status-info-fg",
      bg: "--joy-status-info-bg",
      theme: "Light",
      role: "Status Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-status-info-fg",
      bg: "--joy-surface-canvas",
      theme: "Light",
      role: "Status Text / Surface",
      min: 4.5,
    },

    // Dark text on surfaces
    {
      fg: "--joy-text-primary",
      bg: "--joy-surface-canvas",
      theme: "Dark",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-primary",
      bg: "--joy-surface-card",
      theme: "Dark",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-primary",
      bg: "--joy-surface-raised",
      theme: "Dark",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-secondary",
      bg: "--joy-surface-canvas",
      theme: "Dark",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-secondary",
      bg: "--joy-surface-card",
      theme: "Dark",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-muted",
      bg: "--joy-surface-canvas",
      theme: "Dark",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-muted",
      bg: "--joy-surface-card",
      theme: "Dark",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-disabled",
      bg: "--joy-surface-disabled",
      theme: "Dark",
      role: "Disabled Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-link",
      bg: "--joy-surface-canvas",
      theme: "Dark",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-link",
      bg: "--joy-surface-card",
      theme: "Dark",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-accent-text",
      bg: "--joy-surface-canvas",
      theme: "Dark",
      role: "Accent Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-accent-text",
      bg: "--joy-surface-card",
      theme: "Dark",
      role: "Accent Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-on-accent",
      bg: "--joy-accent-default",
      theme: "Dark",
      role: "Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-text-on-accent",
      bg: "--joy-accent-gradient-end",
      theme: "Dark",
      role: "Text / Hero Accent",
      min: 4.5,
    },

    // Dark UI and borders
    {
      fg: "--joy-border-default",
      bg: "--joy-surface-canvas",
      theme: "Dark",
      role: "Border / Surface",
      min: 3.0,
    },
    {
      fg: "--joy-border-default",
      bg: "--joy-surface-card",
      theme: "Dark",
      role: "Border / Surface",
      min: 3.0,
    },
    {
      fg: "--joy-focus-ring",
      bg: "--joy-surface-canvas",
      theme: "Dark",
      role: "Focus Ring",
      min: 3.0,
    },
    {
      fg: "--joy-focus-ring",
      bg: "--joy-surface-card",
      theme: "Dark",
      role: "Focus Ring",
      min: 3.0,
    },

    // Dark status
    {
      fg: "--joy-status-success-fg",
      bg: "--joy-status-success-bg",
      theme: "Dark",
      role: "Status Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-status-success-fg",
      bg: "--joy-surface-canvas",
      theme: "Dark",
      role: "Status Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-status-warning-fg",
      bg: "--joy-status-warning-bg",
      theme: "Dark",
      role: "Status Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-status-warning-fg",
      bg: "--joy-surface-canvas",
      theme: "Dark",
      role: "Status Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-status-danger-fg",
      bg: "--joy-status-danger-bg",
      theme: "Dark",
      role: "Status Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-status-danger-bg",
      bg: "--joy-status-danger-fg",
      theme: "Dark",
      role: "Status Surface / Text",
      min: 4.5,
    },
    {
      fg: "--joy-status-danger-fg",
      bg: "--joy-surface-canvas",
      theme: "Dark",
      role: "Status Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-status-danger-solid-fg",
      bg: "--joy-status-danger-solid-bg",
      theme: "Dark",
      role: "Danger Solid Button",
      min: 4.5,
    },
    {
      fg: "--joy-status-info-fg",
      bg: "--joy-status-info-bg",
      theme: "Dark",
      role: "Status Text / Surface",
      min: 4.5,
    },
    {
      fg: "--joy-status-info-fg",
      bg: "--joy-surface-canvas",
      theme: "Dark",
      role: "Status Text / Surface",
      min: 4.5,
    },

    // F-043 brand
    {
      fg: "--joy-brand-mark-on-tile",
      bg: "--joy-brand-tile",
      theme: "Light",
      role: "Brand mark / Tile",
      min: 3.0,
    },
    {
      fg: "--joy-brand-mark",
      bg: "--joy-surface-canvas",
      theme: "Light",
      role: "Brand mark / Canvas",
      min: 3.0,
    },
    {
      fg: "--joy-brand-ink",
      bg: "--joy-surface-canvas",
      theme: "Light",
      role: "Brand ink / Canvas",
      min: 4.5,
    },
    {
      fg: "--joy-brand-ink-on-tile",
      bg: "--joy-brand-tile",
      theme: "Light",
      role: "Brand ink / Tile",
      min: 4.5,
    },
    {
      fg: "--joy-brand-mark-on-tile",
      bg: "--joy-brand-tile",
      theme: "Dark",
      role: "Brand mark / Tile",
      min: 3.0,
    },
    {
      fg: "--joy-brand-mark",
      bg: "--joy-surface-canvas",
      theme: "Dark",
      role: "Brand mark / Canvas",
      min: 3.0,
    },
    {
      fg: "--joy-brand-ink",
      bg: "--joy-surface-canvas",
      theme: "Dark",
      role: "Brand ink / Canvas",
      min: 4.5,
    },
    {
      fg: "--joy-brand-ink-on-tile",
      bg: "--joy-brand-tile",
      theme: "Dark",
      role: "Brand ink / Tile",
      min: 4.5,
    },
  ];

  const results = [];
  const failures = [];

  for (const item of testPairs) {
    const store = item.theme === "Light" ? light : dark;
    const fgVal = store[item.fg];
    const bgVal = store[item.bg];

    if (!fgVal || !bgVal) {
      failures.push(
        `Missing token: ${item.fg} (${fgVal}) or ${item.bg} (${bgVal}) in ${item.theme} theme`,
      );
      continue;
    }

    const ratio = contrastRatio(fgVal, bgVal);
    const pass = ratio >= item.min;
    results.push({
      pair: `${item.fg} (${fgVal}) on ${item.bg} (${bgVal})`,
      theme: item.theme,
      role: item.role,
      ratio: `${ratio.toFixed(2)}:1`,
      req: `≥ ${item.min}:1`,
      status: pass ? "PASS" : "**FAIL**",
    });

    if (!pass) {
      failures.push(
        `${item.theme} ${item.role} failure: ${item.fg} (${fgVal}) on ${item.bg} (${bgVal}) ratio ${ratio.toFixed(2)}:1 < ${item.min}:1`,
      );
    }
  }

  // Generate markdown table
  let md =
    "| Pair | Theme | Role | Contrast Ratio | WCAG AA Requirement | Pass/Fail |\n";
  md += "|---|---|---|---|---|---|\n";
  for (const r of results) {
    md += `| ${r.pair} | ${r.theme} | ${r.role} | ${r.ratio} | ${r.req} | ${r.status} |\n`;
  }

  // Write contrast-table-after.md to the research folder
  const searchDirs = [
    path.resolve(
      __dirname,
      "../../../.claude/refined_backlog/F-036-wave-1-semantic-token-foundation-light-d/research",
    ),
    path.resolve(__dirname, "../../research"),
    path.resolve(process.cwd(), "research"),
  ];

  for (const dir of searchDirs) {
    if (fs.existsSync(dir)) {
      fs.writeFileSync(path.join(dir, "contrast-table-after.md"), md, "utf8");
      break;
    }
  }

  assert.strictEqual(
    failures.length,
    0,
    `WCAG Contrast Gate failures:\n${failures.join("\n")}`,
  );
});

test("WCAG 2.2 AA Contrast Gate across all 6 Palette Presets (Light & Dark) - 132 Pairs", () => {
  const cssPath = path.resolve(__dirname, "../dist/theme.css");
  const css = fs.readFileSync(cssPath, "utf8");
  const { light, dark } = parseCssTokens(css);

  const presets = [
    "classic",
    "bauhaus-primary",
    "clay-court",
    "nordic-slate",
    "verdant-lawn",
    "outdoor",
  ];
  const failures = [];
  let totalChecked = 0;

  const parseDecls = (body) => {
    const res = {};
    for (const line of body.split(";")) {
      const m = line.match(/(--[\w-]+)\s*:\s*([^;]+)/);
      if (m) res[m[1].trim()] = m[2].trim();
    }
    return res;
  };

  for (const key of presets) {
    const lightBlockRegex = new RegExp(
      `\\[data-palette="${key}"\\],\\s*:root\\[data-palette="${key}"\\]\\s*\\{([^}]+)\\}`,
    );
    const darkBlockRegex = new RegExp(
      `\\[data-theme="dark"\\]\\[data-palette="${key}"\\],\\s*\\[data-theme="dark"\\]\\s*\\[data-palette="${key}"\\]\\s*\\{([^}]+)\\}`,
    );

    const mLight = lightBlockRegex.exec(css);
    const mDark = darkBlockRegex.exec(css);

    assert.ok(mLight, `Preset ${key} must have a light block in theme.css`);
    assert.ok(mDark, `Preset ${key} must have a dark block in theme.css`);

    const pLight = { ...light, ...parseDecls(mLight[1]) };
    const pDark = { ...dark, ...parseDecls(mDark[1]) };

    const checkTheme = (themeName, tokens) => {
      // 1. Text on Accent across interactive states (default, hover, active) >= 4.5:1
      const actionStates = [
        { name: "accent-default", token: "--joy-accent-default" },
        { name: "accent-hover", token: "--joy-accent-hover" },
        { name: "accent-active", token: "--joy-accent-active" },
      ];

      for (const action of actionStates) {
        const fg = tokens["--joy-text-on-accent"];
        const bg = tokens[action.token];
        assert.ok(
          fg && bg,
          `Preset ${key} (${themeName}) missing ${action.token} or text-on-accent`,
        );
        const ratio = contrastRatio(fg, bg);
        totalChecked++;
        if (ratio < 4.5) {
          failures.push(
            `Preset ${key} (${themeName}) text-on-accent (${fg}) on ${action.name} (${bg}) ratio ${ratio.toFixed(2)}:1 < 4.5:1`,
          );
        }
      }

      // 2. Primary text on Canvas & Card >= 4.5:1
      for (const surf of ["--joy-surface-canvas", "--joy-surface-card"]) {
        const fg = tokens["--joy-text-primary"];
        const bg = tokens[surf];
        assert.ok(
          fg && bg,
          `Preset ${key} (${themeName}) missing text-primary or ${surf}`,
        );
        const ratio = contrastRatio(fg, bg);
        totalChecked++;
        if (ratio < 4.5) {
          failures.push(
            `Preset ${key} (${themeName}) text-primary (${fg}) on ${surf} (${bg}) ratio ${ratio.toFixed(2)}:1 < 4.5:1`,
          );
        }
      }

      // 3. Secondary text on Canvas & Card >= 4.5:1
      for (const surf of ["--joy-surface-canvas", "--joy-surface-card"]) {
        const fg = tokens["--joy-text-secondary"];
        const bg = tokens[surf];
        assert.ok(
          fg && bg,
          `Preset ${key} (${themeName}) missing text-secondary or ${surf}`,
        );
        const ratio = contrastRatio(fg, bg);
        totalChecked++;
        if (ratio < 4.5) {
          failures.push(
            `Preset ${key} (${themeName}) text-secondary (${fg}) on ${surf} (${bg}) ratio ${ratio.toFixed(2)}:1 < 4.5:1`,
          );
        }
      }

      // 4. Muted text on Canvas & Card >= 4.5:1
      for (const surf of ["--joy-surface-canvas", "--joy-surface-card"]) {
        const fg = tokens["--joy-text-muted"];
        const bg = tokens[surf];
        assert.ok(
          fg && bg,
          `Preset ${key} (${themeName}) missing text-muted or ${surf}`,
        );
        const ratio = contrastRatio(fg, bg);
        totalChecked++;
        if (ratio < 4.5) {
          failures.push(
            `Preset ${key} (${themeName}) text-muted (${fg}) on ${surf} (${bg}) ratio ${ratio.toFixed(2)}:1 < 4.5:1`,
          );
        }
      }

      // 5. Border default on Canvas & Card >= 3.0:1
      for (const surf of ["--joy-surface-canvas", "--joy-surface-card"]) {
        const fg = tokens["--joy-border-default"];
        const bg = tokens[surf];
        assert.ok(
          fg && bg,
          `Preset ${key} (${themeName}) missing border-default or ${surf}`,
        );
        const ratio = contrastRatio(fg, bg);
        totalChecked++;
        if (ratio < 3.0) {
          failures.push(
            `Preset ${key} (${themeName}) border-default (${fg}) on ${surf} (${bg}) ratio ${ratio.toFixed(2)}:1 < 3.0:1`,
          );
        }
      }
    };

    checkTheme("Light", pLight);
    checkTheme("Dark", pDark);
  }

  assert.strictEqual(
    totalChecked,
    132,
    `Expected 132 contrast pairs checked, got ${totalChecked}`,
  );
  assert.strictEqual(
    failures.length,
    0,
    `Preset Contrast Gate failures:\n${failures.join("\n")}`,
  );
});

test("WCAG 2.2 AA Contrast & OKLCH Gate for modern preset (Light & Dark)", () => {
  const cssPath = path.resolve(__dirname, "../dist/theme.css");
  const css = fs.readFileSync(cssPath, "utf8");
  const { light, dark } = parseCssTokens(css);

  const parseDecls = (body) => {
    const res = {};
    for (const line of body.split(";")) {
      const m = line.match(/(--[\w-]+)\s*:\s*([^;]+)/);
      if (m) res[m[1].trim()] = m[2].trim();
    }
    return res;
  };

  const lightMatch = /\[data-palette="modern"\],\s*:root\[data-palette="modern"\]\s*\{([^}]+)\}/.exec(css);
  const darkMatch = /\[data-theme="dark"\]\[data-palette="modern"\],\s*\[data-theme="dark"\]\s*\[data-palette="modern"\]\s*\{([^}]+)\}/.exec(css);

  assert.ok(lightMatch, "modern preset must have a light block in theme.css");
  assert.ok(darkMatch, "modern preset must have a dark block in theme.css");

  const pLight = { ...light, ...parseDecls(lightMatch[1]) };
  const pDark = { ...dark, ...parseDecls(darkMatch[1]) };

  const failures = [];
  const check = (modeName, t, fgKey, bgKey, min, label) => {
    const fg = t[fgKey];
    const bg = t[bgKey];
    assert.ok(fg && bg, `[modern/${modeName}] missing ${fgKey} (${fg}) or ${bgKey} (${bg})`);
    const ratio = contrastRatio(fg, bg);
    if (ratio < min) {
      failures.push(`[modern/${modeName}] ${label}: ${fgKey} (${fg}) on ${bgKey} (${bg}) = ${ratio.toFixed(2)}:1 < ${min}:1`);
    }
  };

  for (const [modeName, t] of [["Light", pLight], ["Dark", pDark]]) {
    // Text >= 4.5:1
    for (const surf of ["--joy-surface-canvas", "--joy-surface-card", "--joy-surface-hover"]) {
      check(modeName, t, "--joy-text-primary", surf, 4.5, "primary text");
      check(modeName, t, "--joy-text-secondary", surf, 4.5, "secondary text");
      check(modeName, t, "--joy-text-muted", surf, 4.5, "muted text");
      check(modeName, t, "--joy-text-link", surf, 4.5, "link text");
      check(modeName, t, "--joy-accent-text", surf, 4.5, "accent text");
    }
    check(modeName, t, "--joy-text-primary", "--joy-surface-raised", 4.5, "primary on raised");
    check(modeName, t, "--joy-text-primary", "--joy-accent-subtle", 4.5, "primary on accent-subtle");
    check(modeName, t, "--joy-accent-text", "--joy-accent-subtle", 4.5, "accent-text on accent-subtle");
    check(modeName, t, "--joy-text-disabled", "--joy-surface-disabled", 4.5, "disabled text");
    check(modeName, t, "--joy-text-inverse", "--joy-surface-inverse", 4.5, "inverse text");
    check(modeName, t, "--joy-text-on-accent", "--joy-accent-default", 4.5, "text-on-accent default");
    check(modeName, t, "--joy-text-on-accent", "--joy-accent-hover", 4.5, "text-on-accent hover");
    check(modeName, t, "--joy-text-on-accent", "--joy-accent-active", 4.5, "text-on-accent active");
    check(modeName, t, "--joy-mast-text", "--joy-mast", 4.5, "mast text");
    check(modeName, t, "--joy-mast-text", "--joy-mast-hover", 4.5, "mast text hover");
    check(modeName, t, "--joy-solid-fg", "--joy-solid", 4.5, "solid button label");
    check(modeName, t, "--joy-solid-fg", "--joy-solid-hover", 4.5, "solid button hover label");
    check(modeName, t, "--joy-pill-fg", "--joy-pill", 4.5, "live pill label");
    check(modeName, t, "--joy-status-danger-solid-fg", "--joy-status-danger-solid-bg", 4.5, "danger solid button");

    for (const s of ["success", "warning", "danger", "info"]) {
      check(modeName, t, `--joy-status-${s}-fg`, "--joy-surface-canvas", 4.5, `${s} on canvas`);
      check(modeName, t, `--joy-status-${s}-fg`, "--joy-surface-card", 4.5, `${s} on card`);
      check(modeName, t, `--joy-status-${s}-fg`, `--joy-status-${s}-bg`, 4.5, `${s} on status-bg`);
    }

    // First Light text zone stops (sky-1, sky-2) & mark stops (sky-1..sky-4)
    for (const stop of ["--joy-sky-1", "--joy-sky-2"]) {
      check(modeName, t, "--joy-sky-text", stop, 4.5, "sky-text on gradient text zone");
    }
    for (const stop of ["--joy-sky-1", "--joy-sky-2", "--joy-sky-3", "--joy-sky-4"]) {
      check(modeName, t, "--joy-sun", stop, 3.0, "sun mark on gradient");
    }

    // UI borders & marks >= 3.0:1
    for (const surf of ["--joy-surface-canvas", "--joy-surface-card"]) {
      check(modeName, t, "--joy-border-default", surf, 3.0, "control border");
      check(modeName, t, "--joy-border-strong", surf, 3.0, "strong border");
      check(modeName, t, "--joy-border-focus", surf, 3.0, "focus border");
      check(modeName, t, "--joy-action-edge", surf, 3.0, "gold action edge");
      check(modeName, t, "--joy-seam-b", surf, 3.0, "kintsugi shaded seam");
    }
    check(modeName, t, "--joy-live", "--joy-surface-card", 3.0, "live mark");
    check(modeName, t, "--joy-mast-ctl", "--joy-mast", 3.0, "mast control border");
    check(modeName, t, "--joy-accent-default", "--joy-mast", 3.0, "gold action on mast");
    check(modeName, t, "--joy-seam-a", "--joy-mast", 3.0, "kintsugi lit seam on mast");
    check(modeName, t, "--joy-brand-mark-on-tile", "--joy-brand-tile", 3.0, "brand mark on tile");
    check(modeName, t, "--joy-brand-mark", "--joy-surface-canvas", 3.0, "brand mark on canvas");

    // OKLCH hue separation: warning must be >= 25 deg from every gold and >= 20 deg from danger
    const hueGap = (a, b) => {
      const d = Math.abs(hexToOklch(a).H - hexToOklch(b).H);
      return Math.min(d, 360 - d);
    };
    const warnHex = t["--joy-status-warning-fg"];
    for (const gKey of [
      "--joy-live",
      "--joy-accent-default",
      "--joy-action-edge",
      "--joy-pill",
      "--joy-brand-mark-on-tile",
      "--joy-sun",
      "--joy-seam-a",
      "--joy-seam-b",
    ]) {
      const gap = hueGap(warnHex, t[gKey]);
      if (gap < 25) {
        failures.push(`[modern/${modeName}] warning (${warnHex}) hue gap vs ${gKey} (${t[gKey]}) = ${gap.toFixed(1)} deg < 25`);
      }
    }
    const redGap = hueGap(warnHex, t["--joy-status-danger-fg"]);
    if (redGap < 20) {
      failures.push(`[modern/${modeName}] warning (${warnHex}) hue gap vs danger (${t["--joy-status-danger-fg"]}) = ${redGap.toFixed(1)} deg < 20`);
    }

    // Kintsugi seams must read as saturated gold in OKLCH (C >= 0.10, 70 <= H <= 95)
    for (const sKey of ["--joy-seam-a", "--joy-seam-b"]) {
      const { C, H } = hexToOklch(t[sKey]);
      if (C < 0.10 || H < 70 || H > 95) {
        failures.push(`[modern/${modeName}] ${sKey} (${t[sKey]}) chroma=${C.toFixed(3)} hue=${H.toFixed(1)} outside gold band`);
      }
    }
  }

  assert.strictEqual(
    failures.length,
    0,
    `Modern preset contrast/OKLCH failures:\n${failures.join("\n")}`,
  );
});
