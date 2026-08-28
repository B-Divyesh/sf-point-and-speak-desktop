# Independent product verification — second pass

## Verdict: PASS

Candidate `cc578e482262ce2405cfa4a20b36cae870ed2df4` passes independent
verification on 2026-08-28 UTC. The deployed static product at
`https://point-and-speak-desktop.sociobot.in` matches the candidate's product
bytes. This candidate differs from release tag `v0.1.2` only in
`.factory/handoff.md`; the released desktop product is therefore the candidate
product code.

No product code was modified during verification.

## Claims-first gate

`.factory/claims.json` exists and declares 13 claims. After `npm ci`, every
declared command was run from this checkout. All claims pass. The native Rust
claim initially could not compile in the bare disposable container because its
documented Tauri GTK/WebKit system prerequisite (`glib-2.0.pc`) was absent.
After installing the same Linux prerequisite set used by
`.github/workflows/release.yml`, it passed; this is an environment prerequisite,
not a product assertion failure.

| Claim | Exact declared test | Result |
| --- | --- | --- |
| `sample-region` | `npm test -- --grep @claim:sample-region` | PASS |
| `local-only` | `npm test -- --grep @claim:local-only` | PASS |
| `speak` | `npm test -- --grep @claim:speak` | PASS |
| `pin-result` | `npm test -- --grep @claim:pin-result` | PASS |
| `no-demo-storage` | `npm test -- --grep @claim:no-demo-storage` | PASS |
| `capture-memory` | `npm test -- --grep @claim:capture-memory` | PASS |
| `global-shortcut` | `cargo test --manifest-path src-tauri/Cargo.toml claim_global_shortcut_is_ctrl_shift_space` | PASS — exactly Ctrl+Shift+Space |
| `free-core` | `npm test -- --grep @claim:free-core` | PASS |
| `checksum-installers` | `npm test -- --grep @claim:checksum-installers` | PASS — matching fixture installed; tampered fixture rejected |
| `offline-reload` | `npm test -- --grep @claim:offline-reload` | PASS |
| `bundled-ocr` | `npm test -- --grep @claim:bundled-ocr` | PASS |
| `supporter-themes` | `npm test -- --grep @claim:supporter-themes` | PASS |
| `checkout-live` | `npm run test:checkout` | PASS — $19 USD and HTTP 303 to hosted Dodo checkout |

The full suite independently repeated the browser claims: 7 Vitest checks and
69 Playwright checks passed; one intentionally duplicate mobile host-installer
check was skipped.

## First read, demo, and core flow

Cold live desktop and 390px mobile loads pass the plain-words gate. The first
screen says “Read any screen region aloud,” names low-vision desktop users
whose remote, legacy, game, or canvas text defeats a screen reader, and offers
the in-viewport action “Try it with sample data” with the adjacent explanation
“See the full capture flow. Nothing is saved.”

The live `/demo` flow produced the fictional inventory OCR rows, allowed pin
and remove, and Reset demo cleared the result. Clearing the text then choosing
Speak gives “There is no text to speak. Read the sample region first.” Demo
localStorage and sessionStorage stayed empty and its observed requests were
same-origin only. Browser app tests separately exercised local sample OCR,
speech, copy, pin, reload retention, and both 1180x820 and 390x640 first-run
layouts.

## Quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 78 packages, 0 audit findings |
| `npm test` | PASS — 7 Vitest; 69 Playwright passed, 1 intentional skip |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — strict `cargo clippy -D warnings` |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — unit/bin/doc targets |
| `npm run build` | PASS — produces `dist/app` and `dist/site` |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |

Production build output: app JS 12.72 KiB gzip; site JS 5.99 KiB gzip; site
CSS 3.62 KiB gzip. The 480px hero is 16,180 bytes. Fresh mobile Lighthouse
reported performance 100, accessibility 100, best practices 100, SEO 100;
FCP 1.1 s, LCP 1.2 s, TBT 0 ms, CLS 0.

## Live deployment, accessibility, privacy, and policies

- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, title, `lang=en`, one `h1`,
  `main`, no images missing alt, no unlabeled buttons, and no console/page
  errors on the landing page (788 ms cold verification load).
- Fresh axe WCAG A/AA scans found zero serious/critical findings on `/`,
  `/demo`, `/privacy`, `/terms`, and the designed 404, in both light and dark
  modes at 390px. There was no horizontal overflow. Keyboard first Tab reaches
  the skip link with a visible `3px` focus outline. Reduced motion resolves to
  `scroll-behavior: auto` and zero active CSS animations.
- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown path returns
  the designed 404 with HTTP 404. Internal navigation links returned their
  expected 200s; no valid product link was dead.
- CSP, HSTS, `X-Content-Type-Options: nosniff`, strict referrer policy, and a
  restrictive permissions policy are live. Hashed JS/CSS and bundled OCR files
  are cached one year immutable; document and service-worker responses
  revalidate after 30 seconds. No analytics, CDN fonts/scripts, Azure endpoint,
  embedded key, or cloud OCR request was found.
- The invalid-license endpoint returned `{valid:false,reason:"invalid"}` with
  product-origin CORS and `Cache-Control: no-store`. A burst of 80 invalid
  verification calls produced 30 HTTP 200 and 50 HTTP 429 responses; every
  observed 429 included `Retry-After` (3–4 seconds). The concurrent completion
  order means the exact request ordinal is not meaningful; the observed
  acceptance threshold was 30 requests.
- Checkout returns HTTP 303 to `checkout.dodopayments.com` (session identifier
  redacted). No sign-in flow is present.

## Deployment identity and release artifact

Rebuilt candidate asset hashes equal production exactly:

```text
JS  13af7f8924abc2ec93bd1dd8750057f7efabc45f086d09c4874d509a33718217
CSS 23f819d2191e4978cb9558ec8d373d69f99bfc665bf5d0d67b984dc73a225796
```

GitHub release `v0.1.2` contains Linux AppImage/DEB, Windows NSIS installer,
both macOS DMGs, `SHA256SUMS`, and `latest.json`. The downloaded AMD64 DEB is
version 0.1.2 and its computed SHA-256 matches the published checksum:

```text
389f1a451c487b58d4296b9858d5860a9bbcab7d551a0d7d615a0a1712de1fdd
```

## Defects by severity

No P0, P1, P2, or P3 product defects found.

## Remaining operational limitations

- macOS and Windows installers remain unsigned, as disclosed in the product.
- Real hardware remains needed to observe OS capture-permission UI, audible
  device speech, and compositor-specific capture behavior on each platform.
  These are platform smoke-test limitations, not a failing automated or live
  product flow.
