# Implement the world design

Translate the [editable design](/docs/designs/landing.fig) into the production homepage.
The design expresses composition and atmosphere.
[`src/home/index.html`](/src/home/index.html) owns content and semantics.
Read the [architecture](/architecture.md#homepage-behavior) for state ownership and routing.

## Preserve the navigation contract

Keep the map, Workshop, Observatory, Garden, Crossroads, and Connect in the initial HTML.
Use genuine links to `#map`, `#workshop`, `#observatory`, `#garden`, `#crossroads`, and `#connect`.
Depth links target `details` elements inside their parent domain.
Preserve `#main` as the skip target.
Only unknown fragments normalize to `#map` without creating another history entry.
Do not hide a view in CSS before the script initializes successfully.

The enhancer in [`world.ts`](/src/home/world.ts) synchronizes panels after resolving the initial fragment.
It responds to `hashchange` for normal links and browser history.
Reveal the parent before scrolling to depth content or focusing its summary.
Focus a detail summary on direct entry and refresh as well as intentional navigation.
Focus entered headings after intentional navigation, not on initial map load.
Use native disclosures and visible focus. Never gate contact behind an animation or sequence.
Reduced-motion navigation changes immediately, without camera travel, zoom, or parallax.

## Translate visual intent

Keep a person-first welcome and readable destination labels beside the illustrated map.
Use each domain's color and drawing to reinforce meaning within one typographic system.
Retain a legible textual destination list on narrow screens.
Use native CSS and inline SVG instead of a canvas-only interface or runtime framework.
The design export is inspectable handoff material, not production-ready markup.
The [OpenPencil reference](/docs/reference/openpencil.md) records its limitations.

Homepage metadata is generated from [`metadata.json`](/src/home/metadata.json).
The sharing image needs a separate manual update when its copy changes.
Leave `/resume` unlinked until its content passes separate review.

## Check the result

Run these commands from the repository root:

```sh
just lint-ec
just lint-ts
just lint-css
just lint-md
just test-world
just build
```

`just test-world` covers fragment classification and the initial HTML contract.
Build first, then serve the output at `http://localhost:4173/`.
Pass an existing Playwright installation to the optional Chromium regression recipe:

```sh
just test-world-browser /path/to/installed/node_modules/playwright
```

Alternatively, set `PLAYWRIGHT_MODULE` and run `just test-world-browser`.
No Playwright dependency or browser installation belongs in this repository.
The browser regression covers visibility, title, focus, history, details, malformed fragments,
no-JavaScript content, and hidden tab stops.
Also inspect rapid links and modified clicks in a browser.
Check focus, the skip link, and disclosure controls with a keyboard.
Check no-JavaScript reading, reduced motion, 200 percent zoom, and 1440, 390, and 320 px layouts.
Compare rendered output with the [editable design](/docs/designs/landing.fig).
`just preview` serves the last build, so rebuild before reviewing a changed source.
