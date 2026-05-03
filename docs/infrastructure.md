# Working With Infrastructure (Terraform)

The Terraform configuration lives under `infrastructure/`. Toolchain (Terraform, AWS CLI,
TFLint) is managed by [Mise](https://mise.jdx.dev) — see `.mise.toml` at the repo root for
pinned versions. You don't need anything else installed.

## Prerequisites

1. Install Mise (one-time): <https://mise.jdx.dev/getting-started.html>

2. From the repo root, install the pinned tools:

   ```sh
   mise trust
   mise install
   ```

   This provisions Node, Terraform, AWS CLI v2, TFLint, and just.

3. Copy the environment template and fill in the values:

   ```sh
   cp .env.example .env
   ```

   See the comments in `.env.example` for what each variable is and where to get it. The
   sensitive ones are the AWS credentials and the Terraform Cloud API token. Mise loads
   `.env` automatically when you `cd` into the repo (configured via `_.file = ".env"`
   in `.mise.toml`).

4. The Terraform Cloud remote backend is the `waldoibarra-com` workspace in the `waldo-io`
   organization: <https://app.terraform.io/app/waldo-io/workspaces/waldoibarra-com>

   Generate a personal API token at <https://app.terraform.io/app/settings/tokens> and put
   it in `TF_TOKEN_app_terraform_io`.

## Running Terraform Locally

All commands run natively from the `infrastructure/` directory:

```sh
cd infrastructure

# Initialize the remote backend.
terraform init

# Preview changes.
terraform plan -out tfplan

# Apply the previewed plan.
terraform apply tfplan

# Read an output (e.g. the CloudFront distribution ID).
terraform output -raw cloudfront_distribution_id
```

## Running AWS CLI

The AWS CLI v2 is installed by Mise alongside Terraform. AWS credentials are read directly
from the environment (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) loaded by Mise from
`.env`:

```sh
aws sts get-caller-identity
aws cloudfront list-distributions
```

This is the same toolchain the CI/CD pipeline uses (see `docs/ci-cd-pipeline.md`).

## Linting

```sh
just lint-tf      # tflint --chdir infrastructure
```
