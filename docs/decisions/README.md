# Architectural Decision Records

This directory holds the project's Architectural Decision Records (ADRs) — durable records of why the project is the way it is.

## Index

| Number | Title | Status |
| --- | --- | --- |
| 0000 | [Use Markdown Architectural Decision Records ](0000-use-markdown-architectural-decision-records.md) | accepted |

## What is an ADR?

An ADR records a decision that is:

- **Architectural** — affects structure, boundaries, technology, or process; not implementation detail.
- **Durable** — expected to outlive the change that introduced it.
- **Reasoned** — chosen between real alternatives, with tradeoffs worth explaining.

An ADR is *not*:

- A how-to guide or reference (that belongs in `docs/`).
- A project convention, gotcha, or reminder (that belongs in `AGENTS.md`).
- A per-change work log or session note (that belongs with the change itself, e.g., commit messages).

## Writing a new ADR

1. Pick the next available number (zero-padded, four digits, monotonic, never reused).
2. Copy a template from `templates/` to `NNNN-kebab-case-title.md`.
3. Fill it in.
4. Add a row to the [Index](#index) above, sorted by number.

### Choosing a template

**Use [`templates/adr-template-minimal.md`](templates/adr-template-minimal.md)** (the default) when:

- The decision has a clear winner among 2–4 alternatives.
- The reasoning fits in a few bullets per option.
- There's no need to document drivers, fitness functions, or per-option deep-dive tradeoffs.

**Use [`templates/adr-template.md`](templates/adr-template.md) (full)** when at least one of these is true:

- The decision has 5+ real alternatives worth comparing.
- You need to record explicit *decision drivers* (qualities, constraints, forces) separately from the options.
- Each option needs its own pros/cons section because the tradeoffs are non-obvious.
- You want a *Confirmation* section describing how the decision will be enforced or verified.
- You expect to revisit the decision and want a *More Information* section for links and re-visit triggers.

When in doubt, start with minimal. Upgrading later is a normal edit, not a process violation.

## Status lifecycle

The [Index](#index) `Status` column is the source of truth for an ADR's status.

- `proposed` — under discussion, not yet binding.
- `accepted` — current, binding.
- `rejected` — considered and declined; kept for historical reasoning.
- `deprecated` — no longer applies but not replaced.
- `superseded by ADR-NNNN` — replaced by a newer ADR; both are kept.

Rejected and superseded ADRs are never deleted. The reasoning often outlives the decision.

## Templates

The files under `templates/` are copied verbatim from [MADR 4.0](https://adr.github.io/madr/) and pinned at that version. They are not modified locally; refreshing them from a future MADR release is itself a decision and requires a new ADR.
