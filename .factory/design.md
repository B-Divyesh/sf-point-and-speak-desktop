# Point & Speak Desktop — visual thesis

## Direction

The product looks like a **blueprint drafting sheet in active use**. A precise
cyan selection box crosses an ink-blue field while cream drafting notes explain
what happens. This fits a tool whose central action is drawing one deliberate
rectangle around otherwise inaccessible pixels. The visual system avoids a
generic software dashboard: registration marks, dimension ticks, paper grain,
and cropped technical captions make the selection gesture the identity.

## Palette

| Token | Light drafting sheet | Dark capture desk | Purpose |
| --- | --- | --- | --- |
| `--paper` | `#F4F0DF` | `#071A23` | page background |
| `--sheet` | `#FFFDF5` | `#0B2632` | raised work surface |
| `--ink` | `#102A35` | `#F8F3DF` | primary text |
| `--muted` | `#52666D` | `#B6C9CD` | supporting text |
| `--line` | `#AFC4C4` | `#41616A` | rules and grid |
| `--cyan` | `#006F82` | `#42D8E9` | selection and focus |
| `--cyan-hover` | n/a | `#8CE8F2` | primary action hover and focus |
| `--cyan-active` | n/a | `#B9F3F7` | primary action press |
| `--cyan-ink` | `#FFFFFF` | `#04191F` | text on accent |
| `--orange` | `#B84D1A` | `#FF9A63` | calls and warnings |
| `--success` | `#246B45` | `#76DBA3` | complete states |
| `--danger` | `#A53131` | `#FF9A9A` | errors |

All body combinations exceed WCAG AA. The site follows the system theme. The
desktop capture surface is always dark so a selected region stays prominent.

## Type and spacing

- Display: `Arial Narrow`, `Aptos Narrow`, `Roboto Condensed`, sans-serif. Tall,
  compact letters recall labels on engineering drawings without downloading a
  font.
- Body: `Inter`, `Segoe UI`, system sans-serif. The system stack keeps both the
  installer page and desktop shell fast and familiar at large text sizes.
- Technical labels: `ui-monospace`, `SFMono-Regular`, `Consolas`, monospace.
- Scale: 14 / 16 / 20 / 28 / clamp(42, 7vw, 80) px.
- Spacing: 4 px base; primary rhythm 8, 16, 24, 32, 48, 72, 96 px.
- Measures: body copy stays below 66 characters.

## Shape and interaction grammar

Edges are squared with small 2–6 px radii. Panels use one-pixel rules instead
of floating shadows. Buttons resemble labelled drawing tools. Corner brackets
mark active areas. Small labels use uppercase and generous tracking. Every
control is at least 44 px and focus appears as a cyan double outline.

The signature interaction is the **selection trace**: a cyan rectangle draws
from its upper-left origin once when a result appears. Supporting dimension
ticks fade in after it. Interface transitions last 180–260 ms and move only by
transform or opacity. With reduced motion, the full selection appears at once
and all decorative motion stops.

## Responsive intent

At 390 px, the download action and its outcome stack first. Large ornamental
measurement labels disappear, while the live result, three facts, and keyboard
instructions remain. The demo keeps speech, copy, and pin controls in a
two-column grid. Desktop spreads the drawing across an asymmetric 5/7 grid.

The landing walkthrough uses three hand-authored blueprint frames rather than
generic feature cards. The frames preserve the exact task sequence: draw a
region, review editable text, then speak, copy, or pin it. On phones they stack
as a single drafting strip. The direct demo puts the completed result before
the replay surface so its useful outcome remains inside the first viewport.

## Asset plan and provenance

`hero-blueprint.webp` and its social crop show a fictional legacy inventory
window being selected inside a layered cyan blueprint. They explain the region
gesture without pretending to be a screenshot of another product. All required
words remain live HTML.

- Generator: Azure AI Foundry image model through
  `/opt/fleet/lib/gen-image.sh` (`factory-image`).
- Date: 2026-08-28.
- License/provenance: original generated asset for this product; no people,
  brands, or copyrighted characters.
- Art prompt: "Editorial technical blueprint illustration of a desktop screen
  with a cyan rectangular selection around a small block of unreadable interface
  rows, drafting ruler ticks, registration marks and translucent vellum layers,
  deep ink blue, warm ivory paper, restrained safety orange details, crisp
  screen-print texture, oblique top-down composition, generous negative space,
  no legible text, no logos, no watermark, no people."
- Negative list: photorealistic devices, readable UI copy, gradients, glossy 3D,
  stock icons, brands, people, medical symbols.

Hand-authored SVG marks (favicon, wordmark target, registration corners) use
basic geometry and belong to this repository under MIT.
