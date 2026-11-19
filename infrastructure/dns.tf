data "aws_route53_zone" "main" {
  name         = var.domain_name
  private_zone = false
}

resource "aws_route53_record" "gmail_mx" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "MX"
  ttl     = 300
  records = ["1 smtp.google.com."]
}

resource "aws_route53_record" "root_txt" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "TXT"
  ttl     = 300
  records = [
    "google-site-verification=nUXzE4DlX2o4VnDAe_CedAqtsAF_ikgZ-0nobaDyplU",
    "v=spf1 include:_spf.google.com ~all",
  ]
}

resource "aws_route53_record" "google_dkim" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "google._domainkey.${var.domain_name}"
  type    = "TXT"
  ttl     = 300
  # Adjacent quoted strings form one TXT value in Route 53.
  records = [join("\"\"", [
    "v=DKIM1;k=rsa;p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAt+BrKc0cOlQ2",
    "nlnS1WbGFck4+MkfI+hIPZApbRI/w2E+lZCF658Lxu41IZ035g39L96xz+fH6J/fDmBSPwc6",
    "uP9WcmaMWcsSiy+yG8U39zwQxh9W+mNKEpzhZlTGJVB0Ia+Uso0ioS3suFnKTpBpEePFMTGc",
    "ykOR2Z3dTcdBBuJ4tJyZza9xMe0zHGJhMjQx1y45uRwNBSjG04FpxQCYZ4/G5+dYieaBaqxO",
    "IO6/OzdoQr4luXLKQILGdDu5/6d9JeBN8sW8o4Z6fdAw4dyXdLbKld2QQP4yn2ke7HEOZfZN",
    "cz8y/jl2M++7zKhx+mUaqLVQE0+qC1UhiR7yqxBl0QIDAQAB",
  ])]
}

resource "aws_route53_record" "root" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.site.domain_name
    zone_id                = aws_cloudfront_distribution.site.hosted_zone_id
    evaluate_target_health = false
  }
}
