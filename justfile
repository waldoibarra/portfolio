# Print available recipes
[private]
default:
    @just --list

# Run development server
dev:
    npm run dev

# Run linter and fix problems for TypeScript and CSS files
lint:
    npm run lint:fix

# Run Terraform linter
lint-tf:
    tflint --chdir infrastructure

# Run TypeScript and CSS lint (CI mode, no fix)
ci-lint:
    npm run ci:lint

# Run TypeScript build (tsc + vite build)
ci-build:
    npm run ci:build
