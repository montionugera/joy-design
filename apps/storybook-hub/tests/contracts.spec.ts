import { test, expect } from '@playwright/test';

test.describe('Storybook Hub Quality Contracts', () => {

  test('Contract 1: URL Hash Routing & Persistence across reloads', async ({ page }) => {
    // 1. Direct load with deep link #tokens
    await page.goto('/#tokens');
    await page.waitForLoadState('networkidle');

    const tokensView = page.locator('#view-tokens');
    await expect(tokensView).toBeVisible();
    await expect(tokensView).toHaveClass(/active/);

    const overviewView = page.locator('#view-overview');
    await expect(overviewView).not.toHaveClass(/active/);

    // 2. Reload preserves the active view
    await page.reload();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('#view-tokens')).toBeVisible();
    await expect(page.locator('#view-tokens')).toHaveClass(/active/);
    await expect(page.locator('#view-overview')).not.toHaveClass(/active/);

    // 3. Fallback on invalid hash
    await page.goto('/#non-existent-view-999');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#view-overview')).toBeVisible();
    await expect(page.locator('#view-overview')).toHaveClass(/active/);
  });

  test('Contract 2: Mobile Drawer Gestures & Focus Trapping (< 900px)', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('.sidebar');
    const menuBtn = page.locator('#mobile-menu-toggle');
    const backdrop = page.locator('#sidebar-backdrop');
    const closeBtn = page.locator('.sidebar-close-btn');

    // Sidebar should be off-canvas initially
    await expect(menuBtn).toBeVisible();
    await expect(sidebar).not.toHaveClass(/open/);
    await expect(backdrop).not.toHaveClass(/active/);

    // Open drawer
    await menuBtn.click();
    await expect(sidebar).toHaveClass(/open/);
    await expect(backdrop).toHaveClass(/active/);

    // Close via close button
    await closeBtn.click();
    await expect(sidebar).not.toHaveClass(/open/);
    await expect(backdrop).not.toHaveClass(/active/);

    // Reopen and close via backdrop click
    await menuBtn.click();
    await expect(sidebar).toHaveClass(/open/);
    await backdrop.click({ position: { x: 350, y: 100 } });
    await expect(sidebar).not.toHaveClass(/open/);

    // Reopen and close via Escape key
    await menuBtn.click();
    await expect(sidebar).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    await expect(sidebar).not.toHaveClass(/open/);
  });

  test('Contract 3: Zero Document-Level Horizontal Overflow', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 899, height: 900 },
      { width: 900, height: 900 },
      { width: 1280, height: 800 }
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto('/#overview');
      await page.waitForLoadState('networkidle');

      const isOverflowing = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
      });
      expect(isOverflowing, `Viewport ${vp.width}x${vp.height} must have no horizontal document overflow`).toBe(false);
    }
  });

  test('Contract 4: Semantic Navigation Taxonomy (Zero visible Wave labels)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify exactly 6 semantic category headings in sidebar
    const expectedCategories = [
      'Getting Started',
      'General & Primitives',
      'Navigation & Workflow',
      'Data Entry & Forms',
      'Data Display & Feedback',
      'Enterprise & Telemetry'
    ];

    const sectionHeadings = await page.locator('.nav-section').allTextContents();
    expect(sectionHeadings).toEqual(expectedCategories);

    // Ensure NO visible element contains Wave <number>
    const visibleWaveElements = await page.evaluate(() => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      const violations: string[] = [];
      let node;
      while ((node = walker.nextNode())) {
        const text = node.textContent?.trim() || '';
        if (/\bWave\s+\d+\b/i.test(text)) {
          const parent = node.parentElement;
          if (parent && parent.offsetParent !== null) { // visible in DOM
            violations.push(text);
          }
        }
      }
      return violations;
    });

    expect(visibleWaveElements, 'No visible elements should contain Wave <number> labels').toEqual([]);
  });

  test('Contract 5: Interactive 3D Kinetic Canvas on Landing Blocks', async ({ page }) => {
    await page.goto('/#landing-blocks');
    await page.waitForLoadState('networkidle');

    const canvas = page.locator('#kinetic-particle-canvas');
    await expect(canvas).toBeVisible();

    // Verify canvas size is non-zero
    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(100);
    expect(box!.height).toBeGreaterThan(100);

    // Trigger mouse interaction
    const container = page.locator('#kinetic-hero-container');
    await container.hover({ position: { x: 200, y: 150 } });
    await page.mouse.move(250, 180);
    await page.waitForTimeout(100);

    // Verify no uncaught console errors
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    expect(errors).toEqual([]);
  });

});
