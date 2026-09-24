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
  measureOverflow,
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
const ssr: { react: string; svelte: string } = JSON.parse(
  execFileSync("node", [path.resolve(__dirname, "../scripts/render-landing-ssr.mjs")], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  }),
);

const twins = ["react", "svelte"] as const;
const themes: Theme[] = ["light", "dark"];
const viewports = [
  { width: 375, height: 812 },
  { width: 1280, height: 800 },
] as const;
const PAGE = ".joy-landing-page";

async function openComponentPage(page: Page, twin: (typeof twins)[number], theme: Theme, viewport: (typeof viewports)[number]) {
  await page.setViewportSize(viewport);
  await page.setContent(
    `<!doctype html><html data-theme="${theme}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>landing</title><style>${themeCss}</style></head><body>${ssr[twin]}</body></html>`,
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
            expect(text.min, `${twin} ${text.cls} on the inverse band`).toBeGreaterThanOrEqual(4.5);
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
            expect(box.width, "menu button width").toBeGreaterThanOrEqual(44);
            expect(box.height, "menu button height").toBeGreaterThanOrEqual(44);
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
