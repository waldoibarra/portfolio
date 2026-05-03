# Welcome To My Personal Website Code

[![Deploy Website CI/CD](https://github.com/waldoibarra/portfolio/actions/workflows/deploy-website-ci-cd.yml/badge.svg)](https://github.com/waldoibarra/portfolio/actions/workflows/deploy-website-ci-cd.yml)

This is a work in progress, hope you enjoy reading this code as much as I enjoyed writing it.

## Tech Stack

- **Frontend**: [Lit](https://lit.dev/) - Lightweight Web Components library
- **Language**: [TypeScript](https://www.typescriptlang.org/) with strict mode enabled
- **Build Tool**: [Vite](https://vitejs.dev/) for development and production builds
- **Styling**: CSS-in-component with Lit's `css` tagged templates
- **Infrastructure**: [Terraform](https://developer.hashicorp.com/terraform) with AWS (S3 + CloudFront + Route 53)
- **CI/CD**: [GitHub Actions](https://github.com/features/actions) with [Docker](https://www.docker.com/)-based builds

## Key Features

- **Trunk Based Development** as branching model
- **Web Components architecture** using Lit for reusable, encapsulated UI elements
- **Infrastructure as Code** with Terraform, including:
  - Private S3 bucket for static hosting
  - CloudFront distribution (SSL certificates and caching)
  - Route 53 A records for DNS management
- **Makefile** as an entrypoint to simplify repository usage
- **Docker Compose** to reduce dependency installation and standardize development across any OS
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
└── compose.yaml           # Docker Compose for local dev
```

## Local Development

### Requirements

The only tool you need to install on your machine is [Docker](https://www.docker.com).

### Run Website Locally

To run the website in development mode, run the following command and visit [localhost:5173](http://localhost:5173).

```sh
make start
```

Or to see available commands in the Makefile, run:

```sh
make help
```

### Other Useful Commands

```sh
make lint          # Run linter and fix problems for TypeScript and CSS files
make lint_tf       # Run Terraform linter
make debug         # Get inside the container for debugging
```

### Infrastucture Changes

For working with Terraform and AWS infrastructure locally, see [docs/infrastructure.md](docs/infrastructure.md).

## Current Status

The website is currently under construction. The main component (`app-element.ts`) displays a placeholder page with links to the GitHub project and repository.
