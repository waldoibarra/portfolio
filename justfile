# Print available recipes
[private]
default:
    @just --list

# Initialize project dependencies
[group("Setup")]
init: (install-tools) (install-node-deps) (install-hooks)

# Install tools with Mise
[group("Setup")]
install-tools:
  mise trust
  mise install

# Install Git Hooks
[group("Setup")]
install-hooks:
  hk install

# Install Node dependencies (clean, lockfile-respecting)
[group("Setup")]
install-node-deps:
    npm ci

# Start development server
[group("Development")]
start:
    npx vite

# Check TypeScript and CSS for problems
[group("Linting")]
lint:
    npx eslint .
    npx stylelint --ignore-path .gitignore "**/*.css"

# Auto-fix TypeScript and CSS problems
[group("Linting")]
lint-fix:
    npx eslint --fix .
    npx stylelint --ignore-path .gitignore --fix "**/*.css"

# Check Terraform for problems
[group("Linting")]
lint-tf:
    tflint --chdir infrastructure

# Check Markdown for problems
[group("Linting")]
lint-md:
    markdownlint-cli2 "**/*.md"

# Check files against .editorconfig rules
[group("Linting")]
lint-ec:
    ec

# Run all linting (TypeScript, CSS, Markdown, Terraform)
[group("Linting")]
lint-all: (lint) (lint-md) (lint-tf) (lint-ec)

# Full local check: lint all + build + Terraform tests
[group("Linting")]
check: (lint-all) (build) (tf-check)

# Lint commit message
[group("Linting")]
lint-commit *ARGS:
    committed --config config/committed.toml --commit-file {{ ARGS }}

# Typecheck and build for production
[group("Building")]
build:
    npx tsc -b
    npx vite build

# Validate and test Terraform
[group("Terraform")]
tf-check: (tf-init) (tf-validate) (tf-test)

# Initialize Terraform
[group("Terraform")]
tf-init:
    terraform -chdir=infrastructure init

# Validate Terraform syntax and type checking.
[group("Terraform")]
tf-validate:
    terraform -chdir=infrastructure validate

# Run Terraform tests
[group("Terraform")]
tf-test:
    terraform -chdir=infrastructure test

# Plan infrastructure changes (interactive, review before apply)
[group("Terraform")]
tf-plan:
    terraform -chdir=infrastructure plan

# Plan and save to file (for CI)
[group("Terraform")]
tf-plan-out:
    terraform -chdir=infrastructure plan -out=tfplan

# Apply infrastructure changes (interactive confirmation)
[group("Terraform")]
tf-apply:
    terraform -chdir=infrastructure apply

# Apply saved plan file (non-interactive, for CI)
[group("Terraform")]
tf-apply-auto:
    terraform -chdir=infrastructure apply -auto-approve tfplan

# Read Terraform outputs
[group("Terraform")]
tf-output *ARGS:
    terraform -chdir=infrastructure output {{ ARGS }}

# Upload dist/ to S3 (requires tf-init)
[group("Deploy")]
s3-sync: (tf-init)
    @S3_BUCKET_ID=$(terraform -chdir=infrastructure output -raw s3_bucket_id) \
    && aws s3 sync ./dist "s3://$S3_BUCKET_ID" --delete

# Invalidate CloudFront cache (requires tf-init)
[group("Deploy")]
invalidate: (tf-init)
    @DISTRIBUTION_ID=$(terraform -chdir=infrastructure output -raw cloudfront_distribution_id) \
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
