# Adversarial first-read review 3

## Verdict: PASS

Reviewed 2026-08-29 UTC at production
`https://point-and-speak-desktop.sociobot.in` and clean clone
`/tmp/point-speak-review3.ToV900/repo` at commit
`53af93047a5135468038605d6e97d516bfc90398`.

There are zero blocking and zero minor findings. This review did not modify
product code.

## Cold first read

The first screen passed in a fresh browser context at both 390 × 844 and
1440 × 900, before scrolling.

> Read selected screen text aloud
>
> For low-vision desktop users when screen readers miss text in remote
> desktops, old software, games, or visual app interfaces.
>
> Try it with sample data
>
> See an editable result at once. Your real data stays untouched.

- **What it does:** reads text from a selected desktop-screen region aloud.
- **For whom:** low-vision desktop users whose screen reader misses text in
  visual desktop interfaces.
- **First action:** select **Try it with sample data**.

The Local, Offline, and Price facts were visible in the same first screen.
There was one h1, one main landmark, no horizontal overflow, and no page or
console error on either normal landing visit.

## Findings

None.

## Copy audit

Counts use whitespace-separated words; hyphenated terms and prices count as
one word. Buttons and headings are included where they carry an instruction or
result. Code blocks, URLs, file paths, and repository-map fragments are not
prose sentences. No item exceeded 22 words, used a banned marketing adjective,
used unexplained visitor jargon, used a metaphor/mood heading, or used an
action that fails to name its result. Visitor terminology consistently uses
**region**, **text recognition**, **result**, **pin**, **demo**, **supporter
license**, **shortcut**, and **capture window**.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| For low-vision desktop users | 4 | Pass |
| Read selected screen text aloud | 5 | Pass; `selected-region-speech` |
| For low-vision desktop users when screen readers miss text in remote desktops, old software, games, or visual app interfaces. | 19 | Pass |
| Try it with sample data | 5 | Pass; result-naming action |
| See an editable result at once. | 6 | Pass; `demo-ready` |
| Your real data stays untouched. | 5 | Pass; `no-demo-storage` |
| Local: captured images stay on your computer. | 7 | Pass; `local-only` |
| Offline: English text-recognition files ship with the app. | 8 | Pass; `bundled-recognition` |
| Price: core tools are free; supporter license is $19 once. | 10 | Pass; `account-free-core`, `checkout-live` |
| Draw a region around the text you want to hear. | 10 | Pass |
| Choose your system | 3 | Pass |
| Install the desktop app | 4 | Pass |
| v0.1.5 is ready. | 3 | Pass |
| Download for Linux | 3 | Pass; result-naming action |
| Other system | 2 | Pass |
| Desktop walkthrough | 2 | Pass |
| Choose what happens to recognised text | 6 | Pass |
| These three frames show the complete capture. | 7 | Pass |
| Select a region | 3 | Pass |
| Draw around the text that the other app does not expose. | 11 | Pass |
| Review the text | 3 | Pass |
| Correct the editable result before using it. | 7 | Pass |
| Choose an action | 3 | Pass |
| Hear the text, copy it, or keep it visible. | 10 | Pass |
| Three steps | 2 | Pass |
| How Point & Speak works | 5 | Pass |
| Use the shortcut | 3 | Pass |
| The configured shortcut is Ctrl+Shift+Space. | 5 | Pass; `configured-shortcut` |
| The capture window lets you choose a region. | 8 | Pass |
| Choose the text | 3 | Pass |
| Text recognition processes the region you draw on your computer. | 10 | Pass; `selected-region-speech` |
| Speak, copy, or pin | 4 | Pass |
| Edit the result, change its speech speed, or keep it visible. | 11 | Pass; `speech-speed` |
| What the app can see and keep | 7 | Pass |
| Screen capture starts when you ask | 6 | Pass; `capture-on-demand` |
| A capture begins after you choose Capture screen. | 9 | Pass; `capture-on-demand` |
| Captured images are not uploaded. | 5 | Pass; `local-only` |
| Captures stay in memory and disappear when the capture window reloads or closes. | 13 | Pass; `capture-memory` |
| This is an assistive utility, not a safety or medical product. | 11 | Pass |
| Read the privacy note | 4 | Pass; result-naming action |
| Optional page themes | 3 | Pass |
| $19 supporter license adds two themes | 6 | Pass; `checkout-live`, `supporter-themes` |
| The free app includes capture, text recognition, speech, copy, and pin. | 11 | Pass; `account-free-core` |
| The one-time supporter license adds two blueprint page themes. | 9 | Pass; `supporter-themes` |
| Buy a supporter license | 4 | Pass; result-naming action |
| Activate supporter license | 3 | Pass; result-naming action |
| Read selected screen text aloud. | 5 | Pass |
| Generated artwork is disclosed in the design notes. | 8 | Pass |

### README prose

| Sentence | Words | Result |
| --- | ---: | --- |
| Read text from a selected screen region aloud. | 8 | Pass; `selected-region-speech` |
| Point & Speak Desktop is for low-vision users when screen readers miss text. | 13 | Pass |
| It reads text in remote desktops, old software, games, and apps that draw text as images. | 16 | Pass |
| The configured shortcut is Ctrl+Shift+Space. | 5 | Pass; `configured-shortcut` |
| Draw a region, review the recognised text, then speak, copy, or pin it. | 13 | Pass; `selected-region-speech` |
| English text-recognition files ship with the app. | 7 | Pass; `bundled-recognition` |
| Capture, text recognition, speech, copy, and pin work without an account or supporter license. | 14 | Pass; `account-free-core` |
| Captured images stay on the computer and are not uploaded. | 10 | Pass; `local-only` |
| Captures and pinned results stay in memory until the capture window reloads or closes. | 14 | Pass; `capture-memory` |
| This is an assistive utility, not a safety or medical product. | 11 | Pass |
| Check important text against the original screen. | 7 | Pass |
| Open the isolated sample directly. | 5 | Pass |
| The first screen contains three fictional inventory rows as editable text. | 11 | Pass; `demo-ready` |
| Speak, copy, pin, edit, or reset the result. | 8 | Pass |
| Demo actions do not change saved license or release data. | 10 | Pass; `no-demo-storage` |
| The demo reloads offline after the first visit. | 8 | Pass; `offline-reload` |
| Requirements: Node.js 22, Rust stable, and the Tauri 2 system dependencies. | 11 | Pass |
| Choose Load sample region to test the bundled recognition path without granting screen-capture permission. | 14 | Pass |
| Every public product claim and its isolated command are listed in claims.json. | 12 | Pass |
| Download the current installer from the GitHub Releases page. | 9 | Pass |
| The Linux script checks the downloaded AppImage against its published SHA256 checksum before installing it. | 15 | Pass; `linux-checksum-installer` |
| Maintainers create desktop releases from tags with release.yml. | 8 | Pass |
| The static site deploys from dist/site. | 6 | Pass |
| The website has no advertising, user tracking, or third-party scripts. | 10 | Pass; `website-no-tracking` |
| The download page asks GitHub for release data. | 8 | Pass; `release-request` |
| A supporter license token and its last verification are stored in browser storage and sent only to Sociobot for verification. | 20 | Pass; `license-storage` |
| The optional supporter license costs $19 once and adds two blueprint page themes. | 13 | Pass; `supporter-themes` |
| Payment uses Sociobot checkout. | 4 | Pass; `checkout-live` |
| The free tools remain available without a license. | 8 | Pass; `account-free-core` |
| Read the live privacy policy and terms. | 7 | Pass |
| The project is MIT licensed. | 5 | Pass; `mit-license` |
| Generated artwork provenance is recorded in design.md. | 7 | Pass |

## Demo and sandbox

One landing-page click opened `/?demo=1`. The first 390 px screen already
contained the realistic three-row editable inventory result, **Speak text**,
**Copy text**, **Pin result**, and the speech-speed control. The persistent
banner read **“Demo — sample data, nothing is saved”** and included **Reset
demo** and **Start for real**.

Pin, Remove pin, edit, replay, and Reset were exercised. Reset restored the
seeded rows and removed the pin. A direct fresh demo visit made requests only
to `point-and-speak-desktop.sociobot.in`; it created no localStorage or
sessionStorage key before or after those actions, and sentinel real data was
not read or changed. The registered offline-reload test passed after the first
visit. This verifies that demo state is isolated DOM state, not real storage.

## Claims

`.factory/claims.json` contains 19 entries. A fresh clone received `npm ci`.
The browser claim tests passed in a single Playwright run selecting all fifteen
declared browser tags (23 tests across the two configured browser projects).
The two native commands initially reported the absence of `glib-2.0` headers;
after installing the documented Tauri 2 Linux prerequisites, both passed. This
was an environment prerequisite, not an assertion failure. The focused MIT and
live checkout commands also passed.

| Claim | Result |
| --- | --- |
| `selected-region-speech` | Pass |
| `local-only` | Pass |
| `speech-speed` | Pass |
| `pin-result` | Pass |
| `demo-ready` | Pass |
| `no-demo-storage` | Pass |
| `capture-memory` | Pass |
| `capture-on-demand` | Pass |
| `configured-shortcut` | Pass |
| `account-free-core` | Pass |
| `linux-checksum-installer` | Pass |
| `offline-reload` | Pass |
| `bundled-recognition` | Pass |
| `supporter-themes` | Pass |
| `license-storage` | Pass |
| `website-no-tracking` | Pass |
| `release-request` | Pass |
| `mit-license` | Pass |
| `checkout-live` | Pass — USD 19.00 and HTTP 303 to HTTPS Dodo checkout |

Every live claim-like sentence above has a matching declaration and observable
test. No unlisted claim was found.

## Structure, accessibility, privacy, and visual checks

- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` returned HTTP 200. An
  unknown route returned the designed HTTP 404 with **Page not found** and
  **Return home**.
- Normal route titles, h1s, descriptions, canonicals, OG/Twitter metadata,
  favicon, 180 × 180 touch icon, robots, sitemap, and shared header/footer
  passed inspection. The title pattern is product name plus a plain description
  on home and `Route — Product` on named routes.
- Back navigation restored the landing route and focused its h1. Route changes
  update the polite live region. All crawled internal links returned 200;
  explicit external download and checkout links returned the expected 302 and
  303 respectively.
- Direct demo request logging observed only same-origin assets. Home's one
  external request was the declared GitHub release-data request. No analytics,
  third-party script, font, or provider key was observed.
- Axe WCAG A/AA scans at 390 px found zero violations on home, demo, privacy,
  and terms. Keyboard, 44 px target, focus, reduced-motion, and route checks
  also pass in the shipped browser suite.
- The distinctive cyan selection box, ruled drafting surface, technical
  captions, original blueprint art, and three task-specific walkthrough frames
  implement `.factory/design.md`; this is not a generic SaaS template.

The brief does not imply an AI action, import/export, or sync that a normal
visitor would expect beyond the supplied capture, edit, speak, copy, and pin
workflow. No decorative AI feature or embedded provider key was found.

## Earlier finding verification

Every earlier `review-*.md`, `polish-*.md`, verification record, and handoff
was read. The live site and current code were checked for each prior finding;
all remain fixed.

| Earlier id | Status | Live/code confirmation |
| --- | --- | --- |
| F-1-1 | Fixed | One click opens the seeded editable result; three walkthrough frames remain. |
| F-1-2 | Fixed | Narrow selected-region wording and passing selected-region-to-speech claim. |
| F-1-3 | Fixed | Public promise is the configured shortcut; matching native assertion passes. |
| F-1-4 | Fixed | Public installer-checksum promise is singular Linux and passes. |
| F-1-5 | Fixed | Boundary `only`/`ignored` wording is absent; controlled fixture excludes header. |
| F-1-6 | Fixed | Copy names the capture window rather than an unproved overlay. |
| F-1-7 | Fixed | Speech rate 1.5 reaches the speech API in its registered test. |
| F-1-8 | Fixed | `CaptureAction` admits button/again/shortcut only; native test passes. |
| F-1-9 | Fixed | Exact license storage and Sociobot-only verification are registered. |
| F-1-10 | Fixed | Route crawl claim checks tracking, scripts, cookies, and storage. |
| F-1-11 | Fixed | Account-free full core flow is declared and passes. |
| F-1-12 | Fixed | The unsupported funds-maintenance sentence is absent. |
| F-1-13 | Fixed | Unsupported refund/user claims are absent; terms link to Sociobot policy. |
| F-1-14 | Fixed | Public wording is limited to bundled English recognition files. |
| F-1-15 | Fixed | Public release-matrix promise is removed. |
| F-1-16 | Fixed | Public manifest-publication promise is removed. |
| F-1-17 | Fixed | GitHub request/fallback has `release-request` coverage. |
| F-1-18 | Fixed | Separate architecture claim is not public copy. |
| F-1-19 | Fixed | Empty-release fallback is tested by `release-request`. |
| F-1-20 | Fixed | Blanket unsigned-package claim is absent. |
| F-1-21 | Fixed | Visitor copy uses plain visual-app language, not canvas jargon. |
| F-1-22 | Fixed | Visitor copy uses text recognition, not unexplained OCR. |
| F-1-23 | Fixed | Decorative drawing label is absent. |
| F-1-24 | Fixed | Section is named Three steps. |
| F-1-25 | Fixed | Privacy label names what the app can see and keep. |
| F-1-26 | Fixed | Demo is the consistent visitor-facing term. |
| F-1-27 | Fixed | Action heading names recognised-text actions. |
| F-1-28 | Fixed | Capture heading is direct and its behavior is registered. |
| F-1-29 | Fixed | Pricing heading gives the exact $19 result. |
| F-1-30 | Fixed | License action is named Activate supporter license. |
| F-1-31 | Fixed | Visitor copy uses capture window consistently. |
| F-1-32 | Fixed | Real 404 is direct and has a home recovery action. |
| F-1-33 | Fixed | Footer shows Version 0.1.5 and an ISO build date. |
| F-1-34 | Fixed | Route titles use the full product name. |
| F-1-35 | Fixed | Static HTTP 404 includes full metadata and shared skeleton. |
| F-1-36 | Fixed | Touch icon is a real 180 × 180 asset. |
| F-2-1 | Fixed | `capture-on-demand` is declared and the native explicit-action boundary passes. |
| F-2-2 | Fixed | README audience text is split; every prose sentence is at most 22 words. |

## What would make this perfect

No product change is required. Keep the existing claims-first clean-clone run,
direct-demo request/storage check, and cold mobile review in the release gate
so this verified state remains true.
