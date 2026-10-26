# Edit the world design

Use OpenPencil to maintain [`landing.fig`](/docs/designs/landing.fig) and its
[preview](/docs/designs/landing-preview.png).
The document expresses visual intent, not the homepage's interactive state.
Read the [OpenPencil reference](/docs/reference/openpencil.md) for tool limitations.

## Keep the map recognizable

Show Waldo's welcome, illustrated destinations, textual wayfinding, and a visible contact route.
The Workshop uses cyan drafting lines; the Observatory uses amber orbit diagrams.
The Garden uses botanical green space; the Crossroads uses terracotta routes.
Connect welcomes direct conversation. These places share typography and navigation.
Do not restore the old Work, Approach, About, and Contact brochure sections.
Avoid decorative scores, forced journeys, private reference images, or unreviewed résumé links.

Keep separate desktop and mobile compositions.
Mobile must present readable labels, not a scaled desktop atlas.
The preview records the desktop overview; production code owns the deeper views.
Update the design alongside the [implementation guide](/docs/how-to/implement-landing-design.md).

## Inspect and update

Run commands from the repository root:

```sh
openpencil info docs/designs/landing.fig --json
openpencil tree docs/designs/landing.fig
openpencil export docs/designs/landing.fig --page Landing -o /tmp/landing.png --font-policy strict
openpencil export docs/designs/landing.fig --page Mobile -o /tmp/landing-mobile.png --font-policy strict
```

Edit in OpenPencil or save a scripted candidate outside the repository first.
Close the desktop document before overwriting it headlessly.
Review both rendered pages at native size for wrapping, overlap, and legibility.

```sh
openpencil lint docs/designs/landing.fig --json
```

Lint is a lead, not proof of contrast or accessibility.
Refresh the preview from a strict-font export of the Landing page after reviewing the candidate.
The OpenPencil export does not maintain live synchronization with HTML or CSS.
