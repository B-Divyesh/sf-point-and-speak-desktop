# Point & Speak Desktop — verification 5 handoff

## Status

**FAIL — do not release candidate
`a61c71236936b84c3b770fcbccbcbeb8ce4eaa4e`.**

Independent QA on 2026-08-29 found one release-blocking accessibility defect
in the desktop app. The primary **Capture screen** and **Speak text** buttons
become dark text on a dark background when hovered. Axe measured **Capture
screen** at 1.11:1 and the populated **Speak text** state at 1.49:1 rather than
the required 4.5:1, rating both serious. See `.factory/verification-5.md` and
`.factory/evidence/verification-5/app-result-contrast.png`.

No product code was changed during verification.

## Required repair

Preserve an accessible foreground/background pair for `.tool--primary` in
every interaction state. Add an axe scan after loading/recognising sample text
and hovering the primary action. Rebuild, publish new installers, redeploy if
site identity changes, and rerun all claims and verification.

## What passed

- All 19 commands in `.factory/claims.json` pass after `npm ci` and the Linux
  Tauri prerequisites.
- `npm test`: 12 Vitest passed; 89 Playwright passed; one intentional duplicate
  skipped.
- Typecheck, strict lint/Clippy, Rust formatting, two native tests, production
  audit, and `npm run build` pass.
- The first-read and one-click populated demo gates pass.
- Live demo behavior, empty-input recovery, keyboard use, reduced motion,
  320/390 px reflow, touch targets, privacy request log, storage isolation,
  policy routes, metadata, links, 404, service-worker update, and offline
  reload pass.
- Live invalid-license handling calls only GitHub/Sociobot, strips the token,
  stores the documented keys, and leaves the free core available.
- Sociobot verification rate limiting allows 30 requests, then returns 429
  with `Retry-After: 4`.
- A fresh 20-region OCR pilot passed 20/20; model startup was 923 ms and the
  slowest recognition was 268 ms.
- Mobile Lighthouse: 94 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; FCP 0.9 s, LCP 1.9 s, CLS 0, total transfer 50 KiB.
- The live site matches `dist/site` byte for byte for HTML, CSS, JS, 404, and
  service worker.
- Release `v0.1.4` has five platform installers plus checksum/manifest/
  provenance files. The live Linux installer produced an AppImage whose digest
  matches the published SHA256 exactly.

## Reproduce

```sh
npm ci
npm test
npm run typecheck
npm run lint
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml
npm run build
npm audit --omit=dev --audit-level=high
```

Run the verifier evidence scripts after serving the production app at
`http://127.0.0.1:4174`:

```sh
node .factory/evidence/verification-5/live-qa.mjs
node .factory/evidence/verification-5/app-qa.mjs
node .factory/evidence/verification-5/ocr-pilot.mjs
node .factory/evidence/verification-5/link-qa.mjs
node .factory/evidence/verification-5/license-live.mjs
node .factory/evidence/verification-5/rate-limit.mjs
```

`app-qa.mjs` intentionally exits nonzero while the serious contrast defect is
present. The direct demo is
`https://point-and-speak-desktop.sociobot.in/?demo=1`.

## Remaining platform boundary

Real hardware is needed for OS capture prompts, audible voices, and
multi-display behavior. macOS and Windows packages remain unsigned pending the
operator's signing credentials.
