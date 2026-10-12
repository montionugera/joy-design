import { defineConfig, devices } from "@playwright/test";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const requestedPort = process.env.PLAYWRIGHT_PORT ?? "6116";
const portNumber = Number(requestedPort);
if (
  !/^\d+$/.test(requestedPort) ||
  !Number.isInteger(portNumber) ||
  portNumber < 1 ||
  portNumber > 65535
) {
  throw new Error(
    `PLAYWRIGHT_PORT must be an integer from 1 to 65535; received ${requestedPort}`,
  );
}
const port = String(portNumber);

export default defineConfig({
  testDir: "./tests",
  timeout: 60000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "on-first-retry",
  },
  webServer: {
    command:
      requestedPort === "6118"
        ? `npx --yes serve -p ${port} ../flutter-hub/build/web`
        : `npx --yes serve -p ${port} dist`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    cwd: __dirname,
    // Cold `npx serve` on a loaded machine (or CI) can take well over 30 s to answer the first request.
    timeout: 120000,
  },
  projects: [
    {
      name: "desktop-chrome",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"], viewport: { width: 390, height: 844 } },
    },
  ],
});
