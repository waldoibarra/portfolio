# Waldo Ibarra — Personal Portfolio

[![Infrastructure CI/CD](https://github.com/waldoibarra/portfolio/actions/workflows/infrastructure.yml/badge.svg)](https://github.com/waldoibarra/portfolio/actions/workflows/infrastructure.yml)
[![Website CI/CD](https://github.com/waldoibarra/portfolio/actions/workflows/website.yml/badge.svg)](https://github.com/waldoibarra/portfolio/actions/workflows/website.yml)

A personal portfolio site at [waldoibarra.com](https://waldoibarra.com) — a single Lit Web
Component styled with CSS-in-component, built with Vite, and deployed as a static site to AWS
(S3 + CloudFront + ACM + Route53) via custom Terraform. Every architectural choice is recorded as
an ADR; every command is a `just` recipe; every commit goes straight to `trunk`.

## Highlights

- **AI-first engineering** — AI agents are first-class collaborators in this codebase. See
  [ADR-0008](docs/decisions/0008-ai-assisted-development-as-first-class-concern.md) and
  [AGENTS.md](AGENTS.md).
- **Trunk-based development** — Direct commits to `trunk`. No branches, no PRs.
- **Terraform IaC on AWS** — S3, CloudFront, ACM, and Route53, no third-party modules.
- **Automated CI/CD with testing gates** — [Git hooks](hk.pkl),
  [Terraform tests](infrastructure/tests/), and
  [CI/CD pipelines](.github/workflows/).
- **Architectural Decision Records** — Durable reasoning lives in
  [docs/decisions/](docs/decisions/).

## Tech Stack

| Tool | Version | Role |
| ---- | ------- | ---- |
| [Lit](https://lit.dev/) | 3.2.1 | Web Components |
| [TypeScript](https://www.typescriptlang.org/) | 5.6.3 | Language (strict mode) |
| [Vite](https://vitejs.dev/) | 5.4.10 | Build and dev server |
| [Terraform](https://developer.hashicorp.com/terraform) | 1.15.1 | Infrastructure as Code |
| [GitHub Actions](https://github.com/features/actions) | — | CI/CD |
| [Mise](https://mise.jdx.dev) | — | Toolchain pinning |

## Project Structure

```text
portfolio/
├── .github/workflows/ — CI/CD: website.yml + infrastructure.yml
├── config/ — linter configs (eslint, stylelint, markdownlint, committed, ec)
├── docs/ — long-form guides + decisions/ (ADRs)
├── infrastructure/ — custom Terraform (S3, CloudFront, ACM, Route53) + tests/
├── public/ — static assets (favicon, resume)
├── scripts/ — deploy scripts: s3-sync.sh, invalidate.sh, tf-deploy.sh
├── src/ — Lit Web Component (app-element.ts) + global CSS
├── .mise.toml — pinned toolchain (Node, Terraform, AWS CLI, gh, just, ...)
├── hk.pkl — pre-commit hooks (dispatches just recipes by staged file)
├── justfile — the single command interface for every task
└── index.html — app entrypoint
```

## Quality & Tooling

The toolchain is pinned by [Mise](https://mise.jdx.dev) and every task is a
[`just`](https://just.systems) recipe, so local, pre-commit, and CI paths run the same commands.
Quality gates run on every commit: ESLint and Stylelint on source, markdownlint-cli2 and
editorconfig-checker on docs and config, TFLint and native Terraform tests on infrastructure, and
shellcheck on scripts. [hk](https://github.com/jdx/hk) dispatches the relevant recipes by staged
file; [committed](https://github.com/crate-ci/committed) enforces Conventional Commits.

## Local Development

1. Install [Mise](https://mise.jdx.dev) (one time).
2. Clone the repo and provision the toolchain:

    ```sh
    just install
    just start
    ```

    The dev server runs at [localhost:5173](http://localhost:5173).

For deeper Mise and Terraform setup, see [docs/infrastructure.md](docs/infrastructure.md).

## Deployment

Every push to `trunk` triggers a path-filtered GitHub Actions workflow that lints, tests, builds,
and deploys. Source changes run through `website.yml`; infrastructure changes through
`infrastructure.yml`. Full details in [docs/ci-cd-pipeline.md](docs/ci-cd-pipeline.md).

## Architectural Decisions

Architectural Decision Records document the "why" behind the project's structure, technology
choices, and process. Start with the index at
[docs/decisions/README.md](docs/decisions/README.md).

## Architecture

Engineers wanting the contributor map should read [ARCHITECTURE.md](ARCHITECTURE.md).

## License

MIT — see [LICENSE.md](LICENSE.md).
