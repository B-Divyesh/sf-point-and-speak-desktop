# Point & Speak Desktop repair handoff

## Result: PASS

Release-blocking findings from independent verification commit `4a0e6d5` of
candidate `fc39728` are repaired. Product code is at `5446ce0`; the static site
is deployed at `https://point-and-speak-desktop.sociobot.in`.

## Repairs

- Restored native `[hidden]` behavior and tightened the app's minimum-window
  layout. Capture and sample actions now fit at 1180x820 and 390x640, and the
  hidden canvas is absent from the keyboard order.
- Reworked dark palette contrast and 44px targets. Axe now reports no serious
  or critical issue across all routes, themes, and tested viewports.
- Registered and enabled the exact `$19 USD` one-time Sociobot product. The
  checkout now creates a hosted Dodo session through the required Sociobot
  endpoint. No provider key or direct provider integration entered this repo.
- Expanded `.factory/claims.json` from 8 to 13 claims. Each claim has exactly
  one tagged regression. The privacy, retention, and free-core claims now run
  through the real app OCR path instead of only the web sample.
- Added checksum installer regressions with a real local release fixture:
  Linux verifies acceptance and tamper rejection; Windows runs the equivalent
  PowerShell test in its release job.
- Added TypeScript and strict Rust lint scripts and fixed their configuration.
- Split Apple Silicon and Intel macOS downloads and assert their exact assets.
- Added a deployed 404 document and response override. Unknown URLs now return
  HTTP 404 while `/demo`, `/privacy`, and `/terms` remain reloadable deep links.
- Empty demo speech now reports an actionable error and never calls speech.
- Corrected SPA focus so the skip link is first on cold load and route/back
  transitions focus the new page heading.
- A returned license is always verified fresh. Restore and revocation tests
  prove paid themes relock without affecting the free core.

## Clean verification

Run from `/work/repo`:

```sh
npm ci
npm test
npm run typecheck
npm run lint
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo test --manifest-path src-tauri/Cargo.toml
npm run build
npm audit --omit=dev --audit-level=high
npm run test:checkout
```

Observed results on 2026-08-28 UTC:

- `npm ci`: 78 packages; 0 vulnerabilities.
- `npm test`: 7 Vitest checks and 69 Playwright checks passed; one redundant
  mobile repetition of the host installer test was intentionally skipped.
- Browser coverage includes the app shell and site at desktop and 390px,
  keyboard navigation, light/dark axe, touch targets, offline/update, license
  return/restore/revocation, real-app OCR privacy and retention, and installer
  checksum rejection.
- TypeScript, `cargo fmt`, strict `cargo clippy -D warnings`, one Rust unit test,
  bin tests, and doc tests passed. The `screenshots` dependency emits only a
  future-compatibility notice.
- `npm run build` produced `dist/app` and `dist/site`. App JS is 12.72 KiB gzip;
  site JS is 5.99 KiB gzip; site CSS is 3.62 KiB gzip.
- Production dependency audit: 0 vulnerabilities.
- All 13 claim tags occur exactly once. The live checkout claim observed `$19
  USD` and HTTP 303 to `https://checkout.dodopayments.com/session/<redacted>`.

## Desktop package evidence

- `npm run tauri build -- --bundles deb` produced the 0.1.2 DEB (9,323,598
  bytes). Package metadata, bundled executable, and dynamic libraries passed
  inspection; `ldd` reported no missing library.
- The packaged Linux app stayed alive for the eight-second Xvfb smoke window.
  Local package SHA-256:
  `d81b7f0d3ddd28773be96ea3b8434bea44037e044689ce0e5f4f2cce0a12aa53`.
- The Rust shortcut regression asserts the registered native accelerator is
  exactly `Ctrl+Shift+Space`.

## Deployed browser and policy evidence

- `/opt/fleet/lib/verify-url.sh`: HTTP 200, title, `lang=en`, one `h1`, `main`,
  complete alt text, and zero browser console/page errors; cold load was 812ms.
- Live axe: zero serious/critical issues on `/`, `/demo`, `/privacy`, and
  `/terms` in light and dark themes at desktop and 390px. The real 404 also has
  zero serious/critical issues at 390px dark.
- Response codes: `/`, `/demo`, `/privacy`, `/terms` = 200;
  `/missing-sheet` = 404. CSP, HSTS, `nosniff`, referrer policy, and permissions
  policy are present.
- Live 390px demo capture/pin emitted only same-origin requests. Cache
  `point-speak-v2` installed, update resolved, and `/demo` reloaded offline.
  Mobile width, first-tab skip link, keyboard route activation, and Back focus
  passed.
- Live invalid-license policy returned HTTP 200, `valid:false`, `reason:invalid`,
  `Cache-Control: no-store`, and the exact product-origin CORS header. Checkout
  returned the required hosted-session redirect. The verifier's existing
  rate-limit evidence remains applicable because no gateway policy changed.
- Live JavaScript SHA-256 equals `dist/site`:
  `13af7f8924abc2ec93bd1dd8750057f7efabc45f086d09c4874d509a33718217`.
  Live CSS SHA-256 equals `dist/site`:
  `23f819d2191e4978cb9558ec8d373d69f99bfc665bf5d0d67b984dc73a225796`.
- Live mobile Lighthouse: performance 99, accessibility 100, best practices
  100, SEO 100; FCP 0.9s, LCP 1.7s, TBT 60ms, CLS 0.

## Release evidence

Release `v0.1.2` is built by GitHub Actions from commit `5446ce0` for Linux,
Windows, macOS Intel, and macOS Apple Silicon. All five jobs, including the
checksum job and the Windows PowerShell installer regression, passed in run
`33180357456`. Assets are an AppImage, DEB, Windows setup EXE, Intel DMG, Apple
Silicon DMG, `SHA256SUMS`, and valid `latest.json`.
- The published 9,324,478-byte DEB was downloaded independently. Its computed
  and published SHA-256 both equal
  `389f1a451c487b58d4296b9858d5860a9bbcab7d551a0d7d615a0a1712de1fdd`.
- A fresh live browser resolved Linux, Windows, macOS Apple Silicon, and macOS
  Intel selectors to their exact `v0.1.2` platform assets.

## Known gaps and operator action

- macOS and Windows packages are unsigned until the owner supplies
  `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`, `APPLE_SIGNING_IDENTITY`,
  `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`, `WINDOWS_CERT_PFX`, and
  `WINDOWS_CERT_PASSWORD`.
- Permission prompts, audible speech, and compositor-specific screen capture
  still need real-hardware smoke passes on Linux, macOS Intel/ARM, and Windows.
  Automated app, Xvfb, package, and platform-CI coverage passed.
- No real-money purchase was made. Hosted checkout identity is live; token
  return, storage, verification, restore, and revocation are covered with
  deterministic gateway fixtures to avoid a paid transaction in CI.
