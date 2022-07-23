variable "domain_name" {
  type        = string
  description = "The domain name for the website."
}

variable "hosted_zone_id" {
  type        = string
  description = "The Hosted Zone ID. This is automatically generated and can be referenced by zone records."
}

variable "profile" {
  type        = string
  description = "Credentials profile to use for aws s3 sync command."
}

variable "relative_local_source_directory" {
  type        = string
  description = "Relative path to S3 source directory."
}

variable "Application" {
  type        = string
  description = "Environment to tag all resources created by this module."
  default     = "S3 Static Website"
}
