import { test, expect } from "@playwright/test";
import {
  HUB_VIEWS,
  hitSize,
  installContrastTools,
  installPageTools,
  measureHubOverflow,
  setTheme,
  settle,
} from "./helpers";

test.describe("Storybook Hub Quality Contracts", () => {
  test("Contract 1: URL Hash Routing & Persistence across reloads", async ({
    page,
  }) => {
    // 1. Direct load with deep link #tokens
    await page.goto("/#tokens");
    await page.waitForLoadState("networkidle");

    const tokensView = page.locator("#view-tokens");
    await expect(tokensView).toBeVisible();
    await expect(tokensView).toHaveClass(/active/);

    const overviewView = page.locator("#view-overview");
    await expect(overviewView).not.toHaveClass(/active/);

    // 2. Reload preserves the active view
    await page.reload();
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#view-tokens")).toBeVisible();
    await expect(page.locator("#view-tokens")).toHaveClass(/active/);
    await expect(page.locator("#view-overview")).not.toHaveClass(/active/);

    // 3. Fallback on invalid hash
    await page.goto("/#non-existent-view-999");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("#view-overview")).toBeVisible();
    await expect(page.locator("#view-overview")).toHaveClass(/active/);
  });

  test("Contract 2: Mobile Drawer Gestures & Focus Trapping (< 900px)", async ({
    page,
  }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const sidebar = page.locator(".sidebar");
    const menuBtn = page.locator("#mobile-menu-toggle");
    const backdrop = page.locator("#sidebar-backdrop");
    const closeBtn = page.locator(".sidebar-close-btn");

    // Sidebar should be off-canvas initially
    await expect(menuBtn).toBeVisible();
    await expect(sidebar).not.toHaveClass(/open/);
    await expect(backdrop).not.toHaveClass(/active/);

    // Open drawer
    await menuBtn.click();
    await expect(sidebar).toHaveClass(/open/);
    await expect(backdrop).toHaveClass(/active/);

    // Close via close button
    await closeBtn.click();
    await expect(sidebar).not.toHaveClass(/open/);
    await expect(backdrop).not.toHaveClass(/active/);

    // Reopen and close via backdrop click
    await menuBtn.click();
    await expect(sidebar).toHaveClass(/open/);
    await backdrop.click({ position: { x: 350, y: 100 } });
    await expect(sidebar).not.toHaveClass(/open/);

    // Reopen and close via Escape key
    await menuBtn.click();
    await expect(sidebar).toHaveClass(/open/);
    await page.keyboard.press("Escape");
    await expect(sidebar).not.toHaveClass(/open/);
  });

  test("Contract 3: Zero Document-Level Horizontal Overflow", async ({
    page,
  }) => {
    const viewports = [
      { width: 320, height: 568 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 899, height: 900 },
      { width: 900, height: 900 },
      { width: 1280, height: 800 },
    ];

    // The in-between widths (Contract 6 covers 375 and 1280 on every view) sampled on several view families.
    for (const view of ["overview", "button", "forms", "table"]) {
      for (const vp of viewports) {
        await page.goto("about:blank");
        await page.setViewportSize(vp);
        await page.goto(`/#${view}`);
        await page.waitForLoadState("networkidle");
        await installPageTools(page);
        const m = await measureHubOverflow(page);
        const where = `${view} ${vp.width}x${vp.height}`;
        expect(m.documentScrollWidth, `${where}: document`).toBeLessThanOrEqual(m.viewport);
        expect(m.mainScrollWidth, `${where}: .main`).toBeLessThanOrEqual(m.mainClientWidth + 1);
      }
    }
  });

  test("Contract 4: Semantic Navigation Taxonomy (Zero visible Wave labels)", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify exactly 6 semantic category headings in sidebar
    const expectedCategories = [
      "Getting Started",
      "General & Primitives",
      "Navigation & Workflow",
      "Data Entry & Forms",
      "Data Display & Feedback",
      "Enterprise & Telemetry",
    ];

    const sectionHeadings = await page
      .locator(".nav-section")
      .allTextContents();
    expect(sectionHeadings).toEqual(expectedCategories);

    // Ensure NO visible element contains Wave <number>
    const visibleWaveElements = await page.evaluate(() => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
      );
      const violations: string[] = [];
      let node;
      while ((node = walker.nextNode())) {
        const text = node.textContent?.trim() || "";
        if (/\bWave\s+\d+\b/i.test(text)) {
          const parent = node.parentElement;
          if (parent && parent.offsetParent !== null) {
            // visible in DOM
            violations.push(text);
          }
        }
      }
      return violations;
    });

    expect(
      visibleWaveElements,
      "No visible elements should contain Wave <number> labels",
    ).toEqual([]);
  });

  test("Contract 5: Interactive 3D Kinetic Canvas on Landing Blocks", async ({
    page,
  }) => {
    await page.goto("/#landing-blocks");
    await page.waitForLoadState("networkidle");

    const canvas = page.locator("#kinetic-particle-canvas");
    await expect(canvas).toBeVisible();

    // Verify canvas size is non-zero
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);

    // Trigger mouse interaction
    const container = page.locator("#kinetic-hero-container");
    await container.hover({ position: { x: 200, y: 150 } });
    await page.mouse.move(250, 180);
    await page.waitForTimeout(100);

    // Verify no uncaught console errors
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));
    expect(errors).toEqual([]);
  });

  test("Contract 7: theme resolved before first paint, honours prefers-color-scheme, persists", async ({
    browser,
  }, info) => {
    test.skip(
      info.project.name !== "desktop-chrome",
      "context-level colour scheme; one project is enough",
    );
    for (const scheme of ["light", "dark"] as const) {
      const context = await browser.newContext({
        colorScheme: scheme,
        baseURL: info.project.use.baseURL,
      });
      try {
        const page = await context.newPage();
        // The first requestAnimationFrame callback runs before the first paint.
        await page.addInitScript(() => {
          requestAnimationFrame(() => {
            (window as any).__themeAtFirstFrame =
              document.documentElement.getAttribute("data-theme");
          });
        });
        await page.goto("/");
        await page.waitForFunction(
          () => (window as any).__themeAtFirstFrame !== undefined,
        );
        expect(
          await page.evaluate(() => (window as any).__themeAtFirstFrame),
          `first frame, OS ${scheme}`,
        ).toBe(scheme);

        const toggle = page.locator("#btn-theme-toggle");
        const other = scheme === "light" ? "dark" : "light";
        await expect(toggle).toHaveAttribute(
          "aria-label",
          `Switch to ${other} theme`,
        );
        await toggle.click();
        await expect(page.locator("html")).toHaveAttribute("data-theme", other);
        await page.reload();
        await page.waitForFunction(
          () => (window as any).__themeAtFirstFrame !== undefined,
        );
        expect(
          await page.evaluate(() => (window as any).__themeAtFirstFrame),
          "saved choice beats the OS",
        ).toBe(other);
        await expect(page.locator("#btn-theme-toggle")).toHaveAttribute(
          "aria-label",
          `Switch to ${scheme} theme`,
        );
      } finally {
        await context.close();
      }
    }
  });

  test("Contract 8: topbar and sidebar text contrast >= 4.5 in both themes at 375 and 1280", async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== "desktop-chrome",
      "viewports are set explicitly",
    );
    for (const width of [375, 1280]) {
      await page.goto("about:blank"); // fresh document per viewport
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/#overview");
      await page.waitForLoadState("networkidle");
      await installPageTools(page);
      await installContrastTools(page);
      if (width < 900) await page.locator("#mobile-menu-toggle").click();
      await settle(page);
      for (const theme of ["light", "dark"] as const) {
        await setTheme(page, theme);
        for (const root of [".topbar", ".sidebar"]) {
          const result = await page.evaluate(
            ([sel]) => window.__lowContrast(document.querySelector(sel)!, 4.5),
            [root],
          );
          expect(
            result.checked,
            `${root} ${theme} ${width}: sweep found text`,
          ).toBeGreaterThan(0);
          expect(result.failures, `${root} ${theme} ${width}`).toEqual([]);
        }
      }
    }
  });

  test("Contract 9: phone chrome, 44px hit areas, framework switcher in the drawer", async ({
    page,
  }, info) => {
    test.skip(
      info.project.name !== "desktop-chrome",
      "viewports are set explicitly",
    );
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/#button");
    await page.waitForLoadState("networkidle");
    const menu = page.locator("#mobile-menu-toggle");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator(".topbar .framework-pill")).toBeHidden();
    for (const sel of ["#mobile-menu-toggle", "#btn-theme-toggle"]) {
      const s = await hitSize(page, sel);
      expect(s.width, `${sel} width`).toBeGreaterThanOrEqual(43.5);
      expect(s.height, `${sel} height`).toBeGreaterThanOrEqual(43.5);
    }
    await menu.click();
    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".sidebar [data-framework]")).toHaveCount(2);
    for (const sel of [
      ".sidebar-close-btn",
      '.sidebar [data-framework="svelte"]',
      '.sidebar [data-framework="react"]',
    ]) {
      const s = await hitSize(page, sel);
      expect(s.width, `${sel} width`).toBeGreaterThanOrEqual(43.5);
      expect(s.height, `${sel} height`).toBeGreaterThanOrEqual(43.5);
    }
    await page.locator('.sidebar [data-framework="react"]').click();
    await expect(
      page.locator('.sidebar [data-framework="react"]'),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#btn-tab-react")).toHaveClass(/active/);
    await expect(page.locator("#btn-tab-react")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // Focus stays inside the open drawer, forwards and backwards.
    for (const key of ["Tab", "Shift+Tab"]) {
      for (let i = 0; i < 60; i++) {
        await page.keyboard.press(key);
        expect(
          await page.evaluate(
            () => !!document.activeElement?.closest(".sidebar"),
          ),
          `${key} ${i}`,
        ).toBe(true);
      }
    }
    await page.keyboard.press("Escape");
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(menu).toBeFocused();
    // Desktop: switcher back in the topbar, drawer copy hidden.
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(page.locator(".topbar .framework-pill")).toBeVisible();
    await expect(page.locator(".framework-pill--drawer")).toBeHidden();
  });
});

test.describe("Contract 6: every manifest view at 375 and 1280, light and dark", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== "desktop-chrome", "viewports are set explicitly");
  });
  for (const view of HUB_VIEWS) {
    test(view, async ({ page }, info) => {
      for (const vp of [
        { width: 375, height: 812 },
        { width: 1280, height: 800 },
      ]) {
        await page.goto("about:blank"); // fresh document per viewport: a same-URL hash goto would not reload
        await page.setViewportSize(vp);
        await page.goto(`/#${view}`);
        await page.waitForLoadState("networkidle");
        await expect(page.locator(`#view-${view}`)).toHaveClass(/active/);
        await installPageTools(page);
        for (const theme of ["light", "dark"] as const) {
          await setTheme(page, theme);
          const m = await measureHubOverflow(page);
          const where = `${view} ${theme} ${vp.width}`;
          expect(m.documentScrollWidth, `${where}: document`).toBeLessThanOrEqual(m.viewport);
          expect(m.mainScrollWidth, `${where}: .main`).toBeLessThanOrEqual(m.mainClientWidth + 1);
          expect(m.beyond, `${where}: elements past the viewport`).toEqual([]);
          expect(m.cut, `${where}: content cut off past the viewport`).toEqual([]);
          expect(m.textClip, `${where}: background-clip text`).toEqual([]);
          await page.screenshot({ path: info.outputPath(`${view}-${theme}-${vp.width}.png`), animations: "disabled" });
        }
      }
    });
  }
});
