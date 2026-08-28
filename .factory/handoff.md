# Point & Speak Desktop handoff

## What shipped

- Tauri 2 desktop app for Windows, macOS, and Linux.
- `Ctrl+Shift+Space` global shortcut, all-display capture, drag selection, local
  English OCR, editable result, device speech, copy, pin, and speed control.
- First-run sample region that exercises the same bundled Tesseract worker.
- Static product site with OS-aware downloads, one-click sandbox, offline demo,
  privacy, terms, 404 state, and a $19 Sociobot supporter license flow.
- Supporter license restore, daily verification cache, and two page themes.
- Tag-driven GitHub Actions release matrix with checksums and `latest.json`.

## Run and verify

```sh
npm ci
npm test
cargo test --manifest-path src-tauri/Cargo.toml
npm run build
npm run build:site
```

The static deploy command is `npm run build:site`. Its root is `dist/site`,
with `dist/site/index.html` present. The desktop webview builds to `dist/app`.

Verification on 2026-08-28:

- Vitest: 4 passed.
- Playwright: 30 passed across desktop and 390 px mobile Chromium.
- Axe: no serious or critical findings on `/`, `/demo`, `/privacy`, `/terms`,
  or the designed 404 route.
- Rust: library, binary, and doc test targets passed.
- Native sample smoke test: bundled OCR returned all four inventory rows.
- `verify-url.sh`: HTTP 200, no console errors, one `h1`, `lang`, `main`, and
  complete image alt text.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.4 s, TBT 30 ms, CLS 0.
- Site bundles: 5.90 KB JavaScript gzip and 3.50 KB CSS gzip. Mobile hero is
  16 KB WebP; the largest hero source is 107 KB WebP.
- Local evidence: `/work/.evidence/point-and-speak/`.
- Release `v0.1.1` completed on all four runners. Assets include Apple Silicon
  and Intel DMGs, Linux AppImage and DEB, and a Windows NSIS setup EXE.
- Downloaded `Point.Speak.Desktop_0.1.1_x64-setup.exe` passed its published
  `SHA256SUMS` entry. Published `latest.json` contains every platform URL.

## Privacy and assets

Screen pixels and OCR stay inside the desktop app. Captures remain in memory.
Only license tokens are sent to Sociobot for explicit license verification.
The generated blueprint illustration is original; prompt and provenance are in
`.factory/design.md` and its source files are in `assets/src/`.

## Known gaps

- The 20-region pilot target needs validation on real workplace screens and
  hardware; the automated sample proves the path, not the 70% field target.
- The `screenshots` Rust dependency reports a future-compatibility warning but
  compiles and tests on the current stable toolchain.

## Needs operator action

- Register the paid product and $19 price in Sociobot billing.
- Add signing to the release workflow when certificates are available. Expected
  secret names: `APPLE_CERTIFICATE`, `APPLE_CERTIFICATE_PASSWORD`,
  `APPLE_SIGNING_IDENTITY`, `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID`,
  `WINDOWS_CERT_PFX`, and `WINDOWS_CERT_PASSWORD`.
- Grant the app screen-recording permission when prompted on macOS and the
  equivalent capture permission on managed desktops.
