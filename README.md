# [Waldo Ibarra · Portfolio](https://waldoibarra.com)

The personal portfolio of software architect Waldo Ibarra, with the code, cloud infrastructure,
and engineering decisions behind it.

[Visit the site](https://waldoibarra.com) · [Explore the architecture](/ARCHITECTURE.md) ·
[Read the decisions](/docs/decisions/README.md)

## The design direction

![Waldo's landing design: charcoal canvas with a dotted field, hero greeting, software services, production results, and a LinkedIn inquiry action](/docs/designs/landing-preview.png)

Preview of the [OpenPencil design](/docs/designs/landing.fig), with desktop and mobile compositions
for prospective clients, CEOs, and recruiters. It leads with software services and résumé-backed
results. The only call to action is Message on LinkedIn. The Lit frontend still contains an
under-construction page.

## What this repository demonstrates

- **A small frontend:** a static site built with Lit, TypeScript, and Vite, without a backend
  application to operate.
- **Inspectable infrastructure:** custom Terraform defines the AWS resources, including a
  private S3 origin behind CloudFront. The infrastructure is part of the repository.
- **Repeatable delivery:** Mise manages the toolchain; `just` recipes connect local checks,
  Git hooks, and GitHub Actions. Website and infrastructure changes have separate pipelines.
- **Decisions with context:** architectural records preserve the alternatives and tradeoffs
  behind the tooling and delivery model, including the evolving approach to AI-assisted work.

Read the [architecture](/ARCHITECTURE.md) for the system boundaries or the
[decision records](/docs/decisions/README.md) for the reasoning.

## Work with the project

[Run locally](/docs/how-to/run-locally.md) ·
[Work on the design](/docs/how-to/edit-landing-design.md) ·
[Browse the documentation](/docs/README.md)

## License

[MIT](/LICENSE.md)
