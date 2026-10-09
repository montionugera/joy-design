import { test, expect } from "@playwright/test";

test.describe("Storybook Hub Tri-Framework Switcher & Flutter Integration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#button");
    await page.waitForSelector("#view-button", { state: "visible" });
  });

  test("renders accessible 3-way framework toggle: Svelte 5, React 19, and Flutter 3.32", async ({ page, isMobile }) => {
    let pill = page.locator(".framework-pill--topbar");
    if (isMobile) {
      await page.locator("#mobile-menu-toggle").click();
      pill = page.locator(".framework-pill--drawer");
    }
    await expect(pill).toBeVisible();

    const svelteBtn = pill.locator('[data-framework="svelte"]');
    const reactBtn = pill.locator('[data-framework="react"]');
    const flutterBtn = pill.locator('[data-framework="flutter"]');

    await expect(svelteBtn).toBeVisible();
    await expect(reactBtn).toBeVisible();
    await expect(flutterBtn).toBeVisible();

    await expect(svelteBtn).toHaveText("Svelte 5");
    await expect(reactBtn).toHaveText("React 19");
    await expect(flutterBtn).toHaveText("Flutter 3.32");

    // Svelte 5 is active by default
    await expect(svelteBtn).toHaveAttribute("aria-pressed", "true");
    await expect(reactBtn).toHaveAttribute("aria-pressed", "false");
    await expect(flutterBtn).toHaveAttribute("aria-pressed", "false");
  });

  test("switching frameworks updates active button state and synchronizes code snippet", async ({ page, isMobile }) => {
    let pill = page.locator(".framework-pill--topbar");
    if (isMobile) {
      await page.locator("#mobile-menu-toggle").click();
      pill = page.locator(".framework-pill--drawer");
    }
    const svelteBtn = pill.locator('[data-framework="svelte"]');
    const reactBtn = pill.locator('[data-framework="react"]');
    const flutterBtn = pill.locator('[data-framework="flutter"]');
    const snippet = page.locator("#button-code");

    // 1. Initial Svelte 5
    await expect(snippet).toContainText("@montionugera/joy-svelte");

    // 2. Switch to React 19
    await reactBtn.click();
    await expect(reactBtn).toHaveAttribute("aria-pressed", "true");
    await expect(svelteBtn).toHaveAttribute("aria-pressed", "false");
    await expect(snippet).toContainText("@montionugera/joy-react");
    await expect(snippet).toContainText("onClick");

    // 3. Switch to Flutter 3.32
    await flutterBtn.click();
    await expect(flutterBtn).toHaveAttribute("aria-pressed", "true");
    await expect(reactBtn).toHaveAttribute("aria-pressed", "false");
    await expect(snippet).toContainText("package:joymify_flutter/joymify_flutter.dart");
    await expect(snippet).toContainText("JoyButton(");
    await expect(snippet).toContainText("onPressed");

    // 4. Switch back to Svelte 5
    await svelteBtn.click();
    await expect(svelteBtn).toHaveAttribute("aria-pressed", "true");
    await expect(snippet).toContainText("@montionugera/joy-svelte");
  });

  test("navigating to /#flutter mounts Flutter 3.32 showcase view without layout error", async ({ page }) => {
    await page.goto("/#flutter");
    const flutterView = page.locator("#view-flutter");
    await expect(flutterView).toBeVisible();
    await expect(flutterView).toHaveClass(/active/);

    // Verify title and badges
    await expect(flutterView.locator("h2")).toHaveText("Flutter 3.32 Multi-Platform Workshop");
    await expect(flutterView).toContainText("Dart 3.8.1");
    await expect(flutterView).toContainText("35+ Widgets");

    // Verify iframe container is mounted
    const iframe = page.locator("#flutter-hub-iframe");
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute("src", "/flutter/index.html");
  });

  test("toggling light and dark theme synchronizes data-theme state", async ({ page }) => {
    await page.goto("/#flutter");
    const themeBtn = page.locator("#btn-theme-toggle");

    // Switch to dark theme
    await themeBtn.click();
    const darkTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(darkTheme).toBe("dark");

    // Switch back to light theme
    await themeBtn.click();
    const lightTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(lightTheme).toBe("light");
  });
});
