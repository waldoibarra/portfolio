# Implement the landing design

Use this guide to translate the approved [landing design](/docs/designs/landing.fig) into the
production HTML and CSS in [`src/home/index.html`](/src/home/index.html) and
[`src/home/`](/src/home/). See the
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

1. Keep the document shell and section order in [`src/home/index.html`](/src/home/index.html).
  Edit generated head values through [homepage metadata](/docs/reference/homepage-metadata.md).
  Compose sections with comments such as `<!-- include: home/sections/hero/hero.html -->`.
  Paths resolve from `src/`, including nested includes, not from the including document.
  Use lowercase, hyphen-separated path segments and `.html` files. Invalid or escaping paths
  and include cycles fail explicitly.
2. Define tokens, font faces, resets, and container rules in
  [`foundations.css`](/src/home/styles/foundations.css). Compose styles in
  [`home.css`](/src/home/home.css), preserving cascade order.
3. Colocate each section's markup and CSS under `src/home/sections/<name>/`. Keep section-private
  patterns there; home-wide patterns belong in `src/home/components/<name>/`.
  Reuse the LinkedIn action in
  [`components/action-link/`](/src/home/components/action-link/) for the hero and contact sections.
  Edit its label, destination, and title in
  [`linkedin-action.html`](/src/home/components/action-link/linkedin-action.html).
  Introduce `shared/` only when another page actually reuses code; reuse across homepage sections
  stays in `home/components/`. Use Grid and Flexbox instead of copied canvas coordinates.
4. Export and optimize production images and fonts under [`public/`](/public/), then reference
  them with root-relative URLs.
5. Add real destinations, keyboard focus, and interaction states. Both primary actions use the
  LinkedIn component's destination. There is no top navigation bar. If you expose the résumé,
  use `/resume`.
6. Do not add JavaScript to render static content. If the page gains behavior, implement only
  that behavior in TypeScript and document its public functions and types with JSDoc.
7. Do not introduce a frontend runtime dependency, React, or Tailwind for exported markup. Vite 8
  remains the build and development tool.

The `html-components` Vite plugin recursively expands these comments in development and production
builds, so sections can include home-wide components. Missing component files fail the request or
build rather than silently dropping content. The same component can be included in multiple sections.
Editing a component reloads the development page. The generated HTML contains the complete page and
works without JavaScript; do not open the unprocessed source shell directly.

Both sections include the same action with this source-relative comment:

```html
<!-- include: home/components/action-link/linkedin-action.html -->
```

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
Check the action in both the hero and contact sections. Each must render the component's current
label, title, and destination with the existing focus and layout styles.

Review changes in visual intent in the design as well, following
[Edit the landing design](/docs/how-to/edit-landing-design.md). Importing HTML creates editable
layers but does not maintain a live mapping to the production HTML or component styles.
