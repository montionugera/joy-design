import { test, expect } from "@playwright/test";

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
});
