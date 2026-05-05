# Trunk-Based Development for Solo and AI Workflow

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
(solo + AI). The pre-commit hook (`just check` + commitlint) is the gate that PRs would have
provided, and CI gates (lint, build, terraform test) catch regressions before deploy. PR overhead
would slow iteration with no review payoff.

### Consequences

- Good, because it enables the fastest iteration loop; no PR ceremony
- Good, because pre-commit hook (`just check`) and commit-msg hook (commitlint) are deterministic
  and run identically locally and in CI
- Good, because the workflow forces small, well-scoped commits (no "PR rollup" temptation)
- Bad, because there is no second pair of eyes before merge; mitigated by AI collaborators
  reviewing changes pre-commit and by CI gates catching regressions before deploy
- Bad, because `git revert` is the only rollback path (acceptable: no migrations, no long-running
  state)
