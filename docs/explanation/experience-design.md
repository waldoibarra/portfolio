# Navigation as orientation

The world map offers places to explore, but navigation must preserve orientation.
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
