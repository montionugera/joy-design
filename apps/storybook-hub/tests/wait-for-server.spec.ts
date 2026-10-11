import { test, expect } from "@playwright/test";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { waitForServer } from "./wait-for-server";

// Break caught: a self-started static server that needs longer than a hard-coded 15 s to answer
// (cold npx cache, loaded machine) turning into a connection-refused failure in the first test.
test.describe("waitForServer", () => {
  test("resolves once a late-starting server answers", async () => {
    const probe = http.createServer();
    await new Promise<void>((r) => probe.listen(0, "127.0.0.1", r));
    const { port } = probe.address() as AddressInfo;
    await new Promise<void>((r) => probe.close(() => r()));

    const server = http.createServer((_req, res) => res.end("ok"));
    const startLater = setTimeout(() => server.listen(port, "127.0.0.1"), 700);
    try {
      await waitForServer(`http://127.0.0.1:${port}`, { timeoutMs: 10_000, intervalMs: 50 });
    } finally {
      clearTimeout(startLater);
      server.close();
    }
  });

  test("rejects with a message naming the URL and the wait when nothing ever answers", async () => {
    const probe = http.createServer();
    await new Promise<void>((r) => probe.listen(0, "127.0.0.1", r));
    const { port } = probe.address() as AddressInfo;
    await new Promise<void>((r) => probe.close(() => r()));
    const url = `http://127.0.0.1:${port}`;

    await expect(waitForServer(url, { timeoutMs: 600, intervalMs: 50 })).rejects.toThrow(
      new RegExp(`${url}.*did not answer within 1s`),
    );
  });
});
