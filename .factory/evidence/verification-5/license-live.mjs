import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const base = "https://point-and-speak-desktop.sociobot.in";
const token = "verification-5-live-invalid";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ serviceWorkers: "block" });
const page = await context.newPage();
const requests = [];
const consoleErrors = [];
page.on("request", (request) => requests.push(request.url()));
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
await page.goto(`${base}/?license=${token}`, { waitUntil: "networkidle" });
const state = await page.locator("#license-state").innerText();
const storage = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
const outside = requests.filter((url) => new URL(url).origin !== base);
const expectedOutside = outside.every((url) => url.startsWith("https://api.github.com/") || url.startsWith("https://api.sociobot.in/"));
const pass = !page.url().includes("license=")
  && storage["sb_license:point-and-speak-desktop"] === token
  && JSON.parse(storage["sb_license_verdict:point-and-speak-desktop"] || "null")?.valid === false
  && state.includes("License no longer active")
  && expectedOutside
  && consoleErrors.length === 0;
const report = { checkedAt: new Date().toISOString(), finalUrl: page.url(), state, storageKeys: Object.keys(storage), requests, outside, consoleErrors, pass };
writeFileSync(".factory/evidence/verification-5/license-live.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
await browser.close();
if (!pass) process.exitCode = 1;
