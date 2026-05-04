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
`.mise.toml`, `package.json`, …). Any new directory or config file added later is silently ignored
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
2. **Source push** — commit a change to any file in `src/`, `infrastructure/`, or
   `package.json`. The workflow SHOULD appear and complete all steps.

## Pipeline Steps

The single job `lint-build-deploy` runs on `ubuntu-latest` and executes these steps in order:

### 1. Set Up Toolchain (Mise)

```yaml
- uses: jdx/mise-action@v4
  with:
    cache: true
    github_token: ${{ github.token }}
```

Reads `.mise.toml` at the repo root and provisions the pinned versions of Node, Terraform,
AWS CLI v2, TFLint, and just onto the runner's PATH. The action caches the tool directory
between runs.

### 2. Install npm Dependencies

```sh
npm ci
```

Uses `actions/cache@v4` keyed on `package-lock.json` to avoid re-downloading every run.

### 3. Lint

```sh
npm run ci:lint           # ESLint + Stylelint
tflint --chdir infrastructure
npm run ci:lint:commit    # commitlint via $COMMIT_MESSAGE env var
```

### 4. TypeScript Build (Vite)

```sh
npm run ci:build          # tsc -b && vite build
```

Produces `dist/` directly in the runner workspace — no container copy step needed.

### 5. Terraform Plan + Apply

```sh
cd infrastructure
terraform init
terraform plan -out tfplan
terraform apply tfplan
```

Uses Terraform Cloud as the remote backend (`waldo-io/waldoibarra-com` workspace).

For local Terraform usage, see [docs/infrastructure.md](docs/infrastructure.md).

### 6. Upload Website Artifacts to S3

```sh
S3_BUCKET_ID=$(terraform -chdir=infrastructure output -raw s3_bucket_id)
aws s3 sync ./dist "s3://$S3_BUCKET_ID" --delete
```

Reads the S3 bucket name from Terraform output and syncs the built `dist/` directory to S3.
The `--delete` flag removes any stale files from the bucket.

### 7. CloudFront Cache Invalidation

```sh
DISTRIBUTION_ID=$(terraform -chdir=infrastructure output -raw cloudfront_distribution_id)
INVALIDATION_ID=$(aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" --query 'Invalidation.Id' --output text)
aws cloudfront wait invalidation-completed --distribution-id "$DISTRIBUTION_ID" --id "$INVALIDATION_ID"
```

Reads the CloudFront distribution ID from Terraform output, creates an `/*` invalidation,
then waits for it to complete. AWS CLI v2 reads credentials from the workflow `env:` block.
