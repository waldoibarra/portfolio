---
status: accepted
date: 2026-05-05
decision-makers: Waldo Ibarra, DeepSeek v4 Pro
consulted: Claude Sonnet 4.6
---

# Use hk for Git Hook Management

## Context and Problem Statement

The project previously used Husky 8 for `pre-commit` (`just check`)
and `commit-msg` (`just lint-commit`).
Husky depended on npm: hooks required `npm ci` and a `"prepare": "husky"` script in `package.json`.
Activation therefore depended on Node's lifecycle.
The hooks delegated to `just`, running Terraform, markdownlint-cli2, editorconfig-checker, and AWS CLI.

The previous `pre-commit` ran `just check` unconditionally.
Every commit ran lint-all, build, and Terraform tests, regardless of changed files. A developer
fixing a typo in `README.md` paid the cost of `terraform validate` + `terraform test`. The hook
should be smart: detect which files changed and run only the relevant checks.

The project already pins every tool via Mise ([ADR-0003](0003-use-mise-for-toolchain-pinning.md)).
The hooks manager should follow the same pattern — pinned by Mise, not by npm.

## Decision Drivers

- **Mise integration** — install and pin the hook manager via Mise,
  not another ecosystem's package manager
- **No npm coupling** — hook activation must not depend on `node_modules` or `package.json`
  lifecycle scripts
- **Local-only** — hooks guard developers on `trunk`, not CI.
  CI independently runs the same checks through `just`.
- **Smart dispatch** — `pre-commit` must select lint/test/build targets relevant to staged changes
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

Chosen option: "**hk**", created by Mise's author (jdx), shares its design philosophy.
It manages local Git hooks without CI features.
CI runs `just` recipes directly, not through hooks.
`hk install` activates executable shell hooks once, without runtime-dependent generated shims.

Smart dispatch is implemented declaratively in `hk.pkl`.
Each `justfile` lint/check target becomes a `Step` with a `glob` pattern.
hk inspects staged files.
It skips unmatched steps.
It runs the remaining steps in parallel. The dispatch logic is
hk's responsibility, not the project's — no shell script reimplements `git diff --cached`.

### Architecture

| Concern | Lives in | Owns |
| --- | --- | --- |
| Hook → step dispatch | `hk.pkl` | Declares each step's `glob` and `check` command; hk skips steps whose globs do not match staged files |
| Tool invocation | `justfile` | Knows HOW to run each tool — every step's `check` calls a `just` recipe |

The Justfile remains the single command interface
([ADR-0007](0007-justfile-as-the-single-command-interface.md)).
hk selects checks for a commit.
`just` runs each check.
hk's native filtering avoids an intermediate, hand-rolled shell layer.

### Consequences

- Good, because hook management is decoupled from npm; `husky` and `"prepare": "husky"` are
  removed from `package.json`
- Good, because `.mise.toml` pins `hk` alongside other tools
  as one toolchain source
- Good, because `hk install` is a simple addition to `just install`, making onboarding a single
  `mise install && just install` command
- Good, because Mise-managed `committed` replaces `@commitlint/cli` and `@commitlint/config-conventional`.
  This Rust binary removes another npm dependency.
- Good, because smart dispatch skips irrelevant checks.
  Markdown-only commits skip TypeScript compilation and Terraform validation,
  plus EditorConfig checks on unrelated files.
- Good, because hk runs eligible `lint-md`, `lint-tf`, `lint-ec`, and `tf-check` steps concurrently
- Good, because declarative `hk.pkl` adds a check in two PKL lines, without shell edits
- Bad, because `just lint-X` still checks the whole tree, not only staged files.
  The benefit comes from skipping steps without staged matches.
  Per-file linting via `{{files}}` would bypass the justfile and remains deferred.
- Bad, because smart dispatch can miss transitive effects, such as types breaking CSS imports.
  Use `just check` explicitly when full-suite confidence is needed.

### Confirmation

These checks record the decision's original implementation, not current setup commands.
Use the [justfile](/justfile) and [local setup guide](/docs/how-to/run-locally.md) for current recipes.

- `husky` is absent from `package.json` `devDependencies` and `"prepare"` script
- `hk = "1.45.0"` is present in `.mise.toml` `[tools]`
- `hk.pkl` defines steps for `lint-*` recipes, `build`, and `tf-check`, each with a `glob`
- No `scripts/` hook directory — dispatch is declarative (deploy scripts live in `scripts/`
  but are not hooks)
- `just install` includes `hk install`
- `architecture.md` references `hk` instead of `Husky`
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
- Bad, because `skip_output`, `piped`, and CI detection enlarge the surface beyond local-only needs

### Stay with Husky 8

- Good, because zero migration cost; already works
- Good, because `husky` v8 is stable and well-understood by contributors and agents
- Bad, because hooks silently remained inactive until `npm ci` installed dependencies on fresh clones
- Bad, because Husky 9 introduced subscription licensing
  for non-open-source projects.
  Husky 8 worked but was in maintenance mode.
- Bad, because npm managed hooks while Mise already governed project tool versions

### pre-commit (Python)

- Good, because mature framework with a large plugin ecosystem
- Good, because `.pre-commit-config.yaml` is a standard format recognized across many projects
- Bad, because Python adds a runtime dependency absent from the other Mise-managed tools
- Bad, because repository-and-revision plugins overcomplicate
  one-line delegations to `just`
- Bad, because `pre-commit` isolates hooks from the local toolchain needed by `just` recipes

## More Information

- [hk repository](https://github.com/jdx/hk)
- [Mise documentation](https://mise.jdx.dev)
- [ADR-0003](0003-use-mise-for-toolchain-pinning.md) — the decision that established Mise as the
  toolchain manager
- [ADR-0007](0007-justfile-as-the-single-command-interface.md) —
  the Justfile remains the single command interface.
  Every `hk` step's `check` invokes a `just` recipe.
- [ADR-0008](0008-ai-assisted-development-as-first-class-concern.md) —
  pre-commit checks replace the PR gate.
  Smart dispatch speeds those checks without weakening them.
- **Revisit triggers**:
  - Re-evaluate alternatives if `hk` becomes unmaintained or Mise adds hook management that
    replaces its role.
  - **Per-file linting**: each step currently invokes `just lint-X` which lints the whole tree.
    Revisit this if tree-size-sensitive tools dominate pre-commit time, such as eslint on a larger codebase.
    Consider passing `{{files}}` directly to the tool, accepting the cost of bypassing that step's justfile.
- **Commit message linting:** [committed](https://github.com/crate-ci/committed)
  replaces npm's `@commitlint/cli` and `@commitlint/config-conventional`.
  This Rust-based, language-agnostic tool enforces conventional commits,
  50-character subjects, and 72-character body lines.
  `.mise.toml` pins `committed = "1.1.11"` through aqua.
  `config/committed.toml` sets `style = "conventional"`.
  `just lint-commit` invokes
  `committed --config config/committed.toml --commit-file`.
  This tool implements the existing decision, not a separate architectural choice.
