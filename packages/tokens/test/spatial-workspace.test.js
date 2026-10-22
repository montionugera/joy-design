import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import "../build.js";

// F-086: canvas-first spatial workspace contracts, consumed as plain CSS classes
// by string-template apps (atlas-world catalog explorer) that cannot import twins.
const css = fs.readFileSync(path.resolve("dist/theme.css"), "utf8");
const START = "/* ── F-086 Spatial Workspace Contracts ── */";
const END = "/* ── end F-086 Spatial Workspace Contracts ── */";

function section() {
  const a = css.indexOf(START);
  const b = css.indexOf(END);
  assert.ok(
    a >= 0 && b > a,
    "theme.css must contain the F-086 section markers",
  );
  return css.slice(a, b);
}

const BLOCKS = {
  ".joy-spatial-shell": [
    "__chrome",
    "__body",
    "__left",
    "__canvas",
    "__hud",
    "__bottom",
    "__toggle",
  ],
  ".joy-lens-bar": [
    "__tabs",
    "__tab",
    "__icon",
    "__badge",
    "__kbd",
    "__trailing",
  ],
  ".joy-context-filter-bar": [
    "__chips",
    "__chip",
    "__count",
    "__notice",
    "__notice-action",
  ],
  ".joy-omni-command-bar": [
    "__field",
    "__input",
    "__kbd",
    "__tray",
    "__group",
    "__group-label",
    "__item",
  ],
};

const INTERACTIVE = [
  ".joy-spatial-shell__toggle",
  ".joy-lens-bar__tab",
  ".joy-context-filter-bar__chip",
  ".joy-context-filter-bar__notice-action",
  ".joy-omni-command-bar__item",
];

test("F-086: theme.css emits all four spatial contracts and their element classes", () => {
  const s = section();
  for (const [block, elements] of Object.entries(BLOCKS)) {
    assert.ok(
      s.includes(`${block} {`) || s.includes(`${block},`),
      `${block} missing`,
    );
    for (const el of elements) {
      assert.ok(s.includes(`${block}${el}`), `${block}${el} missing`);
    }
  }
});

test("F-086: spatial contracts use tokens only (no colour literals, no blur glass, no raw z-index)", () => {
  const s = section();
  assert.doesNotMatch(s, /#[0-9a-fA-F]{3,8}\b/, "hex literal in F-086 section");
  assert.doesNotMatch(
    s,
    /\b(rgba?|hsla?|oklch)\(/,
    "colour function in F-086 section",
  );
  assert.doesNotMatch(
    s,
    /backdrop-filter/,
    "glassmorphism is an anti-reference (PRODUCT.md)",
  );
  for (const m of s.matchAll(/z-index:\s*([^;]+);/g)) {
    assert.match(
      m[1].trim(),
      /^var\(--joy-z-[a-z]+\)$/,
      `raw z-index: ${m[1]}`,
    );
  }
  assert.doesNotMatch(
    s,
    /var\(--joy-[a-z0-9-]+,/,
    "no var() fallbacks (AGENTS.md token contract)",
  );
});

test("F-086: every interactive element has focus-visible and a 44px coarse-pointer target", () => {
  const s = section();
  const coarse = [...s.matchAll(/@media \(pointer: coarse\) \{([\s\S]*?)\n\}/g)]
    .map((m) => m[1])
    .join("\n");
  assert.ok(coarse.length > 0, "F-086 section needs a pointer: coarse block");
  for (const sel of INTERACTIVE) {
    assert.ok(
      s.includes(`${sel}:focus-visible`),
      `${sel}:focus-visible missing`,
    );
    const rule = coarse.match(
      new RegExp(
        `${sel.replace(/[.]/g, "\\.")}[^{]*\\{[^}]*min-height:\\s*44px`,
      ),
    );
    assert.ok(rule, `${sel} needs min-height: 44px under pointer: coarse`);
  }
  for (const sel of [".joy-lens-bar__tab", ".joy-context-filter-bar__chip"]) {
    assert.ok(s.includes(`${sel}:disabled`), `${sel}:disabled missing`);
  }
});

test("F-086: selection state is carried by ARIA attributes, not modifier classes", () => {
  const s = section();
  assert.ok(s.includes('.joy-lens-bar__tab[aria-selected="true"]'));
  assert.ok(s.includes('.joy-context-filter-bar__chip[aria-pressed="true"]'));
  assert.ok(s.includes('.joy-omni-command-bar__item[aria-selected="true"]'));
});

test("F-086: spatial shell state is driven by data attributes, including theater and the 768px bottom sheet", () => {
  const s = section();
  for (const attr of [
    '[data-left-open="true"]',
    '[data-bottom-open="true"]',
    '[data-theater="true"]',
  ]) {
    assert.ok(
      s.includes(`.joy-spatial-shell${attr}`),
      `.joy-spatial-shell${attr} missing`,
    );
  }
  assert.match(
    s,
    /@media \(max-width: 767px\)[\s\S]*\.joy-spatial-shell__left/,
    "left dock must become a bottom sheet below 768px",
  );
  assert.match(s, /--joy-spatial-min-canvas:\s*480px/);
  assert.match(s, /100dvh/);
});

test("F-086: omni tray opens only on focus-within or data-open", () => {
  const s = section();
  assert.match(s, /\.joy-omni-command-bar__tray\s*\{[^}]*display:\s*none/);
  assert.ok(
    s.includes(
      ".joy-omni-command-bar:focus-within .joy-omni-command-bar__tray",
    ),
  );
  assert.ok(
    s.includes(
      '.joy-omni-command-bar[data-open="true"] .joy-omni-command-bar__tray',
    ),
  );
});

test("F-086: transitions in the spatial section have a reduced-motion branch", () => {
  const s = section();
  const reduced = [
    ...s.matchAll(
      /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/g,
    ),
  ]
    .map((m) => m[1])
    .join("\n");
  const animated = [
    ...s.matchAll(/(\.joy-[a-z-]+(?:__[a-z-]+)?)[^{]*\{[^}]*\btransition:/g),
  ].map((m) => m[1]);
  assert.ok(animated.length > 0, "expected animated selectors");
  for (const sel of new Set(animated)) {
    assert.ok(
      reduced.includes(sel),
      `${sel} transitions without a reduced-motion branch`,
    );
  }
});

test("F-086: notice uses info status tokens (status colour reserved for status)", () => {
  const s = section();
  const notice = s.match(/\.joy-context-filter-bar__notice\s*\{([^}]*)\}/);
  assert.ok(notice, "notice rule missing");
  assert.match(notice[1], /--joy-status-info-bg/);
  assert.match(notice[1], /--joy-status-info-fg/);
  const nonNotice = s.replace(
    /\.joy-context-filter-bar__notice[^{]*\{[^}]*\}/g,
    "",
  );
  assert.doesNotMatch(
    nonNotice,
    /--joy-status-/,
    "status tokens may only style the notice",
  );
});

test("F-086: popover hosts never clip (omni tray must escape the chrome and lens bar)", () => {
  const s = section();
  for (const sel of [".joy-spatial-shell__chrome", ".joy-lens-bar"]) {
    const rule = s.match(
      new RegExp(`\\n${sel.replace(/[.]/g, "\\.")} \\{([^}]*)\\}`),
    );
    assert.ok(rule, `${sel} rule missing`);
    assert.doesNotMatch(
      rule[1],
      /overflow|max-height/,
      `${sel} must not clip descendants (the omni tray is absolutely positioned inside it)`,
    );
  }
  assert.match(
    s,
    /\.joy-lens-bar__tabs \{[^}]*overflow-x:\s*auto/,
    "tab scrolling belongs on __tabs",
  );
});

test("F-086: below 768px the lens bar wraps its trailing controls onto their own row (no horizontal scroll)", () => {
  const s = section();
  assert.match(
    s,
    /@media \(max-width: 767px\) \{[^@]*\.joy-lens-bar \{[^}]*flex-wrap:\s*wrap/,
  );
  assert.match(
    s,
    /@media \(max-width: 767px\) \{[^@]*\.joy-lens-bar__trailing \{[^}]*flex:\s*1 1 100%/,
  );
});

test("F-086: the omni bar keeps a usable width when hosted in the lens bar trailing slot", () => {
  assert.match(
    section(),
    /\.joy-lens-bar__trailing \.joy-omni-command-bar \{[^}]*flex:\s*0 0 320px/,
  );
});

// Rules of the form `sel { ... }` inside a CSS chunk, as [selectorList[], body].
function rules(chunk) {
  return [...chunk.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => [
    m[1].split(",").map((x) => x.trim()),
    m[2],
  ]);
}

test("F-086 (review): each interactive selector itself carries the 44px coarse target", () => {
  const s = section();
  const coarse = [...s.matchAll(/@media \(pointer: coarse\) \{([\s\S]*?)\n\}/g)]
    .map((m) => m[1])
    .join("\n");
  for (const sel of INTERACTIVE) {
    assert.ok(
      rules(coarse).some(
        ([sels, body]) => sels.includes(sel) && /min-height:\s*44px/.test(body),
      ),
      `${sel} must be listed in a coarse rule that sets min-height: 44px`,
    );
  }
});

test("F-086 (review): every transitioned or animated selector is named exactly in a reduced-motion rule", () => {
  const s = section();
  const reduced = [
    ...s.matchAll(
      /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/g,
    ),
  ]
    .map((m) => m[1])
    .join("\n");
  const calmed = new Set(rules(reduced).flatMap(([sels]) => sels));
  const outside = s.replace(
    /@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/g,
    "",
  );
  for (const [sels, body] of rules(outside)) {
    if (!/\b(transition|animation):/.test(body)) continue;
    for (const sel of sels)
      assert.ok(
        calmed.has(sel),
        `${sel} animates without an exact reduced-motion rule`,
      );
  }
});

test("F-086 (review): hover never overrides a pressed or selected state", () => {
  const s = section();
  assert.ok(
    s.includes(
      '.joy-context-filter-bar__chip:hover:not(:disabled):not([aria-pressed="true"])',
    ),
  );
  assert.ok(
    s.includes(
      '.joy-spatial-shell__toggle:hover:not(:disabled):not([aria-pressed="true"])',
    ),
  );
  assert.ok(
    s.includes(
      '.joy-lens-bar__tab:hover:not(:disabled):not([aria-selected="true"])',
    ),
  );
});

test("F-086 (review): an active omni tray lifts the chrome above the mobile left sheet", () => {
  const s = section();
  assert.match(
    s,
    /\.joy-spatial-shell__chrome:focus-within,\s*\.joy-spatial-shell__chrome:has\(\.joy-omni-command-bar\[data-open="true"\]\) \{\s*z-index: var\(--joy-z-popover\);/,
  );
});
