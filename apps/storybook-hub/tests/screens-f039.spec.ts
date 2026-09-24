import { expect, test, type Locator, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { settle } from "./helpers";

// F-039 C3: visual evidence for the landing suite (Wave 4). Gated by F039_SCREENS=1 so a normal run never rewrites the
// PNGs. Output: {name}-{light|dark}-{375x812|1280x800}.png in the F-039 research/screens folder; a shot taller than
// MAX_HEIGHT is split into {stem}-part1.png, -part2.png ... so a reviewer can open each file.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.resolve(
  __dirname,
  "../../../.claude/refined_backlog/F-039-wave-4-landing-suite-hero-and-cta-depth/research/screens",
);

// Per-file height cap (reviewer image budget). Chromium itself refuses screenshots taller than 16384px.
const MAX_HEIGHT = 8000;
const MAX_VIEWPORT = 16000;

const themes = ["light", "dark"] as const;
const viewports = [
  { width: 375, height: 812 },
  { width: 1280, height: 800 },
];

type View = "landing-preview" | "landing-blocks";

type Shot = {
  /** File stem, e.g. "landing-preview" -> landing-preview-dark-375x812.png */
  name: string;
  view: View;
  /** Viewport widths the shot exists for (default: both). */
  widths?: number[];
  /** Takes the screenshot; the page is already on `view` with the theme applied. */
  take: (page: Page, stem: string) => Promise<void>;
};

const fullView = (name: string, view: View): Shot => ({
  name,
  view,
  take: async (page, stem) => {
    await growViewportToContent(page);
    const stillScrolls = await page.evaluate(() => {
      const content = document.querySelector(".content-area")!;
      return content.scrollHeight > content.clientHeight + 1;
    });
    if (stillScrolls) await captureByScrolling(page, stem);
    else await captureParts(page, stem);
  },
});

const element = (
  name: string,
  view: View,
  locate: (page: Page) => Locator,
): Shot => ({
  name,
  view,
  take: (page, stem) => shootElement(page, locate(page), stem),
});

const blocksBox = (title: string) => (page: Page) =>
  page
    .locator("#view-landing-blocks .playground-box")
    .filter({ has: page.locator("h4", { hasText: title }) });

const shots: Shot[] = [
  fullView("landing-preview", "landing-preview"),
  fullView("landing-blocks", "landing-blocks"),
  element("landing-page-simulator", "landing-preview", (page) =>
    page.locator("#simulator-page-container"),
  ),
  {
    // The drawer only exists below 768px (the header menu button is hidden at 1280), so this shot is 375-only.
    name: "drawer-open",
    view: "landing-preview",
    widths: [375],
    take: async (page, stem) => {
      await page
        .locator("#simulator-page-container .joy-landing-header__menu")
        .click();
      await expect(
        page.locator("#landing-drawer-container .joy-drawer"),
      ).toBeVisible();
      await settle(page, "#landing-drawer-container");
      await page.screenshot({ path: `${stem}.png`, animations: "disabled" });
    },
  },
  element("hero-states", "landing-blocks", blocksBox("Hero states")),
  element("bento-matrix", "landing-blocks", blocksBox("Bento grid (BentoGrid")),
  element("pricing-cards", "landing-blocks", blocksBox("Pricing cards")),
  element(
    "pricing-comparison",
    "landing-blocks",
    blocksBox("Plan comparison table"),
  ),
];

/**
 * The hub scrolls inside .main / .content-area, so Playwright's fullPage capture only sees one viewport. Grow the
 * viewport until the hub's own scroller has no overflow left so the screenshot shows the whole view.
 */
async function growViewportToContent(page: Page) {
  for (let i = 0; i < 4; i++) {
    const { width, needed, current } = await page.evaluate(() => {
      const main = document.querySelector(".main")!;
      const content = document.querySelector(".content-area")!;
      return {
        width: window.innerWidth,
        current: window.innerHeight,
        needed: Math.ceil(
          Math.max(
            main.scrollHeight,
            content.scrollHeight + (main.clientHeight - content.clientHeight),
          ),
        ),
      };
    });
    const target = Math.min(MAX_VIEWPORT, Math.max(needed, current));
    if (target <= current) break;
    await page.setViewportSize({ width, height: target });
    await paint(page);
  }
  await page.evaluate(() => {
    document.querySelector(".main")!.scrollTop = 0;
    document.querySelector(".content-area")!.scrollTop = 0;
  });
}

/** Captures the (already grown) viewport as one PNG, or as -partN PNGs of at most MAX_HEIGHT px each. */
async function captureParts(page: Page, stem: string) {
  const { width, height } = page.viewportSize()!;
  if (height <= MAX_HEIGHT) {
    await page.screenshot({ path: `${stem}.png`, animations: "disabled" });
    return;
  }
  for (let i = 0, y = 0; y < height; i++, y += MAX_HEIGHT) {
    await page.screenshot({
      path: `${stem}-part${i + 1}.png`,
      animations: "disabled",
      clip: { x: 0, y, width, height: Math.min(MAX_HEIGHT, height - y) },
    });
  }
}

/**
 * Views taller than one Chromium screenshot allows (16384px): scroll the hub's own scroller in steps of one page and
 * capture the content area each step, at most MAX_HEIGHT tall. Parts abut; the last one holds only the remaining rows.
 */
async function captureByScrolling(page: Page, stem: string) {
  const { width } = page.viewportSize()!;
  await page.setViewportSize({ width, height: MAX_HEIGHT });
  await paint(page);
  const content = page.locator(".content-area");
  const { step, total } = await content.evaluate((el) => ({
    step: el.clientHeight,
    total: el.scrollHeight,
  }));
  const parts = Math.ceil(total / step);
  for (let i = 0; i < parts; i++) {
    await content.evaluate((el, top) => (el.scrollTop = top), i * step);
    await paint(page);
    const remainder = total - i * step;
    if (remainder >= step) {
      await content.screenshot({
        path: `${stem}-part${i + 1}.png`,
        animations: "disabled",
      });
      continue;
    }
    // Last part: scrollTop clamps at the end, so only the bottom `remainder` px of the content area are new.
    const box = (await content.boundingBox())!;
    await page.screenshot({
      path: `${stem}-part${i + 1}.png`,
      animations: "disabled",
      clip: {
        x: box.x,
        y: box.y + box.height - remainder,
        width: box.width,
        height: remainder,
      },
    });
  }
}

/** Viewport tall enough for the element, element scrolled into view, then captured (split when over the cap). */
async function shootElement(page: Page, target: Locator, stem: string) {
  await expect(target).toHaveCount(1);
  const { width, height } = page.viewportSize()!;
  const box = await target.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { height: r.height };
  });
  const needed = Math.min(MAX_VIEWPORT, Math.ceil(box.height) + 240);
  if (needed > height) {
    await page.setViewportSize({ width, height: needed });
    await paint(page);
  }
  await target.scrollIntoViewIfNeeded();
  const elementHeight = Math.ceil(box.height);
  if (elementHeight <= MAX_HEIGHT) {
    await target.screenshot({ path: `${stem}.png`, animations: "disabled" });
    return;
  }
  // Split: clip against the page coordinates of the element.
  const rect = await target.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y, width: r.width, height: r.height };
  });
  for (let i = 0, y = 0; y < rect.height; i++, y += MAX_HEIGHT) {
    await page.screenshot({
      path: `${stem}-part${i + 1}.png`,
      animations: "disabled",
      clip: {
        x: rect.x,
        y: rect.y + y,
        width: rect.width,
        height: Math.min(MAX_HEIGHT, rect.height - y),
      },
    });
  }
}

/** Repaints the hub's canvases (charts, images) after a resize or theme change. */
async function paint(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        window.redrawHubCharts?.();
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

test.describe("F-039 landing suite visual evidence", () => {
  for (const theme of themes) {
    for (const viewport of viewports) {
      for (const shot of shots) {
        if (shot.widths && !shot.widths.includes(viewport.width)) continue;
        const stem = `${shot.name}-${theme}-${viewport.width}x${viewport.height}`;
        test(stem, async ({ page }, testInfo) => {
          test.skip(
            process.env.F039_SCREENS !== "1" ||
              testInfo.project.name !== "desktop-chrome",
            "Set F039_SCREENS=1 to regenerate the Wave 4 evidence.",
          );

          fs.mkdirSync(screenshotsDir, { recursive: true });
          // Deterministic: no motion (the kinetic hero canvas and CSS transitions stand still), no toasts.
          await page.emulateMedia({ reducedMotion: "reduce" });
          await page.setViewportSize(viewport);
          await page.goto(`/#${shot.view}`);
          await page.waitForLoadState("networkidle");
          await page.evaluate(() => document.fonts.ready);
          await page.evaluate(
            (selected) =>
              document.documentElement.setAttribute("data-theme", selected),
            theme,
          );
          await expect(page.locator(`#view-${shot.view}`)).toHaveClass(
            /active/,
          );
          await settle(page);
          await paint(page);
          await shot.take(page, path.join(screenshotsDir, stem));
        });
      }
    }
  }
});
