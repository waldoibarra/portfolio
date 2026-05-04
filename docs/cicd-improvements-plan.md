# CI/CD Improvements Plan

> Living document. Each change below is meant to be requested as a separate
> SDD cycle (`/sdd-new`), planned and shipped independently across multiple
> sessions to avoid context-window overhead.

## Context (current state)

- Single workflow: `.github/workflows/deploy-website-ci-cd.yml`
- Triggered on push to `trunk` with `paths-ignore` denylist
  (docs-only pushes are skipped)
- Uses Mise for toolchain (Node, Terraform, AWS CLI, TFLint, Just)
  — Docker removed in Change 2
- Custom Terraform IaC (no third-party module) with OAC, hardened S3,
  TLSv1.2_2021 — shipped in Change 3
- `aws s3 sync` for artifact upload (separate from Terraform) — shipped
  in Change 3
- Terraform tests exist (`infrastructure/tests/main.tftest.hcl`) but
  are NOT run in CI
- Husky pre-commit hook runs tflint + ESLint + Stylelint natively
- Husky commit-msg hook runs commitlint
- CloudFront invalidation uses `/*` (works fine, deferred)

## Architectural decisions driving the plan

1. **Docker is overkill for this project.** It's a static site → S3 today,
   serverless (Lambda zip-packaged) tomorrow. No runtime parity, dependency
   isolation, or orchestration target requiring containers. Mise already
   pins toolchains across Waldo's other projects — use the same discipline.
2. **Terraform should manage infrastructure, not artifacts.** Bundling
   `dist/` upload inside Terraform `sync_directories` blurs the line
   between infra state and deployment artifacts. Refactor to:
   `terraform apply` for infra, `aws s3 sync` for artifacts.
3. **Owning the infrastructure code** (instead of consuming a third-party
   module) requires owning the architectural documentation. Use the **C4
   model via Structurizr DSL** — text-based, git-diff-able, versioned with
   the code.
4. **Trunk-based development:** single `trunk` branch, no PRs. Workflows
   trigger on push to `trunk` with path filters.
5. **Multiple workflows beat one mega-workflow.** Independent failure
   domains, faster feedback, clearer responsibility per file.

## Change sequence

Changes are ordered by risk (low → high) and by architectural dependency.
Each one ships independently, gets verified in production, and informs the
next.

---

### Change 1 — Path filtering on the current workflow ✅ Shipped

**Goal:** Stop docs/README/license-only commits from triggering full
deploys.

**Approach:**
- Added `paths-ignore` to the existing workflow trigger (denylist, safer
  default than allowlist):
  - `**.md` (covers README, LICENSE, docs/*.md, .atl/ markdown)
  - `docs/**` (future-proof for non-markdown docs)
  - `.gitignore`
  - `.editorconfig`
- No workflow split — single workflow, just smarter triggering.

**Files touched:**
- `.github/workflows/deploy-website-ci-cd.yml` (added `paths-ignore`)
- `docs/ci-cd-pipeline.md` (new — pipeline documentation)
- `README.md` (fixed typo, added link to pipeline docs)
- `src/app-element.ts` (added copyright footer — verification vehicle)

**Risk:** Very low. Worst case: a path is over-filtered and a real change
doesn't deploy → fix the filter, push again.

**Verification — passed:**
- Push a workflow+docs commit → pipeline triggered correctly (changed `.yml`)
- Push a `src/` commit → pipeline triggered and completed successfully
- Push a docs-only commit (`docs/ci-cd-pipeline.md` wording tweak) → pipeline was **skipped** ✅
- Live site updated with copyright footer

**Sessions used:** 1

---

### Change 2 — Drop Docker, adopt Mise for local + CI ✅ Shipped

**Goal:** Eliminate Docker plumbing across the project. Use Mise for
toolchain pinning (Node, Terraform, AWS CLI). Match Waldo's other
projects.

**Approach:**
- Create `.mise.toml` pinning:
  - `node` (match current Dockerfile version)
  - `terraform` (match `terraform-aws:1.1.1` base image version)
  - `awscli`
  - `just` (to replace Makefile)
- Replace Docker-based steps in CI with native Mise-based steps
  (using `jdx/mise-action` GitHub Action)
- Update `package.json` scripts as needed to run natively without Docker
- Delete:
  - `Dockerfile`
  - `compose.yaml`
  - `docker-entrypoint.sh`
  - `infrastructure/Dockerfile`
  - `infrastructure/compose.yaml`
  - `.dockerignore` (if not used by anything else)
- Update `docs/infrastructure.md` to document the Mise-based workflow
  instead of Docker
- Verify local dev workflow (`mise install` + `npm run dev`) works as
  expected
- See what other commands are work managing in justfile(s)

**Files touched (estimated):**
- `.mise.toml` (new)
- `.github/workflows/deploy-website-ci-cd.yml`
- `package.json` (scripts, possibly)
- `docs/infrastructure.md`
- Multiple Docker files deleted

**Risk:** HIGH. Touches local dev workflow, CI, and toolchain. A misstep
breaks the ability to ship.

**Verification:**
- `mise install` from clean state → all tools installed correctly
- Local: `npm run dev` works, `npm run build` works, `terraform plan`
  works (against existing remote state, no changes expected)
- CI: full pipeline runs end-to-end, deploys successfully

**Verification — passed:**
- `mise install` from clean state → all tools installed correctly ✅
- Local: `just dev`, `just lint`, `just lint-tf`, `just ci-build` all work ✅
- Local: `npm run ci:lint` and `npm run ci:build` work without Docker ✅
- Local: `terraform init` and `terraform plan` work against existing remote state ✅
- CI: full pipeline runs end-to-end, deploys successfully ✅
- Pre-commit hook fires natively (tflint + eslint + stylelint + commitlint) ✅
- All Docker files deleted, no orphan references ✅

**Sessions used:** 2

**Note:** This change does NOT touch the Terraform module config or the
S3 sync mechanism. Terraform still does artifact upload via
`sync_directories` after this change. That's Change 3's problem.

**Estimated sessions:** 2-3 (heavy exploration, careful design, sliced
implementation)

---

### Change 3 — Own the IaC code + separate deploy ✅ Shipped

**Goal:** Stop using the third-party `InterweaveCloud/s3-cloudfront-static-website`
module. Own the Terraform code in this repo from scratch. Move `dist/` upload
out of Terraform into a dedicated `aws s3 sync` step in the pipeline.

**Strategy: Full clean break.** We accept downtime (~1-3 hours for CloudFront
propagation + ACM DNS validation) because the site is in progress. No `moved`
blocks, no `terraform import` — we destroy all resources, delete all Terraform
files, and recreate everything from new code following best practices.

**Approach:**

**Part A — Document current state, then destroy and recreate from scratch:**

1. **Document current state** — Create a reference doc (`docs/infrastructure-reference.md`)
   capturing every resource ID, configuration, and setting before destroying.
   This is the safety net for recreation:
   - S3 bucket name, region, ACL, encryption settings, bucket policy JSON
   - CloudFront distribution ID, domain, aliases, cache behavior, viewer cert,
     minimum protocol version, OAI ID
   - ACM certificate ARN, domain, SANs, validation method
   - Route53 zone ID, record names and types
   - All current tags, provider versions
2. **Destroy all infrastructure** — `terraform destroy` removes all 14 managed
   resources. S3 bucket must have `force_destroy = true` to delete objects.
3. **Delete all Terraform files** — Remove `infrastructure/*.tf`,
   `infrastructure/.terraform/`, `infrastructure/.terraform.lock.hcl`,
   `infrastructure/builds/`, `infrastructure/tfplan`. Start from zero.
4. **Write new Terraform from scratch** following best practices:
   - File organization by concern: `s3.tf`, `acm.tf`, `cloudfront.tf`,
     `dns.tf`, `provider.tf`, `versions.tf`, `vars.tf`, `outputs.tf`
   - Clean naming: purpose-based names (`site`, `site_root`, `site_www`)
     instead of generic module names (`website_files`, `s3_distribution`)
   - AWS provider 5.x (upgrade from 4.10.0)
   - **OAC** (Origin Access Control) instead of OAI (legacy)
   - **Security hardening:**
     - `aws_s3_bucket_public_access_block` (block all public access)
     - `aws_s3_bucket_server_side_encryption_configuration` (manage AES256 in code)
     - `aws_s3_bucket_ownership_controls` (enforce `BucketOwnerEnforced`, no ACLs)
     - CloudFront minimum protocol version `TLSv1.2_2021` (upgrade from TLSv1.1)
     - CloudFront allowed methods restricted to `GET`, `HEAD`, `OPTIONS` only
   - No third-party module dependency
   - No `sync_directories`, no `null_resource`, no `aws_profile` variable
   - Deterministic S3 bucket name (not auto-generated prefix)
   - `force_destroy = true` on S3 bucket (clean teardown for a personal project)
5. **`terraform apply` fresh** — Recreate all infrastructure from new code.

**Part B — Add `aws s3 sync` deploy step:**
- After `terraform apply`, run `aws s3 sync ./dist s3://<bucket> --delete`
- Pull bucket name from `terraform output -raw s3_bucket_id`
- Remove the `Configure AWS profile for Terraform module` step (no longer
  needed — no `local-exec` with `--profile default`)
- Keep the existing CloudFront `/*` invalidation step (deferred per prior
  decision)

**Files touched (estimated):**
- `infrastructure/*.tf` — ALL new (destroyed and recreated from scratch)
- `docs/infrastructure-reference.md` (new — pre-destruction reference)
- `.github/workflows/deploy-website-ci-cd.yml` (add `aws s3 sync`, remove profile hack)
- `docs/infrastructure.md` (update to reflect new IaC structure)

**Files deleted:**
- `infrastructure/main.tf` (module call removed)
- `infrastructure/vars.tf` (`aws_profile` variable removed)
- `infrastructure/.terraform/` (entire directory)
- `infrastructure/.terraform.lock.hcl`
- `infrastructure/builds/` (local archive artifacts)
- `infrastructure/tfplan`

**Risk:** HIGHEST. Full destruction of live AWS infrastructure. Site will be
down for ~1-3 hours during recreation (CloudFront propagation + ACM DNS
validation). Acceptable for a personal portfolio in progress. The reference
doc is the safety net.

**Verification — passed:**
- `terraform plan` on the new code shows 13 creates (no surprises) ✅
- `terraform apply` succeeded — 13 resources created ✅
- `aws s3 sync` correctly uploaded `dist/` (7 files) to `s3://waldoibarra-com-site` ✅
- Site loads at `waldoibarra.com` and `www.waldoibarra.com` — HTTP 200, HTTPS
  via HTTP/2, AES256 encryption confirmed via `x-amz-server-side-encryption`
  header ✅
- CloudFront serves via OAC (not OAI) ✅
- S3 bucket has public access block, encryption, and ownership controls ✅
- No third-party module in state ✅
- CloudFront invalidation `IA4ZV7GOPWHLGXBZGDMWZBVT5A` completed ✅
- Pre-commit hook passes natively (tflint, eslint, stylelint, commitlint) ✅

**Gotcha discovered:** ACM certificate CNAME validation records in Route53
persist after `terraform destroy`. When recreating, the new cert needs the
same CNAME but Route53 rejects `CREATE` if the record already exists. Fix:
add `allow_overwrite = true` to `aws_route53_record.cert_validation` in
`infrastructure/acm.tf`. Commit: `fix: Allow overwrite on ACM validation CNAME`.

**Sessions used:** 4

---

### Change 4 — Split workflows, rebuild justfile, run Terraform tests in CI

**Goal:** Replace the single mega-workflow with two focused, independent
pipelines. Make the justfile the single source of truth for all commands
(local + CI). Run Terraform tests as a CI gate. Remove commitlint from CI
(Husky already enforces it locally). Update README.

**Architectural decisions for this change:**

1. **Two workflows, two domains.** No separate lint workflow. Lint is a
   gate step inside `website.yml` — it's the only safety net before
   production for a trunk-based project. A dedicated lint.yml would be
   redundant because: (a) pre-commit hooks already give instant local
   feedback, (b) `website.yml` re-runs lint as a production gate, and
   (c) a solo developer on trunk-based doesn't need parallel fast
   feedback — they need correct deployment gates.
2. **Justfile is the single source of truth.** CI, Husky, and local dev
   all call `just` recipes. No `npm run ci:*` in CI. No inline commands.
   Node tools are called via `npx` in just recipes, not via npm scripts.
   This eliminates the `ci-` prefix in just recipes — the same recipe
   works for local dev and CI.
3. **`terraform test` as a CI gate.** The project has 258 lines of
   Terraform tests (`infrastructure/tests/main.tftest.hcl`) covering S3,
   OAC, and CloudFront — they've never run in CI. They use mock providers
   and run in seconds. Added as a step before `terraform plan` in
   `infrastructure.yml`.
4. **No commitlint in CI.** Husky's commit-msg hook enforces conventional
   commits before every commit. CI enforcement is redundant for a solo
   trunk-based developer. The `ci:lint:commit` npm script and
   `COMMIT_MESSAGE` env var are removed.
5. **No composite action.** Only `website.yml` needs the Node setup
   (checkout + mise + npm cache + npm ci). With one consumer, a
   composite action is over-engineering. Extract if a second Node-based
   workflow appears later.
6. **No tool isolation in mise.** `mise-action` with `cache: true`
   restores all 5 tools from the same cache entry (keyed on
   `.mise.toml` hash). Both workflows use the full cache. Isolating
   tools with `tool_versions` in workflow YAML would create a second
   source of truth for version numbers alongside `.mise.toml` — a DRY
   violation. The ~30s cold-cache penalty happens once per version bump.
   Warm cache restores everything in ~5-10s regardless.
7. **No workflow dependency.** `website.yml` reads Terraform outputs
   from state (via `terraform init` + `terraform output`). It does NOT
   depend on `infrastructure.yml` completing first. For initial project
   bootstrap (no state exists yet), run `infrastructure.yml` once via
   `workflow_dispatch` — after that, state always exists.

**Workflows:**

**`.github/workflows/website.yml`** — Builds and deploys the website.
Triggers on push to `trunk` matching source paths:

```yaml
on:
  push:
    branches: [trunk]
    paths:
      - 'src/**'
      - 'public/**'
      - 'index.html'
      - 'package.json'
      - 'package-lock.json'
      - 'vite.config.ts'
      - 'tsconfig.json'
      - 'eslint.config.mjs'
      - '.stylelintrc.json'
      - '.mise.toml'
      - '.github/workflows/website.yml'
  workflow_dispatch:
```

Steps (all via `just` recipes):
1. Checkout
2. Set up toolchain (mise — all tools from cache)
3. Cache npm dependencies
4. Install npm dependencies
5. `just lint` — ESLint + Stylelint (gate: stops deployment if it fails)
6. `just build` — `tsc -b && vite build`
7. `just tf-init` — init Terraform (to read outputs)
8. `just tf-output -raw s3_bucket_id` → env var
9. `just s3-sync` — upload `dist/` to S3
10. `just invalidate` — CloudFront cache invalidation

Secrets (scoped to this job only): `AWS_ACCESS_KEY_ID`,
`AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `TF_TOKEN_app_terraform_io`

Concurrency: group `website`, `cancel-in-progress: false`

Comment at top of job:
```
# NOTE: Requires at least one successful infrastructure.yml run to
# populate Terraform outputs (S3 bucket ID, CloudFront distribution ID).
# For initial setup, run infrastructure.yml manually via workflow_dispatch first.
```

**`.github/workflows/infrastructure.yml`** — Validates, tests, and applies
infrastructure. Triggers on push to `trunk` matching infrastructure paths:

```yaml
on:
  push:
    branches: [trunk]
    paths:
      - 'infrastructure/**'
      - '.mise.toml'
      - '.github/workflows/infrastructure.yml'
  workflow_dispatch:
```

Steps (all via `just` recipes):
1. Checkout
2. Set up toolchain (mise — all tools from cache)
3. Cache Terraform providers (`TF_PLUGIN_CACHE_DIR`)
4. `just tf-init` — initialize Terraform
5. `just lint-tf` — TFLint
6. `just tf-test` — Terraform tests (NEW — runs mock-provider tests)
7. `just tf-plan-out` — `terraform plan -out=tfplan`
8. `just tf-apply-auto` — `terraform apply -auto-approve tfplan`

Secrets (scoped to this job only): `AWS_ACCESS_KEY_ID`,
`AWS_SECRET_ACCESS_KEY`, `AWS_DEFAULT_REGION`, `TF_TOKEN_app_terraform_io`,
`TF_VAR_domain_name`

Concurrency: group `infrastructure`, `cancel-in-progress: false`

**Justfile rebuild:**

The justfile becomes the project's command interface. CI, Husky, and
local dev all call the same recipes. npm scripts are replaced by direct
`npx` calls in just recipes. Recipe names describe WHAT, not WHERE —
no `ci-` prefix.

```just
# Print available recipes
[private]
default:
    @just --list

# ─── Development ────────────────────────────────────────────────

[group("Development")]
# Start development server
dev:
    npx vite

# ─── Linting ────────────────────────────────────────────────────

[group("Linting")]
# Check TypeScript and CSS for problems
lint:
    npx eslint . && npx stylelint "**/*.css"

[group("Linting")]
# Auto-fix TypeScript and CSS problems
lint-fix:
    npx eslint --fix . && npx stylelint --ignore-path .gitignore --fix "**/*.css"

[group("Linting")]
# Check Terraform for problems
lint-tf:
    tflint --chdir infrastructure

# ─── Building ───────────────────────────────────────────────────

[group("Building")]
# Typecheck and build for production
build:
    npx tsc -b && npx vite build

# ─── Terraform ──────────────────────────────────────────────────

[group("Terraform")]
# Initialize Terraform
tf-init:
    terraform -chdir infrastructure init

[group("Terraform")]
# Run Terraform tests
tf-test:
    terraform -chdir infrastructure test

[group("Terraform")]
# Plan infrastructure changes (interactive, review before apply)
tf-plan:
    terraform -chdir infrastructure plan

[group("Terraform")]
# Plan and save to file (for CI)
tf-plan-out:
    terraform -chdir infrastructure plan -out=tfplan

[group("Terraform")]
# Apply infrastructure changes (interactive confirmation)
tf-apply:
    terraform -chdir infrastructure apply

[group("Terraform")]
# Apply saved plan file (non-interactive, for CI)
tf-apply-auto:
    terraform -chdir infrastructure apply -auto-approve tfplan

[group("Terraform")]
# Read Terraform outputs
tf-output *ARGS:
    terraform -chdir infrastructure output {{ ARGS }}

# ─── Deployment ─────────────────────────────────────────────────

[group("Deploy")]
# Upload dist/ to S3 (requires tf-init)
s3-sync: (tf-init)
    @S3_BUCKET_ID=$(terraform -chdir infrastructure output -raw s3_bucket_id) \
    && aws s3 sync ./dist "s3://$S3_BUCKET_ID" --delete

[group("Deploy")]
# Invalidate CloudFront cache (requires tf-init)
invalidate: (tf-init)
    @DISTRIBUTION_ID=$(terraform -chdir infrastructure output -raw cloudfront_distribution_id) \
    && INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$DISTRIBUTION_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text) \
    && echo "Created invalidation: $INVALIDATION_ID" \
    && aws cloudfront wait invalidation-completed \
        --distribution-id "$DISTRIBUTION_ID" \
        --id "$INVALIDATION_ID" \
    && echo "Invalidation $INVALIDATION_ID completed."

[group("Deploy")]
# Full production deploy: build, sync, invalidate
deploy: (build) (s3-sync) (invalidate)
    @echo "✓ Deploy complete"

# ─── Local CI check ──────────────────────────────────────────────

[group("Linting")]
# Run all linting (TypeScript, CSS, Terraform)
lint-all: (lint) (lint-tf)

[group("Linting")]
# Full local check: lint all + build + Terraform tests
check: (lint) (lint-tf) (build) (tf-init) (tf-test)
```

Key decisions on recipe design:
- `s3-sync` and `invalidate` depend on `(tf-init)` — because
  `terraform output` requires initialized state. Just deduplicates
  `tf-init` when both are in the dependency graph.
- `deploy` depends on `(build) (s3-sync) (invalidate)` — full pipeline.
  `tf-init` runs once (deduplicated by just).
- `s3-sync` does NOT depend on `(build)` — you might want to re-upload
  without rebuilding. `just s3-sync` = "sync whatever is in dist/ now."
- `tf-plan` / `tf-apply` for local interactive use.
  `tf-plan-out` / `tf-apply-auto` for CI. Same tool, different flags,
  explicit recipes instead of variadic arguments.
- `tf-output` accepts `*ARGS` — the only recipe that needs arguments,
  used as `just tf-output -raw s3_bucket_id`.
- No `[private]` recipes except `default`. Every recipe is useful
  standalone — `just s3-sync` without rebuild, `just invalidate`
  without sync, etc.
- `[group("name")]` organizes `just --list` output by domain.

**Package.json changes:**

Remove redundant npm scripts that are now in the justfile:
- `"ci:lint"` → `just lint`
- `"ci:build"` → `just build`
- `"ci:lint:commit"` → removed entirely (commitlint stays in Husky only)
- `"lint:fix"` → `just lint-fix`

Keep:
- `"dev"` → `just dev` (also kept in package.json for `npm run dev`
  compatibility, but ideally use `just dev`)
- `"prepare": "husky"` — npm lifecycle hook, must stay
- `"preview": "vite preview"` — niche, fine to keep

**Husky hook updates:**

`.husky/pre-commit` — call just recipes instead of inline commands:
```sh
#!/usr/bin/env sh
set -e
echo "Running Terraform linter."
just lint-tf
echo "Running TypeScript and CSS linters."
just lint
echo "All good. ❤️"
```

`.husky/commit-msg` — unchanged, still calls commitlint directly
(Husky is the enforcement point, not CI).

**Terraform provider caching (new in infrastructure.yml):**

```yaml
env:
  TF_PLUGIN_CACHE_DIR: ${{ github.workspace }}/.terraform.d/plugin-cache

- name: Cache Terraform providers
  uses: actions/cache@v5
  with:
    path: ${{ github.workspace }}/.terraform.d/plugin-cache
    key: tf-providers-${{ runner.os }}-${{ hashFiles('infrastructure/.terraform.lock.hcl') }}
```

Saves ~10-15s per infrastructure run. Free optimization.

**What's removed:**

| From current workflow | Why |
|----------------------|-----|
| `deploy-website-ci-cd.yml` (entire file) | Replaced by two focused workflows |
| `npm run ci:lint:commit` (commitlint in CI) | Husky enforces locally. Redundant in CI. |
| `COMMIT_MESSAGE` env var | Only used by commitlint, which we removed from CI |
| `npm run ci:lint` and `npm run ci:build` | Replaced by `just lint` and `just build` |
| Separate lint.yml workflow | Replaced by lint gate step inside website.yml |

**What's added:**

| New | Why |
|-----|-----|
| `website.yml` | Focused pipeline for website source changes |
| `infrastructure.yml` | Focused pipeline for infrastructure changes |
| `terraform test` in CI | 258 lines of tests currently bypassed |
| Terraform provider caching | Saves ~10-15s per infra run |
| Concurrency groups | Prevents parallel TF apply and S3 sync races |
| Scoped secrets per workflow | Lint needs zero, website needs AWS+TF, infra needs all |
| `workflow_dispatch` on both | Manual re-run without dummy commits |
| `just` recipes for all CI steps | Single source of truth for commands |
| `tf-plan-out` + `tf-apply-auto` | Explicit CI recipes instead of inline TF commands |
| `tf-test` just recipe | Runs Terraform tests locally too |

**Files touched:**
- `.github/workflows/website.yml` (new)
- `.github/workflows/infrastructure.yml` (new)
- `.github/workflows/deploy-website-ci-cd.yml` (delete)
- `justfile` (rebuild — remove `ci-` prefix, add TF + deploy recipes,
  add groups, add recipe dependencies, use npx)
- `package.json` (remove redundant scripts)
- `.husky/pre-commit` (call just recipes instead of inline commands)
- `README.md` (badge URLs + tech stack updates)

**Verification:**
- `just --list` shows all recipes organized by group
- `just lint` passes locally
- `just lint-tf` passes locally
- `just build` passes locally
- `just tf-init` and `just tf-test` pass locally
- Push a `src/` change → only `website.yml` runs
- Push an `infrastructure/` change → only `infrastructure.yml` runs
- Push a `src/` AND `infrastructure/` change → both run in parallel
- Push a `docs/` change → nothing runs
- `terraform test` runs in infrastructure.yml (not skipped)
- Terraform provider cache restores correctly (check logs for cache hit)
- README badges render correctly on GitHub

**Estimated sessions:** 2-3

---

## Deferred (not in this plan)

- **C4 architecture documentation.** Originally part of Change 3, now
  deferred to a future change. Will use Mermaid C4 in Markdown (not
  Structurizr DSL — the CLI was archived Feb 2026). Structurizr DSL was
  the original plan but is no longer viable.
- **Surgical CloudFront invalidation** (`/index.html` + `/` instead of
  `/*`). Current `/*` is acceptable. Revisit if invalidation cost or
  propagation time becomes a real problem.
- **s5cmd or parallel S3 uploaders.** `aws s3 sync` is plenty fast for
  the current asset count. Revisit at 1000+ files or multi-GB transfers.
- **PR-based workflows.** Trunk-based development → no PRs. If the
  branching strategy ever changes, add `pull_request` triggers then.
- **OAI to OAC migration.** Handled in Change 3 — we're starting with OAC
  directly in the new code (no migration needed).

## Cross-cutting reminders

- After **Change 2:** README's "CI/CD: GitHub Actions with Docker-based
  builds" line was updated as part of Change 2. ✅ Done.
- After **Change 3:** ✅ Done. The `aws_profile` variable, `sync_directories`
  variable, and `Configure AWS profile` CI step are all removed. CloudFront
  uses OAC instead of OAI. AWS provider upgraded to 5.x. S3 bucket has public
  access block, encryption config, and ownership controls. `aws s3 sync`
  replaces `null_resource` for artifact upload.
- After **Change 4:** README workflow badge URLs change (two badges now).
  Husky hooks call `just` recipes instead of inline commands. `npm run`
  scripts removed from CI — just is the single interface. `terraform test`
  runs in CI for the first time.
- Each change ends with `mem_session_summary` for cross-session
  continuity.
- Each change should ship independently and be verified in production
  before the next is started.
