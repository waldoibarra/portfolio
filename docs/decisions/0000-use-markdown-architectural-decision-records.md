# Use Markdown Architectural Decision Records

## Context and Problem Statement

Code shows _what_ a project is. It rarely shows _why_. Decisions about technology, structure, and
process accumulate over the life of a project, and without a durable record their reasoning is lost
— to future contributors, to the original author six months later, and to anyone trying to evaluate
or extend the work.

We want a place to capture architectural decisions, the alternatives considered, and the tradeoffs
accepted, so that future readers can understand not just what the project does but why it's built
this way. Which format and structure should these records follow?

## Considered Options

- [MADR](https://adr.github.io/madr/) 4.0.0 — Markdown Architectural Decision Records
- [Michael Nygard's template](http://thinkrelevance.com/blog/2011/11/15/documenting-architecture-decisions)
  — the original ADR format
- [Y-Statements](https://www.infoq.com/articles/sustainable-architectural-design-decisions) —
  single-sentence decision records
- Formless — no convention, freeform Markdown

## Decision Outcome

Chosen option: "MADR 4.0.0", because

- MADR captures both the decision and its reasoning in a structured way without ceremony.
- The minimal template is short enough that writing an ADR isn't a barrier.
- The full template scales up when a decision deserves more depth (drivers, per-option tradeoffs,
  confirmation, more information).
- Nygard's format predates and is largely subsumed by MADR.
- Y-Statements compress too aggressively for non-trivial decisions.
- A formless approach guarantees inconsistency over time.
- The MADR project is actively maintained and well-documented.

### Consequences

- Good, because architectural decisions live in one searchable place instead of being scattered
  across code, commits, and prose.
- Good, because the structure prompts whoever writes an ADR to record alternatives and tradeoffs,
  not just outcomes.
- Bad, because every ADR adds maintenance overhead — the index in `README.md` must stay current.
- Bad, because deciding "is this an ADR?" requires judgment; the criteria in `README.md` reduce but
  don't eliminate ambiguity.
