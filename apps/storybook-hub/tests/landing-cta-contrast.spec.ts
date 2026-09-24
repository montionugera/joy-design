import { test, expect } from "@playwright/test";

const themes = ["light", "dark"] as const;
const views = ["landing-preview", "landing-blocks"] as const;

// F-039 L1: every CTA text (title, description, outline button label) must be readable against the
// background it actually sits on. The band is an inverse surface, so text on it is --joy-text-inverse;
// a CTA rendered without the band must fall back to page text. Both hub CTAs are measured.
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
          for (let node: Element | null = element; node; node = node.parentElement) {
            const [r, g, b, a = 1] = parse(getComputedStyle(node).backgroundColor);
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
          ratio: ratio(
            parse(getComputedStyle(element).color),
            effectiveBackground(element),
          ),
        }));
      }, view);

      expect(results.length).toBeGreaterThanOrEqual(3);
      for (const { label, ratio } of results) {
        expect(ratio, `${label} contrast in ${theme}`).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
}
