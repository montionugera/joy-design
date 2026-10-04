import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir =
  process.env.F056_SCREENS_DIR ||
  path.resolve(__dirname, "../dist/screenshots");

const brainScreenshotsDir = "/Users/pasitnusso/.gemini/antigravity-cli/brain/1ad0770e-cf82-4de2-beff-bb22e70dfab3/screenshots";

async function safeScreenshot(locator: any, filename: string) {
  try {
    if (fs.existsSync(outDir)) {
      const targetPath = path.join(outDir, filename);
      await locator.screenshot({ path: targetPath });
      // Also copy to brain artifacts directory if it exists
      if (fs.existsSync(brainScreenshotsDir)) {
        fs.copyFileSync(targetPath, path.join(brainScreenshotsDir, filename));
      }
    }
  } catch (err) {
    console.warn(`Could not save screenshot ${filename}:`, err);
  }
}

test.describe("F-056: Smart Glasses HUD (Optical AR) & Interaction Engine", () => {
  test.beforeAll(() => {
    try {
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }
      if (!fs.existsSync(brainScreenshotsDir)) {
        fs.mkdirSync(brainScreenshotsDir, { recursive: true });
      }
    } catch (err) {
      console.warn("Could not create screenshots directory:", err);
    }
  });

  test("1. Glasses HUD section loads, renders dual-panel visor and telemetry", async ({ page }, testInfo) => {
    if (testInfo.project.name === "mobile-chrome") {
      test.skip();
    }

    await page.goto("/#glasses-hud");
    await page.waitForTimeout(300);

    const hudView = page.locator("#view-glasses-hud");
    await expect(hudView).toBeVisible();

    const visor = page.locator(".hud-visor-frame");
    await expect(visor).toBeVisible();

    const telemetry = page.locator(".hud-telemetry-bar");
    await expect(telemetry).toBeVisible();
    await expect(telemetry).toContainText("JOYMIFY AR // GLASSES HUD");
    await expect(telemetry).toContainText("BAT: 84%");

    // Left Panel & Right Panel exist
    const leftPanel = page.locator(".hud-left-panel");
    const rightPanel = page.locator(".hud-right-panel");
    await expect(leftPanel).toBeVisible();
    await expect(rightPanel).toBeVisible();

    // Verify status pill and mode
    const comPill = page.locator("#hud-com-pill");
    await expect(comPill).toBeVisible();
    await expect(comPill).toContainText("Voice");
    await expect(comPill).toContainText("AI Talking");

    // Verify transcript log contains initial script
    const transcript = page.locator("#hud-transcript-box");
    await expect(transcript).toBeVisible();
    await expect(transcript).toContainText("Show Me the today Todos");
    await expect(transcript).toContainText("Claudia (Agent)");

    // Ensure dark theme for night scene capture
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(200);

    // Capture initial dark view screenshot
    await safeScreenshot(visor, "hud-view-night-dark-1280.png");
  });

  test("2. Speech simulation and Tap-to-Interrupt state machine", async ({ page }, testInfo) => {
    if (testInfo.project.name === "mobile-chrome") {
      test.skip();
    }

    await page.goto("/#glasses-hud");
    await page.waitForTimeout(300);

    // Trigger Checklist voice prompt button
    const checklistPromptBtn = page.locator("button.joy-button:has-text('Prompt: Checklist')");
    await expect(checklistPromptBtn).toBeVisible();
    await checklistPromptBtn.click();
    await page.waitForTimeout(100);

    // Claudia state should become talking
    const statusPill = page.locator("#hud-com-pill");
    await expect(statusPill).toContainText("AI Talking");

    // Temple Tap interrupts speech
    const tapBtn = page.locator("#btn-touch-tap");
    await expect(tapBtn).toBeVisible();
    await tapBtn.click();
    await page.waitForTimeout(100);

    // Should immediately transition to listening
    await expect(statusPill).toContainText("Listening");

    // Event feed should register interrupt
    const eventFeed = page.locator("#hud-event-feed");
    await expect(eventFeed).toContainText("Speech interrupted by Tap");
  });

  test("3. Right Panel view navigation, detail action tray, and todo completion", async ({ page }, testInfo) => {
    if (testInfo.project.name === "mobile-chrome") {
      test.skip();
    }

    await page.goto("/#glasses-hud");
    await page.waitForTimeout(300);

    const titleEl = page.locator("#hud-assist-title");
    await expect(titleEl).toContainText("Today Todos");

    // Verify checklist items are rendered
    const todosView = page.locator("#hud-view-todos");
    await expect(todosView).toBeVisible();
    await expect(todosView).toContainText("Walk 3 Km");
    await expect(todosView).toContainText("Prepare Meeting note");
    await expect(todosView).toContainText("Meeting with John");

    // Click item "Walk 3 Km" to enter Todo Detail Action Tray
    const walkItem = page.locator("#hud-view-todos .hud-list-item:has-text('Walk 3 Km')");
    await walkItem.click();
    await page.waitForTimeout(150);

    // Right panel should now show Todo Detail view with Action buttons
    const detailView = page.locator("#hud-view-todo-detail");
    await expect(detailView).toBeVisible();
    await expect(titleEl).toContainText("Walk 3 Km");
    await expect(detailView).toContainText("[ Mark done ]");
    await expect(detailView).toContainText("[ Delete ]");

    // Capture Todo Detail screenshot
    const visor = page.locator(".hud-visor-frame");
    await safeScreenshot(visor, "hud-todos-detail-1280.png");

    // Click "Mark done"
    const markDoneAction = page.locator("#hud-view-todo-detail .hud-list-item:has-text('[ Mark done ]')");
    await markDoneAction.click();
    await page.waitForTimeout(150);

    // Should return to todos list and Walk 3 Km checkbox should have checked class
    await expect(todosView).toBeVisible();
    const todoBox0 = page.locator("#todo-box-0");
    await expect(todoBox0).toHaveClass(/checked/);

    // Double Tap gesture navigates back to Control Center
    const doubleTapBtn = page.locator("#btn-touch-double");
    await doubleTapBtn.click();
    await page.waitForTimeout(150);
    await expect(titleEl).toContainText("Control Center");

    // In Control Center, Daily Todos badge should reflect completed items
    const todosBadge = page.locator("#hud-todos-badge");
    await expect(todosBadge).toContainText("2 / 3");
  });

  test("4. Optical ambient scene switcher and light/dark theme contrast", async ({ page }, testInfo) => {
    if (testInfo.project.name === "mobile-chrome") {
      test.skip();
    }

    await page.goto("/#glasses-hud");
    await page.waitForTimeout(300);

    const visor = page.locator(".hud-visor-frame");

    // Switch to Daylight Walk
    const daylightBtn = page.locator("#btn-scene-daylight");
    await expect(daylightBtn).toBeVisible();
    await daylightBtn.click();
    await page.waitForTimeout(150);
    await expect(visor).toHaveAttribute("data-scene", "daylight");

    // Switch system theme to light
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await page.waitForTimeout(200);

    await safeScreenshot(visor, "hud-view-daylight-light-1280.png");

    // Revert back to dark theme
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await page.waitForTimeout(150);
  });

  test("5. Mobile responsive layout at 375px viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/#glasses-hud");
    await page.waitForTimeout(300);

    const hudView = page.locator("#view-glasses-hud");
    await expect(hudView).toBeVisible();

    const visor = page.locator(".hud-visor-frame");
    await expect(visor).toBeVisible();

    // Verify touch controller is accessible
    const controller = page.locator(".hud-temple-controller");
    await expect(controller).toBeVisible();

    await safeScreenshot(visor, "hud-view-mobile-375.png");
  });
});
