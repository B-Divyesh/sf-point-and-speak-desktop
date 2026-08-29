import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "@playwright/test";

const baseURL = process.env.EVIDENCE_BASE_URL || "http://127.0.0.1:4173";
const output = ".factory/evidence";
mkdirSync(output, { recursive: true });

const browser = await chromium.launch({ headless: true });
const checks = [];

async function capture(name, path, viewport, expectedTitle, expectedHeading) {
  const context = await browser.newContext({ viewport, serviceWorkers: "block" });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    const text = message.text();
    // Chromium reports the expected top-level HTTP status as a console error
    // when loading the deliberate 404 evidence route. Resource errors remain
    // failures on every other route.
    const expectedNotFoundNavigation = name === "404-desktop"
      && text.includes("server responded with a status of 404");
    if (message.type() === "error" && !expectedNotFoundNavigation) consoleErrors.push(text);
  });
  const response = await page.goto(`${baseURL}${path}`, { waitUntil: "networkidle" });
  const title = await page.title();
  const headings = await page.locator("main h1").allTextContents();
  const mainCount = await page.locator("main").count();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await page.screenshot({ path: `${output}/polish-1-${name}.png`, fullPage: true });
  checks.push({ name, url: page.url(), status: response?.status(), title, headings, mainCount, overflow, consoleErrors, pass: title === expectedTitle && headings.length === 1 && headings[0] === expectedHeading && mainCount === 1 && overflow === 0 && consoleErrors.length === 0 });
  await context.close();
}

await capture("home-mobile", "/", { width: 390, height: 844 }, "Point & Speak Desktop — Read screen text aloud", "Read selected screen text aloud");
await capture("demo-mobile", "/?demo=1", { width: 390, height: 844 }, "Demo — Point & Speak Desktop", "Sample text is ready");
await capture("privacy-desktop", "/privacy", { width: 1440, height: 900 }, "Privacy — Point & Speak Desktop", "Your screen stays on your computer");
await capture("404-desktop", "/definitely-missing-polish-1", { width: 1440, height: 900 }, "Page not found — Point & Speak Desktop", "Page not found");

await browser.close();
writeFileSync(`${output}/polish-1-live-check.json`, `${JSON.stringify({ baseURL, checkedAt: new Date().toISOString(), checks }, null, 2)}\n`);
if (checks.some((check) => !check.pass)) {
  console.error(JSON.stringify(checks, null, 2));
  process.exit(1);
}
console.log(JSON.stringify(checks, null, 2));
