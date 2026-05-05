# AI Assistant Instructions for Working with ADRs

When working with Architectural Decision Records (ADR) files in this directory (`docs/decisions/`),
follow these rules.

## Index maintenance

- When adding, modifying, or superseding an ADR, update the **Index** table in `README.md` in the
  same commit.
- The index `Status` column is the source of truth for ADR status. The minimal template has no
  `status` frontmatter — do not add one.
- Each index row links the ADR title to its file. Preserve the link when editing rows.
- Keep the index sorted by number, ascending.

## Supersession

When superseding ADR-X with ADR-Y:

- Set ADR-X's status in the index to `superseded by ADR-NNNN` (where `NNNN` is ADR-Y's number).
- Add a YAML frontmatter block (if ADR-X is using minimal template) at the very top of ADR-X's
  file recording the supersession, for example:

  ```markdown
  ---
  status: superseded by ADR-0007
  ---
  ```

  If ADR-X already has frontmatter (full template), update its `status` field.
- Reference ADR-X in ADR-Y's _Context and Problem Statement_ so readers can trace the lineage.
- Never delete superseded or rejected ADRs. Their reasoning is part of the project's history.

## Frontmatter — `decision-makers`

When using the full template, list every human and LLM that participated in shaping the decision
in the `decision-makers` field. LLMs are listed by model name (e.g., `Claude Opus 4.7`). This is
intentional: AI-first means recording AI participation as first-class, not as tool use. See
[ADR-0008](0008-ai-assisted-development-as-first-class-concern.md) for the framing.

- Humans go in `consulted` only when they were external sources of input (e.g., a colleague's
  review). The driver of the decision goes in `decision-makers`.
- LLMs go in `consulted` only when used purely to look up facts. LLMs that shaped reasoning go
  in `decision-makers`.

The minimal template has no frontmatter and is unaffected by this rule.

## Templates

- Files under `templates/` are adapted from MADR 4.0 and must comply with the project's
  markdownlint rules (dash list markers, underscore emphasis, 100-char line length).
- Refreshing templates from a future MADR release requires a new ADR documenting the change.

## Choosing a template

- Default to [templates/adr-template-minimal.md](templates/adr-template-minimal.md).
- Use [templates/adr-template.md](templates/adr-template.md) only when the decision genuinely needs
  the optional sections (multiple drivers, 5+ alternatives, per-option tradeoff sections,
  Confirmation, More Information). See [README.md](README.md) for the full criteria.

## Filenames

- Format: `NNNN-kebab-case-title.md`
- `NNNN` is four digits, zero-padded, monotonic, never reused.
- The kebab-case title is derived from the ADR's `# Heading` — lowercase, spaces replaced with
  hyphens, punctuation removed.
