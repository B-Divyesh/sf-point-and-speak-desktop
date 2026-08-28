import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const APP_URL = "http://127.0.0.1:4174";

async function readSample(page: Page) {
  await page.goto(APP_URL);
  await page.getByRole("button", { name: "Load sample region" }).click();
  await page.locator("#screen").press("Enter");
  await expect(page.getByLabel("Correct the text before speaking")).toHaveValue(/Seal kit/, { timeout: 30_000 });
}

for (const viewport of [{ width: 1180, height: 820 }, { width: 390, height: 640 }]) {
  test(`desktop first-run actions fit ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(APP_URL);
    await expect(page.locator("#screen")).toBeHidden();
    await expect(page.getByRole("button", { name: "Capture screen" })).toBeInViewport();
    await expect(page.getByRole("button", { name: "Load sample region" })).toBeInViewport();
    expect(await page.locator("#screen").evaluate((node) => getComputedStyle(node).display)).toBe("none");
    expect(await page.locator("#screen").evaluate((node) => (node as HTMLElement).getClientRects().length)).toBe(0);
  });
}

test("hidden capture canvas is skipped by keyboard focus", async ({ page }) => {
  await page.goto(APP_URL);
  const focused: string[] = [];
  for (let index = 0; index < 5; index += 1) {
    await page.keyboard.press("Tab");
    focused.push(await page.evaluate(() => (document.activeElement as HTMLElement).id || document.activeElement?.tagName || ""));
  }
  expect(focused).not.toContain("screen");
  expect(focused).toContain("capture");
  expect(focused).toContain("sample");
});

test("@claim:local-only real app OCR sends no screen data off-device", async ({ page }) => {
  const outside: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith("http") && url.origin !== new URL(APP_URL).origin) outside.push(request.url());
  });
  await readSample(page);
  await page.getByRole("button", { name: "Pin result" }).click();
  expect(outside).toEqual([]);
});

test("@claim:capture-memory app capture and result disappear on reload", async ({ page }) => {
  await readSample(page);
  await page.getByRole("button", { name: "Pin result" }).click();
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  await page.reload();
  await expect(page.getByRole("heading", { name: "No screen captured yet" })).toBeVisible();
  await expect(page.locator("#screen")).toBeHidden();
  await expect(page.locator("#result-panel")).toBeHidden();
  await expect(page.locator("#pinned")).toBeHidden();
});

test("@claim:free-core capture, OCR, speech, copy, and pin work without a license", async ({ page }) => {
  await page.addInitScript(() => {
    class Speech { text: string; rate = 1; constructor(text: string) { this.text = text; } }
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: Speech });
    Object.defineProperty(window, "speechSynthesis", { value: { cancel() {}, speak(value: { text: string }) { (window as typeof window & { spoken?: string }).spoken = value.text; } } });
    Object.defineProperty(navigator, "clipboard", { value: { writeText(value: string) { (window as typeof window & { copied?: string }).copied = value; return Promise.resolve(); } } });
  });
  await readSample(page);
  expect(await page.evaluate(() => Object.keys(localStorage).some((key) => key.includes("license")))).toBe(false);
  await page.getByRole("button", { name: "Speak text" }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { spoken?: string }).spoken)).toContain("Seal kit");
  await page.getByRole("button", { name: "Copy text" }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { copied?: string }).copied)).toContain("Seal kit");
  await page.getByRole("button", { name: "Pin result" }).click();
  await expect(page.getByRole("heading", { name: "Pinned result" })).toBeVisible();
});

test("desktop app has no serious accessibility violations", async ({ page }) => {
  await page.goto(APP_URL);
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
});

test("desktop speed control has a 44px touch target", async ({ page }) => {
  await readSample(page);
  const box = await page.getByLabel(/Speech speed/).boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
});
