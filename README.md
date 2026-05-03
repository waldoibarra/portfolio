# Welcome To My Personal Website Code

[![Deploy Website CI/CD](https://github.com/waldoibarra/portfolio/actions/workflows/deploy-website-ci-cd.yml/badge.svg)](https://github.com/waldoibarra/portfolio/actions/workflows/deploy-website-ci-cd.yml)

This is a work in progress, hope you enjoy reading this code as much as I enjoyed writing it.

## Tech Stack

- **Frontend**: [Lit](https://lit.dev/) - Lightweight Web Components library
- **Language**: [TypeScript](https://www.typescriptlang.org/) with strict mode enabled
- **Build Tool**: [Vite](https://vitejs.dev/) for development and production builds
- **Styling**: CSS-in-component with Lit's `css` tagged templates
- **Infrastructure**: [Terraform](https://developer.hashicorp.com/terraform) with AWS (S3 + CloudFront + Route 53)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions) with [Mise](https://mise.jdx.dev)-managed toolchain

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
├── src/
│   ├── app-element.ts      # Root Web Component (Lit)
│   ├── index.css           # Global styles
│   └── vite-env.d.ts      # Vite type declarations
├── infrastructure/         # Terraform IaC
│   └── main.tf            # AWS S3 + CloudFront module
├── index.html              # Entry point
├── vite.config.ts          # Vite configuration
├── .mise.toml             # Toolchain version pins
└── justfile               # Local command runner
```

## Local Development

### Requirements

The only tool you need to install on your machine is [Mise](https://mise.jdx.dev). After cloning, run `mise trust && mise install && npm install` to get the full toolchain plus Husky hooks.

### Run Website Locally

To run the website in development mode, run the following command and visit [localhost:5173](http://localhost:5173).

```sh
just dev
```

Or to see available commands in the justfile, run:

```sh
just --list
```

### Other Useful Commands

```sh
just lint          # Run linter and fix problems for TypeScript and CSS files
just lint-tf       # Run Terraform linter
```

### Infrastructure Changes

For working with Terraform and AWS infrastructure locally, see [docs/infrastructure.md](docs/infrastructure.md).
For CI/CD pipeline details and trigger rules, see [docs/ci-cd-pipeline.md](docs/ci-cd-pipeline.md).

## Current Status

The website is currently under construction. The main component (`app-element.ts`) displays a placeholder page with links to the GitHub project and repository.
