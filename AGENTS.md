# Portfolio — Project Knowledge for AI Agents

## Project Overview

Personal portfolio website deployed as a static site to AWS (S3 + CloudFront) via Terraform. Single-page Lit web component with TypeScript, built with Vite. **Trunk-based development** — no PRs, no branches, direct commits to `trunk`.

**Live site:** waldoibarra.com

## Tech Stack

- **Frontend:** Lit (Web Components), TypeScript (strict mode)
- **Build:** Vite
- **IaC:** Custom Terraform (S3, CloudFront, ACM, Route53) — no third-party modules
- **CI/CD:** GitHub Actions — single workflow `.github/workflows/deploy-website-ci-cd.yml`
- **Local dev:** Mise for declarative toolchain pinning (Node, Terraform, AWS CLI, TFLint, just)
- **Linting:** ESLint, Stylelint, TFLint, commitlint — all enforced in CI and via Husky pre-commit hook

## Commands

**`just` commands** (primary human-facing, wraps npm/terraform):

| Command | Purpose |
|---------|---------|
| `just dev` | Run Vite development server |
| `just lint` | Run linter and auto-fix problems |
| `just lint-tf` | Run TFLint on infrastructure/ |
| `just ci-lint` | Run linters in CI mode (no auto-fix) |
| `just ci-build` | TypeScript check + Vite production build |

**`npm run` commands** (CI/scripting):

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server |
| `npm run ci:build` | TypeScript check + Vite production build |
| `npm run ci:lint` | ESLint + Stylelint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run preview` | Preview production build locally |

**Important:** `npm run build` does NOT exist. The build command is `npm run ci:build` (runs `tsc -b && vite build`). Do NOT use `npm run build` in scripts or docs.

## GitHub CLI (gh)

Available and authenticated. Essential for CI/CD verification in this project:

| Command | Purpose |
|---------|---------|
| `gh run list --limit N` | List recent workflow runs (check if a push triggered or skipped the pipeline) |
| `gh run watch <ID> --exit-status` | Watch a workflow run until it completes (blocks, shows step progress) |
| `gh run list --limit N --json ... --jq ...` | Query runs by commit message, status, branch, etc. |
| `gh run view <ID>` | View details of a specific run |

**Usage pattern:** After pushing to trunk, use `gh run list --limit 5` to verify whether the pipeline triggered (source change) or skipped (docs-only change). Use `gh run watch <ID> --exit-status` to monitor a specific run to completion.

## Commit Conventions

Enforced by commitlint (Husky pre-commit hook + CI):

- **Format:** Conventional Commits (`type: Subject`)
- **Subject case:** Sentence-case (e.g. `feat: Add copyright footer` not `feat: add copyright footer`)
- **Header max length:** 50 characters
- **Body line length:** 72 characters max
- **Body case:** Sentence-case

When writing commit messages, keep the subject under 50 chars and use sentence-case. Example: `ci: Add paths-ignore to deploy workflow` (not `ci: add path filtering to deploy workflow CI/CD pipeline`).

## TypeScript Configuration

- `strict: true` — all strict checks enabled
- `noUnusedLocals: true`, `noUnusedParameters: true` — no dead code
- `experimentalDecorators: true` — required by Lit's `@customElement` decorator
- `useDefineForClassFields: false` — required by Lit, do NOT change
- Target: ES2020, module resolution: Bundler

## CI/CD Pipeline

See `docs/ci-cd-pipeline.md` for full documentation.

**Trigger:** Push to `trunk` with `paths-ignore` denylist. Docs-only pushes are skipped.

**Steps:**
1. Checkout
2. Set up toolchain (mise-action)
3. Cache npm dependencies
4. Install npm dependencies
5. Lint (native: ESLint, Stylelint, TFLint, commitlint)
6. Build (native: `tsc -b && vite build`)
7. Deploy infrastructure (native: terraform init/plan/apply)
8. Upload website artifacts to S3 (native: `aws s3 sync`)
9. Invalidate CloudFront cache (native: `aws cloudfront`)

## Project Structure

```
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
│   └── deploy-website-ci-cd.yml
├── docs/
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

## Living Improvement Plans

`docs/cicd-improvements-plan.md` is a living document tracking multi-session CI/CD changes. Each change ships independently. Current status:

- **Change 1** — Path filtering ✅ Shipped
- **Change 2** — Drop Docker, adopt Mise ✅ Shipped
- **Change 3** — Own IaC + separate deploy ✅ Shipped
- **Change 4** — Split into multiple workflows + update README (planned, Medium risk)

When starting a new change, read this plan first. Mark changes as shipped when they land.

## Gotchas & Lessons Learned

- **`npm run build` doesn't exist.** Always use `npm run ci:build`.
- **Commit headers must be ≤50 chars, sentence-case.** The AI tendency to write long descriptive subjects will get rejected by commitlint.
- **Lit requires `useDefineForClassFields: false`.** Do not enable this — Lit decorators break without it.
- **`paths-ignore` and `paths` are mutually exclusive** in GitHub Actions. Cannot combine them on the same trigger.
- **`**.md` in paths-ignore covers ALL markdown recursively** — no need to list `LICENSE.md`, `README.md`, or `.atl/*.md` separately.
- **Changes to the workflow YAML itself always trigger the pipeline** regardless of `paths-ignore`, because the YAML file isn't in the ignore list.
- **Docker has been removed.** Mise manages the toolchain (Node, Terraform, AWS CLI, TFLint, just) — see `.mise.toml`.
- **`infrastructure/versions.tf` must match `.mise.toml` exactly.** The `required_version` should be an exact pin (`= "1.15.1"`), not a range. A range defeats the purpose of Mise's deterministic pinning — if someone bypasses Mise, a range would silently accept a different version.
- **GitHub Actions secrets are automatically masked in logs.** Never add `::add-mask::` for values that come from `${{ secrets.* }}` — the runner masks them by default. Adding extra echo commands just clutters the log.
- **`package.json` needs `"prepare": "husky"`.** Without it, fresh clones don't get git hooks installed. Previously Docker's entrypoint ran `npx husky install` — now npm's `prepare` lifecycle script handles it.
- **`actions/cache@v4` is deprecated** (forces Node v24 on June 2nd). Use `actions/cache@v5`.
- **ACM validation CNAME records persist after `terraform destroy`.** When recreating (clean break), use `allow_overwrite = true` on `aws_route53_record.cert_validation` — otherwise Terraform fails with "record already exists."
- **`infra:` is not a valid conventional commit type.** Use `chore:`, `feat:`, `fix:`, `docs:`, etc. instead.
- **Route53 hosted zone should NOT be managed by Terraform.** Use `data "aws_route53_zone"` to look it up by domain name. This prevents `terraform destroy` from deleting the zone and its NS/SOA records, and eliminates the need for a `TF_VAR_hosted_zone_id` variable.
- **OAC bucket policy uses Service principal, not IAM ARN.** The policy must use `type = "Service"` with `identifiers = ["cloudfront.amazonaws.com"]` and a `StringEquals` condition on `aws:SourceArn` (the distribution ARN). This replaces the old OAI approach which used an IAM ARN principal.
- **S3 bucket names must be deterministic in new code.** The old module used `bucket_prefix` which generated random suffixes (`waldoibarra-com20220722202658658100000002`). Custom code uses `bucket = "waldoibarra-com-site"` (exact, no randomness).
- **`terraform test` with `for_each` resources requires `override_resource` and `mock_resource`.** Computed attributes like `domain_validation_options` can't be evaluated at plan time. Use `override_during = plan` at the file level and provide stable defaults via `mock_resource` for all computed fields.
- **No third-party Terraform modules.** Custom IaC only. The `InterweaveCloud/s3-cloudfront-static-website` module has been replaced entirely.
- **Artifact upload is a CI step, not a Terraform resource.** `aws s3 sync` runs in GitHub Actions after `terraform apply`. No `null_resource`, no `local-exec`, no `--profile` flags.
- **`.env.example` only needs one variable: `TF_TOKEN_app_terraform_io`.** AWS credentials come from `~/.aws/credentials` (local) or GitHub Secrets env vars (CI). `domain_name` and `application` have defaults in `vars.tf`. Route53 hosted zone is looked up via data source.

## SDD Preferences

When running SDD commands for this project:

- **Execution mode:** Automatic
- **Artifact store:** Engram
- **Delivery strategy:** Trunk-based — direct commits to `trunk`, no PRs
- **Strict TDD:** Enabled
