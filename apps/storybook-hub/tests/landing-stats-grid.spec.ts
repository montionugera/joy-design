import { test, expect } from "@playwright/test";
import { setTheme } from "./helpers";
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
// the copy of the hub blocks view (the simulator shows the page copy above)
const hubStats: Stat[] = [
  ["4.2 µs", "P99 order latency", "Measured inside the colocation window", "14% faster"],
  ["99.999%", "Gateway uptime", "Two-site failover", "No outages"],
  ["$48.2B", "Monthly volume", "Routed across all venues", "3% lower"],
  ["14 chains", "Settlement networks", "Bridged through one API", "No change"],
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
    // a metric claim is never cut off: the change text has to fit its own box (no ellipsis, no clipping)
    const pillCut = pills.filter((pill) => {
      const text = pill.querySelector<HTMLElement>(".joy-stat-item__change-text") ?? pill;
      return text.scrollWidth > text.clientWidth + 1 || getComputedStyle(text).textOverflow === "ellipsis";
    }).length;
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
      pillCut,
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
  if (width < 15 * 16) return 1;
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
  expect(
    r.pillLines.every((n) => n >= 1 && n <= 2),
    `${where}: pills wrap to at most 2 lines (${r.pillLines.join(",")})`,
  ).toBe(true);
  expect(r.pillCut, `${where}: no change text is cut off`).toBe(0);
  expect(r.pillOutside, `${where}: pills stay inside their card`).toBe(0);
  expect(r.cellOverflow, `${where}: no card overflows`).toBe(0);
  expect(r.pageOverflow, `${where}: no sideways scroll`).toBe(0);
};

const widths = [320, 375, 480, 768, 900, 1024, 1280] as const;
for (const theme of ["light", "dark"] as const) {
  for (const width of widths) {
    test(`stats grid: no orphan, one-line values and whole pills for 2 to 6 stats at ${width}px in ${theme}`, async ({
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

// F-039 F1 (taste review 2, P1-A): a metric claim is never cut off. A change that does not fit on one line wraps inside its
// pill (the review saw "14% faster vs..." with an ellipsis); the pill stays inside its card and the full text is visible.
// The 37 character string is deliberately far longer than the default copy: it must still wrap whole, not clip.
for (const theme of ["light", "dark"] as const) {
  for (const width of [320, 375]) {
    test(`stats grid: a long pill wraps whole inside its card at ${width}px in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
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
          const cs = getComputedStyle(pill);
          const line = parseFloat(cs.fontSize) * 1.25;
          return {
            hasText: text !== null,
            cut: text ? text.scrollWidth > text.clientWidth + 1 : true,
            textOverflow: style?.textOverflow,
            whiteSpace: style?.whiteSpace,
            lines: Math.round(
              (pill.getBoundingClientRect().height -
                parseFloat(cs.paddingTop) -
                parseFloat(cs.paddingBottom)) /
                line,
            ),
            pillInside: pill.getBoundingClientRect().right <= card.right + 0.5,
            textInsidePill: text
              ? text.getBoundingClientRect().right <=
                pill.getBoundingClientRect().right + 0.5
              : false,
          };
        }),
      );
      for (const [i, p] of pills.entries()) {
        expect(p.hasText, `pill ${i} has the inner text span`).toBe(true);
        expect(p.cut, `pill ${i}: the whole text is visible`).toBe(false);
        expect(p.textOverflow, `pill ${i}: no ellipsis`).not.toBe("ellipsis");
        expect(p.whiteSpace, `pill ${i}: the text may wrap`).toBe("normal");
        expect(p.pillInside, `pill ${i} stays inside its card`).toBe(true);
        expect(p.textInsidePill, `pill ${i} text stays inside the pill`).toBe(
          true,
        );
      }
      // the default copy stays short: at most 2 lines by design
      for (const [i, p] of pills.slice(0, 3).entries())
        expect(p.lines, `default pill ${i}: at most 2 lines`).toBeLessThanOrEqual(2);
      expect(pills[3].lines, "the long string really wraps").toBeGreaterThanOrEqual(2);
    });
  }
}

// Below ~15rem of container width two columns leave cards under ~115px, and copy wraps to 4 lines: one column is the honest layout.
test("stats grid: a container narrower than 15rem uses one column and every card fills the row", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const content of [192, 224, 236]) {
    await page.setContent(
      shell("light", `<div style="width:${content + 48}px">${section(pageStats, 4)}</div>`),
    );
    const [r] = await page.evaluate(measure);
    expect(r.perRow, `container ${content}px: one card per row`).toEqual([1, 1, 1, 1]);
    check(r, `4 stats in a ${content}px container`);
  }
  await page.setContent(
    shell("light", `<div style="width:${240 + 48}px">${section(pageStats, 4)}</div>`),
  );
  const [wide] = await page.evaluate(measure);
  expect(wide.perRow, "240px container keeps compact two columns").toEqual([2, 2]);
});

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

// F-039 F1 (taste review 2, P1-A): on a phone the stats fill the hub frame (no double gutter from the demo wrapper), the two
// columns are wide enough to read (cards of 120px or more at 320px), every change text is fully visible (no ellipsis, no
// clip) in at most 2 lines, and the pill stays inside its card. Both hub views, the simulator in its Mobile frame too.
for (const theme of ["light", "dark"] as const) {
  for (const width of [320, 375]) {
    for (const view of ["landing-preview", "landing-blocks"] as const) {
      test(`stats grid: hub ${view} at ${width}px fills its frame and shows every change whole in ${theme}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`/#${view}`);
        await page.waitForLoadState("networkidle");
        await setTheme(page, theme);
        const facts = await page.evaluate(measureHubStats, view);
        expect(facts.length, `${view} shows a stats grid`).toBeGreaterThan(0);
        for (const f of facts) {
          expect(f.cutTexts, `${view} at ${width}: cut change texts`).toEqual([]);
          expect(f.ellipsis, `${view} at ${width}: no ellipsis`).toBe(0);
          expect(f.maxLines, `${view} at ${width}: pill lines`).toBeLessThanOrEqual(2);
          expect(f.outside, `${view} at ${width}: pills outside their card`).toBe(0);
          expect(f.minCard, `${view} at ${width}: narrowest card`).toBeGreaterThanOrEqual(120);
          expect(f.gutter, `${view} at ${width}: gutter between frame and first card`).toBeLessThanOrEqual(24);
        }
      });
    }
  }
}

test("stats grid: the simulator Mobile frame in a 1280px window shows every change whole", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/#landing-preview");
  await page.waitForLoadState("networkidle");
  await page.getByRole("button", { name: /^Mobile/ }).click();
  await expect
    .poll(() => page.evaluate(() => document.getElementById("simulator-viewport-frame")!.getBoundingClientRect().width))
    .toBeLessThanOrEqual(380);
  const facts = await page.evaluate(measureHubStats, "landing-preview");
  expect(facts.length).toBeGreaterThan(0);
  for (const f of facts) {
    expect(f.cutTexts).toEqual([]);
    expect(f.maxLines).toBeLessThanOrEqual(2);
    expect(f.outside).toBe(0);
    expect(f.minCard).toBeGreaterThanOrEqual(120);
  }
});

// Runs in the page: what a reader sees of the stats in one hub view.
function measureHubStats(view: string) {
  const root = document.getElementById(`view-${view}`)!;
  return Array.from(root.querySelectorAll<HTMLElement>(".joy-stats-section"))
    .filter((s) => s.getBoundingClientRect().width > 0)
    .map((section) => {
      const cards = Array.from(section.querySelectorAll<HTMLElement>(".joy-stat-item"));
      const frame = (section.closest(".simulator-frame, .playground-box") as HTMLElement).getBoundingClientRect();
      const pills = cards.map((c) => c.querySelector<HTMLElement>(".joy-stat-item__change")!);
      const texts = pills.map((p) => p.querySelector<HTMLElement>(".joy-stat-item__change-text")!);
      const lines = pills.map((p) => {
        const cs = getComputedStyle(p);
        return Math.round(
          (p.getBoundingClientRect().height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) /
            (parseFloat(cs.fontSize) * 1.25),
        );
      });
      return {
        cutTexts: texts.filter((t) => t.scrollWidth > t.clientWidth + 1).map((t) => t.textContent),
        ellipsis: texts.filter((t) => getComputedStyle(t).textOverflow === "ellipsis").length,
        maxLines: Math.max(...lines),
        outside: pills.filter((p, i) => p.getBoundingClientRect().right > cards[i].getBoundingClientRect().right + 0.5).length,
        minCard: Math.min(...cards.map((c) => c.getBoundingClientRect().width)),
        gutter: Math.round(cards[0].getBoundingClientRect().left - frame.left),
      };
    });
}
