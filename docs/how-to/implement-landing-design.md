# Implement the landing design

Use this guide to translate the approved [landing design](/docs/designs/landing.fig) into the
production HTML and CSS in [`src/index.html`](/src/index.html) and [`src/`](/src/). See the
[design-to-code relationship](/ARCHITECTURE.md#design-and-implementation) and
[OpenPencil reference](/docs/reference/openpencil.md) before using exported markup.

Run commands from the repository root.

## Inspect the approved design

Inspect colors, typography, spacing, variables, and assets with `openpencil analyze`, `variables`,
and `export`. Choose global CSS custom properties from the approved design.

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

## Build the page

1. Mark up the page in [`src/index.html`](/src/index.html) with semantic sections, headings,
  links, and buttons. Keep the content in HTML so the complete page works without JavaScript.
2. Define global tokens, font faces, resets, and component stylesheet imports in
  [`src/index.css`](/src/index.css).
3. Put each component's layout, responsive rules, and interaction states in a stylesheet under
  [`src/components/`](/src/components/). Use Grid and Flexbox instead of copied canvas
  coordinates.
4. Export and optimize production images and fonts under [`public/`](/public/), then reference
  them with root-relative URLs.
5. Add real destinations, keyboard focus, and interaction states. The only primary action is
  Message on LinkedIn (`https://www.linkedin.com/in/waldoibarra`). There is no top navigation
  bar. If you expose the résumé, use `/resume.html`.
6. Do not add JavaScript to render static content. If the page gains behavior, implement only
  that behavior in TypeScript and document its public functions and types with JSDoc.
7. Do not introduce a frontend runtime dependency, React, or Tailwind for exported markup. Vite 8
  remains the build and development tool.

## Verify the implementation

Run the frontend checks and create the production build:

```sh
just lint-ec
just lint-ts
just lint-css
just lint-md
just build
```

`just lint-ts` checks [`vite.config.ts`](/vite.config.ts) and any future TypeScript behavior
modules under `src/` with the repository's strict TypeScript configuration. `just check` is not
a frontend-only shortcut: it also runs Terraform checks.

Serve the generated `dist/` output:

```sh
just preview
```

Compare browser screenshots with design renders at desktop and mobile sizes. Exercise links and
keyboard navigation. Disable JavaScript and confirm that all content and links still work.

Review changes in visual intent in the design as well, following
[Edit the landing design](/docs/how-to/edit-landing-design.md). Importing HTML creates editable
layers but does not maintain a live mapping to the production HTML or component styles.
