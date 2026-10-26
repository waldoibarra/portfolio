# Portfolio refresh

**Historical:** The [interactive world rewrite](/docs/plans/interactive-world.md) supersedes this
brochure composition and its navigation decisions. This plan preserves earlier rationale.

## Outcome and authority

Make `waldo.love` a memorable introduction and an easy place to reconnect.
Help companies, executives, and curious individuals understand Waldo's work and interests.
The user authorized implementation, local review, and profile drafts without another approval checkpoint.
No commits, pushes, deployment, or profile publication are authorized.

## Evidence and direction

Repository scouts reviewed ten repositories or directories, personal context, and external research.
The strongest evidence supports agent tooling, harness engineering, architecture, automation,
and knowledge sharing.
Private prototypes demonstrate exploration, not shipped commercial products.
Historical career sources support broad experience, but exact leadership counts conflict.
Percentage claims lack independently checked baselines; omit them from new promotional copy.
Keep confidential work and intimate personal details out of public artifacts.

Instagram adds a current emphasis: learning, sharing, and systematizing interests.
AI, marketing, and sales are current interests, not equivalent claims of professional expertise.

Read [brand research](/docs/research/personal-brand.md) for sources and practical implications.

## Decisions

| ID | Choice | Reason |
| --- | --- | --- |
| D1 | Lead with useful AI systems, learning, and human connection | Serves clients and networking visitors together |
| D2 | Offer harness improvement, team learning, and executive technical collaboration | Matches requested audiences and demonstrated capabilities |
| D3 | Show public projects before abstract expertise claims | Readers can inspect meaningful evidence |
| D4 | Retain portrait, native HTML/CSS, fonts, and existing color identity | Preserves personality and avoids unnecessary stack changes |
| D5 | Use an editorial composition, restrained annotation, and generous reading space | Avoids interchangeable card grids and decorative AI imagery |
| D6 | Use compact Work/Approach/About/Contact anchors; LinkedIn is primary, the public résumé email is secondary | Supersedes the former no-navigation/no-email guide; neither action promotes `/resume` |
| D7 | Add a personal section with thoughtful interests and current explorations | Makes Waldo memorable beyond professional credentials |
| D8 | Prefer native disclosures for project detail; no decorative animation requirement | Interactivity should clarify rather than distract |
| D9 | Draft GitHub README and LinkedIn headline/about locally under `docs/drafts/` | Enables review without external publication |
| D10 | Preserve raw sources, infrastructure, delivery, and other repositories | Keeps implementation bounded and recoverable |
| D11 | Restore Agentic AI Architect with a plain-language explanation | Preserves current identity without assuming AI jargon |
| D12 | Show Guros, WGSN, and H-E-B visibly | Career work deserves accessible, metric-free treatment |
| D13 | Give personal interests an editorial field-notes composition | Connects learning and deliberate living without a hobby inventory |
| D14 | Make offers concrete and prospective | Distinguishes proposed learning sessions from completed outcomes |
| D15 | Remove only the missing `/override.css` link from generated résumé HTML | Fixes a broken asset request without promoting or rewriting the résumé |

## Alternatives

A copy-only refresh would be smaller but leave networking and evidence-discovery gaps.
A new framework or elaborate animation would increase maintenance without demonstrating reader value.
Evolve the existing static site instead, with limited, meaningful interaction and clearer reading paths.

## Implementation

Review public destinations and claim boundaries before writing copy.
GitHub metadata and HTTP checks confirmed:

| Project | Public destination | Bounded claim |
| --- | --- | --- |
| Pi Lens | `https://github.com/waldoibarra/pi-lens` | Display-only Pi transcript folding; no execution or model-context changes |
| Dotfiles | `https://github.com/waldoibarra/dotfiles` | Tracked cross-client agent guidance and configuration |
| ATR in Ticks | `https://github.com/waldoibarra/atr-in-ticks-tradingview-indicator` | TradingView volatility indicator, not advice |

Homepage, README, and local profile drafts follow source review. Design reconciliation follows
visual decisions; independent content review precedes built-site browser review.
The whiteboard context adds a safe public theme: careful systems should leave room for people.
Its private checklist and image are not public assets or evidence of completed achievements.

1. Rework homepage hierarchy, contact actions, service framing, project evidence, and personal introduction.
2. Feature Pi Lens, the public harness repository, and the trading indicator with accurate boundaries.
3. Retain historical engineering and leadership evidence without disputed counts or metrics.
4. Update metadata and inspect the sharing image for stale positioning.
5. Update README for collaborators; retain engineering evidence and link canonical setup instructions.
6. Update architecture, glossary where necessary, and affected implementation/design documentation.
7. Reconcile the design and preview with changed visual intent using OpenPencil guidance.
8. Add review-ready GitHub and LinkedIn drafts, plus a concise publication checklist.
9. Keep `/resume` available, but do not link it until a content review clears its specific risks.

The generated résumé remains outside wholesale rewriting scope.
Its dangling `/override.css` request may be removed without changing embedded styles.
Current HTML includes conflicting
leadership counts, a phone number, named references, and AI-directed ranking instructions.
Remove or correct these in the owning résumé source, regenerate, and review before promotion.
Do not infer safety from a historical label.
Do not copy private repository notes into this repository.

## Verification

- Run `just lint-ec`, `just lint-ts`, `just lint-css`, `just lint-md`, and `just build`.
- Validate internal links, includes, contact destinations, metadata, and absence of confidential copy.
- Independently review website, documentation, and profile drafts against these decisions.
- Run `just build`, then `just preview`; inspect `/`, `/resume`, internal and external links,
  fonts, images, metadata, and narrow and wide layouts in a real browser.
- Check keyboard navigation, focus, disclosures, reduced motion, and JavaScript-disabled rendering.
- Confirm `/resume`, images, and fonts remain reachable through local preview.
- Export `Landing` and `Mobile` through OpenPencil with `--font-policy strict`; run
  `openpencil lint docs/designs/landing.fig --json` and review both renders.
- Capture screenshots outside the repository for local review. Apply the research privacy exclusions
  to drafts and screenshots too.
- Correct concrete findings, then rerun affected checks and review.

## Recovery and handoff

Changes stay uncommitted, confined to this repository.
Preserve user edits, including `raw/instagram-bio.md`.
Recovery means reverting only this task's reviewed changes, never resetting the working tree.
Report local preview instructions, changed files, passing checks, and unresolved limitations.
The user reviews public copy and profile drafts before any separate publication request.

## Status

The latest approved requirement expands the whole-person introduction across homepage, README,
GitHub, and LinkedIn. Review the updated public identity explanation before publication.
The generated résumé's missing stylesheet link is removed; its content remains unpromoted.
Implementation completed for homepage, README, metadata, and local profile drafts.
D6 is resolved. `/resume` remains unpromoted pending targeted source remediation.
`just lint-ec`, `just lint-ts`, `just lint-css`, `just lint-md`, and `just build` passed
for the latest implementation. `git diff --check` passed.
The editable desktop and mobile compositions show public work, career evidence, offers,
field notes, and contact. Both strict-font exports succeeded; the latest design lint reports
zero errors, zero warnings, and 155 informational suggestions. The updated desktop preview is
1440 × 2800 pixels. The sharing image is a 1200 × 630 JPEG with the current headline,
public portrait, and human-life theme. The LinkedIn action now says `Connect on LinkedIn`.
Local review is available at `http://localhost:4173/` under the lead's preview process.
Chromium checks passed at 1440, 390, and 320 pixels without horizontal overflow or runtime errors.
Keyboard navigation, visible focus, no-JavaScript content, and reduced-motion behavior passed.
All requested page assets loaded; `/resume` remained reachable without the missing stylesheet request.
No homepage link promotes the résumé. The final homepage has no disclosure controls to exercise.
The LinkedIn profile returned HTTP 200 in the browser; account messaging was not exercised.
The lead corrected the audit's hero sentence and added image-specific sharing alt text.
Both sharing tags were verified in the rebuilt, served HTML.
Final frontend lint checks, build, and `git diff --check` passed.
Screenshots are outside the repository at `/tmp/waldo-portfolio-browser/final/`.
Owner review of public wording and visual taste remains; conversion and recall are not measured.
Nothing was committed, pushed, deployed, or published.
