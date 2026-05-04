# CI/CD Improvements Plan

> Living document. Each change below is meant to be requested as a separate
> SDD cycle (`/sdd-new`), planned and shipped independently across multiple
> sessions to avoid context-window overhead.

## Context (current state)

- Single workflow: `.github/workflows/deploy-website-ci-cd.yml`
- Triggered on every push to `trunk` (no path filtering — README typos
  trigger a full deploy)
- Uses Docker for everything: website build, linting, Terraform execution
- Terraform module `InterweaveCloud/s3-cloudfront-static-website` does
  double duty: provisions infra AND uploads `dist/` to S3 via
  `sync_directories`
- CloudFront invalidation uses `/*` (works fine for now, deferred)
- Local dev mirrors CI: Docker for website (`compose.yaml`) and for
  Terraform (`infrastructure/compose.yaml`)
- README has a workflow badge pointing to the current workflow file
- `docs/infrastructure.md` documents the Docker-based Terraform workflow

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

### Change 4 — Split into multiple workflows + update README

**Goal:** Replace the single mega-workflow with focused, independent
pipelines. Update README to reflect new workflow names and remove
Docker mentions (which Change 2 already invalidated).

**Approach:**
- Create `.github/workflows/infrastructure.yml`:
  - Triggers on push to `trunk` with `paths: infrastructure/**`
  - Runs Terraform plan + apply only
- Create `.github/workflows/deploy.yml`:
  - Triggers on push to `trunk` with paths matching website source
    (`src/**`, `public/**`, `index.html`, `package*.json`,
    `vite.config.ts`, `tsconfig.json`, etc.)
  - Runs lint + build + `aws s3 sync` + CloudFront invalidation
- Optionally: add `.github/workflows/lint.yml` for fast lint-only runs
  on every push (catches issues before they hit deploy)
- Delete `.github/workflows/deploy-website-ci-cd.yml`
- Update `README.md`:
  - Remove old workflow badge
  - Add new badges for `infrastructure.yml` and `deploy.yml`
  - Update the "CI/CD" line — remove Docker mention (already gone after
    Change 2), mention split workflows + Mise

**Files touched:**
- `.github/workflows/infrastructure.yml` (new)
- `.github/workflows/deploy.yml` (new)
- `.github/workflows/lint.yml` (new, optional)
- `.github/workflows/deploy-website-ci-cd.yml` (delete)
- `README.md` (badge + tech stack updates)

**Risk:** Medium. New trigger logic; must verify each workflow fires on
the correct paths and only on those paths.

**Verification:**
- Push a `src/` change → only `deploy.yml` runs
- Push an `infrastructure/` change → only `infrastructure.yml` runs
- Push a change to both → both workflows run independently
- README badges render correctly on GitHub

**Estimated sessions:** 1-2

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
- After **Change 4:** README workflow badge URL changes. Don't forget.
- Each change ends with `mem_session_summary` for cross-session
  continuity.
- Each change should ship independently and be verified in production
  before the next is started.
