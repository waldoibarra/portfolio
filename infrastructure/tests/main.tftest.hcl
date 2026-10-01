mock_provider "aws" {
  mock_resource "aws_cloudfront_function" {
    defaults = {
      arn = "arn:aws:cloudfront::123456789012:function/portfolio-routes"
    }
  }
}

mock_provider "aws" {
  alias = "useast1"

  mock_resource "aws_acm_certificate" {
    defaults = {
      arn                       = "arn:aws:acm:us-east-1:123456789012:certificate/mock-cert-id"
      domain_validation_options = toset([
        {
          domain_name           = "waldo.love"
          resource_record_name  = "_abc123.waldo.love."
          resource_record_type  = "CNAME"
          resource_record_value = "_def456.acm-validations.aws."
        },
        {
          domain_name           = "*.waldo.love"
          resource_record_name  = "_abc123.waldo.love."
          resource_record_type  = "CNAME"
          resource_record_value = "_def456.acm-validations.aws."
        }
      ])
    }
  }
}

override_data {
  target = data.aws_route53_zone.main
  values = {
    zone_id = "Z00672733I09M5BUOLGXD"
    name    = "waldo.love"
  }
}

override_data {
  target = data.aws_iam_policy_document.s3_oac_policy
  values = {
    json = "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"cloudfront.amazonaws.com\"},\"Action\":\"s3:GetObject\",\"Resource\":\"arn:aws:s3:::waldoibarra-com-site/*\"}]}"
  }
}

# The first plan must work while ACM validation options are still unknown.
run "plan_domain_cutover" {
  command = plan

  assert {
    condition     = toset(keys(aws_route53_record.cert_validation)) == toset(["waldo.love", "*.waldo.love"])
    error_message = "Certificate validation instances must use known requested names at plan time"
  }

  assert {
    condition = (
      aws_acm_certificate.site.domain_name == "waldo.love" &&
      aws_acm_certificate.site.subject_alternative_names == toset(["*.waldo.love"]) &&
      aws_acm_certificate.site.validation_method == "DNS"
    )
    error_message = "The certificate must cover only the new root and wildcard through DNS validation"
  }

  assert {
    condition     = aws_cloudfront_distribution.site.aliases == toset(["waldo.love", "www.waldo.love"])
    error_message = "CloudFront must serve only the new root and www hostnames"
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
    condition     = one(aws_cloudfront_distribution.site.origin).origin_access_control_id == aws_cloudfront_origin_access_control.site.id
    error_message = "CloudFront must authorize requests using the site's S3 OAC"
  }

  assert {
    condition     = one(aws_cloudfront_distribution.site.viewer_certificate).minimum_protocol_version == "TLSv1.2_2021"
    error_message = "CloudFront minimum TLS version must be TLSv1.2_2021"
  }

  assert {
    condition     = aws_cloudfront_distribution.site.default_root_object == "home/index.html"
    error_message = "CloudFront default root object must be home/index.html"
  }

  assert {
    condition = (
      aws_cloudfront_function.routes.publish &&
      one(one(aws_cloudfront_distribution.site.default_cache_behavior).function_association).event_type == "viewer-request" &&
      one(one(aws_cloudfront_distribution.site.default_cache_behavior).function_association).function_arn == aws_cloudfront_function.routes.arn
    )
    error_message = "CloudFront must run the published route function before cache lookup"
  }

  assert {
    condition     = toset(one(aws_cloudfront_distribution.site.default_cache_behavior).allowed_methods) == toset(["GET", "HEAD", "OPTIONS"])
    error_message = "CloudFront must allow only read-only viewer methods"
  }
}

run "validate_domain_routing" {
  command = apply

  assert {
    condition = (
      aws_route53_record.root.name == "waldo.love" &&
      aws_route53_record.www.name == "www.waldo.love" &&
      alltrue([
        for record in [aws_route53_record.root, aws_route53_record.www] :
        record.zone_id == data.aws_route53_zone.main.zone_id &&
        record.type == "A" &&
        one(record.alias).name == aws_cloudfront_distribution.site.domain_name &&
        one(record.alias).zone_id == aws_cloudfront_distribution.site.hosted_zone_id
      ])
    )
    error_message = "Both new hostnames must resolve through the new hosted zone to the existing distribution"
  }

  assert {
    condition = alltrue([
      for record in aws_route53_record.cert_validation :
      record.zone_id == data.aws_route53_zone.main.zone_id &&
      trimsuffix(record.name, ".") == "_abc123.waldo.love" &&
      record.type == "CNAME" &&
      record.records == toset(["_def456.acm-validations.aws."])
    ])
    error_message = "ACM validation records must publish the provider's DNS challenge in the new hosted zone"
  }

  assert {
    condition = (
      aws_acm_certificate_validation.site.certificate_arn == aws_acm_certificate.site.arn &&
      one(aws_cloudfront_distribution.site.viewer_certificate).acm_certificate_arn == aws_acm_certificate_validation.site.certificate_arn &&
      one(aws_cloudfront_distribution.site.default_cache_behavior).viewer_protocol_policy == "redirect-to-https"
    )
    error_message = "CloudFront must attach the validated certificate and upgrade HTTP requests to HTTPS"
  }
}
