# Portfolio documentation

Choose a page by what you need to do or understand. Start with the
[portfolio README](/README.md) for the project introduction.

## Complete a task

| Task | Guide |
| --- | --- |
| Set up a checkout and see the site in a browser | [Run locally](/docs/how-to/run-locally.md) |
| Obtain AWS keys and a Terraform token, then configure CI secrets | [Configure deployment credentials](/docs/how-to/configure-deployment-credentials.md) |
| Create a GitHub repository and configure Actions | [Set up the repository](/docs/how-to/set-up-repository.md) |
| Adapt the project and provision a separate client website | [Set up a client site](/docs/how-to/set-up-client-site.md) |
| Change homepage titles, descriptions, or sharing tags | [Edit homepage metadata](/docs/how-to/run-locally.md#edit-homepage-metadata) |
| Review a local Terraform plan and deploy through CI | [Change infrastructure](/docs/how-to/change-infrastructure.md) |
| Check whether a push deployed and inspect failures | [Verify a deployment](/docs/how-to/verify-deployment.md) |
| Register the website domain or retire unused DNS | [Domain account operations](/docs/how-to/change-infrastructure.md#domain-account-operations) |
| Edit and review the OpenPencil document | [Edit the landing design](/docs/how-to/edit-landing-design.md) |
| Translate the design into the production frontend | [Implement the landing design](/docs/how-to/implement-landing-design.md) |

## Look up a fact

- [Homepage metadata reference](/docs/reference/homepage-metadata.md): JSON fields, generated tags,
  development reloads, and sharing boundaries.
- [Infrastructure reference](/docs/reference/infrastructure.md): AWS resources, Terraform
  inputs and outputs, environment requirements, security settings, and cited cost components.
- [OpenPencil reference](/docs/reference/openpencil.md): workstation tooling, command behavior,
  and known rendering limitations.
- [justfile](/justfile): project commands and their dependencies.
- [.mise.toml](/.mise.toml): project tool versions.

## Understand the system

- [Architecture](/architecture.md): components, ownership boundaries, and design-to-code handoff.
- [Glossary](/GLOSSARY.md): site, design, routing, and delivery terms.
- [Public identity](/docs/explanation/public-identity.md): values, audience, evidence, and privacy.
- [Delivery model](/docs/explanation/delivery.md): local checks, workflow filtering, and
  deployment dependencies.
- [Decision records](/docs/decisions/README.md): why choices were made, alternatives, and status.

## Maintain the documentation

**Keep one owner per fact.** The [README](/README.md) introduces the portfolio.
The [architecture map](/architecture.md) owns current boundaries; task guides own procedures.
References own field and resource details; explanations own delivery reasoning.
Link to an owner rather than repeating operational instructions.

**Evolve with code.** Update affected documentation when a source path, command, route, or
deployment gate changes.
Keep historical decisions and their status in the [decision index](/docs/decisions/README.md).
Do not promote an old ADR command into current guidance without checking the [justfile](/justfile).

Use [Diátaxis](https://diataxis.fr/) to separate task instructions, factual reference, and
explanation. Add a tutorial for a concrete learning journey, not an empty category.
Read the [agent router](/AGENTS.md) before changing project conventions.
