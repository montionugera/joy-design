import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(
  path.resolve(__dirname, "../../../packages/tokens/dist/theme.css"),
  "utf8",
);

const themes = ["light", "dark"] as const;
const widths = [320, 375] as const;

// F-039 L4: a stat value is one token that must never push the page sideways. "1,204,551" (9 characters)
// stays on one line in the half-width phone cell; a token that cannot fit ("12,345,678,901", a 20 character
// word) breaks inside its own cell instead of spilling out of it. The page is built from the committed
// theme.css alone (no hub chrome), so the measurement is the component's own.
const values = ["1,204,551", "12,345,678,901", "ABCDEFGHIJKLMNOPQRST", "14 Chains"];
const markup = `<section class="joy-stats-section"><div class="joy-stats-grid">${values
  .map(
    (value) =>
      `<div class="joy-stat-item"><div class="joy-stat-item__value">${value}</div><div class="joy-stat-item__label">Label</div></div>`,
  )
  .join("")}</div></section>`;

for (const theme of themes) {
  for (const width of widths) {
    test(`stat values never overflow the page or their cell at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.setContent(
        `<!doctype html><html data-theme="${theme}"><head><meta name="viewport" content="width=device-width"><style>${css} body{margin:0}</style></head><body>${markup}</body></html>`,
      );
      const result = await page.evaluate(() => {
        const cells = Array.from(document.querySelectorAll<HTMLElement>(".joy-stat-item"));
        const vals = Array.from(document.querySelectorAll<HTMLElement>(".joy-stat-item__value"));
        const lines = (element: HTMLElement) =>
          Math.round(
            element.getBoundingClientRect().height / parseFloat(getComputedStyle(element).lineHeight),
          );
        return {
          pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
          cellOverflow: cells.filter((cell) => cell.scrollWidth > cell.clientWidth + 1).length,
          columns: getComputedStyle(document.querySelector(".joy-stats-grid")!).gridTemplateColumns.split(" ").length,
          nineChars: lines(vals[0]),
          extreme: [lines(vals[1]), lines(vals[2])],
        };
      });
      expect(result.pageOverflow, "no horizontal page scroll").toBe(0);
      expect(result.cellOverflow, "no value spills out of its cell").toBe(0);
      expect(result.columns, "compact 2x2 grid").toBe(2);
      expect(result.nineChars, "a 9 character number stays on one line").toBe(1);
      expect(result.extreme.every((n) => n >= 1)).toBe(true);
    });
  }
}
