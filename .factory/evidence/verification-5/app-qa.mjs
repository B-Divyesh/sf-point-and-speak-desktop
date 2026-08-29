import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFileSync } from "node:fs";

const base = "http://127.0.0.1:4174";
const report = { checkedAt: new Date().toISOString(), base };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const browser = await chromium.launch({ headless: true });

try {
  const context = await browser.newContext({ viewport: { width: 1180, height: 820 } });
  await context.addInitScript(() => {
    class Speech { constructor(text) { this.text = text; this.rate = 1; } }
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: Speech });
    Object.defineProperty(window, "speechSynthesis", { value: { cancel() {}, speak(value) { window.__spoken = { text: value.text, rate: value.rate }; } } });
    Object.defineProperty(navigator, "clipboard", { value: { writeText(value) { window.__copied = value; return Promise.resolve(); } } });
  });
  const page = await context.newPage();
  const requests = [];
  const consoleErrors = [];
  const pageErrors = [];
  page.on("request", (request) => requests.push(request.url()));
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto(base, { waitUntil: "networkidle" });
  assert(await page.getByRole("heading", { name: "No screen captured yet" }).isVisible(), "empty state missing");
  assert(await page.locator("#screen").isHidden(), "hidden canvas exposed before capture");

  const captureButton = page.getByRole("button", { name: "Capture screen" });
  await captureButton.hover();
  const initialAxe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const initialSevere = initialAxe.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""));
  report.accessibilityAtInitialHover = initialSevere.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.map((node) => ({ target: node.target, summary: node.failureSummary })) }));
  await captureButton.click();
  assert((await page.locator("#status").innerText()).includes("Allow screen recording in system settings"), "capture error lacks recovery guidance");

  await page.getByRole("button", { name: "Load sample region" }).click();
  const canvas = page.locator("#screen");
  const box = await canvas.boundingBox();
  assert(box, "sample canvas missing");
  await page.mouse.move(box.x + 20, box.y + 20);
  await page.mouse.down();
  await page.mouse.move(box.x + 21, box.y + 21);
  await page.mouse.up();
  assert((await page.locator("#status").innerText()).includes("too small"), "tiny-region boundary did not explain recovery");

  await canvas.focus();
  await page.keyboard.press("Enter");
  const editor = page.getByLabel("Correct the text before speaking");
  await editor.waitFor({ state: "visible", timeout: 45_000 });
  const recognized = await editor.inputValue();
  assert(recognized.includes("Seal kit") && recognized.includes("Pressure gauge"), `OCR result unusable: ${recognized}`);
  const corrected = "R-1083 Seal kit — READY\n42.5 PSI";
  await editor.fill(corrected);
  await page.getByLabel(/Speech speed/).fill("0.5");
  await page.getByRole("button", { name: "Speak text" }).click();
  assert(JSON.stringify(await page.evaluate(() => window.__spoken)) === JSON.stringify({ text: corrected, rate: 0.5 }), "speech minimum boundary failed");
  await page.getByRole("button", { name: "Copy text" }).click();
  assert(await page.evaluate(() => window.__copied) === corrected, "copy mismatch");
  await page.getByRole("button", { name: "Pin result" }).click();
  assert((await page.locator("#pinned-text").innerText()).includes("42.5 PSI"), "pin mismatch");
  await page.getByRole("button", { name: "Remove pin" }).click();
  await editor.fill("");
  await page.getByRole("button", { name: "Speak text" }).click();
  assert((await page.locator("#status").innerText()).includes("There is no text to speak"), "blank result recovery missing");
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  const severe = axe.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""));
  report.accessibilityAtResult = severe.map((item) => ({ id: item.id, impact: item.impact, help: item.help, nodes: item.nodes.map((node) => ({ target: node.target, html: node.html, summary: node.failureSummary, data: node.any.map((check) => check.data) })) }));
  await page.screenshot({ path: ".factory/evidence/verification-5/app-result-contrast.png", fullPage: true });
  assert(requests.every((url) => new URL(url).origin === base), `cross-origin request ${requests}`);
  assert(consoleErrors.length === 0 && pageErrors.length === 0, `browser errors ${consoleErrors} ${pageErrors}`);
  await page.reload();
  assert(await page.getByRole("heading", { name: "No screen captured yet" }).isVisible(), "capture survived reload");
  assert(await page.locator("#result-panel").isHidden(), "result survived reload");
  await page.screenshot({ path: ".factory/evidence/verification-5/app-desktop.png", fullPage: true });
  await context.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 640 } });
  const mobile = await mobileContext.newPage();
  await mobile.goto(base);
  await mobile.getByRole("button", { name: "Load sample region" }).click();
  await mobile.locator("#screen").press("Enter");
  await mobile.getByLabel("Correct the text before speaking").waitFor({ state: "visible", timeout: 45_000 });
  const dimensions = await mobile.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  const controls = await mobile.locator("a:visible,button:visible,input:visible,textarea:visible").evaluateAll((nodes) => nodes.map((node) => {
    const box = node.getBoundingClientRect(); return { label: node.getAttribute("aria-label") || node.textContent?.trim() || node.tagName, width: box.width, height: box.height };
  }));
  const undersized = controls.filter((item) => item.width < 44 || item.height < 44);
  assert(dimensions.width === dimensions.scrollWidth, "mobile desktop-app overflow");
  assert(undersized.length === 0, `desktop-app mobile targets ${JSON.stringify(undersized)}`);
  report.pass = severe.length === 0 && initialSevere.length === 0;
  report.desktop = { recognized, corrected, requests: [...new Set(requests)], consoleErrors, pageErrors, axeSeriousCritical: severe };
  report.mobile = { dimensions, controls, undersized };
  await mobileContext.close();
} catch (error) {
  report.pass = false;
  report.error = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
  throw error;
} finally {
  writeFileSync(".factory/evidence/verification-5/app-qa.json", `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));
if (!report.pass) process.exitCode = 1;
