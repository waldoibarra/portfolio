# Working With Infrastructure (Terraform)

The Terraform configuration lives under `infrastructure/`. Toolchain (Terraform, AWS CLI, TFLint)
is managed by [Mise](https://mise.jdx.dev) — see `.mise.toml` at the repo root for pinned versions.
You don't need anything else installed.

## Architecture

The infrastructure is managed entirely by custom Terraform code (no third-party modules). Resources
are organized by concern across separate files:

| File | Purpose |
| ---- | ------- |
| `s3.tf` | S3 bucket, public access block, encryption, ownership controls, OAC bucket policy |
| `acm.tf` | ACM certificate (us-east-1), DNS validation records, certificate validation |
| `cloudfront.tf` | Origin Access Control (OAC), CloudFront distribution, tag locals |
| `dns.tf` | Route53 data source, alias A records (root + www) |
| `provider.tf` | AWS providers (us-west-2 primary, us-east-1 alias for ACM) |
| `versions.tf` | Terraform and provider version pins |
| `vars.tf` | Input variables with defaults (`domain_name`, `application`) |
| `outputs.tf` | `s3_bucket_id`, `cloudfront_distribution_id` |
| `cloud.tf` | Terraform Cloud remote backend config |

### Key design decisions

- **OAC instead of OAI** — Origin Access Control is the modern approach for CloudFront → S3 access
- **Route53 data source** — The hosted zone is looked up by domain name (`data.aws_route53_zone`),
  not passed as a variable
- **Deterministic bucket name** — `waldoibarra-com-site` (not a random prefix)
- **Security hardening** — Public access block, AES256 encryption, BucketOwnerEnforced,
  TLSv1.2_2021, GET/HEAD/OPTIONS only
- **5-tag strategy** — All taggable resources carry `Name`, `Project`, `Environment`, `ManagedBy`,
  `Owner`
- **Exact version pinning** — `infrastructure/versions.tf` `required_version` must match the
  `terraform` value in `.mise.toml` exactly (e.g., `= 1.15.1`, not a range). A range in
  `versions.tf` defeats Mise's deterministic pinning — if someone bypasses Mise, a range would
  silently accept a different version.

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

    See the comments in `.env.example` for what each variable is and where to get it. The only
    required value is `TF_TOKEN_app_terraform_io` (Terraform Cloud API token). AWS credentials come
    from `~/.aws/credentials` or environment variables. Route53 hosted zone is looked up
    automatically by domain name — no `hosted_zone_id` variable needed.

4. The Terraform Cloud remote backend is the `waldoibarra-com` workspace in the `waldo-io`
    organization: <https://app.terraform.io/app/waldo-io/workspaces/waldoibarra-com>

    Generate a personal API token at <https://app.terraform.io/app/settings/tokens> and put it in
    `TF_TOKEN_app_terraform_io`.

## Running Terraform Locally

All commands are available as `just` recipes from the repo root (see [justfile](/justfile)):

```sh
# Initialize the remote backend.
just tf-init

# Validate syntax and type checking.
just tf-validate

# Run tests (mock providers, plan-mode assertions).
just tf-test

# Preview changes.
just tf-plan

# Apply the previewed plan.
just tf-apply
```

## Running AWS CLI

The AWS CLI v2 is installed by Mise alongside Terraform. AWS credentials are read directly from
`~/.aws/credentials` or environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`):

```sh
aws sts get-caller-identity
aws cloudfront list-distributions
aws s3 ls s3://waldoibarra-com-site/
```

This is the same toolchain the CI/CD pipeline uses (see `docs/ci-cd-pipeline.md`).

## Linting

```sh
just lint-tf
```

## Terraform Tests

The project includes native Terraform tests under `infrastructure/tests/main.tftest.hcl`. Most
assertions run in plan mode (bucket name, OAC, SSE, ownership controls, tags); the CloudFront block
uses apply mode because it references computed attributes (OAC ID, ACM cert ARN) known only after
apply. Together: 27 assertions across 8 run blocks. In CI, these run via `infrastructure.yml` as a
gate before `terraform apply` — if tests fail, the plan is never applied.

```sh
just tf-test
```

### Writing new tests

When adding new resources that use `for_each` (e.g., `aws_route53_record.cert_validation`),
computed attributes like `domain_validation_options` cannot be evaluated at plan time. Use
`override_during = plan` at the file level and provide stable defaults via `mock_resource` for
every computed field that the test references. See the comment block in
`infrastructure/tests/main.tftest.hcl` for the concrete pattern.
