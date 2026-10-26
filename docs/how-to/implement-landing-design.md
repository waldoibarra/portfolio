# Implement the library design

Translate the [editable design](/docs/designs/landing.fig) into the production homepage.
The design expresses composition and atmosphere.
[`src/home/index.html`](/src/home/index.html) composes semantic views and includes optional
[working notes](/src/home/notes/) within their owning domains.
Read the [architecture](/architecture.md#homepage-behavior) for state ownership and routing.

## Preserve the navigation contract

Keep the library, Workshop, Observatory, Garden, Crossroads, and Connect in the initial HTML.
Keep both library directories and their relationship summaries in the initial HTML.
Use genuine links to `#map`, `#workshop`, `#observatory`, `#garden`, `#crossroads`, and `#connect`.
Depth links target peer `details` elements inside their parent domain.
Use the existing Vite HTML includes for notes; do not add a runtime fetch or nested disclosure.
Preserve `#main` as the skip target.
Only unknown fragments normalize to `#map` without creating another history entry.
The `#map` fragment remains the library's compatibility URL.
Do not hide a view or relationship directory before the script initializes successfully.
Hide the lens controls until the enhancer can switch directories.

The enhancer in [`world.ts`](/src/home/world.ts) synchronizes panels after resolving the initial fragment.
It responds to `hashchange` for normal links and browser history.
Settle top-level destinations at document start, including direct entry, refresh, and Back or Forward.
Handle repeated same-destination clicks separately because they do not fire `hashchange`.
Reveal the parent before scrolling to depth content or focusing its summary.
Focus a detail summary on direct entry and refresh as well as intentional navigation.
Focus entered headings after intentional navigation, not on initial map load.
Keep skip-link activation distinct: focus main without changing URL, active view, or history.
Initial `#main` opens the library instead.
Read the [architecture](/architecture.md#homepage-behavior) for canonical skip behavior.
Use native disclosures and visible focus. Never gate contact behind an animation or sequence.
Reduced-motion navigation changes immediately, without camera travel, zoom, or parallax.

## Translate visual intent

Keep a person-first welcome and readable destination labels beside the illustrated library.
Use each domain's color and original drawing to reinforce meaning within one typographic system.
Keep the map's topic directory and each domain's local links aligned with real disclosure IDs.
The library stacks the portrait above four landmarks on narrow screens.
Retain legible subject and relationship lists on narrow screens.
Embed library return, current location, topics, named related links, and contact within each domain.
Connect needs its own current-location cue and library return.
Do not rebuild a global header or footer under different names.
Use native CSS and inline SVG instead of a canvas-only interface or runtime framework.
The design export is inspectable handoff material, not production-ready markup.
Its simple colored glyphs stand in for the production SVG drawings.
[`home.css`](/src/home/home.css) owns shared domain layout and themes.
[`library.css`](/src/home/library.css) owns the library index and lens layout.
[`world.ts`](/src/home/world.ts) owns fragment navigation, lens enhancement,
and cancelable artwork motion.
The [OpenPencil reference](/docs/reference/openpencil.md) records its limitations.

Homepage metadata is generated from [`metadata.json`](/src/home/metadata.json).
The sharing image needs a separate manual update when its copy changes.
The 1200 × 630 JPEG uses the public portrait and original local world illustrations.
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
Pass an existing Playwright installation to the required Chromium regression recipe:

```sh
just test-world-browser /path/to/installed/node_modules/playwright
```

Alternatively, set `PLAYWRIGHT_MODULE` and run `just test-world-browser`.
No Playwright dependency or browser installation belongs in this repository.
The browser regression covers viewport positioning, repeated clicks, skip focus, history, details,
malformed fragments, relationship controls, no-JavaScript content, and hidden tab stops.
Treat unavailable Playwright or Chromium as a release blocker for this navigation change.
Also inspect rapid links and modified clicks in a browser.
Check focus, the skip link, and disclosure controls with a keyboard.
Check no-JavaScript reading, reduced motion, 200 percent zoom, and 1440, 768, 390, and 320 px layouts.
Compare rendered output with the [editable design](/docs/designs/landing.fig).
`just preview` serves the last build, so rebuild before reviewing a changed source.
