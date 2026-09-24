import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(
  path.resolve(__dirname, "../../../packages/tokens/dist/theme.css"),
  "utf8",
);

// F-039 T1 (taste review P1-1, P1-6): a stats grid never leaves a card alone beside empty cells, whatever the
// number of stats (2 to 6) and whatever the width, and a trend pill stays one line. The page is built from the
// committed theme.css alone, so the measurement is the component's own (hub chrome is not involved).
const stats = [
  [
    "4.2 μs",
    "P99 Order Latency",
    "Kernel bypass colocation",
    "14% lower vs L1",
  ],
  [
    "99.999%",
    "Historical Uptime",
    "Two live sites, instant failover",
    "No downtime",
  ],
  ["$48.2B", "Monthly Volume", "Settled across 14 networks", "+32% MoM"],
  [
    "14 Chains",
    "Settlement Chains",
    "Instant cross-L2 finality",
    "EVM and SVM",
  ],
  ["1,204,551", "Trades", "Filled today", "+3% DoD"],
  ["12 ms", "Median", "Round trip", "-2 ms"],
];
const widths = [320, 375, 480, 768, 900, 1024, 1280] as const;
// the column counts a reader should see, per count and width: the steps of the container query (viewport minus 48px
// section padding, 32px on phones)
const expectedColumns: Record<number, Record<number, number>> = {
  2: { 320: 2, 375: 2, 480: 2, 768: 2, 900: 2, 1024: 2, 1280: 2 },
  3: { 320: 2, 375: 2, 480: 2, 768: 3, 900: 3, 1024: 3, 1280: 3 },
  4: { 320: 2, 375: 2, 480: 2, 768: 2, 900: 4, 1024: 4, 1280: 4 },
  5: { 320: 2, 375: 2, 480: 2, 768: 2, 900: 2, 1024: 2, 1280: 5 },
  6: { 320: 2, 375: 2, 480: 2, 768: 3, 900: 3, 1024: 3, 1280: 3 },
};

const build = (n: number) =>
  `<section class="joy-stats-section"><div class="joy-stats-grid">${stats
    .slice(0, n)
    .map(
      ([value, label, desc, change]) =>
        `<div class="joy-stat-item"><div class="joy-stat-item__value">${value}</div><div class="joy-stat-item__label">${label}</div><p class="joy-stat-item__desc">${desc}</p><div class="joy-stat-item__change joy-stat-item__change--positive"><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg> ${change}</div></div>`,
    )
    .join("")}</div></section>`;

for (const theme of ["light", "dark"] as const) {
  for (const width of widths) {
    test(`stats grid has no orphan card for 2 to 6 stats at ${width}px in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      for (let n = 2; n <= 6; n++) {
        await page.setContent(
          `<!doctype html><html data-theme="${theme}"><head><meta name="viewport" content="width=device-width"><style>${css} body{margin:0}</style></head><body>${build(n)}</body></html>`,
        );
        const result = await page.evaluate(() => {
          const grid = document
            .querySelector(".joy-stats-grid")!
            .getBoundingClientRect();
          const cells = Array.from(
            document.querySelectorAll(".joy-stat-item"),
          ).map((e) => e.getBoundingClientRect());
          const rows = new Map<number, DOMRect[]>();
          for (const cell of cells) {
            const key = Math.round(cell.top);
            rows.set(key, [...(rows.get(key) ?? []), cell]);
          }
          const ordered = [...rows.entries()]
            .sort((a, b) => a[0] - b[0])
            .map(([, row]) => row);
          const pills = Array.from(
            document.querySelectorAll<HTMLElement>(".joy-stat-item__change"),
          );
          return {
            perRow: ordered.map((row) => row.length),
            // every row spans the grid edge to edge, so nothing sits alone beside an empty cell
            filled: ordered.map(
              (row) =>
                Math.abs(row[0].left - grid.left) < 2 &&
                Math.abs(row[row.length - 1].right - grid.right) < 2,
            ),
            pillLines: pills.map((pill) =>
              Math.round(pill.getBoundingClientRect().height / 20),
            ),
            pillOverflow: pills.filter(
              (pill) =>
                pill.getBoundingClientRect().right >
                pill.parentElement!.getBoundingClientRect().right + 0.5,
            ).length,
            pageOverflow:
              document.documentElement.scrollWidth - window.innerWidth,
          };
        });
        expect(
          result.filled.every(Boolean),
          `${n} stats at ${width}: rows ${result.perRow.join("+")}`,
        ).toBe(true);
        expect(result.perRow[0], `${n} stats at ${width}: columns`).toBe(
          expectedColumns[n][width],
        );
        expect(
          result.pillLines.every((lines) => lines === 1),
          `${n} stats at ${width}: one-line pills`,
        ).toBe(true);
        expect(
          result.pillOverflow,
          `${n} stats at ${width}: pill inside its card`,
        ).toBe(0);
        expect(
          result.pageOverflow,
          `${n} stats at ${width}: no sideways scroll`,
        ).toBe(0);
      }
    });
  }
}
