output "cloudfront_distribution_id" {
  description = "The CloudFront Distribution ID for cache invalidation"
  value       = module.s3-cloudfront-static-website_example.cloudfront_distribution_id
}
