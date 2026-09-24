import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// F-039 T1 (taste review P2-1, P2-8, P2-11): hero-to-next-section gap, footer link groups in two columns from 480 to
// 767px without an orphan, and bento card content aligned with the card text. Built from the committed theme.css alone.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(
  path.resolve(__dirname, "../../../packages/tokens/dist/theme.css"),
  "utf8",
);
const ssr = JSON.parse(
  execFileSync(
    process.execPath,
    [path.resolve(__dirname, "../scripts/render-landing-ssr.mjs")],
    {
      encoding: "utf8",
      timeout: 60_000,
      maxBuffer: 16 * 1024 * 1024,
    },
  ),
) as Record<string, string>;

const shell = (theme: string, body: string) =>
  `<!doctype html><html data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style></head><body>${body}</body></html>`;

for (const twin of ["react", "svelte"] as const) {
  test(`${twin} LandingPage: no dead space between the hero actions and the logo strip at 1280px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.setContent(shell("light", ssr[twin]));
    const gap = await page.evaluate(() => {
      const ctas = document
        .querySelector(".joy-hero__ctas")!
        .getBoundingClientRect();
      const logos = document
        .querySelector(".joy-logo-cloud__title")!
        .getBoundingClientRect();
      return logos.top - ctas.bottom;
    });
    expect(
      gap,
      "px between the hero actions and the logo strip",
    ).toBeGreaterThan(0);
    expect(
      gap,
      "px between the hero actions and the logo strip",
    ).toBeLessThanOrEqual(96);
  });
}

const footer = (columns: number) =>
  `<footer class="joy-site-footer"><div class="joy-site-footer__inner"><div class="joy-site-footer__brand"><div class="joy-site-footer__brand-title"><span>Joymify Design</span></div></div>${Array.from(
    { length: columns },
    (_, i) =>
      `<div class="joy-site-footer__column"><h4 class="joy-site-footer__col-title">Group ${i + 1}</h4><ul class="joy-site-footer__links"><li><a class="joy-site-footer__link" href="#">One</a></li><li><a class="joy-site-footer__link" href="#">Two</a></li></ul></div>`,
  ).join("")}</div></footer>`;

for (const width of [480, 600, 767]) {
  test(`footer link groups sit in two columns with no orphan at ${width}px (1 to 5 groups)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (let n = 1; n <= 5; n++) {
      await page.setContent(shell("dark", footer(n)));
      const r = await page.evaluate(() => {
        const inner = document
          .querySelector(".joy-site-footer__inner")!
          .getBoundingClientRect();
        const cols = Array.from(
          document.querySelectorAll(".joy-site-footer__column"),
        ).map((c) => c.getBoundingClientRect());
        const rows = new Map<number, DOMRect[]>();
        for (const c of cols)
          rows.set(Math.round(c.top), [
            ...(rows.get(Math.round(c.top)) ?? []),
            c,
          ]);
        const ordered = [...rows.values()];
        return {
          perRow: ordered.map((row) => row.length),
          filled: ordered.map(
            (row) =>
              Math.abs(row[0].left - inner.left) < 2 &&
              Math.abs(row[row.length - 1].right - inner.right) < 2,
          ),
          pageOverflow:
            document.documentElement.scrollWidth - window.innerWidth,
        };
      });
      expect(
        r.filled.every(Boolean),
        `${n} groups at ${width}: rows ${r.perRow.join("+")}`,
      ).toBe(true);
      expect(
        Math.max(...r.perRow),
        `${n} groups at ${width}: two columns`,
      ).toBe(n === 1 ? 1 : 2);
      expect(r.pageOverflow).toBe(0);
    }
  });
}

test("footer link groups stay one column at 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.setContent(shell("light", footer(3)));
  const lefts = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".joy-site-footer__column")).map((c) =>
      Math.round(c.getBoundingClientRect().left),
    ),
  );
  expect(new Set(lefts).size).toBe(1);
});

for (const theme of ["light", "dark"]) {
  test(`bento card chips start where the card text starts and sit at the card bottom in ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const card = (title: string) =>
      `<div class="joy-bento-card joy-bento-card--col-6"><div><div class="joy-bento-card__badge">Badge</div><h4 class="joy-bento-card__title">${title}</h4><p class="joy-bento-card__desc">Short description of the tile.</p></div><div class="joy-bento-card__content"><div style="display:flex;gap:8px"><span class="joy-badge joy-badge--brand joy-badge--sm">chip a</span><span class="joy-badge joy-badge--neutral joy-badge--sm">chip b</span></div></div></div>`;
    // a tall neighbour makes the first card stretch: the chips must go to its bottom, not float in the middle
    const tall = `<div class="joy-bento-card joy-bento-card--col-6"><div><h4 class="joy-bento-card__title">Tall tile</h4><p class="joy-bento-card__desc" style="min-height:220px">Long description.</p></div></div>`;
    await page.setContent(
      shell(
        theme,
        `<div class="joy-bento-grid">${card("Fast routing")}${tall}</div>`,
      ),
    );
    const r = await page.evaluate(() => {
      const cardEl = document.querySelector<HTMLElement>(".joy-bento-card")!;
      const c = cardEl.getBoundingClientRect();
      const title = cardEl
        .querySelector(".joy-bento-card__title")!
        .getBoundingClientRect();
      const chips = cardEl
        .querySelector(".joy-bento-card__content > div")!
        .getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(cardEl).paddingBottom);
      return {
        titleLeft: title.left,
        chipsLeft: chips.left,
        chipsBottomGap: c.bottom - chips.bottom - pad - 1,
      };
    });
    expect(
      Math.abs(r.chipsLeft - r.titleLeft),
      "chip row left edge vs title left edge",
    ).toBeLessThanOrEqual(1);
    expect(
      r.chipsBottomGap,
      "chip row rests on the card padding",
    ).toBeLessThanOrEqual(2);
  });
}
