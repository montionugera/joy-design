import { expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.resolve(
  __dirname,
  "../../../.claude/refined_backlog/F-037-wave-2-hero-grade-button-and-form-contro/research/screens",
);

const screenshots = ["button", "forms"].flatMap((view) =>
  ["light", "dark"].flatMap((theme) =>
    [
      { width: 375, height: 812 },
      { width: 1280, height: 800 },
    ].map((viewport) => ({
      name: `${view}-${theme}-${viewport.width}x${viewport.height}.png`,
      theme,
      view,
      viewport,
    })),
  ),
);

test.describe("F-037 form control visual evidence", () => {
  for (const screenshot of screenshots) {
    test(`${screenshot.view} ${screenshot.theme} ${screenshot.viewport.width}x${screenshot.viewport.height}`, async ({
      page,
    }, testInfo) => {
      test.skip(
        process.env.F037_SCREENS !== "1" ||
          testInfo.project.name !== "desktop-chrome",
        "Set F037_SCREENS=1 to regenerate the Wave 2 evidence.",
      );

      fs.mkdirSync(screenshotsDir, { recursive: true });
      await page.setViewportSize(screenshot.viewport);
      await page.goto(`/#${screenshot.view}`);
      await page.waitForLoadState("networkidle");
      await page.evaluate(
        (theme) => document.documentElement.setAttribute("data-theme", theme),
        screenshot.theme,
      );
      await expect(page.locator(`#view-${screenshot.view}`)).toHaveClass(
        /active/,
      );
      await page.screenshot({
        path: path.join(screenshotsDir, screenshot.name),
        fullPage: true,
      });
    });
  }
});
