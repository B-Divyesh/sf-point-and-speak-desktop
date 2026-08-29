# Adversarial first-read review 2

## Verdict: FAIL

Reviewed 2026-08-29 UTC from a clean browser context at
`https://point-and-speak-desktop.sociobot.in`, at 390 × 844 and 1440 × 900,
and from clean clone `/tmp/point-speak-review-2-wxjcun`.

The cold first screen, one-click demo, declared claim commands, route
structure, and visual identity are otherwise verified. A reopened prior
privacy-behaviour finding and one README copy-limit failure remain. A PASS
requires zero findings.

## Cold first read — before scrolling

At both 390 px and desktop, the visible first-screen text was:

> Read selected screen text aloud
>
> For low-vision desktop users when screen readers miss text in remote
> desktops, old software, games, or visual app interfaces.
>
> Try it with sample data
>
> See an editable result at once. Your real data stays untouched.

The three required answers were clear without scrolling:

- **What it does:** reads text selected from a desktop screen aloud.
- **Who it is for:** low-vision desktop users whose screen reader misses text
  in visual desktop interfaces.
- **What to click first:** **Try it with sample data**.

This gate passes. There was one `h1`, one `main`, no horizontal overflow, and
no console error on the normal landing or demo routes.

## Findings

### Blocking

#### F-2-1 (reopens F-1-8) — on-demand capture is still an unlisted, untested privacy claim

- **Location / exact quote:** landing heading **“Screen capture starts when you
  ask”** and landing paragraph **“A capture begins after you choose Capture
  screen.”**
- **Evidence:** neither sentence has a matching entry in
  `.factory/claims.json`. `local-only` proves that the browser sample-recognition
  flow makes no cross-origin request; it does not establish that the native
  capture path cannot start before an explicit user action. The only native
  claim command, `configured-shortcut`, compares the configured shortcut value.
  It does not observe capture initiation. The prior repair narrowed the
  wording, but did not add the test required by F-1-8.
- **Impact:** a low-vision visitor is asked to trust the central privacy
  boundary without a sandbox proof. This is the same unsupported
  continuous-capture concern raised in review 1, so it is blocking under the
  history requirement.
- **Concrete fix:** add `capture-on-demand` to `claims.json` and a tagged
  native boundary test. With a fake capture backend, assert no capture call
  occurs before **Capture screen** or the configured shortcut handler, then
  assert exactly one call occurs after either explicit action. Alternatively,
  remove both public sentences and the heading.

### Minor

#### F-2-2 — README audience sentence exceeds the 22-word hard limit

- **Location / exact quote:** README opening paragraph: **“Point & Speak
  Desktop is for low-vision users when screen readers miss text in remote
  desktops, old software, games, or apps that draw text as images.”**
- **Evidence:** 26 words under the repository copy-audit convention (hyphenated
  terms count as one). The plain-words hard cap is 22 words; the committed
  `.factory/copy-audit.md` does not audit README sentences.
- **Impact:** the audience sentence is long enough to slow a first read and
  leaves the README outside its own copy standard.
- **Concrete fix:** replace it with two sentences: **“Point & Speak Desktop is
  for low-vision users when screen readers miss text. It reads text in remote
  desktops, old software, games, and apps that draw text as images.”** Add the
  README rows to `.factory/copy-audit.md`.

## Copy audit

Counts use the repository convention: hyphenated terms and prices count as one
word. Code blocks, URLs, and repository-map fragments are not prose sentences.
No landing prose exceeds 22 words. The single flagged README row is F-2-2.

### Landing prose

| Sentence | Words | Result |
| --- | ---: | --- |
| Read selected screen text aloud. | 5 | Pass |
| For low-vision desktop users when screen readers miss text in remote desktops, old software, games, or visual app interfaces. | 19 | Pass |
| See an editable result at once. | 6 | Pass |
| Your real data stays untouched. | 5 | Pass |
| Local: captured images stay on your computer. | 7 | Pass |
| Offline: English text-recognition files ship with the app. | 8 | Pass |
| Price: core tools are free; supporter license is $19 once. | 10 | Pass |
| Draw a region around the text you want to hear. | 10 | Pass |
| Checking the latest release. | 4 | Pass |
| Downloads are being published. | 4 | Pass |
| Check the release page for availability. | 6 | Pass |
| These three frames show the complete capture. | 7 | Pass |
| Draw around the text that the other app does not expose. | 11 | Pass |
| Correct the editable result before using it. | 7 | Pass |
| Hear the text, copy it, or keep it visible. | 10 | Pass |
| The configured shortcut is Ctrl+Shift+Space. | 5 | Pass |
| The capture window lets you choose a region. | 8 | Pass |
| Text recognition processes the region you draw on your computer. | 10 | Pass |
| Edit the result, change its speech speed, or keep it visible. | 11 | Pass |
| A capture begins after you choose Capture screen. | 9 | F-2-1 |
| Captured images are not uploaded. | 5 | Pass |
| Captures stay in memory and disappear when the capture window reloads or closes. | 13 | Pass |
| This is an assistive utility, not a safety or medical product. | 11 | Pass |
| The free app includes capture, text recognition, speech, copy, and pin. | 11 | Pass |
| The one-time supporter license adds two blueprint page themes. | 9 | Pass |
| Read selected screen text aloud. | 5 | Pass |
| Generated artwork is disclosed in the design notes. | 8 | Pass |

The dynamic successful download text, **“v0.1.3 is ready.”**, is four words.

### README prose

| Sentence | Words | Result |
| --- | ---: | --- |
| Read text from a selected screen region aloud. | 8 | Pass |
| Point & Speak Desktop is for low-vision users when screen readers miss text in remote desktops, old software, games, or apps that draw text as images. | 26 | F-2-2 |
| The configured shortcut is Ctrl+Shift+Space. | 5 | Pass |
| Draw a region, review the recognised text, then speak, copy, or pin it. | 13 | Pass |
| English text-recognition files ship with the app. | 7 | Pass |
| Capture, text recognition, speech, copy, and pin work without an account or supporter license. | 14 | Pass |
| Captured images stay on the computer and are not uploaded. | 10 | Pass |
| Captures and pinned results stay in memory until the capture window reloads or closes. | 14 | Pass |
| This is an assistive utility, not a safety or medical product. | 11 | Pass |
| Check important text against the original screen. | 7 | Pass |
| Open the isolated sample directly. | 5 | Pass |
| The first screen contains three fictional inventory rows as editable text. | 11 | Pass |
| Speak, copy, pin, edit, or reset the result. | 8 | Pass |
| Demo actions do not change saved license or release data. | 10 | Pass |
| The demo reloads offline after the first visit. | 8 | Pass |
| Requirements: Node.js 22, Rust stable, and the Tauri 2 system dependencies. | 11 | Pass |
| Choose Load sample region to test the bundled recognition path without granting screen-capture permission. | 14 | Pass |
| Every public product claim and its isolated command are listed in `.factory/claims.json`. | 12 | Pass |
| Download the current installer from the GitHub Releases page. | 9 | Pass |
| The Linux script checks the downloaded AppImage against its published SHA256 checksum before installing it. | 15 | Pass |
| Maintainers create desktop releases from tags with `.github/workflows/release.yml`. | 8 | Pass |
| The static site deploys from `dist/site`. | 6 | Pass |
| The website has no advertising, user tracking, or third-party scripts. | 10 | Pass |
| The download page asks GitHub for release data. | 8 | Pass |
| A supporter license token and its last verification are stored in browser storage and sent only to Sociobot for verification. | 20 | Pass |
| The optional supporter license costs $19 once and adds two blueprint page themes. | 13 | Pass |
| Payment uses Sociobot checkout. | 4 | Pass |
| The free tools remain available without a license. | 8 | Pass |
| Read the live privacy policy and terms. | 7 | Pass |
| The project is MIT licensed. | 5 | Pass |
| Generated artwork provenance is recorded in `.factory/design.md`. | 7 | Pass |

Headings name their sections, the first-screen headline is five words and
task-first, and the result-naming action controls are **Try it with sample
data**, **View release downloads**, **Buy a supporter license**, and
**Activate supporter license**. No banned marketing adjective, unexplained
metaphor heading, or inconsistent visitor-facing term was found. The
terminology remains `region`, `text recognition`, `result`, `pin`, `demo`,
`supporter license`, `shortcut`, and `capture window`.

## Demo, privacy, claims, and structure checks

- One landing click opened `/?demo=1` with the editable three-row inventory
  result, speech speed, Speak, Copy, and Pin already visible. The persistent
  banner said **“Demo — sample data, nothing is saved”** and included **Reset
  demo** and **Start for real**.
- Editing, pinning, removing, and Reset work. A direct fresh `?demo=1` visit
  made same-origin requests only and created no demo storage. The initial live
  home route legitimately cached public release metadata before navigation;
  the direct demo path did not read or write it.
- All 18 commands in `.factory/claims.json` passed from the clean clone.
  The native command initially lacked the documented `glib-2.0` system
  library; after installing the exact Linux dependencies from the release
  workflow it passed. Checkout reported `$19 USD` and an HTTP 303 to the
  hosted checkout.
- Routes `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` returned 200;
  an unknown route returned the designed 404 with HTTP 404. At both target
  viewports all normal routes had a route-specific title, one h1, one main,
  no serious or critical axe WCAG A/AA violation, no overflow, and no console
  error. Back navigation restored focus to the landing h1. The browser logs
  the expected failed-document message when deliberately loading the HTTP 404.
- The crawler confirmed all HTTP(S) links resolve successfully (including the
  release, checkout, Param Factory, and Sociobot Terms links); `mailto:` is an
  explicit non-HTTP contact link. Header/footer Privacy and Terms links are
  consistent. Canonical, description, OG/Twitter image, favicon, 180 × 180
  apple-touch icon, robots, sitemap, CSP, and the blueprint-specific 404 are
  present.
- The blueprint drafting visual thesis is implemented rather than a generic
  SaaS template: cyan selection geometry, ruled sheets, technical labels, and
  product-specific walkthrough frames are visible. The brief does not imply an
  AI step, sync, or import/export feature that a normal visitor would expect;
  no decorative AI feature or provider key is present.

## Claim command results

| Claim | Result |
| --- | --- |
| `selected-region-speech` | Pass |
| `local-only` | Pass |
| `speech-speed` | Pass |
| `pin-result` | Pass |
| `demo-ready` | Pass |
| `no-demo-storage` | Pass |
| `capture-memory` | Pass |
| `configured-shortcut` | Pass after documented Linux Tauri prerequisites |
| `account-free-core` | Pass |
| `linux-checksum-installer` | Pass |
| `offline-reload` | Pass |
| `bundled-recognition` | Pass |
| `supporter-themes` | Pass |
| `license-storage` | Pass |
| `website-no-tracking` | Pass |
| `release-request` | Pass |
| `mit-license` | Pass |
| `checkout-live` | Pass — $19 USD, HTTP 303 |

## Earlier finding verification

Every earlier review, polish record, verification report, and handoff was read.
The following direct live/code checks confirm the closure status of every
`review-1.md` finding. `F-1-8` is reopened above; all other entries are fixed.

| Earlier id | Status in this review | Direct confirmation |
| --- | --- | --- |
| F-1-1 | Fixed | One click opens the populated editable result; three walkthrough frames exist. |
| F-1-2 | Fixed | Wording is narrowed and `selected-region-speech` is declared and passes. |
| F-1-3 | Fixed | Claim now says the configured shortcut and native test asserts it. |
| F-1-4 | Fixed | README and manifest make the singular Linux-installer claim. |
| F-1-5 | Fixed | Selected-region fixture excludes its header text. |
| F-1-6 | Fixed | Copy now says the capture window lets the visitor choose a region. |
| F-1-7 | Fixed | `speech-speed` is declared and passes at 1.5×. |
| F-1-8 | **Reopened** | See F-2-1. |
| F-1-9 | Fixed | `license-storage` covers exact keys and Sociobot-only verification. |
| F-1-10 | Fixed | `website-no-tracking` crawls routes and passes. |
| F-1-11 | Fixed | `account-free-core` passes. |
| F-1-12 | Fixed | The untestable funds-maintenance wording is absent. |
| F-1-13 | Fixed | Terms links payment/refunds to Sociobot terms instead of unsupported detail. |
| F-1-14 | Fixed | Public wording is limited to shipped English recognition files. |
| F-1-15 | Fixed | Detailed public artifact promise is removed. |
| F-1-16 | Fixed | Unregistered publishing sentence is removed. |
| F-1-17 | Fixed | `release-request` covers the GitHub request and fallback. |
| F-1-18 | Fixed | Separate-architecture public promise is removed. |
| F-1-19 | Fixed | Empty-release fallback is claimed and tested. |
| F-1-20 | Fixed | Public unsigned-package claim is removed. |
| F-1-21 | Fixed | Visitor copy uses visual app interfaces, not canvas jargon. |
| F-1-22 | Fixed | Visitor copy uses text recognition, not OCR. |
| F-1-23 | Fixed | The decorative drawing label is absent. |
| F-1-24 | Fixed | The section uses Three steps. |
| F-1-25 | Fixed | The privacy label names what the app can see and keep. |
| F-1-26 | Fixed | Demo is used consistently. |
| F-1-27 | Fixed | The action section heading names recognised-text actions. |
| F-1-28 | Fixed | The heading now names screen capture directly. |
| F-1-29 | Fixed | The price heading states $19 and the theme result. |
| F-1-30 | Fixed | The control says Activate supporter license. |
| F-1-31 | Fixed | Visitor copy consistently uses capture window. |
| F-1-32 | Fixed | Live HTTP 404 says Page not found and provides Return home. |
| F-1-33 | Fixed | Footer shows Version 0.1.3 and build date. |
| F-1-34 | Fixed | All checked route titles use the full product name. |
| F-1-35 | Fixed | Live HTTP 404 has metadata, shared header, footer, and navigation. |
| F-1-36 | Fixed | `apple-touch-icon.png` is 180 × 180. |

## What would make this perfect

Add the native capture-on-demand claim test and either remove or prove the two
privacy sentences, then split the 26-word README audience sentence and extend
the committed copy audit to cover README prose. Re-run the full claims manifest
and cold mobile/desktop review; with no further finding, this review can pass.
