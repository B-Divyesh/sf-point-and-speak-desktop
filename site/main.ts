import "./style.css";
import "./contrast.css";

const main = document.querySelector<HTMLElement>("#main")!;
const routeStatus = document.querySelector<HTMLElement>("#route-status")!;
const PRODUCT_SLUG = import.meta.env.VITE_PRODUCT_SLUG || "point-and-speak-desktop";
const API_BASE = import.meta.env.VITE_BILLING_BASE || "https://api.sociobot.in";
const LICENSE_KEY = `sb_license:${PRODUCT_SLUG}`;
const VERIFY_KEY = `sb_license_verdict:${PRODUCT_SLUG}`;
const REPO = "B-Divyesh/sf-point-and-speak-desktop";

const templates = {
  home: () => `
    <section class="hero ruled" aria-labelledby="page-title">
      <div class="hero__copy">
        <p class="sheet-label">Assistive desktop utility / drawing 01</p>
        <h1 id="page-title" tabindex="-1">Read any screen region aloud</h1>
        <p class="lede">For low-vision desktop users when remote, legacy, game, or canvas text defeats a screen reader.</p>
        <div class="first-actions">
          <a class="button button--primary" href="/demo" data-link>Try it with sample data</a>
          <span>See the full capture flow. Nothing is saved.</span>
        </div>
        <ul class="facts" aria-label="Product facts">
          <li><strong>Local:</strong> screen images stay on your computer.</li>
          <li><strong>Offline:</strong> English OCR files ship with the app.</li>
          <li><strong>Price:</strong> core tools are free; supporter license is $19 once.</li>
        </ul>
      </div>
      <figure class="hero__art">
        <picture><source srcset="/assets/hero-blueprint-480.webp 480w, /assets/hero-blueprint-768.webp 768w, /assets/hero-blueprint.webp 1536w" type="image/webp" /><img src="/assets/hero-blueprint.webp" width="1536" height="1024" sizes="(max-width: 760px) calc(100vw - 32px), 55vw" fetchpriority="high" alt="A blueprint drawing shows a cyan selection box around rows in an inaccessible desktop window." /></picture>
        <figcaption><span>A</span> Drag one deliberate region. The rest of the screen is ignored.</figcaption>
      </figure>
    </section>
    <section class="install band" aria-labelledby="install-title">
      <div><p class="sheet-label">Installer / detected platform</p><h2 id="install-title">Install the desktop shortcut</h2><p id="download-note">Checking the latest release for this computer…</p></div>
      <div class="download-tools"><a id="download-button" class="button button--primary" href="https://github.com/${REPO}/releases">View release downloads</a><label for="platform">Other system</label><select id="platform"><option value="windows">Windows</option><option value="mac-arm64">macOS — Apple Silicon</option><option value="mac-x64">macOS — Intel</option><option value="linux">Linux</option></select></div>
    </section>
    <section class="live-preview" aria-labelledby="preview-title">
      <div class="section-heading"><p class="sheet-label">Product view / actual controls</p><h2 id="preview-title">One shortcut. One region. Your choice.</h2><p>Press the shortcut, drag around text, then choose what happens.</p></div>
      ${capturePreview()}
    </section>
    <section id="how" class="steps ruled" aria-labelledby="how-title">
      <div class="section-heading"><p class="sheet-label">Procedure / three operations</p><h2 id="how-title">How Point &amp; Speak works</h2></div>
      <ol>
        <li><span class="step-no">01</span><div><h3>Press the shortcut</h3><p>The capture sheet opens over your current screen.</p></div></li>
        <li><span class="step-no">02</span><div><h3>Drag around text</h3><p>On-device OCR reads only the rectangle you draw.</p></div></li>
        <li><span class="step-no">03</span><div><h3>Speak, copy, or pin</h3><p>Edit the result, set speech speed, or keep it visible.</p></div></li>
      </ol>
    </section>
    <section class="boundaries" aria-labelledby="boundaries-title">
      <div><p class="sheet-label">Privacy boundary / intentionally narrow</p><h2 id="boundaries-title">It looks only when you ask</h2></div>
      <div class="boundary-copy"><p>Point &amp; Speak does not watch continuously. It does not stream your screen or click for you.</p><p>Captures stay in memory and are discarded by default. This is an assistive utility, not a safety or medical product.</p><a href="/privacy" data-link>Read the plain privacy note</a></div>
    </section>
    <section class="price ruled" aria-labelledby="price-title">
      <div><p class="sheet-label">Supporter license / optional page themes</p><h2 id="price-title">Keep the core tools free</h2><p>The free app includes capture, OCR, speech, copy, and pin. A $19 one-time supporter license funds maintenance and adds two blueprint page themes.</p></div>
      <div class="price__action"><strong>$19</strong><span>one-time purchase</span><a class="button button--orange" href="${API_BASE}/api/v1/products/${PRODUCT_SLUG}/checkout">Buy a supporter license</a><button id="restore-license" class="text-button" type="button">Have a license? Paste it</button><p id="license-state" role="status"></p><div id="supporter-themes" hidden><label for="supporter-theme">Supporter page theme</label><select id="supporter-theme"><option value="cyan">Cyan drafting ink</option><option value="orange">Orange survey ink</option></select></div></div>
    </section>`,
  demo: () => `
    <div class="demo-banner" role="status"><span><strong>Demo</strong> — sample data, nothing is saved</span><span><button id="reset-demo" class="text-button" type="button">Reset demo</button><a href="/" data-link>Start for real</a></span></div>
    <section class="demo-page ruled" aria-labelledby="page-title">
      <div class="section-heading"><p class="sheet-label">Sandbox / sample legacy window</p><h1 id="page-title" tabindex="-1">Read a sample screen region</h1><p>Drag around the highlighted order rows. Then speak, copy, or pin the result.</p></div>
      ${capturePreview(true)}
      <section id="demo-result" class="demo-result" aria-labelledby="result-title" hidden><p class="sheet-label">OCR result / editable</p><h2 id="result-title">Recognised text</h2><label for="demo-text">Correct the text before speaking</label><textarea id="demo-text" rows="4"></textarea><div class="result-actions"><button id="demo-speak" class="button button--primary" type="button">Speak text</button><button id="demo-copy" class="button" type="button">Copy text</button><button id="demo-pin" class="button" type="button">Pin result</button></div><label for="demo-speed">Speech speed <output id="demo-speed-value">1×</output></label><input id="demo-speed" type="range" min="0.5" max="2" step="0.1" value="1" /><p id="demo-status" role="status" aria-live="polite"></p></section>
      <aside id="demo-pinned" class="pinned-note" hidden><h2>Pinned result</h2><p></p><button id="demo-unpin" class="text-button" type="button">Remove pin</button></aside>
    </section>`,
  privacy: () => legalPage("Privacy", "Your screen stays on your computer", `
    <p>Point &amp; Speak processes captured regions on your device. It does not upload screen images.</p>
    <h2>What the app keeps</h2><p>Captures stay in memory and are discarded when the capture window closes. A pinned result lasts only until that window closes.</p>
    <h2>License checks</h2><p>If you add a supporter license, the website stores its token and last check in your browser. The token is sent to Sociobot only to confirm the license.</p>
    <h2>Website requests</h2><p>The download page asks GitHub for the latest release. This site has no advertising, user tracking, or third-party scripts.</p>
    <h2>Your choices</h2><p>Remove a saved license in your browser storage. You can use the free core tools without an account.</p>`),
  terms: () => legalPage("Terms", "Use Point &amp; Speak with care", `
    <p>Point &amp; Speak is an assistive utility. It is not a safety or medical product.</p>
    <h2>Your responsibility</h2><p>OCR can make mistakes. Check important names, numbers, instructions, and warnings against the original screen.</p>
    <h2>License</h2><p>The free core is provided under the MIT License. A supporter purchase adds theme access for one user. Sociobot is the merchant of record and handles refunds. A refund revokes the supporter license.</p>
    <h2>Warranty</h2><p>The software is provided as-is, without warranties. The full MIT License applies to the source code.</p>`),
  notFound: () => `<section class="not-found ruled" aria-labelledby="page-title"><p class="sheet-label">Drawing not found / 404</p><h1 id="page-title" tabindex="-1">This sheet is not in the set</h1><p>The address may be wrong, or the page moved.</p><a class="button button--primary" href="/" data-link>Return to the first sheet</a></section>`,
};

function legalPage(kicker: string, title: string, body: string) {
  return `<article class="legal ruled" aria-labelledby="page-title"><p class="sheet-label">${kicker} / revision 2026-08-28</p><h1 id="page-title" tabindex="-1">${title}</h1>${body}<p><a href="mailto:privacy@sociobot.in">Email privacy@sociobot.in</a> with questions.</p></article>`;
}

function capturePreview(interactive = false) {
  return `<div class="capture-preview ${interactive ? "capture-preview--interactive" : ""}" data-demo-capture="${interactive}">
    <div class="fake-titlebar"><span>FIELD STOCK / TERMINAL 4</span><span>— □ ×</span></div>
    <div class="fake-window"><aside><span>ORDERS</span><span>PARTS</span><span>ARCHIVE</span></aside><div class="fake-table" aria-label="Sample inventory rows"><div class="table-head"><span>REF</span><span>ITEM</span><span>STATUS</span></div><div><span>R-1082</span><span>Valve housing</span><span>HOLD</span></div><div><span>R-1083</span><span>Seal kit, 40 mm</span><span>READY</span></div><div><span>R-1084</span><span>Pressure gauge</span><span>CHECK</span></div><div><span>R-1085</span><span>Safety cover</span><span>READY</span></div><span class="selection" aria-hidden="true"><i>DRAG REGION</i></span></div></div>
    ${interactive ? `<button id="sample-capture" class="capture-hit" type="button"><span>Drag here or press to read this region</span></button>` : `<div class="preview-caption"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Space</kbd><span>Global capture shortcut</span></div>`}
  </div>`;
}

function pathKey() {
  if (location.pathname === "/") return "home";
  if (location.pathname === "/demo") return "demo";
  if (location.pathname === "/privacy") return "privacy";
  if (location.pathname === "/terms") return "terms";
  return "notFound";
}

function route(focusHeading = false) {
  const key = pathKey();
  main.innerHTML = templates[key]();
  const titles = { home: "Point & Speak — Read screen text aloud", demo: "Demo — Point & Speak", privacy: "Privacy — Point & Speak", terms: "Terms — Point & Speak", notFound: "Page not found — Point & Speak" };
  document.title = titles[key];
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!;
  canonical.href = `https://point-and-speak-desktop.sociobot.in${key === "home" ? "/" : location.pathname}`;
  bindLinks();
  if (key === "home") { void setupDownloads(); setupLicense(); }
  if (key === "demo") setupDemo();
  const h1 = main.querySelector<HTMLElement>("h1")!;
  if (focusHeading) h1.focus({ preventScroll: true });
  routeStatus.textContent = `${h1.textContent} page loaded`;
  scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

function bindLinks() {}

function osName() {
  const value = navigator.userAgent.toLowerCase();
  return value.includes("win") ? "windows" : value.includes("mac") ? "mac-arm64" : "linux";
}

async function setupDownloads() {
  const select = document.querySelector<HTMLSelectElement>("#platform")!;
  const button = document.querySelector<HTMLAnchorElement>("#download-button")!;
  const note = document.querySelector<HTMLElement>("#download-note")!;
  select.value = osName();
  if (new URLSearchParams(location.search).has("demo")) return;
  try {
    const cached = JSON.parse(localStorage.getItem("release:v1") || "null") as { time: number; data: Release } | null;
    const data = cached && Date.now() - cached.time < 3600000 ? cached.data : await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=1`).then(async (response) => { if (!response.ok) throw new Error("release unavailable"); const releases = await response.json() as Release[]; if (!releases[0]) throw new Error("release unavailable"); return releases[0]; });
    if (!cached) localStorage.setItem("release:v1", JSON.stringify({ time: Date.now(), data }));
    const update = () => {
      const match = assetFor(data.assets, select.value);
      button.textContent = match ? `Download for ${labelFor(select.value)}` : "View release downloads";
      button.href = match?.browser_download_url || data.html_url;
      note.textContent = match ? `${data.tag_name} is ready. Downloads are unsigned during the pilot.` : "Downloads are being published. The release page has the current files.";
    };
    select.addEventListener("change", update); update();
  } catch {
    note.textContent = "Downloads are being published. Check the release page for availability.";
    button.textContent = "View release downloads";
    button.href = `https://github.com/${REPO}/releases`;
  }
}

type Release = { tag_name: string; html_url: string; assets: { name: string; browser_download_url: string }[] };
function assetFor(assets: Release["assets"], os: string) {
  const pattern = os === "windows" ? /\.msi$|setup\.exe$/i
    : os === "mac-arm64" ? /aarch64.*\.dmg$/i
      : os === "mac-x64" ? /x64.*\.dmg$/i
        : /\.AppImage$/i;
  return assets.find((asset) => pattern.test(asset.name));
}
function labelFor(os: string) { return os === "windows" ? "Windows" : os === "mac-arm64" ? "macOS — Apple Silicon" : os === "mac-x64" ? "macOS — Intel" : "Linux"; }

function setupDemo() {
  const capture = document.querySelector<HTMLElement>("#sample-capture")!;
  const resultPanel = document.querySelector<HTMLElement>("#demo-result")!;
  const text = document.querySelector<HTMLTextAreaElement>("#demo-text")!;
  const status = document.querySelector<HTMLElement>("#demo-status")!;
  const sample = "R-1082  Valve housing  HOLD\nR-1083  Seal kit, 40 mm  READY\nR-1084  Pressure gauge  CHECK";
  const reset = () => { text.value = ""; resultPanel.hidden = true; document.querySelector<HTMLElement>("#demo-pinned")!.hidden = true; status.textContent = ""; };
  capture.addEventListener("click", () => { text.value = sample; resultPanel.hidden = false; status.textContent = "Text is ready. Review it, then speak, copy, or pin it."; text.focus(); });
  document.querySelector("#reset-demo")!.addEventListener("click", reset);
  document.querySelector("#demo-speak")!.addEventListener("click", () => {
    speechSynthesis.cancel();
    if (!text.value.trim()) { status.textContent = "There is no text to speak. Read the sample region first."; return; }
    const speech = new SpeechSynthesisUtterance(text.value);
    speech.rate = Number((document.querySelector("#demo-speed") as HTMLInputElement).value);
    speechSynthesis.speak(speech);
    status.textContent = "Speaking the sample text with your device voice.";
  });
  document.querySelector("#demo-copy")!.addEventListener("click", async () => { try { await navigator.clipboard.writeText(text.value); status.textContent = "Sample text copied to the clipboard."; } catch { status.textContent = "Copy was blocked. Select the text and use your keyboard copy command."; } });
  document.querySelector("#demo-pin")!.addEventListener("click", () => { const pin = document.querySelector<HTMLElement>("#demo-pinned")!; pin.querySelector("p")!.textContent = text.value; pin.hidden = false; status.textContent = "Sample result pinned for this demo session."; });
  document.querySelector("#demo-unpin")!.addEventListener("click", () => { document.querySelector<HTMLElement>("#demo-pinned")!.hidden = true; status.textContent = "Pinned result removed."; });
  const speed = document.querySelector<HTMLInputElement>("#demo-speed")!; speed.addEventListener("input", () => { document.querySelector<HTMLOutputElement>("#demo-speed-value")!.value = `${Number(speed.value).toFixed(1).replace(".0", "")}×`; });
}

function setupLicense() {
  const params = new URLSearchParams(location.search);
  const incoming = params.get("license");
  if (incoming) { localStorage.setItem(LICENSE_KEY, incoming); params.delete("license"); history.replaceState({}, "", `${location.pathname}${params.size ? `?${params}` : ""}${location.hash}`); void verifyLicense(incoming, true); }
  const restore = document.querySelector<HTMLButtonElement>("#restore-license")!;
  const picker = document.querySelector<HTMLSelectElement>("#supporter-theme")!;
  picker.value = localStorage.getItem("supporter_theme") || "cyan";
  picker.addEventListener("change", () => {
    document.documentElement.dataset.supporterTheme = picker.value;
    localStorage.setItem("supporter_theme", picker.value);
  });
  restore.addEventListener("click", () => {
    const token = prompt("Paste your supporter license token");
    if (token?.trim()) { localStorage.setItem(LICENSE_KEY, token.trim()); void verifyLicense(token.trim(), true); }
  });
  const token = localStorage.getItem(LICENSE_KEY); if (token) void verifyLicense(token);
}

async function verifyLicense(token: string, force = false) {
  const state = document.querySelector<HTMLElement>("#license-state"); if (!state) return;
  const cached = JSON.parse(localStorage.getItem(VERIFY_KEY) || "null") as { time: number; valid: boolean } | null;
  if (!force && cached && Date.now() - cached.time < 86400000) { showSupporterThemes(cached.valid); state.textContent = cached.valid ? "Supporter license active." : "License no longer active. You can keep using the free core."; return; }
  try { const reply = await fetch(`${API_BASE}/api/v1/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`).then((response) => response.json()) as { valid: boolean }; localStorage.setItem(VERIFY_KEY, JSON.stringify({ time: Date.now(), valid: reply.valid })); showSupporterThemes(reply.valid); state.textContent = reply.valid ? "Supporter license active." : "License no longer active. You can keep using the free core."; }
  catch { state.textContent = cached?.valid ? "Supporter license active. The latest check will retry later." : "License check is unavailable. The free core still works."; }
}

function showSupporterThemes(valid: boolean) {
  const controls = document.querySelector<HTMLElement>("#supporter-themes");
  if (!controls) return;
  controls.hidden = !valid;
  if (valid) document.documentElement.dataset.supporterTheme = localStorage.getItem("supporter_theme") || "cyan";
  else delete document.documentElement.dataset.supporterTheme;
}

document.addEventListener("click", (event) => {
  const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[data-link]");
  if (link && link.origin === location.origin) { event.preventDefault(); history.pushState({}, "", link.href); route(true); }
});
window.addEventListener("popstate", () => route(true));
route();
if ("serviceWorker" in navigator && import.meta.env.PROD) void navigator.serviceWorker.register("/sw.js");
