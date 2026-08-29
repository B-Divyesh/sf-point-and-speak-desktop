import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const RELEASE_API = "https://api.github.com/repos/B-Divyesh/sf-point-and-speak-desktop/releases?per_page=1";
const sampleRelease = [{
  tag_name: "v0.1.4",
  html_url: "https://github.com/B-Divyesh/sf-point-and-speak-desktop/releases/tag/v0.1.4",
  assets: [
    { name: "Point.Speak.Desktop_0.1.4_aarch64.dmg", browser_download_url: "https://example.test/arm.dmg" },
    { name: "Point.Speak.Desktop_0.1.4_x64.dmg", browser_download_url: "https://example.test/intel.dmg" },
    { name: "Point.Speak.Desktop_0.1.4_amd64.AppImage", browser_download_url: "https://example.test/app.AppImage" },
    { name: "Point.Speak.Desktop_0.1.4_x64-setup.exe", browser_download_url: "https://example.test/setup.exe" },
  ],
}];

test("landing page states the job, audience, action, and three facts", async ({ page }) => {
  await page.route(RELEASE_API, (route) => route.fulfill({ json: sampleRelease }));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Read selected screen text aloud");
  await expect(page.getByRole("link", { name: "Try it with sample data" })).toBeVisible();
  await expect(page.locator(".facts li")).toHaveCount(3);
  await expect(page.locator(".walkthrough__frame")).toHaveCount(3);
  await expect(page.locator("main h1")).toHaveCount(1);
});

test("@claim:demo-ready one click opens an editable completed result", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route(RELEASE_API, (route) => route.fulfill({ json: sampleRelease }));
  await page.goto("/");
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page.getByRole("region", { name: "Demo mode" })).toBeVisible();
  await expect(page.getByLabel("Correct the text before speaking")).toHaveValue(/Valve housing/);
  await expect(page.getByLabel("Correct the text before speaking")).toHaveValue(/Pressure gauge/);
  await expect(page.getByRole("button", { name: "Speak text" })).toBeInViewport();
});

test("direct /demo entry also opens the seeded result", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sample text is ready");
  await expect(page.getByLabel("Correct the text before speaking")).toHaveValue(/Seal kit/);
});

test("@claim:pin-result pins and removes the recognised text", async ({ page }) => {
  await page.goto("/?demo=1");
  await page.getByRole("button", { name: "Pin result" }).click();
  await expect(page.getByRole("heading", { name: "Pinned result" })).toBeVisible();
  await expect(page.locator("#demo-pinned p")).toContainText("R-1083");
  await page.getByRole("button", { name: "Remove pin" }).click();
  await expect(page.locator("#demo-pinned")).toBeHidden();
});

test("@claim:no-demo-storage reset restores the sample without touching real data", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("sb_license:point-and-speak-desktop", "real-license-sentinel");
    localStorage.setItem("release:v1", JSON.stringify({ real: true }));
  });
  await page.goto("/?demo=1");
  await page.getByLabel("Correct the text before speaking").fill("edited demo text");
  await page.getByRole("button", { name: "Pin result" }).click();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByLabel("Correct the text before speaking")).toHaveValue(/Valve housing/);
  await expect(page.locator("#demo-pinned")).toBeHidden();
  const storage = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  expect(storage["sb_license:point-and-speak-desktop"]).toBe("real-license-sentinel");
  expect(storage["release:v1"]).toBe(JSON.stringify({ real: true }));
  expect(Object.keys(storage).filter((key) => key.startsWith("demo:"))).toEqual([]);
  await page.getByRole("link", { name: "Start for real" }).click();
  await expect(page.getByRole("region", { name: "Demo mode" })).toHaveCount(0);
});

test("demo sends no data to another origin", async ({ page }) => {
  const outside: string[] = [];
  page.on("request", (request) => { if (new URL(request.url()).origin !== "http://127.0.0.1:4173") outside.push(request.url()); });
  await page.goto("/?demo=1");
  await page.getByRole("button", { name: "Pin result" }).click();
  await page.getByRole("button", { name: "Reset demo" }).click();
  expect(outside).toEqual([]);
});

test("entering demo aborts pending real-data work", async ({ page }) => {
  let releaseRequestStarted!: () => void;
  let releaseResponse!: () => void;
  const started = new Promise<void>((resolve) => { releaseRequestStarted = resolve; });
  const responseGate = new Promise<void>((resolve) => { releaseResponse = resolve; });
  await page.route(RELEASE_API, async (route) => {
    releaseRequestStarted();
    await responseGate;
    await route.fulfill({ json: sampleRelease }).catch(() => undefined);
  });
  await page.goto("/");
  await started;
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  await expect(page.getByRole("region", { name: "Demo mode" })).toBeVisible();
  releaseResponse();
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => localStorage.getItem("release:v1"))).toBeNull();
});

test("demo speech receives its recognised text and selected rate", async ({ page }) => {
  await page.addInitScript(() => {
    class Speech { text: string; rate = 1; constructor(text: string) { this.text = text; } }
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: Speech });
    Object.defineProperty(window, "speechSynthesis", { value: { cancel() {}, speak(value: { text: string; rate: number }) { (window as typeof window & { spoken?: { text: string; rate: number } }).spoken = { text: value.text, rate: value.rate }; } } });
  });
  await page.goto("/?demo=1");
  await page.getByLabel(/Speech speed/).fill("1.4");
  await page.getByRole("button", { name: "Speak text" }).click();
  await expect.poll(() => page.evaluate(() => (window as typeof window & { spoken?: { text: string } }).spoken?.text)).toContain("Seal kit");
  expect(await page.evaluate(() => (window as typeof window & { spoken?: { rate: number } }).spoken?.rate)).toBe(1.4);
});

test("@claim:offline-reload demo reloads offline after the first visit", async ({ page, context }) => {
  await page.goto("/?demo=1");
  await page.evaluate(async () => { await navigator.serviceWorker.ready; if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true })); });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sample text is ready");
  await expect(page.getByLabel("Correct the text before speaking")).toHaveValue(/Pressure gauge/);
  await context.setOffline(false);
});

test("@claim:bundled-recognition English recognition files are shipped locally", async ({ request }) => {
  const language = await request.get("/tesseract/eng.traineddata.gz");
  const worker = await request.get("/tesseract/worker.min.js");
  expect(language.ok()).toBe(true);
  expect((await language.body()).byteLength).toBeGreaterThan(1_000_000);
  expect(worker.ok()).toBe(true);
  expect((await worker.body()).byteLength).toBeGreaterThan(50_000);
});

test("@claim:supporter-themes valid license activates both page themes", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("sb_license:point-and-speak-desktop", "test-license"));
  await page.route(RELEASE_API, (route) => route.fulfill({ json: sampleRelease }));
  await page.route("https://api.sociobot.in/api/v1/products/point-and-speak-desktop/verify?license=test-license", (route) => route.fulfill({ json: { valid: true, reason: "ok", expires_at: null } }));
  await page.goto("/");
  await expect(page.getByLabel("Supporter page theme")).toBeVisible();
  await page.getByLabel("Supporter page theme").selectOption("orange");
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.supporterTheme)).toBe("orange");
  await expect(page.getByLabel("Supporter page theme").locator("option")).toHaveCount(2);
});

test("@claim:license-storage license return uses exact storage keys and Sociobot only", async ({ page }) => {
  const outside: string[] = [];
  page.on("request", (request) => {
    const origin = new URL(request.url()).origin;
    if (origin !== "http://127.0.0.1:4173" && origin !== "https://api.github.com") outside.push(request.url());
  });
  await page.route(RELEASE_API, (route) => route.fulfill({ json: sampleRelease }));
  await page.route("https://api.sociobot.in/api/v1/products/point-and-speak-desktop/verify?license=returned-license", (route) => route.fulfill({ json: { valid: true, reason: "ok", expires_at: null } }));
  await page.goto("/?license=returned-license");
  await expect(page.getByLabel("Supporter page theme")).toBeVisible();
  expect(page.url()).not.toContain("license=");
  const stored = await page.evaluate(() => ({
    token: localStorage.getItem("sb_license:point-and-speak-desktop"),
    verdict: localStorage.getItem("sb_license_verdict:point-and-speak-desktop"),
    keys: Object.keys(localStorage).filter((key) => key.startsWith("sb_license")),
  }));
  expect(stored.token).toBe("returned-license");
  expect(JSON.parse(stored.verdict || "null").valid).toBe(true);
  expect(stored.keys.sort()).toEqual(["sb_license:point-and-speak-desktop", "sb_license_verdict:point-and-speak-desktop"]);
  expect(outside).toEqual(["https://api.sociobot.in/api/v1/products/point-and-speak-desktop/verify?license=returned-license"]);
});

test("license restoration and revocation keep the free core available", async ({ page }) => {
  await page.addInitScript(() => { window.prompt = () => "revoked-license"; });
  await page.route(RELEASE_API, (route) => route.fulfill({ json: sampleRelease }));
  await page.route("https://api.sociobot.in/api/v1/products/point-and-speak-desktop/verify?license=revoked-license", (route) => route.fulfill({ json: { valid: false, reason: "revoked", expires_at: null } }));
  await page.goto("/");
  await page.getByRole("button", { name: "Activate supporter license" }).click();
  await expect(page.locator("#license-state")).toHaveText("License no longer active. You can keep using the free core.");
  await expect(page.getByLabel("Supporter page theme")).toBeHidden();
  await expect(page.getByRole("link", { name: "Try it with sample data" })).toBeVisible();
});

test("@claim:website-no-tracking every route avoids trackers and third-party scripts", async ({ page, context }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.route(RELEASE_API, (route) => route.fulfill({ json: sampleRelease }));
  for (const path of ["/", "/?demo=1", "/demo", "/privacy", "/terms", "/missing-page"]) {
    await page.goto(path);
    const scriptOrigins = await page.locator("script[src]").evaluateAll((scripts) => scripts.map((script) => new URL((script as HTMLScriptElement).src).origin));
    expect(scriptOrigins.every((origin) => origin === "http://127.0.0.1:4173")).toBe(true);
  }
  const hosts = [...new Set(requests.map((url) => new URL(url).hostname))];
  expect(hosts.every((host) => ["127.0.0.1", "api.github.com"].includes(host))).toBe(true);
  expect(await context.cookies()).toEqual([]);
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys.every((key) => key === "release:v1")).toBe(true);
});

test("@claim:release-request uses GitHub and handles an empty release without errors", async ({ page }) => {
  const errors: string[] = [];
  let calls = 0;
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.route(RELEASE_API, (route) => { calls += 1; return route.fulfill({ json: [] }); });
  await page.goto("/");
  await expect(page.locator("#download-note")).toHaveText("Downloads are being published. Check the release page for availability.");
  await expect(page.locator("#download-button")).toHaveAttribute("href", "https://github.com/B-Divyesh/sf-point-and-speak-desktop/releases");
  expect(calls).toBe(1);
  expect(errors).toEqual([]);
});

const routeCases = [
  { path: "/", title: "Point & Speak Desktop — Read screen text aloud", heading: "Read selected screen text aloud", canonical: "/" },
  { path: "/?demo=1", title: "Demo — Point & Speak Desktop", heading: "Sample text is ready", canonical: "/demo" },
  { path: "/demo", title: "Demo — Point & Speak Desktop", heading: "Sample text is ready", canonical: "/demo" },
  { path: "/privacy", title: "Privacy — Point & Speak Desktop", heading: "Your screen stays on your computer", canonical: "/privacy" },
  { path: "/terms", title: "Terms — Point & Speak Desktop", heading: "Use Point & Speak with care", canonical: "/terms" },
  { path: "/missing-page", title: "Page not found — Point & Speak Desktop", heading: "Page not found", canonical: "/missing-page" },
];

for (const item of routeCases) {
  test(`route metadata and skeleton ${item.path}`, async ({ page }) => {
    await page.route(RELEASE_API, (route) => route.fulfill({ json: sampleRelease }));
    await page.goto(item.path);
    await expect(page).toHaveTitle(item.title);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(item.heading);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{20}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://point-and-speak-desktop.sociobot.in${item.canonical}`);
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Footer navigation" })).toBeVisible();
  });
}

for (const path of ["/", "/?demo=1", "/privacy", "/terms", "/missing-page"]) {
  test(`accessibility scan ${path}`, async ({ page }) => {
    await page.route(RELEASE_API, (route) => route.fulfill({ json: sampleRelease }));
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
  });

  test(`dark accessibility scan ${path}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.route(RELEASE_API, (route) => route.fulfill({ json: sampleRelease }));
    await page.goto(path);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""))).toEqual([]);
  });
}

test("macOS selector resolves separate Apple Silicon and Intel assets", async ({ page }) => {
  await page.route(RELEASE_API, (route) => route.fulfill({ json: sampleRelease }));
  await page.goto("/");
  await page.getByLabel("Other system").selectOption("mac-arm64");
  await expect(page.locator("#download-button")).toHaveAttribute("href", "https://example.test/arm.dmg");
  await page.getByLabel("Other system").selectOption("mac-x64");
  await expect(page.locator("#download-button")).toHaveAttribute("href", "https://example.test/intel.dmg");
});

test("demo refuses to speak an empty result", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "speechSynthesis", { value: { cancel() {}, speak() { (window as typeof window & { spoke?: boolean }).spoke = true; } } });
  });
  await page.goto("/?demo=1");
  await page.getByLabel("Correct the text before speaking").fill("");
  await page.getByRole("button", { name: "Speak text" }).click();
  await expect(page.locator("#demo-status")).toHaveText("There is no text to speak. Restore the sample result first.");
  expect(await page.evaluate(() => (window as typeof window & { spoke?: boolean }).spoke)).not.toBe(true);
});

test("mobile home and demo fit 390 pixels with primary content in view", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route(RELEASE_API, (route) => route.fulfill({ json: sampleRelease }));
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await expect(page.locator(".facts")).toBeInViewport();
  await page.getByRole("link", { name: "Try it with sample data" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  await expect(page.getByRole("button", { name: "Speak text" })).toBeInViewport();
  const targets = await page.locator(".site-header a:visible, .site-footer a:visible, .demo-banner a:visible, .demo-banner button:visible, input[type=range]:visible").evaluateAll((nodes) => nodes.map((node) => {
    const { width, height } = node.getBoundingClientRect();
    return { name: node.textContent?.trim() || node.getAttribute("aria-label"), width, height };
  }));
  for (const target of targets) {
    expect(target.width, `${target.name} target width`).toBeGreaterThanOrEqual(44);
    expect(target.height, `${target.name} target height`).toBeGreaterThanOrEqual(44);
  }
});

test("mobile footer Terms target is at least 44 by 44 CSS pixels", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const terms = page.getByRole("navigation", { name: "Footer navigation" }).getByRole("link", { name: "Terms" });
  const box = await terms.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
});

test("keyboard history navigation restores heading focus", async ({ page }) => {
  await page.route(RELEASE_API, (route) => route.fulfill({ json: sampleRelease }));
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.getByRole("link", { name: "Demo", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sample text is ready");
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
});

test("service worker installs the current cache and accepts update checks", async ({ page }) => {
  await page.goto("/?demo=1");
  const cachesAfterUpdate = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    await registration.update();
    return caches.keys();
  });
  expect(cachesAfterUpdate).toContain("point-speak-v6");
  expect(cachesAfterUpdate).not.toContain("point-speak-v3");
});
