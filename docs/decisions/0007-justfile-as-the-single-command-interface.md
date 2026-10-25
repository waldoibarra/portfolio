---
status: accepted
date: 2026-05-05
decision-makers: Waldo Ibarra
consulted: Claude Sonnet 4.6
---

# Justfile as the Single Command Interface

## Context and Problem Statement

Earlier iterations scattered commands across `Makefile`, `package.json`, and inline Actions YAML.
The same `vite build` invocation could appear in three places with subtle drift.
CI used `npm run ci:*` scripts unavailable locally.
Local developers used `make` recipes unavailable in CI. What should be the single canonical
command surface for local development, CI, and Husky hooks?

## Considered Options

- npm scripts only — every command in `package.json` `scripts`
- Makefile — GNU make, classic command runner
- Shell scripts in `scripts/` — one file per task
- Inline workflow YAML steps — commands written directly in workflow files
- Justfile — `just` recipes with grouping, default-list, and arg passing

## Decision Outcome

Chosen option: "Justfile", because local developers, CI workflows,
and the original Husky hooks shared commands. Recipe grouping (`[group("Linting")]`) gives
`just --list` a self-documenting layout. Non-Node tasks (Terraform, AWS CLI, markdownlint, editorconfig)
sit alongside Node tasks without entering `package.json`. The default recipe
`@just --list` makes discovery free.

### Consequences

- Good, because commands had one source of truth.
  CI and local developers called `just lint`; Husky originally called `just check`.
- Good, because grouped, self-documenting (`just` with no args lists everything)
- Good, because non-Node tasks (Terraform, AWS, markdownlint, editorconfig-checker) live alongside
  Node tasks naturally
- Good, because recipe composition (`check: (lint) (build) (tf-check)`) enables reusable
  building blocks
- Bad, because contributors must have `just` installed (mitigated: it's pinned in `.mise.toml`)
- Bad, because `just` is less ubiquitous than `make`; documented in `README.md` quickstart
