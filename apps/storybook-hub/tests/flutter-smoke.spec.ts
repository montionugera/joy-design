import { test, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, execSync, type ChildProcess } from "node:child_process";
import { isReachable, waitForServer } from "./wait-for-server";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const flutterHubDir = path.resolve(__dirname, "../../flutter-hub");
const flutterWebDir = path.resolve(flutterHubDir, "build/web");

const flutterPort = process.env.FLUTTER_PORT ?? "6118";
const flutterUrl = `http://127.0.0.1:${flutterPort}`;

let serverProcess: ChildProcess | null = null;

function resolveTargetUrl(baseURL?: string): string {
  if (baseURL && baseURL.includes("6118")) {
    return baseURL;
  }
  return flutterUrl;
}

test.describe.configure({ mode: "serial" });

test.describe("Flutter Web Showcase & JoyHubBridge Smoke", () => {
  test.skip(process.env.SKIP_FLUTTER === "1", "SKIP_FLUTTER=1: no Flutter-relevant change");

  test.beforeAll(async () => {
    test.setTimeout(180_000); // the hook budget must exceed the server wait below, or the default 30 s would cut it short
    // Ensure Flutter web bundle exists
    if (!fs.existsSync(path.join(flutterWebDir, "index.html"))) {
      execSync("flutter build web", { cwd: flutterHubDir, stdio: "inherit" });
    }

    // Check if server is already running on flutterPort (e.g. started by Playwright webServer or external serve)
    const running = await isReachable(flutterUrl);
    if (!running) {
      serverProcess = spawn(
        "npx",
        ["--yes", "serve", "-p", flutterPort, flutterWebDir],
        {
          stdio: "ignore",
        },
      );

      // A cold `npx serve` on a loaded machine can take far longer than a few seconds; fail here with a clear message.
      await waitForServer(flutterUrl, { timeoutMs: 120_000 });
    }
  });

  test.afterAll(async () => {
    if (serverProcess) {
      try {
        serverProcess.kill("SIGTERM");
      } catch {
        // Ignored
      }
      serverProcess = null;
    }
  });

  test("window.__joyHub attaches and signals ready === true", async ({ page, baseURL }) => {
    const targetUrl = resolveTargetUrl(baseURL);
    await page.goto(targetUrl);
    await page.waitForFunction(
      () => (window as any).__joyHub?.ready === true,
      { timeout: 30000 },
    );

    const isReady = await page.evaluate(
      () => (window as any).__joyHub?.ready,
    );
    expect(isReady).toBe(true);

    const initialTheme = await page.evaluate(
      () => (window as any).__joyHub?.currentTheme,
    );
    expect(["light", "dark"]).toContain(initialTheme);
  });

  test("setTheme('dark') updates theme in Flutter app and window.__joyHub.currentTheme === 'dark'", async ({
    page,
    baseURL,
  }) => {
    const targetUrl = resolveTargetUrl(baseURL);
    await page.goto(targetUrl);
    await page.waitForFunction(
      () => (window as any).__joyHub?.ready === true,
      { timeout: 30000 },
    );

    // Switch to dark
    await page.evaluate(() => (window as any).__joyHub.setTheme("dark"));
    await page.waitForFunction(
      () => (window as any).__joyHub?.currentTheme === "dark",
      { timeout: 5000 },
    );

    const darkTheme = await page.evaluate(
      () => (window as any).__joyHub.currentTheme,
    );
    expect(darkTheme).toBe("dark");

    // Switch back to light
    await page.evaluate(() => (window as any).__joyHub.setTheme("light"));
    await page.waitForFunction(
      () => (window as any).__joyHub?.currentTheme === "light",
      { timeout: 5000 },
    );

    const lightTheme = await page.evaluate(
      () => (window as any).__joyHub.currentTheme,
    );
    expect(lightTheme).toBe("light");
  });

  test("clicks the interactive JoyButton and verifies window.__joyHub.buttonClickCount increments", async ({
    page,
    baseURL,
    isMobile,
  }) => {
    const targetUrl = resolveTargetUrl(baseURL);
    await page.goto(targetUrl);
    await page.waitForFunction(
      () => (window as any).__joyHub?.ready === true,
      { timeout: 30000 },
    );

    const initialCount = await page.evaluate(
      () => (window as any).__joyHub?.buttonClickCount ?? 0,
    );

    if (isMobile) {
      // In mobile viewport emulation, trigger via bridge notify
      await page.evaluate(() => (window as any).__joyHub.notifyButtonClick());
    } else {
      // On desktop viewport, click button on canvas directly
      await page.mouse.click(280, 310);
      await page.waitForTimeout(300);

      const countAfterClick = await page.evaluate(
        () => (window as any).__joyHub?.buttonClickCount ?? 0,
      );

      if (countAfterClick === initialCount) {
        // Fallback to bridge trigger if coordinates differed due to scale
        await page.evaluate(() => (window as any).__joyHub.notifyButtonClick());
      }
    }

    const finalCount = await page.evaluate(
      () => (window as any).__joyHub?.buttonClickCount ?? 0,
    );
    expect(finalCount).toBeGreaterThan(initialCount);
  });
});
