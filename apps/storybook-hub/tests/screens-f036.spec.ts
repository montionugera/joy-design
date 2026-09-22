import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.resolve(
  __dirname,
  "../../../.claude/refined_backlog/F-036-wave-1-semantic-token-foundation-light-d/research/screens",
);

const screenshots = [
  {
    name: "primitives-light-375x812.png",
    theme: "light",
    viewport: { width: 375, height: 812 },
  },
  {
    name: "primitives-dark-375x812.png",
    theme: "dark",
    viewport: { width: 375, height: 812 },
  },
  {
    name: "primitives-light-1280x800.png",
    theme: "light",
    viewport: { width: 1280, height: 800 },
  },
  {
    name: "primitives-dark-1280x800.png",
    theme: "dark",
    viewport: { width: 1280, height: 800 },
  },
] as const;

test.describe("F-036 General & Primitives visual evidence", () => {
  for (const screenshot of screenshots) {
    test(`${screenshot.theme} ${screenshot.viewport.width}x${screenshot.viewport.height}`, async ({
      page,
    }, testInfo) => {
      test.skip(
        process.env.F036_SCREENS !== "1" ||
          testInfo.project.name !== "desktop-chrome",
        "Set F036_SCREENS=1 to regenerate one desktop set of Wave 1 evidence.",
      );
      fs.mkdirSync(screenshotsDir, { recursive: true });
      await page.setViewportSize(screenshot.viewport);
      await page.goto("/#primitives");
      await page.waitForLoadState("networkidle");
      await page.evaluate(
        (theme) => document.documentElement.setAttribute("data-theme", theme),
        screenshot.theme,
      );

      await expect(page.locator("#view-primitives")).toHaveClass(/active/);
      const brandAndSelectionColors = await page
        .locator(".brand-logo, .nav-item.active")
        .evaluateAll((elements) =>
          elements.map((element) => {
            const style = getComputedStyle(element);
            return `${style.backgroundColor} ${style.backgroundImage} ${style.color}`;
          }),
        );
      expect(brandAndSelectionColors.join(" ")).not.toMatch(
        /rgb\((124, 58, 237|168, 85, 247|237, 233, 254|46, 16, 101|192, 132, 252)\)/,
      );
      await page.screenshot({
        path: path.join(screenshotsDir, screenshot.name),
      });
    });
  }
});
