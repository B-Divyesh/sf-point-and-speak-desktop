# Independent product verification — sixth pass

## Verdict: FAIL

Candidate `e30e9298488fd07d5eb5ee7b062b447bedf66be6` was independently
tested on 2026-08-29 UTC against
`https://point-and-speak-desktop.sociobot.in`.

The repaired desktop primary actions now retain accessible contrast in every
tested state, including hover. The candidate is nevertheless not ready for
release because the live landing page contains a **21 CSS px-high privacy link
target** at 390 px. The acceptance contract requires every touch/click target
to be at least 44×44 CSS px. This is especially relevant for a product aimed
at low-vision users.

No product code was modified during verification.

## Release-blocking finding

### P1 — homepage privacy link has a 21 px-high touch target

- Route and viewport: `/` at 390×844.
- Control: **Read the privacy note** in the cyan privacy section.
- Measured bounding box: **223.73×21 CSS px**.
- Required minimum: **44×44 CSS px** under the attached accessibility and
  design contracts.
- Source: the link at `site/main.ts:53` is inline. The 44 px link rule in
  `site/contrast.css:4-10` applies only to header, footer, and demo-banner
  links.
- Test gap: `tests/site.spec.ts:273-280` scans only header/footer/demo-banner
  links and the range input. It does not scan all visible interactive elements.
- Expected repair: give the privacy link a real minimum 44 px hit area and
  extend the mobile target test to every visible link, button, input, and
  select.

Evidence: `.factory/evidence/verification-6/qa-summary.json`. This finding is
not reported by axe because automated WCAG rules do not enforce the factory's
stricter 44 px product baseline.

## Claims-first gate

`.factory/claims.json` exists and declares 19 claims. After `npm ci`, every
declared command was run separately before broader repository inspection. The
two native commands initially stopped during dependency compilation because
the bare worker lacked `glib-2.0.pc`. I installed the exact Linux/Tauri
prerequisites declared in `.github/workflows/release.yml` and reran those exact
commands; both assertions passed. This was a worker provisioning prerequisite,
not a failed product assertion.

| Claim | Exact result |
| --- | --- |
| `selected-region-speech` | PASS in both Playwright projects |
| `local-only` | PASS in both Playwright projects |
| `speech-speed` | PASS in both Playwright projects |
| `pin-result` | PASS in both Playwright projects |
| `demo-ready` | PASS in both Playwright projects |
| `no-demo-storage` | PASS in both Playwright projects |
| `capture-memory` | PASS in both Playwright projects |
| `capture-on-demand` | PASS — native assertion |
| `configured-shortcut` | PASS — native assertion |
| `account-free-core` | PASS in both Playwright projects |
| `linux-checksum-installer` | PASS; irrelevant mobile duplicate skipped |
| `offline-reload` | PASS in both Playwright projects |
| `bundled-recognition` | PASS in both Playwright projects |
| `supporter-themes` | PASS in both Playwright projects |
| `license-storage` | PASS in both Playwright projects |
| `website-no-tracking` | PASS in both Playwright projects |
| `release-request` | PASS in both Playwright projects |
| `mit-license` | PASS — focused Vitest assertion |
| `checkout-live` | PASS — USD 19.00; HTTP 303 to Dodo checkout |

The landing page, policies, and README were cross-checked against the manifest.
The functional, privacy, persistence, payment, installer, offline, release,
and licensing statements map to declared claims. No unlisted relied-on product
claim was found.

## First-read and demo gate

PASS. A cold live 1440×900 load answers all three questions in the first
viewport:

- What: **Read selected screen text aloud**.
- Who: low-vision desktop users whose screen reader misses text in remote
  desktops, old software, games, or visual app interfaces.
- First click: **Try it with sample data**.

The adjacent sentence says an editable result appears and real data stays
untouched. The same job, audience, action, and three facts fit within a 390×844
first viewport; the last fact ends at 843.69 px. One click opens `/?demo=1`
with an editable fictional inventory result and the persistent **Demo — sample
data, nothing is saved** banner, **Reset demo**, and **Start for real**.

## Functional and recovery testing

The production desktop webview was exercised independently at 1180×820 and
390×640:

- Both first-run actions are in view and the hidden canvas is absent from
  layout and keyboard focus.
- Capture outside Tauri fails safely with screen-recording permission guidance;
  **Load sample region** remains available.
- A one-pixel selection is rejected with “Drag a larger rectangle.”
- Keyboard Enter selects the centre region. Bundled local OCR returned all four
  inventory rows and excluded the header.
- Edited text reached speech at both 0.5× and 2× boundaries.
- Clipboard success worked; simulated clipboard denial gave Ctrl+C/Command+C
  recovery guidance.
- Pin/remove worked. Blank text was not spoken and showed a corrective message.
- Reload removed the capture, result, pin, and all storage.
- Every app request was same-origin and there were no console/page errors.
- Visible app controls were at least 44 px high, with no mobile overflow.

The previous verifier's primary-action contrast blocker is repaired. While
hovered, **Capture screen** and **Speak text** used `rgb(4, 25, 31)` on
`rgb(140, 232, 242)`, and fresh axe scans returned no serious/critical result.
Normal, focus, hover, active, and disabled contrast checks also pass in the
repository suite.

The brief's quantitative success measure passed in a fresh 20-region pilot.
The cases varied font family, size, light/dark/lower-contrast surfaces,
identifiers, currency, paths, dates, times, errors, decimals, and multiline
text. **20/20** achieved at least 0.70 normalized similarity in under two
seconds. Model startup was 705 ms; maximum per-region recognition was 241 ms.
Evidence: `.factory/evidence/verification-6/ocr-pilot.json`.

## Local quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 78 packages; 0 audit findings |
| `npm test` | PASS — 12 Vitest; 91 Playwright passed; 1 intentional skip |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — TypeScript and strict Clippy |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 2 native tests |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |
| `npm run build` | PASS — produced `dist/app` and `dist/site` |

Rust reports a future-compatibility notice for third-party dependency
`screenshots 0.8.10`; it does not fail strict lint or tests.

## Accessibility, responsive layout, and navigation

- Live `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and a real missing route
  were checked at 1440 px and 390 px in light and dark modes. Each has `lang`,
  one `h1`, one `main`, a route-specific title, no overflow, named controls,
  and complete image alternatives.
- Fresh WCAG A/AA axe scans found zero serious/critical findings on all routes
  in both color schemes.
- The first Tab reaches **Skip to main content**. Its visible outline is 3 px
  solid `rgb(168, 68, 22)`, and Space operates the demo pin button.
- Reduced-motion emulation has `scroll-behavior: auto`, zero running
  animations, and zero-duration transitions.
- At 200% root text size, the demo remains usable with no horizontal overflow.
- The only undersized target is the release blocker documented above.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, title, `lang=en`, one `h1`,
  `main`, complete alt text, named buttons, and no console/page error. Evidence
  and screenshots are in `.factory/evidence/verification-6/verify-url/`.

All valid links returned 200 or their expected download/checkout redirect.
The deliberate not-found route returns HTTP 404 and displays a designed route
back to the product. Chromium logs the expected failed-document diagnostic for
that intentional 404; no 200 route produced a console or page error.

## Privacy, security, PWA, and service boundaries

- The complete direct-demo flow requested only the site document, JS, and CSS
  from the product origin. It made no GitHub, billing, OCR-service, analytics,
  font, or other cross-origin request.
- Editing, speaking, copying, pinning, removing, resetting, and offline reload
  preserved a real-storage sentinel and created no demo storage key.
- A live invalid license was stripped from the URL, stored only under
  `sb_license:point-and-speak-desktop` and its verdict key, and sent only to
  `api.sociobot.in`; the free core remained available.
- License verification permits **30 requests per client**. Request **31** and
  requests 32–35 returned HTTP 429 with `Retry-After: 4`; CORS allowed the
  product origin. Normal verification responses use `Cache-Control: no-store`.
- The site has no sign-in flow, first-party backend, telemetry, or runtime AI.
  Entra identity, backend concurrency, and AI gateway checks are not applicable.
- `point-speak-v6` installed, `registration.update()` completed, and the seeded
  demo reloaded offline under service-worker control.
- Browser response headers include HSTS, `nosniff`, strict referrer policy,
  restrictive Permissions-Policy, and a CSP limited to self, GitHub release
  data, and Sociobot licensing/checkout. No CSP error appeared.
- HTML and `sw.js` revalidate after 30 seconds. Hashed assets and bundled OCR
  files use one-year immutable caching.

## Performance and deployment identity

Fresh throttled mobile Lighthouse results:

```text
Performance      98
Accessibility   100
Best Practices  100
SEO             100
FCP              946 ms
LCP             1201 ms
TBT              171.5 ms
CLS              0
Total transfer   51,182 bytes
```

Evidence: `.factory/evidence/verification-6/lighthouse.json`.

The production bundle is comfortably within budget:

```text
site JS       19,310 bytes raw / 6,640 bytes gzip
site CSS      14,362 bytes raw / 4,108 bytes gzip
mobile hero   16,180 bytes
fonts          no download
```

The deployed product files are byte-for-byte identical to the candidate build:

```text
index.html                    e510d540b1d4de05ec8062af0f895c64608c626b7f3f511c60b47137a858402b
assets/index-B6dQAZLL.js      5064cc55e5163728e08963211001d7976a95be39849ac76f93823a5dd481c07f
assets/index-B-NvNVXz.css     b22bfa3c53a753e4196e6a7214ab2388be232e2e14f84333dd1dad20ea095422
404.html                      8b32c9cfcfaeb0394c0e1f307643990f6e37e6208c99d4a482ef70129b4cb77e
404.css                       a1799ce636d373d9e7bd41bdd816e4e82bc6d4442329e1816fe4ffacfc5f735a
sw.js                         d9423896660af56aa1d94b3a3add95d6b92775025e06fe766d1c1d0535109836
hero-blueprint-480.webp        54e5000d0b1a88bb26226b53bbb0fcb8ae7f70d073b5a9c53f68f50d34eb5ae1
```

Candidate `e30e929…` differs from product tag `v0.1.5` only in factory handoff
and evidence files. The released and deployed product code is therefore the
candidate's product code.

## Installer and release verification

GitHub release `v0.1.5` is bound to product source
`a1c7e5f1c9fc4267af9d4beb584d0c65d5d7d72b` and contains Apple Silicon DMG,
Intel DMG, Windows setup EXE, Linux AppImage and DEB, `SHA256SUMS`,
`latest.json`, and `PROVENANCE.json`. The live selector resolves each of its
four choices to the correct `v0.1.5` asset.

The live Linux installer was run into a new temporary directory. It installed
the 86,649,336-byte AppImage, created the `point-and-speak` link, and reported
checksum verification. The independently computed SHA-256 was
`33b1b35d9903aa587e295ec9b37d86a829101dcf84f653d564d628af0fb4a16b`,
matching GitHub, `SHA256SUMS`, and provenance. The published AppImage remained
running through a 12-second Xvfb launch probe.

## Verification boundaries

Real physical displays are still needed to observe OS screen-capture permission
prompts, audible system voices, multi-display geometry, macOS notarization, and
Windows Authenticode behavior. Native explicit-action and shortcut boundaries
pass unit tests. The macOS and Windows packages remain unsigned as disclosed.
