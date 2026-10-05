import { test, expect } from '@playwright/test';

test.describe('Ant Design 5 Benchmark Suite: Cascader & TreeSelect Advanced Controls', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
    await page.goto('/#select');
    await page.waitForSelector('#view-select', { state: 'visible' });
  });

  test('Cascader: multi-column navigation, hover reveal clear, and async loading indicator', async ({ page }) => {
    const cascader = page.locator('#demo-cascader');
    await expect(cascader).toBeVisible();

    const control = cascader.locator('.joy-cascader__control');
    const panel = cascader.locator('#demo-cascader-panel');
    const valueEl = cascader.locator('#demo-cascader-val');
    const clearBtn = cascader.locator('.joy-cascader__clear');

    // Initial state: closed
    await expect(panel).not.toBeVisible();
    await expect(valueEl).toHaveText('Markets / Perpetual Futures / BTC-USDT');

    // Click to open
    await control.click();
    await expect(panel).toBeVisible();
    await expect(cascader).toHaveClass(/joy-cascader--open/);

    // Verify 3 columns rendered
    const columns = panel.locator('.joy-cascader__column');
    await expect(columns).toHaveCount(3);

    // Verify async loading item in column 2
    const loadingItem = panel.locator('.joy-cascader__item-loading');
    await expect(loadingItem).toBeVisible();

    // Select leaf item "ETH-USDT"
    const ethItem = panel.locator('.joy-cascader__item', { hasText: 'ETH-USDT' });
    await ethItem.click();
    await expect(panel).not.toBeVisible();
    await expect(valueEl).toHaveText('Markets / Perpetual Futures / ETH-USDT');

    // Click clear button
    await clearBtn.click();
    await expect(valueEl).toHaveText('Select market path...');
  });

  test('TreeSelect: live search filtering, auto-expanding parent branches, and async node spinner', async ({ page }) => {
    const treeselect = page.locator('#demo-treeselect');
    await expect(treeselect).toBeVisible();

    const control = treeselect.locator('.joy-treeselect__control');
    const panel = treeselect.locator('#demo-treeselect-panel');
    const searchInput = treeselect.locator('#demo-treeselect-search');
    const tags = treeselect.locator('.joy-treeselect__tag');

    // Initial tags present
    await expect(tags).toHaveCount(2);

    // Click control to open
    await control.click({ position: { x: 10, y: 10 } });
    await expect(panel).toBeVisible();
    await expect(treeselect).toHaveClass(/joy-treeselect--open/);

    // Verify async node spinner
    const nodeLoading = panel.locator('.joy-treeselect__node-loading');
    await expect(nodeLoading).toBeVisible();

    // Search for "Alpha Signals"
    await searchInput.fill('Signals');
    const signalsNode = panel.locator('.joy-treeselect__node[data-key="signals"]');
    await expect(signalsNode).toBeVisible();

    // Verify parent branches (Research Division & Quant Core) auto-expanded
    const quantNode = panel.locator('.joy-treeselect__node[data-key="quant"]');
    const quantToggle = quantNode.locator('.joy-treeselect__node-toggle');
    await expect(quantToggle).toHaveClass(/joy-treeselect__node-toggle--expanded/);

    // Clear search
    await searchInput.fill('');

    // Toggle tree item selection: click on FIX Gateway
    const fixNode = panel.locator('.joy-treeselect__node[data-key="fix"]');
    await fixNode.click();
    await expect(fixNode).toHaveClass(/joy-treeselect__node--selected/);
    await expect(treeselect.locator('.joy-treeselect__tag')).toHaveCount(3);

    // Remove first tag
    const firstTagRemove = treeselect.locator('.joy-treeselect__tag-remove').first();
    await firstTagRemove.click();
    await expect(treeselect.locator('.joy-treeselect__tag')).toHaveCount(2);

    // Clear all tags using clear button
    const clearBtn = treeselect.locator('.joy-treeselect__clear');
    await clearBtn.click();
    await expect(treeselect.locator('.joy-treeselect__tag')).toHaveCount(0);
  });

  test('Responsive and theme visual check: 1280px light, 1280px dark, 375px mobile', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome', 'Screenshots generated in desktop-chrome project');

    const cascader = page.locator('#demo-cascader');
    const treeselect = page.locator('#demo-treeselect');

    // 1280px Light Theme
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    const advancedBox = page.locator('.playground-box', { hasText: 'Advanced Hierarchical Selects' });
    await advancedBox.scrollIntoViewIfNeeded();

    await cascader.locator('.joy-cascader__control').click();
    await expect(cascader.locator('#demo-cascader-panel')).toBeVisible();

    await advancedBox.screenshot({
      path: '/Users/pasitnusso/.gemini/antigravity-cli/brain/303edbc8-e3aa-4cf2-b2b2-067d1de28bc8/evidence-antd5-cascader-light-1280.png'
    });

    // Close cascader overlay before opening treeselect
    await cascader.locator('.joy-cascader__control').click();
    await expect(cascader.locator('#demo-cascader-panel')).not.toBeVisible();

    // 1280px Dark Theme
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    // Open treeselect in dark theme
    await treeselect.locator('.joy-treeselect__control').click({ position: { x: 10, y: 10 } });
    await expect(treeselect.locator('#demo-treeselect-panel')).toBeVisible();

    await advancedBox.screenshot({
      path: '/Users/pasitnusso/.gemini/antigravity-cli/brain/303edbc8-e3aa-4cf2-b2b2-067d1de28bc8/evidence-antd5-treeselect-dark-1280.png'
    });

    // 375px Mobile Viewport & Contract 6 verification
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(100);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(376);

    await page.screenshot({
      path: '/Users/pasitnusso/.gemini/antigravity-cli/brain/303edbc8-e3aa-4cf2-b2b2-067d1de28bc8/evidence-antd5-controls-dark-375.png',
      fullPage: false
    });
  });
});
