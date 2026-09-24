import { test, expect, type Page } from "@playwright/test";
import {
  expectReadableButtons,
  installContrastTools,
  installPageTools,
  measureButtonContrast,
  measureOverflow,
  setTheme,
  type Theme,
} from "./helpers";

// F-039 C2: the acceptance contract of the landing suite, measured in a real browser on the hub's full-page simulator
// (#landing-preview), which is built from the same classes as the LandingPage components. Every number is computed
// from getComputedStyle / getBoundingClientRect. The file runs in both Playwright projects (desktop-chrome and
// mobile-chrome), so each test sets its own viewport. Contrast on the CTA band at 1280 for both hub views is also
// covered by landing-cta-contrast.spec.ts; this file adds the phone viewport and the solid (gradient) button.
// The same overflow / contrast / header contracts run against the REAL components (no hub CSS) in
// landing-component-page.spec.ts.

const themes: Theme[] = ["light", "dark"];
const PAGE = "#simulator-page-container";
const MIN_TARGET = 43.5; // 44px minus 0.5px: Chromium measured a 44px target at 43.99997px (same tolerance as d271622)
const PHONE = { width: 375, height: 812 };
const DESKTOP = { width: 1280, height: 800 };

async function openLanding(page: Page, theme: Theme, size: { width: number; height: number }) {
  await page.setViewportSize(size);
  await page.goto("/#landing-preview");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#view-landing-preview")).toHaveClass(/active/);
  await installPageTools(page);
  await installContrastTools(page);
  await setTheme(page, theme);
}

for (const theme of themes) {
  test.describe(`375x812 in ${theme}`, () => {
    test.beforeEach(({ page }) => openLanding(page, theme, PHONE));

    // (1) The page-root guard (overflow-x: clip) would hide an overflow, so it is forced off for the measurement.
    test("zero horizontal overflow", async ({ page }) => {
      await page.addStyleTag({ content: `${PAGE} { overflow-x: visible !important; }` });
      const overflow = await measureOverflow(page, PAGE);
      expect(overflow.viewport).toBe(PHONE.width);
      expect(overflow.documentScrollWidth, "document scrollWidth vs innerWidth").toBeLessThanOrEqual(overflow.viewport);
      expect(overflow.rootScrollWidth, "page container scrollWidth vs clientWidth").toBeLessThanOrEqual(
        overflow.rootClientWidth,
      );
      expect(overflow.beyond, "elements whose right edge is beyond the viewport").toEqual([]);
    });

    // (2) hero primary (gradient: both stops) and secondary, real label on its effective background
    test("hero buttons are readable", async ({ page }) => {
      const hero = `${PAGE} .joy-hero__ctas`;
      const solid = await measureButtonContrast(page, `${hero} .joy-button--solid`);
      const outline = await measureButtonContrast(page, `${hero} .joy-button--outline`);
      expectReadableButtons(solid, 1, `hero primary in ${theme}`);
      expectReadableButtons(outline, 1, `hero secondary in ${theme}`);
      expect(solid[0].gradient, "the primary is the gradient button").toBe(true);
      // found by role too: both are real, named buttons
      await expect(page.locator(hero).getByRole("button", { name: solid[0].text })).toBeVisible();
      await expect(page.locator(hero).getByRole("button", { name: outline[0].text })).toBeVisible();
    });

    // (3) mobile navigation
    test("menu button opens and closes the drawer", async ({ page }) => {
      const menu = page.locator(`${PAGE} .joy-landing-header__menu`);
      const drawer = page.locator(`${PAGE} [role="dialog"].joy-drawer`);
      await expect(menu).toBeVisible();
      await expect(page.locator(`${PAGE} .joy-landing-header__nav`)).toBeHidden();
      const box = await menu.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { width: r.width, height: r.height };
      });
      expect(box.width, "menu button width").toBeGreaterThanOrEqual(MIN_TARGET);
      expect(box.height, "menu button height").toBeGreaterThanOrEqual(MIN_TARGET);
      await expect(menu).toHaveAttribute("aria-expanded", "false");

      await menu.click();
      await expect(drawer).toBeVisible();
      await expect(menu).toHaveAttribute("aria-expanded", "true");
      const links = page.locator(`${PAGE} .joy-landing-drawer__link`);
      const count = await links.count();
      expect(count, "drawer nav links").toBeGreaterThanOrEqual(3);
      for (let i = 0; i < count; i++) {
        const height = await links.nth(i).evaluate((el) => el.getBoundingClientRect().height);
        expect(height, `drawer link ${i} height`).toBeGreaterThanOrEqual(MIN_TARGET);
      }

      await page.keyboard.press("Escape");
      await expect(drawer).toBeHidden();
      await expect(menu).toHaveAttribute("aria-expanded", "false");
      await expect(menu).toBeFocused();
    });

    // (4) no clipped words in headings
    test("headings are not clipped", async ({ page }) => {
      const headings = await page.evaluate((selector) => {
        return Array.from(document.querySelectorAll<HTMLElement>(`${selector} h1, ${selector} h2`))
          .filter((h) => h.getBoundingClientRect().width > 0)
          .map((h) => ({
            text: (h.textContent ?? "").trim().slice(0, 40),
            scrollWidth: h.scrollWidth,
            clientWidth: h.clientWidth,
          }));
      }, PAGE);
      expect(headings.length, "h1/h2 in the page").toBeGreaterThanOrEqual(3);
      for (const heading of headings) {
        expect(heading.scrollWidth, `"${heading.text}" scrollWidth`).toBeLessThanOrEqual(heading.clientWidth);
      }
    });

    // (5) CTA band: text and both buttons on the raised band (F-039 T1: the band is a raised panel in both themes)
    test("CTA band text and buttons are readable", async ({ page }) => {
      const band = `${PAGE} .joy-cta-section__container`;
      const texts = await page.evaluate((selector) => {
        const container = document.querySelector(selector)!;
        return [".joy-cta-section__title", ".joy-cta-section__desc"].map((cls) => {
          const el = container.querySelector(cls)!;
          return { cls, min: window.__textRatio(el).min, visible: el.getBoundingClientRect().height > 0 };
        });
      }, band);
      for (const text of texts) {
        expect(text.visible, `${text.cls} is visible`).toBe(true);
        expect(text.min, `${text.cls} contrast in ${theme}`).toBeGreaterThanOrEqual(4.5);
      }
      const buttons = await measureButtonContrast(page, `${band} .joy-cta-section__actions .joy-button`);
      expectReadableButtons(buttons, 2, `CTA band in ${theme}`);
      expect(buttons.map((b) => b.gradient)).toEqual([true, false]);
    });

    // (6) buttons fill the hero content box on a phone
    test("hero buttons are full width", async ({ page }) => {
      const result = await page.evaluate(() => {
        const hero = document.querySelector<HTMLElement>("#simulator-page-container .joy-hero")!;
        const style = getComputedStyle(hero);
        const content =
          hero.getBoundingClientRect().width - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        const buttons = Array.from(document.querySelectorAll<HTMLElement>("#simulator-page-container .joy-hero__ctas .joy-button")).map(
          (b) => b.getBoundingClientRect().width,
        );
        return { content, buttons };
      });
      expect(result.buttons.length).toBe(2);
      for (const width of result.buttons) {
        expect(Math.abs(width - result.content), `button ${width} vs hero content ${result.content}`).toBeLessThanOrEqual(1);
      }
    });
  });

  test.describe(`1280x800 in ${theme}`, () => {
    test.beforeEach(({ page }) => openLanding(page, theme, DESKTOP));

    test("inline nav, side by side buttons, no overflow", async ({ page }) => {
      await expect(page.locator(`${PAGE} .joy-landing-header__menu`)).toBeHidden();
      await expect(page.locator(`${PAGE} .joy-landing-header__nav`)).toBeVisible();
      const [primary, secondary] = await page.evaluate(() =>
        Array.from(document.querySelectorAll("#simulator-page-container .joy-hero__ctas .joy-button")).map((b) => {
          const r = b.getBoundingClientRect();
          return { top: r.top, bottom: r.bottom, left: r.left, right: r.right };
        }),
      );
      expect(Math.abs(primary.top - secondary.top), "same row").toBeLessThanOrEqual(2);
      expect(secondary.left, "secondary sits to the right of the primary").toBeGreaterThanOrEqual(primary.right);

      await page.addStyleTag({ content: `${PAGE} { overflow-x: visible !important; }` });
      const overflow = await measureOverflow(page, PAGE);
      expect(overflow.documentScrollWidth).toBeLessThanOrEqual(overflow.viewport);
      expect(overflow.rootScrollWidth).toBeLessThanOrEqual(overflow.rootClientWidth);
      expect(overflow.beyond).toEqual([]);
    });
  });
}

// C2.3 dark rendering contract: the dark theme is a token remap, so each landing surface must actually change and
// every text colour on it must stay readable on the surface it really sits on.
const darkSurfaces = [
  ".joy-feature-card",
  ".joy-stats-section",
  ".joy-faq-section",
  ".joy-site-footer",
  ".joy-logo-cloud",
] as const;

test.describe("dark rendering at 1280", () => {
  for (const selector of darkSurfaces) {
    test(`${selector} is repainted and readable in dark`, async ({ page }) => {
      await openLanding(page, "light", DESKTOP);
      const surface = (sel: string) =>
        page.evaluate((s) => {
          const el = document.querySelector(`#simulator-page-container ${s}`)!;
          return {
            computed: getComputedStyle(el).backgroundColor,
            effective: window.__surfaces(el)[0].map(Math.round),
          };
        }, sel);
      const light = await surface(selector);

      await setTheme(page, "dark");
      const dark = await surface(selector);
      const sweep = await page.evaluate((s) => {
        const results = Array.from(document.querySelectorAll(`#simulator-page-container ${s}`)).map((el) =>
          window.__lowContrast(el, 4.5),
        );
        return {
          checked: results.reduce((sum, r) => sum + r.checked, 0),
          failures: results.flatMap((r) => r.failures),
        };
      }, selector);

      // A surface may paint nothing itself (transparent) and take the repainted page canvas: then the computed
      // background-color is the same in both themes and only the effective background (composited up the ancestors)
      // shows the repaint. A surface that paints its own colour must change it.
      if (light.computed !== "rgba(0, 0, 0, 0)" || dark.computed !== "rgba(0, 0, 0, 0)") {
        expect(dark.computed, `${selector} background-color, dark vs light`).not.toBe(light.computed);
      }
      expect(dark.effective, `${selector} effective background, dark vs light`).not.toEqual(light.effective);
      expect(sweep.checked, `${selector} text elements measured`).toBeGreaterThan(0);
      expect(sweep.failures, `${selector} text below 4.5:1 in dark`).toEqual([]);
    });
  }
});
