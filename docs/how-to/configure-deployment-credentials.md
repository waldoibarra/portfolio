# Configure deployment credentials

Read this guide before obtaining credentials and configuring GitHub Actions secrets.
The current workflow uses AWS access keys and a Terraform Cloud token. Local shell credentials
are not automatically available to GitHub Actions.

## Obtain an AWS key pair

Prefer a dedicated deployment IAM user in the intended AWS account. Do not create root access keys
or copy a personal administrator key into a client's repository.

1. Sign in to the intended AWS account. Open **IAM → Users**, then select the deployment user
    or create one without console access.
2. Attach a reviewed deployment policy. It must cover the S3, CloudFront, ACM, and Route53
    operations used by this site's Terraform and upload scripts. Scope it to the client where
    AWS supports resource restrictions. The repository does not supply a ready-to-attach policy;
    do not substitute `AdministratorAccess` merely to make a deployment pass.
3. Open **Security credentials → Access keys → Create access key**. Select the use case matching
    an application running outside AWS, then complete the creation flow.
4. Save the **access key ID** and **secret access key** together in an approved password or secret
    manager. AWS displays the secret only at creation. If it is lost, create a replacement;
    an access key ID alone cannot recover it. Securely remove any downloaded credential CSV
    after storing it.
5. Add the pair to the GitHub `production` environment as `AWS_ACCESS_KEY_ID` and
    `AWS_SECRET_ACCESS_KEY`, following the upload section below.
6. Verify the deployment before deactivating an old key. Check other consumers before deleting
    it. Rotate credentials if they appear in logs, shell history, or source control.

Read [AWS access-key management](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html)
before issuing or rotating keys.

### Reuse an approved local credential source

If the deployment key is already in your secret manager, use that saved pair.
A local AWS profile may resolve it from `~/.aws/credentials` or environment variables.
Dotfiles may configure a credential helper. Do not commit populated credential files to dotfiles.

Check the identity without printing credentials:

```sh
aws configure list-profiles
aws sts get-caller-identity --profile waldo
```

For this portfolio, require account `767963650101`. For a client, substitute the explicitly
approved profile and account. Environment credentials can override `AWS_PROFILE`.
Clear conflicting variables and verify each command's effective identity.

The AWS CLI can resolve a profile with `aws configure export-credentials --profile PROFILE
--format process`. That JSON contains secrets.
Automation must capture the JSON privately and reject session credentials for this workflow.
Pass individual fields directly to the GitHub secret uploader through standard input.
Do not run it unfiltered in a recorded terminal.
Read [AWS credential export](https://docs.aws.amazon.com/cli/latest/reference/configure/export-credentials.html)
before implementing such an uploader.

Exported `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables can also be a source.
Keep shell tracing off, never print them, and never put expanded values in command arguments.
The current workflow does not pass `AWS_SESSION_TOKEN`.
Two secrets cannot restore temporary STS or SSO credentials.
For future client automation, prefer GitHub OIDC with a scoped IAM role.
That requires workflow and IAM changes, not another static secret.

## Obtain a Terraform Cloud token

1. Sign in to HCP Terraform with an account authorized for the intended organization and workspace.
    For this portfolio, keep organization `waldo-io` and workspace `waldoibarra-com`.
2. Open **Account settings → Tokens** at <https://app.terraform.io/app/settings/tokens> and create
    a user API token with a descriptive name and an appropriate expiration.
3. Save the displayed token in your secret manager immediately. If the token was lost or expired,
    generate a replacement; GitHub cannot reveal the previous value.
4. For local plans, copy `.env.example` to `.env` only if `.env` does not already exist. Set
    `TF_TOKEN_app_terraform_io` to the token and restrict the file with `chmod 600 .env`.
    Mise loads it through `.mise.toml`; use `mise exec -- COMMAND` if Mise is not shell-activated.
5. Add the same token, or a separately managed CI token, as the GitHub environment secret
    `TF_TOKEN_APP_TERRAFORM_IO`. GitHub secret names are case-insensitive; the workflow exports
    the Terraform environment variable with its required mixed-case hostname spelling.
6. Confirm the token identity can read/write state and lock the workspace. This project uses
    **local execution**: Terraform runs on the Actions runner, with remote state in Terraform Cloud.
    Token creation alone does not grant workspace permissions.

For a client, use client-owned access and a separate workspace.
A user token inherits its user's access.
Prefer a restricted team token if the client's HCP Terraform plan supports it.
Do not share a broad personal token across unrelated clients.
Read
[HCP Terraform API tokens](https://developer.hashicorp.com/terraform/cloud-docs/users-teams-organizations/api-tokens)
before selecting token scope and rotation policy.

## Upload to GitHub without exposing values

Create the `production` environment first. Replace `OWNER/REPOSITORY` below with the intended
repository. Each command prompts for a secret without echoing it:

```sh
gh secret set AWS_ACCESS_KEY_ID --env production --repo OWNER/REPOSITORY
gh secret set AWS_SECRET_ACCESS_KEY --env production --repo OWNER/REPOSITORY
gh secret set TF_TOKEN_APP_TERRAFORM_IO --env production --repo OWNER/REPOSITORY
```

For automation, `gh secret set` also accepts the value through standard input. Feed it directly
from your credential manager or a private in-memory credential resolver. Avoid `--body` with an
expanded secret, bulk `.env` uploads, debug logging, and intermediate plaintext files.
GitHub authentication needs repository/environment administration access; authenticate with
`gh auth login` or an appropriately scoped automation token. The workflow itself uses GitHub's
automatically generated token, not your CLI token.

Confirm names without displaying values:

```sh
gh secret list --env production --repo OWNER/REPOSITORY
```

Only the three secrets above are required by the current workflow. `TF_VAR_HOSTED_ZONE_ID` is
unused. Do not commit populated `.env` files or assume `.gitignore` protects files already tracked.
Read [Set up the repository](/docs/how-to/set-up-repository.md) before enabling GitHub deployments.
Read [Set up a client site](/docs/how-to/set-up-client-site.md) before provisioning a new website.
