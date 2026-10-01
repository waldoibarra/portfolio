# Homepage metadata reference

Read this reference before changing the fields in
[`src/home/metadata.json`](/src/home/metadata.json) or their generated tags. For editing and
browser reload instructions, read [Run locally](/docs/how-to/run-locally.md#edit-homepage-metadata).

## Fields and generated tags

All fields below are consumed by the homepage transform in [`vite.config.ts`](/vite.config.ts).
There are no configured fallback values.

| JSON field | Type | Generated HTML |
| --- | --- | --- |
| `title` | String | `<title>`, `og:title`, `twitter:title`, `og:image:alt`, and `twitter:image:alt` |
| `author` | String | `meta[name="author"]` |
| `description` | String | Standard description, `og:description`, and `twitter:description` |
| `url` | String | Canonical link and `og:url` |
| `type` | String | `og:type`; the portfolio uses `website` |
| `image.url` | String | `og:image` and `twitter:image` |
| `image.width` | Number | `og:image:width`, in pixels |
| `image.height` | Number | `og:image:height`, in pixels |
| `image.type` | String | `og:image:type`, the image's MIME type |
| `twitterCard` | String | `twitter:card`; the portfolio uses `summary_large_image` |

The canonical and image URLs are absolute HTTPS URLs. Image metadata describes the static
1200 × 630 JPEG at [`public/images/social-preview.jpg`](/public/images/social-preview.jpg).
Changing the JSON does not redraw that image. Text or dimensions baked into the image need a
separate asset edit.

## Generation and reload behavior

Vite reads the JSON for each homepage HTML transformation during development and production
builds. It inserts the generated tags before `</head>` and escapes HTML-sensitive characters
in both text and attributes. Values are plain text: `&` belongs in the JSON, not `&amp;`.

The transform applies only to [`src/home/index.html`](/src/home/index.html). The standalone
résumé keeps its own metadata. Charset, viewport, favicon, and stylesheet declarations stay
in the homepage HTML shell.

During `just run`, saving the metadata JSON triggers a full-page browser reload through Vite's
development client. The next HTML transformation reads the saved values without a server restart.
Existing HTML include edits also trigger full-page reloads.

`just build` writes the generated tags into `dist/home/index.html`. Production browsers and
sharing crawlers receive them in the initial response; there is no production metadata script,
JSON fetch, or new dependency. `just preview` serves the built artifact, so source changes need
another build before they appear there.

## Sharing boundaries

Open Graph tags describe the sharing title, description, URL, type, and image. Twitter card tags
provide the corresponding X card settings. The homepage has an author but no article publication
date.

The build does not refresh third-party preview caches. Local JSON edits do not change the deployed
site or cards already shared. Read [Check sharing previews](/docs/how-to/verify-deployment.md#check-sharing-previews)
before verifying a deployed change.
