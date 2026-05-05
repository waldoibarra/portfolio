# AI Assistant Instructions for Working with ADRs

When working with Architectural Decision Records (ADR) files in this directory (`docs/decisions/`),
follow these rules.

## ADR Index maintenance

- When adding, modifying, or superseding an ADR, update the **Index** table in [README.md](README.md)
  in the same commit.
- The index `Status` column is the source of truth for ADR status.
- Each index row links the ADR title to its file. Preserve the link when editing rows.
- Keep the index sorted by number, ascending.

## Supersession

When superseding ADR-X with ADR-Y:

- Set ADR-X's status in the index to `superseded by ADR-NNNN` (where `NNNN` is ADR-Y's number).
- Update ADR-X `status` field in itss frontmatter block, for example:

  ```markdown
  ---
  status: superseded by ADR-0007
  ---
  ```

- Reference ADR-X in ADR-Y's _Context and Problem Statement_ so readers can trace the lineage.
- Never delete superseded or rejected ADRs. Their reasoning is part of the project's history.

## Frontmatter — `decision-makers`

List every human and LLM that participated in shaping the decision in the `decision-makers` field.
LLMs are listed by model name (e.g., `Claude Opus 4.7`). This is intentional: AI-first means
recording AI participation as first-class, not as tool use.

- Humans go in `consulted` only when they were external sources of input (e.g., a colleague's
  review). The driver of the decision goes in `decision-makers`.
- LLMs go in `consulted` only when used purely to look up facts. LLMs that shaped reasoning go
  in `decision-makers`.

Example:

```markdown
---
status: accepted
date: 2026-05-05
decision-makers: Waldo Ibarra, Claude Opus 4.7
consulted: Gemini 3.1 Pro
---
```

## Working with an ADR

For more context on how to work with ADR files, read the [README.md](README.md) file.
