import { test, expect } from "@playwright/test";
import { setTheme } from "./helpers";

test("F-043: header shows the diamond mark and the page has a favicon", async ({
  page,
}) => {
  await page.goto("/");
  // The sidebar's .brand-logo and the topbar's compact twin are complementary across the drawer
  // breakpoint (max-width: 900px): the sidebar is visibility: hidden while closed on narrow
  // viewports (mobile-chrome), and .topbar-brand is display: none on wide ones (desktop-chrome).
  // Both are always attached; exactly one is visible at any given viewport.
  await expect(page.locator(".brand-logo svg")).toHaveCount(2);
  await expect(page.locator(".brand-logo svg:visible")).toHaveCount(1);
  const logos = page.locator(".brand-logo");
  await expect(logos.first()).not.toHaveText("J");
  await expect(logos.nth(1)).not.toHaveText("J");
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    "href",
    /favicon\.svg$/,
  );
});

for (const theme of ["light", "dark"] as const) {
  test(`F-043: Brand view renders in ${theme} with no console errors`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await page.goto("/#brand");
    await setTheme(page, theme);
    const view = page.locator("#view-brand");
    await expect(
      view.getByRole("heading", { name: "Brand Assets", exact: true }),
    ).toBeVisible();
    await expect(view.locator(".joy-ribbon").first()).toBeVisible();
    await expect(view.locator(".joy-brand-banner")).toBeVisible();
    expect(errors).toEqual([]);
  });
}

for (const theme of ["light", "dark"] as const) {
  test(`F-043: colour token values are resolved at runtime in ${theme}`, async ({
    page,
  }) => {
    await page.goto("/#brand");
    await setTheme(page, theme);
    const cells = page.locator("#view-brand .token-value[data-token]");
    await expect(cells).toHaveCount(6);
    const results = await cells.evaluateAll((els) =>
      els.map((el) => {
        const token = el.getAttribute("data-token")!;
        return {
          token,
          text: (el.textContent ?? "").trim(),
          resolved: getComputedStyle(document.documentElement)
            .getPropertyValue(token)
            .trim(),
        };
      }),
    );
    for (const { token, text, resolved } of results) {
      expect(text, `${token} in ${theme}`).not.toBe("");
      expect(text, `${token} in ${theme} matches getComputedStyle`).toBe(
        resolved,
      );
    }
  });
}

test("F-043: brand asset downloads are real images", async ({
  page,
  request,
}) => {
  await page.goto("/#brand");
  const rawHrefs = await page
    .locator("#view-brand a[download]")
    .evaluateAll((as) =>
      as.map((a) => (a as HTMLAnchorElement).getAttribute("href")),
    );
  const hrefs = rawHrefs.filter((href): href is string => Boolean(href));
  expect(hrefs.length).toBe(rawHrefs.length);
  expect(hrefs.length).toBeGreaterThanOrEqual(10);
  for (const href of hrefs) {
    const res = await request.get(href);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/image\/(svg\+xml|png)/);
  }
});

// Fix round (final review Important #1): the shared .joy-button--outline sets its own `color`,
// which used to win over the banner's `color: var(--joy-brand-ink-on-tile)`, so the secondary CTA
// rendered dark ink (1.11:1 text, 1.91:1 border) on the navy tile in light theme. Both a
// `.joy-brand-banner .joy-button--outline` override and this test cover default, hover and
// focus-visible: the override sets color/border-color once, so those states inherit it unless a
// pseudo-class re-wins (hover/active here only touch `background`/`box-shadow`, never `color` or
// `border-color`), and this test asserts the resting values against the WCAG floors (4.5:1 text,
// 3:1 border) in both themes, computed from getComputedStyle against the real theme.css.
for (const theme of ["light", "dark"] as const) {
  test(`F-043: BrandBanner secondary CTA is readable in ${theme}`, async ({
    page,
  }) => {
    await page.goto("/#brand");
    await setTheme(page, theme);
    await page.addStyleTag({
      content: "*, *::before, *::after { transition: none !important; }",
    });

    const result = await page.evaluate(() => {
      const parse = (value: string) =>
        (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const luminance = ([r, g, b]: number[]) => {
        const lin = (c: number) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
      };
      const ratio = (fg: number[], bg: number[]) => {
        const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
        return (hi + 0.05) / (lo + 0.05);
      };
      const banner = document.querySelector("#view-brand .joy-brand-banner")!;
      const button = banner.querySelector(".joy-button--outline")!;
      const bannerBg = parse(getComputedStyle(banner).backgroundColor);
      const style = getComputedStyle(button);
      return {
        textRatio: ratio(parse(style.color), bannerBg),
        borderRatio: ratio(parse(style.borderTopColor), bannerBg),
      };
    });

    expect(
      result.textRatio,
      `secondary CTA text contrast in ${theme}`,
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      result.borderRatio,
      `secondary CTA border contrast in ${theme}`,
    ).toBeGreaterThanOrEqual(3);
  });
}
