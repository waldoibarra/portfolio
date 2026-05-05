---
status: accepted
date: 2026-05-05
decision-makers: Waldo Ibarra, Claude Opus 4.7
consulted: Gemini 3 Flash
---

# AI-Assisted Development as a First-Class Concern

## Context and Problem Statement

This project is built by one human developer and AI agents as collaborators. Several existing
architectural choices — trunk-based development, the justfile as command interface, the pre-commit
hook, `AGENTS.md` files, and the Engram persistent memory protocol — appear to derive from an
"AI-first" stance, but the stance itself has never been recorded. The README's top highlight is
"AI-first engineering," yet there is no durable reasoning anchoring that claim.

The team is still experimenting with what "AI-first" means structurally. This ADR is `proposed`
to capture the direction explicitly while the experiment continues. When the conventions
stabilize, the status moves to `accepted`.

## Decision Drivers

- Honesty — the README's top highlight should anchor to a real decision, not rhetoric
- Reviewability — implicit stances cannot be evaluated, challenged, or evolved
- AI failure modes — agents have specific failure patterns (wrong commands, branch creation by
  default, formatting drift) that benefit from architectural mitigation rather than guardrail
  lists
- Cross-session continuity — agents lose context between sessions; the project must compensate
  structurally
- Future-proofing — new "AI-first" choices need a place to land and a frame to evaluate them
  against

## Considered Options

- Treat AI as incidental — no `AGENTS.md`, no agent-specific conventions; agents read `README.md`
  and `ARCHITECTURE.md` like a human contributor would
- Treat AI as a tool category — light `AGENTS.md` with a few tips, no architectural commitments
- Treat AI as a first-class collaborator — agent-shaped conventions encoded structurally;
  `AGENTS.md` peer to `README.md` and `ARCHITECTURE.md`; persistent memory protocol;
  directory-scoped agent instructions

## Decision Outcome

Chosen option: "Treat AI as a first-class collaborator", because the existing architectural
choices already derive from this stance and the project benefits from making it explicit. The
following choices are downstream of this decision:

- Justfile as canonical command interface ([ADR-0007](0007-justfile-as-command-interface.md)) —
  eliminates the "command doesn't exist" failure mode where agents invoke `npm run X` for
  recipes that live elsewhere
- Trunk-based development ([ADR-0006](0006-trunk-based-development.md)) — eliminates the PR
  ceremony that agents handle poorly; commits go straight to `trunk`
- editorconfig-checker
  ([ADR-0002](0002-enforce-editorconfig-rules-with-editorconfig-checker.md)) — explicitly
  catches LLM-generated diff violations (trailing whitespace, missing final newlines,
  indentation drift)
- Pre-commit hook (`just check`) — the gate that PR review would otherwise have provided;
  catches lint, build, and Terraform test regressions before they hit `trunk`
- `AGENTS.md` as a peer to `README.md` and `ARCHITECTURE.md` — agents have a primary entry point
  that is theirs, not borrowed from human-targeted documentation
- Engram persistent memory protocol — gives agents cross-session continuity; the project's
  `AGENTS.md` mandates its use
- Directory-scoped `AGENTS.md` (e.g., `docs/decisions/AGENTS.md`) — local agent instructions
  live where they are most relevant, not in a single root file

The concern map — what is true today across the codebase — lives in the "AI-Assisted
Development" subsection of [ARCHITECTURE.md](../../ARCHITECTURE.md). This ADR records the
decision; that subsection records the cross-cutting concern.

### Consequences

- Good, because the AI-first stance is now visible and reviewable instead of implicit in
  scattered choices
- Good, because future AI-first architectural choices have a frame to evaluate against and a
  place to land
- Good, because [ADR-0002](0002-enforce-editorconfig-rules-with-editorconfig-checker.md)'s
  reasoning about LLM-generated diffs is no longer incidental — this ADR makes it load-bearing
- Bad, because `proposed` status means the ADR will need a follow-up acceptance pass when the
  conventions stabilize
- Bad, because AI tooling moves quickly; conventions encoded as downstream of this stance may
  need re-evaluation as the agent toolchain evolves

### Confirmation

Compliance is observable in the codebase: `AGENTS.md` exists at the repo root and in
`docs/decisions/`; `justfile` is the only command surface referenced from CI workflows and
Husky hooks; `editorconfig-checker` runs in `just lint-ec`; the Engram protocol is mandated by
the root `AGENTS.md`. Drift from this stance — for example, inline shell logic appearing in a
workflow YAML, or a new command surface bypassing `just` — would be a signal that the stance
is no longer being honored and the ADR should be revisited.

## Pros and Cons of the Options

### Treat AI as incidental

- Good, because zero maintenance overhead; the project documentation serves only humans
- Bad, because agents repeatedly hit avoidable failure modes (wrong commands, unwanted
  branching, formatting drift) with no architectural mitigation
- Bad, because the README's "AI-first engineering" highlight has no anchor and reads as
  rhetoric
- Bad, because cross-session agent context is lost on every session boundary

### Treat AI as a tool category

- Good, because acknowledges AI without committing to architectural changes
- Neutral, because a light `AGENTS.md` provides some routing benefit but cannot mitigate
  structural failure modes (a tip cannot prevent an agent from running `npm run build` if no
  enforcement exists)
- Bad, because the stance is half-committed — neither the rigor of "first-class" nor the
  simplicity of "incidental"
- Bad, because conventions remain advisory; nothing in the architecture changes to support
  agents

### Treat AI as a first-class collaborator

- Good, because failure modes are addressed at the architectural level, not via guardrail lists
- Good, because the stance is explicit and reviewable; future contributors (human or AI) can
  audit and challenge it
- Good, because existing choices ([ADR-0006](0006-trunk-based-development.md),
  [ADR-0007](0007-justfile-as-command-interface.md),
  [ADR-0002](0002-enforce-editorconfig-rules-with-editorconfig-checker.md)) gain a coherent
  frame
- Bad, because requires sustained discipline — every new architectural choice must be evaluated
  against the stance
- Bad, because AI-specific conventions add cognitive load for human-only contributors who do
  not need them

## More Information

- [ARCHITECTURE.md](../../ARCHITECTURE.md) — "AI-Assisted Development" cross-cutting subsection
  describes the concern map (what is true today)
- [ADR-0002](0002-enforce-editorconfig-rules-with-editorconfig-checker.md),
  [ADR-0006](0006-trunk-based-development.md),
  [ADR-0007](0007-justfile-as-command-interface.md) — downstream choices
- Re-visit / acceptance trigger: move to `accepted` when (a) no new "AI-first" architectural
  choice has been made for ~3 months, indicating the stance has stabilized; or (b) the agent
  toolchain shifts substantially (model, runtime, or memory protocol) such that re-evaluating
  the conventions is warranted regardless of stability
