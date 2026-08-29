# Polish round 1

Polished candidate `cc578e482262ce2405cfa4a20b36cae870ed2df4` against
review commit `109987b081b05f0cc402f480fa86fbcee9381b9f`. The repair
implementation is commit `d76d620`. Every finding in `review-1.md` is closed.
There were no earlier `review-*.md` or `polish-*.md` files.

## Finding closure

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | The first demo paint now contains a selected region, realistic editable result, and Speak, Copy, and Pin actions. The landing page has three captioned walkthrough frames. | `@claim:demo-ready`; [live demo](https://point-and-speak-desktop.sociobot.in/?demo=1); `evidence/polish-1-demo-mobile.png` |
| F-1-2 | Narrowed the headline to “Read selected screen text aloud” and registered the exact claim. The app test recognises a controlled selected-region fixture and passes the result to speech. | `@claim:selected-region-speech`; `tests/app.spec.ts`; `evidence/polish-1-home-mobile.png` |
| F-1-3 | Narrowed the promise to the configured key combination. The Rust test checks the configuration used by registration. | `@claim:configured-shortcut`; `src-tauri/src/lib.rs` |
| F-1-4 | Limited the public and registered checksum promise to the Linux installer. | `@claim:linux-checksum-installer`; clean-clone claim log |
| F-1-5 | Removed “only” and “ignored” boundary claims. The controlled fixture still confirms decoy text outside the marked region is excluded. | `@claim:selected-region-speech` |
| F-1-6 | Replaced the unproved overlay claim with “The capture window lets you choose a region.” | Copy audit; first-screen/browser suite |
| F-1-7 | Registered speech-speed behavior and assert the selected `1.5` rate reaches the speech API. | `@claim:speech-speed` |
| F-1-8 | Replaced broad monitoring/click claims with explicit capture initiation and upload wording. | `@claim:local-only`; demo request-isolation test |
| F-1-9 | Registered the exact license-token keys and the sole verification destination. | `@claim:license-storage` |
| F-1-10 | Registered a crawl of every route that checks scripts, requests, cookies, and storage. | `@claim:website-no-tracking`; live axe/console evidence |
| F-1-11 | Registered the account-free core flow and assert no authentication, license, or remote recognition dependency. | `@claim:account-free-core` |
| F-1-12 | Removed the untestable “funds maintenance” statement. | Copy audit; [live home](https://point-and-speak-desktop.sociobot.in/) |
| F-1-13 | Removed unsupported one-user, refund, and revocation promises. Terms now link to Sociobot's authoritative terms. | Legal-link browser crawl; [live terms](https://point-and-speak-desktop.sociobot.in/terms) |
| F-1-14 | Narrowed the statement to shipped English text-recognition files. | `@claim:bundled-recognition` |
| F-1-15 | Removed user-facing workflow-trigger and package-matrix prose. Maintainer docs point to the workflow itself. | README audit; `.github/workflows/release.yml` |
| F-1-16 | Removed the unregistered publication sentence. | README audit; live release API inspection |
| F-1-17 | Removed the platform-detection promise and registered the actual GitHub release request and fallback. | `@claim:release-request` |
| F-1-18 | Removed the public separate-architecture promise. The existing architecture regression test remains. | `macOS selector resolves separate Apple Silicon and Intel assets` |
| F-1-19 | Registered the empty-release fallback and zero-console-error result. | `@claim:release-request` |
| F-1-20 | Removed the blanket unsigned-package claim from visitor and README copy. Release-specific signing details remain operator-facing. | Copy audit; landing-page browser suite |
| F-1-21 | Replaced “canvas” jargon with remote desktops, old software, games, and visual app interfaces. | `.factory/copy-audit.md`; live home screenshot |
| F-1-22 | Replaced visitor-facing “OCR” with “text recognition.” | `.factory/copy-audit.md`; site/README text search |
| F-1-23 | Replaced “drawing 01” with “For low-vision desktop users.” | Live home screenshot |
| F-1-24 | Replaced “Procedure / three operations” with “Three steps.” | Live home; walkthrough-count test |
| F-1-25 | Replaced the abstract privacy label with “What the app can see and keep.” | Live home |
| F-1-26 | Standardised visitor-facing terminology on “demo.” | `@claim:demo-ready`; README and demo route |
| F-1-27 | Replaced the slogan with “Choose what happens to recognised text.” | Live home |
| F-1-28 | Replaced the unclear heading with “Screen capture starts only when you ask.” | Live home |
| F-1-29 | Replaced the mission slogan with the literal `$19` theme-license heading. | `@claim:checkout-live`; live home |
| F-1-30 | Renamed the action “Activate supporter license.” | License restore/revocation browser test |
| F-1-31 | Standardised the native UI term on “capture window” and the action on “capture.” | `.factory/copy-audit.md` terminology table |
| F-1-32 | Rewrote the 404 to “Page not found,” direct explanation, and “Return home.” | `evidence/polish-1-404-desktop.png`; real live HTTP 404 |
| F-1-33 | Footer now says “Version 0.1.2 · build 2026-08-28.” | Route-skeleton tests; live screenshots |
| F-1-34 | Every route title uses the full product name. | Route metadata tests; `evidence/polish-1-live-check.json` |
| F-1-35 | The real static 404 now has complete metadata, header/nav, footer, product line, factory credit, and build id. | Real live HTTP 404; `evidence/polish-1-404-desktop.png` |
| F-1-36 | Replaced the 256 px touch icon with a real 180 × 180 PNG. | `apple touch icon is exactly 180 by 180 pixels` |

## Verification evidence

- Every one of the 18 commands in `.factory/claims.json` passed separately
  after `npm ci` in clean clone `/tmp/point-speak-claims-vBo62H/repo`. Full
  output: `evidence/claim-tests-clean-clone.log`.
- Aggregate `npm test`: 10 Vitest checks and 87 Playwright checks passed; one
  duplicate Linux-installer run was intentionally skipped in the mobile
  project.
- `npm run lint`, `cargo fmt --check`, `cargo test`, `npm run build`, and
  `npm audit --omit=dev` passed. Both `dist/app` and `dist/site` were produced.
- Live `verify-url.sh` passed with no console errors. Live axe CLI found zero
  violations on home, demo, privacy, and terms. Raw reports are in `evidence/`.
- Mobile Lighthouse: Performance 95, Accessibility 100, Best Practices 100,
  SEO 100, LCP 1.2 s, CLS 0, and 50 KiB transferred.
- Cold production checks passed at 390 × 844 and 1440 × 900 with one h1, one
  main, no overflow, correct titles, and no console errors. The missing route
  returned HTTP 404 with the complete designed page.
- Release `v0.1.2` exposes macOS Arm/Intel, Windows, and Linux assets plus
  `SHA256SUMS` and `latest.json`. The downloaded Windows setup file matched its
  published SHA-256 exactly.

## Live conclusion

The deployed site at
<https://point-and-speak-desktop.sociobot.in> was opened cold after deployment.
All F-1-1 through F-1-36 changes are present on the live build. No review
finding remains unresolved.
