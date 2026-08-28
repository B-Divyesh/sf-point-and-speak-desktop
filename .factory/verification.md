# Independent product verification

## Verdict: FAIL

Candidate `fc39728a4ed0d875f1fa2571b2940bee649cc0c5` is not ready for
release. Verification ran on 2026-08-28 UTC against the clean checkout and
`https://point-and-speak-desktop.sociobot.in`.

The core local OCR path works, all eight declared claim tests pass after the
lockfile install, and the deployed JavaScript and CSS match this candidate.
Release-blocking failures remain in checkout, the desktop first-run screen,
dark-theme accessibility, and claim coverage.

## Acceptance gates

### Claims-first gate

`.factory/claims.json` exists and contains eight entries. Per the work order,
each exact command was attempted before any other repository setup. All eight
initial commands exited 127 because a clean checkout has no `node_modules` and
therefore no `vitest` executable. After the required `npm ci`, every exact
claim command passed in both Playwright projects:

| Claim | Exact test | Result |
| --- | --- | --- |
| `sample-region` | `npm test -- --grep @claim:sample-region` | PASS — 2/2 |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS — 2/2 |
| `speak` | `npm test -- --grep @claim:speak` | PASS — 2/2 |
| `pin-result` | `npm test -- --grep @claim:pin-result` | PASS — 2/2 |
| `no-demo-storage` | `npm test -- --grep @claim:no-demo-storage` | PASS — 2/2 |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS — 2/2 |
| `bundled-ocr` | `npm test -- --grep @claim:bundled-ocr` | PASS — 2/2 |
| `supporter-themes` | `npm test -- --grep @claim:supporter-themes` | PASS — 2/2 |

The pre-install failures are setup failures, not assertion failures. The
installed clean-checkout results above are the product result.

### First-read and one-click demo

PASS. A cold 1440x1000 and 390x844 load answers all three questions in the
first viewport:

- What: “Read any screen region aloud.”
- Who: low-vision desktop users facing remote, legacy, game, or canvas text.
- First click: “Try it with sample data,” followed by “See the full capture
  flow. Nothing is saved.”

The action is inside the first viewport at both sizes (desktop bottom 756.8px;
mobile bottom 481px), opens `/demo` in one click, immediately shows realistic
inventory rows, and keeps the persistent demo/reset/start-for-real banner.

## Release-blocking findings

### P1 — Live paid checkout is unavailable

The landing page advertises a `$19` one-time supporter license. A fresh request
to its exact link returned:

```text
GET https://api.sociobot.in/api/v1/products/point-and-speak-desktop/checkout
HTTP/2 404
{"error":"enabled factory product","status":404}
```

The paid flow cannot be completed. This independently confirms the operator
registration gap instead of accepting the earlier deployment report.

### P1 — Released desktop app hides both first-run actions below the window

The released Linux AppImage and the production webview both render the
supposedly hidden capture canvas. `app/index.html` marks `#screen` as `hidden`,
but `app/style.css` applies `canvas { display:block }`, overriding the browser's
hidden rule.

At the configured default 1180x820 window:

```text
#screen hidden=true, computed display=block, top=203.6, bottom=712.0
#empty  top=712.0, bottom=1069.1
#capture top=977.1, bottom=1021.1, outside viewport
#sample  top=977.1, bottom=1021.1, outside viewport
document height=1094
```

At the supported 390x640 minimum, Capture is at 729–773px and Load sample is at
781–825px. A cold user sees a large blank panel, not either primary action.
The hidden canvas also incorrectly receives keyboard focus. Scrolling to the
bottom recovers the actions, and the sample then works, but this violates the
desktop first-run/demo contract and is especially harmful for the target
low-vision audience.

### P1 — Serious dark-theme contrast failures

Fresh axe WCAG A/AA scans in `colorScheme: dark` report `color-contrast` as
serious on `/` and `/demo`:

- Install heading and platform label: 1.11:1.
- White text on orange captions, purchase button, and demo banner: 3.53:1.
- Step numbers: 4.43:1.
- Privacy boundary label: 3.90:1.
- 12 failing nodes on `/`; 5 on `/demo`.

Light-theme scans pass. The repository's axe tests only exercise the default
theme, so its green result does not cover the required second treatment.

### P1 — Claims contract is incomplete and some tests prove only the canned demo

The landing page and README make relied-on claims with no dedicated manifest
entry/test, including the global shortcut, app capture retention, no telemetry,
checksum-verifying installers, and availability of the free core. In addition,
`local-only` intercepts the static canned demo; it never runs desktop capture or
OCR, so it cannot prove the landing/README promise about actual screen images.
`no-demo-storage` similarly proves only demo memory, not app capture retention.

The claims contract states that an unlisted claim fails review. Independent
runtime checks found no external request during the app sample/OCR flow, but
that does not repair the missing automated claim coverage.

## Other defects

### P2 — Repository TypeScript check fails

`npx tsc --noEmit -p tsconfig.json` exits 2. The configuration includes Vite
and Playwright declarations but omits Node types and an ES library level that
defines `Symbol.asyncDispose`. Errors include missing `child_process`, `fs`,
`Buffer`, `NodeJS`, and `Symbol.asyncDispose`. `--skipLibCheck` passes, showing
the failure is dependency/type-check configuration. There is no lint or
typecheck script in `package.json`.

### P2 — Interactive targets miss the required 44px size

At 390px, the wordmark and header/footer links measure 20.1–24.8px high; the
demo's “Start for real” link is 24.8px high. The desktop app's speed range is
16px high. This violates the attached 44px target baseline even though axe does
not report it.

### P2 — Intel macOS users receive the Apple Silicon download

Selecting macOS sets the primary link to
`Point.Speak.Desktop_0.1.1_aarch64.dmg`. `assetFor()` returns the first `.dmg`
without architecture detection or an Intel/Apple Silicon choice. The x64 DMG
exists but is not reachable from the page's platform selector.

### P2 — Designed not-found route returns HTTP 200

`GET /missing-sheet` renders the designed not-found page but responds
`HTTP/2 200`, not 404. This is not a real HTTP 404 route.

### P3 — Demo claims success for empty speech input

After clearing the editable result and choosing Speak text, the demo calls the
speech API with an empty string and reports “Speaking the sample text with your
device voice.” The desktop app itself correctly says there is no text to speak.

## Functional evidence

- Published AppImage launched under Xvfb. `Ctrl+Shift+Space` invoked native
  capture and changed the status to “Drag a rectangle around the text.”
- After scrolling to the hidden first-run actions, Load sample region rendered
  the bundled inventory screen. Pressing Enter ran OCR and displayed an
  editable result with all four item/status rows.
- The same production webview flow completed in 1.830s cold. A warm recovery
  after a blank selection completed in 539ms.
- Too-small selection: “That region is too small. Drag a larger rectangle
  around the text.” Recovery by selecting again passed.
- Blank region: “No text was found. Try a tighter region with larger text.”
  Speak then correctly reports no text; recapture recovers.
- A separate 20-image synthetic pilot varied font family, size, light/dark/low
  contrast, identifiers, dates, decimals, and times. All 20 reached at least
  0.70 normalized text similarity under two seconds; maximum recognition time
  was 366ms after worker creation. This supports but does not replace a
  hardware/workplace pilot.
- Speech receives edited OCR text and the 0.5x–2x range endpoint. Copy failure
  gives a keyboard recovery instruction. Pin/unpin and reset work.
- Keyboard-only demo path works: Tab focuses the sample region, Enter opens the
  result and moves focus to the textarea, then Tab/Enter speaks. Browser Back
  restores the home route and focuses its `h1`.

## Test and build evidence

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 77 packages, 0 audit findings |
| `npm test` | PASS; 4 Vitest + 30 Playwright |
| `npm run build` | PASS; `dist/app` and `dist/site` |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS; lib/bin/doc targets |
| `cargo clippy ... -- -D warnings` | PASS; dependency future-compat note only |
| `npx tsc --noEmit -p tsconfig.json` | FAIL; see P2 |
| `npx tsc ... --skipLibCheck` | PASS |
| `npm audit --omit=dev --audit-level=high` | PASS; 0 vulnerabilities |

Rust was rerun after installing the same GTK/WebKit system dependencies listed
in `.github/workflows/release.yml`. No lint script exists.

## Live accessibility, privacy, PWA, and policy evidence

- `/opt/fleet/lib/verify-url.sh`: PASS; HTTP 200, title, `lang=en`, one `h1`,
  `main`, complete image alt text, zero console/page errors.
- Axe serious/critical: zero on `/`, `/demo`, `/privacy`, `/terms`, and the
  not-found view in light mode and at 390px; dark mode fails as documented.
- Focus is visible (`3px` solid orange with `3px` offset). Reduced motion gives
  `animation-name: none` and `scroll-behavior: auto`.
- No horizontal overflow at 390px. The primary action is visible in the first
  844px viewport. Touch-target exceptions are documented above.
- Demo capture/pin/reset sends only same-origin requests and leaves no `demo:`
  localStorage key. The app sample/OCR path also sent no cross-origin request.
- The landing page's only automatic third-party request is the documented
  GitHub releases API lookup. No analytics, third-party scripts/fonts, raw
  Azure endpoints, embedded keys, or secret patterns were found.
- License verification has correct product-origin CORS and `Cache-Control:
  no-store`; an invalid token returns `{valid:false, reason:"invalid"}`.
- Burst rate-limit test: 240 requests at concurrency 24 produced 32 HTTP 200
  and 208 HTTP 429 responses. The first completed 429 followed 30 completed
  200s; in-flight requests brought the observed accepted total to 32. Every
  429 included `Retry-After` (observed 0–4 seconds).
- Service worker installed and controlled `/demo`; `registration.update()`
  resolved; cache `point-speak-v1` existed; offline reload restored the demo.
- CSP, HSTS, `nosniff`, referrer policy, and permissions policy are present.
  HTML/SW use 30-second revalidation; hashed assets and OCR files use one-year
  immutable caching.

## Performance and deployment identity

- Fresh mobile Lighthouse: performance 93, accessibility 100, best practices
  100, SEO 100; FCP 1.1s, LCP 1.1s, TBT 300ms, CLS 0, transfer 49KiB.
- Site JS: 16,401 bytes raw / 5.90KiB gzip. CSS: 11,660 bytes raw / 3.50KiB
  gzip. Mobile hero: 16,180 bytes. No font download.
- Live JS SHA-256 equals candidate build:
  `aa501a44edefd10323bee7c9030e5a03efc37ff1a25b89cf3cd433d80ff1de6a`.
- Live CSS SHA-256 equals candidate build:
  `782fa39e28a9f9c6593a0767a7343f14548873399842ac2197ccfb4d777fbf93`.
- Candidate differs from release tag `v0.1.1` only in `.factory/handoff.md`, so
  the deployed product bytes represent the candidate product code.

## Release artifacts

GitHub release `v0.1.1` exists. All five matrix jobs succeeded: Linux,
Windows, macOS Intel, macOS Apple Silicon, and checksums. Assets include both
DMGs, AppImage, DEB, Windows setup EXE, `SHA256SUMS`, and `latest.json` with all
platform URLs.

The Windows setup EXE was downloaded independently. Published and computed
SHA-256 both equal
`7a810be5e3a2941765cfe38b2c0f8e3e06d6160c51843188a57ec935596eec5d`.
The hosted shell installer was also run with an isolated `XDG_BIN_HOME`; it
downloaded the 86,718,968-byte AppImage, verified SHA-256
`72ca156a2a5ca126f534194689e56fc77c6c4e93f98c5ca562ddf3c4cedd509e`,
and created the expected `point-and-speak` link. PowerShell execution and real
macOS/Windows installation could not be performed in this Linux worker.

## Scope limitations

- Screen-capture permission prompts and speech audio require real user
  hardware. Under Xvfb the global hotkey and capture command worked, but the
  captured frame contained the recently hidden app window; compositor-specific
  behavior needs a real Linux/macOS/Windows pass.
- The 20-region OCR check used generated representative text regions. A pilot
  on real remote desktop, game, legacy, and canvas screens is still required.

