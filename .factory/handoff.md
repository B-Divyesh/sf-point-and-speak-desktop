# Point & Speak Desktop — polish round 2 handoff

## Status

**PASS — no review finding remains.** The repair is commit
`6a1d310f16a62861a26eafd267adabc142a6af6e`, tagged and released as `v0.1.4`.
It repairs candidate `cb911aaf2c52f7ee18afe2dc80349718882936eb` against every
finding in the cumulative review record.

## What changed

- Added a native, explicit-action capture gateway. The desktop backend accepts
  only `button`, `again`, or `shortcut`; startup and invalid sources cannot
  capture pixels. The new `capture-on-demand` claim uses a fake backend to
  prove zero idle calls and one call after either the Capture screen action or
  configured shortcut.
- Registered the privacy promise in `.factory/claims.json`; the manifest now
  has 19 uniquely tagged, executable claim checks.
- Split the README audience wording into two short sentences, added every
  README prose row to the copy audit, and updated the verb-first catalog line.
- Bumped the complete artifact identity to 0.1.4 and cache name to
  `point-speak-v5`, so the repaired desktop code and live download links refer
  to the same release.
- Recorded every historical finding and its proof in `.factory/polish-2.md`.

## Exact verification

From a clean clone of tag `v0.1.4` at
`/tmp/point-speak-clean-lLqIDY`:

```text
npm ci                                                    PASS (78 packages; 0 audit findings)
npm test                                                  PASS (12 Vitest; 89 Playwright; 1 intentional duplicate skip)
cargo test --manifest-path src-tauri/Cargo.toml          PASS (2 native claims)
npm run lint                                              PASS
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check PASS
npm run build                                             PASS (dist/app and dist/site)
npm audit --omit=dev --audit-level=high                  PASS (0 vulnerabilities)
```

Every command named in `.factory/claims.json` was then executed separately
from that same fresh clone. All 19 passed, including
`@claim:capture-on-demand`, `@claim:selected-region-speech`, offline demo,
privacy/storage, Linux installer checksum, and the live `$19` checkout check.

Live accessibility verification passed:

- `/opt/fleet/lib/verify-url.sh https://point-and-speak-desktop.sociobot.in`
  reports HTTPS 200, title, `lang=en`, one h1, main landmark, complete image
  alts, labelled buttons, and zero console errors.
- Axe WCAG A/AA scans across home, direct demo, `/demo`, `/privacy`, `/terms`,
  and the real 404 in light and dark mode found zero serious/critical issues.
- Lighthouse against production: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100.

Screenshot and machine-readable evidence is in `.factory/evidence/polish-2-*`
and `.factory/evidence/polish-2-live-verify/`.

## Deployment and release

- Static site deployed from `dist/site` through Azure Static Web Apps to
  <https://point-and-speak-desktop.sociobot.in>.
- Cold live checks confirm cache `point-speak-v5`, footer Version 0.1.4, the
  one-click populated `?demo=1` banner/reset path, route titles, no console
  errors, and designed HTTP 404.
- GitHub Actions run
  [33243620220](https://github.com/B-Divyesh/sf-point-and-speak-desktop/actions/runs/33243620220)
  completed successfully for source commit `6a1d310`. Release
  [v0.1.4](https://github.com/B-Divyesh/sf-point-and-speak-desktop/releases/tag/v0.1.4)
  contains Linux AppImage/DEB, Windows setup EXE, Apple Silicon and Intel DMGs,
  `SHA256SUMS`, `latest.json`, and `PROVENANCE.json`.
- The downloaded `Point.Speak.Desktop_0.1.4_amd64.deb` verifies against the
  published checksum. A cold live browser resolved Linux, Windows, and macOS
  to their v0.1.4 assets with no console errors.

## Run locally

```sh
npm ci
npm test
cargo test --manifest-path src-tauri/Cargo.toml
npm run lint
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check
npm run build
```

The isolated sample is at
<https://point-and-speak-desktop.sociobot.in/?demo=1>.

## Remaining operator action

No product, review, or release finding remains. macOS notarization and Windows
Authenticode are optional distribution signing steps that require the owner's
`APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets; the release workflow builds
the current unsigned packages without them.
