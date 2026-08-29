# Independent product verification — third pass

## Verdict: FAIL

Candidate `3680f2f22c21719c1df309943971fd2052ed2f4e` is not ready for
release. Verification ran on 2026-08-29 UTC against the clean candidate
checkout and `https://point-and-speak-desktop.sociobot.in`.

The claims, first-read/demo gate, core local OCR flow, checkout, static live
deployment, tests, build, privacy checks, accessibility scans, rate limiting,
and performance checks pass. The candidate still fails the desktop artifact
contract: the installers linked by the live site were built from older commit
`5446ce035d5ff013662c961ccec4284df9451fac`, not from this candidate. A mobile
touch target also misses the required 44 by 44 CSS pixel minimum.

No product code was modified during verification.

## Release-blocking findings

### P1 — Published desktop installers are not builds of the candidate

The latest release is `v0.1.2`. GitHub Actions run `33180357456` built it
successfully for Linux, Windows, macOS Intel, and macOS Apple Silicon, but the
run reports this source identity:

```text
head_sha    5446ce035d5ff013662c961ccec4284df9451fac
head_branch v0.1.2
candidate   3680f2f22c21719c1df309943971fd2052ed2f4e
```

The difference is not documentation-only. Changes after the release tag touch
the shipped desktop product:

```text
app/extra.css
app/index.html
src-tauri/Cargo.toml
src-tauri/src/lib.rs
src-tauri/tauri.conf.json
```

For example, the candidate changes the capture-window wording, control sizing,
package description, and claim-labelled shortcut test. The downloaded DEB
still exposes the old package description:

```text
Version: 0.1.2
Description: Read any screen region aloud
 Select text in remote desktops, games, canvas interfaces, and legacy software…
```

The candidate instead declares “Read selected screen text aloud” and “visual
app interfaces, and old software.” The public workflow history contains no
release run for candidate `3680f2f`. The website therefore offers real,
checksum-valid installers, but they do not represent the candidate under
review. This violates the desktop release and candidate-identity gates.

Required recovery: bump the desktop version, tag the candidate product state,
let the release workflow publish all four platform builds plus checksums and
`latest.json`, then verify a downloaded artifact against that candidate.

### P2 — Mobile footer “Terms” target is narrower than 44 CSS pixels

At a 390 by 844 viewport, the visible footer `Terms` link measures
`38.3 × 44` CSS pixels. The attached accessibility and design contracts require
every touch target to be at least `44 × 44`. Existing coverage checks target
height only, so the suite does not catch this width failure. Other short inline
links were excluded because they are embedded in prose; this footer item is a
standalone navigation target.

## Mandatory gates

### Claims-first gate

`.factory/claims.json` exists and declares 18 claims. After `npm ci`, every
listed command was executed independently. The native shortcut command first
stopped at the container boundary because the clean worker lacked
`glib-2.0.pc`. After installing the exact Tauri Linux prerequisites declared in
`.github/workflows/release.yml`, the same command passed. No product assertion
failed.

| Claim | Exact command | Final result |
| --- | --- | --- |
| `selected-region-speech` | `npm test -- --grep @claim:selected-region-speech` | PASS — 2 Playwright projects |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS — 2 projects |
| `speech-speed` | `npm test -- --grep @claim:speech-speed` | PASS — 2 projects |
| `pin-result` | `npm test -- --grep @claim:pin-result` | PASS — 2 projects |
| `demo-ready` | `npm test -- --grep @claim:demo-ready` | PASS — 2 projects |
| `no-demo-storage` | `npm test -- --grep @claim:no-demo-storage` | PASS — 2 projects |
| `capture-memory` | `npm test -- --grep @claim:capture-memory` | PASS — 2 projects |
| `configured-shortcut` | `cargo test --manifest-path src-tauri/Cargo.toml claim_configured_shortcut_is_ctrl_shift_space` | PASS — 1 native test |
| `account-free-core` | `npm test -- --grep @claim:account-free-core` | PASS — 2 projects |
| `linux-checksum-installer` | `npm test -- --grep @claim:linux-checksum-installer` | PASS — 1 host test; duplicate mobile project intentionally skipped |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS — 2 projects |
| `bundled-recognition` | `npm test -- --grep @claim:bundled-recognition` | PASS — 2 projects |
| `supporter-themes` | `npm test -- --grep @claim:supporter-themes` | PASS — 2 projects |
| `license-storage` | `npm test -- --grep @claim:license-storage` | PASS — 2 projects |
| `website-no-tracking` | `npm test -- --grep @claim:website-no-tracking` | PASS — 2 projects |
| `release-request` | `npm test -- --grep @claim:release-request` | PASS — 2 projects |
| `mit-license` | `npm run test:unit -- --testNamePattern @claim:mit-license` | PASS — 1 Vitest assertion |
| `checkout-live` | `npm run test:checkout` | PASS — USD 19 and HTTP 303 to hosted Dodo checkout |

Live copy and README statements were cross-checked against the manifest. No
additional unlisted product claim was found.

### First-read and one-click demo

PASS at cold desktop and 390-pixel mobile loads.

- What it does: “Read selected screen text aloud.”
- Who it serves: low-vision desktop users whose screen reader misses remote,
  old, game, or visual application interfaces.
- First action: “Try it with sample data,” with the adjacent result “See an
  editable result at once.”
- Three first-screen facts state local image handling, bundled offline English
  recognition files, and the free-core/$19-once price.

The sample action is visible without scrolling and opens an already populated,
editable result in one click. The persistent demo banner states that sample
data is not saved and provides Reset demo and Start for real.

## End-to-end product evidence

The candidate desktop webview was exercised through its shipped local sample
and recognition assets:

- Both first-run actions are inside the configured 1180×820 window and the
  supported 390×640 minimum. The hidden capture canvas computes to `display:
  none` and is skipped by keyboard focus.
- The browser-only capture failure says the screen could not be captured and
  tells the user to allow screen recording, after which Load sample region
  provides a working recovery path.
- A deliberately tiny pointer selection returns “That region is too small”
  and tells the user to drag a larger rectangle.
- Keyboard Enter on the sample region produced four useful inventory rows,
  excluded the sample header, and showed the editable result in 1,379 ms from
  a cold app page.
- Speech received the recognised text at both boundary speeds, 0.5× and 2×.
  Copy received the same text. Pin/remove worked. Reload removed the capture,
  result, and pin, with no browser-storage keys created.
- The complete app flow made only same-origin requests and produced no console
  or page errors. App axe scanning found no serious or critical issue.
- A fresh 20-region synthetic pilot varied sans/serif/monospace type, 20–34 px
  sizes, light/dark/low-contrast surfaces, identifiers, amounts, paths, dates,
  times, percentages, and multiline text. Using the shipped English model and
  worker, 20/20 reached at least 0.70 normalized similarity in under two
  seconds; maximum recognition time after worker startup was 198 ms.

The live demo independently passed edit, reset, pin/remove, empty-input error,
and speech-rate boundary checks. Its request log was same-origin only. Real
license/release storage sentinels remained unchanged and no `demo:` key was
created.

## Repository quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 78 packages, 0 audit findings |
| `npm test` | PASS — 10 Vitest and 87 Playwright; 1 intentional duplicate skip |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — TypeScript plus strict `cargo clippy -D warnings` |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — unit, binary, and doc targets |
| `npm run build` | PASS — exact production build creates `dist/app` and `dist/site` |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |

Rust reports a future-compatibility notice in third-party crate
`screenshots 0.8.10`; it does not fail the current build or strict lint gate.

Build budgets pass:

```text
site JS       19,310 bytes raw / 6.57 KiB gzip
site CSS      14,305 bytes raw / 4.08 KiB gzip
mobile hero   16,180 bytes
desktop JS    36.31 KiB raw / 12.72 KiB gzip
desktop CSS    3.78 KiB raw / 1.51 KiB gzip
fonts          no download
```

## Live deployment, accessibility, privacy, and PWA

- `verify-url.sh` passed with HTTP 200, the correct title, `lang=en`, one `h1`,
  a main landmark, complete image alt text, labelled buttons, and no console or
  page errors on the home page. Its cold load completed in 1,111 ms.
- Fresh axe WCAG A/AA scans found zero serious/critical findings on `/`,
  `/?demo=1`, `/demo`, `/privacy`, `/terms`, and the designed 404 in desktop
  and 390-pixel mobile viewports under both light and dark themes.
- Every checked route had one `h1`, a main landmark, correct route title, and
  no horizontal overflow. The unknown route returned HTTP 404. Chromium logs
  its expected failed-document message for that deliberate 404; no application
  exception occurred.
- Keyboard first Tab focuses the skip link with a visible `3px` solid outline.
  Demo navigation works with Enter; browser Back restores focus to the home
  `h1`. Reduced motion yields `scroll-behavior: auto`, zero active animations,
  and zero active transitions.
- The service worker installed cache `point-speak-v3`, accepted an update
  check, removed the old cache in the automated suite, and restored the seeded
  demo during an offline reload.
- Home-page requests were limited to the product origin and the documented
  GitHub releases API. Demo requests were product-origin only. No analytics,
  third-party scripts/fonts, raw Azure endpoint, embedded key, or cloud OCR
  request was found.
- Browser response headers include CSP with `frame-ancestors 'none'`, HSTS,
  `nosniff`, strict referrer policy, and a restrictive permissions policy.
  HTML and the service worker revalidate after 30 seconds; hashed JS/CSS and
  recognition files use one-year immutable caching.
- An invalid license returned `{valid:false, reason:"invalid"}`, product-origin
  CORS, and `Cache-Control: no-store`. A concurrent burst of 50 invalid verify
  calls accepted 30 and limited 20 with HTTP 429; every 429 included
  `Retry-After: 4`. The observed allowance is 30 requests per burst window.
- Checkout returned HTTP 303 to an HTTPS `checkout.dodopayments.com` session.
  No sign-in flow exists, so Entra tenant verification is not applicable.

Fresh mobile Lighthouse results:

```text
Performance 95  Accessibility 100  Best Practices 100  SEO 100
FCP 1.0 s      LCP 1.2 s           TBT 260 ms           CLS 0
Transfer 50 KiB; INP not measurable in a non-interactive lab navigation
```

## Static deployment identity

The deployed website does match the candidate production build byte-for-byte:

```text
index.html                    2d57781f1b673224077bc43e8e7ad7793a8fae6ec3c9254d45329beb4e955b7e
assets/index-tFVu1eFT.js      056eb6dfd4519d3049c28af83a9f4e4effa307176c0eb240fa2a0da782b9cf7f
assets/index-BamLoIMC.css     f069a2b8e949e9ba3d24f6a77d6d42963f02152abbb9ef7102c5f2dac1028e1e
sw.js                         c2318043ccdcb3b44225e8fca5941b0b8d7db8ca16b13edd508db9a935eae4e4
```

Local and live SHA-256 values were identical for all four files. This static
match does not cure the older desktop installers described in the P1 finding.

## Release artifact evidence

The existing `v0.1.2` release is internally healthy but stale relative to the
candidate. It contains AppImage, DEB, Windows setup EXE, Apple Silicon DMG,
Intel DMG, `SHA256SUMS`, and valid per-platform `latest.json`. All five workflow
jobs succeeded for commit `5446ce0`.

The AMD64 DEB was independently downloaded. Its computed and published
SHA-256 values match:

```text
389f1a451c487b58d4296b9858d5860a9bbcab7d551a0d7d615a0a1712de1fdd
```

The hosted Linux installer was run with an isolated `XDG_BIN_HOME`. It
downloaded the 86,727,160-byte AppImage, verified SHA-256, and created the
expected `point-and-speak` link. Live OS detection resolves distinct working
links for Windows, Linux, macOS Apple Silicon, and macOS Intel. These checks
prove that the old release is downloadable, not that it contains the candidate.

## Scope limitations

- Real hardware is still required to observe macOS/Windows/Linux permission
  dialogs, audible system speech, and compositor-specific multi-display
  capture behavior. Browser-level failure/recovery and the local recognition
  path were exercised here.
- Windows and macOS installation could not be executed in this Linux worker.
  The public workflow jobs succeeded, but their outputs belong to the older
  release commit.
- Published macOS and Windows artifacts are unsigned, as already disclosed.

