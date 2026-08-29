# Point & Speak Desktop — independent verification 6 handoff

## Status

**FAIL — one release-blocking accessibility defect remains.**

Tested candidate:
`e30e9298488fd07d5eb5ee7b062b447bedf66be6`

Tested production URL:
`https://point-and-speak-desktop.sociobot.in`

Full report: `.factory/verification-6.md`

## Release blocker

### P1 — undersized homepage privacy target

At 390×844, **Read the privacy note** measures 223.73×21 CSS px. The attached
accessibility and design contracts require all touch/click targets to be at
least 44×44 CSS px. The current regression test scans selected header, footer,
and demo targets rather than all visible interactive elements.

Repair the link's hit area and extend the automated mobile target scan to all
visible links, buttons, inputs, and selects. Do not release until the link is
at least 44 px high at 390 px and the full suite passes.

## What passed

- All 19 declared claim assertions pass after the documented Tauri system
  prerequisites are installed.
- Cold first read passes at desktop and 390 px: job, audience, first action,
  three facts, and one-click seeded demo are all in the first viewport.
- `npm test`: 12 Vitest and 91 Playwright passed; 1 intentional duplicate
  installer check skipped.
- TypeScript, strict Clippy, Rust format, 2 Rust tests, dependency audit, and
  the exact production build pass.
- The desktop flow passes local OCR, 0.5×/2× speech, copy and copy recovery,
  pin/remove, blank and too-small recovery, reload clearing, same-origin
  privacy, keyboard, responsive layout, and repaired hover contrast.
- Fresh OCR pilot: 20/20 representative regions usable under two seconds;
  maximum 241 ms after 705 ms model startup.
- Live routes have correct semantics and titles, no overflow, and zero axe
  serious/critical findings in light and dark modes. Keyboard focus, reduced
  motion, and 200% text resize pass apart from the target defect above.
- Demo requests stay same-origin, demo storage is isolated, and offline reload
  works through `point-speak-v6`.
- License API allowance is 30 requests; request 31 returns 429 with
  `Retry-After: 4`.
- Security headers, CSP, cache policy, and page error checks pass.
- Lighthouse: 98 performance, 100 accessibility, 100 best practices, 100 SEO;
  LCP 1.20 s, TBT 171.5 ms, CLS 0, 51,182 bytes transferred.
- Live HTML, JS, CSS, 404, service worker, and hero bytes exactly match the
  candidate build.
- Release `v0.1.5` has all Linux/Windows/macOS assets and valid manifests.
  The Linux installer and checksum pass; the AppImage remained running through
  a 12-second Xvfb probe.

## Reproduce

```sh
npm ci
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf libx11-dev libxrandr-dev libdbus-1-dev
npm test
npm run typecheck
npm run lint
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml
npm audit --omit=dev --audit-level=high
npm run build
```

For the blocker, open `/` at 390×844 and measure the bounding box of the
**Read the privacy note** link. Evidence is in
`.factory/evidence/verification-6/qa-summary.json`.

## Evidence

- `.factory/verification-6.md`
- `.factory/evidence/verification-6/qa-summary.json`
- `.factory/evidence/verification-6/ocr-pilot.json`
- `.factory/evidence/verification-6/lighthouse.json`
- `.factory/evidence/verification-6/verify-url/`

## Known platform boundaries

Real physical displays remain necessary to observe OS capture permission
prompts, audible system voices, multi-display behavior, macOS notarization,
and Windows Authenticode behavior. macOS and Windows packages are unsigned as
disclosed.

## Needs operator action

After the P1 repair passes independent verification, provide Apple notarization
and Windows Authenticode credentials when signed installers are required. The
workflow expects `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX`.
