---
status: accepted
date: 2026-05-04
decision-makers: Waldo Ibarra, Claude Opus 4.7
consulted: Gemini 3 Flash
---

# Use Markdown Architectural Decision Records

## Context and Problem Statement

Code shows _what_ a project is. It rarely shows _why_.
Decisions about technology, structure, and process accumulate over a project's life.
Without a durable record, future contributors and the original author
can lose their reasoning.
That loss also affects anyone evaluating or extending the work six months later.

We want to capture architectural decisions, considered alternatives, and accepted tradeoffs.
Future readers should understand both what the project does
and why it is built this way. Which format and structure should these records follow?

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
- The template scales up when a decision deserves more depth (drivers, per-option tradeoffs,
  confirmation, more information).
- Nygard's format predates and is largely subsumed by MADR.
- Y-Statements compress too aggressively for non-trivial decisions.
- A formless approach guarantees inconsistency over time.
- The MADR project is actively maintained and well-documented.

### Consequences

- Good, because architectural decisions live in one searchable place,
  not scattered across code, commits, and prose.
- Good, because the structure prompts ADR authors to record alternatives and tradeoffs, not just outcomes.
- Bad, because every ADR adds maintenance overhead — the index in `README.md` must stay current.
- Bad, because "is this an ADR?" still requires judgment.
  The criteria in `README.md` reduce ambiguity but cannot eliminate it.
