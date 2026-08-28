import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { mkdtempSync, readlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { expect, test } from "@playwright/test";

function install(api: string, bin: string) {
  return new Promise<{ status: number | null; stdout: string; stderr: string }>((resolve) => {
    const child = spawn("sh", ["public/install.sh"], { cwd: process.cwd(), env: { ...process.env, POINT_SPEAK_RELEASE_API: api, XDG_BIN_HOME: bin } });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}

test("@claim:checksum-installers Linux installer verifies SHA256 before installing", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "one host-level installer check is sufficient");
  const artifact = Buffer.from("#!/bin/sh\necho Point and Speak fixture\n");
  const goodHash = createHash("sha256").update(artifact).digest("hex");
  let publishedHash = goodHash;
  const server = createServer((request, response) => {
    const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    if (request.url === "/release") {
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify({ assets: [
        { name: "Point.Speak.fixture.AppImage", browser_download_url: `${base}/Point.Speak.fixture.AppImage` },
        { name: "SHA256SUMS", browser_download_url: `${base}/sums` },
      ] }));
    } else if (request.url === "/Point.Speak.fixture.AppImage") response.end(artifact);
    else if (request.url === "/sums") response.end(`${publishedHash}  Point.Speak.fixture.AppImage\n`);
    else { response.statusCode = 404; response.end(); }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const api = `http://127.0.0.1:${(server.address() as { port: number }).port}/release`;
  const first = mkdtempSync(join(tmpdir(), "point-speak-good-"));
  const second = mkdtempSync(join(tmpdir(), "point-speak-bad-"));
  try {
    const success = await install(api, first);
    expect(success.status, success.stderr).toBe(0);
    expect(readlinkSync(join(first, "point-and-speak"))).toContain("Point.Speak.fixture.AppImage");
    expect(success.stdout).toContain("verified SHA256");

    publishedHash = "0".repeat(64);
    const rejected = await install(api, second);
    expect(rejected.status).not.toBe(0);
    expect(rejected.stderr).toContain("Checksum did not match. Nothing was installed.");
    expect(() => readlinkSync(join(second, "point-and-speak"))).toThrow();
  } finally {
    server.close();
    rmSync(first, { recursive: true, force: true });
    rmSync(second, { recursive: true, force: true });
  }
});
