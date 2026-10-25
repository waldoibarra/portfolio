# Edit the landing design

Use this guide to change the editable [landing design](/docs/designs/landing.fig) and review a
candidate before replacing the source. See the [OpenPencil reference](/docs/reference/openpencil.md)
for workstation tools and known limitations.

Run commands from the repository root.

## Preserve the content strategy

The `Landing` page contains the 1440 px desktop composition; `Mobile` contains a separate 390 px
composition. `Components` owns the shared primary action. Both compositions use shared color and
type variables.

The portrait, greeting, and name in the hero carry the identity. There is no top
navigation bar. In-page headings are how a reader finds Selected work and Services. Keep
the résumé at `/resume` when you implement the site; do not put it in a header.

Hero copy that must stay aligned across desktop and mobile:

- Greeting `Hi, I'm` in muted gray, then `Waldo Ibarra` in lilac. Keep each text box at
  the font's measured width. Position the name absolutely at x = 60 inside the greeting row.
  Its 4 px overlap with the greeting box's trailing sidebearing
  produces roughly one word space.
  A positive auto-layout gap stacks on that sidebearing and
  reads as a wide break.
- Role `Hands-On Software Architect & Applied AI Engineer` in lilac, 24 px on desktop and
  20 px on mobile.
- Engineering experience at `H-E-B`, `Guros`, `Uniko`, `Spark`, `Paystand` in that order.

Keep the same audience split:

- Clients: lead with the product outcome, then results and concrete service scopes.
- CEOs: show delivery results and hands-on engineering leadership.
- Recruiters: keep the role and technical skills on the page. The résumé is
  `/resume` in the implemented site.

Use the [résumé](/public/resume/index.html) for historical claims,
with Waldo's corrections taking precedence.
WGSN used Amazon Personalize for applied ML, not LLMs.
The Guros leadership figure is 44+ engineers, 8 tech leads, and 3 architects.
The résumé has not yet incorporated these
landing-copy corrections. Retain H-E-B's 90% search response time reduction and Waspe's
95% deployment time reduction.

The music-industry example is an in-progress project for an unnamed stealth startup.
AI-assisted ETL extracts intelligence from royalty report files.
Its medallion database architecture has a gold layer for dashboards and RAG.
Keep the client anonymous; do not add identifying details
or imply completed results. Label it `Applied AI`; use present-tense `Building` for its status.
Do not add an NDA or client-withholding disclaimer to the public copy.

Past results are not guarantees. Do not add availability, scarcity, testimonials, or revenue
claims without evidence.

The only CTA is `Message on LinkedIn`, repeated in the hero and contact section, targeting
`https://www.linkedin.com/in/waldoibarra`. Do not add email or secondary action links.

## Preserve the color hierarchy

The design palette follows [Santifer's dark theme](https://santifer.io/).
It uses charcoal surfaces, a 24 px dotted field, cyan actions, and lilac accents.
These are design-source values, not the production colors in
[`foundations.css`](/src/home/styles/foundations.css). Review both owners when implementing a change.

| Role | Color | Use |
| --- | --- | --- |
| Background | `#18181b` | Main canvas |
| Surface | `#1f1f23` | Result cards and contact section |
| Primary text | `#ededed` | Headings and important content |
| Secondary text | `#a1a1aa` | Greeting, descriptions, and metadata |
| Cyan | `#20d6ee` | LinkedIn buttons and measured results |
| Lilac | `#c794fa` | Name, role title, and project labels |
| Button text | `#09090b` | Text on cyan |
| Border | `#313135` | Card strokes and quiet section dividers |

The canvas has a second fill: a tiled 24 px zinc dot grid.
Its tile origin uses `rgba(161, 161, 170, ~0.22)`.
Keep atmosphere in the hero: lilac orb left, cyan orb right,
and a cyan/lilac vertical wash.
Those fixtures are the first
children of the hero, behind the portrait and copy. Later siblings paint on top and take
clicks away from the text. `color/heroTop` (`#152028`) and
`color/heroMid` (`#241e2e`) record that wash. Gradient stops are literal values because the
CLI rejects gradient-stop variable bindings. Keep this fixture in the hero. Do not add
gradients to every card.

The LinkedIn action uses 24 px left and right padding, with the label centered in that inset.
Desktop and mobile have separate component masters.

Measured minimum contrast covers the rendered hero, canvas, and surfaces.
Secondary text reaches 6.16:1.
Lilac labels reach 6.37:1; button text on cyan reaches 11.29:1.

## Inspect the source

Open the document in the macOS app:

```sh
just open-design
```

Inspect its metadata, node tree, and strict-font PNG before changing it:

```sh
openpencil info docs/designs/landing.fig --json
openpencil tree docs/designs/landing.fig
openpencil export docs/designs/landing.fig --page Landing -o /tmp/landing.png --font-policy strict
openpencil export docs/designs/landing.fig --page Mobile -o /tmp/landing-mobile.png --font-policy strict
openpencil eval docs/designs/landing.fig -c 'return figma.currentPage.name'
```

## Edit and review a candidate

1. Organize sections into nested frames with auto-layout. Use components for repeated
    controls/cards and bind shared colors and typography to variables.
2. Keep the mobile composition in sync with desktop content; do not scale down the desktop canvas.
3. Edit visually in OpenPencil or script changes with `openpencil eval`. Use
    `--output /tmp/landing-edited.fig` to save a candidate for review; `--write` overwrites the input.
4. Reopen the saved candidate, render both pages, and review them before replacing the source.
    For scripted layouts, follow the [CLI observations](/docs/reference/openpencil.md#scripted-layout-observations).

Use one writer at a time.
Save and close the desktop document before overwriting it headlessly, then reopen it.

## Check the result

```sh
openpencil lint docs/designs/landing.fig --json
```

Treat lint findings as leads, not a substitute for visual and accessibility checks. Review both
compositions at native size for text wrapping and overlap. The nested design passes contrast lint;
the [earlier flat design](/docs/reference/openpencil.md#contrast-lint-observation) produced false positives.

Once the design is approved, follow [Implement the landing design](/docs/how-to/implement-landing-design.md)
to update the native implementation.

## Refresh the design preview

When visual intent changes, refresh the [design preview](/docs/designs/landing-preview.png)
from a strict-font export of `Landing`. The preview shows the full 1440 × 2149 px desktop page.
Review the full-page image before replacing it.

## Work through local MCP

Omit the file argument only for live desktop operations through local MCP. First check the open
documents:

```sh
openpencil documents --json
```

Pass `--document-id` when multiple documents are open. Restart the app after the first MCP install
if discovery is missing. Do not assume live edits have been saved to disk.
