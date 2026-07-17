# Portfolio

Agent router for this repo. Match the task to the file below; do not duplicate its contents here.

## Project Map

Read the right file before you start. Each row pairs a task with its source of truth.

| If you are... | Read this first |
| --- | --- |
| Touching code or infra, need the system map | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Changing Terraform, AWS, or the Mise toolchain | [docs/infrastructure.md](docs/infrastructure.md) |
| Changing CI/CD, workflows, or path filters | [docs/ci-cd-pipeline.md](docs/ci-cd-pipeline.md) |
| Recording or revising an architectural decision | [docs/decisions/README.md](docs/decisions/README.md) and [docs/decisions/AGENTS.md](docs/decisions/AGENTS.md) |
| Writing a commit message | [config/committed.toml](config/committed.toml) (Conventional Commits) |
| Running any task or adding a command | [justfile](justfile) — the single command interface |
| Changing the pre-commit / commit-msg hooks | [hk.pkl](hk.pkl) |
| Pinning a tool version | [.mise.toml](.mise.toml) (mirror the Terraform pin in `infrastructure/versions.tf`) |

## Conventions

- **Commands are `just` recipes.** Never call `npm`/`tsc`/`terraform`/`eslint` directly — invoke them
  through the justfile so local, hook, and CI paths stay identical.
- **One job per doc.** ARCHITECTURE.md = how it works; AGENTS.md = where to look; README.md = the
  showcase; `docs/decisions/` = the durable _why_. Do not duplicate across them.
- **Docs change with code.** If a change alters documented behavior, update the doc in the same
  commit — this is how the pipeline and docs drifted before.

## Anti-Patterns (Hard-Won)

| Don't ❌ | Do ✅ |
| --- | --- |
| No branching, no PRs | Commit directly to `trunk` |
| No inline shell in workflows | Every CI step calls a `just` recipe |
| No third-party Terraform modules | Custom Terraform only ([ADR-0004](docs/decisions/0004-custom-terraform-code-only-no-third-party-modules.md)) |
