# Point & Speak Desktop verification handoff

## Result: FAIL

Independent QA on 2026-08-28 tested candidate
`fc39728a4ed0d875f1fa2571b2940bee649cc0c5` and
`https://point-and-speak-desktop.sociobot.in`.

Do not release this candidate. The live `$19` checkout returns HTTP 404; the
released desktop app renders a hidden canvas and pushes Capture screen and Load
sample region below its default and minimum windows; dark mode has serious
contrast failures; and the claims manifest does not cover all relied-on
landing/README claims. Full evidence is in `.factory/verification.md`.

## What passed

- All eight exact claim commands passed after `npm ci`, on desktop and mobile.
- Full suite: 4 Vitest and 30 Playwright tests passed.
- `npm run build` produced `dist/app` and `dist/site`.
- Rust format, test, and strict clippy checks passed after installing the
  workflow's declared Linux packages.
- The published AppImage launches, the global shortcut invokes capture, and
  its bundled sample completes OCR after scrolling to the hidden action.
- A 20-image synthetic OCR run produced 20/20 usable results under two seconds.
- Light-theme axe scans, keyboard flow, reduced motion, 390px layout, offline
  reload/update, console checks, privacy network interception, security
  headers, caching, and bundle budgets passed.
- Mobile Lighthouse: 93 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.1s and CLS 0.
- Live JS/CSS hashes match the candidate build.
- Release `v0.1.1` has successful Linux, Windows, macOS Intel, macOS ARM, and
  checksum jobs. The downloaded Windows EXE and isolated shell install matched
  published checksums.
- Verification API rate limiting passed: a 240-request burst returned 32 HTTP
  200 and 208 HTTP 429 responses; all 429s had `Retry-After`.

## Defects to fix before re-verification

1. Register/enable the billing product so the advertised checkout stops
   returning 404, then test purchase, return-token storage, verification,
   restore, and revocation end to end.
2. Restore true `[hidden]` behavior in the app so first-run actions are visible
   without scrolling at 1180x820 and 390x640, and keep hidden controls out of
   keyboard focus.
3. Fix every dark-theme contrast violation and add dark-mode axe coverage.
4. Add claim entries/tests for the global shortcut, actual app privacy and
   retention, free-core behavior, and checksum installers. Tests must exercise
   the desktop path rather than only the canned web demo.
5. Make `npx tsc --noEmit -p tsconfig.json` pass and expose it as a script.
6. Increase all interactive targets to at least 44px, including site links and
   the app speed range.
7. Offer explicit Intel and Apple Silicon macOS downloads.
8. Return HTTP 404 for unknown routes and handle empty demo speech as an error.

## Re-run

```sh
npm ci
npm test
npx tsc --noEmit -p tsconfig.json
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
npm run build
```

Then repeat live light/dark axe scans, checkout and rate-limit checks, offline
reload/update, installer checksums, and first-run AppImage verification.

## Operator action still required

- Enable the `$19` Sociobot product/checkout.
- Add macOS and Windows signing when certificates are available. Expected
  secrets remain `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`,
  `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`,
  `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD`.
- Run real-hardware screen capture, permission, speech, and installer passes on
  Linux, macOS Intel/ARM, and Windows.
