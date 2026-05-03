# CI/CD Pipeline

The deployment pipeline is defined in `.github/workflows/deploy-website-ci-cd.yml` and runs on
every push to the `trunk` branch that touches a tracked file
(see [Path Filtering](#path-filtering) below).

## Trigger

```yaml
on:
  push:
    branches:
      - trunk
    paths-ignore:
      - '**.md'
      - 'docs/**'
      - '.gitignore'
      - '.editorconfig'
```

Pushes that only touch the ignored paths are skipped entirely — GitHub marks the check as
"skipped" rather than "passed", which is the expected behavior.

## Path Filtering

The pipeline uses a **denylist** (`paths-ignore`) rather than an allowlist (`paths`).

### Why denylist over allowlist?

An allowlist forces you to enumerate every source file that matters (e.g. `src/**`, `infrastructure/**`,
`Dockerfile`, `package.json`, …). Any new directory or config file added later is silently ignored
unless the allowlist is updated — a common source of "why didn't the pipeline run?" bugs.

A denylist is safer: it runs by default and only skips commits where every changed file matches an
ignored pattern. New source files are automatically picked up without touching the workflow.

### Currently ignored patterns

| Pattern | What is skipped |
|---------|-----------------|
| `**.md` | Any Markdown file anywhere in the repo |
| `docs/**` | Everything under the `docs/` directory |
| `.gitignore` | Git ignore rules |
| `.editorconfig` | Editor config |

### How to verify the filter works

1. **Docs-only push** — commit a change that only touches `README.md` or `docs/*.md`. The
   `deploy-website-ci-cd` workflow should NOT appear in the GitHub Actions run list.
2. **Source push** — commit a change to any file in `src/`, `infrastructure/`, `Dockerfile`, or
   `package.json`. The workflow SHOULD appear and complete all 5 steps.

## Pipeline Steps

The single job `lint-build-deploy` runs five steps in order:

### 1. Docker Build

```sh
docker buildx build -t waldoibarra/website --target production .
```

Builds the production Docker image from the root `Dockerfile`. This image is reused by subsequent
steps so tools (Node, ESLint, Stylelint) are consistent across environments.

### 2. Lint

```sh
docker container run --rm waldoibarra/website npm run ci:lint
docker container run --rm -v ${{ github.workspace }}/infrastructure:/data \
  ghcr.io/terraform-linters/tflint:v0.43.0
docker container run --rm -e COMMIT_MESSAGE="..." waldoibarra/website npm run ci:lint:commit
```

Three checks run in the same step:

- **ESLint + Stylelint** — via `npm run ci:lint` inside the website image
- **TFLint** — lints the Terraform configuration in `infrastructure/`
- **Commit message lint** — via `npm run ci:lint:commit` (commitlint)

### 3. TypeScript Build (Vite)

```sh
docker container run --name site-build waldoibarra/website npm run ci:build
docker container cp site-build:/app/dist .
docker container rm site-build
```

Runs `vite build` inside the image, then copies the compiled `dist/` folder out of the container
into the workflow workspace so Terraform can upload it to S3.

### 4. Terraform Plan + Apply

```sh
docker compose -f infrastructure/compose.yaml build terraform
docker compose -f infrastructure/compose.yaml run -T --rm terraform init
docker compose -f infrastructure/compose.yaml run -T --rm terraform plan -out tfplan
docker compose -f infrastructure/compose.yaml run -T --rm terraform apply tfplan
```

Runs Terraform inside the `infrastructure/` Docker image (which includes the AWS CLI). The remote
backend is Terraform Cloud (`waldo-io/waldoibarra-com` workspace). `apply` uploads the `dist/`
folder to the S3 origin bucket and updates any infrastructure resources that changed.

For local Terraform usage, see [docs/infrastructure.md](docs/infrastructure.md).

### 5. CloudFront Cache Invalidation

```sh
DISTRIBUTION_ID=$(... terraform output -raw cloudfront_distribution_id)
INVALIDATION_ID=$(... aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*")
aws cloudfront wait invalidation-completed --distribution-id "$DISTRIBUTION_ID" --id "$INVALIDATION_ID"
```

Reads the CloudFront distribution ID from Terraform output, creates an `/*` invalidation, then
waits for it to complete. This ensures users see the new version immediately after deploy.

The AWS CLI is run inside the same Terraform container by overriding its entrypoint — the same
pattern used for local testing (see [docs/infrastructure.md](docs/infrastructure.md)).
