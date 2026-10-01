# Print available recipes
[private]
default:
  @just --list --unsorted

# Install the toolchain, Node dependencies, and Git hooks
[group("Setup")]
setup:
  @bash scripts/setup.sh

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

# Update Node dependencies from the package manifest
[group("Maintenance")]
update-node-deps:
  npm update

# Run the development server
[group("Development")]
run:
  npx vite

# Preview the production build
[group("Development")]
preview:
  npx vite preview

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
tf-check: (tf-init) (tf-validate) (tf-test) (test-routes)

# Validate Terraform syntax and type checking.
[group("Terraform")]
tf-validate:
  terraform -chdir=infrastructure validate

# Run Terraform tests
[group("Terraform")]
tf-test:
  terraform -chdir=infrastructure test

# Exercise the production CloudFront viewer-request function locally
[group("Terraform")]
test-routes:
  node --test infrastructure/tests/routes.test.mjs

# Save infrastructure changes for review before applying
[group("Terraform")]
tf-plan:
  @bash scripts/tf-plan.sh

# Apply CI's saved plan (local applies are rejected)
[group("Terraform")]
tf-apply:
  @bash scripts/tf-deploy.sh

# Reject local deployment before builds, staging, or infrastructure operations
[private]
require-ci:
  @bash scripts/require-ci.sh

# Build, check, plan and deploy website and infrastructure in CI
[group("Deploy")]
deploy: (require-ci) (build) (lint-tf) (tf-check) (tf-plan) (deploy-reviewed)

# Deploy CI's built artifact and saved infrastructure/tfplan
[group("Deploy")]
deploy-reviewed: (require-ci) (s3-stage) (tf-apply) (s3-sync) (invalidate)

# Snapshot the live artifact and CloudFront config into a new private directory
[group("Deploy")]
deploy-backup destination: (tf-init)
  @bash scripts/deploy-backup.sh "{{ destination }}"

# Stage dist/ without deleting objects used by the current distribution
[group("Deploy")]
s3-stage: (tf-init)
  @bash scripts/s3-sync.sh stage

# Wait for the current CloudFront configuration to reach every edge
[group("Deploy")]
cloudfront-wait:
  @bash scripts/cloudfront-wait.sh

# Wait for CloudFront, then synchronize dist/ and remove obsolete objects
[group("Deploy")]
s3-sync: (tf-init) (cloudfront-wait)
  @bash scripts/s3-sync.sh clean

# Invalidate CloudFront cache and wait for completion
[group("Deploy")]
invalidate: (tf-init)
  @bash scripts/invalidate.sh

# Full local check: lint + build + tests
[group("Debug")]
check: (lint) (build) (tf-check)

# Debug pre-commit hook
[group("Debug")]
debug-pre-commit-hook:
  hk run pre-commit -v

# Open the landing design in OpenPencil
[group("Design")]
[working-directory: 'docs/designs']
open-design:
  open -b net.dannote.open-pencil landing.fig

# Inspect account, registrations, operations, availability, prices, and zones
[group("Domains")]
domain-inspect:
  @node scripts/domain-operations.mjs inspect

# Purchase the approved one-year registration from a private external JSON payload
[group("Domains")]
domain-register contact_file:
  @node scripts/domain-operations.mjs register "{{ contact_file }}"

# Check registration completion and inspect the new delegation
[group("Domains")]
domain-operation operation_id:
  @node scripts/domain-operations.mjs operation "{{ operation_id }}"

# Disable renewal without deleting the retired registration
[group("Domains")]
domain-disable-renewal domain:
  @node scripts/domain-operations.mjs disable-renewal "{{ domain }}"

# Delete a verified retired public zone only after all dependencies are removed
[group("Domains")]
domain-delete-zone zone_id domain:
  @node scripts/domain-operations.mjs delete-zone "{{ zone_id }}" "{{ domain }}"
