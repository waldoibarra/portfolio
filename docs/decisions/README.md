# Architectural Decision Records

This directory holds the project's Architectural Decision Records (ADRs) — durable records of why
the project is the way it is.

## ADR Index

| ADR | Title | Status |
| --- | --- | --- |
| ADR-0000 | [Use Markdown Architectural Decision Records](0000-use-markdown-architectural-decision-records.md) | accepted |
| ADR-0001 | [Use markdownlint-cli2 for Markdown Linting](0001-use-markdownlint-cli2-for-markdown-linting.md) | accepted |
| ADR-0002 | [Enforce Editorconfig Rules with editorconfig-checker](0002-enforce-editorconfig-rules-with-editorconfig-checker.md) | accepted |
| ADR-0003 | [Use Mise for Toolchain Pinning](0003-use-mise-for-toolchain-pinning.md) | accepted |
| ADR-0004 | [Custom Terraform Code Only, No Third-Party Modules](0004-custom-terraform-code-only-no-third-party-modules.md) | accepted |
| ADR-0005 | [Domain-Split CI/CD Workflows](0005-domain-split-cicd-workflows.md) | accepted |
| ADR-0006 | [Trunk-Based Development](0006-trunk-based-development.md) | accepted |
| ADR-0007 | [Justfile as the Single Command Interface](0007-justfile-as-the-single-command-interface.md) | accepted |
| ADR-0008 | [AI-Assisted Development as a First-Class Concern](0008-ai-assisted-development-as-first-class-concern.md) | proposed |
| ADR-0009 | [Use hk for Git Hook Management](0009-use-hk-for-git-hook-management.md) | accepted |

## What is an ADR?

An ADR records a decision that is:

- **Architectural** — affects structure, boundaries, technology, or process; not implementation
  detail.
- **Durable** — expected to outlive the change that introduced it.
- **Reasoned** — chosen between real alternatives, with tradeoffs worth explaining.

An ADR is _not_:

- A how-to guide or reference (that belongs in `docs/`).
- A project convention, gotcha, or reminder (that belongs in `AGENTS.md`).
- A per-change work log or session note (that belongs with the change itself, e.g., commit
  messages).

## Writing a new ADR

1. Pick the next available number (zero-padded, four digits, monotonic, never reused).
2. Copy the template from [adr-template.md](adr-template.md) to `NNNN-kebab-case-short-title.md`.
3. Fill it in.
4. Add a row to the [ADR Index](#adr-index) above, sorted by number.

## ADR File Names

- Format: `NNNN-kebab-case-short-title.md`
- `NNNN` is four digits, zero-padded, monotonic, never reused.
- The kebab-case short title is derived from the ADR's `# Heading` — lowercase, spaces replaced with
  hyphens, punctuation removed; make sure to use the exact same words from the heading.

## Status lifecycle

The [ADR Index](#adr-index) `Status` column is the source of truth for an ADR's status.

- `proposed` — under discussion, not yet binding.
- `accepted` — current, binding.
- `rejected` — considered and declined; kept for historical reasoning.
- `deprecated` — no longer applies but not replaced.
- `superseded by ADR-NNNN` — replaced by a newer ADR; both are kept.

Rejected and superseded ADRs are never deleted. The reasoning often outlives the decision.

## Template

The files [adr-template.md](adr-template.md) is adapted from [MADR 4.0](https://adr.github.io/madr/)
and must comply with the project's markdownlint rules. Refreshing them from a future MADR release is
itself a decision and requires a new ADR.
