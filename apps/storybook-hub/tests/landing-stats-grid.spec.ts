import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(
  path.resolve(__dirname, "../../../packages/tokens/dist/theme.css"),
  "utf8",
);

// F-039 T1 (taste review P1-1, P1-6; review round 1 I-1): a stats grid never leaves a card alone beside empty cells,
// whatever the number of stats (2 to 6) and whatever the width of the box it sits in, every value stays on ONE line
// (a 9 character value like "14 Chains" is the hard case), and a trend pill stays one line inside its card. The page is
// built from the committed theme.css alone, so the measurement is the component's own (hub chrome is not involved).
// Columns and type follow the section's container, so the sweep below resizes a wrapper inside a 1280px window.
type Stat = [value: string, label: string, desc: string, change: string];
// the LandingPage default copy (packages/{react,svelte} LandingPage)
const pageStats: Stat[] = [
  [
    "4.2 μs",
    "P99 Order Latency",
    "Kernel bypass colocation",
    "14% faster vs L1",
  ],
  [
    "99.999%",
    "Historical Uptime",
    "Two live sites, instant failover",
    "Zero downtime",
  ],
  ["$48.2B", "Monthly Volume", "Settled across 14 networks", "+32% MoM"],
  ["14 Chains", "Settlement Chains", "Instant cross-L2 finality", "EVM & SVM"],
  ["1,204,551", "Trades", "Filled today", "+3% DoD"],
  ["12 ms", "Median", "Round trip", "-2 ms"],
];
// the values of the hub simulator and blocks views (their pill copy is longer and belongs to the hub task)
const hubStats: Stat[] = [
  [
    "4.2 µs",
    "P99 order latency",
    "Measured inside the colocation window",
    "14% faster than benchmark",
  ],
  ["99.999%", "Gateway uptime", "Two-site failover", "Zero unplanned downtime"],
  [
    "$48.2B",
    "Monthly volume",
    "Routed across all venues",
    "3% below last month",
  ],
  [
    "14 chains",
    "Settlement networks",
    "Bridged through one API",
    "No change this quarter",
  ],
  ["1,204,551", "Trades", "Filled today", "+3% DoD"],
  ["12 ms", "Median", "Round trip", "-2 ms"],
];

const section = (stats: Stat[], n: number) =>
  `<section class="joy-stats-section"><div class="joy-stats-grid">${stats
    .slice(0, n)
    .map(
      ([value, label, desc, change]) =>
        `<div class="joy-stat-item"><div class="joy-stat-item__value">${value}</div><div class="joy-stat-item__label">${label}</div><p class="joy-stat-item__desc">${desc}</p><div class="joy-stat-item__change joy-stat-item__change--positive"><svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"></polyline></svg> <span class="joy-stat-item__sr">Trend up:</span> <span class="joy-stat-item__change-text">${change}</span></div></div>`,
    )
    .join("")}</div></section>`;

const shell = (theme: string, body: string) =>
  `<!doctype html><html data-theme="${theme}"><head><meta name="viewport" content="width=device-width"><style>${css} body{margin:0}</style></head><body>${body}</body></html>`;

// Runs in the page: one measurement of every stats grid under `root`.
const measure = (root: string = "body") => {
  return Array.from(
    document.querySelectorAll<HTMLElement>(`${root} .joy-stats-grid`),
  ).map((grid) => {
    const g = grid.getBoundingClientRect();
    const cells = Array.from(
      grid.querySelectorAll<HTMLElement>(".joy-stat-item"),
    );
    const rects = cells.map((cell) => cell.getBoundingClientRect());
    const rows = new Map<number, DOMRect[]>();
    for (const r of rects)
      rows.set(Math.round(r.top), [...(rows.get(Math.round(r.top)) ?? []), r]);
    const ordered = [...rows.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([, row]) => row);
    const valueLines = cells.map((cell) => {
      const value = cell.querySelector<HTMLElement>(".joy-stat-item__value")!;
      const lineHeight = parseFloat(getComputedStyle(value).lineHeight);
      // real line height from the computed font metrics: scrollHeight counts every wrapped line
      return Number.isFinite(lineHeight)
        ? Math.round(value.scrollHeight / lineHeight)
        : NaN;
    });
    const pills = cells.map((cell) =>
      cell.querySelector<HTMLElement>(".joy-stat-item__change")!,
    );
    const pillLines = pills.map((pill) => {
      const cs = getComputedStyle(pill);
      const line = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.25;
      const box =
        pill.getBoundingClientRect().height -
        parseFloat(cs.paddingTop) -
        parseFloat(cs.paddingBottom);
      return Math.round(box / Math.max(line, parseFloat(cs.fontSize)));
    });
    return {
      width: g.width,
      n: cells.length,
      perRow: ordered.map((row) => row.length),
      filled: ordered.map(
        (row) =>
          Math.abs(row[0].left - g.left) < 2 &&
          Math.abs(row[row.length - 1].right - g.right) < 2,
      ),
      valueLines,
      pillLines,
      pillOutside: pills.filter(
        (pill, i) => pill.getBoundingClientRect().right > rects[i].right + 0.5,
      ).length,
      cellOverflow: cells.filter(
        (cell) => cell.scrollWidth > cell.clientWidth + 1,
      ).length,
      pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
};

// the column count a reader should see for n stats in a container of `width` px (the container steps of the CSS)
const expectedColumns = (n: number, width: number) => {
  if (width >= 69 * 16 && n === 5) return 5;
  if (width >= 60 * 16 && n === 4) return 4;
  if (width >= 45 * 16 && (n === 3 || n === 6)) return 3;
  return 2;
};

type Result = ReturnType<typeof measure>[number];
const check = (r: Result, where: string) => {
  expect(
    r.filled.every(Boolean),
    `${where}: rows ${r.perRow.join("+")} fill the grid`,
  ).toBe(true);
  expect(r.perRow[0], `${where}: columns`).toBe(
    Math.min(expectedColumns(r.n, r.width), r.n),
  );
  expect(r.valueLines, `${where}: every value on one line`).toEqual(
    r.valueLines.map(() => 1),
  );
  expect(r.pillLines, `${where}: one-line pills`).toEqual(
    r.pillLines.map(() => 1),
  );
  expect(r.pillOutside, `${where}: pills stay inside their card`).toBe(0);
  expect(r.cellOverflow, `${where}: no card overflows`).toBe(0);
  expect(r.pageOverflow, `${where}: no sideways scroll`).toBe(0);
};

const widths = [320, 375, 480, 768, 900, 1024, 1280] as const;
for (const theme of ["light", "dark"] as const) {
  for (const width of widths) {
    test(`stats grid: no orphan, one-line values and pills for 2 to 6 stats at ${width}px in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      for (let n = 2; n <= 6; n++) {
        await page.setContent(shell(theme, section(pageStats, n)));
        const [r] = await page.evaluate(measure);
        check(r, `${n} stats at ${width}`);
      }
    });
  }
}

// The reason the steps are container queries: a narrow box inside a wide window (a hub frame, a sidebar layout). Every
// container width from a 288px phone content box up to the 1152px maximum, in a 1280px window, both datasets, both themes.
for (const theme of ["light", "dark"] as const) {
  test(`stats grid: container sweep 288 to 1152px inside a 1280px window in ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    for (const [name, stats] of [
      ["page copy", pageStats],
      ["hub copy", hubStats],
    ] as const) {
      const wrappers = [2, 3, 4, 5, 6]
        .map((n) => `<div class="wrap">${section(stats, n)}</div>`)
        .join("");
      await page.setContent(shell(theme, wrappers));
      // the section is 48px padded left and right in a window this wide (the 32px phone padding is a media query)
      for (let content = 288; content <= 1152; content += 8) {
        await page.evaluate((w) => {
          for (const el of Array.from(
            document.querySelectorAll<HTMLElement>(".wrap"),
          ))
            el.style.width = `${w + 48}px`;
        }, content);
        const results = await page.evaluate(measure);
        for (const r of results) {
          const where = `${name}, ${r.n} stats, container ${content}px`;
          check(r, where);
        }
      }
    }
  });
}

// text-overflow does not apply to an inline-flex pill, so a long pill was hard-clipped mid-word with no ellipsis
// (review N-1). The text lives in `.joy-stat-item__change-text`; a too-long change must be ellipsised there and the pill
// must stay inside its card. The 40 character string is deliberately far too long for a 375px card.
for (const theme of ["light", "dark"] as const) {
  test(`stats grid: a long pill is ellipsised inside its card at 375px in ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 900 });
    const long: Stat[] = [
      ...pageStats.slice(0, 3),
      [
        "14 Chains",
        "Settlement Chains",
        "Instant cross-L2 finality",
        "Settled across every one of 14 chains",
      ],
    ];
    await page.setContent(shell(theme, section(long, 4)));
    const pills = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll<HTMLElement>(".joy-stat-item__change"),
      ).map((pill) => {
        const text = pill.querySelector<HTMLElement>(
          ".joy-stat-item__change-text",
        );
        const card = pill.closest(".joy-stat-item")!.getBoundingClientRect();
        const style = text ? getComputedStyle(text) : null;
        return {
          hasText: text !== null,
          truncated: text ? text.scrollWidth > text.clientWidth : false,
          textOverflow: style?.textOverflow,
          overflow: style?.overflowX,
          whiteSpace: style?.whiteSpace,
          pillInside: pill.getBoundingClientRect().right <= card.right + 0.5,
          textInsidePill: text
            ? text.getBoundingClientRect().right <=
              pill.getBoundingClientRect().right + 0.5
            : false,
        };
      }),
    );
    expect(
      pills.every((p) => p.hasText),
      "every pill has the inner text span",
    ).toBe(true);
    expect(
      pills[3].truncated,
      "the 40 character string really is too long for the card",
    ).toBe(true);
    for (const [i, p] of pills.entries()) {
      expect(p.pillInside, `pill ${i} stays inside its card`).toBe(true);
      expect(p.textInsidePill, `pill ${i} text stays inside the pill`).toBe(
        true,
      );
      if (p.truncated) {
        expect(
          p.textOverflow,
          `pill ${i}: a clipped text shows an ellipsis`,
        ).toBe("ellipsis");
        expect(
          p.overflow,
          `pill ${i}: the ellipsis needs overflow hidden`,
        ).toBe("hidden");
        expect(p.whiteSpace).toBe("nowrap");
      }
    }
    // the default copy is short enough to show whole
    expect(
      pills.slice(0, 3).every((p) => !p.truncated),
      "the default pills are not clipped",
    ).toBe(true);
  });
}

test("stats grid: a 390px and a 454px wrapper in a 1280px window keep 99.999% and 14 Chains whole", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const wrapper of [390, 454]) {
    await page.setContent(
      shell(
        "light",
        `<div style="width:${wrapper}px">${section(pageStats, 4)}</div>`,
      ),
    );
    const [r] = await page.evaluate(measure);
    check(r, `4 stats in a ${wrapper}px wrapper`);
    expect(r.perRow, "compact two columns").toEqual([2, 2]);
  }
});

// inline-size containment collapses a section to its padding inside a shrink-to-fit parent unless it declares a natural
// inline size (contain-intrinsic-inline-size): a flex item, an inline-block, an absolute box and a table cell without a width.
const parents: Record<string, (body: string) => string> = {
  "flex item": (body) => `<div style="display:flex"><div>${body}</div></div>`,
  "inline-block": (body) => `<div style="display:inline-block">${body}</div>`,
  "absolute box": (body) =>
    `<div style="position:relative"><div style="position:absolute">${body}</div></div>`,
  "table cell": (body) =>
    `<div style="display:table"><div style="display:table-cell">${body}</div></div>`,
};
for (const [name, wrap] of Object.entries(parents)) {
  test(`stats grid: not collapsed inside a shrink-to-fit parent (${name})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.setContent(shell("light", wrap(section(pageStats, 4))));
    const width = await page.evaluate(
      () =>
        document.querySelector(".joy-stats-section")!.getBoundingClientRect()
          .width,
    );
    expect(
      width,
      "section width in a parent that gives it none",
    ).toBeGreaterThanOrEqual(300);
    const [r] = await page.evaluate(measure);
    expect(r.valueLines, "values on one line").toEqual(
      r.valueLines.map(() => 1),
    );
  });
}

// The hub views draw the same component; their values must stay whole at every window width (their pill copy is longer
// and is asserted by the hub task, so pills are only required to stay inside their card here).
for (const view of ["landing-preview", "landing-blocks"] as const) {
  test(`stats grid: hub ${view} keeps every value whole and no orphan at 375 to 1280px`, async ({
    page,
  }) => {
    for (const width of [375, 768, 1024, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/#${view}`);
      await page.waitForLoadState("networkidle");
      const results = (await page.evaluate(measure, `#view-${view}`)).filter(
        (r) => r.width > 0,
      );
      expect(results.length, `${view} shows a stats grid`).toBeGreaterThan(0);
      for (const r of results) {
        expect(
          r.filled.every(Boolean),
          `${view} at ${width}: rows ${r.perRow.join("+")}`,
        ).toBe(true);
        expect(r.valueLines, `${view} at ${width}: values on one line`).toEqual(
          r.valueLines.map(() => 1),
        );
        expect(
          r.pillOutside,
          `${view} at ${width}: pills inside their card`,
        ).toBe(0);
        expect(r.pageOverflow, `${view} at ${width}: no sideways scroll`).toBe(
          0,
        );
      }
    }
  });
}
