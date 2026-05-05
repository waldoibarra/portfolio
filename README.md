# Welcome To My Personal Website Code

[![Infrastructure CI/CD](https://github.com/waldoibarra/portfolio/actions/workflows/infrastructure.yml/badge.svg)](https://github.com/waldoibarra/portfolio/actions/workflows/infrastructure.yml)
[![Website CI/CD](https://github.com/waldoibarra/portfolio/actions/workflows/website.yml/badge.svg)](https://github.com/waldoibarra/portfolio/actions/workflows/website.yml)

This is a work in progress, hope you enjoy reading this code as much as I enjoyed writing it.

## Tech Stack

- **Frontend**: [Lit](https://lit.dev/) - Lightweight Web Components library
- **Language**: [TypeScript](https://www.typescriptlang.org/) with strict mode enabled
- **Build Tool**: [Vite](https://vitejs.dev/) for development and production builds
- **Styling**: CSS-in-component with Lit's `css` tagged templates
- **Infrastructure**: [Terraform](https://developer.hashicorp.com/terraform) with AWS (S3 + CloudFront + Route 53)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions) with two domain-focused workflows (`website.yml`, `infrastructure.yml`) and [Mise](https://mise.jdx.dev)-managed toolchain
- **Testing**: `terraform test` with mock providers (`infrastructure/tests/main.tftest.hcl`)

## Key Features

- **Trunk Based Development** as branching model
- **Web Components architecture** using Lit for reusable, encapsulated UI elements
- **Infrastructure as Code** with Terraform, including:
  - Private S3 bucket for static hosting
  - CloudFront distribution (SSL certificates and caching)
  - Route 53 A records for DNS management
- **Justfile** as an entrypoint to simplify repository usage
- **Mise** for declarative toolchain pinning (Node, Terraform, AWS CLI, TFLint, just) so any contributor gets the exact same versions
- **Comprehensive Linting** automatically checked before every commit and on CI:
  - TypeScript (ESLint)
  - CSS (Stylelint)
  - Terraform (TFLint)
  - Commit messages (Commitlint with [Conventional Commits](https://conventionalcommits.org/))
- **Hot Module Replacement** enabled on file save
- **Automated deployments** via GitHub Actions CI/CD pipeline

## Project Structure

```
portfolio/
├── .github/          # CI/CD pipeline
├── infrastructure/   # Terraform IaC
├── public/           # Website static files
├── src/              # Website components
├── .mise.toml        # Toolchain version pins
├── index.html        # Website entry point
└── justfile          # Local command runner
```

## Local Development

### Requirements

The only tool you need to install on your machine is [Mise](https://mise.jdx.dev). After cloning, run `mise trust && mise install && npm install` to get the full toolchain plus Husky hooks.

### Run Website Locally

To run the website in development mode, run the following command and visit [localhost:5173](http://localhost:5173).

```sh
just start
```

Or to see available commands in the justfile, run:

```sh
just
```

### Other Useful Commands

```sh
just lint      # ESLint + Stylelint
just lint-tf   # TFLint
just build     # tsc + vite build
just tf-test   # Terraform mock-provider tests
just check     # Full local check (lint + build + tf-test)
```

### Infrastructure Changes

For working with Terraform and AWS infrastructure locally, see [docs/infrastructure.md](docs/infrastructure.md).

For CI/CD pipeline details and trigger rules, see [docs/ci-cd-pipeline.md](docs/ci-cd-pipeline.md).

## Current Status

The website is currently under construction. The main component (`app-element.ts`) displays a placeholder page with links to the GitHub project and repository.
