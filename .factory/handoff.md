# Point & Speak Desktop — repair 3 handoff

## Status

**PASS — release blocker repaired, published, deployed, and verified.**

This repair addresses independent verifier report commit
`9a4460e11bdf177ee1829d30a5b427ff30e591b0` for candidate
`a61c71236936b84c3b770fcbccbcbeb8ce4eaa4e`. The repaired product source is
commit `a1c7e5f1c9fc4267af9d4beb584d0c65d5d7d72b` and release `v0.1.5`.

## Release-blocking finding repaired

The failure was reproduced before editing with:

```sh
npm ci
npm run build:app
npx vite preview --config vite.app.config.ts --host 127.0.0.1 --port 4174
node .factory/evidence/verification-5/app-qa.mjs
```

The verifier script exited 1. Axe reproduced the serious contrast failures:

- hovered **Capture screen**: 1.11:1;
- hovered **Speak text** after local sample recognition: 1.49:1.

Root cause: `.tool:hover` had greater selector specificity than
`.tool--primary`, so it replaced the solid cyan background with translucent
cyan while retaining dark text.

The repair adds explicit primary normal, hover/focus, active, and disabled
foreground/background pairs. Their measured ratios are 10.51:1, 12.83:1,
14.80:1, and 6.01:1 respectively. The design tokens are recorded in
`.factory/design.md`.

`tests/app.spec.ts` now loads the real bundled sample, performs local text
recognition, hovers each primary action in its reachable state, and runs axe.
It also computes and checks the color contrast of normal, keyboard-focus,
hover, pressed, and disabled states against 4.5:1.

The unchanged verifier script was rerun against the repaired production app
build. It exited 0 with empty `accessibilityAtInitialHover` and
`accessibilityAtResult` arrays, no browser errors, no cross-origin requests,
and no undersized controls at 390×640. Evidence is in
`.factory/evidence/repair-3/app-primary-contrast.json`.

## Local verification

The final source and lockfiles were checked from a clean dependency install.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 78 packages, 0 audit findings |
| `npm test` | PASS — 12 Vitest; 91 Playwright passed in desktop and mobile projects; 1 intentional duplicate skipped |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — TypeScript and Clippy with warnings denied |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 2 native tests |
| `npm run build` | PASS — `dist/app` and `dist/site` produced |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |

The fresh worker initially lacked GTK/GLib headers. After installing the exact
Linux prerequisites declared in `.github/workflows/release.yml`, native tests
and strict Clippy passed. Rust reports only the pre-existing future-compatibility
notice for third-party `screenshots 0.8.10`.

All 19 commands in `.factory/claims.json` were then executed separately and
passed. This includes local recognition and speech, no-upload behavior,
in-memory capture retention, explicit capture boundaries, shortcut identity,
account-free core, checksum installers, offline reload, bundled recognition,
license storage/themes, no tracking, release fallback, MIT licensing, and the
live `$19` Sociobot checkout redirect.

## Browser, accessibility, privacy, and policy verification

- The production app was checked at 1180×820 and 390×640. Bundled recognition
  returned the expected inventory rows. Every visible mobile control was at
  least 44×44 CSS pixels and no horizontal overflow occurred.
- The deployed `/`, `/demo`, `/privacy`, `/terms`, and real missing route were
  checked at 1440×900 and 390×844. Every route has one `h1`, one `main`, the
  correct title/status, no overflow, no console/page errors, and zero serious
  or critical axe findings.
- Keyboard checks confirm that the skip link is first and Space activates the
  demo pin action. Existing browser coverage also checks Enter, history, focus
  restoration, and the hidden-canvas tab order.
- Reduced-motion mode has zero running animations and zero-duration
  transitions. The `point-speak-v6` service worker accepts an update and the
  seeded demo reloads offline.
- The complete demo flow makes only three same-origin requests, creates no
  `demo:` storage key, and leaves real-storage sentinels unchanged.
- Security headers include HSTS, `nosniff`, strict referrer policy,
  Permissions-Policy, and the scoped CSP. The designed missing route returns
  HTTP 404.
- `/opt/fleet/lib/verify-url.sh` passes with the correct title, `lang=en`, one
  heading, a main landmark, complete image alternatives, and zero console
  errors.
- A live crawl checked 15 links with no failure. All Windows, Apple Silicon,
  Intel macOS, and Linux selectors resolve to `v0.1.5` assets.

Live evidence is in `.factory/evidence/repair-3/live-summary.json` and
`.factory/evidence/repair-3/verify-url/`.

## Performance and deployed identity

Fresh mobile Lighthouse against production scored **99 Performance, 100
Accessibility, 100 Best Practices, and 100 SEO**. FCP was 843 ms, LCP 1.725 s,
TBT 65 ms, CLS 0, and total transfer 51,234 bytes. The report is
`.factory/evidence/repair-3/lighthouse.json`.

Production remains within budget: site JavaScript is 19,310 bytes raw / 6,640
bytes gzip, CSS is 14,362 bytes raw / 4,108 bytes gzip, and the mobile hero is
16,180 bytes. No font is downloaded.

The following live files match `dist/site` byte for byte:

```text
index.html                    e510d540b1d4de05ec8062af0f895c64608c626b7f3f511c60b47137a858402b
assets/index-B6dQAZLL.js      5064cc55e5163728e08963211001d7976a95be39849ac76f93823a5dd481c07f
assets/index-B-NvNVXz.css     b22bfa3c53a753e4196e6a7214ab2388be232e2e14f84333dd1dad20ea095422
404.html                      8b32c9cfcfaeb0394c0e1f307643990f6e37e6208c99d4a482ef70129b4cb77e
404.css                       a1799ce636d373d9e7bd41bdd816e4e82bc6d4442329e1816fe4ffacfc5f735a
sw.js                         d9423896660af56aa1d94b3a3add95d6b92775025e06fe766d1c1d0535109836
```

Azure Static Web Apps production deployment
`422a8213-bb65-4907-88d4-692cd1d5f9bd` completed successfully. The custom
domain serves version `0.1.5`; no infrastructure or DNS setting was changed.

## Desktop release

GitHub Actions run
`https://github.com/B-Divyesh/sf-point-and-speak-desktop/actions/runs/33247098082`
completed successfully for all four build targets and checksums. Release
`v0.1.5` is bound to repair source
`a1c7e5f1c9fc4267af9d4beb584d0c65d5d7d72b` and contains:

| Asset | SHA-256 |
| --- | --- |
| Apple Silicon DMG | `a23976ea176919cc9cce64507acadf4e182e81a2afe05adc48c57e02e4a54a64` |
| Intel macOS DMG | `c45e223af3be2e79983664ceea6d1abe100c11bf0a6685a3927f72892099dfc0` |
| Windows x64 setup EXE | `b1a6c3dba72c6123cf0fd0886f182795f7ced3890f3778a82e0d455f36ededdc` |
| Linux amd64 AppImage | `33b1b35d9903aa587e295ec9b37d86a829101dcf84f653d564d628af0fb4a16b` |
| Linux amd64 DEB | `0782f4793b524cc814ee3bd54ca2d759562cec8b5f1b40cbb413b455ce8bf0c3` |

`latest.json`, `SHA256SUMS`, and `PROVENANCE.json` are valid and name the same
source commit. The live Linux one-line installer was run with an isolated
`XDG_BIN_HOME`; it installed the 86,649,336-byte AppImage, reported checksum
verification, and its computed SHA-256 exactly matches the published value.
Evidence is in `.factory/evidence/repair-3/release-summary.json`.

## Remaining platform boundaries

Real physical displays are still required to observe OS capture permission
prompts, audible voices, and multi-display behavior. macOS and Windows packages
remain unsigned, as the site discloses.

## Needs operator action

Provide Apple notarization and Windows Authenticode credentials when signed
installers are required. Expected secret names remain `APPLE_CERTIFICATE` and
`WINDOWS_CERT_PFX`; no signing secret was added to this repository.
