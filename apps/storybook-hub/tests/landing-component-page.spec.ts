import { test, expect, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  expectReadableButtons,
  installContrastTools,
  installPageTools,
  measureButtonContrast,
  expectReadablePressedButton,
  measureOverflow,
  measurePressedButtonContrast,
  type Theme,
} from "./helpers";

// F-039 C2 (real components): the overflow, contrast and header contracts of landing-contracts.spec.ts, run against the
// SSR markup of the REAL LandingPage twins (React and Svelte) on a page built from the committed
// packages/tokens/dist/theme.css ONLY: no hub CSS, no reset, default browser body margin. The hub's own reset once hid a
// 24-40px overflow (CTA band without box-sizing) that a consumer page would have shown; this spec would have caught it.
//
// The markup comes from apps/storybook-hub/scripts/render-landing-ssr.mjs, run in a child process (it loads the .tsx and
// .svelte sources through the SSR test helpers, which register their own module hooks). It reads sources only and never
// builds anything. theme.css is a committed file that no test rewrites.
//
// The drawer (open, close, Escape, focus return) cannot be tested here: SSR markup has no JavaScript, so a click does
// nothing. That interaction contract lives in landing-contracts.spec.ts against the hub simulator, and the class parity of
// hub header and component header is asserted by packages/{svelte,react}/test/landing-page.test.js.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const themeCss = fs.readFileSync(path.resolve(__dirname, "../../../packages/tokens/dist/theme.css"), "utf8");
const script = path.resolve(__dirname, "../scripts/render-landing-ssr.mjs");
const raw = execFileSync(process.execPath, [script], {
  encoding: "utf8",
  timeout: 300_000,
  // the two default pages are ~15 KB each; 16 MB leaves room for growth without hiding a runaway output
  maxBuffer: 16 * 1024 * 1024,
});
const ssr = JSON.parse(raw) as Record<string, unknown>;
for (const twin of ["react", "svelte"]) {
  const html = ssr[twin];
  if (typeof html !== "string" || !html.includes('class="joy-landing-page')) {
    throw new Error(`render-landing-ssr.mjs did not return the ${twin} LandingPage markup (got ${typeof html})`);
  }
}
const markup = ssr as { react: string; svelte: string };

const twins = ["react", "svelte"] as const;
const themes: Theme[] = ["light", "dark"];
const viewports = [
  { width: 375, height: 812 },
  { width: 1280, height: 800 },
] as const;
const MIN_TARGET = 43.5; // 44px minus 0.5px: Chromium measured a 44px target at 43.99997px (same tolerance as d271622)
const PAGE = ".joy-landing-page";

async function openComponentPage(page: Page, twin: (typeof twins)[number], theme: Theme, viewport: (typeof viewports)[number]) {
  await page.setViewportSize(viewport);
  await page.setContent(
    `<!doctype html><html data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>landing</title><style>${themeCss}</style></head><body>${markup[twin]}</body></html>`,
  );
  await installPageTools(page);
  await installContrastTools(page);
  // the page root's overflow guard would hide an overflow: force it off for every measurement
  await page.addStyleTag({ content: `${PAGE} { overflow-x: visible !important; }` });
  await page.evaluate((selector) => {
    (document.querySelector(selector) as HTMLElement).style.overflowX = "visible";
  }, PAGE);
  // no transitions: colours are measured in their settled state
  await page.addStyleTag({ content: "*, *::before, *::after { transition: none !important; animation: none !important; }" });
}

for (const twin of twins) {
  for (const theme of themes) {
    for (const viewport of viewports) {
      test.describe(`${twin} LandingPage at ${viewport.width}px in ${theme}`, () => {
        test.beforeEach(({ page }) => openComponentPage(page, twin, theme, viewport));

        test("no horizontal overflow with the page guard off", async ({ page }) => {
          const overflow = await measureOverflow(page, PAGE);
          expect(overflow.viewport).toBe(viewport.width);
          expect(overflow.documentScrollWidth, "document scrollWidth vs innerWidth").toBeLessThanOrEqual(overflow.viewport);
          expect(overflow.rootScrollWidth, ".joy-landing-page scrollWidth vs clientWidth").toBeLessThanOrEqual(
            overflow.rootClientWidth,
          );
          expect(overflow.beyond, "elements whose right edge is beyond the viewport").toEqual([]);
        });

        test("hero and CTA band buttons are readable on their real surfaces", async ({ page }) => {
          const heroSolid = await measureButtonContrast(page, `${PAGE} .joy-hero__ctas .joy-button--solid`);
          const heroOutline = await measureButtonContrast(page, `${PAGE} .joy-hero__ctas .joy-button--outline`);
          expectReadableButtons(heroSolid, 1, `${twin} hero primary`);
          expectReadableButtons(heroOutline, 1, `${twin} hero secondary`);
          expect(heroSolid[0].gradient, "the hero primary is the gradient button").toBe(true);

          const band = `${PAGE} .joy-cta-section__container`;
          const bandButtons = await measureButtonContrast(page, `${band} .joy-cta-section__actions .joy-button`);
          expectReadableButtons(bandButtons, 2, `${twin} CTA band`);
          const bandText = await page.evaluate((selector) => {
            const container = document.querySelector(selector)!;
            return [".joy-cta-section__title", ".joy-cta-section__desc"].map((cls) => ({
              cls,
              min: window.__textRatio(container.querySelector(cls)!).min,
            }));
          }, band);
          for (const text of bandText) {
            expect(text.min, `${twin} ${text.cls} on the raised band`).toBeGreaterThanOrEqual(4.5);
          }
        });

        // F-039 G1: the pressed (:active) fill of the solid landing buttons keeps the label at 4.5:1 (the shared pressed
        // fill was 4.20:1 in light). The pointer is really held on the button. The default page has no pricing card: the
        // featured card is covered in landing-contracts.spec.ts.
        test("pressed solid buttons keep 4.5:1: hero primary and CTA band", async ({ page }) => {
          for (const [name, selector] of [
            ["hero primary", `${PAGE} .joy-hero__ctas .joy-button--solid`],
            ["CTA band", `${PAGE} .joy-cta-section__container .joy-button--solid`],
          ] as const) {
            expectReadablePressedButton(await measurePressedButtonContrast(page, selector), `${twin} ${name} in ${theme}`);
          }
        });

        // F-039 F1 (taste review 2, P1-A): a metric claim is never cut off, on the page a consumer really gets.
        test("stat change pills show their whole text in at most 2 lines inside their card", async ({ page }) => {
          const facts = await page.evaluate(() => {
            const pills = Array.from(document.querySelectorAll<HTMLElement>(".joy-stat-item__change"));
            return pills.map((pill) => {
              const text = pill.querySelector<HTMLElement>(".joy-stat-item__change-text")!;
              const card = pill.closest(".joy-stat-item")!.getBoundingClientRect();
              const cs = getComputedStyle(pill);
              return {
                label: text.textContent,
                cut: text.scrollWidth > text.clientWidth + 1 || getComputedStyle(text).textOverflow === "ellipsis",
                lines: Math.round(
                  (pill.getBoundingClientRect().height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) /
                    (parseFloat(cs.fontSize) * 1.25),
                ),
                inside: pill.getBoundingClientRect().right <= card.right + 0.5,
              };
            });
          });
          expect(facts.length, "the default page shows stat pills").toBeGreaterThan(0);
          for (const f of facts) {
            expect(f.cut, `${f.label}: fully visible`).toBe(false);
            expect(f.lines, `${f.label}: lines`).toBeLessThanOrEqual(2);
            expect(f.inside, `${f.label}: inside its card`).toBe(true);
          }
        });

        test("header shows the menu button below 768px and the inline nav from 768px", async ({ page }) => {
          const menu = page.locator(`${PAGE} .joy-landing-header__menu`);
          const nav = page.locator(`${PAGE} .joy-landing-header__nav`);
          if (viewport.width < 768) {
            const box = await menu.evaluate((el) => {
              const r = el.getBoundingClientRect();
              return { width: r.width, height: r.height };
            });
            expect(box.width, "menu button width").toBeGreaterThanOrEqual(MIN_TARGET);
            expect(box.height, "menu button height").toBeGreaterThanOrEqual(MIN_TARGET);
            await expect(menu).toBeVisible();
            await expect(nav).toBeHidden();
          } else {
            await expect(menu).toBeHidden();
            await expect(nav).toBeVisible();
          }
        });
      });
    }
  }
}

// Dark text sweep on the real components (1280, dark): the same five surfaces as the hub contract in
// landing-contracts.spec.ts, on the component page without hub CSS.
const darkSurfaces = [".joy-feature-card", ".joy-stats-section", ".joy-faq-section", ".joy-site-footer", ".joy-logo-cloud"];
for (const twin of twins) {
  test(`${twin} LandingPage text is readable on every surface in dark at 1280px`, async ({ page }) => {
    await openComponentPage(page, twin, "dark", viewports[1]);
    for (const selector of darkSurfaces) {
      const sweep = await page.evaluate(
        ({ page: root, sel }) => {
          const results = Array.from(document.querySelectorAll(`${root} ${sel}`)).map((el) => window.__lowContrast(el, 4.5));
          return {
            checked: results.reduce((sum, r) => sum + r.checked, 0),
            failures: results.flatMap((r) => r.failures),
          };
        },
        { page: PAGE, sel: selector },
      );
      expect(sweep.checked, `${twin} ${selector} text elements measured`).toBeGreaterThan(0);
      expect(sweep.failures, `${twin} ${selector} text below 4.5:1`).toEqual([]);
    }
  });
}

// Self-test of the measuring helper: a gradient it cannot resolve to opaque colours must throw, not pass silently.
test("__surfaces refuses a gradient with a transparent stop", async ({ page }) => {
  await page.setContent(
    `<!doctype html><body><div id="t" style="background-image: linear-gradient(transparent, red)">x</div><div id="ok" style="background-image: linear-gradient(red, blue)">x</div></body>`,
  );
  await installPageTools(page);
  await installContrastTools(page);
  const ok = await page.evaluate(() => window.__surfaces(document.querySelector("#ok")!));
  expect(ok.length, "an opaque two-stop gradient yields one surface per stop").toBe(2);
  const message = await page.evaluate(() => {
    try {
      window.__surfaces(document.querySelector("#t")!);
      return "no error";
    } catch (error) {
      return String(error);
    }
  });
  expect(message).toMatch(/__surfaces/);
});
