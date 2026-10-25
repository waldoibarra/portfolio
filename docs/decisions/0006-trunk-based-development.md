---
status: accepted
date: 2026-05-05
decision-makers: Waldo Ibarra
---

# Trunk-Based Development

## Context and Problem Statement

The project has one human developer and AI agents as collaborators. There is no peer review pool.
Should branching follow GitHub Flow (feature branches + PRs), GitFlow, or trunk-based development?

## Considered Options

- GitHub Flow with PRs — feature branches, PRs reviewed and merged
- GitFlow — long-lived `develop` + `main` + feature/release/hotfix branches
- Trunk + short-lived feature branches — branch for any non-trivial change, merge fast
- Trunk-based, direct commits — every commit goes straight to `trunk`

## Decision Outcome

Chosen option: "Trunk-based, direct commits", because there is no review bottleneck to optimize for
(solo + AI). The original pre-commit hook (`just check` + commitlint) replaced the PR gate.
CI gates (lint, build, terraform test) caught regressions before deployment. PR overhead
would slow iteration with no review payoff.

### Consequences

- Good, because it enables the fastest iteration loop; no PR ceremony
- Good, because the original pre-commit (`just check`) and commit-msg (commitlint) hooks were deterministic.
  Their checks ran identically locally and in CI.
- Good, because the workflow forces small, well-scoped commits (no "PR rollup" temptation)
- Bad, because no second human reviewer checks changes before merge.
  AI collaborators review before commit; CI gates catch regressions before deployment.
- Bad, because `git revert` is the only rollback path (acceptable: no migrations, no long-running
  state)
