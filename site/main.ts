import "./style.css";
import "./contrast.css";

const main = document.querySelector<HTMLElement>("#main")!;
const routeStatus = document.querySelector<HTMLElement>("#route-status")!;
const PRODUCT_SLUG = import.meta.env.VITE_PRODUCT_SLUG || "point-and-speak-desktop";
const API_BASE = import.meta.env.VITE_BILLING_BASE || "https://api.sociobot.in";
const LICENSE_KEY = `sb_license:${PRODUCT_SLUG}`;
const VERIFY_KEY = `sb_license_verdict:${PRODUCT_SLUG}`;
const REPO = "B-Divyesh/sf-point-and-speak-desktop";
let routeAbort: AbortController | null = null;

const templates = {
  home: () => `
    <section class="hero ruled" aria-labelledby="page-title">
      <div class="hero__copy">
        <p class="sheet-label">For low-vision desktop users</p>
        <h1 id="page-title" tabindex="-1">Read selected screen text aloud</h1>
        <p class="lede">For low-vision desktop users when screen readers miss text in remote desktops, old software, games, or visual app interfaces.</p>
        <div class="first-actions">
          <a class="button button--primary" href="/?demo=1" data-link>Try it with sample data</a>
          <span>See an editable result at once. Your real data stays untouched.</span>
        </div>
        <ul class="facts" aria-label="Product facts">
          <li><strong>Local:</strong> captured images stay on your computer.</li>
          <li><strong>Offline:</strong> English text-recognition files ship with the app.</li>
          <li><strong>Price:</strong> core tools are free; supporter license is $19 once.</li>
        </ul>
      </div>
      <figure class="hero__art">
        <picture><source srcset="/assets/hero-blueprint-480.webp 480w, /assets/hero-blueprint-768.webp 768w, /assets/hero-blueprint.webp 1536w" type="image/webp" /><img src="/assets/hero-blueprint.webp" width="1536" height="1024" sizes="(max-width: 760px) calc(100vw - 32px), 55vw" fetchpriority="high" alt="A blueprint drawing shows a cyan selection box around rows in an inaccessible desktop window." /></picture>
        <figcaption><span>A</span> Draw a region around the text you want to hear.</figcaption>
      </figure>
    </section>
    <section class="install band" aria-labelledby="install-title">
      <div><p class="sheet-label">Choose your system</p><h2 id="install-title">Install the desktop app</h2><p id="download-note">Checking the latest release…</p></div>
      <div class="download-tools"><a id="download-button" class="button button--primary" href="https://github.com/${REPO}/releases">View release downloads</a><label for="platform">Other system</label><select id="platform"><option value="windows">Windows</option><option value="mac-arm64">macOS — Apple Silicon</option><option value="mac-x64">macOS — Intel</option><option value="linux">Linux</option></select></div>
    </section>
    <section class="live-preview" aria-labelledby="preview-title">
      <div class="section-heading"><p class="sheet-label">Desktop walkthrough</p><h2 id="preview-title">Choose what happens to recognised text</h2><p>These three frames show the complete capture.</p></div>
      ${walkthrough()}
    </section>
    <section id="how" class="steps ruled" aria-labelledby="how-title">
      <div class="section-heading"><p class="sheet-label">Three steps</p><h2 id="how-title">How Point &amp; Speak works</h2></div>
      <ol>
        <li><span class="step-no">01</span><div><h3>Use the shortcut</h3><p>The configured shortcut is Ctrl+Shift+Space. The capture window lets you choose a region.</p></div></li>
        <li><span class="step-no">02</span><div><h3>Choose the text</h3><p>Text recognition processes the region you draw on your computer.</p></div></li>
        <li><span class="step-no">03</span><div><h3>Speak, copy, or pin</h3><p>Edit the result, change its speech speed, or keep it visible.</p></div></li>
      </ol>
    </section>
    <section class="boundaries" aria-labelledby="boundaries-title">
      <div><p class="sheet-label">What the app can see and keep</p><h2 id="boundaries-title">Screen capture starts when you ask</h2></div>
      <div class="boundary-copy"><p>A capture begins after you choose Capture screen. Captured images are not uploaded.</p><p>Captures stay in memory and disappear when the capture window reloads or closes.</p><p>This is an assistive utility, not a safety or medical product.</p><a href="/privacy" data-link>Read the privacy note</a></div>
    </section>
    <section class="price ruled" aria-labelledby="price-title">
      <div><p class="sheet-label">Optional page themes</p><h2 id="price-title">$19 supporter license adds two themes</h2><p>The free app includes capture, text recognition, speech, copy, and pin. The one-time supporter license adds two blueprint page themes.</p></div>
      <div class="price__action"><strong>$19</strong><span>one-time purchase</span><a class="button button--orange" href="${API_BASE}/api/v1/products/${PRODUCT_SLUG}/checkout">Buy a supporter license</a><button id="restore-license" class="text-button" type="button">Activate supporter license</button><p id="license-state" role="status"></p><div id="supporter-themes" hidden><label for="supporter-theme">Supporter page theme</label><select id="supporter-theme"><option value="cyan">Cyan drafting ink</option><option value="orange">Orange survey ink</option></select></div></div>
    </section>`,
  demo: () => `
    <div class="demo-banner" role="region" aria-label="Demo mode"><span><strong>Demo</strong> — sample data, nothing is saved</span><span><button id="reset-demo" class="text-button" type="button">Reset demo</button><a href="/" data-link>Start for real</a></span></div>
    <section class="demo-page ruled" aria-labelledby="page-title">
      <div class="section-heading demo-heading"><p class="sheet-label">Demo with a sample legacy window</p><h1 id="page-title" tabindex="-1">Sample text is ready</h1><p>Edit the result, then speak, copy, or pin it.</p></div>
      <section id="demo-result" class="demo-result" aria-labelledby="result-title"><p class="sheet-label">Editable result</p><h2 id="result-title">Recognised text</h2><label for="demo-text">Correct the text before speaking</label><textarea id="demo-text" rows="4"></textarea><div class="result-actions"><button id="demo-speak" class="button button--primary" type="button">Speak text</button><button id="demo-copy" class="button" type="button">Copy text</button><button id="demo-pin" class="button" type="button">Pin result</button></div><label for="demo-speed">Speech speed <output id="demo-speed-value">1×</output></label><input id="demo-speed" type="range" min="0.5" max="2" step="0.1" value="1" /><p id="demo-status" role="status" aria-live="polite"></p></section>
      <aside id="demo-pinned" class="pinned-note" hidden><h2>Pinned result</h2><p></p><button id="demo-unpin" class="text-button" type="button">Remove pin</button></aside>
      <div class="replay-heading"><h2>Replay the sample selection</h2><p>Activate the marked region to restore the sample result.</p></div>
      ${capturePreview(true)}
    </section>`,
  privacy: () => legalPage("Privacy", "Your screen stays on your computer", `
    <p>Point &amp; Speak processes captured regions on your device. It does not upload screen images.</p>
    <h2>What the app keeps</h2><p>Captures stay in memory and are discarded when the capture window closes. A pinned result lasts only until that window closes.</p>
    <h2>License checks</h2><p>If you add a supporter license, the website stores its token and last check in your browser. The token is sent to Sociobot only to confirm the license.</p>
    <h2>Website requests</h2><p>The download page asks GitHub for the latest release. This site has no advertising, user tracking, or third-party scripts.</p>
    <h2>Your choices</h2><p>Remove a saved license in your browser storage. Capture, text recognition, speech, copy, and pin work without an account.</p>`),
  terms: () => legalPage("Terms", "Use Point &amp; Speak with care", `
    <p>Point &amp; Speak is an assistive utility. It is not a safety or medical product.</p>
    <h2>Your responsibility</h2><p>Text recognition can make mistakes. Check important names, numbers, instructions, and warnings against the original screen.</p>
    <h2>License</h2><p>The free core is provided under the MIT License. A supporter license adds two page themes. Sociobot checkout handles payment.</p><p><a href="https://sociobot.in/terms">Read Sociobot terms for payment and refund rules <span class="sr-only">(external site)</span></a>.</p>
    <h2>Warranty</h2><p>The software is provided as-is, without warranties. The full MIT License applies to the source code.</p>`),
  notFound: () => `<section class="not-found ruled" aria-labelledby="page-title"><p class="sheet-label">Error 404</p><h1 id="page-title" tabindex="-1">Page not found</h1><p>This address does not match a page.</p><a class="button button--primary" href="/" data-link>Return home</a></section>`,
};

function legalPage(kicker: string, title: string, body: string) {
  return `<article class="legal ruled" aria-labelledby="page-title"><p class="sheet-label">${kicker} / revision 2026-08-28</p><h1 id="page-title" tabindex="-1">${title}</h1>${body}<p><a href="mailto:privacy@sociobot.in">Email privacy@sociobot.in</a> with questions.</p></article>`;
}

function capturePreview(interactive = false) {
  return `<div class="capture-preview ${interactive ? "capture-preview--interactive" : ""}" data-demo-capture="${interactive}">
    <div class="fake-titlebar"><span>FIELD STOCK / TERMINAL 4</span><span>— □ ×</span></div>
    <div class="fake-window"><aside><span>ORDERS</span><span>PARTS</span><span>ARCHIVE</span></aside><div class="fake-table" aria-label="Sample inventory rows"><div class="table-head"><span>REF</span><span>ITEM</span><span>STATUS</span></div><div><span>R-1082</span><span>Valve housing</span><span>HOLD</span></div><div><span>R-1083</span><span>Seal kit, 40 mm</span><span>READY</span></div><div><span>R-1084</span><span>Pressure gauge</span><span>CHECK</span></div><div><span>R-1085</span><span>Safety cover</span><span>READY</span></div><span class="selection" aria-hidden="true"><i>DRAG REGION</i></span></div></div>
    ${interactive ? `<button id="sample-capture" class="capture-hit" type="button"><span>Replay this sample region</span></button>` : `<div class="preview-caption"><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Space</kbd><span>Configured shortcut</span></div>`}
  </div>`;
}

function walkthrough() {
  return `<div class="walkthrough">
    <figure class="walkthrough__frame"><div class="mini-window mini-window--select"><span class="mini-title">FIELD STOCK</span><span class="mini-row">R-1082&nbsp; Valve housing</span><span class="mini-row">R-1083&nbsp; Seal kit</span><i aria-hidden="true"></i></div><figcaption><strong>1. Select a region</strong><span>Draw around the text that the other app does not expose.</span></figcaption></figure>
    <figure class="walkthrough__frame"><div class="mini-window mini-window--result"><span class="mini-label">RECOGNISED TEXT</span><span>R-1082&nbsp; Valve housing&nbsp; HOLD</span><span>R-1083&nbsp; Seal kit&nbsp; READY</span></div><figcaption><strong>2. Review the text</strong><span>Correct the editable result before using it.</span></figcaption></figure>
    <figure class="walkthrough__frame"><div class="mini-window mini-window--actions"><span class="mini-label">RESULT READY</span><b>Speak text</b><b>Copy text</b><b>Pin result</b></div><figcaption><strong>3. Choose an action</strong><span>Hear the text, copy it, or keep it visible.</span></figcaption></figure>
  </div>`;
}

function pathKey() {
  if (new URLSearchParams(location.search).get("demo") === "1") return "demo";
  if (location.pathname === "/") return "home";
  if (location.pathname === "/demo") return "demo";
  if (location.pathname === "/privacy") return "privacy";
  if (location.pathname === "/terms") return "terms";
  return "notFound";
}

function route(focusHeading = false) {
  routeAbort?.abort();
  routeAbort = new AbortController();
  const key = pathKey();
  main.innerHTML = templates[key]();
  const metadata = {
    home: { title: "Point & Speak Desktop — Read screen text aloud", description: "Select text in a desktop screen region, then hear, edit, copy, or pin the recognised result." },
    demo: { title: "Demo — Point & Speak Desktop", description: "Try Point & Speak Desktop with an editable sample result that is not saved." },
    privacy: { title: "Privacy — Point & Speak Desktop", description: "Learn what Point & Speak Desktop processes, keeps, and sends when you capture text or check a license." },
    terms: { title: "Terms — Point & Speak Desktop", description: "Read the terms for Point & Speak Desktop and its optional supporter license." },
    notFound: { title: "Page not found — Point & Speak Desktop", description: "This address does not match a Point & Speak Desktop page." },
  };
  document.title = metadata[key].title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')!.content = metadata[key].description;
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')!.content = metadata[key].title;
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')!.content = metadata[key].description;
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')!.content = metadata[key].title;
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')!.content = metadata[key].description;
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')!;
  const canonicalPath = key === "home" ? "/" : key === "demo" ? "/demo" : location.pathname;
  canonical.href = `https://point-and-speak-desktop.sociobot.in${canonicalPath}`;
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')!.content = canonical.href;
  bindLinks();
  if (key === "home") { void setupDownloads(routeAbort.signal); setupLicense(routeAbort.signal); }
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

async function setupDownloads(signal: AbortSignal) {
  const select = document.querySelector<HTMLSelectElement>("#platform")!;
  const button = document.querySelector<HTMLAnchorElement>("#download-button")!;
  const note = document.querySelector<HTMLElement>("#download-note")!;
  select.value = osName();
  if (new URLSearchParams(location.search).has("demo")) return;
  try {
    const cached = JSON.parse(localStorage.getItem("release:v1") || "null") as { time: number; data: Release } | null;
    const freshCache = Boolean(cached && Date.now() - cached.time < 3600000);
    const data = freshCache ? cached!.data : await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=1`, { signal }).then(async (response) => { if (!response.ok) throw new Error("release unavailable"); const releases = await response.json() as Release[]; if (!releases[0]) throw new Error("release unavailable"); return releases[0]; });
    if (!freshCache && !signal.aborted) localStorage.setItem("release:v1", JSON.stringify({ time: Date.now(), data }));
    if (signal.aborted) return;
    const update = () => {
      const match = assetFor(data.assets, select.value);
      button.textContent = match ? `Download for ${labelFor(select.value)}` : "View release downloads";
      button.href = match?.browser_download_url || data.html_url;
      note.textContent = match ? `${data.tag_name} is ready.` : "Downloads are being published. The release page has the current files.";
    };
    select.addEventListener("change", update); update();
  } catch (error) {
    if (signal.aborted || (error instanceof DOMException && error.name === "AbortError")) return;
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
  const reset = (focus = false) => {
    text.value = sample;
    resultPanel.hidden = false;
    document.querySelector<HTMLElement>("#demo-pinned")!.hidden = true;
    status.textContent = "Sample restored. Review it, then speak, copy, or pin it.";
    if (focus) text.focus();
  };
  reset();
  capture.addEventListener("click", () => reset(true));
  document.querySelector("#reset-demo")!.addEventListener("click", () => reset(true));
  document.querySelector("#demo-speak")!.addEventListener("click", () => {
    speechSynthesis.cancel();
    if (!text.value.trim()) { status.textContent = "There is no text to speak. Restore the sample result first."; return; }
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

function setupLicense(signal: AbortSignal) {
  const params = new URLSearchParams(location.search);
  const incoming = params.get("license");
  if (incoming) { localStorage.setItem(LICENSE_KEY, incoming); params.delete("license"); history.replaceState({}, "", `${location.pathname}${params.size ? `?${params}` : ""}${location.hash}`); }
  const restore = document.querySelector<HTMLButtonElement>("#restore-license")!;
  const picker = document.querySelector<HTMLSelectElement>("#supporter-theme")!;
  picker.value = localStorage.getItem("supporter_theme") || "cyan";
  picker.addEventListener("change", () => {
    document.documentElement.dataset.supporterTheme = picker.value;
    localStorage.setItem("supporter_theme", picker.value);
  });
  restore.addEventListener("click", () => {
    const token = prompt("Paste your supporter license token");
    if (token?.trim()) { localStorage.setItem(LICENSE_KEY, token.trim()); void verifyLicense(token.trim(), signal, true); }
  });
  const token = localStorage.getItem(LICENSE_KEY); if (token) void verifyLicense(token, signal, Boolean(incoming));
}

async function verifyLicense(token: string, signal: AbortSignal, force = false) {
  const state = document.querySelector<HTMLElement>("#license-state"); if (!state) return;
  const cached = JSON.parse(localStorage.getItem(VERIFY_KEY) || "null") as { time: number; valid: boolean } | null;
  if (!force && cached && Date.now() - cached.time < 86400000) { showSupporterThemes(cached.valid); state.textContent = cached.valid ? "Supporter license active." : "License no longer active. You can keep using the free core."; return; }
  try { const reply = await fetch(`${API_BASE}/api/v1/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`, { signal }).then((response) => response.json()) as { valid: boolean }; if (signal.aborted) return; localStorage.setItem(VERIFY_KEY, JSON.stringify({ time: Date.now(), valid: reply.valid })); showSupporterThemes(reply.valid); state.textContent = reply.valid ? "Supporter license active." : "License no longer active. You can keep using the free core."; }
  catch (error) { if (signal.aborted || (error instanceof DOMException && error.name === "AbortError")) return; state.textContent = cached?.valid ? "Supporter license active. The latest check will retry later." : "License check is unavailable. The free core still works."; }
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
