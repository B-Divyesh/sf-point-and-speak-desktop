import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { writeFileSync } from "node:fs";

const base = "https://point-and-speak-desktop.sociobot.in";
const report = { checkedAt: new Date().toISOString(), base, checks: {}, routes: [], requests: {} };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const serious = (results) => results.violations.filter((item) => ["serious", "critical"].includes(item.impact || ""));

const browser = await chromium.launch({ headless: true });

try {
  const homeContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: "block" });
  await homeContext.grantPermissions(["clipboard-read", "clipboard-write"], { origin: base });
  await homeContext.addInitScript(() => {
    localStorage.setItem("verification:sentinel", "real-data");
    class Speech { constructor(text) { this.text = text; this.rate = 1; } }
    Object.defineProperty(window, "SpeechSynthesisUtterance", { value: Speech });
    Object.defineProperty(window, "speechSynthesis", { value: {
      cancel() {},
      speak(value) { window.__verificationSpoken = { text: value.text, rate: value.rate }; },
    } });
  });
  const home = await homeContext.newPage();
  const homeConsole = [];
  const homePageErrors = [];
  const homeRequests = [];
  home.on("console", (message) => { if (message.type() === "error") homeConsole.push(message.text()); });
  home.on("pageerror", (error) => homePageErrors.push(error.message));
  home.on("request", (request) => homeRequests.push(request.url()));
  const response = await home.goto(base, { waitUntil: "networkidle" });
  const firstRead = await home.evaluate(() => ({
    title: document.title,
    h1: document.querySelector("h1")?.textContent?.trim(),
    body: document.querySelector("main")?.innerText,
    primary: [...document.querySelectorAll("a")].find((node) => node.textContent?.trim() === "Try it with sample data")?.textContent?.trim(),
    primaryHref: [...document.querySelectorAll("a")].find((node) => node.textContent?.trim() === "Try it with sample data")?.getAttribute("href"),
    h1Count: document.querySelectorAll("main h1").length,
    mainCount: document.querySelectorAll("main").length,
    lang: document.documentElement.lang,
  }));
  assert(response?.status() === 200, `home status ${response?.status()}`);
  assert(firstRead.h1 === "Read selected screen text aloud", "first-read job missing");
  assert(firstRead.body.includes("low-vision desktop users"), "first-read audience missing");
  assert(firstRead.primary === "Try it with sample data", "one-click sample action missing");
  assert(firstRead.h1Count === 1 && firstRead.mainCount === 1 && firstRead.lang === "en", "home semantics invalid");
  await home.screenshot({ path: ".factory/evidence/verification-5/home-desktop.png", fullPage: true });
  await home.getByRole("link", { name: "Try it with sample data" }).click();
  await home.waitForLoadState("networkidle");
  assert(home.url() === `${base}/?demo=1`, `demo click landed at ${home.url()}`);
  assert(await home.getByRole("region", { name: "Demo mode" }).isVisible(), "demo banner missing");
  const editor = home.getByLabel("Correct the text before speaking");
  const seeded = await editor.inputValue();
  assert(seeded.includes("Valve housing") && seeded.includes("Pressure gauge"), "sample is not ready");
  const boundaryText = "R-9999 — Valve pressure: 42.5 PSI\nSecond editable row.";
  await editor.fill(boundaryText);
  await home.getByLabel(/Speech speed/).fill("2");
  await home.getByRole("button", { name: "Speak text" }).click();
  const spoken = await home.evaluate(() => window.__verificationSpoken);
  assert(spoken.text === boundaryText && spoken.rate === 2, "speech boundary value was not passed through");
  await home.getByRole("button", { name: "Copy text" }).click();
  assert(await home.evaluate(() => navigator.clipboard.readText()) === boundaryText, "clipboard text mismatch");
  await home.getByRole("button", { name: "Pin result" }).click();
  assert((await home.locator("#demo-pinned").innerText()).includes(boundaryText), "pin text mismatch");
  await home.getByRole("button", { name: "Remove pin" }).click();
  assert(await home.locator("#demo-pinned").isHidden(), "pin did not clear");
  await editor.fill("   ");
  await home.getByRole("button", { name: "Speak text" }).click();
  assert((await home.locator("#demo-status").innerText()).includes("There is no text to speak"), "empty-input recovery missing");
  await home.getByRole("button", { name: "Reset demo" }).click();
  assert((await editor.inputValue()).includes("Seal kit"), "reset did not restore sample");
  const storage = await home.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  assert(storage["verification:sentinel"] === "real-data", "demo changed real sentinel");
  assert(!Object.keys(storage).some((key) => key.startsWith("demo:")), "demo persisted its state");
  assert(homeConsole.length === 0 && homePageErrors.length === 0, `browser errors: ${homeConsole} ${homePageErrors}`);
  report.checks.firstReadAndDemo = { pass: true, firstRead, seeded, boundaryText, spoken, storage, consoleErrors: homeConsole, pageErrors: homePageErrors };
  report.requests.homeAndDemo = [...new Set(homeRequests)];
  await homeContext.close();

  const privacyContext = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: "block" });
  const privacyPage = await privacyContext.newPage();
  const demoRequests = [];
  privacyPage.on("request", (request) => demoRequests.push(request.url()));
  await privacyPage.goto(`${base}/?demo=1`, { waitUntil: "networkidle" });
  await privacyPage.getByRole("button", { name: "Pin result" }).click();
  await privacyPage.getByRole("button", { name: "Reset demo" }).click();
  const crossOrigin = demoRequests.filter((url) => new URL(url).origin !== base);
  assert(crossOrigin.length === 0, `demo cross-origin requests: ${crossOrigin}`);
  report.requests.directDemo = demoRequests;
  report.checks.demoPrivacy = { pass: true, requestCount: demoRequests.length, crossOrigin };
  await privacyContext.close();

  const routeCases = [
    ["/", "Point & Speak Desktop — Read screen text aloud", "Read selected screen text aloud", 200],
    ["/?demo=1", "Demo — Point & Speak Desktop", "Sample text is ready", 200],
    ["/demo", "Demo — Point & Speak Desktop", "Sample text is ready", 200],
    ["/privacy", "Privacy — Point & Speak Desktop", "Your screen stays on your computer", 200],
    ["/terms", "Terms — Point & Speak Desktop", "Use Point & Speak with care", 200],
    ["/verification-5-missing", "Page not found — Point & Speak Desktop", "Page not found", 404],
  ];
  for (const viewport of [{ name: "desktop", width: 1440, height: 900 }, { name: "mobile", width: 390, height: 844 }]) {
    for (const [path, title, heading, status] of routeCases) {
      const context = await browser.newContext({ viewport, serviceWorkers: "block" });
      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      page.on("console", (message) => {
        const expected404 = status === 404 && message.text().includes("status of 404");
        if (message.type() === "error" && !expected404) consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => pageErrors.push(error.message));
      const nav = await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
      const item = {
        viewport: viewport.name, path, status: nav?.status(), title: await page.title(),
        heading: await page.locator("main h1").allTextContents(),
        mainCount: await page.locator("main").count(),
        axeSeriousCritical: serious(axe).map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.length })),
        dimensions, consoleErrors, pageErrors,
      };
      assert(item.status === status, `${viewport.name} ${path} status ${item.status}`);
      assert(item.title === title, `${viewport.name} ${path} title ${item.title}`);
      assert(item.heading.length === 1 && item.heading[0] === heading, `${viewport.name} ${path} heading invalid`);
      assert(item.mainCount === 1, `${viewport.name} ${path} main count invalid`);
      assert(item.axeSeriousCritical.length === 0, `${viewport.name} ${path} axe violations`);
      assert(dimensions.width === dimensions.scrollWidth, `${viewport.name} ${path} horizontal overflow`);
      assert(consoleErrors.length === 0 && pageErrors.length === 0, `${viewport.name} ${path} browser errors`);
      report.routes.push(item);
      if (viewport.name === "mobile" && ["/", "/?demo=1"].includes(path)) {
        await page.screenshot({ path: `.factory/evidence/verification-5/${path.includes("demo") ? "demo" : "home"}-mobile.png`, fullPage: true });
      }
      await context.close();
    }
  }

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block" });
  const mobile = await mobileContext.newPage();
  await mobile.goto(`${base}/?demo=1`, { waitUntil: "networkidle" });
  const targets = await mobile.locator("a[href]:visible, button:visible, input:visible, select:visible, textarea:visible").evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { label: node.getAttribute("aria-label") || node.textContent?.trim() || node.getAttribute("name") || node.tagName, tag: node.tagName, width: rect.width, height: rect.height };
  }));
  const undersized = targets.filter((target) => target.width < 44 || target.height < 44);
  report.checks.mobileTargets = { pass: undersized.length === 0, targets, undersized };
  assert(undersized.length === 0, `undersized mobile targets: ${JSON.stringify(undersized)}`);
  await mobileContext.close();

  const keyboardContext = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: "block" });
  const keyboard = await keyboardContext.newPage();
  await keyboard.goto(base, { waitUntil: "networkidle" });
  await keyboard.keyboard.press("Tab");
  assert(await keyboard.getByRole("link", { name: "Skip to main content" }).evaluate((node) => node === document.activeElement), "skip link not first focus");
  const focusStyle = await keyboard.getByRole("link", { name: "Skip to main content" }).evaluate((node) => {
    const style = getComputedStyle(node); return { outlineWidth: style.outlineWidth, outlineStyle: style.outlineStyle, outlineColor: style.outlineColor };
  });
  assert(parseFloat(focusStyle.outlineWidth) >= 3 && focusStyle.outlineStyle !== "none", "visible focus ring missing");
  await keyboard.getByRole("link", { name: "Demo", exact: true }).focus();
  await keyboard.keyboard.press("Enter");
  await keyboard.getByRole("button", { name: "Pin result" }).focus();
  await keyboard.keyboard.press("Space");
  assert(await keyboard.locator("#demo-pinned").isVisible(), "Space did not operate button");
  await keyboard.getByRole("button", { name: "Remove pin" }).focus();
  await keyboard.keyboard.press("Enter");
  assert(await keyboard.locator("#demo-pinned").isHidden(), "Enter did not operate button");
  report.checks.keyboard = { pass: true, focusStyle };
  await keyboardContext.close();

  const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce", serviceWorkers: "block" });
  const reduced = await reducedContext.newPage();
  await reduced.goto(`${base}/?demo=1`, { waitUntil: "networkidle" });
  const motion = await reduced.evaluate(() => ({
    mediaMatches: matchMedia("(prefers-reduced-motion: reduce)").matches,
    animations: document.getAnimations().filter((animation) => animation.playState === "running").length,
    longestTransitionMs: Math.max(0, ...[...document.querySelectorAll("*")].flatMap((node) => getComputedStyle(node).transitionDuration.split(",").map((value) => value.endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1000))),
    longestAnimationMs: Math.max(0, ...[...document.querySelectorAll("*")].flatMap((node) => getComputedStyle(node).animationDuration.split(",").map((value) => value.endsWith("ms") ? parseFloat(value) : parseFloat(value) * 1000))),
  }));
  assert(motion.mediaMatches && motion.animations === 0 && motion.longestTransitionMs <= 1 && motion.longestAnimationMs <= 1, `reduced motion active: ${JSON.stringify(motion)}`);
  report.checks.reducedMotion = { pass: true, ...motion };
  await reducedContext.close();

  const narrowContext = await browser.newContext({ viewport: { width: 320, height: 640 }, serviceWorkers: "block" });
  const narrow = await narrowContext.newPage();
  await narrow.goto(`${base}/?demo=1`, { waitUntil: "networkidle" });
  const narrowOverflow = await narrow.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert(narrowOverflow === 0, `320px overflow ${narrowOverflow}`);
  report.checks.narrowReflow = { pass: true, width: 320, overflow: narrowOverflow };
  await narrowContext.close();

  const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const offline = await offlineContext.newPage();
  await offline.goto(`${base}/?demo=1`, { waitUntil: "networkidle" });
  const caches = await offline.evaluate(async () => { const registration = await navigator.serviceWorker.ready; await registration.update(); return caches.keys(); });
  await offlineContext.setOffline(true);
  await offline.reload({ waitUntil: "domcontentloaded" });
  const offlineHeading = (await offline.locator("main h1").textContent())?.trim();
  const offlineSeed = await offline.getByLabel("Correct the text before speaking").inputValue();
  report.checks.offline = { pass: caches.includes("point-speak-v5") && offlineHeading === "Sample text is ready" && offlineSeed.includes("Pressure gauge"), caches, offlineHeading, seeded: offlineSeed };
  assert(caches.includes("point-speak-v5") && offlineHeading === "Sample text is ready" && offlineSeed.includes("Pressure gauge"), "offline reload failed");
  await offlineContext.setOffline(false);
  await offlineContext.close();

  report.pass = true;
} catch (error) {
  report.pass = false;
  report.error = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
  throw error;
} finally {
  writeFileSync(".factory/evidence/verification-5/live-qa.json", `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}

console.log(JSON.stringify(report, null, 2));
