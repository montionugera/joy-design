import { test, expect } from "@playwright/test";

test.describe("Smart Search Bar & Auto Smart Search", () => {
  test.beforeEach(async ({ page }, info) => {
    await page.goto("/design/");
    await page.waitForLoadState("networkidle");
    if (info.project.name === "mobile-chrome") {
      await page.locator("#mobile-menu-toggle").click();
      await expect(page.locator(".sidebar")).toHaveClass(/open/);
    }
  });

  test("sidebar search input has accessible traits, placeholder, and kbd badge", async ({
    page,
  }) => {
    const searchWrap = page.locator(".sidebar-search");
    await expect(searchWrap).toBeVisible();

    const input = page.locator("#sidebar-search-input");
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("placeholder", "Search components...");
    await expect(input).toHaveAttribute("type", "search");
    await expect(input).toHaveAttribute("aria-label", "Search components and views");

    const kbd = page.locator("#sidebar-search-kbd");
    await expect(kbd).toBeVisible();
    await expect(kbd).toContainText("K");

    const clearBtn = page.locator("#sidebar-search-clear");
    await expect(clearBtn).toBeHidden();
  });

  test("filtering components highlights matches, updates section badges, and hides empty sections", async ({
    page,
  }) => {
    const input = page.locator("#sidebar-search-input");
    await input.fill("select");

    // Clear button should now be visible, kbd hidden
    await expect(page.locator("#sidebar-search-clear")).toBeVisible();
    await expect(page.locator("#sidebar-search-kbd")).toBeHidden();

    // Select nav item should be visible with highlight mark
    const selectItem = page.locator('.nav-item[data-view="select"]');
    await expect(selectItem).toBeVisible();
    await expect(selectItem.locator(".nav-match-highlight")).toHaveText("Select");

    // Non-matching nav items should be hidden
    await expect(page.locator('.nav-item[data-view="button"]')).toBeHidden();
    await expect(page.locator('.nav-item[data-view="badge"]')).toBeHidden();

    // Data Entry & Forms section should be visible with count badge
    const formsSection = page.locator('.nav-section[data-section="Data Entry & Forms"]');
    await expect(formsSection).toBeVisible();
    await expect(formsSection.locator(".nav-section-count")).toBeVisible();

    // Unrelated sections like "Getting Started" or "General & Primitives" should be hidden
    await expect(page.locator('.nav-section[data-section="Getting Started"]')).toBeHidden();
    await expect(page.locator('.nav-section[data-section="General & Primitives"]')).toBeHidden();
  });

  test("clearing search restores all items, clean category headings, and removes badges", async ({
    page,
  }) => {
    const input = page.locator("#sidebar-search-input");
    await input.fill("table");
    await expect(page.locator('.nav-item[data-view="button"]')).toBeHidden();

    // Click clear button
    const clearBtn = page.locator("#sidebar-search-clear");
    await clearBtn.click();

    await expect(input).toHaveValue("");
    await expect(clearBtn).toBeHidden();
    await expect(page.locator("#sidebar-search-kbd")).toBeVisible();

    // All items restored
    await expect(page.locator('.nav-item[data-view="button"]')).toBeVisible();
    await expect(page.locator('.nav-item[data-view="select"]')).toBeVisible();

    // All 6 categories restored without count badges
    const expectedCategories = [
      "Getting Started",
      "General & Primitives",
      "Navigation & Workflow",
      "Data Entry & Forms",
      "Data Display & Feedback",
      "Enterprise & Telemetry",
    ];
    const sectionHeadings = await page.locator(".nav-section").allTextContents();
    expect(sectionHeadings).toEqual(expectedCategories);
  });

  test("empty state appears when no component matches query and Escape clears", async ({
    page,
  }) => {
    const input = page.locator("#sidebar-search-input");
    await input.fill("nonexistentqueryxyz");

    // Empty state visible
    const emptyState = page.locator("#sidebar-search-empty");
    await expect(emptyState).toBeVisible();
    await expect(emptyState.locator(".sidebar-search__empty-title")).toHaveText("No matching components");

    // All nav items and sections hidden
    await expect(page.locator(".nav-item:visible")).toHaveCount(0);
    await expect(page.locator(".nav-section:visible")).toHaveCount(0);

    // Escape clears input and restores items
    await input.press("Escape");
    await expect(input).toHaveValue("");
    await expect(emptyState).toBeHidden();
    await expect(page.locator(".nav-item:visible").first()).toBeVisible();
  });

  test("ArrowDown from search input moves focus to the first matching nav-item and Enter opens it", async ({
    page,
  }, info) => {
    test.skip(info.project.name !== "desktop-chrome", "desktop test");
    const input = page.locator("#sidebar-search-input");
    await input.focus();
    await input.fill("badge");

    // Press ArrowDown to jump focus to first visible match
    await input.press("ArrowDown");
    const badgeItem = page.locator('.nav-item[data-view="badge"]');
    const isFocused = await badgeItem.evaluate((el) => el === document.activeElement);
    expect(isFocused).toBe(true);

    // Press Enter to activate view
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#badge$/);
    await expect(page.locator("#view-badge")).toHaveClass(/active/);
  });

  test("global keyboard shortcut (⌘K or Ctrl+K) focuses search input from anywhere", async ({
    page,
  }, info) => {
    test.skip(info.project.name !== "desktop-chrome", "desktop test");
    // Click outside sidebar
    await page.locator(".topbar").click();
    expect(await page.evaluate(() => document.activeElement?.id)).not.toBe("sidebar-search-input");

    // Press Cmd+K or Ctrl+K
    await page.keyboard.press("ControlOrMeta+KeyK");
    const input = page.locator("#sidebar-search-input");
    const isFocused = await input.evaluate((el) => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test("slash shortcut (/) focuses search input when outside editable inputs", async ({
    page,
  }, info) => {
    test.skip(info.project.name !== "desktop-chrome", "desktop test");
    // Click topbar
    await page.locator(".topbar").click();

    // Press /
    await page.keyboard.press("/");
    const input = page.locator("#sidebar-search-input");
    const isFocused = await input.evaluate((el) => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test("mobile: global shortcut opens off-canvas drawer and focuses search bar", async ({
    page,
  }, info) => {
    test.skip(info.project.name !== "mobile-chrome", "mobile test");
    // Close the drawer first
    await page.locator(".sidebar-close-btn").click();
    const sidebar = page.locator(".sidebar");
    await expect(sidebar).not.toHaveClass(/open/);

    // Press ControlOrMeta+K
    await page.keyboard.press("ControlOrMeta+KeyK");
    await expect(sidebar).toHaveClass(/open/);

    const input = page.locator("#sidebar-search-input");
    const isFocused = await input.evaluate((el) => el === document.activeElement);
    expect(isFocused).toBe(true);
  });

  test("interactive Dropdown with >= 6 items auto-renders smart search bar and filters", async ({
    page,
  }) => {
    await page.goto("/#dropdown");
    await page.waitForLoadState("networkidle");

    // Trigger the searchable dropdown (>= 6 options)
    const trigger = page.locator(
      '.joy-dropdown-trigger[aria-controls="demo-dropdown-searchable"]',
    );
    await trigger.click();

    const dropdown = page.locator("#demo-dropdown-searchable");
    await expect(dropdown).toBeVisible();

    const searchInput = dropdown.locator(".joy-dropdown__search");
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute("placeholder", "Search strategies...");

    // Initial item count should be 8
    await expect(dropdown.locator(".joy-dropdown__item:visible")).toHaveCount(8);

    // Filter by "twap"
    await searchInput.fill("twap");
    await expect(dropdown.locator(".joy-dropdown__item:visible")).toHaveCount(1);
    await expect(dropdown.locator(".joy-dropdown__item:visible")).toContainText("TWAP");

    // Select the filtered item
    await dropdown.locator(".joy-dropdown__item:visible").click();
    await expect(dropdown).toBeHidden();
  });

  test("interactive Select with >= 6 options auto-renders smart search bar and filters", async ({
    page,
  }) => {
    await page.goto("/#select");
    await page.waitForLoadState("networkidle");

    // Open the searchable select (>= 6 options)
    const selectTrigger = page.locator(
      '#demo-instrument-select-wrap button.joy-select',
    );
    await selectTrigger.click();

    const listbox = page.locator("#demo-instrument-listbox");
    await expect(listbox).toBeVisible();

    const searchInput = listbox.locator(".joy-select__search");
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute("placeholder", "Search trading pairs...");

    // Initial count should be 8 options
    await expect(listbox.locator(".joy-select__option:visible")).toHaveCount(8);

    // Filter by "sol"
    await searchInput.fill("sol");
    await expect(listbox.locator(".joy-select__option:visible")).toHaveCount(1);
    await expect(listbox.locator(".joy-select__option:visible")).toContainText("SOL / USDT");

    // Click option to select it
    await listbox.locator(".joy-select__option:visible").click();
    await expect(listbox).toBeHidden();
    await expect(selectTrigger.locator(".joy-select__value")).toContainText("SOL / USDT");
  });
});
