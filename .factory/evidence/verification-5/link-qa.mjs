import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const base = "https://point-and-speak-desktop.sociobot.in";
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ serviceWorkers: "block" });
const page = await context.newPage();
const hrefs = new Map();
const downloads = [];
for (const path of ["/", "/demo", "/privacy", "/terms", "/verification-5-missing"]) {
  await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
  for (const link of await page.locator("a[href]").evaluateAll((nodes) => nodes.map((node) => ({ href: node.href, raw: node.getAttribute("href") })))) hrefs.set(`${link.raw}|${link.href}`, link);
  if (path === "/") {
    for (const platform of ["windows", "mac-arm64", "mac-x64", "linux"]) {
      await page.getByLabel("Other system").selectOption(platform);
      downloads.push({ platform, href: await page.locator("#download-button").getAttribute("href"), note: await page.locator("#download-note").innerText() });
    }
  }
}
await browser.close();

const results = [];
const redactLocation = (value) => {
  if (!value) return null;
  const url = new URL(value);
  if (url.hostname === "checkout.dodopayments.com") return `${url.origin}/session/<redacted>`;
  if (url.hostname === "release-assets.githubusercontent.com") return `${url.origin}/<redacted>`;
  url.search = "";
  return url.toString();
};
for (const { href, raw } of [...hrefs.values()].sort((a, b) => a.href.localeCompare(b.href))) {
  if (raw?.startsWith("#")) {
    results.push({ href, status: "same-page-fragment", location: null });
    continue;
  }
  if (!href.startsWith("http://") && !href.startsWith("https://")) {
    results.push({ href, status: "allowed-non-http", location: null });
    continue;
  }
  const clean = href.split("#")[0];
  let response = await fetch(clean, { method: "HEAD", redirect: "manual" });
  if ([400, 403, 405].includes(response.status)) response = await fetch(clean, { method: "GET", redirect: "manual", headers: { Range: "bytes=0-0" } });
  results.push({ href, status: response.status, location: redactLocation(response.headers.get("location")) });
}
const failed = results.filter((item) => typeof item.status === "number" && (item.status < 200 || item.status >= 400));
const badDownloads = downloads.filter((item) => !item.href?.includes("/releases/download/v0.1.4/"));
const report = { checkedAt: new Date().toISOString(), downloads, badDownloads, results, failed, pass: failed.length === 0 && badDownloads.length === 0 };
writeFileSync(".factory/evidence/verification-5/link-qa.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exitCode = 1;
