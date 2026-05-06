---
status: accepted
date: 2026-05-05
decision-makers: Waldo Ibarra, DeepSeek v4 Pro
consulted: Claude Sonnet 4.6
---

# Use hk for Git Hook Management

## Context and Problem Statement

The project previously used Husky 8 to manage two Git hooks: `pre-commit` (runs `just check`) and
`commit-msg` (runs `just lint-commit`). Husky is an npm dependency — hooks only work after
`npm ci`, and `"prepare": "husky"` must be a `package.json` script. This makes hook activation
coupled to the Node lifecycle, even though the hooks themselves delegate to `just` and execute
non-Node tools (Terraform, markdownlint-cli2, editorconfig-checker, AWS CLI).

The previous `pre-commit` hook also ran `just check` unconditionally — a full
lint-all + build + Terraform test suite on every commit, regardless of what changed. A developer
fixing a typo in `README.md` paid the cost of `terraform validate` + `terraform test`. The hook
should be smart: detect which files changed and run only the relevant checks.

The project already pins every tool via Mise ([ADR-0003](0003-use-mise-for-toolchain-pinning.md)).
The hooks manager should follow the same pattern — pinned by Mise, not by npm.

## Decision Drivers

- **Mise integration** — the hooks manager must be installable and version-pinned via Mise, not
  through a package manager from another ecosystem
- **No npm coupling** — hook activation must not depend on `node_modules` or `package.json`
  lifecycle scripts
- **Local-only** — hooks are a developer guardrail on `trunk`; they are not a CI concern (CI runs
  the same checks via `just`, independently)
- **Smart dispatch** — `pre-commit` must run only the lint/test/build targets relevant to staged
  changes, not the full suite every time
- **Simplicity** — hook dispatch should be declarative, not imperative shell logic
- **Single command interface** — the `justfile` ([ADR-0007](0007-justfile-as-the-single-command-interface.md))
  remains the single way to invoke any tool

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

Smart dispatch is implemented declaratively in `hk.pkl`. Each `lint-*` and check target in the
`justfile` is registered as a `Step` with a `glob` pattern. hk inspects staged files, skips any
step whose `glob` does not match, and runs the survivors in parallel. The dispatch logic is
hk's responsibility, not the project's — no shell script reimplements `git diff --cached`.

### Architecture

| Concern | Lives in | Owns |
| --- | --- | --- |
| Hook → step dispatch | `hk.pkl` | Declares each step's `glob` and `check` command; hk skips steps whose globs do not match staged files |
| Tool invocation | `justfile` | Knows HOW to run each tool — every step's `check` calls a `just` recipe |

The Justfile retains its role as the single command interface
([ADR-0007](0007-justfile-as-the-single-command-interface.md)). hk owns "which checks run for
this commit"; `just` owns "how each check runs". No intermediate shell layer is needed — hk's
native step filtering replaces what would otherwise be hand-rolled bash.

### Consequences

- Good, because hook management is decoupled from npm; `husky` and `"prepare": "husky"` are
  removed from `package.json`
- Good, because `hk` is pinned in `.mise.toml` alongside every other tool — one source of truth
  for the full toolchain
- Good, because `hk install` is a simple addition to `just install`, making onboarding a single
  `mise install && just install` command
- Good, because `@commitlint/cli` and `@commitlint/config-conventional` are replaced by
  `committed` (Rust binary), managed via Mise — one more npm dependency eliminated
- Good, because smart dispatch eliminates irrelevant tool runs; a Markdown-only commit skips
  TypeScript compilation, Terraform validation, and editorconfig violations on unrelated files
- Good, because hk runs eligible steps in parallel — `lint-md`, `lint-tf`, `lint-ec`, and
  `tf-check` execute concurrently, reducing wall-clock time
- Good, because the dispatch is declarative (`hk.pkl`) — adding a new check is two lines of PKL,
  not a shell script edit
- Bad, because each step still calls `just lint-X` which runs the underlying tool against the
  whole tree, not just staged files. The win comes from skipping the step entirely when no
  staged file matches its glob. Per-file linting (passing `{{files}}` to the tool directly)
  would bypass the justfile and is deferred
- Bad, because smart dispatch can miss transitive effects (e.g., a TypeScript type change that
  breaks a CSS import). `just check` remains available as the explicit "run everything" command
  for when full confidence is needed

### Confirmation

- `husky` is absent from `package.json` `devDependencies` and `"prepare"` script
- `hk = "1.45.0"` is present in `.mise.toml` `[tools]`
- `hk.pkl` exists at the project root with one step per `lint-*` recipe plus `build` and
  `tf-check`, each with an appropriate `glob`
- No `scripts/` hook directory — dispatch is declarative (deploy scripts live in `scripts/`
  but are not hooks)
- `just install` includes `hk install`
- `ARCHITECTURE.md` references `hk` instead of `Husky`
- `just check` still works as the full-suite command; its composition is unchanged
- `.commitlintrc.json` and `@commitlint/cli` are removed; `just lint-commit` uses `committed`
  with `config/committed.toml`
- `just debug-pre-commit-hook` runs `hk run pre-commit -v` for inspecting which steps fire and
  why

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
  command interface; every `hk` step's `check` is a `just` recipe invocation
- [ADR-0008](0008-ai-assisted-development-as-first-class-concern.md) — the pre-commit hook is the
  gate that PR review would otherwise provide; smart dispatch makes that gate faster without
  weakening it
- **Revisit triggers**:
  - If `hk` becomes unmaintained or if Mise gains built-in hook management that supersedes
    `hk`'s role, re-evaluate against the remaining options
  - **Per-file linting**: each step currently invokes `just lint-X` which lints the whole tree.
    If pre-commit time becomes dominated by tools that scale with tree size (eslint over a much
    larger codebase, for example), revisit whether steps should pass `{{files}}` directly to
    the tool — accepting the cost of bypassing the justfile for that step
- **Commit message linting**: `@commitlint/cli` and `@commitlint/config-conventional`
  (both npm) are replaced by [committed](https://github.com/crate-ci/committed) — a Rust-based,
  language-agnostic commit linting tool that enforces conventional commits, subject length
  (50), and body line length (72). It is managed via `.mise.toml` as
  `committed = "1.1.11"` (aqua backend) and configured via `config/committed.toml`
  (`style = "conventional"`). The `just lint-commit` recipe invokes it as
  `committed --config config/committed.toml --commit-file`. This is not a separate
  architectural decision; it is the tool selected to implement the decision made here.
