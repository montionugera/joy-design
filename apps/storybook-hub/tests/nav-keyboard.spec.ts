import { test, expect } from "@playwright/test";

// F-044: sidebar nav items are real links, so keyboard users can reach every view.

test.describe("sidebar nav keyboard access", () => {
  test("every nav item links to an existing view panel", async ({ page }) => {
    await page.goto("/");
    const items = await page.locator(".sidebar .nav-item").evaluateAll((els) =>
      els.map((el) => ({
        href: el.getAttribute("href"),
        onclick: el.getAttribute("onclick"),
        view: el.getAttribute("data-view"),
      })),
    );
    expect(items.length).toBeGreaterThan(30);
    for (const item of items) {
      expect(item.onclick).toBeNull();
      expect(item.href).toBe(`#${item.view}`);
      await expect(page.locator(`#view-${item.view}`)).toHaveCount(1);
    }
  });

  test("clicking a nav item switches view and marks exactly one item current", async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== "desktop-chrome",
      "sidebar is a drawer on mobile",
    );
    await page.goto("/");
    await page.locator('.nav-item[data-view="tokens"]').click();
    await expect(page).toHaveURL(/#tokens$/);
    await expect(page.locator("#view-tokens")).toHaveClass(/active/);
    await expect(page.locator('.nav-item[aria-current="page"]')).toHaveCount(1);
    await expect(page.locator(".nav-item.active")).toHaveCount(1);
    await expect(page.locator('.nav-item[data-view="tokens"]')).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("Tab reaches a nav item and Enter opens its view", async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== "desktop-chrome",
      "sidebar is a drawer on mobile",
    );
    await page.goto("/");
    const target = page.locator('.nav-item[data-view="tokens"]');
    let reached = false;
    for (let i = 0; i < 80 && !reached; i++) {
      await page.keyboard.press("Tab");
      reached = await target.evaluate((el) => el === document.activeElement);
    }
    expect(reached).toBe(true);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#tokens$/);
    await expect(page.locator("#view-tokens")).toHaveClass(/active/);
  });

  test("open drawer focus trap cycles through nav items", async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== "mobile-chrome",
      "drawer only exists on mobile",
    );
    await page.goto("/");
    await page.locator(".mobile-menu-btn").click();
    await expect(page.locator(".sidebar")).toHaveClass(/open/);
    let navFocused = 0;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("Tab");
      if (
        await page.evaluate(() =>
          document.activeElement?.classList.contains("nav-item"),
        )
      )
        navFocused++;
    }
    expect(navFocused).toBeGreaterThan(0);
  });

  test("picking the already-open view still closes the drawer", async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== "mobile-chrome",
      "drawer only exists on mobile",
    );
    await page.goto("/#tokens");
    await page.locator(".mobile-menu-btn").click();
    await expect(page.locator(".sidebar")).toHaveClass(/open/);
    await page.locator('.nav-item[data-view="tokens"]').click();
    await expect(page.locator(".sidebar")).not.toHaveClass(/open/);
  });
});
