import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { contrastRatio } from "../scripts/color.mjs";
import { genrePresets } from "../scripts/genres.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("Opt-in genres.css is generated and keeps core theme.css zero-bloat", () => {
  const genresCssPath = path.resolve(__dirname, "../dist/genres.css");
  const themeCssPath = path.resolve(__dirname, "../dist/theme.css");

  assert.ok(fs.existsSync(genresCssPath), "dist/genres.css must exist");
  const genresCss = fs.readFileSync(genresCssPath, "utf8");
  const themeCss = fs.readFileSync(themeCssPath, "utf8");

  for (const key of [
    "cyberpunk",
    "obsidian",
    "astral",
    "quantum",
    "titanium",
  ]) {
    assert.ok(
      genresCss.includes(`[data-palette="${key}"]`),
      `genres.css must include [data-palette="${key}"] selector`,
    );
    assert.ok(
      !themeCss.includes(`[data-palette="${key}"]`),
      `core theme.css must NOT bloat with genre preset [data-palette="${key}"]`,
    );
  }

  // Verify 5-axis structural bindings exist in genres.css
  assert.ok(
    genresCss.includes("--joy-font-family-heading:"),
    "genres.css must define heading font axis",
  );
  assert.ok(
    genresCss.includes("--joy-clip-path-card:"),
    "genres.css must define silhouette clip-path axis",
  );
  assert.ok(
    genresCss.includes("--joy-frame-outline:"),
    "genres.css must define frame ornament axis",
  );
  assert.ok(
    genresCss.includes("--joy-fx-glow:"),
    "genres.css must define atmosphere glow axis",
  );
  assert.ok(
    genresCss.includes("--joy-accent-secondary:"),
    "genres.css must define dual-accent chromatic tension axis",
  );

  // Verify Multi-Script (Thai + Japanese + Chinese) font stacks & typography guardrails
  assert.ok(
    genresCss.includes("Noto Serif Thai"),
    "genres.css must include Thai serif font fallback for RPG/Fantasy",
  );
  assert.ok(
    genresCss.includes("Chakra Petch"),
    "genres.css must include Chakra Petch for Thai/Latin tactical sci-fi",
  );
  assert.ok(
    genresCss.includes("Shippori Mincho"),
    "genres.css must include Japanese mincho serif for RPG/Fantasy",
  );
  assert.ok(
    genresCss.includes("M PLUS Rounded 1c"),
    "genres.css must include Japanese rounded font for Anime/Gacha",
  );
  assert.ok(
    genresCss.includes("Noto Serif SC"),
    "genres.css must include Simplified Chinese serif fallback",
  );
  assert.ok(
    genresCss.includes("Noto Serif TC"),
    "genres.css must include Traditional Chinese serif fallback",
  );
  assert.ok(
    genresCss.includes(":lang(th)"),
    "genres.css must include :lang(th) zero letter-spacing & diacritic clearance rules",
  );
  assert.ok(
    genresCss.includes(":lang(ja)"),
    "genres.css must include :lang(ja) CJK line-break & keep-all rules",
  );
  assert.ok(
    genresCss.includes(":lang(zh)"),
    "genres.css must include :lang(zh) CJK line-break & keep-all rules",
  );
});

test("WCAG 2.2 AA Contrast Gate for all 5-Axis Genre Presets (Light & Dark)", () => {
  const textKeys = [
    "text-primary",
    "text-secondary",
    "text-muted",
    "text-link",
    "accent-text",
    "accent-secondary-text",
  ];
  const surfaceKeys = ["surface-canvas", "surface-card", "surface-raised"];
  const buttonSurfaceKeys = ["accent-default", "accent-hover", "accent-active"];

  const failures = [];

  for (const [presetKey, preset] of Object.entries(genrePresets)) {
    for (const mode of ["light", "dark"]) {
      const palette = preset[mode];

      for (const fgKey of textKeys) {
        for (const bgKey of surfaceKeys) {
          const ratio = contrastRatio(palette[fgKey], palette[bgKey]);
          if (ratio < 4.5) {
            failures.push(
              `[${presetKey}/${mode}] ${fgKey} (${palette[fgKey]}) on ${bgKey} (${palette[bgKey]}) = ${ratio.toFixed(2)}:1 (min 4.5:1)`,
            );
          }
        }
      }

      for (const btnBgKey of buttonSurfaceKeys) {
        const ratio = contrastRatio(
          palette["text-on-accent"],
          palette[btnBgKey],
        );
        if (ratio < 4.5) {
          failures.push(
            `[${presetKey}/${mode}] text-on-accent (${palette["text-on-accent"]}) on ${btnBgKey} (${palette[btnBgKey]}) = ${ratio.toFixed(2)}:1 (min 4.5:1)`,
          );
        }
      }

      for (const bgKey of ["surface-canvas", "surface-card"]) {
        const ratio = contrastRatio(palette["border-strong"], palette[bgKey]);
        if (ratio < 3.0) {
          failures.push(
            `[${presetKey}/${mode}] border-strong (${palette["border-strong"]}) on ${bgKey} (${palette[bgKey]}) = ${ratio.toFixed(2)}:1 (min 3.0:1)`,
          );
        }
      }

      // Text on the subtle accent fills (active tab / nav item, secondary badge): >= 4.5:1.
      for (const [fgKey, bgKey] of [
        ["text-primary", "accent-subtle"],
        ["text-secondary", "accent-subtle"],
        ["accent-text", "accent-subtle"],
        ["text-link", "accent-subtle"],
        ["accent-secondary-text", "accent-secondary-subtle"],
      ]) {
        const ratio = contrastRatio(palette[fgKey], palette[bgKey]);
        if (ratio < 4.5) {
          failures.push(
            `[${presetKey}/${mode}] ${fgKey} (${palette[fgKey]}) on ${bgKey} (${palette[bgKey]}) = ${ratio.toFixed(2)}:1 (min 4.5:1)`,
          );
        }
      }

      // Focus indicators are non-text UI components: >= 3:1 against every surface they can sit on.
      for (const fgKey of ["border-focus", "focus-ring"]) {
        for (const bgKey of [...surfaceKeys, "accent-subtle"]) {
          const ratio = contrastRatio(palette[fgKey], palette[bgKey]);
          if (ratio < 3.0) {
            failures.push(
              `[${presetKey}/${mode}] ${fgKey} (${palette[fgKey]}) on ${bgKey} (${palette[bgKey]}) = ${ratio.toFixed(2)}:1 (min 3.0:1)`,
            );
          }
        }
      }
    }
  }

  assert.strictEqual(
    failures.length,
    0,
    `Genre preset WCAG 2.2 AA contrast failures:\n${failures.join("\n")}`,
  );
});

test("Genre buttons look disabled, and ornaments degrade under forced-colors / reduced motion", () => {
  const genresCss = fs.readFileSync(
    path.resolve(__dirname, "../dist/genres.css"),
    "utf8",
  );

  assert.ok(
    /\.joy-button:is\(:disabled, \[aria-disabled="true"\]\)\s*\{[^}]*background-image: none/.test(
      genresCss,
    ),
    "capsule buttons must have an explicit disabled override",
  );
  assert.ok(
    genresCss.includes(
      '.joy-button--solid:where(:not(:disabled, [aria-disabled="true"]))',
    ),
    "genre button glow must exclude disabled buttons",
  );
  assert.ok(
    genresCss.includes("@media (forced-colors: active)"),
    "genres.css must degrade ornaments under forced-colors",
  );
  assert.ok(
    genresCss.includes("@media (prefers-reduced-motion: reduce)"),
    "genres.css must disable genre transitions under reduced motion",
  );
  assert.ok(
    !/:is\(\.joy-card[^{]*\.joy-modal[^{]*\)\s*\{[^}]*clip-path/.test(
      genresCss,
    ),
    "modal/drawer must not receive the chamfer clip-path",
  );
  assert.ok(
    !/hub-|\.nav-item|\.view-panel|dev-portal/.test(
      genresCss.replace(/\/\*[\s\S]*?\*\//g, ""),
    ),
    "published genres.css must not contain hub-only selectors",
  );
});
