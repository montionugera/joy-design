import { test, expect, type Page } from "@playwright/test";
import { openLandingBlocks, setTheme, type Theme } from "./helpers";

// F-039 C1b: the hub landing blocks demos are the real component markup, so their layout is a contract, measured
// from bounding boxes. Every row of a lead FeatureGrid fills the grid (no orphan cell in the last row), bento spans
// are N of 12 columns on wide screens and full width on phones, and the pricing table scrolls sideways with its
// first column pinned.

const LEAD_COUNTS = [3, 4, 5, 6] as const;

type Box = { left: number; right: number; top: number; width: number };

// Cards grouped into visual rows (same top within 2px), each row as [left, right] relative to the grid.
async function leadRows(page: Page, count: number) {
  return page.evaluate((n) => {
    const grid = document.querySelector<HTMLElement>(`#blocks-feature-lead-${n}`)!;
    const g = grid.getBoundingClientRect();
    const cards: Box[] = Array.from(grid.children).map((c) => {
      const r = c.getBoundingClientRect();
      return { left: r.left - g.left, right: r.right - g.left, top: r.top, width: r.width };
    });
    const rows: Box[][] = [];
    for (const card of cards) {
      const row = rows.find((r) => Math.abs(r[0].top - card.top) <= 2);
      if (row) row.push(card);
      else rows.push([card]);
    }
    return { gridWidth: g.width, cardCount: cards.length, rows };
  }, count);
}

for (const width of [1280, 1000]) {
  for (const count of LEAD_COUNTS) {
    test(`lead grid with ${count} cards fills every row at ${width}px`, async ({ page }) => {
      await openLandingBlocks(page, width);
      const { gridWidth, cardCount, rows } = await leadRows(page, count);

      expect(cardCount).toBe(count);
      // The lead card spans two of three columns, so there is always a second card in the first row.
      expect(rows.length).toBeGreaterThan(1);
      expect(rows[0].length).toBe(2);
      for (const [index, row] of rows.entries()) {
        const sorted = [...row].sort((a, b) => a.left - b.left);
        // No empty cell: the row starts at the grid's left edge and ends at its right edge.
        expect(sorted[0].left, `row ${index} starts at the grid edge`).toBeLessThanOrEqual(1);
        expect(sorted[sorted.length - 1].right, `row ${index} ends at the grid edge`).toBeGreaterThanOrEqual(gridWidth - 1);
        // Neighbours are separated by one gap only (no hole between two cards).
        for (let i = 1; i < sorted.length; i++) {
          const gap = sorted[i].left - sorted[i - 1].right;
          expect(gap, `row ${index} gap ${i}`).toBeGreaterThan(0);
          expect(gap, `row ${index} gap ${i}`).toBeLessThanOrEqual(32);
        }
      }
    });
  }
}

for (const count of LEAD_COUNTS) {
  test(`lead grid with ${count} cards is one column at 375px`, async ({ page }) => {
    await openLandingBlocks(page, 375);
    const { gridWidth, rows, cardCount } = await leadRows(page, count);
    expect(rows.length).toBe(cardCount);
    for (const row of rows) {
      expect(row.length).toBe(1);
      expect(row[0].left).toBeLessThanOrEqual(1);
      expect(Math.abs(row[0].width - gridWidth)).toBeLessThanOrEqual(1);
    }
  });
}

const BENTO_GRIDS = ["blocks-bento-showcase", "blocks-bento-cols", "blocks-bento-spans"] as const;

for (const id of BENTO_GRIDS) {
  test(`bento grid ${id} is full width per card at 375px`, async ({ page }) => {
    await openLandingBlocks(page, 375);
    const result = await page.evaluate((gridId) => {
      const grid = document.querySelector<HTMLElement>(`#${gridId}`)!;
      const gridWidth = grid.getBoundingClientRect().width;
      // Decorative filler tiles (aria-hidden) are dropped under 900px; every remaining card is full width.
      const cards = Array.from(grid.children).filter((c) => c.getAttribute("aria-hidden") !== "true");
      const fillers = Array.from(grid.children).filter((c) => c.getAttribute("aria-hidden") === "true");
      return {
        gridWidth,
        widths: cards.map((c) => c.getBoundingClientRect().width),
        fillersHidden: fillers.every((c) => getComputedStyle(c).display === "none"),
      };
    }, id);
    expect(result.widths.length).toBeGreaterThan(0);
    expect(result.fillersHidden, "empty filler tiles are not shown as blank cards").toBe(true);
    for (const width of result.widths) {
      expect(Math.abs(width - result.gridWidth)).toBeLessThanOrEqual(1);
    }
  });

  for (const theme of ["light", "dark"] as Theme[]) {
    test(`bento grid ${id} cards span N of 12 columns at 1280px in ${theme}`, async ({ page }) => {
      await openLandingBlocks(page, 1280);
      await setTheme(page, theme);
      const result = await page.evaluate((gridId) => {
        const grid = document.querySelector<HTMLElement>(`#${gridId}`)!;
        const style = getComputedStyle(grid);
        const gap = parseFloat(style.columnGap);
        const gridWidth = grid.getBoundingClientRect().width;
        return {
          gap,
          gridWidth,
          cards: Array.from(grid.children).map((c) => {
            const match = c.className.match(/joy-bento-card--col-(?:span-)?(\d+)/);
            return { span: match ? Number(match[1]) : 0, width: c.getBoundingClientRect().width };
          }),
        };
      }, id);
      // A card spanning N of 12 tracks is N tracks plus the N-1 gaps between them.
      const track = (result.gridWidth - 11 * result.gap) / 12;
      for (const { span, width } of result.cards) {
        expect(span, "card has a span class").toBeGreaterThan(0);
        expect(Math.abs(width - (span * track + (span - 1) * result.gap)), `span ${span}`).toBeLessThanOrEqual(2);
      }
    });
  }
}

test("bento demos use every span from 1 to 12 in both class families", async ({ page }) => {
  await openLandingBlocks(page, 1280);
  const used = await page.evaluate(() => {
    const collect = (gridId: string, pattern: RegExp) =>
      Array.from(document.querySelectorAll(`#${gridId} > *`))
        .map((c) => Number(c.className.match(pattern)?.[1] ?? 0))
        .sort((a, b) => a - b);
    return {
      cols: collect("blocks-bento-cols", /joy-bento-card--col-(\d+)/),
      spans: collect("blocks-bento-spans", /joy-bento-card--col-span-(\d+)/),
    };
  });
  for (const list of [used.cols, used.spans]) {
    for (let n = 1; n <= 12; n++) expect(list, `span ${n} is demonstrated`).toContain(n);
  }
});

test("pricing table scrolls sideways at 375px and pins its first column", async ({ page }) => {
  await openLandingBlocks(page, 375);
  const scroller = page.locator("#blocks-matrix .joy-pricing-matrix__scroll");
  await scroller.scrollIntoViewIfNeeded();

  const before = await scroller.evaluate((el) => ({
    scrollWidth: el.scrollWidth,
    clientWidth: el.clientWidth,
    role: el.getAttribute("role"),
    tabindex: el.getAttribute("tabindex"),
  }));
  expect(before.scrollWidth).toBeGreaterThan(before.clientWidth);
  expect(before.role).toBe("region");
  expect(before.tabindex).toBe("0");

  const measure = () =>
    scroller.evaluate((el) => {
      const first = el.querySelector<HTMLElement>("tbody tr:first-child th")!;
      const second = el.querySelector<HTMLElement>("tbody tr:first-child td")!;
      const s = el.getBoundingClientRect();
      return {
        firstLeft: first.getBoundingClientRect().left - s.left,
        secondLeft: second.getBoundingClientRect().left - s.left,
        scrollLeft: el.scrollLeft,
      };
    });
  const start = await measure();
  await scroller.evaluate((el) => {
    el.scrollLeft = 120;
  });
  const scrolled = await measure();

  expect(scrolled.scrollLeft).toBeGreaterThan(50);
  // The data column moved; the row header did not.
  expect(start.secondLeft - scrolled.secondLeft).toBeGreaterThan(50);
  expect(Math.abs(scrolled.firstLeft - start.firstLeft)).toBeLessThanOrEqual(1);
});
