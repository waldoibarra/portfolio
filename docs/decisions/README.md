# Architectural Decision Records

This directory holds Architectural Decision Records (ADRs).
They explain why the project is the way it is.

ADRs preserve historical reasoning, including earlier setup commands, workflow names, and
recovery assumptions. They are exceptions to current-documentation cleanup, not operational
instructions. Use the [local setup guide](/docs/how-to/run-locally.md) for `just setup` and `just run`.
Use the [infrastructure guide](/docs/how-to/change-infrastructure.md)
for local plans and CI-only applies. The current domain migration permits downtime and does not
promise retired-domain routing or recovery.
**Historical caveats:** ADR-0008 remains proposed; its Husky and Engram claims are not current instructions.
ADR-0009's setup examples are historical; ADR-0010's recovery assumptions do not override CI-only recovery.

## ADR Index

| ADR | Title | Status |
| --- | --- | --- |
| ADR-0000 | [Use Markdown Architectural Decision Records](0000-use-markdown-architectural-decision-records.md) | accepted |
| ADR-0001 | [Use markdownlint-cli2 for Markdown Linting](0001-use-markdownlint-cli2-for-markdown-linting.md) | accepted |
| ADR-0002 | [Enforce Editorconfig Rules with editorconfig-checker](0002-enforce-editorconfig-rules-with-editorconfig-checker.md) | accepted |
| ADR-0003 | [Use Mise for Toolchain Pinning](/docs/decisions/0003-use-mise-for-toolchain-pinning.md) | accepted |
| ADR-0004 | [Custom Terraform Code Only, No Third-Party Modules](0004-custom-terraform-code-only-no-third-party-modules.md) | accepted |
| ADR-0005 | [Domain-Split CI/CD Workflows](/docs/decisions/0005-domain-split-cicd-workflows.md) | superseded by [ADR-0010](/docs/decisions/0010-coordinate-static-site-and-route-deployments.md) |
| ADR-0006 | [Trunk-Based Development](0006-trunk-based-development.md) | accepted |
| ADR-0007 | [Justfile as the Single Command Interface](0007-justfile-as-the-single-command-interface.md) | accepted |
| ADR-0008 | [AI-Assisted Development as a First-Class Concern](0008-ai-assisted-development-as-first-class-concern.md) | proposed |
| ADR-0009 | [Use hk for Git Hook Management](0009-use-hk-for-git-hook-management.md) | accepted |
| ADR-0010 | [Coordinate Static Site and Route Deployments](/docs/decisions/0010-coordinate-static-site-and-route-deployments.md) | accepted |

## What is an ADR?

Write an ADR when the request or project process calls for one and all three gates apply:

- **Hard to reverse:** Changing the choice later has meaningful cost.
- **Surprising without context:** A future reader would ask why this choice was made.
- **Real trade-off:** Genuine alternatives existed and specific reasons favored this choice.

An ADR can concern structure, boundaries, technology, or process, not a routine implementation detail.

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
- Derive the kebab-case short title from the ADR's `# Heading`.
  Use the heading's exact words, lowercase them, replace spaces with hyphens, and remove punctuation.

## Status lifecycle

The [ADR Index](#adr-index) `Status` column is the source of truth for an ADR's status.

- `proposed` — under discussion, not yet binding.
- `accepted` — current, binding.
- `rejected` — considered and declined; kept for historical reasoning.
- `deprecated` — no longer applies but not replaced.
- `superseded by ADR-NNNN` — replaced by a newer ADR; both are kept.

Rejected and superseded ADRs are never deleted. The reasoning often outlives the decision.

## Template

The [ADR template](adr-template.md) adapts [MADR 4.0](https://adr.github.io/madr/)
and must comply with the project's markdownlint rules.
Maintain the template as ordinary documentation, preserving its MADR provenance and relevant rationale.
An ADR for a template change requires a request or an established process requirement.
All three [recording gates](#what-is-an-adr) must also apply.
