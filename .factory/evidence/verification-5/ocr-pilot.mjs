import { chromium } from "@playwright/test";
import { createWorker, OEM, PSM } from "tesseract.js";
import { mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const cases = [
  ["Invoice INV-2048\nTotal $1,284.50", "Arial", 30, "#111827", "#ffffff"],
  ["R-1083  Seal kit 40 mm  READY", "Courier New", 28, "#163343", "#eee9d8"],
  ["Server: legacy-db-02\nStatus: ONLINE", "Verdana", 24, "#eaf7ff", "#122a39"],
  ["Due 29 Aug 2026\nOwner: Maya", "Georgia", 27, "#222222", "#f7f2e5"],
  ["C:\\Archive\\Q3\\report.txt", "Courier New", 24, "#0b2430", "#d8e5e8"],
  ["Score 18420\nLives 3", "Arial", 34, "#ffffff", "#1d365c"],
  ["Connection timed out\nTry again", "Tahoma", 28, "#421b1b", "#ffe9e9"],
  ["Temperature 72 F\nPressure 42.5 PSI", "Georgia", 22, "#23343a", "#cdd7d7"],
  ["Ticket INC-7391\nPriority HIGH", "Arial", 26, "#14213d", "#fca311"],
  ["Account balance $9,840.22", "Times New Roman", 30, "#161616", "#f5f5f5"],
  ["Last backup 2026-08-29 09:30 UTC", "Courier New", 21, "#d9eef3", "#18313a"],
  ["Room B-214\nProjector OFFLINE", "Verdana", 25, "#2d2d2d", "#e0e0dc"],
  ["Order 008714\nQuantity 16", "Georgia", 29, "#0c3340", "#f4f0df"],
  ["Access denied\nAsk your administrator", "Arial", 23, "#fff5f5", "#6b1f2a"],
  ["Latitude 12.9716 N\nLongitude 77.5946 E", "Courier New", 20, "#1e3138", "#bcc9cb"],
  ["File not found\nRetry or cancel", "Times New Roman", 32, "#3b210a", "#f4d7aa"],
  ["Build v0.1.4\nChecksum OK", "Verdana", 24, "#e7fbff", "#174651"],
  ["Meeting starts 14:30\nEnds 15:15", "Georgia", 26, "#232323", "#f0eadc"],
  ["User ID A7K-992\nStatus ACTIVE", "Tahoma", 27, "#17303a", "#d5e0df"],
  ["Network 83 percent\nBattery 41 percent", "Arial", 22, "#ece8da", "#32454a"],
];

const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9.:%$\\/-]+/g, " ").trim().replace(/\s+/g, " ");
function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    let previous = row[0]; row[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const old = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = old;
    }
  }
  return row[b.length];
}
const similarity = (a, b) => { const left = normalize(a); const right = normalize(b); return 1 - distance(left, right) / Math.max(1, left.length, right.length); };

const dir = join(tmpdir(), `point-speak-ocr-pilot-${process.pid}`);
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 900, height: 280 } });
const images = [];
for (let index = 0; index < cases.length; index += 1) {
  const [text, font, size, foreground, background] = cases[index];
  await page.setContent(`<main style="width:820px;height:210px;padding:28px;background:${background};color:${foreground};font:${size}px/1.45 '${font}',sans-serif;display:flex;align-items:center;white-space:pre-wrap">${text.replaceAll("&", "&amp;").replaceAll("<", "&lt;")}</main>`);
  const path = join(dir, `region-${String(index + 1).padStart(2, "0")}.png`);
  await page.locator("main").screenshot({ path });
  images.push(path);
}
await browser.close();

const started = performance.now();
const worker = await createWorker("eng", OEM.LSTM_ONLY, {
  langPath: "https://point-and-speak-desktop.sociobot.in/tesseract",
  corePath: "node_modules/tesseract.js-core/tesseract-core-simd-lstm.wasm.js",
  cacheMethod: "none",
});
await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
const startupMs = Math.round(performance.now() - started);
const results = [];
for (let index = 0; index < cases.length; index += 1) {
  const startedAt = performance.now();
  const { data } = await worker.recognize(images[index]);
  const durationMs = Math.round(performance.now() - startedAt);
  const score = similarity(cases[index][0], data.text);
  results.push({ index: index + 1, expected: cases[index][0], actual: data.text.trim(), durationMs, similarity: Number(score.toFixed(3)), usableUnderTwoSeconds: score >= 0.7 && durationMs < 2000 });
}
await worker.terminate();
const successes = results.filter((item) => item.usableUnderTwoSeconds).length;
const report = { checkedAt: new Date().toISOString(), model: "shipped eng.traineddata.gz", cases: cases.length, startupMs, successes, successRate: successes / cases.length, threshold: "at least 14/20 at >=0.70 normalized similarity and <2000 ms", maxRecognitionMs: Math.max(...results.map((item) => item.durationMs)), results, pass: successes >= 14 };
writeFileSync(".factory/evidence/verification-5/ocr-pilot.json", `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exitCode = 1;
