---
status: accepted
date: 2026-09-30
decision-makers: Waldo Ibarra, GPT-6 Astra
---

# Coordinate Static Site and Route Deployments

## Context and Problem Statement

[ADR-0005](/docs/decisions/0005-domain-split-cicd-workflows.md) split website and infrastructure
into independent production pipelines. Moving the home object to `home/index.html` makes the
artifact layout and CloudFront route configuration one deployment contract. A deleting S3 sync
can remove the old default root while CloudFront still references it; applying routes first can
reference objects that have not been uploaded.

## Considered Options

- Keep independent workflows and rely on operators to order coupled changes.
- Add cross-workflow dependencies and conditional deployment paths.
- Use one serialized production workflow for both domains.

## Decision Outcome

Use one serialized production workflow. Stage the artifact without deletion, apply the saved
infrastructure plan, wait for CloudFront deployment, then delete obsolete objects and invalidate
cached responses. Both domains are checked before deployment. Read the
[delivery model](/docs/explanation/delivery.md) for the executable sequence and recovery procedure.

### Consequences

- Route changes cannot race independent destructive artifact cleanup within the workflow.
- Website-only changes also check and plan infrastructure; this trades delivery speed for one
  reliable deployment path.
- Local production deployments must not overlap an Actions deployment.
- A failed apply retains previously served objects; recovery restores the prior artifact and
  routing configuration before cleanup.

### Confirmation

Local builds, route behavior tests, Terraform mock tests, and a reviewed saved plan precede a
production deployment. Verify `/` and `/resume` after CloudFront propagation and invalidation;
unknown routes must not return the landing page.
