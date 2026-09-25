import { test } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTheme, settle } from "./helpers";

// F-040 acceptance screenshots. Gated by F040_SCREENS=1 so a normal run never rewrites the committed PNGs.
// Output: {name}-{light|dark}-{375|1280}.png (viewport-sized, not full page) in the F-040 research/screens folder.
const dir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../.claude/refined_backlog/F-040-wave-5-storybook-hub-mobile-layout-dark/research/screens",
);
const shots = [
  { name: "landing", view: "overview" },
  { name: "primitives", view: "primitives" },
  { name: "forms", view: "forms" },
  { name: "data-display", view: "data-display-feedback" },
];

test.describe("F-040 screenshots", () => {
  test.beforeEach(({}, info) => {
    test.skip(
      !process.env.F040_SCREENS || info.project.name !== "desktop-chrome",
      "set F040_SCREENS=1",
    );
  });
  for (const shot of shots) {
    for (const width of [375, 1280]) {
      for (const theme of ["light", "dark"] as const) {
        test(`${shot.name} ${theme} ${width}`, async ({ page }) => {
          await page.emulateMedia({ reducedMotion: "reduce" });
          await page.setViewportSize({
            width,
            height: width < 900 ? 812 : 800,
          });
          await page.goto(`/#${shot.view}`);
          await page.waitForLoadState("networkidle");
          await setTheme(page, theme);
          await settle(page);
          await page.screenshot({
            path: path.join(dir, `${shot.name}-${theme}-${width}.png`),
            animations: "disabled",
          });
        });
      }
    }
  }
});
