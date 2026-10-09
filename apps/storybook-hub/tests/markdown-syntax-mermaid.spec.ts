import { test, expect } from "@playwright/test";
import { installPageTools, setTheme } from "./helpers.js";

test.describe("F-072: Syntax Highlighting Code Box and Mermaid Diagram Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#markdown");
    await page.waitForLoadState("networkidle");
    await installPageTools(page);
    await expect(page.locator("#view-markdown")).toBeVisible();
  });

  test("CodeBlock renders language badge, filename, line numbers, and semantic token spans", async ({ page }) => {
    const codeBlock = page.locator("#view-markdown .joy-code-block").first();
    await expect(codeBlock).toBeVisible();

    // Header and meta
    await expect(codeBlock.locator(".joy-code-block__lang")).toHaveText("RUST");
    await expect(codeBlock.locator(".joy-code-block__title")).toHaveText("src/arbitrage.rs");

    // Copy button
    const copyBtn = codeBlock.locator(".joy-code-block__copy-btn");
    await expect(copyBtn).toBeVisible();
    await expect(copyBtn).toHaveAttribute("aria-label", "Copy code to clipboard");

    // Line numbers
    const lines = codeBlock.locator(".joy-code-block__lines");
    await expect(lines).toBeVisible();
    await expect(lines.locator("div")).toHaveCount(12);

    // Syntax highlighting token classes
    await expect(codeBlock.locator(".joy-syntax-keyword").first()).toBeVisible();
    await expect(codeBlock.locator(".joy-syntax-fn").first()).toBeVisible();
    await expect(codeBlock.locator(".joy-syntax-type").first()).toBeVisible();
    await expect(codeBlock.locator(".joy-syntax-comment").first()).toBeVisible();
  });

  test("PolyglotCodeTabs switches programming languages and panels on tab click", async ({ page }) => {
    const polyglot = page.locator("#view-markdown .joy-polyglot-tabs").first();
    await expect(polyglot).toBeVisible();

    const tabs = polyglot.locator(".joy-polyglot-tabs__tab");
    await expect(tabs).toHaveCount(3);
    await expect(tabs.nth(0)).toHaveText("Rust");
    await expect(tabs.nth(1)).toHaveText("TypeScript");
    await expect(tabs.nth(2)).toHaveText("Python");

    // Initially Rust is active
    await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "true");
    await expect(polyglot.locator('.joy-polyglot-tabs__panel-content[data-lang="rust"]')).toBeVisible();
    await expect(polyglot.locator('.joy-polyglot-tabs__panel-content[data-lang="typescript"]')).toBeHidden();

    // Click TypeScript tab
    await tabs.nth(1).click();
    await expect(tabs.nth(0)).toHaveAttribute("aria-selected", "false");
    await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
    await expect(polyglot.locator('.joy-polyglot-tabs__panel-content[data-lang="rust"]')).toBeHidden();
    await expect(polyglot.locator('.joy-polyglot-tabs__panel-content[data-lang="typescript"]')).toBeVisible();

    // Click Python tab
    await tabs.nth(2).click();
    await expect(tabs.nth(2)).toHaveAttribute("aria-selected", "true");
    await expect(polyglot.locator('.joy-polyglot-tabs__panel-content[data-lang="python"]')).toBeVisible();
  });

  test("MermaidViewer renders vector SVG and toggles between Diagram and Source views", async ({ page }) => {
    const mermaid = page.locator("#view-markdown .joy-mermaid").first();
    await expect(mermaid).toBeVisible();

    // Header badge and title
    await expect(mermaid.locator(".joy-mermaid__badge")).toHaveText("MERMAID");
    await expect(mermaid.locator(".joy-mermaid__title")).toContainText("Quant Execution Architecture");

    // Vector SVG rendered inside viewport
    const viewport = mermaid.locator(".joy-mermaid__viewport");
    await expect(viewport).toBeVisible();
    const svg = viewport.locator("svg.joy-mermaid__svg");
    await expect(svg).toBeVisible();
    await expect(svg.locator(".joy-mermaid-node").first()).toBeVisible();
    await expect(svg.locator(".joy-mermaid-edge").first()).toBeAttached();
    await expect(svg.locator(".joy-mermaid-arrow").first()).toBeAttached();

    // Toggle to Source view
    const toggleBtn = mermaid.locator(".joy-mermaid__btn").first();
    await expect(toggleBtn).toContainText("Source");
    await toggleBtn.click();

    // Viewport should hide and source code block should show
    await expect(viewport).toBeHidden();
    const sourceBlock = mermaid.locator(".joy-mermaid__source");
    await expect(sourceBlock).toBeVisible();
    await expect(toggleBtn).toContainText("Diagram");

    // Toggle back to Diagram view
    await toggleBtn.click();
    await expect(viewport).toBeVisible();
    await expect(sourceBlock).toBeHidden();
    await expect(toggleBtn).toContainText("Source");
  });

  test("Dark and light mode contrast verification for syntax tokens and mermaid diagrams", async ({ page }) => {
    // Light mode check
    await setTheme(page, "light");
    const codeBlock = page.locator("#view-markdown .joy-code-block").first();
    await expect(codeBlock).toBeVisible();
    const mermaid = page.locator("#view-markdown .joy-mermaid").first();
    await expect(mermaid).toBeVisible();

    // Dark mode check
    await setTheme(page, "dark");
    await expect(codeBlock).toBeVisible();
    await expect(mermaid).toBeVisible();
  });
});
