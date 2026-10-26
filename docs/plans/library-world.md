# Waldo's living library

## Goal and authority

Evolve the journal into a lean, app-like library of connected knowledge.
Remove global header and footer chrome; embed orientation and navigation within each view.
Preserve the person-first multiverse identity, useful depth, and established content boundaries.
Use `raw/bumble-bio.md` to check breadth across philosophy, yoga, trading,
anime, gaming, and geopolitics.
Carry its values into the experience.
Do not treat historical labels or intimate details as public copy.
The user authorized continued implementation, local commits, pushing, deployment, and live verification.
No further approval checkpoint is required for this requested scope.

The library and Akashic-records references are artistic metaphors, not claims of supernatural access.

## Current evidence

The journal already has domain artwork, local licensed fonts/icons, and deep topic links.
The navigation fix prevents involuntary scrolling on top-level transitions.
Research supports meaningful branching, predictable destinations, optional depth,
and visible recovery paths.
Global navigation currently occupies substantial mobile space and separates exploration from the content.
The user explicitly requests embedded navigation and stronger app-like interaction instead.

## Decisions

| ID | Decision | Reason |
| --- | --- | --- |
| L1 | Replace global header/footer with view-local navigation | Implements the user's requested graph-like exploration |
| L2 | Treat the overview as a living library with visible thematic relationships | Shows Waldo's big picture and recurring knowledge-organization practice |
| L3 | Keep real links and URL-owned view/topic state | Preserves sharing, history, keyboard operation, and readable fallback |
| L4 | Give every view a clear library return, local topic links, and related threads | Prevents dead ends without restoring a detached navbar |
| L5 | Add purposeful interactions that reveal information or relationships | Avoids decoration masquerading as functionality |
| L6 | Use native HTML/CSS and a small TypeScript enhancer | Keeps implementation lean, inspectable, and portable |
| L7 | Make motion finite, interruptible, and reduced-motion aware | App-like responsiveness must not obstruct reading or control |
| L8 | Keep content, navigation, motion, and design tokens behind clear local boundaries | Prevents one growing file or override cascade from owning everything |
| L9 | Publish only after checks and independent review, then verify exact deployed output | A successful push is not proof of a live website |

## Experience

The library introduces Waldo and the connections between building, thinking, living, and exploring.
It offers direct entry to each universe and precise topics.
Recognizable subjects accompany evocative names.
An optional relationship view can highlight shared practices across domains.
Its controls must change useful information, not merely recolor the same layout.

Each domain embeds its current location and a route back to the library.
Readers can choose a local topic, inspect an example, or follow a named connection.
Contact is available through a clear local link, not an obligatory final chapter.
Do not add a global navigation bar under a different name.

### Working notes and inspectable evidence

The user requested another layer beneath broad interests and topic introductions.
Add working notes explaining a question, a position, a concrete example, and its tradeoff.
Link each note from its owning topic and provide related paths without forcing a reading order.
Prioritize dotfiles and this portfolio as publicly inspectable engineering evidence.
Use actual file links for shared-policy delivery, verification boundaries, native web implementation,
infrastructure ownership, and ordered deployment.
Describe private family projects as learning materials or prototypes.
Never present them as publicly inspectable production products.
Keep private records, screenshots, and uncertain achievements excluded.
Recheck all supplied source categories for breadth and grounded personal depth before final copy.
Avoid promoting quotations, unknown-authorship notes, or historical labels into current personal claims.

Retain current fragment URLs or provide explicit compatibility aliases.
Top-level entries land at the view's beginning without surprise scrolling.
Detail entry reveals and focuses its target with outline clearance.
Back, Forward, repeated destinations, direct entry, and refresh preserve coherent state.
The skip link still reaches main content; no-JavaScript content remains readable and navigable.

## Visual and motion direction

Keep vivid, distinct universes within one library identity.
Combine original journal art, handwritten annotations, readable text, and purposeful spatial relationships.
Vary content composition instead of repeating a stock hero template.
Use user-triggered scene transitions, relationship highlights, and clear press/disclosure feedback.
Avoid autoplay loops, scroll hijacking, cursor replacement, forced sequences,
or inaccessible canvas navigation.

State, focus, and controls remain available immediately while decorative motion settles.
Cancel or replace previous animation on rapid navigation.
Reduced-motion mode retains information and feedback without spatial travel.
Touch users receive the same capabilities without hover or precision gestures.

## Research and documentation

Research embedded navigation, linked-information exploration, native interactions, responsive motion,
and accessible app-like transitions using primary sources.
Retain reusable findings and evidence limits in the existing research document.
Record applied lessons and rejected alternatives in the experience-design explanation.
Update architecture, glossary where needed, implementation guidance, design source, and previews together.
After implementation, audit README, architecture, glossary, and the complete maintained
documentation tree.
Use `docs` to consolidate duplicate facts, repair links, remove stale guidance,
and clarify reading paths.
Use `feedback-loop` to compare requested outcomes with observed behavior.
Document remaining gaps.
Rewrite only where it improves accuracy or maintainability; preserve unique information and useful rationale.
Historical ADRs, original sources, licenses, and private evidence retain their ownership and protection.
Instruction-file changes require their specialist workflow.
Documentation work does not authorize global policy changes.
Do not confuse inferred design benefits with measured usability or commercial outcomes.

## Delivery slices

1. Preserve the reviewed journal checkpoint and its documentation.
2. Implement library overview, embedded navigation, and meaningful interactions with regression coverage.
3. Add and tune motion, finalize responsive composition, and reconcile design assets and documentation.
4. Audit and refactor the maintained documentation after implementation.
    Independently review documentation and exercise the completed application.
5. Commit verified changes and push explicitly to `origin trunk`.
    Monitor the exact-SHA production workflow.
6. Verify `https://waldo.love` and `https://www.waldo.love` against the intended artifact.

The lead owns Git writes, shared processes, and production coordination.
Workers may not push, deploy, restart servers, or change infrastructure.
Use the existing CI transaction; never upload directly from the workstation.
Stop on unexpected destructive infrastructure drift or unrelated deployment changes.

## Verification

- Run frontend lint, fragment tests, production build, and rendered browser regressions.
- Assert global header/footer absence and reachable embedded navigation in every view.
- Exercise relationship controls, all topic links, cross-domain links, and direct contact.
- Check history, repeat entry, malformed hashes, skip focus, and deep-link positioning.
- Interrupt motion rapidly and repeat the same flows with reduced motion and JavaScript disabled.
- Inspect every distinct view at 1440, 768, 390, and 320 pixels.
- Measure targets, contrast, overflow, and focused-element visibility.
- Check installed browsers where available; disclose real-device and assistive-technology limits.
- Validate local asset licenses, dimensions, metadata, and sharing image.
- Require exact-SHA CI success, valid HTTPS, successful assets,
  and browser operation on both public hosts.
- Compare served HTML or hashed assets with the intended build; verify unknown paths remain errors.

## Recovery

Keep local commits focused and do not rewrite shared history.
If deployment fails, inspect its failed step and live state before retrying.
Correct source through the existing CI workflow; never bypass production guards.

## Status

Library navigation, relationship lenses, motion, artwork metadata,
and affected documentation implemented locally.
Frontend checks, five source-contract tests, and rendered Chromium regressions passed.
Ten working notes add examples, opinions, tradeoffs, and evidence beneath the topics.
The maintained documentation audit repaired current guidance and preserved historical reasoning.
Independent review found no remaining blocker.
Chromium covered the complete local acceptance flow; WebKit and Firefox covered critical interactions.
Real-device and screen-reader behavior remain unverified.
Release `059a59703bc7305615ecfcb39dc14cb1abc8c075` was pushed to `origin/trunk`.
[Production run 40255976078](https://github.com/waldoibarra/portfolio/actions/runs/40255976078)
completed successfully on October 26, 2026.
The infrastructure plan and apply reported no resource changes.

Both `https://waldo.love/` and `https://www.waldo.love/` serve the intended build.
Their HTML SHA-256 matches the locally built artifact:
`f49c5b1cf84f81c356e38136057225f41aae19d63b9df76345c2318a728c2771`.
Rendered Chromium regressions passed against both live hostnames.
HTTPS homepage, résumé, and sharing-image responses returned 200 with their expected content types.
HTTP redirected to HTTPS; unknown routes returned 403 instead of the homepage.
The release did not publish GitHub or LinkedIn profile updates.
The personal Ghostwriter profile still awaits confirmation of its separate machine-local destination.
