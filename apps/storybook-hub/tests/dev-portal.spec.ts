import { test, expect } from '@playwright/test';

test.describe('Developer Portal & Cross-Library Hub Suite (dev.joymify.com)', () => {
  test('Visiting root / renders in portal-mode with Developer Portal Hero and hidden sidebar', async ({ page }, info) => {
    await page.goto('/');
    await page.waitForSelector('.portal-hero', { state: 'visible' });

    // Assert portal mode is active on body
    await expect(page.locator('body')).toHaveClass(/portal-mode/);

    // Sidebar must NOT be visible on root portal landing page
    await expect(page.locator('.sidebar')).not.toBeVisible();

    // Portal Hero must be prominent
    const portalHero = page.locator('.portal-hero');
    await expect(portalHero).toBeVisible();
    await expect(portalHero.locator('.portal-hero__title')).toContainText('The Unified Engineering Ecosystem');

    // Topbar portal navigation links must be visible on desktop and cleanly hidden on mobile
    if (info.project.name === 'mobile-chrome') {
      await expect(page.locator('.topbar-portal-nav')).toBeHidden();
    } else {
      await expect(page.locator('.topbar-portal-nav')).toBeVisible();
    }
  });

  test('Hero section and Bento grid render 3 core libraries: Design System, Server Decorator, and CLI State Handler', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.dev-portal-section', { state: 'visible' });

    const portalSection = page.locator('.dev-portal-section');
    await expect(portalSection).toBeVisible();

    // Verify 3 cards exist
    const designCard = page.locator('#portal-card-design');
    const decoratorCard = page.locator('#portal-card-decorator');
    const cliCard = page.locator('#portal-card-cli');

    await expect(designCard).toBeVisible();
    await expect(decoratorCard).toBeVisible();
    await expect(cliCard).toBeVisible();

    // Card 1: Design System
    await expect(designCard.locator('.dev-portal-card__title')).toContainText('Joy Design System');
    await expect(designCard.locator('.dev-portal-version')).toContainText('v3.4');
    await expect(designCard.locator('button', { hasText: 'Explore 70+ Components' })).toBeVisible();

    // Card 2: Server Decorator
    await expect(decoratorCard.locator('.dev-portal-card__title')).toContainText('Node Server Decorator');
    await expect(decoratorCard.locator('.dev-portal-card__code')).toContainText('@cache');
    await expect(decoratorCard.locator('a[href="/server-decorator/"]')).toBeVisible();

    // Card 3: CLI State Handler
    await expect(cliCard.locator('.dev-portal-card__title')).toContainText('CLI State Handler');
    await expect(cliCard.locator('.dev-portal-card__code')).toContainText('defineStateMachine');
    await expect(cliCard.locator('a[href="/cli-state-handler/"]')).toBeVisible();
  });

  test('Visiting /design/ renders Joy Design System with visible component sidebar and portal back link', async ({ page }, info) => {
    await page.goto('/design/');
    await page.waitForSelector('#view-overview', { state: 'visible' });

    // Assert body is NOT in portal-mode
    await expect(page.locator('body')).not.toHaveClass(/portal-mode/);

    if (info.project.name === 'mobile-chrome') {
      await page.locator('#mobile-menu-toggle').click();
      await expect(page.locator('.sidebar')).toHaveClass(/open/);
    } else {
      // Sidebar must be visible on desktop
      await expect(page.locator('.sidebar')).toBeVisible();
    }

    // Portal back link must point to root /
    const backLink = page.locator('.portal-back-link');
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/');

    // Sidebar cross-library suite navigator must be visible
    const suiteNav = page.locator('.sidebar-suite-wrap');
    await expect(suiteNav).toBeVisible();

    const designLink = suiteNav.locator('a[data-suite="design"]');
    const decoratorLink = suiteNav.locator('a[data-suite="server-decorator"]');
    const cliLink = suiteNav.locator('a[data-suite="cli-state"]');

    await expect(designLink).toBeVisible();
    await expect(designLink).toHaveClass(/active/);
    await expect(decoratorLink).toHaveAttribute('href', '/server-decorator/');
    await expect(cliLink).toHaveAttribute('href', '/cli-state-handler/');
  });

  test('Responsive layout at 375px mobile viewport has zero horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForTimeout(100);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(376);

    const designCard = page.locator('#portal-card-design');
    await expect(designCard).toBeVisible();
  });

  test('Theme switching preserves Developer Portal visual integrity in dark and light modes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#portal-card-design', { state: 'visible' });

    // Switch to dark
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.waitForTimeout(50);
    const darkTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(darkTheme).toBe('dark');

    const designCard = page.locator('#portal-card-design');
    await expect(designCard).toBeVisible();

    // Switch to light
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.waitForTimeout(50);
    const lightTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(lightTheme).toBe('light');
    await expect(designCard).toBeVisible();
  });

  test('Sub-webapp routes serve static documentation without 403 Forbidden', async ({ page }) => {
    // 1. Server Decorator Starlight Studio
    const resDecorator = await page.goto('/server-decorator/');
    expect(resDecorator?.status()).toBe(200);
    await expect(page).toHaveTitle(/server-decorator/);

    // 2. CLI State Handler Vite Docs
    const resCli = await page.goto('/cli-state-handler/');
    expect(resCli?.status()).toBe(200);
    await expect(page).toHaveTitle(/UCSA/);
    await expect(page.locator('#root')).not.toBeEmpty();

    // 3. Joy Design System Hub at /design/
    const resDesign = await page.goto('/design/');
    expect(resDesign?.status()).toBe(200);
    await expect(page).toHaveTitle(/Joymify Design System/);
  });

  test('Component view hashes on root / redirect to /design/#viewName', async ({ page, isMobile }) => {
    await page.goto('/#primitives');
    await page.waitForURL('**/design/#primitives');
    expect(page.url()).toContain('/design/#primitives');
    if (!isMobile) {
      const sidebar = page.locator('.sidebar');
      await expect(sidebar).toBeVisible();
    }
    await expect(page.locator('#view-primitives')).toHaveClass(/active/);
  });
});
