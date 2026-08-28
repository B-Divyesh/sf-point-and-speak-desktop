# Point & Speak Desktop

Read any screen region aloud when an app gives your screen reader no useful
text. Point & Speak is for low-vision users working with remote desktops,
legacy software, games, and canvas-heavy interfaces.

Press `Ctrl+Shift+Space`, drag around text, then speak, copy, or pin the editable
result. English OCR files ship with the app. Speech uses the computer's voice.
Captures are not retained by default.

This is an assistive utility, not a safety or medical product. Check important
names, numbers, instructions, and warnings against the original screen.

## Try the sandbox

Open `/demo` or visit:

https://point-and-speak-desktop.sociobot.in/demo

Choose the marked sample region. The demo returns three fictional inventory
rows, then lets you speak, copy, or pin them. Demo state stays in memory and is
cleared with **Reset demo**. The demo reloads offline after the first visit.

## Develop

Requirements: Node.js 22, Rust stable, and the
[Tauri 2 system dependencies](https://v2.tauri.app/start/prerequisites/).

```sh
npm ci
npm run dev          # landing site
npm run dev:app      # desktop webview only
npm run tauri dev    # complete desktop app
```

Choose **Load sample region** in the first-run window to test the complete OCR
flow without granting screen-capture permission.

The local desktop build includes Tesseract's Apache-2.0-licensed English fast
model. No OCR service or account is required.

## Test and build

```sh
npm test
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml
npm run typecheck
npm run lint
npm run test:checkout # live $19 catalog and hosted checkout redirect
npm run build        # dist/app and dist/site
npm run build:site   # exact static deploy command; output is dist/site
```

The test suite opens fresh site and app contexts for product claims. It checks
the real bundled OCR path, both color schemes, offline reload, the 390 px
layout, and route semantics. See [.factory/claims.json](.factory/claims.json)
for each claim and its exact command.

## Install and release

Tagged `v*` releases start the GitHub Actions matrix. It builds unsigned macOS
Intel and Apple Silicon DMGs, a Windows MSI or EXE, and Linux AppImage and DEB
files. A final job publishes `SHA256SUMS` and `latest.json`.

The landing page detects the visitor's system and reads the latest release
through the CORS-enabled GitHub API. It offers separate macOS downloads for
Intel and Apple Silicon. When no release exists, it links to the release page
without throwing an error.

After the first tagged release, Linux users can run:

```sh
curl -fsSL https://point-and-speak-desktop.sociobot.in/install.sh | sh
```

Windows PowerShell users can run:

```powershell
irm https://point-and-speak-desktop.sociobot.in/install.ps1 | iex
```

Both scripts verify the release checksum before installing. Pilot installers
are unsigned, so the operating system may ask for confirmation.

## Privacy and payment

The app has no telemetry and no cloud image upload. The optional $19 supporter
license uses Sociobot's hosted checkout and verification API. The free app
keeps capture, OCR, speech, copy, and pin available. See `/privacy` and `/terms`
for the plain-language policies.

## Repository map

- `app/` — Tauri webview and local OCR interaction
- `src-tauri/` — native screenshot and global-shortcut core
- `site/` — static landing site and demo sandbox
- `public/tesseract/` — bundled worker, WASM core, and English OCR model
- `.factory/` — brief, design thesis, claims, copy audit, demo notes, handoff

MIT licensed. Generated artwork provenance is recorded in
[.factory/design.md](.factory/design.md).
