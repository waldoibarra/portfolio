# Portfolio — Project Knowledge for AI Agents

## Project Overview

Personal portfolio website deployed as a static site to AWS (S3 + CloudFront) via Terraform. Single-page Lit web component with TypeScript, built with Vite. **Trunk-based development** — no PRs, no branches, direct commits to `trunk`.

**Live site:** waldoibarra.com

## Tech Stack

- **Frontend:** Lit 3.2 (Web Components), TypeScript (strict mode)
- **Build:** Vite 5.4
- **IaC:** Terraform with third-party module `InterweaveCloud/s3-cloudfront-static-website` (Change 3 in the plan will replace this)
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
7. Deploy (native: terraform init/plan/apply)
8. Invalidate CloudFront cache (native: `aws cloudfront`)

## Project Structure

```
portfolio/
├── src/
│   ├── app-element.ts      # Root Web Component (Lit)
│   ├── index.css            # Global styles
│   └── vite-env.d.ts        # Vite type declarations
├── infrastructure/           # Terraform IaC
│   └── main.tf              # S3 + CloudFront module config
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
- **Change 3** — Separate Terraform from artifact upload + own IaC + C4 docs (planned, HIGHEST risk)
- **Change 4** — Split into multiple workflows + update README (planned, Medium risk)

When starting a new change, read this plan first. Mark changes as shipped when they land.

## Gotchas & Lessons Learned

- **`npm run build` doesn't exist.** Always use `npm run ci:build`.
- **Commit headers must be ≤50 chars, sentence-case.** The AI tendency to write long descriptive subjects will get rejected by commitlint.
- **Lit requires `useDefineForClassFields: false`.** Do not enable this — Litdecorators break without it.
- **`paths-ignore` and `paths` are mutually exclusive** in GitHub Actions. Cannot combine them on the same trigger.
- **`**.md` in paths-ignore covers ALL markdown recursively** — no need to list `LICENSE.md`, `README.md`, or `.atl/*.md` separately.
- **Changes to the workflow YAML itself always trigger the pipeline** regardless of `paths-ignore`, because the YAML file isn't in the ignore list.
- **The third-party Terraform module does infrastructure AND artifact upload** (`sync_directories`). Change 3 will separate these concerns.
- **Docker has been removed.** Mise manages the toolchain (Node, Terraform, AWS CLI, TFLint, just) — see `.mise.toml`.
- **`infrastructure/versions.tf` must match `.mise.toml` exactly.** The `required_version` should be an exact pin (`= "1.15.1"`), not a range. A range defeats the purpose of Mise's deterministic pinning — if someone bypasses Mise, a range would silently accept a different version.
- **GitHub Actions secrets are automatically masked in logs.** Never add `::add-mask::` for values that come from `${{ secrets.* }}` — the runner masks them by default. Adding extra echo commands just clutters the log.
- **The Terraform module hardcodes `--profile default`.** The `InterweaveCloud/s3-cloudfront-static-website` module runs `aws s3 sync --profile default` in a local-exec provisioner. Without Docker, there's no named AWS profile — the CI workflow must write `~/.aws/credentials` before Terraform runs. This will be removed when Change 3 replaces the module.
- **`infrastructure/main.tf` sync path is `../dist`.** Not `../website_content` (that was a Docker artifact path). Vite outputs to `dist/` in the repo root, and Terraform's `path.cwd` resolves from `infrastructure/`.
- **`package.json` needs `"prepare": "husky"`.** Without it, fresh clones don't get git hooks installed. Previously Docker's entrypoint ran `npx husky install` — now npm's `prepare` lifecycle script handles it.
- **`actions/cache@v4` is deprecated** (forces Node v24 on June 2nd). Use `actions/cache@v5`.

## SDD Preferences

When running SDD commands for this project:

- **Execution mode:** Interactive (ask before each phase)
- **Artifact store:** Engram
- **Delivery strategy:** Trunk-based — direct commits to `trunk`, no PRs
- **Strict TDD:** Disabled (no test runner in the project)
