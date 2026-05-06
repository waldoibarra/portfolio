# Print available recipes
[private]
default:
  @just --list --unsorted

# Install all project dependencies
[group("Setup")]
install: (install-tools) (install-node-deps) (install-hooks)

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

# Run all linters
[group("Linting")]
lint: (lint-ec) (lint-ts) (lint-css) (lint-md) (lint-tf) (lint-sh)

# Check files against .editorconfig rules
[group("Linting")]
lint-ec:
  ec -config config/.editorconfig-checker.json

# Check TypeScript for problems
[group("Linting")]
lint-ts:
  npx eslint .

# Auto-fix TypeScript problems
[group("Linting")]
lint-ts-fix:
  npx eslint --fix .

# Check CSS for problems
[group("Linting")]
lint-css:
  npx stylelint --config config/.stylelintrc.json --ignore-path .gitignore "**/*.css"

# Auto-fix CSS problems
[group("Linting")]
lint-css-fix:
  npx stylelint --config config/.stylelintrc.json --ignore-path .gitignore --fix "**/*.css"

# Check Markdown for problems
[group("Linting")]
lint-md:
  markdownlint-cli2 --config config/.markdownlint-cli2.yaml "**/*.md"

# Check Terraform for problems
[group("Linting")]
lint-tf:
  tflint --chdir infrastructure

# Check Shell scripts for problems
[group("Linting")]
lint-sh:
  shellcheck scripts/*.sh

# Lint commit message
[group("Linting")]
lint-commit *ARGS:
  committed --config config/committed.toml --commit-file {{ ARGS }}

# Compile and build website
[group("Building")]
build: (compile-ts) (build-for-prod)

# Compile website TS (type check)
[group("Building")]
compile-ts:
  npx tsc -b

# Generate website build for production
[group("Building")]
build-for-prod:
  npx vite build

# Initialize Terraform
[group("Terraform")]
tf-init:
  terraform -chdir=infrastructure init

# Initialize, validate and test Terraform
[group("Terraform")]
tf-check: (tf-init) (tf-validate) (tf-test)

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

# Plan and save to file (non-interactive)
[group("Terraform")]
tf-plan-auto:
  terraform -chdir=infrastructure plan -out=tfplan

# Apply infrastructure changes (interactive confirmation)
[group("Terraform")]
tf-apply:
  terraform -chdir=infrastructure apply

# Apply saved plan file (non-interactive)
[group("Terraform")]
tf-apply-auto:
  terraform -chdir=infrastructure apply -auto-approve tfplan

# Upload dist/ to S3
[group("Deploy")]
s3-sync: (tf-init)
  @scripts/s3-sync.sh

# Invalidate CloudFront cache
[group("Deploy")]
invalidate: (tf-init)
  @scripts/invalidate.sh

# Full local check: lint + build + tests
[group("Debug")]
check: (lint) (build) (tf-check)

# Debug pre-commit hook
[group("Debug")]
debug-pre-commit-hook:
  hk run pre-commit -v
