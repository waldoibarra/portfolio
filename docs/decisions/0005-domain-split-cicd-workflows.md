---
status: accepted
date: 2026-05-05
decision-makers: Waldo Ibarra, Claude Opus 4.7
---

# Domain-Split CI/CD Workflows

## Context and Problem Statement

The repository contains two independent delivery domains — the website (Lit/Vite source) and the
infrastructure (Terraform). Each has its own CI gates (lint, test) and CD steps (deploy, apply). How
should GitHub Actions workflows be structured to run the right pipeline for the right change without
silently skipping work? The split is by domain, not by stage — each workflow runs CI (lint+test)
and CD (deploy/apply) end-to-end for its domain.

## Considered Options

- Single workflow with `paths-ignore` — one workflow, denylist for docs/config files
- Single workflow with conditional jobs — one workflow with per-job `if:` guards to skip branches
  that don't apply
- Two domain-split workflows with `paths` allowlist — `website.yml` and `infrastructure.yml`, each
  with explicit `paths:` listing what triggers it

## Decision Outcome

Chosen option: "Two domain-split workflows with `paths` allowlist", because explicit ownership per
domain enables parallel execution when both domains change and simplifies concurrency groups.
Allowlists require maintenance: a new path that matches no pattern does not trigger a workflow.

### Consequences

- Good, because explicit ownership: `website.yml` owns source, `infrastructure.yml` owns Terraform
- Good, because parallel execution when a single commit touches both domains
- Bad, because a new file/config outside the allowlists silently bypasses CI unless its path is
  added; an absent workflow run is not evidence that checks passed
- Good, because concurrency groups (`group: website`, `group: infrastructure`) are scoped per domain
  so a long Terraform apply never blocks a website deploy
- Bad, because workflow YAML changes must be added to that workflow's own `paths:` list; the YAML
  file itself is in its allowlist so a YAML edit re-triggers (see the
  [delivery model](/docs/explanation/delivery.md) for the operational caveat)
- Bad, because shared concerns (e.g., a future security scan over both source and infra) must be
  duplicated or factored into a third workflow
