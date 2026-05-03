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

### Change 3 — Separate Terraform from artifact upload + own the IaC code + C4 docs

**Goal:** Stop using the third-party `InterweaveCloud/s3-cloudfront-static-website`
module. Own the Terraform code in this repo. Move `dist/` upload out of
Terraform into a dedicated `aws s3 sync` step in the pipeline. Document the architecture
with C4/Structurizr or a similar alternative.

**Approach:**

**Part A — Replace the module with own Terraform code:**
- Read the current module's source to understand exactly what it
  provisions (S3 bucket, CloudFront distribution, Route53 records,
  ACM cert, OAI/OAC, bucket policy, etc.)
- Rewrite those resources directly in `infrastructure/*.tf` files,
  organized by concern (e.g., `s3.tf`, `cloudfront.tf`, `dns.tf`,
  `acm.tf`); check for best practices on how to separate files.
- Again, check for best practices on how to manage a Terraform project,
  make sure to plan for this, what are the best practices for naming
  things like variables and resources. What about testing Terraform?
- Drop `sync_directories` entirely — Terraform no longer touches the
  website content
- Plan a migration path that does NOT recreate the S3 bucket or
  CloudFront distribution (use `terraform import` or `moved` blocks
  carefully — losing the bucket means dropping the site). If a migration
  seems too complex, what is the alternative to have the site up again,
  it is okay if the site goes down for a couple hours, just not days.

**Part B — Add `aws s3 sync` deploy step:**
- After `terraform apply`, run `aws s3 sync ./dist s3://<bucket> --delete`
- Pull the bucket name from `terraform output` (need a new output)
- Keep the existing CloudFront `/*` invalidation step (deferred per
  decision in this session)

**Part C — Architectural documentation with Structurizr DSL:**
- Add Structurizr CLI / DSL workflow (likely as a Mise-managed tool),
  make sure to evaluate alternatives, open source is preferred.
- Create `docs/architecture/workspace.dsl` describing:
  - **Context:** Visitor → portfolio site → AWS edge
  - **Containers:** S3 bucket, CloudFront, Route53, ACM, future Lambda
    for LLM interface
  - **Components:** within each container as needed
  - **Deployment view:** trunk → GitHub Actions → AWS
- Render diagrams to `docs/architecture/*.png` or `*.svg` (committed,
  so README can link them)
- Document HOW to regenerate the diagrams locally (Mise + Structurizr
  CLI)
- Update `docs/infrastructure.md` to reference the C4 diagrams

**Files touched (estimated):**
- `infrastructure/*.tf` (rewrite extensively)
- `infrastructure/outputs.tf` (add bucket name output)
- `.github/workflows/deploy-website-ci-cd.yml` (add `aws s3 sync` step)
- `.mise.toml` (add Structurizr CLI tool)
- `docs/architecture/workspace.dsl` (new)
- `docs/architecture/*.svg|png` (generated, new)
- `docs/infrastructure.md` (rewrite)

**Risk:** HIGHEST. Touches live AWS infrastructure. State migration is
delicate. Mistakes can take the site down or, worse, cause data loss
on the bucket.

**Verification:**
- `terraform plan` shows ZERO changes after the rewrite (proves the
  rewrite is functionally identical to the module)
- `aws s3 sync` correctly uploads `dist/` after Terraform completes
- Site loads, no broken links, hashed assets cached correctly
- C4 diagrams render and accurately reflect the deployed architecture

**Estimated sessions:** 3-4 (this is genuinely a big change; explore +
propose alone may take a full session)

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

- **Surgical CloudFront invalidation** (`/index.html` + `/` instead of
  `/*`). Current `/*` is acceptable. Revisit if invalidation cost or
  propagation time becomes a real problem.
- **s5cmd or parallel S3 uploaders.** `aws s3 sync` is plenty fast for
  the current asset count. Revisit at 1000+ files or multi-GB transfers.
- **PR-based workflows.** Trunk-based development → no PRs. If the
  branching strategy ever changes, add `pull_request` triggers then.

## Cross-cutting reminders

- After **Change 2:** README's "CI/CD: GitHub Actions with Docker-based
  builds" line was updated as part of Change 2. ✅ Done.
- After **Change 4:** README workflow badge URL changes. Don't forget.
- Each change ends with `mem_session_summary` for cross-session
  continuity.
- Each change should ship independently and be verified in production
  before the next is started.
