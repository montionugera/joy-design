import { test, expect } from "@playwright/test";

const themes = ["light", "dark"] as const;
const views = ["landing-preview", "landing-blocks"] as const;

// F-039 L1: every CTA text (title, description, outline button label) must be readable against the
// background it actually sits on. F-039 T1: the band is a raised panel in both themes (white in light, lifted navy in
// dark; never the inverse surface, which is cream in dark), so text on it is page text. Both hub CTAs are measured.
for (const theme of themes) {
  for (const view of views) {
    test(`hub ${view} CTA text is readable in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`/#${view}`);
      await page.waitForLoadState("networkidle");
      await page.evaluate((selected) => {
        document.documentElement.setAttribute("data-theme", selected);
      }, theme);
      await expect(page.locator(`#view-${view}`)).toHaveClass(/active/);
      // buttons transition colour after a theme switch; measure the settled state
      await page.addStyleTag({
        content: "*, *::before, *::after { transition: none !important; }",
      });

      const results = await page.evaluate((viewId) => {
        const parse = (value: string) =>
          (value.match(/[\d.]+/g) ?? []).slice(0, 4).map(Number);
        const luminance = ([r, g, b]: number[]) => {
          const lin = (c: number) => {
            const s = c / 255;
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
        };
        const effectiveBackground = (element: Element) => {
          for (
            let node: Element | null = element;
            node;
            node = node.parentElement
          ) {
            const [r, g, b, a = 1] = parse(
              getComputedStyle(node).backgroundColor,
            );
            if (a > 0.99) return [r, g, b];
          }
          return [255, 255, 255];
        };
        const ratio = (fg: number[], bg: number[]) => {
          const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
          return (hi + 0.05) / (lo + 0.05);
        };
        const root = document.querySelector(`#view-${viewId}`)!;
        const targets = root.querySelectorAll(
          ".joy-cta-section__title, .joy-cta-section__desc, .joy-cta-section .joy-button--outline",
        );
        return Array.from(targets).map((element) => ({
          label: element.className,
          disabled: (element as HTMLButtonElement).disabled === true,
          ratio: ratio(
            parse(getComputedStyle(element).color),
            effectiveBackground(element),
          ),
        }));
      }, view);

      expect(results.length).toBeGreaterThanOrEqual(3);
      for (const { label, ratio, disabled } of results) {
        // A live label is AA (4.5). WCAG 1.4.3 exempts a disabled control, so its dimmed label (--joy-text-disabled, 4.23:1
        // on the dark raised band) only has to stay legible: 3:1, never lower.
        expect(
          ratio,
          `${label} contrast in ${theme}${disabled ? " (disabled)" : ""}`,
        ).toBeGreaterThanOrEqual(disabled ? 3 : 4.5);
      }
    });
  }
}

// F-039 T1 (taste review P1-3): in dark the CTA band must not be the brightest slab on the page (it used the inverse
// surface, cream in dark). Measured on the hub blocks view: the band fill is dark and darker than the page text.
for (const view of views) {
  test(`hub ${view} dark CTA band is not a cream slab`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`/#${view}`);
    await page.waitForLoadState("networkidle");
    await page.evaluate(() =>
      document.documentElement.setAttribute("data-theme", "dark"),
    );
    await expect(page.locator(`#view-${view}`)).toHaveClass(/active/);
    const result = await page.evaluate((viewId) => {
      const lin = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      const lum = (css: string) => {
        const [r, g, b] = (css.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
        return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      };
      const band = document.querySelector(
        `#view-${viewId} .joy-cta-section__container`,
      )!;
      const title = band.querySelector(".joy-cta-section__title")!;
      return {
        band: lum(getComputedStyle(band).backgroundColor),
        text: lum(getComputedStyle(title).color),
      };
    }, view);
    expect(result.band, "dark band fill luminance").toBeLessThan(0.05);
    expect(result.band, "band is darker than its own text").toBeLessThan(
      result.text / 4,
    );
  });
}
