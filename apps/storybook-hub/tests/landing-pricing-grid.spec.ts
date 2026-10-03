import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// F-039 T2 fix round 1 (review M2, M3): a plain PricingMatrix (card grid branch) must never leave a card alone next to an
// empty cell, for any card count from 2 to 7, at any width it is given, in both themes, with no sideways overflow. Built from
// the committed theme.css ONLY (no hub CSS): this is what a consumer page gets.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(path.resolve(__dirname, "../../../packages/tokens/dist/theme.css"), "utf8");
const { cards } = JSON.parse(
  execFileSync(process.execPath, [path.resolve(__dirname, "../scripts/render-pricing-ssr.mjs")], {
    encoding: "utf8",
    timeout: 300_000,
    maxBuffer: 16 * 1024 * 1024,
  }),
) as { cards: Record<string, string> };

const shell = (theme: string, body: string, width: number) =>
  `<!doctype html><html data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style></head><body style="margin:0"><div id="box" style="width:${width}px">${body}</div></body></html>`;

/** Rows of the card grid and whether every row spans the grid's full width (no empty cell). */
function measure() {
  const grid = document.querySelector<HTMLElement>(".joy-pricing-matrix")!;
  const box = grid.getBoundingClientRect();
  const cells = Array.from(grid.children).map((c) => c.getBoundingClientRect());
  const rows: DOMRect[][] = [];
  for (const r of [...cells].sort((a, b) => a.top - b.top || a.left - b.left)) {
    const row = rows[rows.length - 1];
    if (row && r.top < row[0].bottom - 4) row.push(r);
    else rows.push([r]);
  }
  return {
    perRow: rows.map((row) => row.length),
    full: rows.map((row) => Math.abs(Math.min(...row.map((r) => r.left)) - box.left) <= 1.5 && Math.abs(Math.max(...row.map((r) => r.right)) - box.right) <= 1.5),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    boxOverflow: grid.scrollWidth - grid.clientWidth,
    minCard: Math.min(...cells.map((r) => r.width)),
  };
}

for (const theme of ["light", "dark"]) {
  for (const n of [2, 3, 4, 5, 6, 7]) {
    test(`${theme}: ${n} plan cards leave no empty cell at any width`, async ({ page }) => {
      for (const width of [320, 375, 480, 640, 768, 886, 900, 1024, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        await page.setContent(shell(theme, cards[String(n)], width));
        const m = await page.evaluate(measure);
        expect(m.full.every(Boolean), `${n} cards at ${width}: rows ${m.perRow.join("+")}`).toBe(true);
        expect(m.overflow, `${n} cards at ${width}: page overflow`).toBeLessThanOrEqual(0);
        expect(m.boxOverflow, `${n} cards at ${width}: grid overflow`).toBeLessThanOrEqual(0);
      }
    });
  }

  test(`${theme}: three plans sit in one row at the ~886px hub column (the taste review case) and 2 by 2 for four`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.setContent(shell(theme, cards["3"], 886));
    expect((await page.evaluate(measure)).perRow, "3 plans at 886").toEqual([3]);
    await page.setContent(shell(theme, cards["4"], 886));
    expect((await page.evaluate(measure)).perRow, "4 plans at 886").toEqual([2, 2]);
    await page.setContent(shell(theme, cards["3"], 375));
    expect((await page.evaluate(measure)).perRow, "3 plans at 375").toEqual([1, 1, 1]);
  });

  test(`${theme}: cards stay readable in a narrow frame (no card under 250px above 320px)`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    for (const width of [340, 375, 480, 700]) {
      await page.setContent(shell(theme, cards["5"], width));
      expect((await page.evaluate(measure)).minCard, `5 cards at ${width}`).toBeGreaterThanOrEqual(Math.min(250, width - 1));
    }
  });
}
