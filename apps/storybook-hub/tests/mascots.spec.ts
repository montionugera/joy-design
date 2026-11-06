import { test, expect } from "@playwright/test";
import { setTheme } from "./helpers";

for (const theme of ["light", "dark"] as const) {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1280, height: 800 },
  ]) {
    test(`Mascots view: 35 pictures load in ${theme} at ${viewport.width}`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      await page.setViewportSize(viewport);
      await page.goto("/#mascots");
      await setTheme(page, theme);
      const view = page.locator("#view-mascots");
      await expect(
        view.getByRole("heading", { name: "Mascots", exact: true, level: 2 }),
      ).toBeVisible();
      for (const name of [
        "Yoji",
        "Pico",
        "Luna",
        "Rex",
        "Mochi",
        "Zing",
        "Byte",
      ]) {
        await expect(
          view.getByRole("heading", { name, level: 3 }),
        ).toBeVisible();
      }
      const imgs = view.locator("img.hub-mascot");
      await expect(imgs).toHaveCount(35);
      await imgs.last().scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          imgs.evaluateAll((els) =>
            (els as HTMLImageElement[])
              .filter((i) => !(i.complete && i.naturalWidth > 0))
              .map((i) => i.src),
          ),
        )
        .toEqual([]);
      await expect(
        view.locator(".playground-box", {
          has: page.getByRole("heading", { name: "Rex", level: 3 }),
        }),
      ).toContainText("confident, bold, unfiltered");
      expect(errors).toEqual([]);
    });
  }
}
