# Point & Speak Desktop — adversarial review 1 handoff

## Result

Review 1 is complete with verdict **FAIL**. The detailed report is
[`review-1.md`](review-1.md). No product code was changed.

The landing page passes the cold first-read check at 390 px and desktop. The
live demo, Reset, sandbox isolation, offline reload, routing, Back focus,
accessibility scan, links, checkout, and build all operate. The report records
36 remaining contract findings, including four blocking demo/claims issues.

## Verification performed

- Fresh live Chromium contexts at 390 × 844 and 1440 × 900.
- Direct live demo flow, pin/remove/reset, seeded real-storage preservation,
  request log, service-worker install, and offline reload.
- Live metadata/landmark/overflow/console inspection on `/`, `/demo`,
  `/privacy`, `/terms`, and a real HTTP 404.
- Live WCAG A/AA axe scan on those routes and a full link crawl.
- `/opt/fleet/lib/verify-url.sh` against the production URL.
- Every command in `.factory/claims.json`, separately, from clean local clone
  `/tmp/point-speak-review-01slW5/repo`.
- Full `npm test`, typecheck, strict lint, Rust format/test, production build,
  checkout test, and production dependency audit from that clone.

Observed aggregate results: 7 Vitest checks passed; 69 Playwright checks passed
with one intentional duplicate skipped; Rust tests passed; checkout reported
USD 19.00 and HTTP 303 to hosted Dodo; `dist/app` and `dist/site` were produced;
production audit reported zero vulnerabilities.

The base container lacked the documented GLib/WebKit packages, so the native
claim initially stopped at dependency discovery. Installing the exact Linux
packages from `.github/workflows/release.yml` allowed the exact command to
compile and pass. This was not recorded as a product test failure.

## Remaining work

Address F-1-1 through F-1-36 in `.factory/review-1.md`, then repeat the entire
review. Highest priority: reveal the useful OCR result on the first demo click,
test or narrow the core “any screen region” promise, and make the shortcut and
plural installer claim tests prove their complete wording.
