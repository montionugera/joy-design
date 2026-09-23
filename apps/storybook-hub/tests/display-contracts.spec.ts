import { test, expect, type Page } from "@playwright/test";
import {
  drawerContainer,
  installPageTools,
  modalContainer,
  openModal,
  openPopconfirmInModal,
  settle,
} from "./helpers";

/**
 * F-038 (Wave 3) contracts for the two aspect views of the hub:
 *   #view-data-display-feedback  ("Data Display & Feedback")
 *   #view-navigation-workflow    ("Navigation & Workflow")
 * plus the body-level Modal / Popconfirm / Drawer overlays they open.
 *
 * Modelled on forms-contracts.spec.ts (F-037): same open() shape, coarse-pointer
 * assertions only on the `mobile-chrome` project, and the same 0.5px tolerance for
 * sub-pixel layout rounding (a 44px token can measure 43.999969... in headless Chromium).
 */

const themes = ["light", "dark"] as const;
const views = ["data-display-feedback", "navigation-workflow"] as const;
const TOUCH_MIN = 43.5; // 44px minus the 0.5px sub-pixel rounding tolerance

/**
 * Elements exempt from the purple scan. Empty on purpose: nothing in the two views or the
 * overlays may use a violet/purple hue. Add a selector here only with a comment saying why.
 */
const PURPLE_ALLOW: string[] = [];

async function open(
  page: Page,
  hash: string,
  theme: string,
  width = 375,
  height = 812,
) {
  await page.setViewportSize({ width, height });
  await page.goto(`/#${hash}`);
  await page.waitForLoadState("networkidle");
  await page.evaluate((selectedTheme) => {
    document.documentElement.setAttribute("data-theme", selectedTheme);
  }, theme);
  await expect(page.locator(`#view-${hash}`)).toHaveClass(/active/);
  await settle(page);
  await installPageTools(page);
}

/**
 * Elements inside `rootSelector` whose right (or left) edge is past the viewport. The hub sets
 * overflow-x: hidden on html/body, so document.scrollWidth can never fail; instead every
 * element is measured. An overflowing element is excused only if an ancestor UNDER the
 * view root is a real scroll region (overflow-x auto or scroll): the scrolling Table
 * container and the tabs list are. overflow: hidden is deliberately NOT excused, because
 * it silently clips content the user can never reach. The scroll container itself must
 * still fit the viewport.
 */
async function realOverflow(page: Page, rootSelector: string) {
  return page.evaluate((selector) => {
    const root = document.querySelector(selector)!;
    const offenders: string[] = [];
    let scanned = 0;
    for (const el of root.querySelectorAll("*")) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      scanned++;
      if (rect.right <= window.innerWidth + 1 && rect.left >= -1) continue;
      let ancestor = el.parentElement;
      let clipped = false;
      while (ancestor && ancestor !== root) {
        const overflowX = getComputedStyle(ancestor).overflowX;
        if (overflowX === "auto" || overflowX === "scroll") {
          clipped = true;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      if (!clipped) {
        offenders.push(
          `${window.__describe(el)} left=${Math.round(rect.left)} right=${Math.round(rect.right)}`,
        );
      }
    }
    // Second pass: the hub wraps every demo in .component-canvas (overflow-x: auto), so an
    // overflowing demo would just grow a private scrollbar inside its card and pass the
    // pass above. Any container under the view that actually scrolls sideways must be one
    // of the scroll regions the components define on purpose.
    // Breadcrumb is a nowrap scroller under 768px (component CSS), tabs a scrolling list.
    const intentionalScrollers =
      ".joy-table-container--scroll, .joy-tabs, .joy-breadcrumb";
    const scrolling: string[] = [];
    for (const el of root.querySelectorAll("*")) {
      const overflowX = getComputedStyle(el).overflowX;
      if (overflowX === "visible") continue;
      if (el.scrollWidth <= el.clientWidth + 1) continue;
      // Visually-hidden text (.joy-*__sr, 1px clip box) is not a scroller.
      if (el.clientWidth <= 1) continue;
      if (el.matches(intentionalScrollers)) continue;
      scrolling.push(
        `${window.__describe(el)} scrollWidth=${el.scrollWidth} clientWidth=${el.clientWidth}`,
      );
    }
    return { offenders, scrolling, scanned, viewport: window.innerWidth };
  }, rootSelector);
}

test.describe("F-038 display, feedback, navigation and overlay contracts", () => {
  for (const theme of themes) {
    for (const hash of views) {
      test(`${hash} has no real horizontal overflow at 375px in ${theme}`, async ({
        page,
      }) => {
        await open(page, hash, theme);
        const { offenders, scrolling, scanned, viewport } = await realOverflow(
          page,
          `#view-${hash}`,
        );
        expect(viewport).toBe(375);
        // Guards against a vacuous pass (e.g. the view rendering empty).
        expect(scanned, "elements measured").toBeGreaterThan(150);
        expect(offenders, "elements past the viewport edge").toEqual([]);
        expect(scrolling, "unexpected sideways-scrolling containers").toEqual(
          [],
        );
      });
    }

    for (const width of [375, 1280]) {
      test(`Popconfirm stacks above the Modal and Escape closes it first at ${width}px in ${theme}`, async ({
        page,
      }) => {
        await open(
          page,
          "navigation-workflow",
          theme,
          width,
          width === 375 ? 812 : 800,
        );
        await openModal(page);
        await openPopconfirmInModal(page);

        const panel = page.locator("#hub-popconfirm-modal");
        const zIndexes = await page.evaluate((container) => {
          const z = (selector: string) =>
            getComputedStyle(document.querySelector(selector)!).zIndex;
          return {
            panel: z("#hub-popconfirm-modal"),
            // .joy-modal itself is z-index auto: the modal's layer lives on the backdrop.
            backdrop: z(`${container} .joy-modal-backdrop`),
          };
        }, modalContainer);
        expect(Number(zIndexes.panel)).toBeGreaterThan(
          Number(zIndexes.backdrop),
        );

        // Numbers can lie (stacking contexts), so also prove it with a hit test at the
        // panel's centre: the topmost element there must be inside the Popconfirm.
        const onTop = await panel.evaluate((element) => {
          const rect = element.getBoundingClientRect();
          const hit = document.elementFromPoint(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
          );
          return { inside: !!hit && element.contains(hit), width: rect.width };
        });
        expect(onTop.width).toBeGreaterThan(0);
        expect(onTop.inside, "Popconfirm is the topmost element").toBe(true);

        await page.keyboard.press("Escape");
        await expect(panel).toBeHidden();
        await expect(
          page.locator(`${modalContainer} .joy-modal`),
        ).toBeVisible();

        await page.keyboard.press("Escape");
        await expect(page.locator(`${modalContainer} .joy-modal`)).toBeHidden();
      });
    }

    test(`Drawer opens as a bottom sheet at 375px in ${theme}`, async ({
      page,
    }) => {
      await open(page, "navigation-workflow", theme);
      await page.locator('[data-open="drawer"]').click();
      const drawer = page.locator(`${drawerContainer} .joy-drawer`);
      await expect(drawer).toBeVisible();
      await settle(page, drawerContainer);

      const sheet = await drawer.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          position: getComputedStyle(element).position,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
          viewportHeight: window.innerHeight,
        };
      });
      expect(sheet.position).toBe("fixed");
      expect(Math.abs(sheet.bottom - sheet.viewportHeight)).toBeLessThan(1);
      expect(Math.round(sheet.width)).toBe(375);
      // A sheet, not a full-screen takeover.
      expect(sheet.height).toBeLessThan(sheet.viewportHeight);

      await page.keyboard.press("Escape");
      await expect(drawer).toBeHidden();
    });

    test(`Drawer is a side panel at 1280px in ${theme}`, async ({ page }) => {
      await open(page, "navigation-workflow", theme, 1280, 800);
      await page.locator('[data-open="drawer"]').click();
      const drawer = page.locator(`${drawerContainer} .joy-drawer`);
      await expect(drawer).toBeVisible();
      await settle(page, drawerContainer);
      // The component CSS only sets position: fixed under 480px, so position is NOT
      // asserted here; the geometry is what defines a right-hand side panel.
      const box = await drawer.boundingBox();
      expect(box).not.toBeNull();
      expect(Math.round(box!.x + box!.width)).toBe(1280);
      expect(box!.width).toBeLessThan(640);
      expect(Math.round(box!.height)).toBe(800);
    });

    test(`pagination, tab, menu, dropdown and close controls are >= 44px at 375px in ${theme}`, async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== "mobile-chrome",
        "coarse pointer only",
      );

      // Controls whose 44px is their own box.
      const boxSelectors = [
        ".joy-pagination__btn",
        ".joy-tab-btn",
        ".joy-menu__item",
        ".joy-dropdown__item",
      ];
      const found: Record<string, number> = {};
      const short: string[] = [];

      for (const hash of views) {
        await open(page, hash, theme);
        if (hash === "navigation-workflow") {
          // Dropdown items only exist visually once the menu is open.
          // The hub closes open panels on any scroll. Playwright's own scroll-into-view
          // fires its scroll event on the NEXT frame, i.e. after the click already opened
          // the panel, so scroll first and let the event flush before clicking.
          const trigger = page
            .locator("#view-navigation-workflow .joy-dropdown-trigger")
            .first();
          await trigger.evaluate((el) =>
            el.scrollIntoView({ block: "center" }),
          );
          await page.evaluate(
            () =>
              new Promise((resolve) =>
                requestAnimationFrame(() => requestAnimationFrame(resolve)),
              ),
          );
          await trigger.click();
          await expect(
            page
              .locator("#view-navigation-workflow .joy-dropdown__item")
              .first(),
          ).toBeVisible();
          await settle(page);
        }
        const result = await page.evaluate(
          ({ selectors, root, min }) => {
            const out: { count: Record<string, number>; short: string[] } = {
              count: {},
              short: [],
            };
            for (const selector of selectors) {
              for (const el of document.querySelectorAll(
                `${root} ${selector}`,
              )) {
                const rect = el.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) continue;
                out.count[selector] = (out.count[selector] ?? 0) + 1;
                if (rect.height < min || rect.width < min) {
                  out.short.push(
                    `${selector} ${rect.width.toFixed(1)}x${rect.height.toFixed(1)} "${(el.textContent ?? "").trim().slice(0, 20)}"`,
                  );
                }
              }
            }
            return out;
          },
          { selectors: boxSelectors, root: `#view-${hash}`, min: TOUCH_MIN },
        );
        for (const [key, n] of Object.entries(result.count)) {
          found[key] = (found[key] ?? 0) + n;
        }
        short.push(...result.short.map((s) => `${hash}: ${s}`));
      }
      for (const selector of boxSelectors) {
        expect(found[selector], `${selector} present`).toBeGreaterThan(0);
      }
      expect(short, "controls under 44px").toEqual([]);

      // Close buttons keep a 24px visual box and get their 44px from a transparent
      // ::before hit area. Two checks: (1) the pseudo-element's computed size, (2) real hit
      // tests inside that area (vertical +-20px, and 2px inside its left/right edges) must
      // land on the button, so no sibling or clipping ancestor steals the extended area.
      //
      // DELIBERATE DEVIATION (ruled on in the F-038 D2b fix round): the tag close hit area
      // is 44px tall but only 34px wide, growing toward the right edge and never left over
      // the label. The spec asks for a 44px hit; widening the tag's area to 44 would make
      // adjacent tags' hit areas overlap (tag lists have an 8px gap), so the width is
      // asserted against 34 (>= 24px is the WCAG 2.5.8 floor). Recorded in
      // research/screens/README.md under "Known deviations".
      const closeSpecs = [
        { selector: ".joy-tag__close", minW: 33.5, anchor: "left" },
        { selector: ".joy-alert__close", minW: TOUCH_MIN, anchor: "centre" },
        { selector: ".joy-toast__close", minW: TOUCH_MIN, anchor: "centre" },
      ] as const;
      const closeView = "data-display-feedback";
      for (const spec of closeSpecs) {
        await open(page, closeView, theme);
        const buttons = page.locator(`#view-${closeView} ${spec.selector}`);
        const count = await buttons.count();
        expect(count, `${spec.selector} present`).toBeGreaterThan(0);
        for (let i = 0; i < count; i++) {
          const button = buttons.nth(i);
          await button.scrollIntoViewIfNeeded();
          await button.evaluate((el) => el.scrollIntoView({ block: "center" }));
          const measured = await button.evaluate((el, anchor) => {
            const pseudo = getComputedStyle(el, "::before");
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const w = parseFloat(pseudo.width);
            const owns = (x: number, y: number) => {
              const hit = document.elementFromPoint(x, y);
              return !!hit && (hit === el || el.contains(hit));
            };
            // Horizontal extent of the hit area: centred on the button, or growing
            // right from the button's left edge (tag).
            const [x0, x1] =
              anchor === "left"
                ? [rect.left, rect.left + w]
                : [cx - w / 2, cx + w / 2];
            return {
              w,
              h: parseFloat(pseudo.height),
              above: owns(cx, cy - 20),
              below: owns(cx, cy + 20),
              leftEdge: owns(x0 + 2, cy),
              rightEdge: owns(x1 - 2, cy),
            };
          }, spec.anchor);
          const label = `${spec.selector}[${i}] ${JSON.stringify(measured)}`;
          expect(measured.h, label).toBeGreaterThanOrEqual(TOUCH_MIN);
          expect(measured.w, label).toBeGreaterThanOrEqual(spec.minW);
          expect(measured.above, `${label} hit above`).toBe(true);
          expect(measured.below, `${label} hit below`).toBe(true);
          expect(measured.leftEdge, `${label} hit left edge`).toBe(true);
          expect(measured.rightEdge, `${label} hit right edge`).toBe(true);
        }
      }
    });

    test(`views contain no purple family colour and no hard-coded white in ${theme}`, async ({
      page,
    }) => {
      for (const hash of views) {
        await open(page, hash, theme);
        const result = await scanColors(
          page,
          `#view-${hash}`,
          theme === "dark",
        );
        expect(result.scanned, "elements scanned").toBeGreaterThan(150);
        expect(result.purple, `${hash}: purple family`).toEqual([]);
        expect(result.white, `${hash}: hard-coded white in dark`).toEqual([]);
      }
    });

    test(`open Modal, Popconfirm and Drawer contain no purple or white flash in ${theme}`, async ({
      page,
    }) => {
      await open(page, "navigation-workflow", theme);
      await openModal(page);
      await openPopconfirmInModal(page);
      const modal = await scanColors(page, modalContainer, theme === "dark");
      expect(modal.scanned).toBeGreaterThan(10);
      expect(modal.purple, "modal purple").toEqual([]);
      expect(modal.white, "modal white in dark").toEqual([]);
      await page.keyboard.press("Escape");
      await page.keyboard.press("Escape");
      await expect(page.locator(`${modalContainer} .joy-modal`)).toBeHidden();

      await page.locator('[data-open="drawer"]').click();
      await expect(
        page.locator(`${drawerContainer} .joy-drawer`),
      ).toBeVisible();
      await settle(page, drawerContainer);
      const drawer = await scanColors(page, drawerContainer, theme === "dark");
      expect(drawer.scanned).toBeGreaterThan(5);
      expect(drawer.purple, "drawer purple").toEqual([]);
      expect(drawer.white, "drawer white in dark").toEqual([]);
    });

    test(`Alert and Toast have no side stripe in ${theme}`, async ({
      page,
    }) => {
      await open(page, "data-display-feedback", theme);
      const { checked, stripes } = await page.evaluate(() => {
        const stripes: string[] = [];
        let checked = 0;
        for (const el of document.querySelectorAll(
          "#view-data-display-feedback .joy-alert, #view-data-display-feedback .joy-toast",
        )) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0) continue;
          checked++;
          const cs = getComputedStyle(el);
          const label = window.__describe(el);

          // 1. Border stripe: a left border thicker than the top one (any asymmetry, e.g.
          // a thick right or bottom edge, is flagged too).
          const widths = [
            cs.borderTopWidth,
            cs.borderRightWidth,
            cs.borderBottomWidth,
            cs.borderLeftWidth,
          ].map(parseFloat);
          if (widths.some((w) => w !== widths[0])) {
            stripes.push(`${label} border widths=${widths.join("/")}`);
          }

          // 2. Inset box-shadow stripe: `inset Xpx 0 0 0` (or a pure-Y inset) thicker
          // than 1px. Computed value looks like "rgba(...) 4px 0px 0px 0px inset".
          const parts = cs.boxShadow.split(/,(?![^(]*\))/);
          for (const part of parts) {
            if (!/\binset\b/.test(part)) continue;
            const lengths = part
              .replace(
                /(?:rgba?|hsla?|color|oklab|oklch)\([^)]*\)|#[0-9a-f]{3,8}\b/gi,
                "",
              )
              .match(/-?\d*\.?\d+px/g);
            if (!lengths) continue;
            const [x, y] = lengths.map(parseFloat);
            if ((Math.abs(x) > 1 && y === 0) || (Math.abs(y) > 1 && x === 0)) {
              stripes.push(`${label} inset shadow stripe: ${part.trim()}`);
            }
          }

          // 3. Pseudo-element stripe: an absolutely positioned, filled ::before/::after
          // that is a thin bar (< 8px wide, at least 12px tall).
          for (const pseudo of ["::before", "::after"]) {
            const p = getComputedStyle(el, pseudo);
            if (p.content === "none" || p.content === "normal") continue;
            const filled = window.__rgba(p.backgroundColor)[3] > 0;
            if (
              p.position === "absolute" &&
              filled &&
              parseFloat(p.width) < 8 &&
              parseFloat(p.height) >= 12
            ) {
              stripes.push(`${label} ${pseudo} bar ${p.width}x${p.height}`);
            }
          }
        }
        return { checked, stripes };
      });
      expect(checked, "alerts and toasts measured").toBeGreaterThanOrEqual(8);
      expect(stripes).toEqual([]);
    });

    test(`chart HUD values are legible (>= 4.5:1) in ${theme}`, async ({
      page,
    }) => {
      await open(page, "data-display-feedback", theme);
      const values = await page.evaluate(() => {
        const rgba = window.__rgba;
        const over = (top: number[], under: number[]) => {
          const a = top[3];
          return [
            top[0] * a + under[0] * (1 - a),
            top[1] * a + under[1] * (1 - a),
            top[2] * a + under[2] * (1 - a),
            1,
          ];
        };
        // Resolve the effective background: composite translucent layers from the
        // element up to the first opaque one. The <canvas> pixels behind the HUD are NOT
        // sampled, and the "Canvas" system-colour fallback is white in both themes; the
        // test only means something because an opaque token surface exists on the
        // ancestor chain (asserted implicitly: a wrong fallback would fail dark).
        const background = (el: Element) => {
          const layers: number[][] = [];
          for (let n: Element | null = el; n; n = n.parentElement) {
            const c = rgba(getComputedStyle(n).backgroundColor);
            if (c[3] > 0) layers.push(c);
            if (c[3] >= 1) break;
          }
          let acc =
            layers.length && layers[layers.length - 1][3] >= 1
              ? layers.pop()!
              : rgba("Canvas");
          while (layers.length) acc = over(layers.pop()!, acc);
          return acc;
        };
        const luminance = ([r, g, b]: number[]) => {
          const lin = (v: number) => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
          };
          return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
        };
        return [
          ...document.querySelectorAll(
            "#view-data-display-feedback .joy-chart__hud-value",
          ),
        ].map((el) => {
          const bg = background(el);
          const fg = over(rgba(getComputedStyle(el).color), bg);
          const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
          return {
            text: (el.textContent ?? "").trim(),
            cls: window.__describe(el),
            ratio: (hi + 0.05) / (lo + 0.05),
          };
        });
      });
      expect(values.length, "HUD values found").toBeGreaterThanOrEqual(4);
      const low = values.filter((v) => v.ratio < 4.5);
      expect(low, "HUD values under 4.5:1").toEqual([]);
    });
  }

  test("the always-open Tooltip demo hides while a dialog is open and returns after (commit 2acad52)", async ({
    page,
  }) => {
    await open(page, "navigation-workflow", "light", 1280, 800);
    const tooltip = page.locator(".joy-tooltip[data-static]");
    const visibility = () =>
      tooltip.evaluate((el) => getComputedStyle(el).visibility);
    expect(await visibility()).toBe("visible");

    await openModal(page);
    expect(await visibility(), "hidden behind the modal layer").toBe("hidden");
    await page.keyboard.press("Escape");
    await expect(page.locator(`${modalContainer} .joy-modal`)).toBeHidden();
    expect(await visibility(), "restored after close").toBe("visible");

    await page.locator('[data-open="drawer"]').click();
    await expect(page.locator(`${drawerContainer} .joy-drawer`)).toBeVisible();
    expect(await visibility(), "hidden behind the drawer layer").toBe("hidden");
  });

  test("Pagination shows only prev, current and next at 375px", async ({
    page,
  }) => {
    await open(page, "navigation-workflow", "light");
    // The live pager reacts to the viewport; the static "compact rule" cell is the
    // spec of the compact shape. Both must be prev + current + next only.
    const navs = {
      "live pager": page.locator("#hub-live-pager"),
      "compact rule cell": page
        .locator('[data-matrix="pagination"] .hub-matrix__cell')
        .filter({ hasText: "compact rule" })
        .locator(".joy-pagination"),
    };
    for (const [selector, nav] of Object.entries(navs)) {
      const labels = await nav
        .locator(".joy-pagination__btn")
        .evaluateAll((buttons) =>
          buttons.map((b) => b.getAttribute("aria-label")),
        );
      expect(labels.length, selector).toBe(3);
      expect(labels[0]).toBe("Previous page");
      expect(labels[2]).toBe("Next page");
      expect(labels[1]).toMatch(/^Page \d+$/);
      await expect(nav.locator(".joy-pagination__btn--active")).toHaveCount(1);
      await expect(nav.locator(".joy-pagination__ellipsis")).toHaveCount(0);
      await expect(nav.locator(".joy-pagination__info")).toHaveCount(0);
    }
  });

  test("Pagination shows the windowed range at 1280px (positive control for the compact rule)", async ({
    page,
  }) => {
    await open(page, "navigation-workflow", "light", 1280, 800);
    const nav = page.locator("#hub-live-pager");
    expect(await nav.locator(".joy-pagination__btn").count()).toBeGreaterThan(
      3,
    );
    await expect(nav.locator(".joy-pagination__info")).toHaveCount(1);
  });
});

/**
 * Scans every element under `rootSelector` (and its ::before/::after) for the purple/violet
 * family and, when `checkWhite`, for an opaque rgb(255, 255, 255) background (the "white
 * flash" of a hard-coded colour on a dark surface).
 *
 * Purple is a HUE test, not a list of known values: the resolved colour (canvas-normalised,
 * so rgb(), rgba(), color(srgb ...) all work) has a hue of 250-300 degrees, HSL saturation
 * >= 0.25, chroma >= 8/255 (greys and near-whites carry no hue) and alpha >= 0.02. Alpha is
 * NOT ignored: translucent purple glows and tints are exactly how the legacy hub used it.
 * Checked properties: color, background, borders, outline, text-decoration, SVG fill/stroke,
 * and every colour function/hex found inside box-shadow, background-image (gradients) and
 * border-image.
 *
 * White allow-list: none. Every demo swatch in these views paints through tokens or SVG
 * data URIs (images are <img>, not backgrounds), so any opaque white background in dark is
 * a defect; extend this list only with a commented, justified selector.
 */
async function scanColors(
  page: Page,
  rootSelector: string,
  checkWhite: boolean,
) {
  return page.evaluate(
    ({ selector, allow, checkWhite }) => {
      const rgba = window.__rgba;
      const root = document.querySelector(selector)!;
      const purple: string[] = [];
      const white: string[] = [];
      let scanned = 0;

      const isPurple = ([r, g, b, a]: number[]) => {
        if (a < 0.02) return false;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const chroma = max - min;
        if (chroma < 8) return false;
        let hue: number;
        if (max === r) hue = ((g - b) / chroma) % 6;
        else if (max === g) hue = (b - r) / chroma + 2;
        else hue = (r - g) / chroma + 4;
        hue = (hue * 60 + 360) % 360;
        const lightness = (max + min) / 510;
        const saturation =
          lightness === 0 || lightness === 1
            ? 0
            : chroma / 255 / (1 - Math.abs(2 * lightness - 1));
        return hue >= 250 && hue <= 300 && saturation >= 0.25;
      };
      const colorProps = [
        "color",
        "backgroundColor",
        "borderTopColor",
        "borderRightColor",
        "borderBottomColor",
        "borderLeftColor",
        "outlineColor",
        "textDecorationColor",
        "fill",
        "stroke",
      ] as const;
      const stringProps = [
        "backgroundImage",
        "boxShadow",
        "borderImageSource",
      ] as const;
      const colorTokens =
        /(?:rgba?|hsla?|color|oklab|oklch|lab|lch|hwb)\([^)]*\)|#[0-9a-f]{3,8}\b/gi;

      const scan = (cs: CSSStyleDeclaration, label: string) => {
        for (const prop of colorProps) {
          const value = cs[prop];
          if (!value || value === "none") continue;
          if (isPurple(rgba(value))) purple.push(`${label} ${prop}=${value}`);
        }
        for (const prop of stringProps) {
          const value = cs[prop];
          if (!value || value === "none") continue;
          for (const token of value.match(colorTokens) ?? []) {
            if (isPurple(rgba(token))) {
              purple.push(`${label} ${prop} has ${token}`);
            }
          }
        }
      };

      for (const el of [root, ...root.querySelectorAll("*")]) {
        if (allow.length && el.closest(allow.join(","))) continue;
        scanned++;
        const label = window.__describe(el);
        const cs = getComputedStyle(el);
        scan(cs, label);
        for (const pseudo of ["::before", "::after"]) {
          const p = getComputedStyle(el, pseudo);
          if (p.content !== "none" && p.content !== "normal") {
            scan(p, `${label}${pseudo}`);
          }
        }
        if (checkWhite) {
          const [r, g, b, a] = rgba(cs.backgroundColor);
          if (r === 255 && g === 255 && b === 255 && a >= 0.99) {
            white.push(label);
          }
        }
      }
      return { scanned, purple, white };
    },
    { selector: rootSelector, allow: PURPLE_ALLOW, checkWhite },
  );
}
