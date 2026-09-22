import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";

const themes = ["light", "dark"] as const;

async function open(page: Page, hash: string, theme: string) {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/#${hash}`);
  await page.waitForLoadState("networkidle");
  await page.evaluate((selectedTheme) => {
    document.documentElement.setAttribute("data-theme", selectedTheme);
  }, theme);
}

test.describe("F-037 form control contracts", () => {
  for (const theme of themes) {
    test(`button matrix renders every variant, size and state in ${theme}`, async ({
      page,
    }) => {
      await open(page, "button", theme);
      const matrix = page.locator('[data-matrix="button"]');

      for (const variant of ["solid", "outline", "ghost", "danger", "link"]) {
        for (const size of ["sm", "md", "lg"]) {
          await expect(
            matrix
              .locator(`.joy-button--${variant}.joy-button--${size}`)
              .first(),
          ).toBeVisible();
        }
      }

      await expect(
        matrix.locator(".joy-button--loading .joy-button__spinner-svg").first(),
      ).toBeVisible();

      const solid = matrix.locator(
        '.joy-button--solid.joy-button--md[data-state="default"]',
      );
      const before = await solid.evaluate(
        (element) => getComputedStyle(element).boxShadow,
      );
      await solid.hover();
      await page.waitForTimeout(200);
      expect(
        await solid.evaluate((element) => getComputedStyle(element).transform),
      ).not.toBe("none");
      expect(
        await solid.evaluate((element) => getComputedStyle(element).boxShadow),
      ).not.toBe(before);
      await solid.focus();
      await page.keyboard.press("Tab");
      await page.keyboard.press("Shift+Tab");
      expect(
        await solid.evaluate(
          (element) => getComputedStyle(element).outlineWidth,
        ),
      ).toBe("2px");
      expect(
        await matrix.evaluate((element) =>
          [...element.querySelectorAll(".joy-button")]
            .map((button) => getComputedStyle(button).backgroundImage)
            .some((background) =>
              /rgb\((124, 58, 237|139, 92, 246)\)/.test(background),
            ),
        ),
      ).toBe(false);
    });

    test(`44px touch targets at 375px in ${theme}`, async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== "mobile-chrome",
        "coarse pointer only",
      );

      for (const hash of ["button", "forms"]) {
        await open(page, hash, theme);
        const short = await page
          .locator(
            `#view-${hash} .joy-button, #view-${hash} .joy-input, #view-${hash} .joy-select, #view-${hash} .joy-checkbox, #view-${hash} .joy-switch, #view-${hash} .joy-radio, #view-${hash} .joy-segmented__item, #view-${hash} .joy-rate__star`,
          )
          .evaluateAll((elements) =>
            elements
              .filter(
                (element) => (element as HTMLElement).offsetParent !== null,
              )
              .map((element) => [
                element.className,
                element.getBoundingClientRect().height,
              ])
              .filter(([, height]) => (height as number) < 44),
          );
        expect(short, `${hash}: every control >= 44px`).toEqual([]);
      }
    });

    test(`no horizontal overflow in the forms view in ${theme}`, async ({
      page,
    }) => {
      await open(page, "forms", theme);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth + 1,
        ),
      ).toBe(false);
    });

    test(`hub chrome and demo controls fit at 375px in ${theme}`, async ({
      page,
    }) => {
      await open(page, "button", theme);

      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);

      for (const selector of [".topbar", "#seg-variant", "#seg-size"]) {
        await expect(page.locator(selector)).toBeVisible();
        expect(
          await page.locator(selector).evaluate((element) => {
            const { right } = element.getBoundingClientRect();
            return right <= document.documentElement.clientWidth;
          }),
          `${selector} stays within the mobile viewport`,
        ).toBe(true);
      }
    });

    test(`canvas grid uses the visible border token in ${theme}`, async ({
      page,
    }) => {
      await open(page, "button", theme);

      const borderColor = await page.evaluate(() => {
        const probe = document.createElement("span");
        probe.style.color = "var(--joy-border-default)";
        document.body.append(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      });

      await expect(page.locator(".canvas").first()).toBeVisible();
      expect(
        await page
          .locator(".canvas")
          .first()
          .evaluate((element) => getComputedStyle(element).backgroundImage),
      ).toContain(borderColor);
    });

    test(`Select and Cascader panels are bottom sheets under 480px in ${theme}`, async ({
      page,
    }) => {
      await open(page, "forms", theme);

      for (const selector of [
        ".joy-select__listbox",
        ".joy-cascader__panel",
        ".joy-treeselect__panel",
      ]) {
        const panel = page.locator(`${selector}.joy-overlay--sheet`).first();
        const box = await panel.boundingBox();
        expect(box, selector).not.toBeNull();
        expect(Math.round(box!.width)).toBe(375);
        expect(
          await panel.evaluate((element) => getComputedStyle(element).position),
        ).toBe("fixed");
        expect(
          await panel.evaluate((element) => getComputedStyle(element).zIndex),
        ).toBe("1000");
      }
    });
  }
});

test("built hub does not contain hardcoded slate palette values", () => {
  const builtHub = readFileSync(
    new URL("../dist/index.html", import.meta.url),
    "utf8",
  );

  for (const color of ["#0b0f19", "#0f172a", "#090d16", "#00d8ff"]) {
    expect(builtHub.toLowerCase()).not.toContain(color);
  }
});
