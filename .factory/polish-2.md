# Polish round 2

Polished release candidate `cb911aaf2c52f7ee18afe2dc80349718882936eb`
against the cumulative records in `review-1.md`, `polish-1.md`,
`verification*.md`, and `review-2.md`. The product repair is version `0.1.4`.

## Finding closure

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the direct demo seeded with its editable three-row result and actions; kept the three captioned walkthrough frames. | `@claim:demo-ready`; `.factory/evidence/polish-2-demo-mobile.png`; `/?demo=1` |
| F-1-2 | Kept the narrowed selected-region wording and controlled selected-region-to-speech test. | `@claim:selected-region-speech`; `.factory/evidence/polish-2-home-mobile.png`; `/` |
| F-1-3 | Kept the modest configured-shortcut claim. | `@claim:configured-shortcut`; `src-tauri/src/lib.rs`; `/` |
| F-1-4 | Kept the single Linux-install-script checksum wording and fixture test. | `@claim:linux-checksum-installer`; `README.md`; `/` |
| F-1-5 | Kept boundary wording free of the unproved “only” promise; the fixture excludes decoy header text. | `@claim:selected-region-speech`; `/` |
| F-1-6 | Kept the tested capture-window wording rather than an overlay promise. | `tests/site.spec.ts`; `/` |
| F-1-7 | Kept speech-rate propagation coverage. | `@claim:speech-speed`; `/?demo=1` |
| F-1-8 / F-2-1 | Added the native `CaptureAction` gate. Only `button`, `again`, or `shortcut` reach the capture backend; the fake-backend test proves zero startup/invalid-source calls and one call after button or shortcut. | `@claim:capture-on-demand`; `src-tauri/src/lib.rs`; `/` |
| F-1-9 | Kept exact license storage keys and Sociobot-only verification coverage. | `@claim:license-storage`; `/privacy` |
| F-1-10 | Kept the route crawl that rejects trackers, third-party scripts, cookies, and unexpected storage. | `@claim:website-no-tracking`; `/privacy` |
| F-1-11 | Kept the account-free complete core-flow test. | `@claim:account-free-core`; `/` |
| F-1-12 | Kept untestable funds-maintenance copy removed. | Copy audit; `/` |
| F-1-13 | Kept unsupported purchase-policy details removed and linked to Sociobot terms. | Link crawl; `/terms` |
| F-1-14 | Kept the public claim limited to shipped English text-recognition files. | `@claim:bundled-recognition`; `/` |
| F-1-15 | Kept release-matrix promises out of visitor copy. | README audit; `/` |
| F-1-16 | Kept unregistered publication wording out of visitor copy. | README audit; `/` |
| F-1-17 | Kept the GitHub release request and fallback as the registered behavior. | `@claim:release-request`; `/` |
| F-1-18 | Kept separate-architecture implementation coverage without an unsupported visitor promise. | `macOS selector resolves separate Apple Silicon and Intel assets`; `/` |
| F-1-19 | Kept the missing-release fallback registered and tested. | `@claim:release-request`; `/` |
| F-1-20 | Kept blanket unsigned-package marketing copy removed. | README audit; `/` |
| F-1-21 | Kept visitor copy free of canvas jargon. | `.factory/copy-audit.md`; `/` |
| F-1-22 | Kept visitor copy on “text recognition,” not unexplained OCR. | `.factory/copy-audit.md`; `/` |
| F-1-23 | Kept decorative drawing labels removed. | `.factory/evidence/polish-2-home-mobile.png`; `/` |
| F-1-24 | Kept the literal Three steps heading. | `tests/site.spec.ts`; `/` |
| F-1-25 | Kept the privacy section labelled for what the app can see and keep. | `.factory/evidence/polish-2-home-mobile.png`; `/` |
| F-1-26 | Kept visitor terminology on demo. | `@claim:demo-ready`; `/?demo=1` |
| F-1-27 | Kept the result-action heading literal. | `.factory/evidence/polish-2-home-mobile.png`; `/` |
| F-1-28 | Replaced the prior unproved capture-on-demand language with the newly proved native capture gate and registered claim. | `@claim:capture-on-demand`; `/` |
| F-1-29 | Kept the literal $19 supporter-theme heading. | `@claim:checkout-live`; `/` |
| F-1-30 | Kept the result-naming Activate supporter license action. | `tests/site.spec.ts`; `/` |
| F-1-31 | Kept capture-window terminology consistent. | `.factory/copy-audit.md`; `/` |
| F-1-32 | Kept the direct designed 404 recovery copy. | `.factory/evidence/polish-2-404-desktop.png`; `/definitely-missing-polish-2` |
| F-1-33 | Bumped the footer build identity to Version 0.1.4. | `tests/config.spec.ts`; `/` |
| F-1-34 | Kept full product-name route titles. | `route metadata and skeleton` tests; `/privacy`, `/terms` |
| F-1-35 | Kept complete metadata and shared skeleton on the HTTP 404. | `route metadata and skeleton /missing-page`; `/definitely-missing-polish-2` |
| F-1-36 | Kept the exact 180 × 180 touch icon regression test. | `ships a 180 by 180 apple touch icon`; `/` |
| F-2-2 | Split the README audience sentence into two short sentences and added complete README prose audit rows. | `.factory/copy-audit.md`; `README.md`; `/` |

## Evidence set

- Clean dependency install and complete browser suite: `npm ci`, then `npm test`
  — 12 Vitest checks and 89 Playwright checks passed; one intentional duplicate
  installer project skipped.
- Every command in `.factory/claims.json` was executed separately, including
  native capture-on-demand, configured-shortcut, and live checkout claims.
- `npm run lint`, `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check`,
  `cargo test --manifest-path src-tauri/Cargo.toml`, `npm run build`, and
  `npm audit --omit=dev --audit-level=high` passed.
- Local and deployed cold-route screenshots/checks are retained under
  `.factory/evidence/polish-2-*`; the deployed checks use
  `https://point-and-speak-desktop.sociobot.in`.
