# Welcome To My Personal Website Code

[![Deploy Website CI/CD](https://github.com/waldoibarra/portfolio/actions/workflows/deploy-website-ci-cd.yml/badge.svg)](https://github.com/waldoibarra/portfolio/actions/workflows/deploy-website-ci-cd.yml)

This is pretty much a work in progress, hope you enjoy reading this code as much as I enjoyed writing it.

## Key Features

- Trunk Based Development as branching model.
- Infrastructure as code with Terraform, which includes a private S3 bucket, CloudFront distribution (SSL certs and cache) and Route 53 A records.
- Makefile as an entrypoint of the app to simplify usage of this repository.
- Docker Compose to reduce need to install dependencies and standardize development on any OS.
- Linting of Terraform, TypeScript and CSS files automatically checked before every commit and on CI.
- Linting of commit messages locally and on CI, conforming to [conventional commits](https://conventionalcommits.org/) spectification.
- Unit tests for React code using Jest and testing library automatically checked before every commit and on CI.
- Hot reloading enabled on save of React files.
- Automated deployments with a GitHub Actions CI/CD pipeline.

## Local Development

### Requirements

The only needed tool you need to install in your machine is [Docker](https://www.docker.com).

### Run Website Locally

To run the website on development mode with hot reloading included, run the following command and visit [localhost:3000](http://localhost:3000).

``` sh
make start
```
