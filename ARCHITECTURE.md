# Architecture

## Bird's-Eye View

`waldoibarra.com` is a static portfolio site. Browsers fetch HTML/JS/CSS from CloudFront, which
serves objects from a private S3 bucket via Origin Access Control. The site is a single Lit Web
Component built with Vite from TypeScript sources. AWS resources (S3, CloudFront, ACM, Route53)
are managed by custom Terraform code in `infrastructure/`. GitHub Actions runs two domain-split
workflows — one for source, one for infrastructure — each gated by lint and test before deploying.
The local toolchain (Node, Terraform, AWS CLI, TFLint, just, markdownlint-cli2, editorconfig-checker,
gh) is pinned by Mise. Husky enforces `just check` on every commit so local and CI checks are
identical.

## Component Map

| Component | Responsibility | Lives in |
| --------- | -------------- | -------- |
| Frontend (Lit, Vite, TypeScript) | Renders the site | `src/`, `index.html`, `public/` |
| Infrastructure (custom Terraform) | Owns AWS resources (S3, CloudFront, ACM, Route53) | `infrastructure/` |
| Toolchain (Mise) | Pins versions of every tool the project uses | `.mise.toml` |
| Command surface (justfile) | Single way to invoke any task locally, in CI, or from hooks | `justfile` |
| CI (two GitHub Actions workflows) | Runs CI gates and CD for each domain | `.github/workflows/` |
| Pre-commit (Husky + commitlint) | Runs `just check` + commit-message lint before every commit | `.husky/` |

## Code Map

- `src/` — Owns: the Lit Web Component, global CSS, Vite type declarations. Does NOT own: build
  configuration (lives at root), tests (none yet for source).
- `infrastructure/` — Owns: every AWS resource as custom Terraform code, provider/version pins,
  Terraform Cloud backend config. Does NOT own: artifact upload (that's a CI step,
  `just s3-sync`), random naming (bucket name is deterministic).
- `infrastructure/tests/` — Owns: Terraform native tests (`main.tftest.hcl`) using mock
  providers, validating S3, OAC, and CloudFront properties. Does NOT own: integration tests
  against real AWS.
- `.github/workflows/` — Owns: `website.yml` (source CI+CD) and `infrastructure.yml` (infra
  CI+CD). Does NOT own: any inline shell logic — every step calls a `just` recipe.
- `docs/` — Owns: long-form guides (`infrastructure.md`, `ci-cd-pipeline.md`). Does NOT own:
  ADRs (those live in `docs/decisions/`) or routing instructions (those live in `AGENTS.md`).
- `docs/decisions/` — Owns: ADRs (numbered, MADR-format), the ADR index, and ADR templates.
  Does NOT own: how-to guides — those belong in `docs/`.
- `.husky/` — Owns: `pre-commit` (calls `just check`) and `commit-msg` (calls
  `just lint-commit`). Does NOT own: any logic — both hooks delegate to `just`.
- Root config files (`.mise.toml`, `justfile`, `vite.config.ts`, `tsconfig.json`,
  `eslint.config.mjs`, `.stylelintrc.json`, `.commitlintrc.json`, `.editorconfig`,
  `.markdownlint-cli2.yaml`) — Own: project-wide tool configuration. Each is the single source
  of truth for its tool.

## Cross-Cutting Concerns

### Delivery flow

A developer commits on `trunk`. Husky runs `just check` (lint-all + build + tf-check) and
commitlint. On push, GitHub Actions runs the path-filtered workflow for the changed domain. CI
gates (lint, test) execute via `just` recipes. CD steps (`s3-sync` + `invalidate`, or
`tf-plan-out` + `tf-apply-auto`) run only after CI passes. No PRs, no branches.

### Secrets

Three locations: (1) GitHub Actions secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`,
`TF_TOKEN_app_terraform_io`, `TF_VAR_domain_name`) — auto-masked by the runner. (2) Local `.env`
— loaded by Mise via `_.file = ".env"`; only `TF_TOKEN_app_terraform_io` is required (AWS creds
come from `~/.aws/credentials`). (3) Terraform Cloud — workspace `waldoibarra-com` in org
`waldo-io` holds remote state; the API token is the only Terraform Cloud secret.

### AI-Assisted Development

AI agents are first-class collaborators on this project. Several architectural elements are
shaped by that stance:

- `AGENTS.md` (root and `docs/decisions/`) routes agents to the right files for the task at hand
- `justfile` is the single command interface — agents that try `npm run X` fail loudly rather
  than silently doing the wrong thing
- Pre-commit hook (`just check`) catches lint, build, and Terraform test regressions before
  `trunk`; agents commit directly without PR review
- `editorconfig-checker` enforces formatting that LLM diffs frequently violate (trailing
  whitespace, missing final newlines, indentation drift)
- The Engram persistent memory protocol (configured in the agent runtime) gives agents
  cross-session continuity; the root `AGENTS.md` mandates its use
- ADR `decision-makers` frontmatter records LLM participation alongside humans, making AI
  contribution to architectural decisions auditable

See [ADR-0008](docs/decisions/0008-ai-assisted-development-as-first-class-concern.md) for the
framing. The stance is currently `proposed` — the conventions are still being refined.

### Documentation roles

Four files, four audiences: `README.md` is the showcase (should I care?), this `ARCHITECTURE.md`
is the contributor map (how does it work?), `AGENTS.md` is the agent router (where do I look?),
`docs/decisions/` is the durable reasoning (why is it like this?). Each has one job; they do not
overlap.

## Pointers

- [README.md](README.md) — project showcase, tech stack, quickstart, live link
- [docs/decisions/](docs/decisions/) — Architectural Decision Records (start with the
  [index](docs/decisions/README.md))
- [docs/infrastructure.md](docs/infrastructure.md) — Terraform + Mise + AWS workflow
- [docs/ci-cd-pipeline.md](docs/ci-cd-pipeline.md) — pipeline architecture, path filtering, gh
  CLI verification
- [justfile](justfile) — every command the project knows
- [.mise.toml](.mise.toml) — pinned toolchain
- [AGENTS.md](AGENTS.md) — agent routing
