# Change infrastructure

Validate and review a Terraform change before it reaches production. For the resource map,
see the [infrastructure reference](/docs/reference/infrastructure.md).

## Before you start

- Complete the [local setup](/docs/how-to/run-locally.md) so the pinned tools and Git hooks are
  available. Run the commands below from the repository root.
- Populate the gitignored `.env` using [`.env.example`](/.env.example). Generate a Terraform
  Cloud personal API token at <https://app.terraform.io/app/settings/tokens> and set
  `TF_TOKEN_app_terraform_io`. Mise loads `.env` through [`.mise.toml`](/.mise.toml).
- Confirm access to the [Terraform Cloud workspace](https://app.terraform.io/app/waldo-io/workspaces/waldoibarra-com)
  and the intended AWS account. AWS credentials come from the standard credential chain,
  including `~/.aws/credentials` or environment variables. Never commit credentials.
- For a real plan or apply, the public Route53 hosted zone for the configured domain must already
  exist. Terraform looks it up by name; there is no `hosted_zone_id` input.

Mock tests do not create AWS resources. Initialization still needs the configured Terraform Cloud
backend and provider downloads. Planning reads real state and provider data; applying changes
production resources. The S3 bucket has `force_destroy = true`, so a plan that destroys it can
also delete its contents.

## Validate the change

1. Edit the relevant resources under [`infrastructure/`](/infrastructure). Keep Terraform's exact
    `required_version` in [`versions.tf`](/infrastructure/versions.tf) aligned with its Mise version
    when changing the toolchain.
2. Run the infrastructure checks:

    ```sh
    just lint-tf
    just tf-check
    ```

    `tf-check` initializes the backend, validates the configuration, and runs the mock-provider
    tests. A successful run ends with passing tests; stop and fix any failed check before planning.
3. Preview the production change:

    ```sh
    just tf-plan
    ```

    Review every addition, update, replacement, and deletion. Confirm the account, workspace,
    domain, and any bucket or DNS changes before proceeding.

## Apply only after review

The normal delivery path is a push to `trunk` that matches the infrastructure workflow's path
filter. Its lint, validation, and test gates run before `just tf-deploy`, which creates a saved
plan and applies it automatically. A push or manual workflow dispatch is a production deployment,
not a plan-only check. See [how delivery works](/docs/explanation/delivery.md).

If you deliberately need an interactive local apply after the checks above:

```sh
just tf-apply
```

This command creates a fresh plan and asks for confirmation. It does **not** reuse the output of
`just tf-plan`; review the new plan before accepting it. Do not use `just tf-deploy` as a local
preview: it applies without interactive approval.

After CI deployment, [verify the workflow and site](/docs/how-to/verify-deployment.md).

## Extend the mock tests

[`main.tftest.hcl`](/infrastructure/tests/main.tftest.hcl) defines 27 assertions across 8 run blocks.
The S3 and Origin Access Control (OAC) checks use plan mode. The CloudFront checks use mock apply
mode because referenced OAC IDs and certificate attributes are computed. Mock apply does not
apply to AWS; both the default AWS provider and its `useast1` alias are mocked.

For a new assertion, prefer plan mode when its values are known during planning. Supply stable
`mock_resource` defaults for computed fields the test needs. When a computed collection supplies
`for_each` keys, make those keys known during planning: follow the file-level `override_resource`
for `aws_acm_certificate.site`, with `override_during = plan` and explicit
`domain_validation_options`. Mock defaults alone do not make that collection available at plan
time. Preserve the matching provider alias and any required data-source overrides.

After changing a test, run:

```sh
just tf-test
```

These tests check configuration with mocked providers. They do not verify AWS permissions, live
DNS, certificate issuance, or deployed behavior. The [justfile](/justfile) defines the individual
initialization and validation recipes when you need to isolate a failure.
