module "s3-cloudfront-static-website_example" {
  source         = "InterweaveCloud/s3-cloudfront-static-website/aws"
  version        = "0.0.1"
  resource_uid   = var.domain_name
  domain_name    = var.domain_name
  hosted_zone_id = var.hosted_zone_id
  profile        = var.aws_profile
  sync_directories = [{
    local_source_directory = abspath("${path.cwd}/build")
    s3_target_directory    = ""
  }]
  providers = {
    aws.useast1 = aws.useast1
  }
  Application = var.Application
}
