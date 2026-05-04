# Print available recipes
[private]
default:
    @just --list

# Start development server
[group("Development")]
dev:
    npx vite

# Check TypeScript and CSS for problems
[group("Linting")]
lint:
    npx eslint . && npx stylelint --ignore-path .gitignore "**/*.css"

# Auto-fix TypeScript and CSS problems
[group("Linting")]
lint-fix:
    npx eslint --fix . && npx stylelint --ignore-path .gitignore --fix "**/*.css"

# Check Terraform for problems
[group("Linting")]
lint-tf:
    tflint --chdir infrastructure

# Run all linting (TypeScript, CSS, Terraform)
[group("Linting")]
lint-all: (lint) (lint-tf)

# Full local check: lint all + build + Terraform tests
[group("Linting")]
check: (lint) (lint-tf) (build) (tf-init) (tf-test)

# Typecheck and build for production
[group("Building")]
build:
    npx tsc -b && npx vite build

# Initialize Terraform
[group("Terraform")]
tf-init:
    terraform -chdir=infrastructure init

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

# Full production deploy: build, sync, invalidate
[group("Deploy")]
deploy: (build) (s3-sync) (invalidate)
    @echo "✓ Deploy complete"
