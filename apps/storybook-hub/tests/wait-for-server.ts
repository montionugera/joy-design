import http from "node:http";

export function isReachable(urlStr: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(urlStr, (res) => {
      res.resume();
      resolve(res.statusCode !== undefined && res.statusCode < 500);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/** Polls until the URL answers; throws a message naming the URL and the wait when it never does. */
export async function waitForServer(
  urlStr: string,
  { timeoutMs = 120_000, intervalMs = 200 }: { timeoutMs?: number; intervalMs?: number } = {},
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isReachable(urlStr)) return;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`${urlStr} did not answer within ${Math.round(timeoutMs / 1000)}s`);
}
