# A deeper, illustrated journal

## Goal and authority

Preserve the world distribution the user liked while improving navigation, depth, artistry, and motion.
The user authorized this next version and frequent local commits.
No push, deployment, profile publication, or private-photo publication is authorized.
The approved interactive baseline is recorded in local commit `a0c63b3`.
Navigation corrections are recorded in local commit `525cebf`.
The user subsequently chose a colorful multiverse identity with connected perspectives.
The user confirmed that knowledge organization is a recurring practice across every interest.

## Evidence

The browser reproduction found navigation friction in 26 of 30 desktop and mobile cases.
Top-level navigation often landed around 360 pixels below the document start.
Header and return links disappeared before visitors had chosen to scroll.
Initial detail navigation sometimes clipped the focused summary's outline.
Existing tests checked visible panels and focus but omitted viewport positioning.

Ranked hypotheses identify title scrolling, native fragment scrolling, history restoration,
and missing detail offsets.
The implementation must confirm causes through the reproduction, not assume them from code inspection.

## Decisions

| ID | Decision | Reason |
| --- | --- | --- |
| J1 | Preserve Map, Workshop, Observatory, Garden, Crossroads, and Connect | The user explicitly liked this distribution |
| J2 | Top-level entries land at document start, including repeat clicks and history traversal | Navigation and orientation must remain visible |
| J3 | Depth links reveal their target with focus-outline clearance | Precise reading should not clip or hide the target |
| J4 | Expand overview, topic, example, and related-topic layers | Adds meaningful precision rather than biography volume |
| J5 | Add topic links to the map and local contents to each domain | Visitors can navigate directly to the subject they want |
| J6 | Create original local journal illustrations and sparse handwritten notes | Expresses personality without fictional lifestyle photography |
| J7 | Use locally served Caveat for annotations, retaining its OFL license | Handwriting stays readable and creates no third-party runtime request |
| J8 | Use locally vendored Tabler contact icons with MIT attribution | Provides one coherent open-source icon family |
| J9 | Vary domain composition and palette within shared navigation and typography | Adds vivid character without disorientation |
| J10 | Keep motion brief, interruptible, and subordinate to navigation | Polish must not reintroduce scrolling friction or delays |
| J11 | Keep the native-web architecture and existing task recipes | Avoids unnecessary framework and dependency growth |
| J12 | Commit verified slices locally and preserve licenses alongside assets | Makes recovery and review manageable |
| J13 | Frame the journal as one person exploring connected universes | Implements the user's explicit multiverse direction |
| J14 | Show knowledge organization and feedback as connections across domains | Reflects the user's stated practice across interests |

## Navigation contract

Top-level navigation shows the document header and selected view's beginning.
This applies to ordinary links, repeated destinations, direct entry, refresh, Back, and Forward.
Detail links open the parent domain and disclosure before positioning and focusing their target.
Keep enough visible space around focused details for the full outline.
Native external links, modified clicks, downloads, and no-JavaScript anchors remain usable.
Keep `#main` valid. Unknown fragments recover without exceptions or extra history entries.
Animations never delay URL updates, focus, or availability of destination controls.

## Information depth

| Domain | Orientation | Deeper topics and evidence |
| --- | --- | --- |
| Workshop | How Waldo builds and shares | Harness anatomy, review approach, team learning, architecture decisions, bounded public examples |
| Observatory | How Waldo questions and decides | Coherence, Stoic inquiry, competing worldviews, explanation through conversation, uncertainty |
| Garden | What makes the work worthwhile | Presence, yoga and meditation, love and care, nature, balance, time and freedom |
| Crossroads | Where curiosity leads next | Trading, volatility tool, marketing, sales, travel, fiction, time travel |
| Connect | How to continue the conversation | Email, LinkedIn, GitHub, Instagram, with clear channel purposes and recognizable logos |

Preserve one owner for each substantive idea; related views link to it.
Use authentic short marginal notes derived from supplied user language.
Do not invent dated journal entries, personal anecdotes, or accomplishments.
Do not invent financial expertise or travel history.
Keep professional offers concrete without turning the map into a sales funnel.

## Visual and motion direction

Make the overview an annotated multiverse atlas and each domain a distinct journal universe.
Use richer color contrasts and original artwork while preserving readable controls and content.
The multiverse is an artistic perspective, not a scientific or supernatural claim.
Use original illustrations, sketches, paper details, and restrained asymmetry.
Vary section treatments within each view instead of repeating one hero-and-disclosure template.
Keep navigation and long reading in the main readable typeface.
Handwriting belongs to short notes, not controls or body copy.

Use purposeful feedback on map landmarks, contact links, disclosures, and view changes.
Prefer transforms and opacity; never `transition: all` or layout-driven animation.
Routine movement stays below 300 milliseconds and can be interrupted safely.
Do not add perpetual animation, sound, cursor replacement, scroll hijacking, or mandatory sequences.
Reduced-motion mode keeps all content and immediate navigation without spatial travel.
Hover effects require hover-capable pointers; touch and keyboard receive deliberate feedback.

## Asset ownership and licensing

Use the research-verified Tabler outline GitHub, LinkedIn, Instagram, and mail SVGs.
Retain upstream revision, source URL, and MIT notice with the local asset inventory.
Brand trademarks are separate from the icon license; imply no endorsement.
Caveat comes from Google Fonts under the SIL Open Font License.
Recheck upstream files before vendoring; retain the exact license and provenance.
Original domain illustrations must not imitate private photographs or fabricate personal experiences.
Record these facts in one asset reference linked from the documentation index.

## Slices and commits

1. Fix navigation using a failing browser reproduction, then add viewport-position regressions.
    Update navigation guidance and record the observed cause in the learning explanation.
    Lead verifies and commits this slice before visual implementation.
2. Expand map precision and domain depth; add journal artwork, notes, contact icons, and motion.
    Refactor homepage files only where their distinct responsibilities justify it.
    Keep route state, motion state, and content ownership explicit.
3. Reconcile design source, preview, metadata, documentation, and licensed asset references.
    Independently review implementation and exercise every view at desktop and mobile widths.
4. Correct concrete findings, rerun affected checks, and commit the verified result.

The lead owns Git writes and the existing preview process at `http://localhost:4173/`.
Workers never commit, push, install tools, or restart shared processes.

## Documentation

Use `docs` to capture reusable findings in `docs/explanation/experience-design.md`.
Explain the evidence, consequence, chosen behavior, tradeoffs, and verification.
Keep current navigation contracts in architecture and implementation guidance, not only in plans.
Keep exact asset provenance in `docs/reference/visual-assets.md`.
Link these owners through the existing documentation index.
Preserve meaningful previous reasoning without presenting superseded navigation as current.

## Verification

Run frontend lint, `just test-world`, `just build`, and `just test-world-browser`.
Add regression assertions for top-level scroll position and detail focus clearance.
Re-run the original reproduction before and after the navigation fix.
Check every domain and meaningful expanded layer at 1440, 390, and 320 pixels.
Inspect intermediate widths, long content, keyboard-only navigation, and touch-sized controls.
Exercise history, repeated destinations, rapid interruptions, direct links, refresh, and unknown fragments.
Verify no-JavaScript content and reduced-motion parity.
Measure screenshot geometry and contrast rather than declaring visual perfection from lint.
Test Chromium and installed WebKit/Firefox where available.
Disclose unavailable engines and real-device limits.
No synthetic test establishes perfection on every browser or phone.

## Recovery

Each verified local commit provides a rollback boundary.
Never reset unrelated changes or bypass hooks.
Keep the final preview running for owner review and report exact local commit hashes.

## Status

Baseline committed. Navigation slice implemented and browser-verified locally.
Independent audit and lead checks passed; this slice is ready for its local checkpoint.
The original reproduction failed 26 of 30 cases before the fix and passed all 30 afterward.
Visual, content, motion, design-source, and licensed-asset work remain pending.
The next slice must record exact asset provenance before vendoring.
A representative route is Map, Workshop harness topic, Pi Lens example, then Observatory feedback.
Another connects Crossroads journaling, evidence about decisions, and Workshop's verification practice.

The user supplied a public Trading Journaling Guide as additional first-person evidence.
It supports structured tagging, comparing intentions with behavior, and explaining a repeatable process.
It does not establish profitability or validate absolute claims about all successful traders.
Only the supplied guide is relevant; linked trading records and personal examples remain excluded.
The notes-directory scout inventoried all areas and sampled safe conceptual material.
Private diaries and confidential work were excluded; uncertain-authorship prose is not a voice exemplar.
