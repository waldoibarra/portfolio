# Explore Waldo's world

**Historical predecessor:** The [library plan](/docs/plans/library-world.md)
supersedes this scope and delivery authority.
This plan retains early navigation decisions and rejected brochure alternatives.

## Goal and authority

Replace the brochure-style homepage with a personal, explorable website.
Start with Waldo as a person, then let visitors choose their depth and direction.
Prioritize information architecture, navigation, and completeness, in that order.
The user authorized research and implementation through local review.
The earlier refresh remains an intermediate implementation, not the final experience.
At this plan's earlier stage, no commits, pushes, deployment, or external profile updates were authorized.

## What the previous version missed

The homepage still opened as a professional pitch and made personal context secondary.
The GitHub draft repeated pinned projects and career information owned by LinkedIn.
The LinkedIn draft sounded institutional rather than recognizably personal.
More biography text cannot fix those information-architecture and interaction problems.

## Information architecture

| Layer | Reader question | Content and navigation |
| --- | --- | --- |
| World map | Who is Waldo, and what connects his interests? | Portrait, short personal welcome, worldview, clearly labeled destinations |
| Domain view | What matters to him here? | Distinct atmosphere, focused introduction, selected evidence, connections to other domains |
| Deeper reading | How does he think or practice this? | Native disclosures, practical examples, bounded claims, relevant external destinations |
| Public profiles | Where can I see more or connect? | LinkedIn for career, GitHub for building, Instagram for personal expression |

The map introduces one person, not competing identities or a list of skills.
Game-like exploration is a navigation metaphor, not a prerequisite for reaching information.

### Destinations

| View | Subject | Possible visual vocabulary |
| --- | --- | --- |
| Map | Curious human, systems builder, learner, life beyond output | Illustrated atlas with connected, clearly labeled places |
| Workshop | Software, AI harnesses, building, teaching, collaboration | Precise cyan technical drawing, workshop annotations |
| Observatory | Philosophy, worldviews, clear thinking, coherent decisions | Warm amber celestial diagrams and reflective typography |
| Garden | Presence, yoga, meditation, love, health, time, nature | Botanical green shapes, breathing room, softer composition |
| Crossroads | Trading discipline, marketing, sales, stories, travel, experiments | Terracotta routes, playful field notes, curiosity-driven connections |
| Connect | Easy reconnection and direct profile destinations | Warm welcoming space with clear channel purposes |

Labels pair the metaphor with plain-language descriptions.
Titles and metaphors may be refined during implementation without changing their content ownership.
Related-domain links explain connections rather than merely cycling through every view.

## Decisions

| ID | Decision | Reason |
| --- | --- | --- |
| I1 | Replace the homepage composition rather than append sections | The user explicitly rejected the brochure model |
| I2 | Use an overview, domain views, then optional depth | Applies documentation's layered reading paths to personal exploration |
| I3 | Use real fragment links for shareable views | Supports history and refresh without changing infrastructure routes |
| I4 | Keep all meaningful content in initial semantic HTML | Preserves readable content when enhancement fails or JavaScript is disabled |
| I5 | Add a small TypeScript view enhancer, not a client framework | Existing Vite and native web capabilities cover the interaction |
| I6 | Change theme by domain within one typographic and navigation system | Expresses range without making visitors relearn controls |
| I7 | Keep map and contact reachable from every domain | Exploration must never trap or delay visitors |
| I8 | Use restrained illustration and purposeful transitions | Creates a game-like feel without loading screens, scores, or forced play |
| I9 | Let public profiles own exhaustive career and project detail | Avoids duplicating LinkedIn history or GitHub pinned repositories |
| I10 | Rewrite profile drafts for their distinct intent | GitHub welcomes peers; LinkedIn starts relevant professional conversations |
| I11 | Preserve privacy and truthful expertise boundaries | Exploration, aspiration, and demonstrated expertise are different |
| I12 | Keep existing build, hosting, résumé route, and raw sources | The rewrite concerns presentation and navigation, not deployment architecture |

### Interaction rules

`rule/navigation-vs-action`: destinations use links with real URLs; disclosure uses native controls.
`rule/inline-before-modal`: deeper content expands in its domain instead of opening nested overlays.
`rule/keyboard-complete-flow`: destinations and details work by keyboard with visible focus.
`rule/preserve-mental-model`: URL, view, theme, title, focus, and location indicators agree.
`rule/value-before-interruption`: no onboarding, audio, login, or game mechanics block the introduction.

## Navigation and reachable states

- Default entry shows the world map and a short, human introduction.
- Recognized view fragments open that domain; recognized detail fragments open their parent disclosure.
- `#main` keeps the skip link usable and shows the map. Only unknown fragments normalize to `#map`.
- Refresh preserves a recognized destination. Semantic content is initially visible without JavaScript.
- Back and Forward restore the appropriate view without duplicate history entries.
- Map return and cross-domain links work repeatedly and during fast navigation.
- Nested detail links reveal their containing domain and disclosure when applicable.
- Unknown or malformed fragments recover to the map without untrusted markup.
- Modified clicks and external links retain native browser behavior.
- Hide inactive views only after initial fragment synchronization succeeds.
- Focus entered headings after intentional navigation, not on initial map load.
- Detail links reveal their parent before scrolling and focusing the disclosure summary.
- Reduced motion changes views immediately without parallax, zoom, or camera travel.
- Prolonged ambient movement would require a pause control; none is implemented.
- Without JavaScript, the document remains readable with ordinary anchor navigation and disclosures.
- Narrow screens use a legible destination list or compact map, never a shrunken desktop canvas.
- Contact links are available without visiting other domains first.

No backend, content fetch, local storage, authentication, or telemetry is required.
No fake levels, skill scores, achievements, clients, quotes, or game progress are allowed.

## Content and voice

Use Waldo's supplied language as evidence: learning, sharing, deep curiosity, love, and conscious presence.
The whiteboard connects careful systems with a fuller life, not productivity for its own sake.
Keep the tone warm, direct, playful where natural, and free from consultancy boilerplate.
Write about current learning without pretending mastery in every interest.
Do not repeat the same identity paragraph across website, GitHub, and LinkedIn.

GitHub's README complements pinned repositories; omit project catalogs and company names.
LinkedIn explains current focus, useful collaboration, and the human motivations behind the work.
Do not recreate a résumé or reuse the rejected draft's structure.
The website provides the broadest portrait, with optional depth and deliberate external handoffs.

Public destinations:

- `https://github.com/waldoibarra`
- `https://www.linkedin.com/in/waldoibarra`
- `https://www.instagram.com/waldo_lovesyou/`
- `mailto:waldo.ibarra@linux.com`

The Instagram handle comes from `raw/instagram-bio.md`; authenticated account access is not assumed.
Private reference images, intimate details, health information, and confidential work remain excluded.

## Implementation and documentation

1. Research progressive disclosure, accessible navigation, and suitable game-like portfolio references.
2. Independently review this plan, including the proposed state model and privacy boundaries.
3. Replace homepage content, composition, CSS, and view behavior with a coherent implementation.
4. Add focused navigation regression coverage through `just test-world` and browser checks.
5. Rewrite both profile drafts and update the public identity explanation.
6. Update architecture, glossary where needed, documentation routes, and implementation guidance.
7. Reconcile the editable design, preview, metadata, and sharing image with the new identity.
8. Run checks, independent review, real-browser flows, and rendered visual inspection.
9. Correct concrete defects, rebuild, and leave the preview available for owner review.

Keep one writer per working tree. Preserve existing uncommitted work outside this rewrite's scope.
Remove replaced homepage components only after their content has a deliberate destination.
Do not leave old operational documentation describing the static brochure as the current site.

## Verification

Run `just lint-ec`, `just lint-ts`, `just lint-css`, `just lint-md`, and `just build`.
Run `just test-world` for fragment classification and the initial HTML contract.
The existing preview at `http://localhost:4173/` serves rebuilt output; the lead owns its process.

Browser cases cover themes, map return, cross-links, and direct depth links.
Test refresh, Back/Forward, malformed fragments, rapid navigation, and repeated clicks.
Check keyboard/focus, no JavaScript, reduced motion, touch targets, and 200 percent zoom.
Inspect 1440, 390, and 320 pixel layouts for every materially different view.
Verify all local assets, social-image dimensions, profile links, and `/resume` preservation.
Capture overview and representative domain screenshots outside the repository.
Review the rendered composition, not just whether code and lint pass.

## Recovery and completion

Changes remain uncommitted and recoverable as a scoped diff; never reset the working tree.
Report implemented behavior, exercised checks, limitations, and direct local preview links.
Owner review judges identity and voice; automated checks cannot establish personal fit.
No conversion, recall, or business improvement is claimed without evidence.

## Status

Local rewrite implemented for owner review. No publication or remote profile changes were made.

Independent reviews identified missing Workshop evidence, initial disclosure focus,
and narrow navigation targets.
Those findings are corrected.
Workshop includes bounded examples and prospective collaboration offers.
Initial detail entry and refresh focus the disclosure summary.
Default map entry leaves focus unchanged.
Navigation targets now measure at least 44 pixels in both dimensions at 390 and 320 pixels.
`just test-world` passes four fragment and initial-document tests.
`just test-world-browser` passes rendered navigation, history, focus, mobile-target,
and no-JavaScript checks.
The browser recipe requires an existing Playwright installation and running preview.
It installs nothing.
Frontend lint checks, production build, and `git diff --check` pass.
Chromium screenshots cover all six views at desktop, mobile, and narrow widths.
Reduced-motion behavior, profile destinations, and local assets were exercised without runtime errors.
Firefox, Safari, screen-reader behavior, and actual browser 200 percent zoom remain unverified.
Owner review remains necessary for identity, voice, and visual taste.
The separate personal Ghostwriter profile awaits confirmation of its machine-local destination.
