---
status: proposed
date: 2026-05-05
decision-makers: Waldo Ibarra, DeepSeek v4 Pro
consulted: Claude Sonnet 4.6
---

# Use hk for Git Hook Management

## Context and Problem Statement

The project currently uses Husky 8 to manage two Git hooks: `pre-commit` (runs `just check`) and
`commit-msg` (runs `just lint-commit`). Husky is an npm dependency — hooks only work after
`npm ci`, and `"prepare": "husky"` must be a `package.json` script. This makes hook activation
coupled to the Node lifecycle, even though the hooks themselves delegate to `just` and execute
non-Node tools (Terraform, markdownlint-cli2, editorconfig-checker, AWS CLI).

The project already pins every tool via Mise ([ADR-0003](0003-use-mise-for-toolchain-pinning.md)).
The hooks manager should follow the same pattern — pinned by Mise, not by npm.

## Decision Drivers

- **Mise integration** — the hooks manager must be installable and version-pinned via Mise, not
  through a package manager from another ecosystem
- **No npm coupling** — hook activation must not depend on `node_modules` or `package.json`
  lifecycle scripts
- **Local-only** — hooks are a developer guardrail on `trunk`; they are not a CI concern (CI runs
  the same checks via `just`, independently)
- **Simplicity** — the hooks configuration file must be trivial to read and modify; all logic
  lives in scripts
- **Separation of concerns** — git-aware logic (what changed?) must live separately from tool
  invocation logic (how do I run eslint?)

## Considered Options

- **hk** — Rust-based, same creator as Mise (jdx), PKL config, `hk install` writes hook shims
- **lefthook** — Go-based, YAML config, mature ecosystem, CI-aware features
- **Stay with Husky 8** — already working, no migration cost
- **pre-commit (Python)** — the Python pre-commit framework, `.pre-commit-config.yaml`, broad
  plugin ecosystem

## Decision Outcome

Chosen option: "**hk**", because it is the only option created by the same author as Mise (jdx),
sharing the same design philosophy. Its sole purpose is managing local Git hooks — it has no CI
features, which is the right scope for this project (CI runs `just` recipes directly, not through
hooks). `hk install` is a one-time activation; hooks are executable shell scripts, not generated
shims that require a runtime.

Both hooks delegate to `just`: `pre-commit` calls `just check` (full suite), and `commit-msg`
calls `just lint-commit`. This mirrors the previous Husky arrangement with zero behavioral change.
Smart file-diff dispatch — where the hook detects staged changes and only runs relevant checks —
is deferred to a future iteration (see Revisit triggers below).

### Architecture

| Concern | Lives in | Owns |
| --- | --- | --- |
| Hook → script mapping | `hk.pkl` | Declares which script runs on which Git hook event |
| Hook scripts | `scripts/*-hook.sh` | Delegates to `just` recipes |
| Tool invocation | `justfile` | Knows HOW to run each tool (unchanged) |

The Justfile retains its role as the single command interface
([ADR-0007](0007-justfile-as-the-single-command-interface.md)). It does not learn git awareness.
The `scripts/` directory contains the hook scripts that act as thin glue between `hk` and `just`.

### Consequences

- Good, because hook management is decoupled from npm; `husky` and `"prepare": "husky"` are
  removed from `package.json`
- Good, because `hk` is pinned in `.mise.toml` alongside every other tool — one source of truth
  for the full toolchain
- Good, because `hk install` is a simple addition to `just init`, making onboarding a single
  `mise install && just init` command
- Good, because `@commitlint/cli` and `@commitlint/config-conventional` are replaced by
  `committed` (Rust binary), managed via Mise — one more npm dependency eliminated
- Good, because `scripts/*-hook.sh` → `just` → tool architecture has clear boundaries; each layer
  has one responsibility
- Bad, because `scripts/*-hook.sh` introduces shell scripts into the project — a new file
  category that must be linted and maintained

### Confirmation

- `husky` is absent from `package.json` `devDependencies` and `"prepare"` script
- `hk = "1.45.0"` is present in `.mise.toml` `[tools]`
- `hk.pkl` exists at the project root with `pre-commit` and `commit-msg` hook entries
- `scripts/pre-commit-hook.sh` and `scripts/commit-msg-hook.sh` exist and are executable
- `just init` includes `hk install`
- `ARCHITECTURE.md` references `hk` instead of `Husky`
- `just check` still works as the full-suite command; its composition is unchanged
- `.commitlintrc.json` and `@commitlint/cli` are removed; `just lint-commit` uses `committed`
  with `config/committed.toml`

## Pros and Cons of the Options

### hk

- Good, because same creator as Mise (jdx); shared design philosophy, co-evolution path
- Good, because `hk install` is a one-time activation; hooks are independent of any runtime
- Good, because PKL config provides type-safe, IDE-inspectable configuration
- Good, because scope is exactly local git hooks — no CI features, no unnecessary abstractions
- Neutral, because younger than lefthook; smaller community and less battle-testing
- Bad, because `hk` is less widely adopted than lefthook; fewer examples and troubleshooting
  resources

### lefthook

- Good, because mature, widely adopted, extensive documentation
- Good, because YAML multi-line strings are ergonomic for command definitions
- Good, because parallel execution support and advanced output control
- Neutral, because CI-aware features are not needed for this project's use case
- Bad, because YAML config diverges from the project's established config formats
- Bad, because larger surface area than needed — features like `skip_output`, `piped`, and CI
  detection are irrelevant for local-only hooks

### Stay with Husky 8

- Good, because zero migration cost; already works
- Good, because `husky` v8 is stable and well-understood by contributors and agents
- Bad, because hook activation depends on `npm ci` — hooks are silently inactive on a fresh
  clone until dependencies are installed
- Bad, because Husky 9 introduced license changes (subscription model for non-open-source); v8
  works now but the project is pinned to a version in maintenance mode
- Bad, because npm is the wrong toolchain for a hook manager when Mise already governs the
  project's tool versions

### pre-commit (Python)

- Good, because mature framework with a large plugin ecosystem
- Good, because `.pre-commit-config.yaml` is a standard format recognized across many projects
- Bad, because adds Python as a new toolchain dependency; every other tool is managed through
  Mise without a language runtime requirement
- Bad, because the plugin model (each hook is a repo + rev) is overkill for hooks that are
  one-line delegations to `just`
- Bad, because `pre-commit` hooks run in isolated environments, which conflicts with the
  project's model of hooks delegating to `just` recipes that depend on the local toolchain

## More Information

- [hk repository](https://github.com/jdx/hk)
- [Mise documentation](https://mise.jdx.dev)
- [ADR-0003](0003-use-mise-for-toolchain-pinning.md) — the decision that established Mise as the
  toolchain manager
- [ADR-0007](0007-justfile-as-the-single-command-interface.md) — the Justfile remains the single
  command interface; `scripts/` hook scripts extend it with hook wiring but do not replace it
- [ADR-0008](0008-ai-assisted-development-as-first-class-concern.md) — the pre-commit hook is the
  gate that PR review would otherwise provide; this ADR does not weaken that role
- **Revisit triggers**:
  - If `hk` becomes unmaintained or if Mise gains built-in hook management that supersedes
    `hk`'s role, re-evaluate against the remaining options
  - **Smart file-diff dispatch**: the `pre-commit` hook currently runs `just check`
    unconditionally. When smart dispatch is implemented, the hook should detect staged changes
    via `git diff --cached --name-only` and only run the relevant `just lint-*` targets. This
    is deferred, not rejected.
- **Commit message linting**: `@commitlint/cli` and `@commitlint/config-conventional`
  (both npm) are replaced by [committed](https://github.com/crate-ci/committed) — a Rust-based,
  language-agnostic commit linting tool that enforces conventional commits, subject length
  (50), and body line length (72). It is managed via `.mise.toml` as
  `committed = "1.1.11"` (aqua backend) and configured via `config/committed.toml`
  (`style = "conventional"`). The `just lint-commit` recipe invokes it as
  `committed --config config/committed.toml --commit-file`. This is not a separate
  architectural decision; it is the tool selected to implement the decision made here.
