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

The flat landing document triggers misleading contrast lint errors: the two dark CTA labels sit
over cyan sibling rectangles with 12:1 fill-color contrast. Lint reports 1.03:1, matching contrast
against the dark parent frame instead.

## HTML export observation

The 0.15.1 export of this design was inspected in a browser: all 86 nodes were absolutely positioned,
there were no headings or interactive controls, and a 390 px viewport still had 1440 px of content.
External font URLs repeated the asset directory, and the portrait lost its circular clipping.

## Upstream references

- [CLI scripting guide](https://openpencil.dev/programmable/cli/scripting)
- [Export reference](https://openpencil.dev/programmable/cli/exporting)
- [MCP setup](https://openpencil.dev/programmable/mcp-server)
