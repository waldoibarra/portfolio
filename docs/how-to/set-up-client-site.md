# Set up a client site

Read this guide before adapting the portfolio for a different domain or client. This repository
is a working site, not a parameterized provisioning template. New-site bootstrap requires a
workflow change; copying the repository and adding secrets is not sufficient.

For GitHub configuration alone, read [Set up the repository](/docs/how-to/set-up-repository.md).
Connecting an existing site does not require a new Terraform workspace or infrastructure bootstrap.

## Establish ownership and isolation

1. Choose the client's GitHub owner, repository name, domain, AWS account and region, Terraform
    Cloud organization, and a new workspace name. Record who owns billing, renewal, credentials,
    and recovery. Prefer client-owned accounts and separate AWS accounts for unrelated clients.
2. Create a separate Terraform Cloud workspace with **local execution** and no VCS-driven apply.
    The Actions runner executes Terraform; Terraform Cloud stores and locks its state. Grant the
    deployment token state read/write and lock access. Never reuse `waldoibarra-com` for a client.
3. Arrange domain registration, registrant verification, a public Route53 hosted zone, and matching
    registrar nameservers. Obtain explicit approval before purchases or DNS changes. Keep existing
    mail and verification records intact. Domain registration and hosted-zone creation are not
    automated by this site's Terraform.
4. Create a dedicated AWS deployment identity. Read the credential handling section in
    [deployment credential guide](/docs/how-to/configure-deployment-credentials.md) before
    obtaining or storing secrets.
    For ongoing client automation, prefer short-lived GitHub OIDC credentials. OIDC requires an
    IAM provider and role, a trust policy restricted to the client's repository and production
    environment, `id-token: write`, and an AWS credential action. None of that is implemented here.
    The existing workflow instead requires non-session AWS access keys.

## Adapt the checkout before connecting production

1. Start a separate checkout without this portfolio's `.env`, Terraform working directory, plan
    files, or local state. Choose whether to preserve source history or initialize a new repository.
2. Replace the site-specific infrastructure configuration:

    | File | Review/change |
    | --- | --- |
    | `infrastructure/cloud.tf` | Organization and unique workspace |
    | `infrastructure/vars.tf` | Domain and application defaults |
    | `infrastructure/provider.tf` | Primary AWS region; keep CloudFront's ACM certificate in `us-east-1` |
    | `infrastructure/s3.tf` | Globally unique client bucket name |
    | `infrastructure/cloudfront.tf` | OAC identity, tags, owner, aliases, cache and routing settings |
    | `.github/workflows/website.yml` | Domain, AWS environment settings, deployment authentication |
    | `infrastructure/tests/` | Site-specific expected names and behavior |
    | `scripts/domain-operations.mjs` | Hardcoded account, profile, domain and safety checks |

    Do not run the existing domain-purchase helpers for a client: they are restricted to this
    portfolio's account and domain. Adapt and review their safeguards first, or use the registrar
    and AWS consoles for the one-time prerequisites.
3. Replace branding, contacts, résumé, portraits, favicon, metadata, social image, and public URLs.
    Search tracked files for `waldo`, `waldoibarra`, `767963650101`, and the old domain. Review each
    match rather than applying a blind replacement. Check licensing before reusing assets.
4. Update the site's operating docs and account instructions. Read
    [Run locally](/docs/how-to/run-locally.md) before building, then read
    [Change infrastructure](/docs/how-to/change-infrastructure.md) before validating and reviewing
    a plan against the new account and workspace. Expect new resources, never changes to this portfolio.

## Add a first-deployment path

The normal `just deploy` sequence plans, stages S3 objects, then applies Terraform. Staging reads
`s3_bucket_id` from existing Terraform outputs. A new workspace has no output or bucket, so this
sequence cannot provision an empty environment.

Before the first deployment, implement a separately approved **CI-only bootstrap path**:

1. Build, lint, validate, and test using the same recipes as normal delivery.
2. Generate and review a saved plan for the new account/workspace. Require additions only unless
    explicitly importing existing client resources. A reviewer must approve the actual saved plan
    before apply; a normal workflow dispatch currently applies without an intervening review.
3. Apply that saved plan in GitHub Actions before any S3 staging. Keep local apply prohibited.
4. Wait for CloudFront, upload the built artifact, invalidate caches, and verify the public routes.
5. Disable the bootstrap path after success. Use the existing stage-before-apply production
    sequence for later releases; do not weaken it to support empty workspaces implicitly.

The bootstrap workflow is a prerequisite to implement, not an existing command. Do not use an
unreviewed local apply or reuse another site's state to bypass it.

## Configure and verify GitHub

Read [Set up the repository](/docs/how-to/set-up-repository.md#create-and-configure-github)
before setting up Actions, the `production` environment, secrets, `trunk`, and branch protection.
Substitute the client's owner/repository and credentials throughout. Private repositories can
have different Actions billing and environment-protection availability; check the client's plan.

Complete the approved bootstrap, then run a normal production deployment. Read
[Verify a deployment](/docs/how-to/verify-deployment.md) before testing the client's hostnames,
routes, TLS, metadata, and assets. Confirm state and resource ownership before handoff.

## Prepare for repeatable automation

Before building client-site provisioning, define explicit repository owner,
visibility, domain, and AWS account/region inputs.
Also define resource prefix, Terraform organization/workspace, and credential source.
Reject an existing workspace or resources unless recovery/import was selected.
Never infer a client's account from the workstation's default AWS profile.

Keep repository creation, environment/secret setup,
and external account prerequisites separate and resumable.
Separate reviewed infrastructure bootstrap from ordinary deployment.
Require approval for purchases, IAM changes, first apply, and destructive actions. Resolve secret
values from a credential manager or named profile and transmit them without logs. Record resource
IDs and completed steps, not credentials.
Inspect and resume failed runs safely, without buying another domain
or provisioning another environment.

Manual prerequisites include account access, billing, domain/registrant approval, and DNS delegation.
GitHub authorization and initial deployment identity/token creation also remain manual.
A `.env` file or dotfiles
profile supplies local configuration; neither automatically provisions secrets on GitHub.
