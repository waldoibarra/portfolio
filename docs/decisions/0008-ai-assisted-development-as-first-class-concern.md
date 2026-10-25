---
status: proposed
date: 2026-05-05
decision-makers: Waldo Ibarra, Claude Opus 4.7
consulted: Gemini 3 Flash
---

# AI-Assisted Development as a First-Class Concern

## Context and Problem Statement

This project is built by one human developer and AI agents as collaborators.
Several choices appeared to derive from an unrecorded "AI-first" stance.
They included trunk-based development, the justfile, the pre-commit hook,
`AGENTS.md`, and Engram memory. At the time, the README highlighted "AI-first engineering"
without durable reasoning for that claim.

The team is still experimenting with what "AI-first" means structurally. This ADR is `proposed`
to capture the direction explicitly while the experiment continues. When the conventions
stabilize, the status moves to `accepted`.

## Decision Drivers

- Honesty — the README's top highlight should anchor to a real decision, not rhetoric
- Reviewability — implicit stances cannot be evaluated, challenged, or evolved
- AI failure modes include wrong commands, default branch creation, and formatting drift.
  These need architectural mitigation, not just guardrails.
- Cross-session continuity — agents lose context between sessions;
  the proposed architecture must compensate
- Future-proofing — new "AI-first" choices need a place to land and a frame to evaluate them
  against

## Considered Options

- Treat AI as incidental — no `AGENTS.md` or agent-specific conventions.
  Agents read `README.md` and `architecture.md` like human contributors.
- Treat AI as a tool category — light `AGENTS.md` with a few tips, no architectural commitments
- Treat AI as a first-class collaborator — encode agent-shaped conventions structurally.
  Make `AGENTS.md` a peer to `README.md` and `architecture.md`.
  Include a persistent memory protocol and directory-scoped agent instructions.

## Decision Outcome

Proposed option: "Treat AI as a first-class collaborator".
Existing architectural choices motivated this stance; making it explicit would enable review. The
following choices are downstream of this decision:

- Justfile as canonical command interface
  ([ADR-0007](0007-justfile-as-the-single-command-interface.md)) — avoids unsupported agent commands.
  For example, agents might invoke `npm run X` for recipes elsewhere.
- Trunk-based development ([ADR-0006](0006-trunk-based-development.md)) — eliminates the PR
  ceremony that agents handle poorly; commits go straight to `trunk`
- editorconfig-checker
  ([ADR-0002](0002-enforce-editorconfig-rules-with-editorconfig-checker.md)) — explicitly
  catches LLM-generated diff violations (trailing whitespace, missing final newlines,
  indentation drift)
- Original pre-commit hook (`just check`) — replaced the PR gate.
  It caught lint, build, and Terraform test regressions before `trunk`.
- `AGENTS.md` as a peer to `README.md` and `architecture.md` — gives agents
  their own entry point
- Engram persistent memory protocol — gives agents cross-session continuity; the project's
  `AGENTS.md` mandates its use
- Directory-scoped `AGENTS.md` (e.g., `docs/decisions/AGENTS.md`)
  — places local instructions beside their relevant content

The hook and Engram claims above describe the proposal's original context.
Current [`hk.pkl`](/hk.pkl) selects checks by staged paths, and root `AGENTS.md` does not mandate Engram.

The "AI-Assisted Development" subsection of [architecture.md](/architecture.md)
maps current, cross-cutting concerns. This ADR records the
decision; that subsection records the cross-cutting concern.

### Consequences

- Good, because the AI-first stance is now visible and reviewable instead of implicit in
  scattered choices
- Good, because future AI-first architectural choices have a frame to evaluate against and a
  place to land
- Good, because [ADR-0002](0002-enforce-editorconfig-rules-with-editorconfig-checker.md)'s
  reasoning about LLM-generated diffs gains architectural significance
- Bad, because `proposed` status means the ADR will need a follow-up acceptance pass when the
  conventions stabilize
- Bad, because evolving AI tools may force re-evaluation of conventions built around this stance

### Confirmation

Observable evidence includes root and `docs/decisions/` copies of `AGENTS.md`.
CI and current `hk` hooks use the `justfile` command surface.
`editorconfig-checker` runs through `just lint-ec`.
The earlier Husky and Engram assertions no longer describe repository instructions.
Inline workflow shell logic or a new command surface bypassing `just` warrants review.

## Pros and Cons of the Options

### Treat AI as incidental

- Good, because zero maintenance overhead; the project documentation serves only humans
- Bad, because wrong commands, unwanted branches, and formatting drift lack architectural mitigation
- Bad, because the README's "AI-first engineering" highlight has no anchor and reads as
  rhetoric
- Bad, because cross-session agent context is lost on every session boundary

### Treat AI as a tool category

- Good, because acknowledges AI without committing to architectural changes
- Neutral, because a light `AGENTS.md` helps routing but cannot enforce commands.
  A tip alone cannot prevent an unsupported `npm run build`.
- Bad, because the stance is half-committed — neither the rigor of "first-class" nor the
  simplicity of "incidental"
- Bad, because conventions remain advisory; nothing in the architecture changes to support
  agents

### Treat AI as a first-class collaborator

- Good, because failure modes are addressed at the architectural level, not via guardrail lists
- Good, because future human and AI contributors can review and challenge the explicit stance
- Good, because existing choices ([ADR-0006](0006-trunk-based-development.md),
  [ADR-0007](0007-justfile-as-the-single-command-interface.md),
  [ADR-0002](0002-enforce-editorconfig-rules-with-editorconfig-checker.md)) gain a coherent
  frame
- Bad, because requires sustained discipline — every new architectural choice must be evaluated
  against the stance
- Bad, because AI-specific conventions add cognitive load for human-only contributors who do
  not need them

## More Information

- [architecture.md](/architecture.md) — "AI-Assisted Development" cross-cutting subsection
  describes the concern map (what is true today)
- [ADR-0002](0002-enforce-editorconfig-rules-with-editorconfig-checker.md),
  [ADR-0006](0006-trunk-based-development.md),
  [ADR-0007](0007-justfile-as-the-single-command-interface.md) — downstream choices
- Re-visit / acceptance trigger: consider `accepted` after ~3 months
  without new "AI-first" architectural choices.
  That would indicate stability.
  Also re-evaluate after substantial changes to the model, runtime,
  or memory protocol, regardless of stability.
