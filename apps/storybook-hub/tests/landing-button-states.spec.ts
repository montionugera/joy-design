import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const css = fs.readFileSync(
  path.resolve(__dirname, "../../../packages/tokens/dist/theme.css"),
  "utf8",
);

// F-039 T1 (taste review P1-4, P2-16): in the hero, the CTA band and the pricing card a BUSY button keeps its variant
// identity (gold gradient, spinner in the on-accent colour, outline border) and a DISABLED button is a dimmed chip that
// still has a visible 1px border. Computed styles in Chromium from the committed theme.css alone.
const button = (variant: string, state: string) =>
  `<button type="button" class="joy-button joy-button--${variant} joy-button--lg${state === "loading" ? " joy-button--loading" : ""}" ${state === "loading" ? 'aria-busy="true" disabled' : state === "disabled" ? "disabled" : ""} data-k="${variant}-${state}"><span class="joy-button__label">Label</span>${state === "loading" ? '<span class="joy-button__spinner"><svg class="joy-button__spinner-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 12a9 9 0 0 0-9-9"/></svg></span>' : ""}</button>`;
const row = ["solid", "outline"]
  .flatMap((variant) =>
    ["enabled", "loading", "disabled"].map((state) => button(variant, state)),
  )
  .join(" ");
const contexts: Record<string, string> = {
  hero: `<section class="joy-hero"><div class="joy-hero__ctas">${row}</div></section>`,
  "cta-band": `<section class="joy-cta-section"><div class="joy-cta-section__container"><div class="joy-cta-section__actions">${row}</div></div></section>`,
  pricing: `<div class="joy-pricing-card"><div>${row}</div></div>`,
};

for (const theme of ["light", "dark"] as const) {
  for (const [name, markup] of Object.entries(contexts)) {
    test(`busy and disabled buttons in the ${name} in ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.setContent(
        `<!doctype html><html data-theme="${theme}"><head><style>${css} body{margin:0;background:var(--joy-surface-canvas)} *{transition:none!important}</style></head><body>${markup}</body></html>`,
      );
      const r = await page.evaluate(() => {
        const parse = (v: string) =>
          (v.match(/[\d.]+/g) ?? []).slice(0, 4).map(Number);
        const lin = (c: number) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        };
        const lum = ([r, g, b]: number[]) =>
          0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
        const ratio = (a: number[], b: number[]) => {
          const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
          return (hi + 0.05) / (lo + 0.05);
        };
        const first = document.querySelector<HTMLElement>("[data-k]")!;
        let surface = [255, 255, 255];
        for (
          let node: Element | null = first.parentElement;
          node;
          node = node.parentElement
        ) {
          const [r, g, b, a = 1] = parse(
            getComputedStyle(node).backgroundColor,
          );
          if (a > 0.99) {
            surface = [r, g, b];
            break;
          }
        }
        const read = (key: string) => {
          const el = document.querySelector<HTMLElement>(`[data-k="${key}"]`)!;
          const cs = getComputedStyle(el);
          const spinner = el.querySelector(".joy-button__spinner-svg");
          const [br, bg, bb, ba = 1] = parse(cs.backgroundColor);
          return {
            bg: cs.backgroundColor,
            bgAlpha: ba,
            image: cs.backgroundImage,
            border: cs.borderTopColor,
            borderWidth: cs.borderTopWidth,
            color: cs.color,
            shadow: cs.boxShadow,
            cursor: cs.cursor,
            spinner: spinner ? getComputedStyle(spinner).color : null,
            borderVsSurface: ratio(parse(cs.borderTopColor), surface),
            fillVsSurface: ba > 0.01 ? ratio([br, bg, bb], surface) : 1,
            labelVsSurface: ratio(
              parse(cs.color),
              ba > 0.5 ? [br, bg, bb] : surface,
            ),
          };
        };
        const keys = [
          "solid-enabled",
          "solid-loading",
          "solid-disabled",
          "outline-enabled",
          "outline-loading",
          "outline-disabled",
        ];
        return Object.fromEntries(keys.map((k) => [k, read(k)]));
      });

      // busy keeps the identity of the live button (fill, gradient, border, label colour, shadow)
      for (const variant of ["solid", "outline"]) {
        const live = r[`${variant}-enabled`];
        const busy = r[`${variant}-loading`];
        for (const prop of [
          "bg",
          "image",
          "border",
          "color",
          "shadow",
        ] as const) {
          expect(busy[prop], `${variant} busy keeps ${prop}`).toBe(live[prop]);
        }
        expect(busy.cursor, `${variant} busy shows the progress cursor`).toBe(
          "progress",
        );
        expect(
          busy.spinner,
          `${variant} spinner takes the live label colour`,
        ).toBe(live.color);
      }
      expect(
        r["solid-loading"].image,
        "busy solid keeps its gold gradient",
      ).toContain("linear-gradient");

      // disabled is a dimmed chip: a visible 1px border, never a filled slab heavier than the live button
      for (const variant of ["solid", "outline"]) {
        const off = r[`${variant}-disabled`];
        expect(off.borderWidth, `${variant} disabled keeps a 1px border`).toBe(
          "1px",
        );
        // The floor is 2.5, not the 3:1 non-text line, on purpose: a disabled control is exempt from WCAG 1.4.11, the border
        // only has to keep the shape from vanishing (the taste review found it near-invisible at ~1.1:1), and the brief names
        // --joy-border-default, whose real minimum is 2.79:1 (#566a87 on the dark raised panel #14253e).
        expect(
          off.borderVsSurface,
          `${variant} disabled border is visible against the surface`,
        ).toBeGreaterThanOrEqual(2.5);
        expect(off.image, `${variant} disabled has no gradient`).toBe("none");
        expect(off.shadow, `${variant} disabled has no shadow`).toBe("none");
        expect(
          off.fillVsSurface,
          `${variant} disabled fill is not a heavy slab`,
        ).toBeLessThan(1.5);
        expect(off.cursor).toBe("not-allowed");
      }
      if (name !== "hero") {
        expect(
          r["solid-disabled"].bgAlpha,
          "disabled on a raised panel is transparent",
        ).toBe(0);
      }
      // disabled reads lighter than the live outline button (dimmer border AND dimmer label)
      expect(r["outline-disabled"].borderVsSurface).toBeLessThan(
        r["outline-enabled"].borderVsSurface,
      );
      expect(
        r["outline-disabled"].labelVsSurface,
        "disabled label is dimmer than the live label",
      ).toBeLessThan(r["outline-enabled"].labelVsSurface);
    });
  }
}
