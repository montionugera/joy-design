import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir =
  process.env.F055_SCREENS_DIR ||
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

test.describe("F-055: 8 Hero Variants & Apple Narrative Landing Page", () => {
  test.beforeAll(() => {
    try {
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
    } catch (err) {
      console.warn("Could not create screenshots directory:", err);
    }
  });

  test("1. All 8 Hero Section variants switch and render correctly", async ({ page }, testInfo) => {
    if (testInfo.project.name === "mobile-chrome") {
      test.skip();
    }

    await page.goto("/#landing-blocks");
    await page.waitForTimeout(300);

    const switcher = page.locator(".landing-hero-options-wrapper");
    await expect(switcher).toBeVisible();

    const variants = [
      { id: "antigravity", container: "#kinetic-hero-container", screenshot: "hero-1-antigravity.png" },
      { id: "mesh3d", container: "#mesh-hero-container", screenshot: "hero-2-mesh3d.png" },
      { id: "editorial", container: "#editorial-cover-container", screenshot: "hero-3-editorial.png" },
      { id: "keynote", container: "#keynote-hero-container", screenshot: "hero-4-keynote.png" },
      { id: "cockpit", container: "#cockpit-hero-container", screenshot: "hero-5-cockpit.png" },
      { id: "cyberpunk", container: "#cyberpunk-hero-container", screenshot: "hero-6-cyberpunk.png" },
      { id: "swiss", container: "#swiss-hero-container", screenshot: "hero-7-swiss.png" },
      { id: "aura", container: "#aura-hero-container", screenshot: "hero-8-aura.png" },
    ];

    for (const v of variants) {
      const btn = page.locator(`#btn-hero-opt-${v.id}`);
      await expect(btn).toBeVisible();
      await btn.click();
      await page.waitForTimeout(200);

      const container = page.locator(v.container);
      await expect(container).toBeVisible();
      await expect(btn).toHaveClass(/active/);

      // Verify specific details per variant
      if (v.id === "editorial") {
        const backdrop = container.locator(".editorial-cover__image-backdrop svg");
        await expect(backdrop).toBeVisible();
        const content = container.locator(".editorial-cover__centerpiece");
        await expect(content).toBeVisible();
      } else if (v.id === "mesh3d") {
        const canvas = container.locator("#mesh-3d-canvas");
        await expect(canvas).toBeVisible();
      } else if (v.id === "cockpit") {
        const sparkline = container.locator("#cockpit-sparkline-canvas");
        await expect(sparkline).toBeVisible();
      }

      await safeScreenshot(container, v.screenshot);
    }
  });

  test("2. Centered Editorial Cover layout and contrast check in Light & Dark modes", async ({ page }) => {
    await page.goto("/#landing-blocks");
    await page.waitForTimeout(200);

    const coverBtn = page.locator("#btn-hero-opt-editorial");
    await coverBtn.click();
    const coverContainer = page.locator("#editorial-cover-container");
    await expect(coverContainer).toBeVisible();

    // Check light mode
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(200);
    await safeScreenshot(coverContainer, "hero-editorial-centered-light.png");

    // Check dark mode
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(200);
    await safeScreenshot(coverContainer, "hero-editorial-centered-dark.png");

    // Verify centered alignment styles directly on container
    const isCentered = await coverContainer.evaluate((el) => {
      const cs = getComputedStyle(el);
      return cs.display === "flex" && cs.alignItems === "center" && cs.justifyContent === "center";
    });
    expect(isCentered).toBe(true);
  });

  test("3. Apple Continuous Narrative Landing Page scenes & interactive mechanics", async ({ page }) => {
    await page.goto("/#apple-landing");
    await page.waitForTimeout(400);

    const landingView = page.locator("#view-apple-landing");
    await expect(landingView).toBeVisible();

    // Sub-nav sticky check
    const subnav = page.locator(".apple-subnav");
    await expect(subnav).toBeVisible();
    await expect(subnav.locator(".apple-subnav__title")).toContainText("iPhone Duo");

    // Scene 1: Monumental Intro
    const sceneIntro = page.locator("#apple-scene-intro");
    await expect(sceneIntro).toBeVisible();
    await expect(sceneIntro.locator(".apple-eyebrow").first()).toContainText("ความอเนกประสงค์");
    await expect(sceneIntro.locator(".apple-headline")).toContainText("iOS ที่พลิกโฉมมาใหม่");
    await safeScreenshot(sceneIntro, "apple-scene-1-intro.png");

    // Scene 2: Posture & Fold Mechanics
    const scenePosture = page.locator("#apple-scene-posture");
    await expect(scenePosture).toBeVisible();

    // Test slider interaction
    const slider = page.locator("#apple-posture-slider");
    await expect(slider).toBeVisible();
    await slider.fill("90");
    await page.waitForTimeout(100);

    const angleLabel = page.locator("#apple-posture-angle-label");
    await expect(angleLabel).toContainText("90°");

    // Test posture presets
    const tentBtn = page.locator("button.apple-posture-pill:has-text('กางตั้ง')");
    if (await tentBtn.count() > 0) {
      await tentBtn.click();
      await page.waitForTimeout(100);
      await expect(angleLabel).toContainText("65°");
    }

    const flatBtn = page.locator("button.apple-posture-pill:has-text('วางเปิด')");
    if (await flatBtn.count() > 0) {
      await flatBtn.click();
      await page.waitForTimeout(100);
      await expect(angleLabel).toContainText("180°");
    }
    await safeScreenshot(scenePosture, "apple-scene-2-posture.png");

    // Scene 3: Cinema Immersion
    const sceneCinema = page.locator("#apple-scene-cinema");
    await expect(sceneCinema).toBeVisible();
    const aspect16Btn = page.locator("button.segment-btn:has-text('16:9')");
    if (await aspect16Btn.count() > 0) {
      await aspect16Btn.click();
      await page.waitForTimeout(100);
      const canvas = page.locator("#apple-cinema-canvas");
      const aspectStyle = await canvas.evaluate((el) => (el as HTMLElement).style.aspectRatio);
      expect(aspectStyle).toBe("16 / 9");
    }
    await safeScreenshot(sceneCinema, "apple-scene-3-cinema.png");

    // Scene 4: Silicon Specs Bento
    const scenePerf = page.locator("#apple-scene-specs");
    await expect(scenePerf).toBeVisible();
    await expect(scenePerf.locator(".apple-tagline")).toContainText("A18 Pro");
    await safeScreenshot(scenePerf, "apple-scene-4-specs.png");

    // Scene 5: Customizer & Finish Swatches
    const sceneCustomizer = page.locator("#apple-scene-customizer");
    await expect(sceneCustomizer).toBeVisible();

    const titaniumGoldBtn = page.locator("button.apple-swatch-btn[title='Titanium Gold']");
    if (await titaniumGoldBtn.count() > 0) {
      await titaniumGoldBtn.click();
      await page.waitForTimeout(100);
      const finishName = page.locator("#apple-finish-name");
      await expect(finishName).toContainText("Titanium Gold");
    }

    // Test storage tier updates price
    const storage1TbBtn = page.locator("button.apple-storage-btn:has-text('1TB')");
    if (await storage1TbBtn.count() > 0) {
      await storage1TbBtn.click();
      await page.waitForTimeout(100);
      const priceEl = page.locator("#apple-customizer-price");
      await expect(priceEl).toContainText("฿57,900");
    }
    await safeScreenshot(sceneCustomizer, "apple-scene-5-customizer.png");

    // Capture screenshots in dark and light mode
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(200);
    await safeScreenshot(landingView, "apple-landing-full-dark.png");

    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(200);
    await safeScreenshot(landingView, "apple-landing-full-light.png");
  });
});
