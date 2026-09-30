# Infrastructure reference

The production site uses S3, CloudFront, ACM, and Route53. Terraform declares the resources directly
under [`infrastructure/`](/infrastructure), without third-party modules. See the
[architecture map](/ARCHITECTURE.md) for the whole system and
[ADR 0004](/docs/decisions/0004-custom-terraform-code-only-no-third-party-modules.md) for that decision.

## Environment and state

| Setting | Value or source |
| --- | --- |
| Terraform Cloud organization | `waldo-io` |
| Terraform Cloud workspace | [`waldoibarra-com`](https://app.terraform.io/app/waldo-io/workspaces/waldoibarra-com), configured in [`cloud.tf`](/infrastructure/cloud.tf) |
| Primary AWS provider region | `us-west-2` |
| ACM provider alias and region | `aws.useast1`, `us-east-1`, as required for CloudFront certificates |
| Input variables | `domain_name` defaults to `waldoibarra.com`; `application` defaults to `portfolio`; defined in [`vars.tf`](/infrastructure/vars.tf) |
| Terraform outputs | `s3_bucket_id` and `cloudfront_distribution_id`, defined in [`outputs.tf`](/infrastructure/outputs.tf) |

The provider regions are explicit in [`provider.tf`](/infrastructure/provider.tf). Both GitHub
workflows set `AWS_DEFAULT_REGION` to `us-east-1`; this does not override those Terraform provider
settings. The infrastructure workflow also sets `TF_VAR_domain_name` to `waldoibarra.com` directly,
not through a secret.

[`.env.example`](/.env.example) documents the local Terraform Cloud token. AWS credentials are
separate and follow the standard credential chain. The workflow `env` sections are the source of
truth for CI secrets and environment variables:
[website](/.github/workflows/website.yml) and
[infrastructure](/.github/workflows/infrastructure.yml). Both jobs target the `production`
GitHub environment.

## Resources and security

| Source | Configuration |
| --- | --- |
| [`s3.tf`](/infrastructure/s3.tf) | Deterministic bucket name `waldoibarra-com-site`; all four public-access blocks enabled; AES256 server-side encryption; `BucketOwnerEnforced` ownership |
| [`cloudfront.tf`](/infrastructure/cloudfront.tf) | Origin Access Control (OAC) signs S3 requests with SigV4; distribution serves the root and `www` domains and defaults to `index.html` |
| [`acm.tf`](/infrastructure/acm.tf) | DNS-validated certificate for the root domain and wildcard subdomains, with `create_before_destroy`; validation records come from the certificate's computed options |
| [`dns.tf`](/infrastructure/dns.tf) | Looks up an existing public hosted zone by domain name; creates root and `www` alias A records pointing to CloudFront |

The bucket policy grants `s3:GetObject` to the CloudFront service principal only when the source
ARN matches this distribution. CloudFront redirects HTTP to HTTPS, requires `TLSv1.2_2021`,
allows GET/HEAD/OPTIONS, and caches GET/HEAD. The distribution enables compression and IPv6,
forwards no query strings or cookies, and has no geographic restriction. DNS currently declares
A records only. The full cache and distribution settings remain in the resource source.

The common tag set is `Name`, `Project`, `Environment`, `ManagedBy`, and `Owner`. S3, ACM, and
CloudFront use those tags, with resource-specific `Name` values. Tag values are defined in the
`locals` block of [`cloudfront.tf`](/infrastructure/cloudfront.tf).

The bucket has `force_destroy = true`. Destroying it through Terraform can remove stored objects;
public-access blocking does not protect against an authorized destructive apply.

## Toolchain and command sources

[`.mise.toml`](/.mise.toml) owns the tool inventory and version selections, including Terraform,
AWS CLI, TFLint, and GitHub CLI. Terraform's exact `required_version` in
[`versions.tf`](/infrastructure/versions.tf) must match the Mise Terraform version. The AWS
provider uses a `~> 5.0` constraint; the selected provider version and checksums live in
[`.terraform.lock.hcl`](/infrastructure/.terraform.lock.hcl). Not every Mise tool uses a full
patch-version pin.

The [justfile](/justfile) owns the command definitions and dependencies. CI reads its Terraform
outputs through [`s3-sync.sh`](/scripts/s3-sync.sh) and [`invalidate.sh`](/scripts/invalidate.sh).
The [infrastructure change guide](/docs/how-to/change-infrastructure.md) covers credentials,
validation, tests, plan review, and applying changes.
