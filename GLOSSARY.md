# Portfolio language

These terms distinguish the public site, its design source, and its delivery boundaries.
Read [architecture.md](architecture.md) before changing their implementation.

## Site and design

**Library**:
The homepage overview at `/`, introducing Waldo's connected interests and labeled places to explore.
_Avoid_: World map

**Domain view**:
A shareable destination within the homepage, focused on one group of interests.

**Multiverse**:
The portfolio's artistic model of one Waldo exploring several connected perspectives.
It does not assert literal alternate realities.

**Depth link**:
A fragment leading directly to a disclosure inside a domain view.

**Working note**:
An optional, directly linked disclosure beneath a topic.
It explains a question through examples and limits.

**Résumé**:
The standalone career document served at `/resume`, separate from the library.

**Landing design**:
The editable OpenPencil document expressing the library's visual intent for desktop and mobile compositions.
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
