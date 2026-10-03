import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test.describe("Storybook Hub Palette Preset Switcher & Bauhaus Showcase (F-049)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch (e) {}
    });
  });

  test("palette switcher defaults to classic preset", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-palette", "classic");
    const label = page.locator("#hub-palette-label");
    await expect(label).toHaveText("Joy Classic");
  });

  test("clicking palette toggle opens dropdown with all 5 curated presets", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator("#btn-palette-toggle");
    await btn.click();

    const dropdown = page.locator("#hub-palette-dropdown");
    await expect(dropdown).toBeVisible();

    const items = dropdown.locator(".hub-palette-item");
    await expect(items).toHaveCount(5);

    const palettes = await items.evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-palette"))
    );
    expect(palettes).toEqual([
      "classic",
      "bauhaus-primary",
      "clay-court",
      "nordic-slate",
      "verdant-lawn"
    ]);
  });

  test("selecting a palette preset applies data-palette and persists across reload", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator("#btn-palette-toggle");
    await btn.click();

    const clayOption = page.locator('.hub-palette-item[data-palette="clay-court"]');
    await clayOption.click();

    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-palette", "clay-court");
    await expect(page.locator("#hub-palette-label")).toHaveText("Clay Court");

    // Verify localStorage
    const saved = await page.evaluate(() => localStorage.getItem("joy-palette"));
    expect(saved).toBe("clay-court");

    // Reload page and verify persistence
    await page.reload();
    await expect(html).toHaveAttribute("data-palette", "clay-court");
    await expect(page.locator("#hub-palette-label")).toHaveText("Clay Court");
  });

  test("switching to bauhaus-primary, nordic-slate and verdant-lawn works cleanly", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator("#btn-palette-toggle");

    // Switch to bauhaus-primary
    await btn.click();
    await page.locator('.hub-palette-item[data-palette="bauhaus-primary"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-palette", "bauhaus-primary");

    // Switch to nordic-slate
    await btn.click();
    await page.locator('.hub-palette-item[data-palette="nordic-slate"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-palette", "nordic-slate");

    // Switch to verdant-lawn
    await btn.click();
    await page.locator('.hub-palette-item[data-palette="verdant-lawn"]').click();
    await expect(page.locator("html")).toHaveAttribute("data-palette", "verdant-lawn");
  });

  test("bauhaus view renders editorial and performance dual registers", async ({ page }) => {
    await page.goto("/#bauhaus");
    const bauhausView = page.locator("#view-bauhaus");
    await expect(bauhausView).toHaveCount(1);
    await expect(bauhausView).toHaveClass(/active/);

    // Editorial voice card
    const editorialCard = bauhausView.locator(".joy-voice-card--editorial");
    await expect(editorialCard).toHaveCount(1);
    await expect(editorialCard.locator(".joy-stat-card--editorial")).toBeVisible();
    await expect(editorialCard.locator(".joy-emblem")).toBeVisible();

    // Performance voice card
    const perfCard = bauhausView.locator(".joy-voice-card--performance");
    await expect(perfCard).toHaveCount(1);
    await expect(perfCard.locator(".joy-performance-figure")).toBeVisible();
    await expect(perfCard.locator(".joy-performance-bars")).toBeVisible();
    await expect(perfCard.locator(".joy-trend-line")).toBeVisible();
    await expect(perfCard.locator(".joy-mono-chip")).toHaveCount(4);
  });

  test("solid buttons meet WCAG 2.2 AA contrast (>= 4.5:1) across all 5 palettes in light and dark themes", async ({ page }) => {
    await page.goto("/#button");
    await expect(page.locator("#view-button")).toHaveClass(/active/);

    // Suppress CSS transitions so computed colors settle immediately
    await page.addStyleTag({
      content: "*, *::before, *::after { transition: none !important; animation: none !important; }"
    });

    const palettes = ["classic", "bauhaus-primary", "clay-court", "nordic-slate", "verdant-lawn"];
    const themes = ["light", "dark"];

    for (const palette of palettes) {
      for (const theme of themes) {
        await page.evaluate(({ p, t }) => {
          document.documentElement.setAttribute("data-theme", t);
          document.documentElement.setAttribute("data-palette", p);
        }, { p: palette, t: theme });

        const solidBtn = page.locator("#view-button #demo-btn");
        await expect(solidBtn).toBeVisible();

        const contrastData = await solidBtn.evaluate((el) => {
          const style = window.getComputedStyle(el);
          const fg = style.color;
          const bg = style.backgroundColor;

          function parseRgb(colorStr) {
            const m = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (!m) return [0, 0, 0];
            return [Number(m[1]), Number(m[2]), Number(m[3])];
          }
          function srgbToLinear(c) {
            const norm = c / 255;
            return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
          }
          function luminance(r, g, b) {
            return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
          }
          const rgb1 = parseRgb(fg);
          const rgb2 = parseRgb(bg);
          const l1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
          const l2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
          const lighter = Math.max(l1, l2);
          const darker = Math.min(l1, l2);
          const ratio = (lighter + 0.05) / (darker + 0.05);

          return { fg, bg, ratio };
        });

        expect(
          contrastData.ratio,
          `Preset "${palette}" (${theme}) button text contrast ${contrastData.ratio.toFixed(2)}:1 (${contrastData.fg} on ${contrastData.bg}) must be >= 4.5:1`
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  test("captures visual verification screenshots across all 5 palettes in light and dark themes", async ({ page }, testInfo) => {
    test.skip(
      !process.env.PALETTE_SCREENS || testInfo.project.name !== "desktop-chrome",
      "set PALETTE_SCREENS=1 to capture screenshots"
    );

    await page.goto("/#button");
    await expect(page.locator("#view-button")).toHaveClass(/active/);

    await page.addStyleTag({
      content: "*, *::before, *::after { transition: none !important; animation: none !important; }"
    });

    const outDir = process.env.SCREENSHOT_DIR || path.resolve(__dirname, "../dist/screenshots");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const palettes = ["classic", "bauhaus-primary", "clay-court", "nordic-slate", "verdant-lawn"];
    const themes = ["light", "dark"];

    for (const palette of palettes) {
      for (const theme of themes) {
        await page.evaluate(({ p, t }) => {
          document.documentElement.setAttribute("data-theme", t);
          document.documentElement.setAttribute("data-palette", p);
        }, { p: palette, t: theme });

        const canvas = page.locator("#button-canvas");
        await canvas.screenshot({
          path: path.join(outDir, `button-${palette}-${theme}.png`)
        });
      }
    }
  });
});
