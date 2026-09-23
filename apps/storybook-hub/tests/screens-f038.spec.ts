import { expect, test, type Locator, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  drawerContainer,
  openModal,
  openPopconfirmInModal,
  settle,
} from "./helpers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.resolve(
  __dirname,
  "../../../.claude/refined_backlog/F-038-wave-3-display-feedback-navigation-and-o/research/screens",
);

// Chromium refuses screenshots taller than 16384px.
const MAX_HEIGHT = 16000;

const themes = ["light", "dark"] as const;
const viewports = [
  { width: 375, height: 812 },
  { width: 1280, height: 800 },
];

type Shot = {
  /** File stem, e.g. "modal-open" -> modal-open-dark-375x812.png */
  name: string;
  /** Hub view (hash) the shot needs. */
  view: "data-display-feedback" | "navigation-workflow";
  /** Takes the screenshot; the page is already on `view` with theme applied. */
  take: (page: Page, file: string) => Promise<void>;
};

const view = (name: string, hash: Shot["view"]): Shot => ({
  name,
  view: hash,
  take: async (page, file) => {
    await growViewportToContent(page);
    await page.screenshot({ path: file, animations: "disabled" });
  },
});

const card = (name: string, hash: Shot["view"], selector: string): Shot => ({
  name,
  view: hash,
  take: (page, file) =>
    shootElement(page, page.locator(selector).first(), file),
});

const shots: Shot[] = [
  view("data-display-feedback", "data-display-feedback"),
  view("navigation-workflow", "navigation-workflow"),
  card("matrix-alert", "data-display-feedback", '[data-matrix-card="alert"]'),
  card("matrix-badge", "data-display-feedback", '[data-matrix-card="badge"]'),
  card("matrix-tag", "data-display-feedback", '[data-matrix-card="tag"]'),
  {
    name: "modal-open",
    view: "navigation-workflow",
    take: async (page, file) => {
      await openModal(page);
      await page.screenshot({ path: file, animations: "disabled" });
    },
  },
  {
    name: "modal-popconfirm-open",
    view: "navigation-workflow",
    take: async (page, file) => {
      await openModal(page);
      await openPopconfirmInModal(page);
      await page.screenshot({ path: file, animations: "disabled" });
    },
  },
  {
    name: "drawer-open",
    view: "navigation-workflow",
    take: async (page, file) => {
      await page.locator('[data-open="drawer"]').click();
      await expect(
        page.locator(`${drawerContainer} .joy-drawer`),
      ).toBeVisible();
      await settle(page, drawerContainer);
      await page.screenshot({ path: file, animations: "disabled" });
    },
  },
  {
    // Default = responsive-stack variant (first cell of the Table card).
    name: "table",
    view: "data-display-feedback",
    take: (page, file) =>
      shootElement(
        page,
        page
          .locator('[data-matrix="table"] .hub-matrix__cell')
          .filter({ hasText: "responsive stack" }),
        file,
      ),
  },
  {
    name: "table-scroll",
    view: "data-display-feedback",
    take: (page, file) =>
      shootElement(
        page,
        page
          .locator('[data-matrix="table"] .hub-matrix__cell')
          .filter({ hasText: "scroll variant" }),
        file,
      ),
  },
  card("chart", "data-display-feedback", '[data-matrix-card="chart"]'),
];

/**
 * The hub scrolls inside .main / .content-area, so Playwright's fullPage capture only sees
 * one viewport. Grow the viewport until the hub's own scroller has no overflow left, so the
 * screenshot shows the whole view.
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
    const target = Math.min(MAX_HEIGHT, Math.max(needed, current));
    if (target <= current) break;
    await page.setViewportSize({ width, height: target });
    await paint(page);
  }
  await page.evaluate(() => {
    document.querySelector(".main")!.scrollTop = 0;
    document.querySelector(".content-area")!.scrollTop = 0;
  });
}

/** Viewport tall enough for the element, element scrolled into view, then captured. */
async function shootElement(page: Page, target: Locator, file: string) {
  const { width, height } = page.viewportSize()!;
  const box = await target.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { height: r.height };
  });
  const needed = Math.min(MAX_HEIGHT, Math.ceil(box.height) + 240);
  if (needed > height) {
    await page.setViewportSize({ width, height: needed });
    await paint(page);
  }
  await target.scrollIntoViewIfNeeded();
  await target.screenshot({ path: file, animations: "disabled" });
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

test.describe("F-038 display, feedback, navigation and overlay visual evidence", () => {
  for (const theme of themes) {
    for (const viewport of viewports) {
      for (const shot of shots) {
        const file = `${shot.name}-${theme}-${viewport.width}x${viewport.height}.png`;
        test(file, async ({ page }, testInfo) => {
          test.skip(
            process.env.F038_SCREENS !== "1" ||
              testInfo.project.name !== "desktop-chrome",
            "Set F038_SCREENS=1 to regenerate the Wave 3 evidence.",
          );

          fs.mkdirSync(screenshotsDir, { recursive: true });
          await page.setViewportSize(viewport);
          await page.goto(`/#${shot.view}`);
          await page.waitForLoadState("networkidle");
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
          await shot.take(page, path.join(screenshotsDir, file));
        });
      }
    }
  }
});
