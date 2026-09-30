# Portfolio

Agent router for this repo. Match the task to the file below; do not duplicate its contents here.

## Project Map

Read the right file before you start. Each row pairs a task with its source of truth.

| If you are... | Read this first |
| --- | --- |
| Touching code or infra, need the system map | [Architecture](/ARCHITECTURE.md) |
| Setting up local development or the Mise toolchain | [Run locally](/docs/how-to/run-locally.md) |
| Changing Terraform or AWS | [Change infrastructure](/docs/how-to/change-infrastructure.md) and [infrastructure reference](/docs/reference/infrastructure.md) |
| Changing CI/CD, workflows, or path filters | [Delivery model](/docs/explanation/delivery.md) |
| Checking a deployment | [Verify a deployment](/docs/how-to/verify-deployment.md) |
| Recording or revising an architectural decision | [Decision index](/docs/decisions/README.md) and [ADR instructions](/docs/decisions/AGENTS.md) |
| Writing a commit message | [config/committed.toml](/config/committed.toml) (Conventional Commits) |
| Running project tasks or adding a recipe | [justfile](/justfile) |
| Editing the OpenPencil design | [Edit the landing design](/docs/how-to/edit-landing-design.md) |
| Implementing the design in Lit | [Implement the landing design](/docs/how-to/implement-landing-design.md) |
| Changing the pre-commit / commit-msg hooks | [hk.pkl](/hk.pkl) |
| Pinning a tool version | [.mise.toml](/.mise.toml) (mirror the Terraform pin in `infrastructure/versions.tf`) |
| Writing or reorganizing documentation | [Documentation index](/docs/README.md); keep README focused on what and why |

## Conventions

- **Commands are `just` recipes.** Never call `npm`/`tsc`/`terraform`/`eslint` directly — invoke them
  through the justfile so local, hook, and CI paths stay identical.
  Workstation design commands use `openpencil` directly; `just open-design` launches the GUI.
- **One job per doc.** README.md = public introduction; ARCHITECTURE.md = system boundaries;
  AGENTS.md = task routing; `docs/decisions/` = durable reasoning. Keep task instructions,
  reference, and explanation separate, linked from [docs/README.md](/docs/README.md).
- **Docs change with code.** If a change alters documented behavior, update the doc in the same
  commit — this is how the pipeline and docs drifted before.

## Anti-Patterns (Hard-Won)

| Don't ❌ | Do ✅ |
| --- | --- |
| No branching, no PRs | Commit directly to `trunk` |
| No inline shell in workflows | Every CI step calls a `just` recipe |
| No third-party Terraform modules | Custom Terraform only ([ADR-0004](/docs/decisions/0004-custom-terraform-code-only-no-third-party-modules.md)) |
