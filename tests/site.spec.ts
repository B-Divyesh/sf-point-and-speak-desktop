import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("landing page has one clear first action", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Read any screen region aloud");
  await expect(page.getByRole("link", { name: "Try it with sample data" })).toBeVisible();
  await expect(page.locator("main h1")).toHaveCount(1);
});

test("@claim:sample-region demo returns useful sample text", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: /read this region/i }).click();
  await expect(page.getByLabel("Correct the text before speaking")).toHaveValue(/Valve housing/);
  await expect(page.getByLabel("Correct the text before speaking")).toHaveValue(/Pressure gauge/);
});

test("@claim:local-only demo sends no data to another origin", async ({ page }) => {
  const outside: string[] = [];
  page.on("request", (request) => { if (new URL(request.url()).origin !== "http://127.0.0.1:4173") outside.push(request.url()); });
  await page.goto("/demo");
  await page.getByRole("button", { name: /read this region/i }).click();
  await page.getByRole("button", { name: "Pin result" }).click();
  expect(outside).toEqual([]);
});

test("@claim:speak device speech receives the recognised text", async ({ page }) => {
  await page.addInitScript(() => {
    class Speech { text: string; rate = 1; constructor(text: string) { this.text = text; } }
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: Speech });
    Object.defineProperty(window, "speechSynthesis", { value: { cancel() {}, speak(value: { text: string }) { (window as typeof window & { spoken?: string }).spoken = value.text; } } });
  });
  await page.goto("/demo");
  await page.getByRole("button", { name: /read this region/i }).click();
  await page.getByRole("button", { name: "Speak text" }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { spoken?: string }).spoken)).toContain("Seal kit");
});

test("@claim:pin-result pins and removes the recognised text", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: /read this region/i }).click();
  await page.getByRole("button", { name: "Pin result" }).click();
  await expect(page.getByRole("heading", { name: "Pinned result" })).toBeVisible();
  await expect(page.locator("#demo-pinned p")).toContainText("R-1083");
  await page.getByRole("button", { name: "Remove pin" }).click();
  await expect(page.locator("#demo-pinned")).toBeHidden();
});

test("@claim:no-demo-storage reset leaves no demo data", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: /read this region/i }).click();
  await page.getByRole("button", { name: "Pin result" }).click();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.locator("#demo-result")).toBeHidden();
  const demoKeys = await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith("demo:")));
  expect(demoKeys).toEqual([]);
});

test("@claim:offline-reload demo reloads offline after first visit", async ({ page, context }) => {
  await page.goto("/demo");
  await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true })); });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Read a sample screen region");
  await context.setOffline(false);
});

test("@claim:bundled-ocr English OCR files are shipped locally", async ({ request }) => {
  const language = await request.get("/tesseract/eng.traineddata.gz");
  const worker = await request.get("/tesseract/worker.min.js");
  expect(language.ok()).toBe(true);
  expect((await language.body()).byteLength).toBeGreaterThan(1_000_000);
  expect(worker.ok()).toBe(true);
  expect((await worker.body()).byteLength).toBeGreaterThan(50_000);
});

test("@claim:supporter-themes valid license activates both page themes", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("sb_license:point-and-speak-desktop", "test-license"));
  await page.route("https://api.sociobot.in/api/v1/products/point-and-speak-desktop/verify?license=test-license", (route) => route.fulfill({ json: { valid: true, reason: "ok", expires_at: null } }));
  await page.goto("/?demo=1");
  await expect(page.getByLabel("Supporter page theme")).toBeVisible();
  await page.getByLabel("Supporter page theme").selectOption("orange");
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.supporterTheme)).toBe("orange");
  await expect(page.getByLabel("Supporter page theme").locator("option")).toHaveCount(2);
});

for (const path of ["/", "/demo", "/privacy", "/terms", "/missing-sheet"]) {
  test(`accessibility scan ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
  });
}

test("mobile layout fits 390 pixels", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});
