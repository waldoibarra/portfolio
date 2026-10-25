# Portfolio language

These terms distinguish the public site, its design source, and its delivery boundaries.
Read [architecture.md](architecture.md) before changing their implementation.

## Site and design

**Landing page**:
The portfolio's homepage at `/`, containing the hero, work, services, and contact sections.

**Résumé**:
The standalone career document served at `/resume`, separate from the landing page.

**Landing design**:
The editable OpenPencil document expressing visual intent for desktop and mobile compositions.
It is not the production HTML.

## Delivery

**Artifact**:
The built website files that production delivery uploads to the private origin.

**Public route**:
A viewer URL whose response depends on the built artifact and CloudFront routing configuration.
The site defines `/` and `/resume`; other paths are not homepage fallbacks.

**Production transaction**:
The coordinated deployment of one checkout's artifact and infrastructure through the production workflow.

**Domain account operation**:
An explicitly initiated registration, renewal, or hosted-zone action outside Terraform and CI.
