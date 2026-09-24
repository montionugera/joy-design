import { test, expect } from "@playwright/test";
import { openLandingBlocks } from "./helpers";

// F-039 C1b: the hub landing blocks show every state the hero and FAQ components can be in, using the classes and
// attributes the real components render.

test.beforeEach(({ page }) => openLandingBlocks(page, 1280));

test("hero demos show default, loading and disabled primary buttons", async ({ page }) => {
  const heroes = page.locator("#view-landing-blocks .joy-hero");
  expect(await heroes.count()).toBeGreaterThanOrEqual(3);

  const solid = (index: number) => heroes.nth(index).locator(".joy-button--solid");

  // default: enabled, no spinner
  await expect(solid(0)).toBeEnabled();
  await expect(solid(0).locator(".joy-button__spinner")).toHaveCount(0);
  await expect(heroes.nth(0).locator(".joy-hero__title-emphasis")).toHaveCount(1);

  // loading: the spinner markup the Button renders, busy and inert
  await expect(solid(1)).toHaveClass(/joy-button--loading/);
  await expect(solid(1)).toHaveAttribute("aria-busy", "true");
  await expect(solid(1)).toBeDisabled();
  await expect(solid(1).locator(".joy-button__spinner .joy-button__spinner-svg")).toHaveCount(1);

  // disabled: dimmed and inert, no spinner
  await expect(solid(2)).toBeDisabled();
  await expect(solid(2)).not.toHaveClass(/joy-button--loading/);
  await expect(solid(2).locator(".joy-button__spinner")).toHaveCount(0);

  // the secondary button stays available in every state
  for (let i = 0; i < 3; i++) await expect(heroes.nth(i).locator(".joy-button--outline")).toBeEnabled();
});

test("FAQ accordion toggles with aria-expanded, aria-controls and hidden in sync", async ({ page }) => {
  const items = page.locator("#view-landing-blocks .joy-faq-item");
  expect(await items.count()).toBeGreaterThanOrEqual(3);

  const state = async (index: number) =>
    items.nth(index).evaluate((item) => {
      const trigger = item.querySelector<HTMLElement>(".joy-faq-item__trigger")!;
      const panel = document.getElementById(trigger.getAttribute("aria-controls")!)!;
      return {
        expanded: trigger.getAttribute("aria-expanded"),
        hidden: panel.hidden,
        open: item.classList.contains("joy-faq-item--open"),
        labelledby: panel.getAttribute("aria-labelledby") === trigger.id,
      };
    });

  // first item starts open (defaultOpen), the others closed
  expect(await state(0)).toEqual({ expanded: "true", hidden: false, open: true, labelledby: true });
  expect(await state(1)).toEqual({ expanded: "false", hidden: true, open: false, labelledby: true });

  await items.nth(1).locator(".joy-faq-item__trigger").click();
  expect(await state(1)).toEqual({ expanded: "true", hidden: false, open: true, labelledby: true });
  await expect(items.nth(1).locator(".joy-faq-item__content")).toBeVisible();

  await items.nth(1).locator(".joy-faq-item__trigger").click();
  expect(await state(1)).toEqual({ expanded: "false", hidden: true, open: false, labelledby: true });
  await expect(items.nth(1).locator(".joy-faq-item__content")).toBeHidden();
});

test("landing blocks demo ids are unique", async ({ page }) => {
  const duplicates = await page.evaluate(() => {
    const seen = new Map<string, number>();
    document.querySelectorAll("#view-landing-blocks [id]").forEach((el) => seen.set(el.id, (seen.get(el.id) ?? 0) + 1));
    return Array.from(seen).filter(([, n]) => n > 1).map(([id]) => id);
  });
  expect(duplicates).toEqual([]);
});
