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
    tests and route-function behavior tests. Stop and fix any failed check before planning.
3. Preview the production change:

    ```sh
    just tf-plan
    ```

    Review every addition, update, replacement, and deletion. Confirm the account, workspace,
    domain, and any bucket or DNS changes before proceeding.

## Apply only after review

The normal delivery path is a push to `trunk` matching the
[production workflow](/.github/workflows/website.yml)'s path filter. Website and infrastructure
changes share one serialized deployment through `just deploy`: build and check, stage objects
without deletion, apply a saved infrastructure plan, wait for CloudFront propagation, sync with
deletion, then invalidate caches. A push or manual workflow dispatch deploys production;
it is not a plan-only check. See [how delivery works](/docs/explanation/delivery.md).

For a local deployment with an explicitly reviewed plan:

```sh
just build
just lint-tf
just tf-check
just tf-plan
# Review the saved plan before proceeding.
just deploy-reviewed
```

`tf-plan` saves `infrastructure/tfplan`; `deploy-reviewed` applies that saved plan after staging
the built files and completes the propagation wait, deleting sync, and invalidation. If the
configuration or intended deployment changes, generate and review a new plan.

`just tf-apply` applies the existing saved plan without staging website files or waiting before
a subsequent upload. Do not use it alone for routing or object-layout changes: `/` must not
switch to `home/index.html` before that object exists, and old objects must remain until
CloudFront finishes deploying. Use `deploy-reviewed` for the complete ordered cutover.
`just deploy` is also a production command, not a local preview.

After CI deployment, [verify the workflow and site](/docs/how-to/verify-deployment.md).

## Extend the mock tests

[`main.tftest.hcl`](/infrastructure/tests/main.tftest.hcl) checks the declared AWS configuration.
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

The actual CloudFront Function source is exercised locally by
[`routes.test.mjs`](/infrastructure/tests/routes.test.mjs). Run it independently with:

```sh
just test-routes
```

It checks that only `/resume` rewrites to `/resume/index.html`, preserves request metadata,
and leaves root, asset, direct-object, and unknown paths untouched. Keep these cases aligned
with the [routing contract](/docs/reference/infrastructure.md#request-routing).

The Terraform tests use mocked providers; the route tests execute JavaScript locally. Neither
verifies AWS permissions, live DNS, certificate issuance, or deployed behavior. The
[justfile](/justfile) defines the individual initialization and validation recipes when you need
to isolate a failure.
