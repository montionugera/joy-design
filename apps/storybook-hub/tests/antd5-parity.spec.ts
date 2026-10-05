import { test, expect } from '@playwright/test';

test.describe('Ant Design 5 Quality Bar & Custom DatePicker Suite', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#date-picker');
    await page.waitForSelector('#view-date-picker', { state: 'visible' });
  });

  test('single datepicker opens custom calendar popover on click with ARIA traits', async ({ page }) => {
    const trigger = page.locator('#demo-date-picker-wrap');
    const popover = page.locator('#demo-single-calendar-popover');

    await expect(popover).not.toBeVisible();
    await trigger.click();
    await expect(popover).toBeVisible();

    // Verify ARIA traits and header
    await expect(popover).toHaveAttribute('role', 'dialog');
    await expect(popover).toHaveAttribute('aria-label', 'Choose date');

    const title = popover.locator('.joy-calendar__title');
    await expect(title).toBeVisible();
    const titleText = await title.innerText();
    expect(titleText).toContain('2026');

    // Verify 7x6 month grid (42 days)
    const cells = popover.locator('.joy-calendar__cell');
    await expect(cells).toHaveCount(42);

    // Selected date matches initial value (2026-09-19)
    const selectedCell = popover.locator('.joy-calendar__cell--selected');
    await expect(selectedCell).toBeVisible();
    await expect(selectedCell).toHaveText('19');
  });

  test('single datepicker header chevrons advance and retreat years and months', async ({ page }) => {
    await page.locator('#demo-date-picker-wrap').click();
    const popover = page.locator('#demo-single-calendar-popover');
    await expect(popover).toBeVisible();

    const title = popover.locator('.joy-calendar__title');
    await expect(title).toContainText('September');
    await expect(title).toContainText('2026');

    // Click next month
    await popover.locator('#single-next-month').click();
    await expect(title).toContainText('October');
    await expect(title).toContainText('2026');

    // Click previous month twice
    await popover.locator('#single-prev-month').click();
    await popover.locator('#single-prev-month').click();
    await expect(title).toContainText('August');
    await expect(title).toContainText('2026');

    // Click next year
    await popover.locator('#single-next-year').click();
    await expect(title).toContainText('August');
    await expect(title).toContainText('2027');

    // Click prev year
    await popover.locator('#single-prev-year').click();
    await expect(title).toContainText('August');
    await expect(title).toContainText('2026');
  });

  test('single datepicker selecting day cell updates value and feedback, then closes popover', async ({ page }) => {
    await page.locator('#demo-date-picker-wrap').click();
    const popover = page.locator('#demo-single-calendar-popover');
    await expect(popover).toBeVisible();

    // Pick day 25
    const day25 = popover.locator('.joy-calendar__cell:not(.joy-calendar__cell--muted)').filter({ hasText: /^25$/ });
    await day25.click();

    await expect(popover).not.toBeVisible();
    await expect(page.locator('#demo-single-date')).toHaveValue('2026-09-25');
    await expect(page.locator('#single-date-feedback')).toHaveText('2026-09-25');
  });

  test('single datepicker Today button selects current date and closes', async ({ page }) => {
    await page.locator('#demo-date-picker-wrap').click();
    const popover = page.locator('#demo-single-calendar-popover');
    await expect(popover).toBeVisible();

    await popover.locator('#single-today-btn').click();
    await expect(popover).not.toBeVisible();

    const val = await page.locator('#demo-single-date').inputValue();
    expect(val).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await expect(page.locator('#single-date-feedback')).toHaveText(val);
  });

  test('single datepicker clear button removes value and Escape closes popover', async ({ page }) => {
    // Open and close with Escape
    await page.locator('#demo-date-picker-wrap').click();
    const popover = page.locator('#demo-single-calendar-popover');
    await expect(popover).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(popover).not.toBeVisible();

    // Click clear button
    await page.locator('#demo-single-date-clear').click();
    await expect(page.locator('#demo-single-date')).toHaveValue('');
  });

  test('range picker unified trigger renders start, separator arrow, and end inputs', async ({ page }) => {
    const rangeWrap = page.locator('#demo-range-picker-wrap');
    await expect(rangeWrap).toBeVisible();

    await expect(rangeWrap.locator('#demo-range-start')).toHaveValue('2026-01-01');
    await expect(rangeWrap.locator('#demo-range-end')).toHaveValue('2026-09-19');
    await expect(rangeWrap.locator('.joy-date-range-picker__separator')).toBeVisible();
  });

  test('range picker clicking trigger opens dual-calendar panel side-by-side', async ({ page }) => {
    const rangeWrap = page.locator('#demo-range-picker-wrap');
    const rangePopover = page.locator('#demo-range-calendar-popover');

    await expect(rangePopover).not.toBeVisible();
    await rangeWrap.click();
    await expect(rangePopover).toBeVisible();

    // Dual panes check
    const panes = rangePopover.locator('.joy-calendar__pane');
    await expect(panes).toHaveCount(2);

    // Left pane has January 2026, Right pane has February 2026
    const leftTitle = panes.nth(0).locator('.joy-calendar__title');
    const rightTitle = panes.nth(1).locator('.joy-calendar__title');
    await expect(leftTitle).toContainText('January');
    await expect(leftTitle).toContainText('2026');
    await expect(rightTitle).toContainText('February');
    await expect(rightTitle).toContainText('2026');
  });

  test('range picker selecting start and end dates commits interval and updates feedback', async ({ page }) => {
    await page.locator('#demo-range-picker-wrap').click();
    const rangePopover = page.locator('#demo-range-calendar-popover');
    await expect(rangePopover).toBeVisible();

    const leftPane = rangePopover.locator('.joy-calendar__pane').nth(0);
    const day10 = leftPane.locator('.joy-calendar__cell:not(.joy-calendar__cell--muted)').filter({ hasText: /^10$/ });
    const day20 = leftPane.locator('.joy-calendar__cell:not(.joy-calendar__cell--muted)').filter({ hasText: /^20$/ });

    // Click day 10 (start)
    await day10.click();
    // Click day 20 (end)
    await day20.click();

    await expect(rangePopover).not.toBeVisible();
    await expect(page.locator('#demo-range-start')).toHaveValue('2026-01-10');
    await expect(page.locator('#demo-range-end')).toHaveValue('2026-01-20');
    await expect(page.locator('#range-date-feedback')).toHaveText('2026-01-10 to 2026-01-20');
  });

  test('range picker preset buttons immediately set interval and close popover', async ({ page }) => {
    await page.locator('#demo-range-picker-wrap').click();
    const rangePopover = page.locator('#demo-range-calendar-popover');
    await expect(rangePopover).toBeVisible();

    // Click "Last 7 Days"
    const last7 = rangePopover.locator('.joy-calendar__preset-btn', { hasText: 'Last 7 Days' });
    await expect(last7).toBeVisible();
    await last7.click();

    await expect(rangePopover).not.toBeVisible();
    const startVal = await page.locator('#demo-range-start').inputValue();
    const endVal = await page.locator('#demo-range-end').inputValue();
    expect(startVal).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(endVal).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await expect(page.locator('#range-date-feedback')).toHaveText(`${startVal} to ${endVal}`);
  });

  test('range picker clear button clears start and end dates', async ({ page }) => {
    await page.locator('#demo-range-clear').click();
    await expect(page.locator('#demo-range-start')).toHaveValue('');
    await expect(page.locator('#demo-range-end')).toHaveValue('');
  });

  test('visual evidence: captures dark and light mode high-resolution screenshots of custom pickers', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-chrome', 'Screenshots generated in desktop-chrome project');

    // 1. Dark Mode Single DatePicker Open (1280px)
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.locator('#demo-date-picker-wrap').click();
    const singlePopover = page.locator('#demo-single-calendar-popover');
    await expect(singlePopover).toBeVisible();
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'dist/evidence-antd5-datepicker-dark-1280.png', fullPage: false });

    // Close single
    await page.keyboard.press('Escape');

    // 2. Dark Mode RangePicker Dual Panel Open (1280px)
    await page.locator('#demo-range-picker-wrap').click();
    const rangePopover = page.locator('#demo-range-calendar-popover');
    await expect(rangePopover).toBeVisible();
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'dist/evidence-antd5-rangepicker-dark-1280.png', fullPage: false });

    // Close range
    await page.keyboard.press('Escape');

    // 3. Light Mode RangePicker Dual Panel Open (1280px)
    await page.emulateMedia({ colorScheme: 'light' });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.locator('#demo-range-picker-wrap').click();
    await expect(rangePopover).toBeVisible();
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'dist/evidence-antd5-rangepicker-light-1280.png', fullPage: false });

    // Close range
    await page.keyboard.press('Escape');

    // 4. Mobile 375px Viewport DatePicker
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.setViewportSize({ width: 375, height: 812 });
    await page.locator('#demo-date-picker-wrap').click();
    await expect(singlePopover).toBeVisible();
    await page.waitForTimeout(200);
    await page.screenshot({ path: 'dist/evidence-antd5-datepicker-dark-375.png', fullPage: false });
  });
});
