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
  and AWS account `767963650101` using local profile `waldo`. Clear conflicting environment
  credentials before planning and verify the effective identity with `just domain-inspect`.
  Never commit credentials. CI uses its own account credentials, not this local profile.
- For a real plan, the public Route53 hosted zone for `waldo.love` must already exist with matching
  registrar delegation. Terraform looks it up by name; there is no `hosted_zone_id` input.

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
    AWS_PROFILE=waldo TF_VAR_domain_name=waldo.love just tf-plan
    ```

    Review every addition, update, replacement, and deletion. Confirm the account, workspace,
    domain, and DNS changes. Reject replacement or deletion of the existing bucket, distribution,
    OAC, or workspace. The domain migration changes certificates and DNS, not shared identities.

## Apply through CI only

After reviewing the local plan, use the normal delivery path: a matching push to `trunk` or a
manual dispatch of the [production workflow](/.github/workflows/website.yml) on `trunk`.
Both deploy production. Do not push the domain change until registration, the public hosted
zone, and delegation are ready.

`tf-plan` saves a local preview to ignored `infrastructure/tfplan`. CI creates its own fresh
plan from its checkout and current state; it does not apply the local file. A local review is
not approval of unknown later drift. Inspect the CI plan and deployment results.

Production apply and deploy recipes are CI-only. Do not run `tf-apply`, `deploy-reviewed`,
or `deploy` locally. CI stages objects without deletion, applies its saved plan, waits for
CloudFront, syncs with deletion, then invalidates caches. See the
[delivery model](/docs/explanation/delivery.md) and
[deployment verification guide](/docs/how-to/verify-deployment.md).

## Domain account operations

These explicit one-time operations are separate from Terraform and CI. They use profile `waldo`;
Route 53 Domains uses the `us-east-1` API endpoint. This does not change S3's `us-west-2` region
or ACM's required `us-east-1` region.

| Command | Purpose |
| --- | --- |
| `just domain-inspect` | Read identity, registration status, availability, current prices, and hosted zones |
| `just domain-register CONTACT_FILE` | Submit the explicitly approved `waldo.love` purchase using a private JSON payload |
| `just domain-operation OPERATION_ID` | Read an operation's status; an operation ID alone does not prove registration succeeded |
| `just domain-disable-renewal DOMAIN` | Disable auto-renew for the explicitly selected retiring registration |
| `just domain-delete-zone ZONE_ID DOMAIN` | Delete the verified retiring hosted zone after dependency and record checks |

Replace `CONTACT_FILE` with an absolute path outside the checkout to a private file with mode
`0600`. Follow the [AWS register-domain input contract](https://docs.aws.amazon.com/cli/latest/reference/route53domains/register-domain.html):
the JSON must set `DomainName` to `waldo.love`, `DurationInYears` to `1`, `AutoRenew` to `true`,
all three contact objects (`AdminContact`, `RegistrantContact`, `TechContact`), and each
`PrivacyProtectAdminContact`, `PrivacyProtectRegistrantContact`, and `PrivacyProtectTechContact`
boolean. No purchase settings are inferred. Keep the payload out of Git, terminal transcripts,
and CI artifacts. The CLI reads the private file directly; contact values never enter command-line
arguments. Remove the payload after submission.
`OPERATION_ID` is the ID returned by AWS; `DOMAIN` and `ZONE_ID` must come from inspected account
data, not a guessed name or a loose match.

Keep auto-renew enabled for `waldo.love`; disable it only for the retiring registration.
The initial term is one year. Future renewals use the price in effect when AWS renews the domain,
not a guaranteed lifetime price.

### Register before deploying

1. Run `just domain-inspect`. Confirm profile `waldo` targets account `767963650101`, then recheck
    availability and registration and renewal prices. Obtain explicit spending authorization and
    approval of the contacts, privacy, duration, and auto-renew settings before purchase.
2. After approval, set `DOMAIN_PURCHASE_APPROVED=waldo.love` and `DOMAIN_MAX_PRICE_USD` to the
    explicitly approved positive USD registration limit for `just domain-register CONTACT_FILE`.
    The live price must not exceed that limit. Record the operation ID, not contact information.
    If submission times out, inspect the operation list and registration status before submitting
    again; a retry can create another purchase request.
3. Run `just domain-operation OPERATION_ID` until registration succeeds. Complete any registrant
    email verification. If registration fails or the name becomes unavailable, stop before
    cutover; do not buy another name or spend more without authorization.
4. Identify the public zone created during registration and verify that its nameservers match
    registrar delegation. Stop on duplicate or ambiguous zones. Do not create a second zone.
5. Run the local plan above, review it, then deploy through CI and
    [verify both hostnames](/docs/how-to/verify-deployment.md#check-the-deployed-routes).

### Retire unused DNS and renewal

Downtime on the retiring domain is acceptable. There is no redirect or coexistence requirement.

1. Inspect the retiring registration and run `just domain-disable-renewal DOMAIN`. Verify
    `AutoRenew: false`; leave the registration intact until expiration. Do not delete or transfer it.
2. After verifying `waldo.love`, confirm CloudFront has only the new website aliases and
    certificate. Confirm Terraform removed the retiring zone's managed alias and validation
    records. Do not remove resources from state to hide dependencies.
3. Inspect the exact retiring zone ID, all records, and DNSSEC. Stop for unrelated records,
    active dependencies, or DNSSEC configuration requiring separate teardown. Remove only
    explicitly approved residual records; zone deletion requires only default SOA/NS records
    to remain.
4. Run `just domain-delete-zone ZONE_ID DOMAIN`. Verify that the zone is absent, the retiring
    registration still exists with auto-renew disabled, and the new site still works.

Registration expiration does not delete a hosted zone or stop its charges. Delete unused DNS
after verification rather than waiting for expiration. Registration fees are nonrefundable;
neither a failed migration nor zone deletion refunds the purchased term. See
[AWS domain deletion and hosted-zone cleanup](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-delete.html).
Recovery uses a reviewed fix through CI; there is no guarantee of restoring the retired site.

## Extend the mock tests

[`main.tftest.hcl`](/infrastructure/tests/main.tftest.hcl) checks the declared AWS configuration.
The S3 and Origin Access Control (OAC) checks use plan mode. The CloudFront checks use mock apply
mode because referenced OAC IDs and certificate attributes are computed. Mock apply does not
apply to AWS; both the default AWS provider and its `useast1` alias are mocked.

For a new assertion, prefer plan mode when its values are known during planning. Supply stable
`mock_resource` defaults for computed fields the test needs. When a computed collection supplies
`for_each` keys, keep those keys known during planning. ACM validation records use requested
domain names as keys and derive record values from computed validation options. Preserve the
matching provider alias and any required data-source overrides.

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
