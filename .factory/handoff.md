# Point & Speak Desktop — independent verification 3 handoff

## Result: FAIL

Candidate `3680f2f22c21719c1df309943971fd2052ed2f4e` was independently
verified on 2026-08-29 UTC against
`https://point-and-speak-desktop.sociobot.in`. Do not release this candidate
yet.

The static deployment matches the candidate and the product works end to end.
All 18 claim commands, the full test suite, strict lint/type checks, Rust tests,
production build, checkout, privacy, axe, offline, rate-limit, and performance
checks pass. The release remains blocked because the downloadable desktop
artifacts were built from older commit `5446ce0`, not from this candidate.

Full evidence: `.factory/verification-3.md`.

## Defects by severity

### P1 — Candidate desktop binaries were not published

GitHub release `v0.1.2` and workflow run `33180357456` use
`5446ce035d5ff013662c961ccec4284df9451fac`. Candidate `3680f2f` changes
`app/extra.css`, `app/index.html`, `src-tauri/Cargo.toml`,
`src-tauri/src/lib.rs`, and `src-tauri/tauri.conf.json` after that tag. The
downloaded DEB confirms the older package wording. All live download buttons
therefore lead to a valid but non-candidate desktop build.

### P2 — One mobile navigation target is too narrow

At 390 px, the standalone footer `Terms` link measures `38.3 × 44` CSS pixels.
The contract requires at least `44 × 44`. Existing tests assert target height
only and miss the width.

No P0 or P3 defect was found.

## Verification summary

```text
.factory/claims.json                     PASS; 18/18 exact commands
npm test                                 PASS; 10 Vitest, 87 Playwright, 1 intentional skip
npm run typecheck                        PASS
npm run lint                             PASS; Clippy uses -D warnings
cargo fmt --manifest-path src-tauri/Cargo.toml -- --check  PASS
cargo test --manifest-path src-tauri/Cargo.toml            PASS
npm run build                            PASS; dist/app and dist/site
npm audit --omit=dev --audit-level=high PASS; 0 vulnerabilities
verify-url.sh                            PASS; HTTP/title/lang/h1/main/alt/console
axe live                                 PASS; 0 serious/critical across all routes, themes, and viewports
Lighthouse mobile                       95 performance, 100 a11y, 100 best practices, 100 SEO
```

The cold candidate sample OCR completed in 1,379 ms. A 20-region synthetic
pilot using the shipped recognition files produced 20/20 usable results; the
maximum warm recognition time was 198 ms. Demo state stayed isolated, all OCR
traffic stayed local, service-worker update/offline reload passed, and a
50-request license-verification burst produced 30 HTTP 200 plus 20 HTTP 429;
every 429 had `Retry-After: 4`.

The website build matches production exactly for HTML, JS, CSS, and service
worker SHA-256. The existing DEB checksum also matches its published checksum,
and the hosted Linux installer succeeds. The blocker is specifically that
those desktop artifacts predate the candidate.

## Required next steps

1. Give the candidate desktop build a new version and tag.
2. Run `.github/workflows/release.yml` for that tag and confirm all four build
   jobs plus checksums succeed from the candidate source state.
3. Download one new artifact, match it to `SHA256SUMS`, and verify its package
   metadata/build provenance points to the candidate.
4. Expand the footer `Terms` hit area to at least 44 by 44 CSS pixels and add a
   regression assertion for both target width and height.
5. Repeat claims, app smoke tests, live download resolution, and static
   deployment identity checks before changing the verdict to PASS.

## Needs operator action

macOS notarization and Windows Authenticode still require the owner's
`APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` secrets. Unsigned status is not the
reason for this FAIL.
