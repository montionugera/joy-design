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
    await expect(
      page.getByRole("heading", { name: /brand/i }).first(),
    ).toBeVisible();
    await expect(page.locator(".joy-ribbon").first()).toBeVisible();
    await expect(page.locator(".joy-brand-banner")).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("F-043: brand asset downloads are real images", async ({
  page,
  request,
}) => {
  await page.goto("/#brand");
  const hrefs = await page
    .locator("a[download]")
    .evaluateAll((as) =>
      as.map((a) => (a as HTMLAnchorElement).getAttribute("href")),
    );
  expect(hrefs.length).toBeGreaterThanOrEqual(10);
  for (const href of hrefs) {
    const res = await request.get(href!);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/image\/(svg\+xml|png)/);
  }
});
