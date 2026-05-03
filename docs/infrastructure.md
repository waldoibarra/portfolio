# Working With Infrastructure (Terraform)

The Terraform configuration lives under `infrastructure/` and is executed inside a Docker container
so you don't need Terraform or the AWS CLI installed on your machine.

## Prerequisites

1. Copy the environment template and fill in the values:

   ```sh
   cp .env.example .env
   ```

   See the comments in `.env.example` for what each variable is and where to get it. The sensitive
   ones are the AWS credentials and the Terraform Cloud API token.

2. The Terraform Cloud remote backend is the `waldoibarra-com` workspace in the `waldo-io` organization:
   <https://app.terraform.io/app/waldo-io/workspaces/waldoibarra-com>

   Generate a personal API token at <https://app.terraform.io/app/settings/tokens> and put it in
   `TF_TOKEN_app_terraform_io`.

## Running Terraform Locally

All commands run via the `terraform` service defined in `infrastructure/compose.yaml`, which
mirrors what the CI/CD pipeline executes.

```sh
# Build the container image (only needed once, or when the Dockerfile changes).
docker compose -f infrastructure/compose.yaml build terraform

# Initialize the remote backend.
docker compose -f infrastructure/compose.yaml run -T --rm terraform init

# Preview changes.
docker compose -f infrastructure/compose.yaml run -T --rm terraform plan -out tfplan

# Apply the previewed plan.
docker compose -f infrastructure/compose.yaml run -T --rm terraform apply tfplan

# Read an output (e.g. the CloudFront distribution ID).
docker compose -f infrastructure/compose.yaml run -T --rm terraform output -raw cloudfront_distribution_id
```

## Running AWS CLI Inside the Same Container

The `infrastructure/Dockerfile` bakes the AWS CLI into the image, but its `ENTRYPOINT` is set to `terraform`. To run AWS CLI commands, override the entrypoint with an empty string:

```sh
docker compose -f infrastructure/compose.yaml run -T --rm --entrypoint "" terraform \
  aws sts get-caller-identity
```

This is the same pattern the CI/CD pipeline uses to invalidate the CloudFront cache after a deploy.
