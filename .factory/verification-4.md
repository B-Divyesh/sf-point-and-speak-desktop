# Independent product verification — fourth pass

## Verdict: PASS

Candidate `cb911aaf2c52f7ee18afe2dc80349718882936eb` passes independent
verification on 2026-08-29 UTC. The deployed static site at
`https://point-and-speak-desktop.sociobot.in` is byte-for-byte the candidate's
production site build. The current desktop release is `v0.1.3`; its source is
`b1346c821dd91b05275db4caddf48471eb232bd9`, and the only changes from that
tag to this candidate are factory handoff/evidence files. Thus its five
published installers represent the candidate's product code.

No product code was modified during verification.

## Claims-first gate

`.factory/claims.json` exists with 18 claims. After `npm ci`, every command in
the manifest was executed exactly as written. All browser, installer, checkout,
and unit claims passed. The native shortcut command initially could not compile
in the bare container because `glib-2.0.pc` was absent. That is a documented
Tauri system prerequisite (also installed by the release workflow); after
installing those exact packages, the same exact command passed. No claim
assertion failed.

| Result | Claims |
| --- | --- |
| PASS | `selected-region-speech`, `local-only`, `speech-speed`, `pin-result`, `demo-ready`, `no-demo-storage`, `capture-memory`, `account-free-core`, `linux-checksum-installer`, `offline-reload`, `bundled-recognition`, `supporter-themes`, `license-storage`, `website-no-tracking`, `release-request` |
| PASS | `configured-shortcut` — native test after the documented Tauri prerequisites |
| PASS | `mit-license`, `checkout-live` — live checkout reported USD 19.00 and HTTP 303 to hosted Dodo checkout |

## First-read and end-to-end result

Cold live load answers all mandatory questions in plain words:

- It reads selected screen text aloud.
- It is for low-vision desktop users when screen readers miss text in remote,
  legacy, game, or visual interfaces.
- The first action is **Try it with sample data**, and it says an editable
  result appears at once without touching real data.

The action is visible on the first screen and opens `?demo=1` in one click with
realistic editable inventory rows, Speak, Copy, Pin, and speech-speed controls.
The persistent banner says sample data is not saved and supplies Reset demo and
Start for real.

On the live demo at desktop and 390 px, I exercised editable normal text,
speech speed 1.5, pin/remove, reset, keyboard navigation, and a blank result.
Blank text yields the announced recovery: “There is no text to speak. Restore
the sample result first.” The sample replay restores it. There was no horizontal
overflow, visible focus was a 3–4 px outline, reduced-motion mode had no active
animation/transition, and all visible standalone controls met 44 px targets.

## Quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 78 packages; 0 audit findings |
| `npm test` | PASS on confirmation run — 12 Vitest, 89 Playwright; 1 intended skip |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS after Tauri prerequisites — strict Clippy warnings enabled |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 1 native test |
| `npm run build` | PASS — creates `dist/app` and `dist/site` |
| production site budget | PASS — 19.31 kB JS / 6.57 kB gzip; 14.36 kB CSS / 4.09 kB gzip |
| fresh mobile Lighthouse | PASS — Performance 98, Accessibility 100, FCP 1.0 s, LCP 1.2 s, CLS 0, transfer 50 KiB |

One initial complete `npm test` run had a single timeout in the untagged
demo-speech test (`tests/site.spec.ts:100`): the test's injected speech stub
was not observed. A focused 3× repeat across both Playwright projects passed
all 6 cases, and a second complete run passed 89/89. This is recorded below as
a low-severity test-stability observation, not evidence of a reproduced product
failure.

## Live privacy, security, accessibility, and PWA

- Cold homepage requests were the document, same-origin CSS/JS/image, and the
  documented GitHub release API request only; no console or page error occurred.
- The complete live demo flow made same-origin requests only. It did not call
  GitHub, Sociobot, recognition services, or analytics.
- Axe found zero serious or critical findings on `/`, `/?demo=1`, `/privacy`,
  `/terms`, and the designed 404 at desktop and 390 px. Each normal route has
  one `h1`, one `main`, and a route-specific title. The browser's expected
  failed-document console message on an intentional HTTP 404 was the only 404
  console entry.
- Headers include HSTS, `nosniff`, strict referrer policy, restrictive
  Permissions-Policy, and CSP with only self, GitHub API, and Sociobot API as
  applicable connections. Hashed JS is cached immutable for one year; the
  document and service worker use 30-second revalidation.
- The live service worker `point-speak-v4` controlled the page and restored the
  seeded demo successfully after an offline reload.
- The product has no first-party server endpoint or sign-in. Its only runtime
  product service is Sociobot license verification. Freshly sending 35 invalid
  verification requests from one client produced 30 HTTP 200 responses, then
  five HTTP 429 responses; each 429 had `Retry-After: 4`. Observed allowance:
  30 requests per burst window. CORS was limited to the product origin.

## Candidate/deployment/release identity

The live `index.html`, CSS, and JS SHA-256 values exactly equal the new local
`dist/site` output:

```text
index.html                    c87f2b93536e341a7b6728656d520d4ecdbc72ea016fbfa54562898760c64d0c
assets/index-B-NvNVXz.css     b22bfa3c53a753e4196e6a7214ab2388be232e2e14f84333dd1dad20ea095422
assets/index-B6dQAZLL.js      5064cc55e5163728e08963211001d7976a95be39849ac76f93823a5dd481c07f
```

GitHub release `v0.1.3` contains AppImage, DEB, Windows setup EXE, Intel DMG,
Apple-Silicon DMG, `SHA256SUMS`, `latest.json`, and `PROVENANCE.json`. I
downloaded the AMD64 DEB and got
`eeb877fdcd6b3a1773f849381f7a932cf9d5d9c1b60efe9ffe45001910f8b5a1`,
matching the published checksum and provenance.

## Defects and follow-up

### P3 — one observed browser-test flake

The first full parallel suite timed out waiting for the demo speech shim in an
untagged test; immediate focused repeats and a full rerun passed. Stabilise the
test setup before making it a release gate (for example, assert the injected
speech API is installed before clicking). This did not reproduce in the product
and does not block this candidate.

### Known operational limits

Real hardware remains necessary to observe OS screen-capture permission,
audible device voices, and compositor-specific multi-display behavior. macOS
and Windows artifacts are unsigned pending the operator's signing credentials.
