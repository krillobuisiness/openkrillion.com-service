# FIETSDUIK mobile responsiveness audit

## Result

The main mobile problem was the panoramic Amsterdam artwork being scaled to the
viewport width. On a narrow portrait viewport this compressed the full panorama,
making the canal houses appear too small and weakening the relationship between
the houses, canal and waterline.

The homepage and descent renderer now preserve the source aspect ratio. Desktop
and landscape layouts keep the full panorama across the viewport. Portrait
layouts scale the artwork by height and use a centered horizontal crop. This
keeps the houses proportional while ensuring that the canal and waterline remain
continuous with the underwater scene.

## Files changed

- [`public/ocean.mjs`](../public/ocean.mjs)
  - Added aspect-ratio-preserving portrait rendering for the Amsterdam canal.
  - Uses the artwork waterline ratio (`590 / 724`) when positioning the scene.
  - Leaves the underwater renderer, camera and depth calculations unchanged.
- [`public/style.css`](../public/style.css)
  - Added final mobile layout rules for the homepage, prompt, answer dock,
    results, panels and guide.
  - Added safe-area support, minimum touch targets and compact rules for very
    narrow and landscape mobile screens.
  - Prevented the game stage from creating horizontal overflow.

No game logic, scoring, answer validation, round progression or database code
was changed for this audit.

## Responsive behavior

| Layout | Background behavior | UI behavior |
| --- | --- | --- |
| Desktop / landscape | Full panorama scaled to viewport width | Existing composition preserved |
| Portrait tablet / mobile | Height-based proportional scale with centered crop | Fluid cards, safe-area spacing and touch-sized controls |
| Short landscape mobile | Proportional background with compact overlay layout | Reduced vertical spacing and scrollable cards where needed |

The portrait crop is intentional: a 2172×724 panorama cannot show every
building at once on a 390px-wide screen without either distorting the artwork or
making the buildings unreadably small. The center crop preserves the most useful
composition and keeps the bridge, canal and buildings on the same visual layer.

## Verification

Screenshots were captured at:

- 1728×832
- 1440×900
- 1280×800
- 1024×768
- 768×1024
- 430×932
- 390×844
- 375×812
- 360×800
- 844×390 landscape

The matrix check reported no horizontal overflow on the homepage or game view
at any tested viewport. The answering state was also checked at 390×844; the
input and submit control remained visible and aligned. A complete seven-round
mobile session was completed successfully.

Automated checks:

- `npm test`: 12/12 passed.
- `npm run build`: passed.
- Browser acceptance: homepage, descent, answering state, results screen and
  seven-round completion checked with Chromium.
- Browser console errors during the responsive matrix and full game run: none.

## Remaining limitation

On portrait screens the Amsterdam panorama is necessarily cropped horizontally.
The artwork is not stretched, and important details remain proportional, but a
single narrow viewport cannot display the entire wide canal panorama at once.
