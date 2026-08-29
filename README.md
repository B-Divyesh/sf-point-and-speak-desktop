# Point & Speak Desktop

Read text from a selected screen region aloud. Point & Speak Desktop is for
low-vision users when screen readers miss text. It reads text in remote
desktops, old software, games, and apps that draw text as images.

The configured shortcut is `Ctrl+Shift+Space`. Draw a region, review the
recognised text, then speak, copy, or pin it. English text-recognition files
ship with the app. Capture, text recognition, speech, copy, and pin work
without an account or supporter license.

Captured images stay on the computer and are not uploaded. Captures and pinned
results stay in memory until the capture window reloads or closes. This is an
assistive utility, not a safety or medical product. Check important text
against the original screen.

## Try the demo

Open the isolated sample directly:

https://point-and-speak-desktop.sociobot.in/?demo=1

The first screen contains three fictional inventory rows as editable text.
Speak, copy, pin, edit, or reset the result. Demo actions do not change saved
license or release data. The demo reloads offline after the first visit.

## Develop

Requirements: Node.js 22, Rust stable, and the
[Tauri 2 system dependencies](https://v2.tauri.app/start/prerequisites/).

```sh
npm ci
npm run dev          # landing site
npm run dev:app      # desktop webview only
npm run tauri dev    # complete desktop app
```

Choose **Load sample region** to test the bundled recognition path without
granting screen-capture permission.

## Test and build

```sh
npm test
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml
npm run typecheck
npm run lint
npm run test:checkout
npm run build        # dist/app and dist/site
npm run build:site   # static deploy output in dist/site
```

Every public product claim and its isolated command are listed in
[`.factory/claims.json`](.factory/claims.json).

## Install and release

Download the current installer from the
[GitHub Releases page](https://github.com/B-Divyesh/sf-point-and-speak-desktop/releases).

Linux:

```sh
curl -fsSL https://point-and-speak-desktop.sociobot.in/install.sh | sh
```

The Linux script checks the downloaded AppImage against its published SHA256
checksum before installing it.

Windows PowerShell:

```powershell
irm https://point-and-speak-desktop.sociobot.in/install.ps1 | iex
```

Maintainers create desktop releases from tags with
`.github/workflows/release.yml`. The static site deploys from `dist/site`.

## Privacy, payment, and policies

The website has no advertising, user tracking, or third-party scripts. The
download page asks GitHub for release data. A supporter license token and its
last verification are stored in browser storage and sent only to Sociobot for
verification.

The optional supporter license costs $19 once and adds two blueprint page
themes. Payment uses Sociobot checkout. The free tools remain available
without a license. Read the live [privacy policy](/privacy) and
[terms](/terms).

## Repository map

- `app/` — Tauri webview and local text recognition
- `src-tauri/` — native screenshot and shortcut core
- `site/` — static landing site and isolated demo
- `public/tesseract/` — bundled recognition worker, WASM core, and English data
- `.factory/` — brief, design thesis, claims, copy audit, demo notes, and handoff

The project is MIT licensed. Generated artwork provenance is recorded in
[`.factory/design.md`](.factory/design.md).
