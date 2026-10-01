resource "aws_acm_certificate" "site" {
  provider = aws.useast1

  domain_name               = var.domain_name
  subject_alternative_names = ["*.${var.domain_name}"]
  validation_method         = "DNS"

  tags = merge(local.tags, { Name = "${var.domain_name}-cert" })

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cert_validation" {
  # Requested names stay known when ACM replaces the certificate.
  for_each = {
    for domain in [var.domain_name, "*.${var.domain_name}"] : domain => one([
      for option in aws_acm_certificate.site.domain_validation_options : option
      if option.domain_name == domain
    ])
  }

  zone_id         = data.aws_route53_zone.main.zone_id
  name            = each.value.resource_record_name
  type            = each.value.resource_record_type
  ttl             = 60
  records         = [each.value.resource_record_value]
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "site" {
  provider = aws.useast1

  certificate_arn         = aws_acm_certificate.site.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}
