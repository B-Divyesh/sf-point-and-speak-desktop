# Point & Speak Desktop — polish round 1 handoff

## Result

PASS. Repair commit `d76d620` resolves all 36 findings in
`.factory/review-1.md`, including the blocking demo and claim-coverage issues.
The static site was deployed under work order
`point-and-speak-desktop-polish-1` as Azure deployment
`b0eec70d-390f-40a3-b3f4-9f2e77f21686`.

Live URL: <https://point-and-speak-desktop.sociobot.in>

## What changed

- Added a truly one-click, storage-isolated `?demo=1` sample with a persistent
  banner, Reset demo, Start for real, completed editable result, and three-frame
  walkthrough.
- Rewrote the first screen, all flagged jargon, the pricing section, legal
  copy, footer build label, and 404 recovery text in plain words.
- Added exact per-route titles, descriptions, canonicals, social metadata,
  focus/history behavior, shared 404 structure, and a 180 px touch icon.
- Registered 18 bounded claims and gave each exactly one tagged observable
  test. Demo entry cancels real release/license work and never reads or writes
  real storage.
- Repaired small-screen type, layout, and 44 px controls while preserving the
  black, paper, orange, and cyan technical-blueprint visual system.
- Updated README, demo/design/copy audits, catalog description, and MIT license
  evidence. `.factory/polish-1.md` maps every finding to its proof.

Catalog description: “Read text from a selected desktop region aloud, then
edit, copy, or pin it.” (verb-first, 75 characters).

## Exact verification

From the final working tree:

```text
npm ci                                      PASS; 0 vulnerabilities
npm test                                    PASS; 10 Vitest, 87 Playwright, 1 intentional duplicate skip
npm run lint                                PASS; TypeScript and Clippy -D warnings
npm run build                               PASS; dist/app and dist/site
npm run build:site                          PASS; dist/site
npm audit --omit=dev                        PASS; 0 vulnerabilities
cargo fmt --manifest-path src-tauri/Cargo.toml --check  PASS
cargo test --manifest-path src-tauri/Cargo.toml         PASS; 1 native test
```

Every command in `.factory/claims.json` was then run separately from clean
clone `/tmp/point-speak-claims-vBo62H/repo`. All 18 passed. The live checkout
test returned USD 19 and HTTP 303 to the hosted Dodo checkout. See
`.factory/evidence/claim-tests-clean-clone.log`.

Production evidence after deployment:

```text
verify-url.sh                                PASS; HTTP 200, title/lang/h1/main/alt, zero console errors
axe CLI on /, /demo, /privacy, /terms        PASS; 0 violations on all four pages
cold mobile/desktop browser checks           PASS; correct titles/h1/main, no overflow or console errors
HTTP / /demo /privacy /terms                 200
HTTP /definitely-missing-polish-1            404 with designed shared skeleton
Lighthouse mobile                            95 performance, 100 accessibility, 100 best practices, 100 SEO
Lighthouse web vitals                        LCP 1.2 s, CLS 0; 50 KiB transfer
```

The site bundles 6.57 KiB gzip JavaScript and 4.08 KiB gzip CSS. The desktop UI
bundle is 12.72 KiB gzip JavaScript and 1.51 KiB gzip CSS. These are below the
specified budgets.

Release `v0.1.2` remains available with macOS Arm/Intel DMGs, Windows setup,
Linux AppImage/DEB, `SHA256SUMS`, and `latest.json`. A fresh download of
`Point.Speak.Desktop_0.1.2_x64-setup.exe` matched SHA-256
`64ef78933131028f7c148e965d78ff8cf073f152a2e62205a3b67f4eca217cee`.

## Run and verify

```bash
npm ci
npm test
npm run lint
npm run build
cargo test --manifest-path src-tauri/Cargo.toml
```

Direct demo: <https://point-and-speak-desktop.sociobot.in/?demo=1>

## Remaining work

No review finding or product defect is known to remain.

### Needs operator action

The current installers are unsigned. Add `APPLE_CERTIFICATE` and
`WINDOWS_CERT_PFX` repository secrets when the owner has signing certificates;
the release workflow already provides the platform build boundary.
