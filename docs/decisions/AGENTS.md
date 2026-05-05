# AI Assistant Instructions for Working with ADRs

When working with Architectural Decision Records (ADR) files in this directory (`docs/decisions/`),
follow these rules.

## Index maintenance

- When adding, modifying, or superseding an ADR, update the **Index** table in `README.md` in the same commit.
- The index `Status` column is the source of truth for ADR status. The minimal template has no `status` frontmatter — do not add one.
- Each index row links the ADR title to its file. Preserve the link when editing rows.
- Keep the index sorted by number, ascending.

## Supersession

When superseding ADR-X with ADR-Y:

- Set ADR-X's status in the index to `superseded by ADR-NNNN` (where `NNNN` is ADR-Y's number).
- Add a YAML frontmatter block (if ADR-X is using minimal template) at the very top of ADR-X's file recording the supersession, for example:

  ```markdown
  ---
  status: superseded by ADR-0007
  ---
  ```

  If ADR-X already has frontmatter (full template), update its `status` field.
- Reference ADR-X in ADR-Y's *Context and Problem Statement* so readers can trace the lineage.
- Never delete superseded or rejected ADRs. Their reasoning is part of the project's history.

## Templates

- Files under `templates/` are pinned to MADR 4.0 verbatim. Do not modify them under any circumstances.
- Refreshing templates from a future MADR release requires a new ADR documenting the change.

## Choosing a template

- Default to [templates/adr-template-minimal.md](templates/adr-template-minimal.md).
- Use [templates/adr-template.md](templates/adr-template.md) only when the decision genuinely needs the optional sections (multiple drivers, 5+ alternatives, per-option tradeoff sections, Confirmation, More Information). See [README.md](README.md) for the full criteria.

## Filenames

- Format: `NNNN-kebab-case-title.md`
- `NNNN` is four digits, zero-padded, monotonic, never reused.
- The kebab-case title is derived from the ADR's `# Heading` — lowercase, spaces replaced with hyphens, punctuation removed.
