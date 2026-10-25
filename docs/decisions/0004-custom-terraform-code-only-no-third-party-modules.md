---
status: accepted
date: 2026-05-05
decision-makers: Waldo Ibarra, Claude Opus 4.7
consulted: Gemini 3 Flash
---

# Custom Terraform Code Only, No Third-Party Modules

## Context and Problem Statement

The infrastructure is a static-site stack (S3 + CloudFront + ACM + Route53).
Earlier iterations used the community module
`InterweaveCloud/s3-cloudfront-static-website`.
It hid resources behind opaque inputs and outputs.
Should the project rely on third-party Terraform modules, or write
resources directly?

## Considered Options

- Custom code — every resource declared explicitly in `infrastructure/*.tf`
- Community modules (e.g., `InterweaveCloud/s3-cloudfront-static-website`) — third-party
  abstractions wrapping the same resources

## Decision Outcome

Chosen option: "Custom code", because every resource remains visible and controllable.
It removes dependency on external maintainers.
The code documents the architecture: `s3.tf` is the OAC bucket policy
specification.

### Consequences

- Good, because every resource is visible and editable; no opaque module inputs/outputs
- Good, because no external dependency risk (module deletion, breaking changes, abandoned
  maintenance)
- Good, because code documents the OAC + CloudFront + S3 architecture.
  Contributors read `s3.tf` instead of decoding module variables.
- Good, because full control over tags, security hardening, and naming conventions
- Bad, because more lines of HCL to maintain than a one-line `module` block
- Bad, because the project must track provider/resource API changes itself.
  Exact `versions.tf` pins and `terraform test` mitigate this risk.
