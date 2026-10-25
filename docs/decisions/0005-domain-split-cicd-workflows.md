---
status: superseded by ADR-0010
date: 2026-05-05
decision-makers: Waldo Ibarra, Claude Opus 4.7
---

# Domain-Split CI/CD Workflows

## Context and Problem Statement

At the time, the repository treated website (Vite source) and infrastructure
(Terraform) as independent delivery domains.
Each had CI gates (lint, test) and CD steps (deploy, apply).
How could workflows run the appropriate pipeline without silently skipping work?
The proposed split followed domains, not stages.
Each workflow would run CI (lint+test) and CD (deploy/apply) end-to-end for its domain.

## Considered Options

- Single workflow with `paths-ignore` — one workflow, denylist for docs/config files
- Single workflow with conditional jobs — per-job `if:` guards skip irrelevant branches
- Two domain-split workflows: `website.yml` and `infrastructure.yml`.
  Each has an explicit `paths:` allowlist defining its triggers.

## Decision Outcome

Chosen option: "Two domain-split workflows with `paths` allowlist".
Explicit domain ownership enabled parallel execution and simplified concurrency groups.
Allowlists require maintenance: a new path that matches no pattern does not trigger a workflow.

### Consequences

- Good, because explicit ownership: `website.yml` owns source, `infrastructure.yml` owns Terraform
- Good, because parallel execution when a single commit touches both domains
- Bad, because unlisted files silently bypassed CI unless their paths were added.
  An absent workflow run never proved checks passed.
- Good, because per-domain concurrency groups (`group: website`,
  `group: infrastructure`) kept Terraform applies from blocking website deploys.
- Bad, because workflow YAML needed inclusion in its own `paths:` list.
  Including it made YAML edits retrigger the workflow; see the [delivery model](/docs/explanation/delivery.md).
- Bad, because shared concerns required duplication or a third workflow,
  such as a cross-domain security scan.
