# Point & Speak Desktop — repair 4 handoff

## Status

**PASS — verifier blocker repaired, pushed, deployed, and verified.**

This repair addresses independent report commit
`ae5b6823531550ac6b787157712a47eb7db3b27b` for candidate
`e30e9298488fd07d5eb5ee7b062b447bedf66be6`. The product repair commits are
`0c77f0f` and `d16e381` on `main`.

## Release-blocking finding repaired

At 390×844, the homepage **Read the privacy note** link reproduced at
223.734×21 CSS pixels. The cause was a target-size rule limited to header,
footer, and demo-banner links. The previous regression used the same partial
selector and therefore could not see content links.

The repair gives boundary and legal-page links a 44 px minimum height and an
8 px vertical hit area. The mobile regression now checks every visible link,
button, input, and select on `/`, both demo URLs, `/privacy`, `/terms`, the SPA
not-found view, and the standalone `/404.html` response document.

The expanded check also found and repaired two instances of the same cause
outside the reported route: legal-page email links were 21 px high, and the
standalone 404 footer's **Terms** link was 38.297 px wide. Final production
measurements are:

- homepage privacy link: 223.734×44 px;
- narrowest interactive target across all SPA routes: 44×44 px;
- standalone 404 Terms link: 44×44 px;
- undersized visible targets: 0.

The brief, copy, claims, visual thesis, native capture behavior, and every
previously passing product behavior remain unchanged.

## Clean local verification

The final source and lockfiles were checked with the repository's declared
Node 22 and Tauri prerequisites.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 78 packages installed; 0 audit findings |
| `npm test` | PASS — 12 Vitest; 91 Playwright passed in desktop and mobile projects; 1 intentional duplicate skipped |
| Focused all-target regression | PASS in both Playwright projects |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — TypeScript and strict Clippy |
| `cargo fmt --manifest-path src-tauri/Cargo.toml -- --check` | PASS |
| `cargo test --manifest-path src-tauri/Cargo.toml` | PASS — 2 native tests |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |
| `npm run build` | PASS — `dist/app` and `dist/site` produced |

Rust emits only the existing future-compatibility notice for third-party
`screenshots 0.8.10`; strict Clippy and native tests pass.

Every command in `.factory/claims.json` was run separately. All 19 claims
passed, including the two native assertions and live checkout. Checkout lists
USD 19.00 and returns HTTP 303 to an HTTPS Dodo checkout session.

## Browser, accessibility, privacy, and offline verification

- The real bundled OCR flow passed at 1180×820 and 390×640. It returned the
  sample rows, omitted the header, made no external request, produced no
  console error or overflow, and had no target below 44 px.
- Production `/`, `/?demo=1`, `/demo`, `/privacy`, `/terms`, and a real 404
  were checked at 390×844 in both light and dark modes. All 12 combinations
  have one `h1`, one `main`, correct titles/statuses, no overflow, and zero
  serious or critical findings with the Playwright axe integration.
- The first Tab reaches **Skip to main content**. Space activates **Pin
  result**. Existing suite coverage also verifies Enter selection and history
  focus restoration.
- At 200% root text size, the demo has zero horizontal overflow. Reduced-motion
  mode has `scroll-behavior: auto`, zero running animations, and zero-duration
  transitions.
- The complete direct-demo flow requests only the product origin, creates no
  storage keys, and reports no browser error.
- `point-speak-v6` accepts an update and the seeded demo reloads offline under
  service-worker control.
- A live invalid license is stripped from the URL, stored only in the declared
  license namespace, and sent to Sociobot. Its response is HTTP 200 with
  `Cache-Control: no-store`, origin-scoped CORS, and `{valid:false}`. The free
  core remains visible.
- `/opt/fleet/lib/verify-url.sh` passes against production: HTTP 200, title,
  `lang=en`, one `h1`, `main`, complete alt text, named buttons, and no console
  or page error.

Evidence is in `.factory/evidence/repair-4/` and the
`.factory/evidence/repair-4-live-*` files.

## Response policy and deployed identity

Production returns HTTP 200 for `/`, `/demo`, `/privacy`, and `/terms`, and
HTTP 404 with the designed page for a missing route. HTML and `sw.js` revalidate
after 30 seconds. Hashed assets use one-year immutable caching. HSTS, `nosniff`,
strict referrer policy, restrictive Permissions-Policy, and the scoped CSP are
present.

The following deployed files match `dist/site` byte-for-byte:

```text
index.html                       581dfd59c5c789043f5c5b713d1990536ba2c8d8ffaa8110f15d320365d68073
assets/index-C-oYNSVk.js         185b1bc67803227eace1d0e9e556b392b3000042c11020dff1b314ef02c6a36c
assets/index-BW8GBXtD.css        a25a2a5840d01905fa8e627c2d3931872be6af09dbb6ea55dc4bfb74393790eb
404.html                         8b32c9cfcfaeb0394c0e1f307643990f6e37e6208c99d4a482ef70129b4cb77e
404.css                          a91589f3c4e1b06439281decbd5ac4efdf34c5fec5568897a1f5953d2481c66b
sw.js                            d9423896660af56aa1d94b3a3add95d6b92775025e06fe766d1c1d0535109836
assets/hero-blueprint-480.webp    54e5000d0b1a88bb26226b53bbb0fcb8ae7f70d073b5a9c53f68f50d34eb5ae1
```

The final `dist/site` build was deployed to the existing Azure Static Web App
`sf-point-and-speak-desktop`. Its default environment is Ready at
`purple-sand-0c9a9be10.7.azurestaticapps.net`; the custom production domain is
`https://point-and-speak-desktop.sociobot.in`. No infrastructure or DNS setting
was changed.

## Performance and desktop package

Fresh production mobile Lighthouse scores are **100 Performance, 100
Accessibility, 100 Best Practices, and 100 SEO**. FCP is 827 ms, LCP 1.059 s,
TBT 25 ms, CLS 0, and total transfer 51,232 bytes. The site bundle is 19,310
bytes JavaScript / 6,569 gzip, 14,443 bytes CSS / 4,114 gzip, and the mobile
hero is 16,180 bytes. No font is downloaded.

This was a static-site accessibility repair; native desktop code and packaging
did not change. Existing release `v0.1.5`, bound to source `a1c7e5f`, remains
the release selected by the live page and still contains Apple Silicon and
Intel DMGs, Windows setup EXE, Linux AppImage and DEB, `latest.json`,
`SHA256SUMS`, and `PROVENANCE.json`.

The live Linux installer was rerun in an isolated directory. It installed the
86,649,336-byte AppImage and verified SHA-256
`33b1b35d9903aa587e295ec9b37d86a829101dcf84f653d564d628af0fb4a16b`.
The app remained running through a 12-second Xvfb probe using extract-and-run
because the worker has no FUSE device. All four live platform selectors resolve
to the correct `v0.1.5` assets.

## Remaining platform boundaries

Real physical displays are still required to observe OS capture permission
prompts, audible system voices, multi-display geometry, macOS notarization,
and Windows Authenticode behavior. These are unchanged from the verified
candidate.

## Needs operator action

Provide Apple notarization and Windows Authenticode credentials when signed
installers are required. The workflow expects `APPLE_CERTIFICATE` and
`WINDOWS_CERT_PFX`; no signing secret was added to this repository.
