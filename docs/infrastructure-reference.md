# Infrastructure Reference — Pre-Change 3 Snapshot

> **Purpose**: Safety net document capturing all current resource IDs, ARNs, and
> configurations before Change 3 destroys and recreates the infrastructure.
> Created: 2026-05-03
>
> **Do not delete this file.** It is the rollback reference if recreate fails.

---

## Summary

| Item | Value |
|------|-------|
| AWS Account ID | `767963650101` |
| IAM User | `arn:aws:iam::767963650101:user/waldo` |
| Terraform Cloud Org | `waldo-io` |
| Terraform Cloud Workspace | `waldoibarra-com` |
| AWS Primary Region | `us-west-2` |
| AWS ACM / CF Region | `us-east-1` |
| Terraform Module | `InterweaveCloud/s3-cloudfront-static-website` v`0.0.1` |
| AWS Provider Version | `4.10.0` |
| Terraform Version | `1.15.1` |

---

## Resource Inventory (14 resources)

### Managed Resources (12)

| # | Resource Type | Logical Name | State Address |
|---|--------------|--------------|---------------|
| 1 | `aws_s3_bucket` | `website_files` | `module.s3-cloudfront-static-website_example.aws_s3_bucket.website_files` |
| 2 | `aws_s3_bucket_acl` | `website_files` | `module.s3-cloudfront-static-website_example.aws_s3_bucket_acl.website_files` |
| 3 | `aws_s3_bucket_policy` | `website_files` | `module.s3-cloudfront-static-website_example.aws_s3_bucket_policy.website_files` |
| 4 | `aws_s3_bucket_versioning` | `website_files[0]` | `module.s3-cloudfront-static-website_example.aws_s3_bucket_versioning.website_files` (count=0, never created) |
| 5 | `aws_acm_certificate` | `ssl_certificate` | `module.s3-cloudfront-static-website_example.aws_acm_certificate.ssl_certificate` |
| 6 | `aws_acm_certificate_validation` | `ssl_certificate_validation` | `module.s3-cloudfront-static-website_example.aws_acm_certificate_validation.ssl_certificate_validation` |
| 7 | `aws_cloudfront_origin_access_identity` | `cloudfront_oai` | `module.s3-cloudfront-static-website_example.aws_cloudfront_origin_access_identity.cloudfront_oai` |
| 8 | `aws_cloudfront_distribution` | `s3_distribution` | `module.s3-cloudfront-static-website_example.aws_cloudfront_distribution.s3_distribution` |
| 9 | `aws_route53_record` | `root-a` | `module.s3-cloudfront-static-website_example.aws_route53_record.root-a` |
| 10 | `aws_route53_record` | `www-a` | `module.s3-cloudfront-static-website_example.aws_route53_record.www-a` |
| 11 | `aws_route53_record` | `cert_validation["waldoibarra.com"]` | `module.s3-cloudfront-static-website_example.aws_route53_record.cert_validation["waldoibarra.com"]` |
| 12 | `aws_route53_record` | `cert_validation["*.waldoibarra.com"]` | `module.s3-cloudfront-static-website_example.aws_route53_record.cert_validation["*.waldoibarra.com"]` |

### Data Sources (2, not managed — no destroy needed)

| # | Resource Type | Logical Name | State Address |
|---|--------------|--------------|---------------|
| D1 | `data.archive_file` | `website_content_zip[0]` | `module.s3-cloudfront-static-website_example.data.archive_file.website_content_zip[0]` |
| D2 | `data.aws_caller_identity` | `current` | `module.s3-cloudfront-static-website_example.data.aws_caller_identity.current` |

### Special Resources (1, will be dropped — no import needed)

| # | Resource Type | Logical Name | State Address |
|---|--------------|--------------|---------------|
| S1 | `null_resource` | `sync_remote_website_content[0]` | `module.s3-cloudfront-static-website_example.null_resource.sync_remote_website_content[0]` |

---

## S3 Bucket

| Attribute | Value |
|-----------|-------|
| **Bucket Name** | `waldoibarra-com20220722202658658100000002` |
| **ARN** | `arn:aws:s3:::waldoibarra-com20220722202658658100000002` |
| **Region** | `us-west-2` |
| **Domain** | `waldoibarra-com20220722202658658100000002.s3.amazonaws.com` |
| **Regional Domain** | `waldoibarra-com20220722202658658100000002.s3.us-west-2.amazonaws.com` |
| **Hosted Zone ID** (S3 internal) | `Z3BJ6K6RIION7M` |
| **Force Destroy** | `false` |
| **Versioning** | Disabled |
| **ACL** | `private` |
| **Object Lock** | Disabled |
| **SSE Algorithm** | `AES256` |
| **Bucket Prefix Used** | `waldoibarra-com` (prefix that generated the bucket name) |
| **Owner Canonical User ID** | `de11432aa1231df5607f1ea641de376f7f9fda02c74632b27017576818ca3dd9` |

### Current Tags

```hcl
tags = {
  "Application" = "Personal static website"
  "Environment" = "Automation"
}
```

### Current Bucket Policy (OAI-based — legacy)

```json
{
  "Id": "CloudfrontAccess to Website Files",
  "Version": "2008-10-17",
  "Statement": [
    {
      "Sid": "1",
      "Action": "s3:GetObject",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity E3EDYRVX4G6AAB"
      },
      "Resource": "arn:aws:s3:::waldoibarra-com20220722202658658100000002/*"
    }
  ]
}
```

> **Change 3 note**: The new bucket will be named `waldoibarra-com-site` (deterministic,
> no random suffix). The new policy will use OAC (not OAI) with
> `cloudfront.amazonaws.com` as the service principal.

---

## ACM Certificate

| Attribute | Value |
|-----------|-------|
| **ARN** | `arn:aws:acm:us-east-1:767963650101:certificate/d9219f53-e3f4-45e6-887f-d14cf657a040` |
| **Domain Name** | `waldoibarra.com` |
| **Subject Alternative Names** | `*.waldoibarra.com` |
| **Validation Method** | DNS |
| **Status** | `ISSUED` |
| **Region** | `us-east-1` (required for CloudFront) |
| **Certificate Transparency Logging** | `ENABLED` |
| **Validation Timestamp** | `2026-03-25 02:15:43 UTC` |

### Domain Validation Options

Both `waldoibarra.com` and `*.waldoibarra.com` share the **same** CNAME record:

| Field | Value |
|-------|-------|
| **CNAME Name** | `_785c94631834783cece56983857497d9.waldoibarra.com.` |
| **CNAME Value** | `_6fcdead9a4f8a9ba90d7136f9df16702.mqzgcdqkwq.acm-validations.aws.` |

> **Note**: Two `for_each` keys (`waldoibarra.com` and `*.waldoibarra.com`) map to
> the same CNAME record. Only one Route53 record is created (with `allow_overwrite = true`).
> This is expected ACM behavior for wildcard SAN sharing the same base domain.

---

## CloudFront Origin Access Identity (OAI — Legacy)

> **Change 3 note**: OAI will be replaced with OAC. The OAI below will be destroyed.

| Attribute | Value |
|-----------|-------|
| **OAI ID** | `E3EDYRVX4G6AAB` |
| **Comment** | `waldoibarra.com_OAI` |
| **CloudFront Path** | `origin-access-identity/cloudfront/E3EDYRVX4G6AAB` |
| **IAM ARN** | `arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity E3EDYRVX4G6AAB` |
| **Caller Reference** | `terraform-20220722202658648700000001` |
| **ETag** | `E2LF1UGWELQITO` |
| **S3 Canonical User ID** | `2cadf1ff1bdb3ac81209ef6c38c70b41d1d2666af94bfb9835d0d10d33b1d79573646d2fdbb11192d3cde8104be61e5c` |

---

## CloudFront Distribution

| Attribute | Value |
|-----------|-------|
| **Distribution ID** | `E37L3B62KHLZ52` |
| **ARN** | `arn:aws:cloudfront::767963650101:distribution/E37L3B62KHLZ52` |
| **Domain Name** | `d370nc5wo78rqg.cloudfront.net` |
| **Hosted Zone ID** (CF internal) | `Z2FDTNDATAQYW2` |
| **Status** | `Deployed` |
| **Enabled** | `true` |
| **HTTP Version** | `http2` |
| **IPv6** | Enabled |
| **Price Class** | `PriceClass_200` |
| **Default Root Object** | `index.html` |
| **Comment** | `waldoibarra.com-CloudfrontDistribution` |
| **Caller Reference** | `terraform-20220722202749930400000002` |
| **ETag** | `E18XMJKWO9Y9U1` |
| **Last Modified** | `2022-07-22 20:27:50 UTC` |
| **Web ACL** | None |
| **Geo Restriction** | None |

### Aliases

```
waldoibarra.com
www.waldoibarra.com
```

### Origin Configuration

| Attribute | Value |
|-----------|-------|
| **Origin ID** | `waldoibarra.com_origin_id` |
| **Domain Name** | `waldoibarra-com20220722202658658100000002.s3.us-west-2.amazonaws.com` |
| **Access Method** | OAI — `origin-access-identity/cloudfront/E3EDYRVX4G6AAB` |
| **Connection Attempts** | `3` |
| **Connection Timeout** | `10` |

### Cache Behavior

| Attribute | Value |
|-----------|-------|
| **Viewer Protocol Policy** | `redirect-to-https` |
| **Allowed Methods** | `DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT` (all 7) |
| **Cached Methods** | `GET, HEAD, OPTIONS` |
| **Target Origin ID** | `waldoibarra.com_origin_id` |
| **Compress** | `false` |
| **Default TTL** | `3600` |
| **Max TTL** | `86400` |
| **Min TTL** | `0` |
| **Query String** | `false` |
| **Cookies** | `none` |

> **Change 3 note**: The new distribution will restrict allowed methods to
> `GET, HEAD, OPTIONS` only (static site — no mutation methods needed).
> TLS policy will be upgraded from `TLSv1.1_2016` to `TLSv1.2_2021`.

### Viewer Certificate

| Attribute | Value |
|-----------|-------|
| **ACM Certificate ARN** | `arn:aws:acm:us-east-1:767963650101:certificate/d9219f53-e3f4-45e6-887f-d14cf657a040` |
| **SSL Support Method** | `sni-only` |
| **Minimum Protocol Version** | `TLSv1.1_2016` |
| **CloudFront Default Cert** | `false` |

---

## Route53

### Hosted Zone

| Attribute | Value |
|-----------|-------|
| **Zone ID** | `Z00672733I09M5BUOLGXD` |
| **Domain** | `waldoibarra.com` |

> **Note**: The Route53 hosted zone is NOT managed by this Terraform configuration.
> It exists independently and must not be destroyed.

### DNS Records

#### Root A Record (alias to CloudFront)

| Attribute | Value |
|-----------|-------|
| **Record ID** | `Z00672733I09M5BUOLGXD_waldoibarra.com_A` |
| **Name** | `waldoibarra.com` |
| **Type** | `A` |
| **FQDN** | `waldoibarra.com` |
| **Alias Target** | `d370nc5wo78rqg.cloudfront.net` |
| **Alias Zone ID** | `Z2FDTNDATAQYW2` |
| **Evaluate Target Health** | `false` |
| **TTL** | `0` (alias record) |

#### WWW A Record (alias to CloudFront)

| Attribute | Value |
|-----------|-------|
| **Record ID** | `Z00672733I09M5BUOLGXD_www.waldoibarra.com_A` |
| **Name** | `www.waldoibarra.com` |
| **Type** | `A` |
| **FQDN** | `www.waldoibarra.com` |
| **Alias Target** | `d370nc5wo78rqg.cloudfront.net` |
| **Alias Zone ID** | `Z2FDTNDATAQYW2` |
| **Evaluate Target Health** | `false` |
| **TTL** | `0` (alias record) |

#### ACM Validation CNAME Record

| Attribute | Value |
|-----------|-------|
| **Record ID** | `Z00672733I09M5BUOLGXD__785c94631834783cece56983857497d9.waldoibarra.com._CNAME` |
| **Name** | `_785c94631834783cece56983857497d9.waldoibarra.com` |
| **Type** | `CNAME` |
| **FQDN** | `_785c94631834783cece56983857497d9.waldoibarra.com` |
| **Value** | `_6fcdead9a4f8a9ba90d7136f9df16702.mqzgcdqkwq.acm-validations.aws.` |
| **TTL** | `60` |
| **Allow Overwrite** | `true` |

> **Note**: This single CNAME record serves both `waldoibarra.com` and
> `*.waldoibarra.com` validation keys (same name/value for both keys).

---

## Provider Configuration

### Default Provider (us-west-2)

```hcl
provider "aws" {
  region  = "us-west-2"
  profile = ""
}
```

### ACM Provider (us-east-1, aliased)

```hcl
provider "aws" {
  alias   = "useast1"
  region  = "us-east-1"
  profile = ""
}
```

---

## Terraform Version Constraints (Current)

```hcl
terraform {
  required_version = "1.15.1"  # exact pin, enforced via Mise

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.10.0"  # very old (April 2022 vintage)
    }
  }
}
```

### Provider Lock File Versions

| Provider | Version |
|----------|---------|
| `hashicorp/aws` | `4.10.0` |
| `hashicorp/archive` | `2.2.0` |
| `hashicorp/null` | `3.1.1` |

---

## Terraform Cloud Remote State

```hcl
terraform {
  cloud {
    organization = "waldo-io"
    workspaces {
      name = "waldoibarra-com"
    }
  }
}
```

---

## Current Variables

| Variable | Current Value | Notes |
|----------|--------------|-------|
| `domain_name` | `waldoibarra.com` | Required, no default |
| `hosted_zone_id` | `Z00672733I09M5BUOLGXD` | Set via `TF_VAR_hosted_zone_id` secret |
| `aws_profile` | `""` (empty string) | Workaround for module's hardcoded `--profile default` |
| `Application` | `"Personal static website"` | Default: `"S3 Static Website"` |

---

## Current Output

```hcl
output "cloudfront_distribution_id" {
  description = "The CloudFront Distribution ID for cache invalidation"
  value       = module.s3-cloudfront-static-website_example.cloudfront_distribution_id
  # Resolved value: "E37L3B62KHLZ52"
}
```

---

## Null Resource (Deploy Mechanism — Will Be Dropped)

The module uses a `null_resource` with `local-exec` provisioner to sync files.
This is being replaced by an explicit `aws s3 sync` step in the CI workflow.

| Attribute | Value |
|-----------|-------|
| **Resource ID** | `2073709986874615398` |
| **Trigger: filesha256** | `5f9c8ce87e77466f63f405be7bc6b4cb18d10130db107edcd6038d76ce5dda25` |
| **Trigger: local_source_directory** | `/home/runner/work/portfolio/portfolio/dist` |
| **Trigger: s3_target_directory** | `null` (root of bucket) |

---

## Rollback Instructions

If Change 3 fails after destroy and cannot complete:

1. **Restore from git**: The pre-Change 3 `infrastructure/` config is in git history
   on `trunk` — find the last commit before the Change 3 `infra:` commits.
2. **Re-apply old module**: Checkout the old commit, run `terraform -chdir=infrastructure apply`.
   The module will attempt to recreate all resources.
3. **Manual console fallback**: Use the IDs and ARNs in this document to manually
   restore critical resources via the AWS Console if Terraform apply fails.

### Key Recovery Values

| Resource | ID / ARN |
|----------|---------|
| S3 Bucket | `waldoibarra-com20220722202658658100000002` |
| CloudFront Distribution | `E37L3B62KHLZ52` |
| CloudFront OAI | `E3EDYRVX4G6AAB` |
| ACM Certificate | `arn:aws:acm:us-east-1:767963650101:certificate/d9219f53-e3f4-45e6-887f-d14cf657a040` |
| Route53 Zone | `Z00672733I09M5BUOLGXD` |
| Route53 Root A | `Z00672733I09M5BUOLGXD_waldoibarra.com_A` |
| Route53 WWW A | `Z00672733I09M5BUOLGXD_www.waldoibarra.com_A` |
| Route53 CNAME (ACM val.) | `Z00672733I09M5BUOLGXD__785c94631834783cece56983857497d9.waldoibarra.com._CNAME` |
| ACM Validation CNAME name | `_785c94631834783cece56983857497d9.waldoibarra.com` |
| ACM Validation CNAME value | `_6fcdead9a4f8a9ba90d7136f9df16702.mqzgcdqkwq.acm-validations.aws.` |
