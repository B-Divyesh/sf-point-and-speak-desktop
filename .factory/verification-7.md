# Independent product verification — seventh pass

## Verdict: PASS

Candidate `13a0a4448682752632b0e1963eb3441f9ad64f31` was independently verified
on 2026-08-29 UTC against `https://point-and-speak-desktop.sociobot.in`.
Fresh production output matches the deployed shell byte-for-byte. No product
code was modified during verification.

## Claims-first gate

`.factory/claims.json` exists with 19 claims. After `npm ci`, every listed
test was run before wider QA. The bare worker initially lacked GLib headers for
the native commands; the documented Tauri Linux prerequisites were installed,
then the exact commands passed. This was a verifier environment prerequisite,
not an assertion failure.

| Claim | Result |
| --- | --- |
| `selected-region-speech` | PASS — exact tagged Playwright command |
| `local-only` | PASS — exact tagged Playwright command |
| `speech-speed` | PASS — exact tagged Playwright command |
| `pin-result` | PASS — exact tagged Playwright command |
| `demo-ready` | PASS — exact tagged Playwright command |
| `no-demo-storage` | PASS — exact tagged Playwright command |
| `capture-memory` | PASS — exact tagged Playwright command |
| `capture-on-demand` | PASS — exact native Cargo assertion |
| `configured-shortcut` | PASS — exact native Cargo assertion |
| `account-free-core` | PASS — exact tagged Playwright command |
| `linux-checksum-installer` | PASS — exact tagged Playwright command |
| `offline-reload` | PASS — exact tagged Playwright command |
| `bundled-recognition` | PASS — exact tagged Playwright command |
| `supporter-themes` | PASS — exact tagged Playwright command |
| `license-storage` | PASS — exact tagged Playwright command |
| `website-no-tracking` | PASS — exact tagged Playwright command |
| `release-request` | PASS — exact tagged Playwright command |
| `mit-license` | PASS — exact focused Vitest command |
| `checkout-live` | PASS — USD 19.00; HTTP 303 to Dodo checkout |

The 15 browser claim commands were also rerun in a fail-fast sequence; it
completed successfully. Native assertions then passed individually.

## First-read and demo gate

PASS. A cold live page says **“Read selected screen text aloud”**, names
**low-vision desktop users** whose screen reader misses text in remote
desktops, old software, games or visual app interfaces, and provides
**“Try it with sample data”**. Its adjacent text says: “See an editable result
at once. Your real data stays untouched.” The one-click action opens
`/?demo=1` with realistic editable inventory rows, the persistent **Demo —
sample data, nothing is saved** banner, **Reset demo**, and **Start for real**.
Pin/reset restored the sample; local and session storage stayed empty.

## Functional and quality evidence

- The local desktop-webview selected the bundled sample by keyboard, recognised
  **Seal kit** while excluding **FIELD STOCK**, spoke at 1.5×, copied and
  pinned without an account/license or cross-origin request.
- Blank demo text refuses speech with recovery guidance; capture/pin state
  disappears on reload. Native tests prove no capture at startup or for an
  invalid source, and one capture for each explicit button/shortcut action.
- `npm test` PASS — 12 Vitest and 92 Playwright tests. `cargo fmt --check`,
  `cargo test` (2 native tests), `npm run typecheck`, `npm run lint`,
  `npm run test:checkout`, and `npm run build` all PASS. `dist/app` and
  `dist/site` were produced.
- Site JS is 19,310 bytes raw / 6,570 gzip; CSS is 14,443 bytes raw / 4,110
  gzip; desktop-webview JS is 36,370 bytes raw / 12,750 gzip. These satisfy
  the budgets.

Physical capture permission dialogs, multi-monitor geometry and audible system
voices require a real desktop session and cannot be observed headlessly. The
bundled sample, native capture boundary and release-package checks passed.

## Live privacy, accessibility, PWA and headers

- Valid live `/`, `/?demo=1`, `/privacy`, and `/terms` routes return 200 with
  route-specific titles, one `h1`, `main`, and zero console/page errors. The
  designed missing route returns 404 (its browser failed-document diagnostic is
  expected only for that intentional 404).
- Fresh axe scans on home, desktop demo and 390×844 mobile demo found zero
  serious/critical findings. Keyboard Tab begins at the skip link; inspected
  controls have a visible 3 px focus ring. The full suite confirms all visible
  mobile controls are at least 44×44 px.
- Direct demo requests only same-origin HTML/JS/CSS, does not call billing,
  GitHub, OCR, analytics, trackers or fonts, and writes no storage. Home's only
  external request is the documented GitHub release API.
- The active `/sw.js` service worker accepted `registration.update()` and the
  seeded demo reloaded offline without errors.
- HSTS, nosniff, strict referrer policy, restrictive Permissions-Policy and
  CSP are present. HTML/SW use 30-second revalidation; hashed assets and OCR
  files have one-year immutable caching.
- Invalid Sociobot license verification returned the documented HTTP 200
  invalid response with `Cache-Control: no-store`. The observed allowance is
  30 requests/client; the next request returned 429 with `Retry-After: 3` and
  `X-RateLimit-After: 3`, and recovered after four seconds.

Lighthouse category scores were Performance 98, Accessibility 100, Best
Practices 100 and SEO 100. Playwright Chromium crashed while Lighthouse made
its full-page screenshot, so this report intentionally does not assert numeric
Web Vitals from that run; ordinary browser checks and budgets completed.

## Deployment identity and installer evidence

```text
index.html                    581dfd59c5c789043f5c5b713d1990536ba2c8d8ffaa8110f15d320365d68073
assets/index-C-oYNSVk.js      185b1bc67803227eace1d0e9e556b392b3000042c11020dff1b314ef02c6a36c
assets/index-BW8GBXtD.css     a25a2a5840d01905fa8e627c2d3931872be6af09dbb6ea55dc4bfb74393790eb
sw.js                         d9423896660af56aa1d94b3a3add95d6b92775025e06fe766d1c1d0535109836
```

Each hash is equal in fresh `dist/site` and production. Release `v0.1.5`
contains manifests/checksums, both macOS DMGs, Windows setup EXE, Linux
AppImage and DEB. The downloaded AMD64 DEB matched SHA256SUMS exactly:
`0782f4793b524cc814ee3bd54ca2d759562cec8b5f1b40cbb413b455ce8bf0c3`.
Its metadata is `point-speak-desktop` 0.1.5, `amd64`, “Read selected screen
text aloud”.

## Defects by severity

None. There is no release-blocking, high, medium or low product defect open
for this candidate.
