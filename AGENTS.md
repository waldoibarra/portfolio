# Portfolio — Project Knowledge for AI Agents

## Project Overview

Personal portfolio website deployed as a static site to AWS (S3 + CloudFront) via Terraform.
Single-page Lit web component with TypeScript, built with Vite.
**Trunk-based development** — no PRs, no branches, direct commits to `trunk`.

**Live site:** waldoibarra.com

## Tech Stack

- **Frontend:** Lit (Web Components), TypeScript (strict mode)
- **Build:** Vite
- **IaC:** Custom Terraform (S3, CloudFront, ACM, Route53) — no third-party modules
- **CI/CD:** GitHub Actions — two workflows (`website.yml` for source changes, `infrastructure.yml`
  for Terraform changes)
- **Local dev:** Mise for declarative toolchain pinning (Node, Terraform, AWS CLI, TFLint, just)
- **Linting:** ESLint, Stylelint, TFLint, markdownlint-cli2, editorconfig-checker, commitlint — all
  enforced via Husky pre-commit hook

## Commands

**`just` commands** (primary human-facing, wraps npm/terraform):

| Command | Purpose |
| ------- | ------- |
| `just start` | Start Vite development server |
| `just lint` | ESLint + Stylelint check |
| `just lint-fix` | Auto-fix ESLint + Stylelint issues |
| `just lint-tf` | TFLint on infrastructure/ |
| `just lint-md` | markdownlint-cli2 check |
| `just lint-ec` | editorconfig-checker |
| `just lint-all` | Run all linters (TypeScript, CSS, Markdown, Terraform, Editorconfig) |
| `just build` | TypeScript check + Vite production build |
| `just tf-validate` | Validate Terraform syntax and type checking |
| `just tf-test` | Run Terraform tests (mock providers) |
| `just tf-plan` | Interactive Terraform plan |
| `just tf-plan-out` | Plan and save to file (for CI) |
| `just tf-apply` | Interactive Terraform apply |
| `just tf-apply-auto` | Apply saved plan (for CI) |
| `just tf-output` | Read Terraform outputs |
| `just s3-sync` | Upload dist/ to S3 |
| `just invalidate` | CloudFront cache invalidation |
| `just deploy` | Full production deploy: build + sync + invalidate |
| `just check` | Full local check: lint all + build + TF tests |

## GitHub CLI (gh)

Available and authenticated. Essential for CI/CD verification in this project:

| Command | Purpose |
| ------- | ------- |
| `gh run list --limit N` | List recent workflow runs (check if a push triggered or skipped the pipeline) |
| `gh run watch <ID> --exit-status` | Watch a workflow run until it completes (blocks, shows step progress) |
| `gh run list --limit N --json ... --jq ...` | Query runs by commit message, status, branch, etc. |
| `gh run view <ID>` | View details of a specific run |

**Usage pattern:** After pushing to trunk, use `gh run list --limit 5` to verify whether the pipeline
triggered (source change) or skipped (docs-only change). Use `gh run watch <ID> --exit-status` to
monitor a specific run to completion.

## Commit Conventions

Enforced by commitlint (Husky pre-commit hook + CI):

- **Format:** Conventional Commits (`type: Subject`)
- **Subject case:** Sentence-case (e.g. `feat: Add copyright footer` not `feat: add copyright footer`)
- **Header max length:** 50 characters
- **Body line length:** 72 characters max
- **Body case:** Sentence-case

When writing commit messages, keep the subject under 50 chars and use sentence-case.
Example: `ci: Add paths-ignore to deploy workflow` (not `ci: add path filtering to deploy workflow
CI/CD pipeline`).

## TypeScript Configuration

- `strict: true` — all strict checks enabled
- `noUnusedLocals: true`, `noUnusedParameters: true` — no dead code
- `experimentalDecorators: true` — required by Lit's `@customElement` decorator
- `useDefineForClassFields: false` — required by Lit, do NOT change
- Target: ES2020, module resolution: Bundler

## CI/CD Pipeline

See `docs/ci-cd-pipeline.md` for full documentation.

Two workflows replace the old monolithic pipeline:

- **`website.yml`** — Triggered by source changes (`src/**`, `public/**`, `index.html`,
  config files). Runs `just lint` (gate) → `just build` → `just s3-sync` →
  `just invalidate`.
- **`infrastructure.yml`** — Triggered by infrastructure changes (`infrastructure/**`,
  `.mise.toml`). Runs `just lint-tf` (gate) → `just tf-check` (init + validate + test, gate) →
  `just tf-plan-out` → `just tf-apply-auto`.

Both workflows use `actions/cache@v5` and execute all steps via `just` recipes. Each workflow's
`paths` allowlist ensures only the relevant pipeline runs for a given change.

## Project Structure

```text
portfolio/
├── src/
│   ├── app-element.ts      # Root Web Component (Lit)
│   ├── index.css            # Global styles
│   └── vite-env.d.ts        # Vite type declarations
├── infrastructure/           # Terraform IaC
│   ├── acm.tf               # ACM certificate + DNS validation
│   ├── cloud.tf             # Terraform Cloud backend config
│   ├── cloudfront.tf        # OAC + CloudFront distribution + tag locals
│   ├── dns.tf               # Route53 data source + alias records
│   ├── outputs.tf           # s3_bucket_id, cloudfront_distribution_id
│   ├── provider.tf          # AWS providers (us-west-2 + us-east-1 alias)
│   ├── s3.tf                # S3 bucket + public access block + SSE + ownership + OAC policy
│   ├── vars.tf              # domain_name, application (with defaults)
│   └── versions.tf          # Terraform + provider version pins
├── .github/workflows/        # CI/CD
│   ├── website.yml           # Source build + deploy pipeline
│   └── infrastructure.yml    # Terraform validate + test + apply pipeline
├── docs/
│   ├── decisions/            # Architectural Decision Records
│   │   ├── README.md         # ADR index and writing guide
│   │   ├── AGENTS.md         # ADR maintenance rules (auto-injected)
│   │   └── templates/        # Minimal and full ADR templates
│   ├── cicd-improvements-plan.md  # Living CI/CD improvement plan
│   ├── ci-cd-pipeline.md          # Pipeline documentation
│   └── infrastructure.md          # Terraform/Mise workflow docs
├── index.html                # Entry point
├── .mise.toml                # Toolchain pinning (Node, Terraform, AWS CLI, TFLint, just)
├── justfile                  # Convenience commands (wraps npm/terraform)
├── vite.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── .stylelintrc.json
├── .commitlintrc.json
└── .editorconfig
```

## Gotchas & Lessons Learned

- **`npm run build` doesn't exist.** Always use `just build`.
- **Commit headers must be ≤50 chars, sentence-case.** The AI tendency to write long descriptive
  subjects will get rejected by commitlint.
- **Lit requires `useDefineForClassFields: false`.** Do not enable this — Lit decorators break
  without it.
- **`paths-ignore` and `paths` are mutually exclusive** in GitHub Actions. Cannot combine them
  on the same trigger.
- **`**.md` in paths-ignore covers ALL markdown recursively** — no need to list `LICENSE.md`,
  `README.md`, or `.atl/*.md` separately.
- **Changes to the workflow YAML itself always trigger the pipeline** regardless of `paths-ignore`,
  because the YAML file isn't in the ignore list.
- **Docker has been removed.** Mise manages the toolchain (Node, Terraform, AWS CLI, TFLint, just)
  — see `.mise.toml`.
- **`infrastructure/versions.tf` must match `.mise.toml` exactly.** The `required_version` should
  be an exact pin (`= "1.15.1"`), not a range. A range defeats the purpose of Mise's deterministic
  pinning — if someone bypasses Mise, a range would silently accept a different version.
- **GitHub Actions secrets are automatically masked in logs.** Never add `::add-mask::` for values
  that come from `${{ secrets.* }}` — the runner masks them by default. Adding extra echo commands
  just clutters the log.
- **`package.json` needs `"prepare": "husky"`.** Without it, fresh clones don't get git hooks
  installed. Previously Docker's entrypoint ran `npx husky install` — now npm's `prepare`
  lifecycle script handles it.
- **`actions/cache@v4` is deprecated** (forces Node v24 on June 2nd). Use `actions/cache@v5`.
- **ACM validation CNAME records persist after `terraform destroy`.** When recreating (clean break),
  use `allow_overwrite = true` on `aws_route53_record.cert_validation` — otherwise Terraform fails
  with "record already exists."
- **`infra:` is not a valid conventional commit type.** Use `chore:`, `feat:`, `fix:`, `docs:`,
  etc. instead.
- **Route53 hosted zone should NOT be managed by Terraform.** Use `data "aws_route53_zone"` to look
  it up by domain name. This prevents `terraform destroy` from deleting the zone and its NS/SOA
  records, and eliminates the need for a `TF_VAR_hosted_zone_id` variable.
- **OAC bucket policy uses Service principal, not IAM ARN.** The policy must use `type = "Service"`
  with `identifiers = ["cloudfront.amazonaws.com"]` and a `StringEquals` condition on
  `aws:SourceArn` (the distribution ARN). This replaces the old OAI approach which used an IAM ARN
  principal.
- **S3 bucket names must be deterministic in new code.** The old module used `bucket_prefix` which
  generated random suffixes (`waldoibarra-com20220722202658658100000002`). Custom code uses
  `bucket = "waldoibarra-com-site"` (exact, no randomness).
- **`terraform test` with `for_each` resources requires `override_resource` and `mock_resource`.**
  Computed attributes like `domain_validation_options` can't be evaluated at plan time. Use
  `override_during = plan` at the file level and provide stable defaults via `mock_resource` for all
  computed fields.
- **No third-party Terraform modules.** Custom IaC only. The
  `InterweaveCloud/s3-cloudfront-static-website` module has been replaced entirely.
- **Artifact upload is a CI step, not a Terraform resource.** `aws s3 sync` runs in GitHub Actions
  after `terraform apply`. No `null_resource`, no `local-exec`, no `--profile` flags.
- **`.env.example` only needs one variable: `TF_TOKEN_app_terraform_io`.** AWS credentials come
  from `~/.aws/credentials` (local) or GitHub Secrets env vars (CI). `domain_name` and
  `application` have defaults in `vars.tf`. Route53 hosted zone is looked up via data source.

## Architectural Decision Records

Read `docs/decisions/README.md` when proposing, evaluating, or superseding an architectural decision.
Read an existing ADR file when the change you're about to make touches a past decision and you need
to understand the reasoning or constraints behind it.

## SDD Preferences

When running SDD commands for this project:

- **Execution mode:** Automatic
- **Artifact store:** Engram
- **Delivery strategy:** Trunk-based — direct commits to `trunk`, no PRs
- **Strict TDD:** Enabled
