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
});
