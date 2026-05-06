# CI/CD Pipeline

## Overview

The project uses two focused GitHub Actions workflows instead of one monolithic pipeline:

- `website.yml` — builds and deploys the website
- `infrastructure.yml` — validates, tests, and applies Terraform infrastructure

Both workflows are path-filtered: only the relevant pipeline runs for a given change. See
[Path Filtering](#path-filtering).

Both workflows use the [justfile](/justfile) as the single command interface. CI, local
development, and Git hooks all call the same `just` recipes. No inline commands.

## Workflows

### Website Pipeline (`.github/workflows/website.yml`)

Triggers on push to `trunk` when source files change:

```yaml
paths:
  - 'src/**'
  - 'public/**'
  - 'index.html'
  - 'package.json'
  - 'package-lock.json'
  - 'vite.config.ts'
  - 'tsconfig.json'
  - 'eslint.config.mjs'
  - 'config/.stylelintrc.json'
  - '.mise.toml'
  - 'scripts/s3-sync.sh'
  - 'scripts/invalidate.sh'
  - '.github/workflows/website.yml'
```

Steps (all via `just` recipes):

1. Checkout
2. Set up toolchain (mise-action, all tools from cache)
3. Cache npm dependencies (`actions/cache@v5`, keyed on `package-lock.json`)
4. `just install-node-deps` (wraps `npm ci`)
5. `just lint-ec` — editorconfig check (cheapest gate)
6. `just lint-sh` — shellcheck on deploy scripts
7. `just lint-ts` — ESLint
8. `just lint-css` — Stylelint
9. `just build` — `tsc -b && vite build`
10. `just tf-init` — init Terraform to read outputs
11. `just s3-sync` — upload `dist/` to S3
12. `just invalidate` — CloudFront cache invalidation `/*`

Secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `TF_TOKEN_app_terraform_io`

Concurrency: group `website`, `cancel-in-progress: false`

**Note**: Requires at least one successful `infrastructure.yml` run to populate Terraform outputs
(S3 bucket ID, CloudFront distribution ID). For initial project setup, run `infrastructure.yml`
manually via `workflow_dispatch`.

### Infrastructure Pipeline (`.github/workflows/infrastructure.yml`)

Triggers on push to `trunk` when infrastructure files change:

```yaml
paths:
  - 'infrastructure/**'
  - '.mise.toml'
  - 'scripts/tf-deploy.sh'
  - '.github/workflows/infrastructure.yml'
```

Steps (all via `just` recipes):

1. Checkout
2. Set up toolchain (mise-action, all tools from cache)
3. Cache Terraform providers (`actions/cache@v5`, key on `infrastructure/.terraform.lock.hcl` hash,
    env `TF_PLUGIN_CACHE_DIR`)
4. `just lint-tf` — TFLint (GATE: stops apply if lint fails)
5. `just tf-check` — init + validate + test (CI GATE: 8 mock-provider tests covering S3, OAC,
    CloudFront)
6. `just tf-deploy` — `terraform plan -out=tfplan && terraform apply -auto-approve tfplan`

Secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`,
`TF_TOKEN_app_terraform_io`, `TF_VAR_domain_name`

Concurrency: group `infrastructure`, `cancel-in-progress: false`

## Path Filtering

Each workflow uses an **allowlist** (`paths`) rather than a denylist.

### Why allowlist?

Allowlists are explicit about what triggers a given pipeline. `website.yml` only runs for source
changes; `infrastructure.yml` only runs for infrastructure changes. Unlike the old single-workflow
denylist approach (`paths-ignore`), there is no risk of a new config file being silently skipped —
each workflow declares exactly which paths it owns. A change that touches both source and
infrastructure triggers both pipelines in parallel.

### What triggers which pipeline

| Change | Triggered |
| ------ | --------- |
| `src/**`, `public/**`, `index.html`, `package.json`, etc. | `website.yml` only |
| `infrastructure/**` | `infrastructure.yml` only |
| Both source AND infrastructure | Both workflows in parallel |
| `docs/**`, `**.md`, `.gitignore`, `.editorconfig` | Neither (both skip) |

### How to verify

1. **Docs-only push** — commit a change that only touches `README.md`. Neither workflow should
    appear.
2. **Source push** — commit a change to `src/`. Only `website.yml` should appear.
3. **Infrastructure push** — commit a change to `infrastructure/`. Only `infrastructure.yml` should
    appear.

### Caveat: workflow YAML edits self-trigger

Each workflow's `paths:` list includes its own YAML file (e.g.,
`.github/workflows/website.yml` is in `website.yml`'s `paths`), so editing the workflow itself
always triggers the pipeline — regardless of any other `paths` filtering. This is intentional: a
workflow edit must be tested by running the workflow.

## Verifying a Workflow Run

The `gh` CLI is pinned in `.mise.toml` and available after `mise install`. It is the primary tool
for checking whether a push triggered the right workflow and what happened during the run.

| Command | Purpose |
| ------- | ------- |
| `gh run list --limit N` | List recent workflow runs (check if a push triggered or skipped the pipeline) |
| `gh run watch <ID> --exit-status` | Watch a workflow run until it completes (blocks, shows step progress) |
| `gh run list --limit N --json ... --jq ...` | Query runs by commit message, status, branch, etc. |
| `gh run view <ID>` | View details of a specific run |

After pushing to trunk, use `gh run list --limit 5` to verify whether the pipeline triggered
(source change) or skipped (docs-only change). Use `gh run watch <ID> --exit-status` to monitor a
specific run to completion.

## Commands (Justfile)

All CI steps call `just` recipes. See [justfile](/justfile) for the full list.

Key recipes:

| Recipe | Purpose |
| ------ | ------ |
| `just lint` | All linters (TypeScript, CSS, Markdown, Terraform, EditorConfig, Shell) |
| `just lint-ts` | ESLint |
| `just lint-css` | Stylelint |
| `just lint-tf` | TFLint on infrastructure/ |
| `just lint-md` | markdownlint-cli2 check |
| `just lint-ec` | editorconfig-checker |
| `just lint-sh` | shellcheck on `scripts/*.sh` |
| `just build` | `tsc -b && vite build` |
| `just tf-validate` | Validate Terraform syntax and types |
| `just tf-test` | Run Terraform tests (8 assertions, mock providers) |
| `just tf-deploy` | Plan and apply infrastructure (CI) |
| `just s3-sync` | Upload `dist/` to S3 |
| `just invalidate` | CloudFront cache invalidation |

## History

- **Change 1** — Added `paths-ignore` to single workflow (skip docs-only commits)
- **Change 4** — Split into two workflows (`website.yml` + `infrastructure.yml`), moved all commands
  to justfile, added `terraform test` as CI gate
