# Portfolio — Project Knowledge for AI Agents

## Project Overview

Personal portfolio website deployed as a static site to AWS (S3 + CloudFront) via Terraform. Single-page Lit web component with TypeScript, built with Vite. **Trunk-based development** — no PRs, no branches, direct commits to `trunk`.

**Live site:** waldoibarra.com

## Tech Stack

- **Frontend:** Lit 3.2 (Web Components), TypeScript (strict mode)
- **Build:** Vite 5.4
- **IaC:** Terraform with third-party module `InterweaveCloud/s3-cloudfront-static-website` (Change 3 in the plan will replace this)
- **CI/CD:** GitHub Actions — single workflow `.github/workflows/deploy-website-ci-cd.yml`
- **Local dev:** Docker Compose (`make start` runs `docker compose up`)
- **Linting:** ESLint, Stylelint, TFLint, commitlint — all enforced in CI and via Husky pre-commit hook

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Vite dev server (local, no Docker) |
| `npm run ci:build` | TypeScript check + Vite production build |
| `npm run ci:lint` | ESLint + Stylelint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run preview` | Preview production build locally |
| `make start` | Docker Compose dev server |
| `make lint` | Docker-based lint + fix |
| `make lint_tf` | TFLint on infrastructure/ |
| `make debug` | Shell into Docker container |

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

**Steps (all Docker-based):**
1. Build website Docker image
2. Lint (ESLint + Stylelint, TFLint, commitlint)
3. Build app (`tsc -b && vite build` inside Docker)
4. Terraform plan + apply (deploys `dist/` to S3 via `sync_directories`)
5. CloudFront invalidation (`/*`)

## Project Structure

```
portfolio/
├── src/
│   ├── app-element.ts      # Root Web Component (Lit)
│   ├── index.css            # Global styles
│   └── vite-env.d.ts        # Vite type declarations
├── infrastructure/           # Terraform IaC
│   ├── main.tf              # S3 + CloudFront module config
│   └── compose.yaml         # Docker for Terraform local dev
├── .github/workflows/        # CI/CD
│   └── deploy-website-ci-cd.yml
├── docs/
│   ├── cicd-improvements-plan.md  # Living CI/CD improvement plan
│   ├── ci-cd-pipeline.md          # Pipeline documentation
│   └── infrastructure.md          # Terraform/Docker workflow docs
├── index.html                # Entry point
├── Dockerfile                # Website build container
├── docker-entrypoint.sh      # Container entry point
├── compose.yaml              # Local dev Docker Compose
├── Makefile                  # Convenience commands (Docker-based)
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
- **Change 2** — Drop Docker, adopt Mise (planned, HIGH risk)
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
- **Docker is overkill for this project** — it's a static site. Change 2 replaces Docker with Mise for toolchain management.

## SDD Preferences

When running SDD commands for this project:

- **Execution mode:** Interactive (ask before each phase)
- **Artifact store:** Engram
- **Delivery strategy:** Trunk-based — direct commits to `trunk`, no PRs
- **Strict TDD:** Disabled (no test runner in the project)
