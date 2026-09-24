import { expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Helpers shared by the F-038 specs (display-contracts.spec.ts, screens-f038.spec.ts) and the
 * F-039 landing-blocks specs. The F-036/F-037 specs do not use them and are untouched.
 */

declare global {
  interface Window {
    /** CSS colour (any syntax) -> [r, g, b, a] with r/g/b 0-255 and alpha 0-1. */
    __rgba(css: string): number[];
    /** "tag.class" label for failure messages; safe for SVG (className is an SVGAnimatedString). */
    __describe(el: Element): string;
    /** Hub function that repaints chart/image canvases from the current theme tokens. */
    redrawHubCharts?(): void;
    /** WCAG contrast ratio of two opaque [r, g, b] colours. */
    __contrast(fg: number[], bg: number[]): number;
    /**
     * Opaque backgrounds a text element can sit on: the composite of every translucent background-color layer up the
     * ancestor chain over the first opaque one (white when none is). An element whose background-image is a gradient
     * yields one entry per gradient colour stop (each stop composited under the layers above it).
     */
    __surfaces(el: Element): number[][];
    /** Text colour (SVG text: fill) against every surface of `__surfaces`; `min` is the lowest ratio. */
    __textRatio(el: Element): { min: number; fg: number[]; surfaces: number[][] };
    /**
     * Every visible text element under `root` (`checked` counts them, so an empty sweep cannot pass) whose contrast is
     * below `floor`, as "tag.class: text (ratio)".
     */
    __lowContrast(root: Element, floor: number): { checked: number; failures: string[] };
  }
}

export type Theme = "light" | "dark";

/** Sets data-theme on the document element and waits for the colour transitions it starts. */
export async function setTheme(page: Page, theme: Theme) {
  await page.evaluate((selected) => {
    document.documentElement.setAttribute("data-theme", selected);
  }, theme);
  await settle(page);
}

/** Opens the hub's Landing blocks view at the given viewport width. */
export async function openLandingBlocks(page: Page, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/#landing-blocks");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("#view-landing-blocks")).toHaveClass(/active/);
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

/**
 * Installs window.__contrast, __surfaces, __textRatio and __lowContrast on top of installPageTools (call that first).
 * Backgrounds are composited from getComputedStyle up the ancestor chain, never read from a token, so the numbers are
 * what the browser paints.
 */
export async function installContrastTools(page: Page) {
  await page.evaluate(() => {
    const luminance = ([r, g, b]: number[]) => {
      const lin = (c: number) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    };
    const over = (top: number[], under: number[]) => {
      const a = top[3];
      return [0, 1, 2].map((i) => top[i] * a + under[i] * (1 - a));
    };
    window.__contrast = (fg, bg) => {
      const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    window.__surfaces = (el) => {
      const layers: number[][] = [];
      let bases: number[][] = [[255, 255, 255]];
      for (let node: Element | null = el; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (style.backgroundImage.includes("gradient(")) {
          const stops = style.backgroundImage.match(/(?:rgba?|color|oklab|oklch|lab|lch|hsla?)\([^)]*\)/g) ?? [];
          // A gradient this helper cannot read (fewer than two parsed colours) or one with a translucent stop has no
          // single surface to measure against: fail loudly rather than return Infinity or treat it as opaque black.
          if (stops.length < 2) {
            throw new Error(`__surfaces: cannot read the gradient colours of ${window.__describe(node)}: ${style.backgroundImage}`);
          }
          bases = stops.map((stop) => {
            const colour = window.__rgba(stop);
            if (colour[3] < 1) {
              throw new Error(`__surfaces: translucent gradient stop ${stop} on ${window.__describe(node)}`);
            }
            return colour.slice(0, 3);
          });
          break;
        }
        const colour = window.__rgba(style.backgroundColor);
        if (colour[3] > 0) {
          layers.push(colour);
          if (colour[3] >= 1) break;
        }
      }
      return bases.map((base) => layers.reduceRight((under, layer) => over(layer, under), base));
    };
    window.__textRatio = (el) => {
      const style = getComputedStyle(el);
      const colour = window.__rgba(el instanceof SVGElement ? style.fill : style.color);
      const surfaces = window.__surfaces(el);
      const ratios = surfaces.map((surface) => window.__contrast(over(colour, surface), surface));
      return { min: Math.min(...ratios), fg: colour, surfaces };
    };
    window.__lowContrast = (root, floor) => {
      const failures: string[] = [];
      let checked = 0;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
      for (let node = walker.currentNode as Element | null; node; node = walker.nextNode() as Element | null) {
        const own = Array.from(node.childNodes)
          .filter((child) => child.nodeType === Node.TEXT_NODE)
          .map((child) => child.textContent ?? "")
          .join("")
          .trim();
        if (!own) continue;
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0 || rect.bottom <= 0 || rect.right <= 0) continue;
        if (getComputedStyle(node).visibility === "hidden") continue;
        checked++;
        const { min } = window.__textRatio(node);
        if (min < floor) failures.push(`${window.__describe(node)}: "${own.slice(0, 30)}" (${min.toFixed(2)})`);
      }
      return { checked, failures };
    };
  });
}

/**
 * Horizontal overflow of a rendered page, measured three ways: the document against the viewport, the page root
 * against its own box, and every laid-out element's right edge against the viewport. Elements inside an
 * intentional scroll/clip region below the root, position:fixed elements and the off-screen skip link are not layout
 * overflow and are skipped. Edges get half a pixel for sub-pixel layout.
 */
export async function measureOverflow(page: Page, rootSelector: string) {
  return page.evaluate((selector) => {
    const root = document.querySelector<HTMLElement>(selector)!;
    const viewport = window.innerWidth;
    const clipped = (el: Element) => {
      for (let n = el.parentElement; n && n !== root; n = n.parentElement) {
        const { overflowX } = getComputedStyle(n);
        if (overflowX !== "visible") return true;
      }
      return false;
    };
    const beyond: string[] = [];
    for (const el of Array.from(root.querySelectorAll("*"))) {
      if (el.closest(".joy-landing-skip") || getComputedStyle(el).position === "fixed") continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      if (rect.right > viewport + 0.5 && !clipped(el)) {
        beyond.push(`${window.__describe(el)} right=${rect.right.toFixed(1)}`);
      }
    }
    return {
      viewport,
      documentScrollWidth: document.documentElement.scrollWidth,
      rootScrollWidth: root.scrollWidth,
      rootClientWidth: root.clientWidth,
      beyond,
    };
  }, rootSelector);
}

export type ButtonContrast = {
  className: string;
  text: string;
  /** The label has a laid-out box and is not hidden or transparent. */
  visible: boolean;
  min: number;
  gradient: boolean;
  surfaces: number[][];
  /** --joy-accent-default and --joy-accent-gradient-end as the button resolves them. */
  stops: number[][];
};

/**
 * Contrast of every button matching `selector`: the real label (`.joy-button__label`, or the button itself) against
 * the surface it paints on. A gradient button (the solid variant) is measured against BOTH gradient stops.
 */
export async function measureButtonContrast(page: Page, selector: string): Promise<ButtonContrast[]> {
  return page.evaluate((sel) => {
    return Array.from(document.querySelectorAll<HTMLElement>(sel)).map((button) => {
      const label = button.querySelector<HTMLElement>(".joy-button__label") ?? button;
      const rect = label.getBoundingClientRect();
      const labelStyle = getComputedStyle(label);
      const buttonStyle = getComputedStyle(button);
      const { min, surfaces } = window.__textRatio(label);
      return {
        className: button.className,
        text: (label.textContent ?? "").trim(),
        // checkVisibility also looks at ancestors: display:none, content-visibility, and (with the two flags) opacity 0
        // and visibility:hidden anywhere up the chain. Both spellings of the flags are passed (older/newer Chromium).
        visible:
          rect.width > 0 &&
          rect.height > 0 &&
          labelStyle.visibility !== "hidden" &&
          Number(labelStyle.opacity) > 0 &&
          label.checkVisibility({
            checkOpacity: true,
            checkVisibilityCSS: true,
            opacityProperty: true,
            visibilityProperty: true,
          } as CheckVisibilityOptions),
        min,
        gradient: buttonStyle.backgroundImage.includes("gradient("),
        surfaces,
        stops: ["--joy-accent-default", "--joy-accent-gradient-end"].map((name) =>
          window.__rgba(buttonStyle.getPropertyValue(name).trim()).slice(0, 3),
        ),
      };
    });
  }, selector);
}

export type PressedButtonContrast = {
  className: string;
  text: string;
  /** The button matched :active while the measurement was taken (the pointer really was held on it). */
  pressed: boolean;
  min: number;
  gradient: boolean;
  surfaces: number[][];
};

/**
 * Contrast of the first button matching `selector` while it is really pressed: the pointer is moved onto it and held
 * (page.mouse.down), the colour transition is waited out, the label is measured against the pressed fill, then the
 * pointer leaves the button before it is released so no click is fired. Works in both Playwright projects.
 */
export async function measurePressedButtonContrast(page: Page, selector: string): Promise<PressedButtonContrast> {
  const button = page.locator(selector).first();
  await button.scrollIntoViewIfNeeded();
  const box = await button.boundingBox();
  if (!box) throw new Error(`no box for ${selector}`);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  try {
    await button.evaluate(async (el) => {
      // :active is set by the browser on mousedown; wait for it and for the pressed-state transition to finish
      for (let i = 0; i < 100 && !(el.matches(":active") && el.getAnimations().length === 0); i++) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    });
    return await button.evaluate((el) => {
      const label = el.querySelector<HTMLElement>(".joy-button__label") ?? el;
      const { min, surfaces } = window.__textRatio(label);
      return {
        className: el.className,
        text: (label.textContent ?? "").trim(),
        pressed: el.matches(":active"),
        min,
        gradient: getComputedStyle(el).backgroundImage.includes("gradient("),
        surfaces,
      };
    });
  } finally {
    await page.mouse.move(0, 0);
    await page.mouse.up();
  }
}

/** Asserts a pressed button is really pressed, is a flat fill (the gradient is gone) and its label is >= 4.5:1 on it. */
export function expectReadablePressedButton(measured: PressedButtonContrast, where: string) {
  expect(measured.pressed, `${where}: the button is :active while measured`).toBe(true);
  expect(measured.text.length, `${where}: label`).toBeGreaterThan(0);
  expect(measured.surfaces.length, `${where}: pressed surfaces`).toBeGreaterThan(0);
  expect(measured.min, `${where} pressed contrast (${measured.className})`).toBeGreaterThanOrEqual(4.5);
}

/** Asserts the label of every measured button is visible, non-empty and >= 4.5:1 on every surface it can sit on. */
export function expectReadableButtons(buttons: ButtonContrast[], expectedCount: number, where: string) {
  expect(buttons.length, `${where}: number of buttons`).toBe(expectedCount);
  for (const button of buttons) {
    const name = `${where}: "${button.text}"`;
    expect(button.text.length, `${name} has a label`).toBeGreaterThan(0);
    expect(button.visible, `${name} label is visible`).toBe(true);
    if (button.gradient) {
      // the gradient primary: both stops must be the two accent tokens, and each one is checked
      expect(button.surfaces.length, `${name} gradient stops`).toBe(2);
      button.surfaces.forEach((surface, index) => {
        surface.forEach((channel, i) =>
          expect(Math.abs(channel - button.stops[index][i]), `${name} stop ${index} is the accent token`).toBeLessThanOrEqual(2),
        );
      });
    }
    expect(button.min, `${name} contrast (${button.className})`).toBeGreaterThanOrEqual(4.5);
  }
}

const manifestFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src/navigation.manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8")) as {
  categories: { views: { id: string }[] }[];
};
/** Every view id in the navigation manifest, in sidebar order (38 at the time of writing). */
export const HUB_VIEWS: string[] = manifest.categories.flatMap((c) => c.views.map((v) => v.id));

/** Hub chrome (F-040 decision 3). Component demo markup (.joy-*) is not chrome. */
export const HUB_CHROME = [
  ".topbar", ".topbar *", ".sidebar", ".sidebar *", ".sidebar-backdrop",
  ".view-panel.active > h1", ".view-panel.active > h2", ".view-panel.active > .header-tagline",
  ".view-panel.active .playground-header", ".view-panel.active .playground-header *",
  ".view-panel.active .component-header", ".view-panel.active .component-header *",
  ".view-panel.active .code-snippet", ".view-panel.active .tokens-table", ".view-panel.active .tokens-table *",
].join(", ");

/** Rendered size of the first element matching `selector`. */
export async function hitSize(page: Page, selector: string) {
  const box = await page.locator(selector).first().boundingBox();
  if (!box) throw new Error(`hitSize: ${selector} is not rendered`);
  return { width: box.width, height: box.height };
}
