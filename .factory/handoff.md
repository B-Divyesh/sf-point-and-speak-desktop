# Point & Speak Desktop — repair 2 handoff

## Status

Release-blocking findings from independent verification commit
`1f9e684140fb06eca0c5c4f7caa945fa30935ce9` are repaired in version `0.1.3`.
The product remains a Tauri 2 desktop app with a static Azure landing site.

## Findings reproduced and repaired

### P1 — published installers did not represent the candidate

- Reproduced: GitHub release `v0.1.2` targets
  `5446ce035d5ff013662c961ccec4284df9451fac`, while the verified candidate was
  `3680f2f22c21719c1df309943971fd2052ed2f4e` and contained shipped desktop
  changes after that tag.
- Repair: bumped the npm, Cargo, Tauri, site, 404, and service-worker identities
  to `0.1.3` / cache `point-speak-v4`.
- Root-cause guard: every release matrix job now rejects a non-tag ref, a tag
  that differs from the package version, inconsistent npm/Cargo/Tauri versions,
  or a checkout whose SHA differs from `GITHUB_SHA`.
- Publication evidence: tag `v0.1.3` and GitHub Actions run `33238670297`
  target exact candidate `b1346c821dd91b05275db4caddf48471eb232bd9`.
  All four platform builds and the checksum job completed successfully. The
  release contains Linux AppImage and DEB, Windows setup EXE, Intel and Apple
  Silicon DMGs, `SHA256SUMS`, `latest.json`, and `PROVENANCE.json`.
- Regression: `tests/config.spec.ts` proves a deliberately stale workflow SHA
  is rejected and checks the checksum/provenance publication contract.

### P2 — mobile Terms target was too narrow

- Exact reproduction before repair: at `390 × 844`, footer Terms measured
  `38.296875 × 44` CSS pixels.
- Repair: standalone footer navigation links now have `min-width: 44px` and
  `min-height: 44px` with centred content.
- Exact result after repair: Terms measures `44 × 44` CSS pixels on `/` and
  `/terms` at 390px, with no horizontal overflow.
- Regression: `tests/site.spec.ts` asserts both width and height for every
  standalone mobile target and has a dedicated Terms `44 × 44` test.

## Verification evidence

Run from a clean dependency install on 2026-08-29 UTC:

```text
npm ci                                      PASS; 78 packages, 0 audit findings
npm test                                    PASS; 12 Vitest, 89 Playwright, 1 intentional duplicate skip
npm run typecheck                           PASS
npm run lint                                PASS; TypeScript and cargo clippy -D warnings
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check  PASS
cargo test --manifest-path src-tauri/Cargo.toml            PASS; 1 native claim test
npm run build                               PASS; dist/app and dist/site
npm audit --omit=dev --audit-level=high     PASS; 0 vulnerabilities
npm run test:checkout                       PASS; USD 19, HTTP 303 to hosted Dodo checkout
```

The native checks used the exact Linux prerequisites declared in the release
workflow. Rust still reports the existing future-compatibility notice in the
third-party `screenshots 0.8.10` crate; it does not fail strict lint or tests.

Browser coverage includes desktop and 390px mobile, both Playwright projects,
keyboard route/back focus, one-click demo, local OCR, empty/error states,
light/dark axe scans on every route, touch targets, reduced motion, offline
reload and service-worker update, same-origin demo privacy, release and license
request policy, and the designed 404 response configuration. All 18 claim
tests pass through the full suite plus the native shortcut and live checkout
commands. No researched behavior or claim was removed.

`verify-url.sh` against the repaired local production site reports HTTP 200,
the correct title and `lang`, one `h1`, a main landmark, complete alt text,
labelled buttons, and zero console/page errors. Desktop and mobile screenshots,
the Terms screenshot, verifier JSON, and Lighthouse JSON are in
`.factory/evidence/repair-2/local/`.

The repaired static site was deployed to Azure Static Web Apps and verified at
`https://point-and-speak-desktop.sociobot.in`. Live HTML, service worker, JS,
and CSS match `dist/site` byte-for-byte:

```text
index.html                    c87f2b93536e341a7b6728656d520d4ecdbc72ea016fbfa54562898760c64d0c
sw.js                         a0c02fa091427350a4445b9ba07c8911e9ece7d2e5c98b7c63035fb50de8bf6a
assets/index-B-NvNVXz.css     b22bfa3c53a753e4196e6a7214ab2388be232e2e14f84333dd1dad20ea095422
assets/index-B6dQAZLL.js      5064cc55e5163728e08963211001d7976a95be39849ac76f93823a5dd481c07f
```

Live verification also passed 20 axe route/theme/viewport scans, keyboard skip
and history focus, reduced motion, security headers, route status policy,
offline demo reload, and service-worker update to `point-speak-v4`. The invalid
license response remains `valid: false`, `reason: invalid`, and `no-store`;
the burst limiter returned `429` with `Retry-After`, and CORS allowed only the
product origin. Evidence is in `.factory/evidence/repair-2/live/`.

The release was downloaded independently. `sha256sum -c SHA256SUMS` passed for
all five installers plus both metadata files. `latest.json` exposes 2 Linux,
2 macOS, and 1 Windows URLs. `PROVENANCE.json` contains five installer subjects,
all matching the published checksums and source candidate. The downloaded DEB
reports version `0.1.3` and the repaired “Read selected screen text aloud”
description. The hosted Linux installer verified SHA-256 and installed
`Point.Speak.Desktop_0.1.3_amd64.AppImage` (86,657,528 bytes) in an isolated
PATH. A fresh live browser resolved Windows, Linux, macOS Apple Silicon, and
macOS Intel choices to their real `v0.1.3` assets without a console error.

Fresh mobile Lighthouse against `dist/site`:

```text
Performance 100  Accessibility 100  Best Practices 100  SEO 100
FCP 0.9 s        LCP 1.4 s           TBT 20 ms            CLS 0
Transfer 50 KiB
```

Production bundles remain below contract budgets:

```text
site JS       19.31 kB raw / 6.57 kB gzip
site CSS      14.36 kB raw / 4.09 kB gzip
desktop JS    36.31 kB raw / 12.72 kB gzip
desktop CSS    3.78 kB raw / 1.51 kB gzip
mobile hero   16.18 kB
fonts          no download
```

## Run and verify

```sh
npm ci
npm test
npm run typecheck
npm run lint
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
cargo test --manifest-path src-tauri/Cargo.toml
npm run build
npm run test:checkout
```

The demo remains at
`https://point-and-speak-desktop.sociobot.in/?demo=1`. Static deployment output
is `dist/site`. Desktop installers are built only by
`.github/workflows/release.yml`, as required by the installer contract.

## Known limits and operator action

- Real hardware is still required to observe platform permission dialogs,
  audible system speech, and compositor-specific multi-display capture.
- macOS and Windows installers are unsigned. Notarization and Authenticode
  require the owner's `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets.
- The existing `screenshots 0.8.10` future-compatibility warning should be
  revisited when its upstream crate releases a compatible update.
