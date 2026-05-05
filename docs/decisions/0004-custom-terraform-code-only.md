# Custom Terraform Code Only, No Third-Party Modules

## Context and Problem Statement

The infrastructure is a static-site stack (S3 + CloudFront + ACM + Route53). Earlier iterations
used the community module `InterweaveCloud/s3-cloudfront-static-website`, which abstracted resources
behind opaque inputs and outputs. Should the project rely on third-party Terraform modules, or write
resources directly?

## Considered Options

- Custom code — every resource declared explicitly in `infrastructure/*.tf`
- Community modules (e.g., `InterweaveCloud/s3-cloudfront-static-website`) — third-party
  abstractions wrapping the same resources

## Decision Outcome

Chosen option: "Custom code", because it gives full visibility and control over every resource,
removes dependency on external maintainers, and serves as concrete documentation for the
architecture (`s3.tf` IS the OAC bucket policy spec).

### Consequences

- Good, because every resource is visible and editable; no opaque module inputs/outputs
- Good, because no external dependency risk (module deletion, breaking changes, abandoned
  maintenance)
- Good, because the code itself is documentation for the OAC + CloudFront + S3 architecture; new
  contributors read `s3.tf` instead of decoding a module's variables
- Good, because full control over tags, security hardening, and naming conventions
- Bad, because more lines of HCL to maintain than a one-line `module` block
- Bad, because the project must keep up with provider/resource API changes itself (mitigated by
  `versions.tf` exact pins and `terraform test`)
