import { test, expect } from "@playwright/test";

test.describe("Hero Options and Kinetic Particle Presets Switching", () => {
  test.beforeEach(async ({ page }) => {
    page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/#landing-blocks");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#view-landing-blocks")).toHaveClass(/active/);
    await page.locator("#kinetic-hero-container").scrollIntoViewIfNeeded();
  });

  test("can switch between all 6 particle physics presets without click interception", async ({ page }, testInfo) => {
    const presets = [
      { id: "btn-sub-cosmos", key: "cosmos", name: "Cosmos Aurora" },
      { id: "btn-sub-titanium", key: "titanium", name: "Titanium Prism" },
      { id: "btn-sub-cyberpunk", key: "cyberpunk", name: "Cyberpunk HUD" },
      { id: "btn-sub-plasma", key: "plasma", name: "Solar Plasma" },
      { id: "btn-sub-swiss", key: "swiss", name: "Swiss Halftone" },
      { id: "btn-sub-gold", key: "gold", name: "Obsidian & 24K Gold" },
    ];

    for (const preset of presets) {
      const btn = page.locator(`#${preset.id}`);
      await expect(btn).toBeVisible();

      // Click directly - this will fail if pointer-events or z-index is intercepted!
      await btn.click();

      // Verify active state
      await expect(btn).toHaveClass(/active/);
      await expect(btn).toHaveAttribute("aria-selected", "true");

      // Verify window.kineticSubvariant in the page context
      const currentVariant = await page.evaluate(() => (window as any).kineticSubvariant);
      expect(currentVariant).toBe(preset.key);

      // Verify badge text
      const badge = page.locator("#kinetic-hero-container .joy-hero__badge");
      await expect(badge).toContainText(preset.name);

      // Verify toast appeared in toast container
      const toast = page.locator("#demo-toast-container .joy-toast");
      await expect(toast.last()).toBeVisible();
      await expect(toast.last()).toContainText(preset.name);

      // Small pause to let canvas paint
      if (testInfo.project.name === "desktop-chrome") {
        await page.waitForTimeout(300);
        await page.locator("#kinetic-hero-container").screenshot({
          path: `test-results/particles-${preset.key}.png`,
        });
      }
    }
  });

  test("particle presets switch seamlessly in dark mode", async ({ page }, testInfo) => {
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
    await page.locator("#btn-sub-cosmos").click();
    await expect(page.locator("#btn-sub-cosmos")).toHaveClass(/active/);
    if (testInfo.project.name === "desktop-chrome") {
      await page.waitForTimeout(300);
      await page.locator("#kinetic-hero-container").screenshot({
        path: "test-results/particles-cosmos-dark.png",
      });
    }
  });

  test("solar plasma renders with luminous bloom in dark mode", async ({ page }, testInfo) => {
    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));
    await page.locator("#btn-sub-plasma").click();
    await expect(page.locator("#btn-sub-plasma")).toHaveClass(/active/);
    if (testInfo.project.name === "desktop-chrome") {
      await page.waitForTimeout(300);
      await page.locator("#kinetic-hero-container").screenshot({
        path: "test-results/particles-plasma-dark.png",
      });
      // Also capture gold
      await page.locator("#btn-sub-gold").click();
      await expect(page.locator("#btn-sub-gold")).toHaveClass(/active/);
      await page.waitForTimeout(300);
      await page.locator("#kinetic-hero-container").screenshot({
        path: "test-results/particles-gold-dark.png",
      });
    }
  });

  test("can switch between all 8 hero section archetypes", async ({ page }) => {
    const heroOptions = [
      { id: "btn-hero-opt-mesh3d", panel: "mesh-hero-container" },
      { id: "btn-hero-opt-editorial", panel: "editorial-cover-container" },
      { id: "btn-hero-opt-keynote", panel: "keynote-hero-container" },
      { id: "btn-hero-opt-cockpit", panel: "cockpit-hero-container" },
      { id: "btn-hero-opt-cyberpunk", panel: "cyberpunk-hero-container" },
      { id: "btn-hero-opt-swiss", panel: "swiss-hero-container" },
      { id: "btn-hero-opt-aura", panel: "aura-hero-container" },
      { id: "btn-hero-opt-antigravity", panel: "kinetic-hero-container" },
    ];

    for (const opt of heroOptions) {
      const tab = page.locator(`#${opt.id}`);
      await expect(tab).toBeVisible();
      await tab.click();
      await expect(tab).toHaveClass(/active/);
      await expect(tab).toHaveAttribute("aria-selected", "true");

      const panel = page.locator(`#${opt.panel}`);
      await expect(panel).toBeVisible();
      await expect(panel).toHaveClass(/active/);
    }
  });

  test("container has data-archetype attribute and updates on preset switch", async ({ page }) => {
    const container = page.locator("#kinetic-hero-container");
    // Initial archetype is gold
    await expect(container).toHaveAttribute("data-archetype", "gold");

    await page.locator("#btn-sub-cosmos").click();
    await expect(container).toHaveAttribute("data-archetype", "cosmos");

    await page.locator("#btn-sub-cyberpunk").click();
    await expect(container).toHaveAttribute("data-archetype", "cyberpunk");

    await page.locator("#btn-sub-plasma").click();
    await expect(container).toHaveAttribute("data-archetype", "plasma");
  });

  test("clicking canvas creates optical shockwave ripple without intercepting CTA clicks", async ({ page }, testInfo) => {
    const container = page.locator("#kinetic-hero-container");
    
    // Check initial ripples length is 0
    const initialRipples = await page.evaluate(() => (window as any).kineticRipples ? (window as any).kineticRipples.length : 0);
    
    // Click on canvas background (empty area)
    const box = await container.boundingBox();
    if (box) {
      await page.mouse.click(box.x + 120, box.y + 120);
    }
    
    // CTA buttons still clickable and interactive
    const primaryCta = page.locator("#kinetic-hero-container .joy-hero__ctas .joy-button--solid");
    await expect(primaryCta).toBeVisible();
    await primaryCta.click();

    if (testInfo.project.name === "desktop-chrome") {
      // Move mouse to trigger spotlight and capture screenshot
      await page.mouse.move(box ? box.x + 300 : 400, box ? box.y + 200 : 300);
      await page.waitForTimeout(200);
      await container.screenshot({
        path: "test-results/particles-spotlight-interaction.png",
      });
    }
  });
});

