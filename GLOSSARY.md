# Portfolio language

These terms distinguish the public site, its design source, and its delivery boundaries.
Read [architecture.md](architecture.md) before changing their implementation.

## Site and design

**World map**:
The homepage overview at `/`, introducing Waldo and offering labeled places to explore.

**Domain view**:
A shareable destination within the homepage, focused on one group of interests.

**Multiverse**:
The portfolio's artistic model of one Waldo exploring several connected perspectives.
It does not assert literal alternate realities.

**Depth link**:
A fragment leading directly to a disclosure inside a domain view.

**Résumé**:
The standalone career document served at `/resume`, separate from the world map.

**Landing design**:
The editable OpenPencil document expressing the world map's visual intent for desktop and mobile compositions.
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
