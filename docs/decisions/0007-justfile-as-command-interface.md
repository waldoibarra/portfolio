# Justfile as the Single Command Interface

## Context and Problem Statement

Earlier iterations of the project had commands scattered across `Makefile`, `package.json` scripts,
and inline GitHub Actions YAML steps — the same `vite build` invocation could appear in three
places with subtle drift. CI used `npm run ci:*` scripts that didn't exist locally; local
developers used `make` recipes that CI didn't know about. What should be the single canonical
command surface for local development, CI, and Husky hooks?

## Considered Options

- npm scripts only — every command in `package.json` `scripts`
- Makefile — GNU make, classic command runner
- Shell scripts in `scripts/` — one file per task
- Inline workflow YAML steps — commands written directly in workflow files
- Justfile — `just` recipes with grouping, default-list, and arg passing

## Decision Outcome

Chosen option: "Justfile", because it provides a single command surface used identically by local
developers, CI workflows, and Husky hooks. Recipe grouping (`[group("Linting")]`) gives
`just --list` a self-documenting layout. Non-Node tasks (Terraform, AWS CLI, markdownlint,
editorconfig) sit alongside Node tasks without forcing them into `package.json`. The default recipe
`@just --list` makes discovery free.

### Consequences

- Good, because one source of truth; CI calls `just lint`, locally you call `just lint`, Husky
  calls `just check` — identical execution
- Good, because grouped, self-documenting (`just` with no args lists everything)
- Good, because non-Node tasks (Terraform, AWS, markdownlint, editorconfig-checker) live alongside
  Node tasks naturally
- Good, because recipe composition (`check: (lint-all) (build) (tf-check)`) enables reusable
  building blocks
- Bad, because contributors must have `just` installed (mitigated: it's pinned in `.mise.toml`)
- Bad, because `just` is less ubiquitous than `make`; documented in `README.md` quickstart
