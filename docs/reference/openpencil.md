# OpenPencil reference

Workstation tooling and observed limitations for contributors working with the editable
[landing design](/docs/designs/landing.fig).

## Tool ownership and versions

| Tool | Owner and configuration |
| --- | --- |
| OpenPencil desktop app | Homebrew |
| `@open-pencil/cli` | Global Mise config in `$HOME/.dotfiles/`; configured as `latest`, with 0.15.1 installed when checked |
| `@open-pencil/mcp` | Global Mise config in `$HOME/.dotfiles/`; configured as `latest`, with 0.15.1 installed when checked |
| Node and Bun | Global Mise config in `$HOME/.dotfiles/` |

The MCP package supplies the desktop app's automation server and is separate from the CLI.
Design tools are not required by the website build or CI. The repository also has its own
[tool pins](/.mise.toml), including Node.

The [justfile](/justfile) recipe `just open-design` launches `docs/designs/landing.fig` in the
macOS app. It targets the installed bundle identifier, `net.dannote.open-pencil`, without relying
on the `.fig` file association. OpenPencil 0.15.1 has no CLI `open` subcommand.

The guides use the globally managed `openpencil` directly from the repository root:

- [Edit the landing design](/docs/how-to/edit-landing-design.md)
- [Implement the landing design](/docs/how-to/implement-landing-design.md)

## Contrast lint observation

The earlier flat landing document triggered misleading contrast lint errors: two dark CTA labels
sat over cyan sibling rectangles with 12:1 fill-color contrast. Lint reported 1.03:1 against the
dark parent frame. The revised design nests labels inside filled components and passes this check.

## HTML export observation

The 0.15.1 export of the earlier flat design was inspected in a browser: all 86 nodes were
absolutely positioned, there were no headings or interactive controls, and a 390 px viewport
still had 1440 px of content.
External font URLs repeated the asset directory, and the portrait lost its circular clipping.

## Scripted layout observations

In 0.15.1, scripted auto-layout frames saved with children at `(0, 0)` rendered overlapped in
headless exports. Set child coordinates to match the auto-layout rules before saving, then reopen
and render the candidate. Keep the auto-layout metadata for subsequent visual editing.

Set `lineHeight` to a numeric pixel value. The Figma-style `{unit: "PIXELS", value: 28}` object
was readable during evaluation but reopened as `null`. Explicit line breaks and matching text
bounds keep desktop and mobile exports predictable.

Resized instances can return to their master's width when reopened in the app. The primary action
therefore has separate desktop and mobile component masters, with the same label and destination.

Saving after `insertChild` can remap node ids. Later scripted edits should find layers by name.

Imported nodes keep their original fig layout and order key. Setting `itemSpacing` or
reordering with `insertChild` updates the live scene graph, but the `.fig` writer emits
`source.fig.layout.stackSpacing` and `source.orderKey`. Change those too, or the gap and
z-order revert when the file is reopened. Yoga also clamps a negative auto-layout gap to
zero, so a tighter pair has to be positioned absolutely inside the empty sidebearing.

Mixed-color text on one line needs two text layers. Range fills are not exposed on the 0.15.1
eval API. Size each layer to the glyphs. Extra box width reads as extra space.

`LAYER_BLUR` saved as `FOREGROUND_BLUR` in 0.15.1. Soft orbs in this design use image fills.

Live cross-page raster exports can fail even with an explicit page ID. Use saved-file exports
with `--page Landing` and `--page Mobile` to review both compositions.

## Upstream references

- [CLI scripting guide](https://openpencil.dev/programmable/cli/scripting)
- [Export reference](https://openpencil.dev/programmable/cli/exporting)
- [MCP setup](https://openpencil.dev/programmable/mcp-server)
