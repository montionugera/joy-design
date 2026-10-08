import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir =
  process.env.F054_SCREENS_DIR ||
  path.resolve(__dirname, "../dist/screenshots");

async function safeScreenshot(locator: any, filename: string) {
  try {
    if (fs.existsSync(outDir)) {
      await locator.screenshot({ path: path.join(outDir, filename) });
    }
  } catch (err) {
    console.warn(`Could not save screenshot ${filename}:`, err);
  }
}

test.describe("Visual verification for F-054", () => {
  test.beforeAll(() => {
    try {
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
    } catch (err) {
      console.warn("Could not create screenshots directory:", err);
    }
  });

  test("1. Bauhaus Stream Live Tick button highlight has no red line", async ({ page }) => {
    await page.goto("/#charts");
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-palette", "bauhaus-primary");
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(200);

    const liveTickBtn = page.locator('button:has-text("Stream Live Tick")');
    await expect(liveTickBtn).toBeVisible();

    const highlightColorDark = await liveTickBtn.evaluate((el) => {
      return getComputedStyle(el).getPropertyValue("--joy-accent-highlight").trim();
    });
    console.log("Bauhaus button dark --joy-accent-highlight:", highlightColorDark);
    expect(highlightColorDark).not.toBe("#dc2626");
    expect(highlightColorDark).not.toBe("#b91c1c");
    expect(highlightColorDark).toBe("#60a5fa");

    await safeScreenshot(liveTickBtn, "button-stream-live-tick-dark.png");

    // Switch to light theme
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(200);

    const highlightColorLight = await liveTickBtn.evaluate((el) => {
      return getComputedStyle(el).getPropertyValue("--joy-accent-highlight").trim();
    });
    console.log("Bauhaus button light --joy-accent-highlight:", highlightColorLight);
    expect(highlightColorLight).not.toBe("#dc2626");
    expect(highlightColorLight).not.toBe("#b91c1c");
    expect(highlightColorLight).toBe("#60a5fa");

    await safeScreenshot(liveTickBtn, "button-stream-live-tick-light.png");
  });

  test("2. Sidebar nav has sleek themed scrollbar", async ({ page }, testInfo) => {
    if (testInfo.project.name === "mobile-chrome") {
      test.skip();
    }
    await page.goto("/design/#overview");
    const nav = page.locator(".nav");
    await expect(nav).toBeVisible();

    const scrollbarWidth = await nav.evaluate((el) => {
      return getComputedStyle(el).scrollbarWidth;
    });
    console.log("Nav scrollbarWidth:", scrollbarWidth);
    expect(scrollbarWidth).toBe("thin");

    await safeScreenshot(nav, "sidebar-nav-scrollbar.png");
  });

  test("3. Antigravity particles, 3D Wave Mesh, and Editorial Cover heroes with switcher", async ({ page }, testInfo) => {
    if (testInfo.project.name === "mobile-chrome") {
      test.skip();
    }
    await page.goto("/#landing-blocks");

    // Check switcher exists
    const switcher = page.locator(".landing-hero-options-wrapper");
    await expect(switcher).toBeVisible();

    // Option 1: Kinetic particles (Antigravity float)
    const kineticContainer = page.locator("#kinetic-hero-container");
    await expect(kineticContainer).toBeVisible();
    await page.waitForTimeout(600);
    await safeScreenshot(kineticContainer, "hero-antigravity-particles.png");

    // Option 2: 3D Wave Mesh
    const meshBtn = page.locator('#btn-hero-opt-mesh3d');
    await meshBtn.click();
    const meshContainer = page.locator("#mesh-hero-container");
    await expect(meshContainer).toBeVisible();
    const meshCanvas = page.locator("#mesh-3d-canvas");
    await expect(meshCanvas).toBeVisible();
    await page.waitForTimeout(600);
    await safeScreenshot(meshContainer, "hero-3d-wave-mesh.png");

    // Option 3: Editorial Cover
    const coverBtn = page.locator('#btn-hero-opt-editorial');
    await coverBtn.click();
    const coverContainer = page.locator("#editorial-cover-container");
    await expect(coverContainer).toBeVisible();
    await page.waitForTimeout(600);
    await safeScreenshot(coverContainer, "hero-editorial-cover.png");
  });
});
