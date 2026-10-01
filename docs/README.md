# Portfolio documentation

Choose a page by what you need to do or understand. Start with the
[portfolio README](/README.md) for the project introduction.

## Complete a task

| Task | Guide |
| --- | --- |
| Set up a checkout and see the site in a browser | [Run locally](/docs/how-to/run-locally.md) |
| Review a local Terraform plan and deploy through CI | [Change infrastructure](/docs/how-to/change-infrastructure.md) |
| Check whether a push deployed and inspect failures | [Verify a deployment](/docs/how-to/verify-deployment.md) |
| Register the website domain or retire unused DNS | [Domain account operations](/docs/how-to/change-infrastructure.md#domain-account-operations) |
| Edit and review the OpenPencil document | [Edit the landing design](/docs/how-to/edit-landing-design.md) |
| Translate the design into the production frontend | [Implement the landing design](/docs/how-to/implement-landing-design.md) |

## Look up a fact

- [Infrastructure reference](/docs/reference/infrastructure.md): AWS resources, Terraform
  inputs and outputs, environment requirements, security settings, and cited cost components.
- [OpenPencil reference](/docs/reference/openpencil.md): workstation tooling, command behavior,
  and known rendering limitations.
- [justfile](/justfile): project commands and their dependencies.
- [.mise.toml](/.mise.toml): project tool versions.

## Understand the system

- [Architecture](/ARCHITECTURE.md): components, ownership boundaries, and design-to-code handoff.
- [Delivery model](/docs/explanation/delivery.md): local checks, workflow filtering, and
  deployment dependencies.
- [Decision records](/docs/decisions/README.md): why choices were made, alternatives, and status.

## Maintain the documentation

Use [Diátaxis](https://diataxis.fr/) to separate task instructions, factual reference, and
explanation. Add a tutorial when there is a concrete learning journey to teach; do not create
empty categories. Read the [agent router](/AGENTS.md) before changing project conventions.
