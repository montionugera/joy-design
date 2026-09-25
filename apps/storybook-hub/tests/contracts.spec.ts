import { test, expect, type Page } from "@playwright/test";
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
        expect(m.documentScrollWidth, `${where}: document`).toBeLessThanOrEqual(
          m.viewport,
        );
        expect(m.mainScrollWidth, `${where}: .main`).toBeLessThanOrEqual(
          m.mainClientWidth + 1,
        );
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

  test("Contract 5: kinetic hero is HeroSection over a token-palette canvas that honours motion, pointer and visibility", async ({
    browser,
  }, info) => {
    test.skip(
      info.project.name !== "desktop-chrome",
      "context options are set explicitly",
    );
    const baseURL = info.project.use.baseURL;
    const open = async (
      opts: Parameters<typeof browser.newContext>[0] = {},
    ) => {
      const context = await browser.newContext({
        baseURL,
        viewport: { width: 1280, height: 800 },
        ...opts,
      });
      const page = await context.newPage();
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("/#landing-blocks");
      await page.waitForLoadState("networkidle");
      await page.locator("#kinetic-hero-container").scrollIntoViewIfNeeded();
      if (!opts.hasTouch) {
        // The field paints once the hero is on screen (IntersectionObserver); wait for the first painted frame.
        await page.waitForFunction(() => {
          const c = document.getElementById(
            "kinetic-particle-canvas",
          ) as HTMLCanvasElement;
          if (!c.width || !c.height) return false;
          const data = c
            .getContext("2d")!
            .getImageData(0, 0, c.width, c.height).data;
          for (let i = 3; i < data.length; i += 4) if (data[i] > 0) return true;
          return false;
        });
      }
      return { context, page, errors };
    };
    const snapshot = (page: Page) =>
      page.evaluate(() =>
        (
          document.getElementById(
            "kinetic-particle-canvas",
          ) as HTMLCanvasElement
        ).toDataURL(),
      );

    // Default: the hero is the real component, the canvas animates in the theme's palette.
    const normal = await open();
    try {
      const { page } = normal;
      await expect(
        page.locator("#kinetic-hero-container .joy-hero .joy-hero__title"),
      ).toBeVisible();
      await expect(
        page.locator(
          "#kinetic-hero-container .joy-hero__ctas .joy-button--solid",
        ),
      ).toHaveCount(1);
      expect(
        await page
          .locator(
            '[class*="kinetic-title"], [class*="kinetic-overlay"], [class*="kinetic-badge"]',
          )
          .count(),
      ).toBe(0);
      for (const theme of ["light", "dark"] as const) {
        await setTheme(page, theme);
        const [palette, tokens] = await page.evaluate(() => {
          const cs = getComputedStyle(document.documentElement);
          const v = (n: string) => cs.getPropertyValue(n).trim();
          return [
            window.hubKineticPalette!(),
            {
              accents: [
                v("--joy-accent-default"),
                v("--joy-accent-hover"),
                v("--joy-accent-active"),
              ],
              muted: v("--joy-text-muted"),
            },
          ];
        });
        expect(palette, `palette ${theme}`).toEqual(tokens);
      }
      const a = await snapshot(page);
      await page.waitForTimeout(300);
      expect(await snapshot(page), "animates by default").not.toBe(a);
      // A hidden view schedules no animation frames.
      await page.evaluate(() => {
        const w = window as unknown as { __rafCount: number };
        w.__rafCount = 0;
        const raf = window.requestAnimationFrame.bind(window);
        window.requestAnimationFrame = (cb) => {
          w.__rafCount++;
          return raf(cb);
        };
      });
      await page.evaluate(() => (window.location.hash = "#button"));
      await expect(page.locator("#view-button")).toHaveClass(/active/);
      await page.waitForTimeout(200);
      const count = () =>
        page.evaluate(
          () => (window as unknown as { __rafCount: number }).__rafCount,
        );
      const before = await count();
      await page.waitForTimeout(500);
      expect(
        (await count()) - before,
        "no rAF loop while the hero is hidden",
      ).toBeLessThanOrEqual(1);
      expect(normal.errors).toEqual([]);
    } finally {
      await normal.context.close();
    }

    // Reduced motion: one still frame, nothing moves.
    const still = await open({ reducedMotion: "reduce" });
    try {
      const s1 = await snapshot(still.page);
      await still.page.waitForTimeout(400);
      expect(await snapshot(still.page), "static under reduced motion").toBe(
        s1,
      );
      expect(still.errors).toEqual([]);
    } finally {
      await still.context.close();
    }

    // Coarse pointer: a static gradient of the same hue instead of the canvas.
    const touch = await open({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 375, height: 812 },
    });
    try {
      const bg = await touch.page
        .locator("#kinetic-hero-container")
        .evaluate((el) => getComputedStyle(el).backgroundImage);
      expect(bg, "coarse pointer gets a gradient").toContain("gradient(");
      await expect(touch.page.locator("#kinetic-particle-canvas")).toBeHidden();
      expect(touch.errors).toEqual([]);
    } finally {
      await touch.context.close();
    }
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

test("Contract 9b: the hub's market filter is 16px on phones so iOS does not zoom on focus", async ({ page }, info) => {
  test.skip(info.project.name !== "desktop-chrome", "viewports are set explicitly");
  for (const [width, min] of [
    [375, 16],
    [1280, 12],
  ] as const) {
    await page.goto("about:blank");
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/#financial-table");
    await page.waitForLoadState("networkidle");
    const input = page.locator("#market-search-input");
    await expect(input).toBeVisible();
    const size = await input.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(size, `font-size at ${width}`).toBeGreaterThanOrEqual(min);
    const box = (await input.boundingBox())!;
    expect(box.x + box.width, `fits at ${width}`).toBeLessThanOrEqual(width);
  }
});

test.describe("Contract 6: every manifest view at 375 and 1280, light and dark", () => {
  test.beforeEach(({}, info) => {
    test.skip(
      info.project.name !== "desktop-chrome",
      "viewports are set explicitly",
    );
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
          expect(
            m.documentScrollWidth,
            `${where}: document`,
          ).toBeLessThanOrEqual(m.viewport);
          expect(m.mainScrollWidth, `${where}: .main`).toBeLessThanOrEqual(
            m.mainClientWidth + 1,
          );
          expect(m.beyond, `${where}: elements past the viewport`).toEqual([]);
          expect(m.cut, `${where}: content cut off past the viewport`).toEqual(
            [],
          );
          expect(m.textClip, `${where}: background-clip text`).toEqual([]);
          await page.screenshot({
            path: info.outputPath(`${view}-${theme}-${vp.width}.png`),
            animations: "disabled",
          });
        }
      }
    });
  }
});
