# Edit the landing design

Use this guide to change the editable [landing design](/docs/designs/landing.fig) and review a
candidate before replacing the source. See the [OpenPencil reference](/docs/reference/openpencil.md)
for workstation tools and known limitations.

Run commands from the repository root.

## Inspect the source

Open the document in the macOS app:

```sh
just open-design
```

Inspect its metadata, node tree, and strict-font PNG before changing it:

```sh
openpencil info docs/designs/landing.fig --json
openpencil tree docs/designs/landing.fig
openpencil export docs/designs/landing.fig -o /tmp/landing.png --font-policy strict
openpencil eval docs/designs/landing.fig -c 'return figma.currentPage.name'
```

## Edit and review a candidate

1. Organize sections into nested frames with auto-layout. Use components for repeated
    controls/cards and bind shared colors and typography to variables.
2. Add a mobile composition; do not scale down the desktop canvas.
3. Edit visually in OpenPencil or script changes with `openpencil eval`. Use
    `--output /tmp/landing-edited.fig` to save a candidate for review; `--write` overwrites the input.
4. Reopen the saved candidate, render it, and review it before replacing the source.

Use one writer at a time: save and close the desktop document before overwriting it headlessly,
then reopen it.

## Check the result

```sh
openpencil lint docs/designs/landing.fig --json
```

Treat lint findings as leads, not a substitute for visual and accessibility checks. Verify the
actual composited background before changing colors: the source has
[known misleading contrast findings](/docs/reference/openpencil.md#contrast-lint-observation).

Once the design is approved, [implement it in Lit](/docs/how-to/implement-landing-design.md).

## Refresh the README preview

When visual intent changes, refresh the [README preview](/docs/designs/landing-preview.png)
from a strict-font PNG export. The preview is the top 1440 × 660 px hero crop of that render.
Review the cropped image before replacing it.

## Work through local MCP

Omit the file argument only for live desktop operations through local MCP. First check the open
documents:

```sh
openpencil documents --json
```

Pass `--document-id` when multiple documents are open. Restart the app after the first MCP install
if discovery is missing. Do not assume live edits have been saved to disk.
