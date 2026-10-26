# Architecture

`waldo.love` is a static, explorable portfolio. Its homepage introduces Waldo through a world map.
Visitors choose the Workshop, Observatory, Garden, Crossroads, or Connect.
Each view has its own fragment URL; deeper disclosures also have direct links.
The `/resume` route remains available, separate and unpromoted pending content review.

## Ownership

| Area | Owns | Boundary |
| --- | --- | --- |
| [`src/home/`](/src/home/) | Semantic world content, native styles, and fragment enhancement | No backend or client framework |
| [`public/`](/public/) | Portrait, fonts, sharing image, and standalone résumé | Static assets and separate résumé document |
| [`docs/designs/`](/docs/designs/) | Editable visual intent and preview | No automatic production synchronization |
| [`infrastructure/`](/infrastructure/) | Terraform for S3, CloudFront, ACM, and Route53 | No artifact uploads |
| [`.github/workflows/`](/.github/workflows/) | Coordinated build and production delivery | Recipes from the [justfile](/justfile), not inline shell |
| [`scripts/`](/scripts/) | Setup and deployment operations invoked by recipes | No automatic account purchases |

## Homepage behavior

[`index.html`](/src/home/index.html) owns the complete initial document.
All views and native disclosures remain readable without JavaScript.
[`home.css`](/src/home/home.css) owns the map and each place's visual atmosphere.
[`world.ts`](/src/home/world.ts) synchronizes panels, title, location indicator, and focus.
It runs once before hiding inactive views, then responds to `hashchange`.
Native links create history entries; unknown fragments use `replaceState` to recover the map.
`#main` preserves the skip link, while detail fragments open their parent disclosure.
[`world.test.mjs`](/src/home/world.test.mjs) exercises fragment and source contracts through `just test-world`.
[`world.browser.test.mjs`](/src/home/world.browser.test.mjs) exercises production browser behavior.
Run it through `just test-world-browser` with an external Playwright module path.
It requires a built preview; Chromium coverage does not establish other browsers' behavior.

[`metadata.json`](/src/home/metadata.json) owns the initial title and sharing metadata.
Vite generates these tags in the HTML response; the script updates the browser title after navigation.
Read the [metadata reference](/docs/reference/homepage-metadata.md) before changing its fields.
Vite 8 builds the homepage as `dist/home/index.html`.
The standalone résumé copies to `dist/resume/index.html`.
Development and preview rewrite `/` and `/resume` to those documents.
CloudFront uses `home/index.html` as its default root object and a viewer-request function for `/resume`.
Other paths are not homepage fallbacks.

## Design and delivery

The editable [`landing.fig`](/docs/designs/landing.fig) records visual intent.
Production markup and CSS remain the authority for browser behavior.
Read [edit the design](/docs/how-to/edit-landing-design.md) and
[implement the design](/docs/how-to/implement-landing-design.md) for that handoff.

[`.mise.toml`](/.mise.toml) manages project tools; the [justfile](/justfile) is the command interface.
`just build` typechecks TypeScript and builds production assets.
The production workflow checks and builds both domains, stages website objects, applies infrastructure,
then waits for CloudFront before removing obsolete objects and invalidating caches.
Read the [delivery model](/docs/explanation/delivery.md) for gates and deployment dependencies.

Custom Terraform owns website resources.
Domain registration and the existing public hosted zone are account prerequisites.
Explicit operations outside Terraform manage them.
Historical bucket, OAC, and workspace names retain their identities during domain migration.
There is no redirect service or old-site recovery guarantee.
Infrastructure tests use mock providers; they do not test real AWS integration.

Keep new homepage concerns within `src/home/` until another page needs reuse.
A new built page needs a Vite entrypoint and explicit public route.
Read [documentation maintenance](/docs/README.md#maintain-the-documentation) before reorganizing pages.
ADR-0008's AI-first stance remains proposed in the [decision index](/docs/decisions/README.md).
