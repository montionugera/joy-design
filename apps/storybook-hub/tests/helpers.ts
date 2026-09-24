import { expect, type Page } from "@playwright/test";

/**
 * Helpers shared by the F-038 specs (display-contracts.spec.ts, screens-f038.spec.ts).
 * The F-036/F-037 specs do not use them and are untouched.
 */

declare global {
  interface Window {
    /** CSS colour (any syntax) -> [r, g, b, a] with r/g/b 0-255 and alpha 0-1. */
    __rgba(css: string): number[];
    /** "tag.class" label for failure messages; safe for SVG (className is an SVGAnimatedString). */
    __describe(el: Element): string;
    /** Hub function that repaints chart/image canvases from the current theme tokens. */
    redrawHubCharts?(): void;
  }
}

export const modalContainer = "#demo-modal-container";
export const drawerContainer = "#demo-drawer-container";

/**
 * Waits for every finite running animation/transition under `rootSelector` (whole
 * document when omitted) to finish. Needed because switching data-theme starts colour
 * transitions whose first computed value is still the OLD theme's colour, and the
 * modal/drawer have a 250ms enter animation (a Popconfirm opened mid-animation is
 * positioned off its final rect). Infinite animations (spinner, skeleton shimmer) are
 * ignored. A pending animation is not yet running, so `a.pending` is checked as well.
 */
export async function settle(page: Page, rootSelector?: string) {
  await page.waitForFunction((selector) => {
    const root: Element | Document | null = selector
      ? document.querySelector(selector)
      : document;
    if (!root) return false;
    const animations =
      root instanceof Document
        ? document.getAnimations()
        : root.getAnimations({ subtree: true });
    return animations
      .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
      .every((a) => !a.pending && a.playState !== "running");
  }, rootSelector ?? null);
}

/**
 * Installs window.__rgba and window.__describe. __rgba resolves ANY CSS colour syntax
 * Chromium returns from getComputedStyle (rgb(), rgba(), color(srgb ...), oklab(), ...)
 * through a 1x1 canvas, so no check depends on a regex over one serialisation. Note the
 * canvas un-premultiplies alpha, so a translucent colour comes back shifted by a couple of
 * channel values: compare with tolerances (hue/saturation), never exact triples.
 */
export async function installPageTools(page: Page) {
  await page.evaluate(() => {
    const ctx = document.createElement("canvas").getContext("2d", {
      willReadFrequently: true,
    })!;
    const cache = new Map<string, number[]>();
    window.__rgba = (css: string): number[] => {
      const hit = cache.get(css);
      if (hit) return hit;
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "#000";
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      const value = [d[0], d[1], d[2], Math.round((d[3] / 255) * 100) / 100];
      cache.set(css, value);
      return value;
    };
    window.__describe = (el: Element): string => {
      const raw = el.getAttribute("class") ?? "";
      return `${el.tagName.toLowerCase()}.${raw.trim().replace(/\s+/g, ".").slice(0, 60)}`;
    };
  });
}

export async function openModal(page: Page) {
  await page.locator('[data-open="modal"]').click();
  await expect(page.locator(`${modalContainer} .joy-modal`)).toBeVisible();
  await settle(page, modalContainer);
}

export async function openPopconfirmInModal(page: Page) {
  await page
    .locator(`${modalContainer} .joy-popconfirm__trigger button`)
    .click();
  await expect(page.locator("#hub-popconfirm-modal")).toBeVisible();
  await settle(page, modalContainer);
}
