# Independent product verification — fifth pass

## Verdict: FAIL

Candidate `a61c71236936b84c3b770fcbccbcbeb8ce4eaa4e` was independently
tested on 2026-08-29 UTC against
`https://point-and-speak-desktop.sociobot.in`.

The candidate is release-blocked by one serious accessibility defect in the
desktop app. Hovering the primary **Capture screen** or **Speak text** control
replaces its bright cyan background with a dark translucent background while
retaining dark text. Axe measured **Capture screen at 1.11:1** and, in the
populated result flow, **Speak text at 1.49:1** (`#04191f` on composite
`#123b48`) against the required **4.5:1**. Both findings were classified
serious. This is especially material for a product made for low-vision users.
Evidence:
`.factory/evidence/verification-5/app-qa.json` and
`.factory/evidence/verification-5/app-result-contrast.png`.

No product code was modified during verification.

## Claims-first gate

`.factory/claims.json` exists and contains 19 entries. Before repository
inspection or installation, I executed every listed command exactly as
written. In the bare clone, 16 browser commands could not start because
`vitest` was not installed, two native commands could not compile because the
container lacked GTK/GLib development packages, and the live checkout command
passed. I then ran `npm ci` and installed the exact Linux Tauri prerequisites
listed in the release workflow. Every claim command was rerun separately and
all 19 passed.

| Claim | Result |
| --- | --- |
| `selected-region-speech` | PASS — both Playwright projects |
| `local-only` | PASS — both Playwright projects |
| `speech-speed` | PASS — both Playwright projects |
| `pin-result` | PASS — both Playwright projects |
| `demo-ready` | PASS — both Playwright projects |
| `no-demo-storage` | PASS — both Playwright projects |
| `capture-memory` | PASS — both Playwright projects |
| `capture-on-demand` | PASS — native test |
| `configured-shortcut` | PASS — native test |
| `account-free-core` | PASS — both Playwright projects |
| `linux-checksum-installer` | PASS — host check; irrelevant mobile duplicate skipped |
| `offline-reload` | PASS — both Playwright projects |
| `bundled-recognition` | PASS — both Playwright projects |
| `supporter-themes` | PASS — both Playwright projects |
| `license-storage` | PASS — both Playwright projects |
| `website-no-tracking` | PASS — both Playwright projects |
| `release-request` | PASS — both Playwright projects |
| `mit-license` | PASS — focused Vitest |
| `checkout-live` | PASS — USD 19.00; HTTP 303 to hosted Dodo checkout |

The landing and README claim audit found no unlisted visitor-facing product
claim. The landing copy, privacy boundaries, free-core statement, download
behavior, supporter themes, payment, storage, offline demo, and MIT license all
map to entries in the manifest.

## First-read gate

PASS. A cold 1440×1000 live load says, in the first viewport:

- what it does: **Read selected screen text aloud**;
- for whom: low-vision desktop users facing remote desktops, old software,
  games, or visual interfaces that screen readers miss;
- what to do: **Try it with sample data**.

That action opens the populated isolated demo in one click and explains that
an editable result appears while real data remains untouched. The 390×844
first screen also contains the job, audience, action, and three short facts.
Evidence: `home-desktop.png`, `home-mobile.png`, and `live-qa.json`.

## Functional and recovery coverage

The live one-click demo passed with realistic inventory rows already visible.
I independently exercised editable multiline text containing punctuation and a
decimal, speech at the 2× boundary, clipboard copy, pin/remove, reset, and a
blank result. Blank speech was rejected with a useful recovery instruction.
The demo retained a real-storage sentinel and created no `demo:` keys.

The production desktop webview passed the following independent flow:

1. Capture outside Tauri failed safely and told the user to allow screen
   recording, while **Load sample region** remained a recovery path.
2. A one-pixel selection was rejected as too small with a corrective message.
3. Keyboard Enter selected the center region. Bundled local OCR returned four
   useful inventory rows.
4. Corrected text reached speech at the 0.5× boundary, copy, and pin/remove.
5. Blank text was not spoken. Reload removed the capture and result.

The flow generated only same-origin requests for the app shell and bundled
Tesseract worker, WASM loader, and English model. There were no console or page
errors. Desktop and 390×640 result layouts had no horizontal overflow and all
visible controls measured at least 44×44 CSS pixels.

The researched success measure also passed in a fresh 20-region synthetic
pilot. Cases varied sans/serif/monospace type, 20–34 px sizes, light, dark, and
lower-contrast surfaces, identifiers, amounts, paths, dates, times, errors,
percentages, and multiline text. Using the shipped English model, **20/20**
regions achieved at least 0.70 normalized similarity under two seconds. Model
startup was 923 ms; maximum per-region recognition time was 268 ms. Evidence:
`.factory/evidence/verification-5/ocr-pilot.json`.

## Local quality gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 78 packages, 0 audit findings |
| `npm test` | PASS — 12 Vitest; 89 Playwright passed; 1 intentional duplicate skipped |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — TypeScript and strict Clippy |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 2 native tests |
| `npm run build` | PASS — produced `dist/app` and `dist/site` |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |

Rust emitted a future-compatibility notice for third-party dependency
`screenshots 0.8.10`; it did not fail tests or strict lint.

## Accessibility and responsive QA

- Live `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and the real 404 were
  tested at 1440 px and 390 px. Each had the correct route title, one `h1`, one
  `main`, no overflow, no unexpected console/page errors, and zero axe
  serious/critical findings.
- The desktop app's empty state also passes the repository axe test. Its
  populated/hovered primary action does not; this uncovered state is the P1
  release blocker.
- Keyboard-only checks passed for the skip link, SPA navigation, heading focus,
  canvas Enter selection, and Space/Enter button activation. The observed focus
  outline was 3 px solid orange.
- Reduced-motion emulation reported no running animation and zero-duration
  animations/transitions. The demo reflowed without overflow at 320 px.
- All visible live-demo controls at 390 px and all populated desktop-app
  controls at 390×640 were at least 44×44 CSS pixels.

## Privacy, security, and service boundaries

- A cold homepage loaded only its own document/assets plus the documented
  GitHub release API. The complete direct demo flow made three same-origin
  requests and no cross-origin request.
- A live invalid-license return stripped the token from the URL, stored only
  the documented token/verdict keys, called only GitHub and Sociobot outside
  the site origin, displayed the inactive-license recovery, and left the free
  core available. No console error occurred.
- The site has no sign-in flow, analytics, third-party script, or first-party
  backend. Entra authority checks are therefore not applicable.
- The Sociobot product verification endpoint allowed 30 requests from one
  client. Request 31 and the next two returned HTTP 429 with
  `Retry-After: 4`. Its CORS response allowed the product origin.
- Live headers include HSTS, `nosniff`, strict referrer policy, restrictive
  Permissions-Policy, and a CSP limiting runtime connections to self, GitHub,
  and Sociobot. No CSP console errors occurred.
- The current `point-speak-v5` service worker accepted an update check and the
  seeded demo reloaded offline in a fresh context.

## Performance and deployment identity

Fresh mobile Lighthouse against production scored **94 Performance, 100
Accessibility, 100 Best Practices, and 100 SEO**. FCP was 0.9 s, LCP 1.9 s,
CLS 0, lab TBT 290 ms, and total transfer 50 KiB. Lighthouse does not provide
lab INP. Production assets remain well within budget:

```text
site JS       19,310 bytes raw / 6,640 bytes gzip
site CSS      14,362 bytes raw / 4,108 bytes gzip
mobile hero   16,180 bytes
fonts          no download
```

Documents and `sw.js` use `public, must-revalidate, max-age=30`; hashed assets
and bundled recognition files use `public, max-age=31536000, immutable`.

The live core files are byte-for-byte identical to the candidate production
build:

```text
index.html                    38b483661f3081b31122eba3d23463a729c80eb9046af1b470d50a7f18d82f2c
assets/index-B6dQAZLL.js      5064cc55e5163728e08963211001d7976a95be39849ac76f93823a5dd481c07f
assets/index-B-NvNVXz.css     b22bfa3c53a753e4196e6a7214ab2388be232e2e14f84333dd1dad20ea095422
404.html                      a4ae147263471c5c8b6a2e0d88bc854509cb309617cd90d5e5a09c5da07838e9
404.css                       a1799ce636d373d9e7bd41bdd816e4e82bc6d4442329e1816fe4ffacfc5f735a
sw.js                         144d46abda703d172df09cef06eee38098eb39bec321975f16c7b4d515574302
```

## Installer and release verification

GitHub Actions run `33243620220` succeeded for release source
`6a1d310f16a62861a26eafd267adabc142a6af6e` and published `v0.1.4` with
Apple Silicon DMG, Intel DMG, Windows setup EXE, Linux AppImage/DEB,
`SHA256SUMS`, `latest.json`, and `PROVENANCE.json`. Candidate changes after
that tag are factory evidence and handoff documents only, so the released
binary product code is the candidate's product code.

The live download selector resolved all four platform choices to real v0.1.4
assets. I ran the live Linux one-line installer into an isolated temporary
directory; it installed the AppImage and printed that SHA256 was verified. Its
actual digest was
`168532b845e7580ea168b9f03357ebceab2d7147a3892e40fb090a95daefe921`,
exactly matching `SHA256SUMS`, GitHub's asset digest, and provenance. All live
HTTP links passed; checkout returned 303 to Dodo and the asset returned the
expected GitHub download redirect.

## Defects

### P1 — primary desktop actions become unreadable on hover

- Affected controls: at least **Capture screen** and **Speak text**, both
  `.tool.tool--primary`.
- Reproduction: open the desktop app, load or capture a region, obtain a
  result, then point at **Speak text**. The same cascade affects the first-run
  **Capture screen** button.
- Actual: `.tool:hover` overrides the solid cyan primary background with a
  translucent cyan over the dark surface. Dark `--cyan-ink` text remains. Axe
  measures 1.11:1 for **Capture screen** and 1.49:1 for **Speak text**, and
  reports serious `color-contrast`.
- Expected: normal, hover, focus, active, and disabled states each meet at
  least 4.5:1 for this 16 px text.
- Why blocking: the acceptance contract requires 4.5:1 and zero serious or
  critical axe findings, and the target audience is low-vision users.
- Test gap: `tests/app.spec.ts` scans only the initial empty state. Add a scan
  after OCR with the primary button hovered so this regression cannot recur.

## Known verification boundary

Real physical displays are still required to observe OS screen-capture
permission prompts, audible system voices, multi-display geometry, macOS
notarization behavior, and Windows Authenticode behavior. Native explicit-action
capture and shortcut boundaries passed unit tests; the released packages are
unsigned as disclosed.
