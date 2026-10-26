# Navigation as orientation

Waldo's library connects one person's interests without claiming literal parallel realities.
The first browser reproduction found viewport friction in 26 of 30 desktop and mobile cases.
Top-level entries often placed the former header and return link above the viewport.
Repeated destination clicks also moved the viewport without changing the fragment.

The current enhancer settles top-level destinations at the document start.
It does so after panel visibility changes and again after initial loading.
A repeated destination click needs explicit handling because its unchanged fragment does not fire `hashchange`.
History restoration is manual, so Back and Forward return to the beginning.
This sacrifices a reader's previous scroll position within a domain.
Depth links remain available for precise destinations.

Each view now embeds its location and return route within its content.
A domain also provides local topic links, a named relationship, and a contact route.
Connect embeds its own location and return route.
`aria-current="location"` identifies the active view in its local navigation.
This replaces the detached header and footer without recreating global chrome.
The library retains the original attribution within its own view.

The [homepage behavior](/architecture.md#homepage-behavior) distinguishes clicked skip links
from initial `#main` entry.
Depth links reveal their parent disclosure, then focus its summary with outline clearance.
Unknown fragments recover the library without adding a history entry.
The older `#map` fragment remains a library alias; other existing fragments remain direct links.
Modified and external links retain browser behavior.
All destinations and relationship summaries remain in initial HTML without JavaScript.

## Choose subjects or follow relationships

The library pairs each poetic destination with recognizable subjects and precise topic links.
The Shelves lens groups those subjects by domain.
The Connections lens offers four distinct questions with named cross-domain routes.
Native radios switch visible explanatory content and links, not merely their color.
The introduction's connection shortcut selects that lens and focuses its control.
The selector is hidden without JavaScript; both directories remain visible and usable.

Workshop anchors its public tools; Observatory asks how evidence changes a belief.
Garden makes room for care; Crossroads describes the public trading journal.
Optional working notes now follow topic disclosures within each domain.
They expose questions, examples, tradeoffs, and public evidence where available.
They increase page length but remain addressable without a reading sequence.
Private family prototypes and learning materials are described without source links or personal records.
Each public example has one substantive home; related views link instead of copying its claims.
The library connects interests through knowledge organization without repeating a slogan in each view.

The [branching journal research](/docs/research/personal-brand.md#branching-journal-research)
informed these choices without measuring visitor outcomes.
A draggable graph or canvas would require precision input and hide essential navigation.
The semantic index keeps every link operable through keyboard, touch, and ordinary HTML.

## Motion and visual continuity

Four original illustrations identify different universes within one drawing grammar.
The portrait remains the common thread; handwriting marks brief observations only.
Drawn connections and warm ink evoke tactile materials.
Private references remain outside public assets.
Its narrow layout uses labeled lists instead of a compressed graph.

After user navigation, the selected illustration briefly arrives through the Web Animations API.
The enhancer cancels its previous `Animation` before updating the next view.
It animates individual `translate`, preserving the illustration's resting CSS rotation.
URL, visibility, focus, and scroll update synchronously, without waiting for motion.
Reduced motion suppresses spatial arrival but keeps native selection and disclosure feedback.
The library radios use short color feedback; their content changes immediately.
There is no looping drawing, parallax, modal sequence, or scroll hijack.
A View Transition would coordinate more DOM states but complicate immediate focus and rapid navigation.
This smaller mechanism affects only decorative artwork.

The production Chromium regression checks navigation, lenses, history, skip focus, and detail clearance.
It also checks touch emulation, keyboard selection, reduced motion, and no-JavaScript reading.
The earlier 30-case navigation reproduction passed before this change; it has not been rerun separately.
Chromium checks do not establish other browser engines, real-device use, or assistive-technology outcomes.
