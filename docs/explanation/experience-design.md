# Navigation as orientation

The world map offers places to explore, but navigation must preserve orientation.
The multiverse describes one person's connected perspectives, not literal parallel realities.
The initial browser reproduction found viewport friction in 26 of 30 desktop and mobile cases.
Top-level entries often placed the header and return link above the viewport.
Repeated destination clicks also moved the viewport without changing the fragment.

The enhancer now settles top-level destinations at the document start.
It does so after panel visibility changes and again after initial loading.
A repeated destination click needs explicit handling.
Its unchanged fragment does not fire `hashchange`.
History restoration is manual so Back and Forward also return to the beginning.
This sacrifices a reader's previous scroll position within a domain.
The choice favors visible navigation after the observed disorientation.
Depth links remain available for precise destinations.

`#main` is not a top-level destination.
The skip link keeps its native fragment and moves keyboard focus into the main landmark.
Depth links reveal their parent and disclosure, then focus the summary with visible outline clearance.
Unknown fragments recover the map without adding a history entry.
Modified and external links retain browser behavior.
The initial HTML remains readable without JavaScript.

The production browser regression checks document-start position and repeated destinations.
It also checks history, skip focus, and detail clearance.
The original reproduction now passes all 30 measured desktop and mobile cases.
These Chromium results do not establish other browser engines or real-device behavior.

## Let choices reveal knowledge

A choice should lead to a different subject, not a decorative branch.
The map pairs each poetic destination with recognizable subjects and precise topic links.
Each domain offers local contents, native disclosures, and relevant links to another domain.
Workshop anchors its public tools; Observatory adds a question ledger.
Garden sets aside space for intentions; Crossroads diagrams the public journaling method.
These sections increase page length, but related disclosures remain addressable without a reading sequence.
Visitors can enter a topic directly or leave without completing a prescribed tour.
The existing header and map return preserve orientation without another breadcrumb layer.

For example, the Workshop explains an agent harness and links an inspectable tool.
The Observatory examines feedback and coherence; the Crossroads shows structured trading notes.
Their connections explain why recording evidence matters beyond any one interest.
Each public example has one substantive home; related views link instead of copying its claims.
The map identifies knowledge organization across every interest without repeating one slogan everywhere.

The [branching journal research](/docs/research/personal-brand.md#branching-journal-research)
records seven sources and evidence limits.
Those sources guided our choices but did not test this design with visitors.

## Use color and motion as orientation

Four original illustrations identify different universes within one drawing grammar.
The authentic portrait remains the common thread, while handwriting marks brief observations only.
Light Garden and Connect surfaces need dark focus outlines and links, unlike the dark domains.
The atlas becomes a textual grid on narrow screens, avoiding portrait overlap.

A brief illustration arrival acknowledges navigation without hiding content or animating on direct entry.
Map landmarks, disclosures, and contact links provide immediate local feedback.
Focus, URL changes, and scroll positioning do not wait for animation.
Reduced motion removes the illustration arrival and spatial feedback.
No looping drawing, parallax, or timed tour competes with reading.
