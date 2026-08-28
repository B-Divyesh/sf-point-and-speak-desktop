import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("product metadata", () => {
  it("keeps the catalog summary short and direct", () => {
    const brief = JSON.parse(readFileSync(".factory/brief.json", "utf8"));
    expect(brief.summary.length).toBeLessThanOrEqual(120);
    expect(brief.summary).toMatch(/^Read /);
  });

  it("uses local Tesseract assets in the desktop app", () => {
    const source = readFileSync("app/main.ts", "utf8");
    expect(source).toContain('workerPath: "/tesseract/worker.min.js"');
    expect(source).toContain('langPath: "/tesseract"');
    expect(source).not.toContain("tessdata.projectnaptha.com");
  });

  it("declares every required static route", () => {
    const sitemap = readFileSync("public/sitemap.xml", "utf8");
    for (const path of ["/demo", "/privacy", "/terms"]) expect(sitemap).toContain(path);
  });

  it("builds release metadata with per-platform URLs", () => {
    const source = readFileSync("scripts/release-manifest.py", "utf8");
    for (const platform of ["linux", "macos", "windows"]) expect(source).toContain(`"${platform}"`);
  });

  it("serves a designed document with HTTP 404 response policy", () => {
    const config = JSON.parse(readFileSync("public/staticwebapp.config.json", "utf8"));
    expect(config.responseOverrides["404"]).toEqual({ rewrite: "/404.html" });
    expect(config.navigationFallback).toBeUndefined();
    for (const route of ["/demo", "/privacy", "/terms"]) {
      expect(config.routes).toContainEqual({ route, rewrite: "/index.html" });
    }
    const page = readFileSync("public/404.html", "utf8");
    expect(page).toContain("<h1>This sheet is not in the set</h1>");
    expect(page).toContain('href="/"');
  });

  it("offers distinct macOS architectures", () => {
    const source = readFileSync("site/main.ts", "utf8");
    expect(source).toContain('value="mac-arm64"');
    expect(source).toContain('value="mac-x64"');
    expect(source).toContain("/aarch64.*\\.dmg$/i");
    expect(source).toContain("/x64.*\\.dmg$/i");
  });

  it("runs the Windows checksum installer regression in the release matrix", () => {
    const workflow = readFileSync(".github/workflows/release.yml", "utf8");
    expect(workflow).toContain("Test Windows checksum installer");
    expect(workflow).toContain("./tests/install-windows.ps1");
    const installer = readFileSync("public/install.ps1", "utf8");
    expect(installer).toContain("Get-FileHash $msi -Algorithm SHA256");
    expect(installer).toContain("Checksum did not match. Nothing was installed.");
  });
});
