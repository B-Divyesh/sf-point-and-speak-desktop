# Adversarial first-read review 1

## Verdict: FAIL

Reviewed 2026-08-29 UTC at candidate `48db168e546419a5882c8891005dc962eb7892d5`
and the live site `https://point-and-speak-desktop.sociobot.in`.

The landing page passes the cold first-screen clarity check, the declared test
commands pass after installing the repository's documented Linux prerequisites,
and the implementation is visually distinct. The review still has 36 findings.
Four are blocking: the one-click demo does not reveal the result, the broad core
claim is unlisted and untested on a real capture, and two declared claim tests do
not prove their full wording. A PASS requires zero findings.

## Cold first read — before scrolling

### 390 × 844

Visible text included:

> Read any screen region aloud
>
> For low-vision desktop users when remote, legacy, game, or canvas text defeats
> a screen reader.
>
> Try it with sample data
>
> See the full capture flow. Nothing is saved.

All three questions were answerable from the first screen:

- What: it reads a selected part of a desktop screen aloud.
- For whom: low-vision desktop users whose screen reader misses text.
- First action: choose **Try it with sample data**.

The three Local, Offline, and Price facts were also visible before scrolling.

### 1440 × 900

The same headline, audience sentence, sample action, outcome note, and three
facts were visible before scrolling. The blueprint illustration also showed a
selection rectangle. This viewport passed the same three-question check.

## Findings

### Blocking

#### F-1-1 — The one-click demo stops before showing the result

- Location/quote: landing action **“Try it with sample data”**; `/demo` then says
  **“Drag here or press to read this region.”**
- Evidence: after the one landing-page click at 390 × 844, the viewport shows
  the banner, heading, instruction, and part of the sample window. The editable
  OCR result and Speak/Copy/Pin actions are not shown until a second activation.
  The landing page also has one hero illustration and one preview, not the
  required 3–5-frame captioned desktop walkthrough.
- Impact: the promised one-click path does not yet show the completed job or its
  useful output within the visitor's 30-second mobile window.
- Fix: seed `/demo` with the selected region and its realistic editable result
  already visible after the first click. Keep an action to replay the selection.
  Add three captioned landing frames: select a region; review recognised text;
  speak, copy, or pin it.

#### F-1-2 — The core “any screen region” claim is unlisted and not tested end to end

- Location/quote: landing h1 **“Read any screen region aloud”**; README
  **“Read any screen region aloud when an app gives your screen reader no useful
  text.”**
- Evidence: no `.factory/claims.json` entry states this claim. The browser tests
  use the shipped sample image. The native test checks a shortcut constant but
  does not capture a real screen region, recognise it, and pass the result to
  speech. The existing handoff lists real-hardware capture and audible speech as
  unverified.
- Impact: this is the product's primary promise and the word “any” is broader
  than the available evidence.
- Fix: either add a tagged native integration test with a controlled on-screen
  fixture and speech sink, or narrow the copy to the tested scope, such as
  **“Read text from a selected screen region aloud.”** Add the exact resulting
  claim to `claims.json`.

#### F-1-3 — The shortcut claim test checks configuration, not the promised outcome

- Location/quote: claim `global-shortcut`, **“Ctrl+Shift+Space opens the capture
  flow.”**
- Evidence: the listed Rust test only compares `capture_shortcut()` with a
  `Shortcut` value. It never presses the system shortcut or observes the capture
  window/event.
- Impact: a passing constant comparison cannot detect registration or event
  handling failures, so the declared claim remains untested.
- Fix: add a native integration boundary that invokes the registered shortcut
  handler and asserts that the main window receives `start-capture`, or narrow
  the claim to **“The configured shortcut is Ctrl+Shift+Space.”**

#### F-1-4 — The checksum claim says both installers, but its command tests Linux only

- Location/quote: README **“Both scripts verify the release checksum before
  installing.”** Claim `checksum-installers` says **“Install scripts verify…”**
- Evidence: `npm test -- --grep @claim:checksum-installers` runs the Linux shell
  fixture and skips its duplicate browser project. The Windows PowerShell
  fixture exists only as a separate release-workflow step and is not run by the
  claim command in this clean Linux sandbox.
- Impact: the declared test does not prove the full plural claim that reviewers
  are told to verify from `claims.json`.
- Fix: split this into Linux and Windows claims with independently runnable
  commands and recorded platform evidence, or change the registered and README
  wording to the Linux installer only.

### Minor — unlisted claims

#### F-1-5 — Selection-boundary claim is not registered

- Location/quote: landing **“The rest of the screen is ignored.”** and
  **“On-device OCR reads only the rectangle you draw.”**
- Why: `local-only` checks cross-origin requests, but no claim test proves that
  pixels outside the selection are excluded.
- Fix: add a tagged fixture with decoy text outside the rectangle and assert it
  never reaches OCR, or remove “only” and “ignored.”

#### F-1-6 — Native overlay behavior is not registered

- Location/quote: landing **“The capture sheet opens over your current screen.”**
- Why: the shortcut unit test does not observe a window over the current screen.
- Fix: register and test the overlay behavior, or rewrite to the tested action:
  **“The capture window lets you choose a region.”**

#### F-1-7 — Speech-speed behavior is not registered

- Location/quote: landing **“Edit the result, set speech speed, or keep it
  visible.”**
- Why: the suite checks the speed control's size, not that its value changes
  speech rate. No claim entry covers it.
- Fix: add a `speech-speed` claim and assert the selected rate reaches the speech
  API, or remove **“set speech speed.”**

#### F-1-8 — Continuous monitoring and click behavior are not registered

- Location/quote: landing **“Point & Speak does not watch continuously. It does
  not stream your screen or click for you.”**
- Why: `local-only` covers cross-origin requests during one OCR flow, not
  continuous capture or synthetic clicks.
- Fix: register separate bounded privacy claims with observable tests, or use
  narrower tested copy: **“A capture starts only after you choose Capture
  screen. Captured images are not uploaded.”**

#### F-1-9 — License-token handling is not registered

- Location/quote: `/privacy` **“If you add a supporter license, the website
  stores its token and last check in your browser. The token is sent to Sociobot
  only to confirm the license.”**
- Why: there is no claim entry for storage keys or the only allowed destination.
- Fix: add a tagged request/storage test that asserts the exact keys and allowed
  origin, or remove the implementation detail from the public promise.

#### F-1-10 — Website tracking/script claim is not registered

- Location/quote: `/privacy` **“This site has no advertising, user tracking, or
  third-party scripts.”**
- Why: the demo privacy check is untagged and covers `/demo`; `local-only` covers
  the app webview. Neither registered claim covers all site routes or script
  origins.
- Fix: add a `website-no-tracking` claim that crawls every route and records
  scripts, requests, cookies, and storage.

#### F-1-11 — Account-free use is not registered

- Location/quote: `/privacy` **“You can use the free core tools without an
  account.”** README **“No OCR service or account is required.”**
- Why: `free-core` asserts no license but does not define or test account-free
  use; the README sentence also promises no OCR service.
- Fix: add an `account-free-core` claim and assert the full app sample flow with
  no authentication or OCR-service requests.

#### F-1-12 — “Funds maintenance” is an untestable claim

- Location/quote: landing **“A $19 one-time supporter license funds maintenance
  and adds two blueprint page themes.”**
- Why: theme access is registered; use of proceeds is not testable from the
  sandbox.
- Fix: delete the untestable clause: **“A $19 one-time supporter license adds two
  blueprint page themes.”**

#### F-1-13 — Commercial-policy details are not registered

- Location/quote: `/terms` **“A supporter purchase adds theme access for one
  user. Sociobot is the merchant of record and handles refunds. A refund revokes
  the supporter license.”**
- Why: checkout and theme activation are registered, but one-user scope,
  merchant status, refund handling, and refund-triggered revocation are not.
- Fix: link to an authoritative Sociobot purchase/refund policy and register a
  gateway contract test for revocation, or remove unsupported details.

#### F-1-14 — Bundled model identity and licence are not registered

- Location/quote: README **“The local desktop build includes Tesseract's
  Apache-2.0-licensed English fast model.”**
- Why: `bundled-ocr` checks that two same-origin files contain data. It does not
  identify the model or verify its licence notice.
- Fix: add a claim test that checks the shipped model manifest and Apache-2.0
  notice, or say only **“English text-recognition files ship with the app.”**

#### F-1-15 — Release-trigger and package-format claims are not registered

- Location/quote: README **“Tagged `v*` releases start the GitHub Actions matrix.
  It builds unsigned macOS Intel and Apple Silicon DMGs, a Windows MSI or EXE,
  and Linux AppImage and DEB files.”**
- Why: no claim entry checks a tagged release and all named artifacts.
- Fix: add a release-manifest claim against a recorded release fixture, or move
  this operator detail out of user-facing README copy.

#### F-1-16 — Published manifest/checksum files are not registered

- Location/quote: README **“A final job publishes `SHA256SUMS` and
  `latest.json`.”**
- Why: the installer claim consumes a checksum fixture but does not assert that
  the release job publishes both named files.
- Fix: add a tagged release-artifact test, or remove the sentence.

#### F-1-17 — Platform detection and GitHub request are not registered

- Location/quote: README **“The landing page detects the visitor's system and
  reads the latest release through the CORS-enabled GitHub API.”**
- Why: no claim entry tests detection for each system or records this privacy-
  relevant external request.
- Fix: add a `platform-download-detection` claim with Windows, macOS, and Linux
  user-agent fixtures plus an exact request assertion.

#### F-1-18 — Separate macOS downloads are not registered

- Location/quote: README **“It offers separate macOS downloads for Intel and
  Apple Silicon.”**
- Why: an untagged browser test covers this, but there is no `claims.json` entry
  as required for public claims.
- Fix: add the existing test under a unique `@claim:macos-architectures` entry.

#### F-1-19 — Missing-release fallback is not registered

- Location/quote: README **“When no release exists, it links to the release page
  without throwing an error.”**
- Why: there is no claim entry or test for an empty GitHub release response.
- Fix: add a tagged empty-response fixture and assert the fallback link and zero
  page errors, or remove the sentence.

#### F-1-20 — Unsigned-package disclosure is not registered

- Location/quote: landing **“Downloads are unsigned during the pilot.”** README
  **“Pilot installers are unsigned, so the operating system may ask for
  confirmation.”**
- Why: no claim entry inspects the released packages' signing state.
- Fix: add a release-signature claim per platform, or replace the claim with a
  stable support note linked to release-specific signing information.

### Minor — plain words and terminology

#### F-1-21 — “Canvas text” and “canvas-heavy” are unexplained jargon

- Location/quote: landing **“remote, legacy, game, or canvas text”**; README
  **“canvas-heavy interfaces.”**
- Why: a first-time low-vision user should not need the web-development meaning
  of canvas to recognise their situation.
- Fix: **“For low-vision desktop users when screen readers miss text in remote
  desktops, old software, games, or visual app interfaces.”** In the README,
  replace **“canvas-heavy interfaces”** with **“apps that draw text as images.”**

#### F-1-22 — “OCR” is not defined before use

- Location/quote: first-screen fact **“English OCR files ship with the app.”**
  README first use **“English OCR files ship with the app.”**
- Why: the audience is not necessarily technical, and the acronym is avoidable.
- Fix: use **“English text-recognition files ship with the app.”** Use **“text
  recognition”** consistently, or define **“optical character recognition
  (OCR)”** once in the developer section.

#### F-1-23 — “Drawing 01” is decorative brand lore

- Location/quote: hero label **“Assistive desktop utility / drawing 01.”**
- Why: “drawing 01” tells the visitor nothing about the job or next action.
- Fix: delete the label, or use **“For low-vision desktop users.”**

#### F-1-24 — “Procedure / three operations” uses process jargon

- Location/quote: landing label **“Procedure / three operations.”**
- Why: it duplicates the How it works heading and makes simple steps sound
  technical.
- Fix: delete it, or rewrite it as **“Three steps.”**

#### F-1-25 — “Privacy boundary / intentionally narrow” is abstract copy

- Location/quote: landing label **“Privacy boundary / intentionally narrow.”**
- Why: it does not name what the section says the app can see or retain.
- Fix: **“What the app can see and keep.”**

#### F-1-26 — “Sandbox” and “demo” name the same feature differently

- Location/quote: README heading **“Try the sandbox”**; `/demo` label
  **“Sandbox / sample legacy window”**; navigation and banner use **“Demo.”**
- Why: the terminology table already declares “demo” as the one term.
- Fix: use **“Try the demo”** and **“Demo with a sample legacy window.”**

#### F-1-27 — “One shortcut. One region. Your choice.” is a slogan, not a section name

- Location/quote: landing h2 **“One shortcut. One region. Your choice.”**
- Why: the heading does not tell a skim reader that the section explains output
  actions.
- Fix: **“Choose what happens to recognised text.”**

#### F-1-28 — “It looks only when you ask” has an unclear subject

- Location/quote: landing h2 **“It looks only when you ask.”**
- Why: “it” and “looks” make the privacy behavior metaphorical.
- Fix: **“Screen capture starts only when you ask.”**

#### F-1-29 — “Keep the core tools free” does not name the pricing section

- Location/quote: landing h2 **“Keep the core tools free.”**
- Why: this is a mission slogan, not the price and paid benefit.
- Fix: **“$19 supporter license adds two themes.”**

#### F-1-30 — The licence button does not name its result

- Location/quote: button **“Have a license? Paste it.”**
- Why: it begins with a question and describes input rather than the result.
- Fix: **“Activate supporter license.”**

#### F-1-31 — “Capture sheet” is inconsistent with “capture window” and “capture flow”

- Location/quote: landing **“The capture sheet opens…”**; README uses
  **“first-run window”** and **“OCR flow.”**
- Why: “sheet” is visual-theme language, while the actual UI is a window and
  the terminology changes across instructions.
- Fix: use **“capture window”** for the UI everywhere and **“capture”** for the
  action.

#### F-1-32 — The 404 uses blueprint lore instead of direct recovery copy

- Location/quote: **“Drawing not found / 404,” “This sheet is not in the set,”**
  and **“Return to the first sheet.”**
- Why: none directly names the missing page or the home destination.
- Fix: use **“Page not found,” “This address does not match a page,”** and
  **“Return home.”**

#### F-1-33 — “Sheet 0828” is an unexplained build label

- Location/quote: footer **“v0.1.2 / sheet 0828.”**
- Why: “sheet” is decorative and `0828` has no stated date format.
- Fix: **“Version 0.1.2 · build 2026-08-28.”**

### Minor — site structure and metadata

#### F-1-34 — Route titles omit the product's full name

- Location/quote: **“Point & Speak — Read screen text aloud,” “Demo — Point &
  Speak,” “Privacy — Point & Speak,” “Terms — Point & Speak,”** and **“Page not
  found — Point & Speak.”**
- Why: the product contract and page footer name the product “Point & Speak
  Desktop”; route titles use a second, inconsistent name.
- Fix: use **“Point & Speak Desktop — Read screen text aloud,” “Demo — Point &
  Speak Desktop,”** and the equivalent full-name pattern for every route.

#### F-1-35 — The real 404 drops required metadata and the shared site skeleton

- Location: live `/definitely-missing-review-1` and `public/404.html`.
- Evidence: HTTP 404 and one h1 are correct, but the document has no meta
  description, canonical, Open Graph/Twitter metadata, or apple-touch icon. Its
  header has no navigation; its footer omits the product one-liner, “Built by
  Param Factory,” and build id.
- Impact: the error route is designed, but it is not structurally consistent
  with every other route as required.
- Fix: give the 404 the same complete header/footer and route-appropriate
  metadata as the SPA while retaining the real HTTP 404 response.

#### F-1-36 — The apple-touch icon is not the specified 180 px asset

- Location: `public/apple-touch-icon.png`.
- Evidence: image inspection reports 256 × 256; the site-structure contract asks
  for a 180 px apple-touch icon.
- Fix: provide a 180 × 180 icon and keep the existing `<link
  rel="apple-touch-icon">`.

## Copy audit

Counts use whitespace-separated words, including the visible `&` token.
Hyphenated terms count as one word. No landing or README sentence exceeds 22
words, and no banned marketing adjective appears.

### Landing-page sentences

| # | Sentence | Words | Flag |
| ---: | --- | ---: | --- |
| 1 | For low-vision desktop users when remote, legacy, game, or canvas text defeats a screen reader. | 15 | F-1-21 |
| 2 | See the full capture flow. | 5 | — |
| 3 | Nothing is saved. | 3 | —; covered by `no-demo-storage` |
| 4 | Local: screen images stay on your computer. | 7 | —; covered by `local-only` |
| 5 | Offline: English OCR files ship with the app. | 8 | F-1-22 |
| 6 | Price: core tools are free; supporter license is $19 once. | 10 | —; covered by `free-core` and `checkout-live` |
| 7 | Drag one deliberate region. | 4 | — |
| 8 | The rest of the screen is ignored. | 7 | F-1-5 |
| 9 | v0.1.2 is ready. | 3 | — |
| 10 | Downloads are unsigned during the pilot. | 6 | F-1-20 |
| 11 | One shortcut. | 2 | F-1-27 |
| 12 | One region. | 2 | F-1-27 |
| 13 | Your choice. | 2 | F-1-27 |
| 14 | Press the shortcut, drag around text, then choose what happens. | 10 | F-1-2, F-1-3 |
| 15 | The capture sheet opens over your current screen. | 8 | F-1-6, F-1-31 |
| 16 | On-device OCR reads only the rectangle you draw. | 8 | F-1-5, F-1-22 |
| 17 | Edit the result, set speech speed, or keep it visible. | 10 | F-1-7 |
| 18 | It looks only when you ask. | 6 | F-1-28 |
| 19 | Point & Speak does not watch continuously. | 7 | F-1-8 |
| 20 | It does not stream your screen or click for you. | 10 | F-1-8 |
| 21 | Captures stay in memory and are discarded by default. | 9 | —; covered by `capture-memory` |
| 22 | This is an assistive utility, not a safety or medical product. | 11 | — |
| 23 | Keep the core tools free. | 5 | F-1-29 |
| 24 | The free app includes capture, OCR, speech, copy, and pin. | 10 | —; covered by `free-core` |
| 25 | A $19 one-time supporter license funds maintenance and adds two blueprint page themes. | 13 | F-1-12 |
| 26 | Read any screen region aloud. | 5 | F-1-2 |
| 27 | Generated artwork disclosed in the design notes. | 7 | — |

### Landing-page state sentences

These source-backed states replace or supplement the settled live release note.

| # | Sentence | Words | Flag |
| ---: | --- | ---: | --- |
| 1 | Checking the latest release for this computer… | 7 | — |
| 2 | Downloads are being published. | 4 | — |
| 3 | The release page has the current files. | 7 | — |
| 4 | Check the release page for availability. | 6 | — |
| 5 | Supporter license active. | 3 | — |
| 6 | License no longer active. | 4 | — |
| 7 | You can keep using the free core. | 7 | —; covered by `free-core` |
| 8 | License check is unavailable. | 4 | — |
| 9 | The free core still works. | 5 | —; covered by `free-core` |

### README sentences

| # | Sentence | Words | Flag |
| ---: | --- | ---: | --- |
| 1 | Read any screen region aloud when an app gives your screen reader no useful text. | 15 | F-1-2 |
| 2 | Point & Speak is for low-vision users working with remote desktops, legacy software, games, and canvas-heavy interfaces. | 17 | F-1-21 |
| 3 | Press Ctrl+Shift+Space, drag around text, then speak, copy, or pin the editable result. | 13 | F-1-2, F-1-3 |
| 4 | English OCR files ship with the app. | 7 | F-1-22 |
| 5 | Speech uses the computer's voice. | 5 | —; covered by `speak` |
| 6 | Captures are not retained by default. | 6 | —; covered by `capture-memory` |
| 7 | This is an assistive utility, not a safety or medical product. | 11 | — |
| 8 | Check important names, numbers, instructions, and warnings against the original screen. | 11 | — |
| 9 | Choose the marked sample region. | 5 | — |
| 10 | The demo returns three fictional inventory rows, then lets you speak, copy, or pin them. | 15 | —; covered by demo claims |
| 11 | Demo state stays in memory and is cleared with Reset demo. | 11 | —; covered by `no-demo-storage` |
| 12 | The demo reloads offline after the first visit. | 8 | —; covered by `offline-reload` |
| 13 | Requirements: Node.js 22, Rust stable, and the Tauri 2 system dependencies. | 11 | — |
| 14 | Choose Load sample region in the first-run window to test the complete OCR flow without granting screen-capture permission. | 18 | F-1-22 |
| 15 | The local desktop build includes Tesseract's Apache-2.0-licensed English fast model. | 10 | F-1-14 |
| 16 | No OCR service or account is required. | 7 | F-1-11, F-1-22 |
| 17 | The test suite opens fresh site and app contexts for product claims. | 12 | —; verified |
| 18 | It checks the real bundled OCR path, both color schemes, offline reload, the 390 px layout, and route semantics. | 19 | F-1-22; behavior verified |
| 19 | See .factory/claims.json for each claim and its exact command. | 9 | — |
| 20 | Tagged v* releases start the GitHub Actions matrix. | 8 | F-1-15 |
| 21 | It builds unsigned macOS Intel and Apple Silicon DMGs, a Windows MSI or EXE, and Linux AppImage and DEB files. | 20 | F-1-15, F-1-20 |
| 22 | A final job publishes SHA256SUMS and latest.json. | 7 | F-1-16 |
| 23 | The landing page detects the visitor's system and reads the latest release through the CORS-enabled GitHub API. | 17 | F-1-17 |
| 24 | It offers separate macOS downloads for Intel and Apple Silicon. | 10 | F-1-18 |
| 25 | When no release exists, it links to the release page without throwing an error. | 14 | F-1-19 |
| 26 | Both scripts verify the release checksum before installing. | 8 | F-1-4 |
| 27 | Pilot installers are unsigned, so the operating system may ask for confirmation. | 12 | F-1-20 |
| 28 | The app has no telemetry and no cloud image upload. | 10 | —; covered by `local-only` |
| 29 | The optional $19 supporter license uses Sociobot's hosted checkout and verification API. | 12 | —; checkout covered; token behavior is F-1-9 |
| 30 | The free app keeps capture, OCR, speech, copy, and pin available. | 11 | F-1-22; behavior covered by `free-core` |
| 31 | See /privacy and /terms for the plain-language policies. | 8 | — |
| 32 | MIT licensed. | 2 | —; `LICENSE` present |
| 33 | Generated artwork provenance is recorded in .factory/design.md. | 7 | —; source file present |

### Flagged headings, labels, and actions

| Text | Kind | Finding / rewrite |
| --- | --- | --- |
| Assistive desktop utility / drawing 01 | Label | F-1-23 — delete or “For low-vision desktop users” |
| English OCR files ship with the app | Fact | F-1-22 — “English text-recognition files ship with the app” |
| One shortcut. One region. Your choice. | h2 | F-1-27 — “Choose what happens to recognised text” |
| Procedure / three operations | Label | F-1-24 — delete or “Three steps” |
| Privacy boundary / intentionally narrow | Label | F-1-25 — “What the app can see and keep” |
| It looks only when you ask | h2 | F-1-28 — “Screen capture starts only when you ask” |
| Keep the core tools free | h2 | F-1-29 — “$19 supporter license adds two themes” |
| Have a license? Paste it | Button | F-1-30 — “Activate supporter license” |
| Try the sandbox | README h2 | F-1-26 — “Try the demo” |
| Sandbox / sample legacy window | Label | F-1-26 — “Demo with a sample legacy window” |
| Drawing not found / 404 | 404 label | F-1-32 — “Page not found” |
| This sheet is not in the set | 404 h1 | F-1-32 — “This page does not exist” |
| Return to the first sheet | 404 link | F-1-32 — “Return home” |
| v0.1.2 / sheet 0828 | Footer label | F-1-33 — “Version 0.1.2 · build 2026-08-28” |

### Terminology check

| Concept | Terms found | Result |
| --- | --- | --- |
| Product try-out | demo, sandbox | F-1-26 |
| Capture UI/process | capture sheet, capture window, capture flow | F-1-31 |
| Text recognition | OCR, recognised text, reads | F-1-22 for undefined acronym; verbs otherwise fit their contexts |
| Product name | Point & Speak Desktop, Point & Speak | F-1-34 in route titles |
| Selected area | region, rectangle | Acceptable: “rectangle” describes the shape |
| OCR output | result, recognised text | Acceptable: one is the object; one labels its content |

## Demo and sandbox evidence

- `/demo` is reachable with one landing-page click and returns HTTP 200.
- The first demo screen contains a fictional field-stock terminal with four
  rows and a marked selection. F-1-1 records why this remains weak.
- The banner **“Demo — sample data, nothing is saved”** remains visible and
  offers **Reset demo** and **Start for real**.
- After activating the sample, the result contains R-1082 through R-1084 and
  the Speak, Copy, and Pin actions. Pin and Remove pin worked.
- Reset hid both the editable result and pinned result.
- A fresh direct `/demo` context made only same-origin requests. It also
  reloaded offline after service-worker installation.
- A context seeded with `real:user-note=preserve-me` and a real license key kept
  both values unchanged while `/demo` loaded. The demo did not call the license
  verification endpoint.
- No demo input or result was written to localStorage or sessionStorage. The
  implementation keeps demo state in closure memory.

## Claims execution

Commands were run separately from the clean local clone
`/tmp/point-speak-review-01slW5/repo`. `npm ci` reported 78 packages and zero
vulnerabilities. The native claim initially could not compile because the base
container lacked GLib/WebKit; after installing the exact packages listed in
`.github/workflows/release.yml`, the exact claim command passed.

| Claim | Exact command result | Review note |
| --- | --- | --- |
| `sample-region` | PASS, 2 browser projects | — |
| `local-only` | PASS, 2 browser projects | — |
| `speak` | PASS, 2 browser projects | — |
| `pin-result` | PASS, 2 browser projects | — |
| `no-demo-storage` | PASS, 2 browser projects | Real-storage preservation also checked live |
| `capture-memory` | PASS, 2 browser projects | — |
| `global-shortcut` | PASS, 1 Rust test | Coverage mismatch: F-1-3 |
| `free-core` | PASS, 2 browser projects | — |
| `checksum-installers` | PASS, 1 run and 1 skip | Coverage mismatch: F-1-4 |
| `offline-reload` | PASS, 2 browser projects | Live offline reload also passed |
| `bundled-ocr` | PASS, 2 browser projects | — |
| `supporter-themes` | PASS, 2 browser projects | — |
| `checkout-live` | PASS; USD 19.00 and HTTP 303 to hosted Dodo checkout | — |

No declared command failed after documented prerequisites were present. Findings
F-1-2 through F-1-20 cover missing or inadequate claim registration.

## History check

There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files.
The existing handoff and two verification reports were read. Every previously
reported repair was checked rather than accepted from its status label:

| Earlier issue | Live/code confirmation |
| --- | --- |
| First-run actions below the desktop window | Fixed; browser tests pass at 1180 × 820 and 390 × 640 |
| Hidden canvas remained in layout/focus | Fixed; computed hidden state and keyboard order tests pass |
| Dark contrast and small targets | Fixed; live axe has zero violations on all routes; target tests pass |
| Checkout unavailable | Fixed; live `$19` checkout returns HTTP 303 to Dodo |
| Incomplete initial claims list | Expanded to 13 and all commands pass, but new coverage findings F-1-2 through F-1-20 remain |
| TypeScript check missing/failing | Fixed; `npm run typecheck` passes |
| Intel macOS received Arm download | Fixed; architecture test passes and live links resolve separately |
| 404 returned HTTP 200 | Fixed; unknown route returns HTTP 404; F-1-35 covers remaining structure defects |
| Empty speech reported success | Fixed; actionable-error test passes |
| Route focus did not restore | Fixed; live forward/back navigation focuses the new h1 |
| License restore/revocation behavior | Fixed; deterministic browser tests pass |

No earlier finding regressed under its old description.

## Structure, accessibility, links, and quality evidence

- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown path returns the
  designed blueprint 404 with HTTP 404.
- Each tested route has `lang=en`, one h1, one main, header, and footer. SPA
  deep links work. Forward and Back both focus the destination h1 and update the
  live region.
- Canonicals update correctly on the four SPA routes. Home has description,
  canonical, OG/Twitter metadata, SVG favicon, and apple-touch icon. See
  F-1-34 through F-1-36 for remaining metadata defects.
- The OG image is a real 1200 × 630 product-specific blueprint image. The visual
  system is recognisably product-specific, not a generic gradient/card SaaS
  template.
- A crawl found no dead live links. Internal routes returned 200; the release
  download returned its expected GitHub 302; checkout returned its expected
  303; Sociobot returned 200; `mailto:` was excluded.
- Response headers include CSP, HSTS, `nosniff`, Referrer-Policy, and
  Permissions-Policy. The home page emitted no console or page errors.
- Live axe WCAG A/AA scans found zero violations at 390 px on `/`, `/demo`,
  `/privacy`, `/terms`, and the real 404. The page has no horizontal overflow.
- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, 1.091 s network-idle load,
  title, `lang`, one h1, main, complete alt text, and no console errors.
- Full clean-clone gates passed: 7 Vitest checks; 69 Playwright checks with one
  intentional platform duplicate skipped; typecheck; strict Clippy; Rust
  format/test; build; and production audit. `dist/app` and `dist/site` exist.
  Site JavaScript is 5.99 KiB gzip, below the 150 KiB limit.

## Missed leverage

No AI, sync, or import/export feature is an obvious requirement of the brief.
The job is local screen-region recognition and speech; adding a remote model
would weaken its offline/privacy value. Copy and Pin already provide the useful
handoff for recognised text. No decorative AI or embedded provider key was
found.

## What would make this perfect

Resolve every finding above: show useful demo output after the first click and
add the captioned walkthrough; make every public promise exactly match one
observable tagged test; simplify the flagged copy and terminology; and bring the
404, titles, and touch icon into the shared route contract. Then rerun this full
review from a fresh clone and fresh browser contexts. The acceptance target is
zero findings, not merely zero test failures.
