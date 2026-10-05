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

  test('Wave 3 Floating Overlays: Modal dialog & Popconfirm nested confirmation', async ({ page }) => {
    await page.goto('/#modal');
    await page.waitForSelector('#view-modal', { state: 'visible' });

    // Open Modal
    const openBtn = page.locator('#view-modal button', { hasText: 'Open Confirm Modal' });
    await openBtn.click();

    const modal = page.locator('#demo-modal-container .joy-modal');
    await expect(modal).toBeVisible();

    // Trigger Popconfirm nested inside modal
    const popconfirmTrigger = modal.locator('button', { hasText: 'Review sub-accounts first' });
    await expect(popconfirmTrigger).toBeVisible();
    await popconfirmTrigger.click();

    const popconfirmPanel = page.locator('#hub-popconfirm-modal');
    await expect(popconfirmPanel).toBeVisible();
    await expect(popconfirmPanel).toHaveClass(/joy-popconfirm__panel/);

    // Cancel Popconfirm
    const cancelPopBtn = popconfirmPanel.locator('button', { hasText: 'Cancel' });
    await cancelPopBtn.click();
    await expect(popconfirmPanel).not.toBeVisible();

    // Close Modal
    const closeModalBtn = modal.locator('.joy-modal__close');
    await closeModalBtn.click();
    await expect(modal).not.toBeVisible();
  });

  test('Wave 3 Floating Overlays: Tooltip keyboard focus and ARIA attributes', async ({ page }) => {
    await page.goto('/#tooltip');
    await page.waitForSelector('#view-tooltip', { state: 'visible' });

    const badge = page.locator('#view-tooltip .joy-badge', { hasText: 'Focus me (keyboard)' });
    await expect(badge).toBeVisible();
    await badge.focus();

    const tooltip = page.locator('#demo-tip-b');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveAttribute('role', 'tooltip');
  });

  test('Wave 4 Navigation: Tabs active indicator and Segmented control toggle', async ({ page }) => {
    await page.goto('/#tabs');
    await page.waitForSelector('#view-tabs', { state: 'visible' });

    const tabsBox = page.locator('#view-tabs .joy-tabs');
    await expect(tabsBox).toBeVisible();
    const firstTab = tabsBox.locator('.joy-tab-btn', { hasText: 'Live Orders' });
    await expect(firstTab).toHaveClass(/joy-tab-btn--active/);

    const secondTab = tabsBox.locator('.joy-tab-btn', { hasText: 'Historical Fills' });
    await secondTab.click();
    await expect(secondTab).toHaveClass(/joy-tab-btn--active/);
    await expect(firstTab).not.toHaveClass(/joy-tab-btn--active/);

    // Segmented control in primitives
    await page.goto('/#primitives');
    await page.waitForSelector('#view-primitives', { state: 'visible' });

    const segmented = page.locator('#demo-segmented');
    await expect(segmented).toBeVisible();
    const oneDayBtn = segmented.locator('.joy-segmented__item', { hasText: '1D' });
    await oneDayBtn.click();
    await expect(oneDayBtn).toHaveClass(/joy-segmented__item--active/);
  });

  test('Wave 5 Form Controls: InputNumber steppers, Rate stars, and Slider attributes', async ({ page }) => {
    await page.goto('/#forms');
    await page.waitForSelector('#view-forms', { state: 'visible' });

    // InputNumber stepper
    const numInput = page.locator('#demo-num-input');
    await expect(numInput).toHaveValue('10');
    const inputNumberBox = page.locator('.joy-input-number', { has: numInput });
    const upBtn = inputNumberBox.locator('.joy-input-number__handler-up');
    await upBtn.click();
    await expect(numInput).toHaveValue('11');

    // Rate scale
    const rate = page.locator('#demo-rate');
    await expect(rate).toBeVisible();
    await expect(rate).toHaveAttribute('role', 'radiogroup');

    // Slider
    await page.goto('/#slider');
    await page.waitForSelector('#view-slider', { state: 'visible' });

    const sliderHandle = page.locator('#demo-slider-handle');
    await expect(sliderHandle).toBeVisible();
    await expect(sliderHandle).toHaveAttribute('role', 'slider');
    await expect(sliderHandle).toHaveAttribute('aria-valuenow', '25');
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
