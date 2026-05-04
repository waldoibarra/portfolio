output "s3_bucket_id" {
  description = "The name (ID) of the S3 bucket hosting site assets"
  value       = aws_s3_bucket.site.id
}

output "cloudfront_distribution_id" {
  description = "The ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.site.id
}
