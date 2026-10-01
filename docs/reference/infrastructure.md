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
| Input variables | `domain_name` defaults to `waldo.love`; `application` defaults to `portfolio`; defined in [`vars.tf`](/infrastructure/vars.tf) |
| Terraform outputs | `s3_bucket_id` and `cloudfront_distribution_id`, defined in [`outputs.tf`](/infrastructure/outputs.tf) |

The provider regions are explicit in [`provider.tf`](/infrastructure/provider.tf). The production
workflow sets `AWS_DEFAULT_REGION` to `us-east-1`; this does not override those Terraform provider
settings. It also sets `TF_VAR_domain_name` to `waldo.love` directly, not through a secret.

[`.env.example`](/.env.example) documents the local Terraform Cloud token. Local plans use
`AWS_PROFILE=waldo`, targeting account `767963650101`; environment credentials must not override
that identity. Terraform applies and deployment mutations run only in GitHub Actions.
The [production workflow](/.github/workflows/website.yml) owns the CI secrets and environment
variables and targets the `production` GitHub environment.

## Resources and security

| Source | Configuration |
| --- | --- |
| [`s3.tf`](/infrastructure/s3.tf) | Deterministic bucket name `waldoibarra-com-site`; all four public-access blocks enabled; AES256 server-side encryption; `BucketOwnerEnforced` ownership |
| [`cloudfront.tf`](/infrastructure/cloudfront.tf) | Origin Access Control (OAC) signs S3 requests with SigV4; distribution serves the root and `www` domains and defaults to `home/index.html`; a published viewer-request Function resolves `/resume` |
| [`acm.tf`](/infrastructure/acm.tf) | DNS-validated certificate for the root domain and wildcard subdomains, with `create_before_destroy`; validation records use known domain-name keys and ACM-computed record values |
| [`dns.tf`](/infrastructure/dns.tf) | Looks up an existing public hosted zone by domain name; creates root and `www` alias A records pointing to CloudFront |

The bucket policy grants `s3:GetObject` to the CloudFront service principal only when the source
ARN matches this distribution. CloudFront redirects HTTP to HTTPS, requires `TLSv1.2_2021`,
allows GET/HEAD/OPTIONS, and caches GET/HEAD. The distribution enables compression and IPv6,
forwards no query strings or cookies, and has no geographic restriction. DNS currently declares
A records only. The full cache and distribution settings remain in the resource source.

`waldo.love` and `www.waldo.love` are the only website hostnames. Terraform reads an existing
public hosted zone; it does not own domain registration or the zone itself. Registration,
renewal settings, and retiring-zone deletion are
[explicit account operations](/docs/how-to/change-infrastructure.md#domain-account-operations),
never CI tasks.

The bucket `waldoibarra-com-site`, OAC `waldoibarra-com-oac`, and workspace `waldoibarra-com`
retain historical identifiers for resource and state continuity. They do not retain old-domain
routing. Keep the distribution and Terraform output identities as well; cosmetic renaming
must not replace them.

## Request routing

| Viewer path | S3 object or behavior |
| --- | --- |
| `/` | `home/index.html`, through the distribution's default root object |
| `/resume` | `resume/index.html`, through the viewer-request Function |
| Assets, direct object paths, and all other paths | Unchanged |

[`routes.js`](/infrastructure/functions/routes.js) rewrites only the exact `/resume` URI.
It returns the request rather than a redirect and preserves request metadata. `/resume/`,
`/Resume`, and unknown routes receive no alias or HTML fallback. The existing HTTP-to-HTTPS
redirect is independent of this route rewrite. S3 remains private behind OAC.

The production deployment stages new objects without deletion, applies infrastructure, waits
for CloudFront propagation, then syncs with deletion and invalidates cached objects. This keeps
the previous root object available until the new default root and route function are deployed.

## Tags and destructive changes

The common tag set is `Name`, `Project`, `Environment`, `ManagedBy`, and `Owner`. S3, ACM, and
CloudFront use those tags, with resource-specific `Name` values. Tag values are defined in the
`locals` block of [`cloudfront.tf`](/infrastructure/cloudfront.tf).

The bucket has `force_destroy = true`. Destroying it through Terraform can remove stored objects;
public-access blocking does not protect against an authorized destructive apply.

## Cost components

These are published AWS USD rates, not a monthly bill estimate. Actual charges depend on usage,
region, account-wide allowances, billing plan, and taxes. Recheck linked pricing and account
billing before approving spending; the repository does not establish free-tier eligibility or
enrollment in a CloudFront flat-rate plan.

| Component | Pricing and limits |
| --- | --- |
| Domain registration | AWS lists `.love` registration and renewal at $19 per year, excluding fees and taxes. Recheck live availability and both prices with `just domain-inspect` before purchase. Keep auto-renew enabled for `waldo.love`; future renewals use then-current rates. [AWS domain price list, page 13](https://d32ze2gidvkk54.cloudfront.net/Amazon_Route_53_Domain_Registration_Pricing_20140731.pdf) |
| Public hosted zone | $0.50 per zone per month for the first 25 zones; $0.10 for additional zones. Monthly charges are not prorated. An unused retiring zone remains billable until deleted. [Route 53 pricing](https://aws.amazon.com/route53/pricing/) |
| DNS queries | Matching A/AAAA aliases to CloudFront have no query charge. Other standard queries cost $0.40 per million for the first billion per month. Missing records and unmatched record types can be billed; this configuration publishes A aliases only. [Route 53 query pricing](https://aws.amazon.com/route53/pricing/) |
| S3 | Storage, PUT/LIST deployment requests, and GET origin requests are metered. Use S3 Standard rates for `us-west-2`; cache hits reduce origin GETs, not stored bytes. S3-to-CloudFront origin transfer has no additional transfer charge. [S3 pricing](https://aws.amazon.com/s3/pricing/) and [CloudFront origin pricing](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/) |
| CloudFront delivery | Pay-as-you-go rates vary by edge geography and requests/bytes. Published monthly allowances include 1 TB internet transfer and 10 million HTTP(S) requests, shared with other eligible account usage. Beyond allowances, US/Mexico/Canada examples are $0.085/GB for the next 9 TB and $0.0100 per 10,000 HTTPS requests. [CloudFront pay-as-you-go pricing](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/) |
| CloudFront Function | $0.10 per million invocations, with a published monthly allowance of 2 million. The viewer-request function runs on requests for the associated behavior, not only requests whose path is `/resume`. [Function pricing](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/) |
| Invalidations | First 1,000 paths per month have no additional charge; subsequent paths cost $0.005 each. The deployment's `/*` wildcard is one invalidation path. [Invalidation pricing](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/) |
| ACM | The non-exportable public certificate used by CloudFront has no certificate charge. Exportable public certificates and Private CA have different pricing and are not this setup. [ACM pricing](https://aws.amazon.com/certificate-manager/pricing/) |

[CloudFront flat-rate plans](https://aws.amazon.com/cloudfront/pricing/) are a separate billing
choice and can bundle DNS, edge compute, and storage credits. Do not apply those allowances to
this site's estimate without verifying the distribution's actual plan. HCP Terraform workspace
charges or limits likewise depend on the organization's subscription, not its historical name.

A Terraform plan describes proposed resource changes; it is not a cost forecast and does not
purchase a domain or prove registration, DNS delegation, or certificate issuance. A plan with
no changes does not mean the running site is free. Disabling renewal avoids a later renewal
charge but does not refund registration or stop hosted-zone, storage, or delivery charges.

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
