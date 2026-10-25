# Portfolio

Match each task to its owner below. Read [portfolio language](/GLOSSARY.md) before changing domain terms.

## Project Map

Read the right file before you start. Each row pairs a task with its source of truth.

| If you are... | Read this first |
| --- | --- |
| Touching code or infra, need the system map | [Architecture](/architecture.md) |
| Setting up local development or the Mise toolchain | [Run locally](/docs/how-to/run-locally.md) |
| Changing Terraform or AWS | [Change infrastructure](/docs/how-to/change-infrastructure.md) and [infrastructure reference](/docs/reference/infrastructure.md) |
| Changing CI/CD, workflows, or path filters | [Delivery model](/docs/explanation/delivery.md) |
| Checking a deployment | [Verify a deployment](/docs/how-to/verify-deployment.md) |
| Recording or revising an architectural decision | [Decision index](/docs/decisions/README.md) and [ADR instructions](/docs/decisions/AGENTS.md) |
| Writing a commit message | [config/committed.toml](/config/committed.toml) (Conventional Commits) |
| Running project tasks or adding a recipe | [justfile](/justfile) |
| Editing the OpenPencil design | [Edit the landing design](/docs/how-to/edit-landing-design.md) |
| Implementing the design in HTML/CSS | [Implement the landing design](/docs/how-to/implement-landing-design.md) |
| Changing the pre-commit / commit-msg hooks | [hk.pkl](/hk.pkl) |
| Pinning a tool version | [.mise.toml](/.mise.toml) (mirror the Terraform pin in `infrastructure/versions.tf`) |
| Writing or reorganizing documentation | [Documentation index](/docs/README.md); keep README focused on what and why |
| Changing ownership boundaries or adding shared components | [Architecture](/architecture.md#evolving-the-system) |

## Conventions

- **Commands are `just` recipes.** Never call `npm`/`tsc`/`terraform`/`eslint` directly.
  Use justfile recipes to keep local, hook, and CI paths identical.
  Workstation design commands use `openpencil` directly; `just open-design` launches the GUI.
- **Documentation ownership:** README.md introduces the project; architecture.md maps current boundaries;
  AGENTS.md routes tasks. Keep task instructions, reference, and explanation separate.
  Read [documentation maintenance](/docs/README.md#maintain-the-documentation) before moving content.
- **Docs change with code.** Update documentation in the same commit when behavior changes.
  Separating these changes previously caused pipeline and documentation drift.

## Anti-Patterns (Hard-Won)

| Don't ❌ | Do ✅ |
| --- | --- |
| Branches or PRs for routine work | Direct commits to `trunk` after local checks ([ADR-0006](/docs/decisions/0006-trunk-based-development.md)) |
| No inline shell in workflows | Every CI step calls a `just` recipe |
| No third-party Terraform modules | Custom Terraform only ([ADR-0004](/docs/decisions/0004-custom-terraform-code-only-no-third-party-modules.md)) |
