import { test, expect, type Page } from "@playwright/test";
import { setTheme, type Theme } from "./helpers";

// F-039 T2 (taste review P1-2, P1-5, P1-7, P2-3, P2-12, P2-15): the hub full-page simulator is generated from the real
// LandingPage render plus a features heading and a pricing section, the frame-width switcher does not overprint at 375px,
// and the blocks view tells the truth (grid columns, links, logo icons, stat pills).
// Every number is measured in Chromium against the built hub (dist).

const themes: Theme[] = ["light", "dark"];
const SIM = "#simulator-page-container";

async function open(page: Page, view: string, width: number, theme: Theme) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`/#${view}`);
  await page.waitForLoadState("networkidle");
  await expect(page.locator(`#view-${view}`)).toHaveClass(/active/);
  await setTheme(page, theme);
}

type GridRows = { selector: string; cells: number; perRow: number[]; full: boolean[] };

/** Rows of every grid matching `sels` under `root` (cells grouped by top edge) and whether each row spans the grid's full width. Self-contained: it is serialised into the page. */
function measureRows(args: { root: string; sels: string[] }): GridRows[] {
  const out: GridRows[] = [];
  for (const selector of args.sels) {
    for (const grid of Array.from(document.querySelectorAll<HTMLElement>(`${args.root} ${selector}`))) {
      const box = grid.getBoundingClientRect();
      if (box.width === 0) continue;
      const cells = Array.from(grid.children).map((c) => c.getBoundingClientRect()).filter((r) => r.width > 0);
      // A cell joins the current row while it starts above that row's first cell's bottom edge (a lifted featured card is still in its row).
      const ordered: DOMRect[][] = [];
      for (const r of [...cells].sort((a, b) => a.top - b.top || a.left - b.left)) {
        const row = ordered[ordered.length - 1];
        if (row && r.top < row[0].bottom - 4) row.push(r);
        else ordered.push([r]);
      }
      out.push({
        selector,
        cells: cells.length,
        perRow: ordered.map((row) => row.length),
        full: ordered.map((row) => {
          const left = Math.min(...row.map((r) => r.left));
          const right = Math.max(...row.map((r) => r.right));
          return Math.abs(left - box.left) <= 1.5 && Math.abs(right - box.right) <= 1.5;
        }),
      });
    }
  }
  return out;
}

const GRIDS = [".joy-stats-grid", ".joy-feature-grid", ".joy-pricing-matrix:not(.joy-pricing-matrix--table)"];

test.describe("simulator body (generated from the components)", () => {
  for (const theme of themes) {
    test(`${theme}: sections, anchors and headings that make it read as a landing page`, async ({ page }) => {
      await open(page, "landing-preview", 1280, theme);
      const facts = await page.evaluate((sim) => {
        const root = document.querySelector(sim)!;
        const heading = (sel: string) => {
          const el = root.querySelector<HTMLElement>(sel);
          return el ? { text: el.textContent!.trim(), size: parseFloat(getComputedStyle(el).fontSize), tag: el.tagName } : null;
        };
        const navHrefs = Array.from(root.querySelectorAll<HTMLAnchorElement>(".joy-landing-header__link, .joy-landing-drawer__link")).map((a) => a.getAttribute("href")!);
        return {
          ids: ["sim-features", "sim-pricing", "sim-telemetry", "sim-faq"].map((id) => !!root.querySelector(`#${id}`)),
          navHrefs,
          navTargets: navHrefs.map((h) => !!root.querySelector(h)),
          features: heading("#sim-features .joy-landing-page__section-title"),
          pricing: heading("#sim-pricing .joy-landing-page__section-title"),
          faq: heading("#sim-faq .joy-faq-section__title"),
          cards: root.querySelectorAll("#sim-pricing .joy-pricing-card").length,
          featured: root.querySelectorAll("#sim-pricing .joy-pricing-card--featured").length,
          tables: root.querySelectorAll("#sim-pricing table.joy-pricing-matrix__table").length,
          disclosure: /features heading and (a )?pricing/.test(document.getElementById("view-landing-preview")!.textContent ?? ""),
          brands: Array.from(new Set((root.textContent ?? "").match(/Joymify (?:Design|Quant)/g) ?? [])),
        };
      }, SIM);
      expect(facts.ids, "sections have ids").toEqual([true, true, true, true]);
      expect(facts.navHrefs, "header and drawer nav both link the four sections").toEqual(
        expect.arrayContaining(["#sim-features", "#sim-pricing", "#sim-faq"]),
      );
      expect(facts.navTargets.every(Boolean), `every nav link has a target: ${facts.navHrefs.join(", ")}`).toBe(true);
      for (const h of [facts.features, facts.pricing, facts.faq]) {
        expect(h, "section heading exists").not.toBeNull();
        expect(h!.tag).toBe("H2");
        expect(h!.size, `${h!.text} is display size`).toBeGreaterThanOrEqual(28);
      }
      expect(facts.features!.size, "features and pricing headings share the FAQ display size").toBe(facts.faq!.size);
      expect(facts.pricing!.size).toBe(facts.faq!.size);
      expect(facts.cards, "three plan cards").toBe(3);
      expect(facts.featured, "one featured plan").toBe(1);
      expect(facts.tables, "the comparison table").toBe(1);
      expect(facts.brands, "one brand name on the page").toEqual(["Joymify Design"]);
      expect(facts.disclosure, "the hub text says the features heading and pricing are added around the component output").toBe(true);
    });

    test(`${theme}: feature tags are padded chips, not bare text highlights`, async ({ page }) => {
      await open(page, "landing-preview", 1280, theme);
      const chips = await page.evaluate((sim) =>
        Array.from(document.querySelectorAll<HTMLElement>(`${sim} .joy-feature-card__badge .joy-badge`)).map((el) => {
          const cs = getComputedStyle(el);
          return { text: el.textContent!.trim(), padX: parseFloat(cs.paddingLeft), padY: parseFloat(cs.paddingTop), radius: parseFloat(cs.borderTopLeftRadius) };
        }),
      SIM);
      expect(chips.length, "three feature tags").toBe(3);
      for (const c of chips) {
        expect(c.padX, `${c.text} horizontal padding`).toBeGreaterThanOrEqual(6);
        expect(c.padY, `${c.text} vertical padding`).toBeGreaterThanOrEqual(2);
        expect(c.radius, `${c.text} is a pill`).toBeGreaterThanOrEqual(8);
      }
    });

    test(`${theme}: page ids are unique and every badge has a size class`, async ({ page }) => {
      await open(page, "landing-preview", 1280, theme);
      const dup = await page.evaluate(() => {
        const seen = new Map<string, number>();
        document.querySelectorAll("[id]").forEach((el) => seen.set(el.id, (seen.get(el.id) ?? 0) + 1));
        return [...seen].filter(([, n]) => n > 1).map(([id]) => id);
      });
      expect(dup, "duplicate ids in the hub document").toEqual([]);
      const bare = await page.evaluate((sim) => Array.from(document.querySelectorAll<HTMLElement>(`${sim} .joy-badge`)).filter((b) => !/\bjoy-badge--(sm|md)\b/.test(b.className)).length, SIM);
      expect(bare, "badges without a size modifier (no padding)").toBe(0);
    });
  }

  for (const theme of themes) {
    for (const width of [375, 768, 1024, 1280]) {
      test(`${theme} ${width}px window: no empty grid cell in stats, features or pricing`, async ({ page }) => {
        await open(page, "landing-preview", width, theme);
        const all = await page.evaluate(measureRows, { root: SIM, sels: GRIDS });
        const seen = new Set(all.map((g) => g.selector));
        expect(seen.size, `grids found: ${[...seen].join(", ")}`).toBe(GRIDS.length);
        for (const g of all) {
          expect(g.full.every(Boolean), `${g.selector} (${g.cells} cells) at ${width}: rows ${g.perRow.join("+")}`).toBe(true);
        }
      });
    }
  }

  for (const theme of themes) {
    for (const [label, frame] of [["Tablet", 768], ["Mobile", 375]] as const) {
      test(`${theme}: ${label} frame at a 1280 window keeps every grid full and the pricing cards in their frame`, async ({ page }) => {
        await open(page, "landing-preview", 1280, theme);
        await page.getByRole("button", { name: new RegExp(`^${label}`) }).click();
        await page.waitForTimeout(400);
        const all = await page.evaluate(measureRows, { root: SIM, sels: GRIDS });
        for (const g of all) expect(g.full.every(Boolean), `${g.selector} in the ${frame}px frame: rows ${g.perRow.join("+")}`).toBe(true);
        const escaped = await page.evaluate(
          ([sim]) => {
            const frameBox = document.getElementById("simulator-viewport-frame")!.getBoundingClientRect();
            return Array.from(document.querySelectorAll<HTMLElement>(`${sim} #sim-pricing .joy-pricing-card`)).filter((c) => c.getBoundingClientRect().right > frameBox.right + 1).length;
          },
          [SIM],
        );
        expect(escaped, "plan cards past the frame edge").toBe(0);
      });
    }
  }
});

test.describe("frame width switcher", () => {
  for (const theme of themes) {
    for (const width of [320, 375, 480, 768, 1280]) {
      test(`${theme} ${width}px: the three segments never overlap or clip`, async ({ page }) => {
        await open(page, "landing-preview", width, theme);
        const m = await page.evaluate(() => {
          const control = document.getElementById("simulator-viewport-ctrl")!;
          const box = control.getBoundingClientRect();
          const buttons = Array.from(control.querySelectorAll<HTMLElement>(".segment-btn"));
          const rects = buttons.map((b) => b.getBoundingClientRect());
          const overlaps: string[] = [];
          for (let i = 0; i < rects.length; i++)
            for (let j = i + 1; j < rects.length; j++) {
              const a = rects[i], b = rects[j];
              const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
              const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
              if (w > 0.5 && h > 0.5) overlaps.push(`${i}x${j}`);
            }
          const label = document.getElementById("simulator-viewport-label")!;
          const ls = getComputedStyle(label);
          return {
            texts: buttons.map((b) => b.innerText.replace(/\s+/g, " ").trim()),
            overlaps,
            rows: new Set(rects.map((r) => Math.round(r.top))).size,
            clipped: buttons.filter((b) => b.scrollWidth > b.clientWidth + 1).length,
            outside: rects.filter((r) => r.left < box.left - 1 || r.right > box.right + 1).length,
            controlRight: box.right,
            vw: window.innerWidth,
            label: { text: label.textContent!.trim(), transform: ls.textTransform, spacing: ls.letterSpacing },
            pageOverflow: document.documentElement.scrollWidth - window.innerWidth,
            hasOldLabel: /1440px/.test(document.getElementById("view-landing-preview")!.textContent ?? ""),
          };
        });
        expect(m.overlaps, `segments overlapping at ${width}: ${m.texts.join(" | ")}`).toEqual([]);
        expect(m.rows, "the three segments sit in one row").toBe(1);
        expect(m.clipped, "segments whose text is wider than the segment").toBe(0);
        expect(m.outside, "segments outside the control").toBe(0);
        expect(m.controlRight, "control inside the window").toBeLessThanOrEqual(m.vw);
        expect(m.pageOverflow, "no sideways scroll").toBeLessThanOrEqual(0);
        expect(m.label.text).toBe("Frame width");
        expect(m.label.transform, "sentence case, not all caps").toBe("none");
        expect(m.label.spacing, "no tracked letters").toBe("normal");
        expect(m.hasOldLabel, "no inaccurate 1440px label on a fluid frame").toBe(false);
        if (width <= 480) expect(m.texts).toEqual(["Desktop", "Tablet", "Mobile"]);
      });
    }
  }
});

test.describe("blocks view tells the truth", () => {
  for (const theme of themes) {
    test(`${theme} 1280px: uniform grid columns match the label, plan cards fill their rows`, async ({ page }) => {
      await open(page, "landing-blocks", 1280, theme);
      const pricing = await page.evaluate(measureRows, { root: "#view-landing-blocks", sels: [".joy-pricing-matrix:not(.joy-pricing-matrix--table)"] });
      const facts = await page.evaluate(() => {
        const grid = document.getElementById("blocks-feature-uniform")!;
        const label = grid.closest(".landing-demo__group")!.querySelector(".landing-demo__label")!.textContent!.trim();
        const cells = Array.from(grid.children).map((c) => c.getBoundingClientRect());
        const cols = new Set(cells.map((r) => Math.round(r.left))).size;
        const box = grid.getBoundingClientRect();
        const full = grid.children.length % cols === 0;
        return { label, cols, cells: cells.length, full, width: box.width };
      });
      expect(facts.label).toBe("Uniform layout, up to 3 columns");
      expect(facts.cols, `uniform grid columns at ${facts.width}px (the columns prop is a maximum)`).toBeGreaterThanOrEqual(2);
      expect(facts.cols).toBeLessThanOrEqual(3);
      expect(facts.full, "the last row is full").toBe(true);
      expect(pricing.length, "two pricing groups").toBe(2);
      for (const g of pricing) expect(g.full.every(Boolean), `plan cards rows ${g.perRow.join("+")}`).toBe(true);
      expect(pricing[0].perRow, "three plans in one row").toEqual([3]);
    });

    test(`${theme}: feature links go where their copy says, every logo has a mark, stat pills are not cut`, async ({ page }) => {
      await open(page, "landing-blocks", 375, theme);
      const facts = await page.evaluate(() => {
        const twin = Array.from(document.querySelectorAll<HTMLAnchorElement>("#view-landing-blocks .joy-feature-card")).find((c) => c.querySelector(".joy-feature-card__title")!.textContent!.trim() === "Svelte 5 and React 19")!;
        const link = twin.querySelector<HTMLAnchorElement>(".joy-feature-card__link")!;
        const logos = Array.from(document.querySelectorAll<HTMLElement>("#view-landing-blocks .joy-logo-cloud__item"));
        const pills = Array.from(document.querySelectorAll<HTMLElement>("#view-landing-blocks .joy-stat-item__change"));
        return {
          link: { text: link.textContent!.trim(), href: link.getAttribute("href")! },
          target: !!document.getElementById(`view-${link.getAttribute("href")!.slice(1)}`),
          logosWithoutMark: logos.filter((l) => l.querySelectorAll("svg > :not(text)").length === 0).length,
          logos: logos.length,
          cutPills: pills.filter((p) => p.scrollWidth > p.clientWidth + 1).map((p) => p.textContent!.trim()),
        };
      });
      expect(facts.link.text, "the twin packages card links to the overview").toBe("See the overview");
      expect(facts.link.href).toBe("#overview");
      expect(facts.target, "the overview view exists").toBe(true);
      expect(facts.logos).toBeGreaterThan(0);
      expect(facts.logosWithoutMark, "logos with a text-only wordmark").toBe(0);
      expect(facts.cutPills, "stat pills wider than their card at 375px").toEqual([]);
    });
  }
});
