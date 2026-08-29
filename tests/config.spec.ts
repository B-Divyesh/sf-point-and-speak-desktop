import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

describe("product metadata", () => {
  it("keeps the catalog summary short and direct", () => {
    const brief = JSON.parse(readFileSync(".factory/brief.json", "utf8"));
    const catalog = readFileSync(".factory/catalog-description.txt", "utf8").trim();
    expect(brief.summary.length).toBeLessThanOrEqual(120);
    expect(brief.summary).toMatch(/^Read /);
    expect(catalog.length).toBeLessThanOrEqual(120);
    expect(catalog).toMatch(/^Read /);
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
    expect(page).toContain("<h1>Page not found</h1>");
    expect(page).toContain('href="/"');
    for (const required of ['name="description"', 'rel="canonical"', 'property="og:title"', 'name="twitter:title"', 'rel="apple-touch-icon"', "Main navigation", "Footer navigation", "Built by Param Factory", "Version 0.1.2 · build 2026-08-28"]) {
      expect(page).toContain(required);
    }
  });

  it("ships a 180 by 180 apple touch icon", () => {
    const png = readFileSync("public/apple-touch-icon.png");
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.readUInt32BE(16)).toBe(180);
    expect(png.readUInt32BE(20)).toBe(180);
  });

  it("maps every registered browser claim to exactly one tagged test", () => {
    const claims = JSON.parse(readFileSync(".factory/claims.json", "utf8")) as { id: string; test: string }[];
    const sources = ["tests/config.spec.ts", "tests/site.spec.ts", "tests/app.spec.ts", "tests/installer.spec.ts", "src-tauri/src/lib.rs"].map((path) => readFileSync(path, "utf8")).join("\n");
    const ids = claims.map((claim) => claim.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const claim of claims) {
      if (claim.test === "npm run test:checkout") continue;
      const tag = `@claim:${claim.id}`;
      expect(sources.split(tag).length - 1, tag).toBe(1);
    }
  });

  it("@claim:mit-license ships the MIT grant and warranty text", () => {
    const license = readFileSync("LICENSE", "utf8");
    expect(license).toContain("MIT License");
    expect(license).toContain("Permission is hereby granted, free of charge");
    expect(license).toContain('THE SOFTWARE IS PROVIDED "AS IS"');
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
