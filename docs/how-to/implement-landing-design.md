# Implement the landing design

Use this guide to translate the approved [landing design](/docs/designs/landing.fig) into the
production Lit implementation in [src/](/src/). See the
[design-to-code relationship](/ARCHITECTURE.md#design-and-implementation) and
[OpenPencil reference](/docs/reference/openpencil.md) before using exported markup.

Run commands from the repository root.

## Inspect the approved design

Inspect colors, typography, spacing, variables, and assets with `openpencil analyze`, `variables`,
and `export`. Choose shared CSS custom properties from the approved design.

Use a strict-font PNG as the visual reference:

```sh
openpencil export docs/designs/landing.fig -o /tmp/landing.png --font-policy strict
```

An HTML/CSS handoff can help inspect generated assets:

```sh
openpencil export docs/designs/landing.fig -f html --html standalone \
  --css inline --assets external --fonts assets -o /tmp/landing.html
```

Treat HTML export as inspectable handoff material, not production-ready or pixel-faithful output.
The [0.15.1 export observations](/docs/reference/openpencil.md#html-export-observation) document
the limitations found in this design.

## Implement in Lit

1. Build semantic sections, headings, links, and buttons with responsive Grid/Flexbox.
2. Add real destinations, keyboard focus, and interaction states. The only primary action is
    Message on LinkedIn (`https://www.linkedin.com/in/waldoibarra`). There is no top navigation
    bar. If you expose the résumé, use `/resume.html`.
3. Do not copy canvas coordinates into the page layout or introduce React/Tailwind just for an export.

## Verify the implementation

Start the development server:

```sh
just start
```

Compare browser screenshots with design renders at desktop and mobile sizes. Exercise links
and keyboard navigation, then run the relevant project checks through [just](/justfile).

Review changes in visual intent in the design as well, following
[Edit the landing design](/docs/how-to/edit-landing-design.md). Importing HTML creates editable
layers but does not maintain a live mapping to Lit components.
