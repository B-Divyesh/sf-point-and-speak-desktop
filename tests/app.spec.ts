import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const APP_URL = "http://127.0.0.1:4174";

async function readSample(page: Page) {
  await page.goto(APP_URL);
  await page.getByRole("button", { name: "Load sample region" }).click();
  await page.locator("#screen").press("Enter");
  await expect(page.getByLabel("Correct the text before speaking")).toHaveValue(/Seal kit/, { timeout: 30_000 });
}

async function seriousAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  return results.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""));
}

function contrastRatio(foreground: string, background: string) {
  const luminance = (value: string) => {
    const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number) ?? [];
    if (channels.length !== 3) throw new Error(`Expected an RGB color, received ${value}`);
    const linear = channels.map((channel) => {
      const proportion = channel / 255;
      return proportion <= 0.04045 ? proportion / 12.92 : ((proportion + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  };
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
}

async function expectAccessiblePair(action: Locator) {
  const colors = await action.evaluate((node) => {
    const style = getComputedStyle(node);
    return { foreground: style.color, background: style.backgroundColor };
  });
  expect(contrastRatio(colors.foreground, colors.background), colors).toBeGreaterThanOrEqual(4.5);
}

async function verifyPrimaryInteractionStates(page: Page, action: Locator) {
  await page.mouse.move(0, 0);
  await expectAccessiblePair(action);
  await action.focus();
  await expectAccessiblePair(action);
  await action.hover();
  await expectAccessiblePair(action);
  const box = await action.boundingBox();
  if (!box) throw new Error("Primary action has no visible box");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expectAccessiblePair(action);
  await page.mouse.up();
  await action.evaluate((node) => { (node as HTMLButtonElement).disabled = true; });
  await expectAccessiblePair(action);
  await action.evaluate((node) => { (node as HTMLButtonElement).disabled = false; });
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

test("@claim:selected-region-speech @claim:local-only @claim:speech-speed @claim:account-free-core selected local recognition supports every free result action", async ({ page }) => {
  const outside: string[] = [];
  await page.addInitScript(() => {
    class Speech { text: string; rate = 1; constructor(text: string) { this.text = text; } }
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: Speech });
    Object.defineProperty(window, "speechSynthesis", { value: { cancel() {}, speak(value: { text: string; rate: number }) { (window as typeof window & { spoken?: { text: string; rate: number } }).spoken = { text: value.text, rate: value.rate }; } } });
    Object.defineProperty(navigator, "clipboard", { value: { writeText(value: string) { (window as typeof window & { copied?: string }).copied = value; return Promise.resolve(); } } });
  });
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith("http") && url.origin !== new URL(APP_URL).origin) outside.push(request.url());
  });
  await readSample(page);
  const recognised = await page.getByLabel("Correct the text before speaking").inputValue();
  expect(recognised).toContain("Seal kit");
  expect(recognised).not.toContain("FIELD STOCK");
  expect(await page.evaluate(() => Object.keys(localStorage).some((key) => key.includes("license") || key.includes("account")))).toBe(false);
  await page.getByLabel(/Speech speed/).fill("1.5");
  await page.getByRole("button", { name: "Speak text" }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { spoken?: { text: string } }).spoken?.text)).toContain("Seal kit");
  expect(await page.evaluate(() => (window as typeof window & { spoken?: { rate: number } }).spoken?.rate)).toBe(1.5);
  await page.getByRole("button", { name: "Copy text" }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { copied?: string }).copied)).toContain("Seal kit");
  await page.getByRole("button", { name: "Pin result" }).click();
  await expect(page.getByRole("heading", { name: "Pinned result" })).toBeVisible();
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

test("desktop app has no serious accessibility violations", async ({ page }) => {
  await page.goto(APP_URL);
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test("primary actions keep accessible colors in every state and pass axe while hovered", async ({ page }) => {
  await page.goto(APP_URL);
  const capture = page.getByRole("button", { name: "Capture screen" });
  await verifyPrimaryInteractionStates(page, capture);
  await capture.hover();
  expect(await seriousAxeViolations(page)).toEqual([]);

  await page.getByRole("button", { name: "Load sample region" }).click();
  await page.locator("#screen").press("Enter");
  const editor = page.getByLabel("Correct the text before speaking");
  await expect(editor).toHaveValue(/Seal kit/, { timeout: 30_000 });
  const speak = page.getByRole("button", { name: "Speak text" });
  await verifyPrimaryInteractionStates(page, speak);
  await speak.hover();
  expect(await seriousAxeViolations(page)).toEqual([]);
});

test("desktop speed control has a 44px touch target", async ({ page }) => {
  await readSample(page);
  const box = await page.getByLabel(/Speech speed/).boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
});
