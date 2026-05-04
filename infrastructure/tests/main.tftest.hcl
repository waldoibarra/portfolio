mock_provider "aws" {
  mock_resource "aws_acm_certificate" {
    defaults = {
      id                  = "arn:aws:acm:us-east-1:123456789012:certificate/mock-cert-id"
      arn                 = "arn:aws:acm:us-east-1:123456789012:certificate/mock-cert-id"
      status              = "ISSUED"
      type                = "AMAZON_ISSUED"
      not_before          = "2026-01-01T00:00:00Z"
      not_after           = "2027-01-01T00:00:00Z"
      key_algorithm       = "RSA_2048"
      renewal_eligibility = "INELIGIBLE"
      domain_validation_options = toset([{
        domain_name           = "waldoibarra.com"
        resource_record_name  = "_abc123.waldoibarra.com."
        resource_record_type  = "CNAME"
        resource_record_value = "_def456.acm-validations.aws."
      }])
    }
  }
}

mock_provider "aws" {
  alias = "useast1"

  mock_resource "aws_acm_certificate" {
    defaults = {
      id                  = "arn:aws:acm:us-east-1:123456789012:certificate/mock-cert-id"
      arn                 = "arn:aws:acm:us-east-1:123456789012:certificate/mock-cert-id"
      status              = "ISSUED"
      type                = "AMAZON_ISSUED"
      not_before          = "2026-01-01T00:00:00Z"
      not_after           = "2027-01-01T00:00:00Z"
      key_algorithm       = "RSA_2048"
      renewal_eligibility = "INELIGIBLE"
      domain_validation_options = toset([{
        domain_name           = "waldoibarra.com"
        resource_record_name  = "_abc123.waldoibarra.com."
        resource_record_type  = "CNAME"
        resource_record_value = "_def456.acm-validations.aws."
      }])
    }
  }
}

override_data {
  target = data.aws_route53_zone.main
  values = {
    zone_id = "Z00672733I09M5BUOLGXD"
    name    = "waldoibarra.com"
  }
}

override_data {
  target = data.aws_iam_policy_document.s3_oac_policy
  values = {
    json = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"cloudfront.amazonaws.com\"},\"Action\":\"s3:GetObject\",\"Resource\":\"arn:aws:s3:::waldoibarra-com-site/*\"}]}"
  }
}

# ACM cert domain_validation_options is provider-computed (unknown at plan).
# Using override_during=plan makes it known so the for_each in
# aws_route53_record.cert_validation can be evaluated at plan time.
override_resource {
  target          = aws_acm_certificate.site
  override_during = plan
  values = {
    id                  = "arn:aws:acm:us-east-1:123456789012:certificate/mock-cert-id"
    arn                 = "arn:aws:acm:us-east-1:123456789012:certificate/mock-cert-id"
    status              = "ISSUED"
    type                = "AMAZON_ISSUED"
    not_before          = "2026-01-01T00:00:00Z"
    not_after           = "2027-01-01T00:00:00Z"
    key_algorithm       = "RSA_2048"
    renewal_eligibility = "INELIGIBLE"
    domain_validation_options = toset([{
      domain_name           = "waldoibarra.com"
      resource_record_name  = "_abc123.waldoibarra.com."
      resource_record_type  = "CNAME"
      resource_record_value = "_def456.acm-validations.aws."
    }])
  }
}

# ─── S3 ──────────────────────────────────────────────────────────────────────

run "validate_s3_bucket_name" {
  command = plan

  assert {
    condition     = aws_s3_bucket.site.bucket == "waldoibarra-com-site"
    error_message = "S3 bucket name must be waldoibarra-com-site"
  }
}

run "validate_s3_force_destroy" {
  command = plan

  assert {
    condition     = aws_s3_bucket.site.force_destroy == true
    error_message = "S3 bucket must have force_destroy = true"
  }
}

run "validate_s3_public_access_block" {
  command = plan

  assert {
    condition     = aws_s3_bucket_public_access_block.site.block_public_acls == true
    error_message = "block_public_acls must be true"
  }

  assert {
    condition     = aws_s3_bucket_public_access_block.site.block_public_policy == true
    error_message = "block_public_policy must be true"
  }

  assert {
    condition     = aws_s3_bucket_public_access_block.site.ignore_public_acls == true
    error_message = "ignore_public_acls must be true"
  }

  assert {
    condition     = aws_s3_bucket_public_access_block.site.restrict_public_buckets == true
    error_message = "restrict_public_buckets must be true"
  }
}

run "validate_s3_sse_encryption" {
  command = plan

  assert {
    condition     = one(aws_s3_bucket_server_side_encryption_configuration.site.rule).apply_server_side_encryption_by_default[0].sse_algorithm == "AES256"
    error_message = "S3 SSE algorithm must be AES256"
  }
}

run "validate_s3_ownership_controls" {
  command = plan

  assert {
    condition     = one(aws_s3_bucket_ownership_controls.site.rule).object_ownership == "BucketOwnerEnforced"
    error_message = "S3 ownership must be BucketOwnerEnforced"
  }
}

run "validate_s3_tags" {
  command = plan

  assert {
    condition     = aws_s3_bucket.site.tags["Project"] == "portfolio"
    error_message = "S3 bucket must have Project tag = portfolio"
  }

  assert {
    condition     = aws_s3_bucket.site.tags["Environment"] == "production"
    error_message = "S3 bucket must have Environment tag = production"
  }

  assert {
    condition     = aws_s3_bucket.site.tags["ManagedBy"] == "terraform"
    error_message = "S3 bucket must have ManagedBy tag = terraform"
  }

  assert {
    condition     = aws_s3_bucket.site.tags["Owner"] == "waldo"
    error_message = "S3 bucket must have Owner tag = waldo"
  }

  assert {
    condition     = aws_s3_bucket.site.tags["Name"] == "waldoibarra-com-site"
    error_message = "S3 bucket must have Name tag = waldoibarra-com-site"
  }
}

# ─── OAC ─────────────────────────────────────────────────────────────────────

run "validate_oac_type_and_signing" {
  command = plan

  assert {
    condition     = aws_cloudfront_origin_access_control.site.origin_access_control_origin_type == "s3"
    error_message = "OAC origin type must be s3"
  }

  assert {
    condition     = aws_cloudfront_origin_access_control.site.signing_behavior == "always"
    error_message = "OAC signing_behavior must be always"
  }

  assert {
    condition     = aws_cloudfront_origin_access_control.site.signing_protocol == "sigv4"
    error_message = "OAC signing_protocol must be sigv4"
  }
}

# ─── CloudFront ───────────────────────────────────────────────────────────────
# CloudFront assertions use command=apply because several attributes
# (origin_access_control_id, viewer_certificate.acm_certificate_arn) reference
# other resources' computed IDs and are only known after apply.

run "validate_cloudfront_properties" {
  command = apply

  assert {
    condition     = one(aws_cloudfront_distribution.site.origin).origin_access_control_id != ""
    error_message = "CloudFront distribution must use OAC (origin_access_control_id must be set)"
  }

  assert {
    condition     = one(aws_cloudfront_distribution.site.viewer_certificate).minimum_protocol_version == "TLSv1.2_2021"
    error_message = "CloudFront minimum TLS version must be TLSv1.2_2021"
  }

  assert {
    condition     = aws_cloudfront_distribution.site.default_root_object == "index.html"
    error_message = "CloudFront default root object must be index.html"
  }

  assert {
    condition     = length(one(aws_cloudfront_distribution.site.default_cache_behavior).allowed_methods) == 3
    error_message = "CloudFront allowed methods must be GET, HEAD, OPTIONS (exactly 3)"
  }

  assert {
    condition     = contains(tolist(one(aws_cloudfront_distribution.site.default_cache_behavior).allowed_methods), "GET")
    error_message = "CloudFront allowed methods must include GET"
  }

  assert {
    condition     = contains(tolist(one(aws_cloudfront_distribution.site.default_cache_behavior).allowed_methods), "HEAD")
    error_message = "CloudFront allowed methods must include HEAD"
  }

  assert {
    condition     = contains(tolist(one(aws_cloudfront_distribution.site.default_cache_behavior).allowed_methods), "OPTIONS")
    error_message = "CloudFront allowed methods must include OPTIONS"
  }

  assert {
    condition     = aws_cloudfront_distribution.site.tags["Project"] == "portfolio"
    error_message = "CloudFront must have Project tag = portfolio"
  }

  assert {
    condition     = aws_cloudfront_distribution.site.tags["Environment"] == "production"
    error_message = "CloudFront must have Environment tag = production"
  }

  assert {
    condition     = aws_cloudfront_distribution.site.tags["ManagedBy"] == "terraform"
    error_message = "CloudFront must have ManagedBy tag = terraform"
  }

  assert {
    condition     = aws_cloudfront_distribution.site.tags["Owner"] == "waldo"
    error_message = "CloudFront must have Owner tag = waldo"
  }
}
