# Architecture

Read this map before changing application code or infrastructure. For task instructions, start
with the [documentation index](/docs/README.md).

`waldo.love` is a static portfolio site, also served at `www.waldo.love`.
Semantic HTML and component-scoped native CSS implement its single landing page.
Its content needs neither a frontend runtime framework nor a page script.
Vite 8 composes the HTML components during development and builds.
CloudFront serves the output from a private S3 bucket through Origin Access Control (OAC).
Custom Terraform owns the website resources. Domain registration and the existing public hosted zone
are account prerequisites.
Explicit one-time operations outside Terraform manage them.

## System boundaries

| Area | Owns | Does not own |
| --- | --- | --- |
| [`src/`](/src/), [`public/`](/public/) | Semantic landing-page HTML, component-scoped native CSS, static assets, and Vite type declarations | Infrastructure or deployment |
| [`infrastructure/`](/infrastructure/) | S3, CloudFront, ACM, Route53, provider pins, and Terraform Cloud backend configuration | Artifact uploads, which run through `just s3-sync` |
| [`infrastructure/tests/`](/infrastructure/tests/) | Native Terraform tests with mock providers | Integration tests against real AWS |
| [`scripts/`](/scripts/) | Setup, deployment, and explicit domain-account operations invoked by `just` | Automatic purchases or domain retirement in CI |
| [`.github/workflows/`](/.github/workflows/) | One coordinated website and infrastructure production workflow | Inline shell logic; project tasks call recipes |
| [`docs/designs/`](/docs/designs/) | Editable design source and the README's generated preview | Production frontend implementation |

There are no source tests yet. The infrastructure tests cover S3, OAC, and CloudFront properties.
Read [Infrastructure reference](/docs/reference/infrastructure.md) for resources, security
settings, inputs, outputs, and environment requirements.

## Toolchain and delivery

[`.mise.toml`](/.mise.toml) manages project tools. The [justfile](/justfile) is the command
interface, and [`hk.pkl`](/hk.pkl) selects pre-commit checks by staged paths.
Vite 8 provides development and build tooling.
Strict TypeScript checks cover [`vite.config.ts`](/vite.config.ts) and
future behavior modules. Tool-specific configuration remains in the root configuration files
and [`config/`](/config/).

Local development starts with `just setup`, then `just run`; it needs no AWS credentials.
Infrastructure plans are reviewed locally with `AWS_PROFILE=waldo`. Only GitHub Actions applies
Terraform or deploys production; CI uses its own credentials, not the workstation profile.

Development uses direct commits to `trunk`, without branches or PRs.
On matching pushes, the production workflow checks and builds both domains,
then stages website objects.
It applies infrastructure and waits for CloudFront before removing obsolete objects
and invalidating caches.
Read the [delivery model](/docs/explanation/delivery.md) for filtering, gates, and deployment
dependencies.

The domain migration permits downtime and removes the previous domain's website routing.
There is no redirect service or old-site recovery guarantee. Bucket `waldoibarra-com-site`,
OAC `waldoibarra-com-oac`, and workspace `waldoibarra-com` keep their historical names to
preserve resource and state identities. These names are not website domains.

## Design and implementation

[`landing.fig`](/docs/designs/landing.fig) records visual intent. [`src/home/index.html`](/src/home/index.html)
owns the document shell and section order.
Its private sections, components, and foundations live under
[`src/home/`](/src/home/).
Promote nothing to `shared/` until another page reuses it.
[`home.css`](/src/home/home.css) composes the page's styles without changing their cascade order.
The homepage's [`action-link` component](/src/home/components/action-link/) owns the LinkedIn
action used by the hero and contact sections. Its
[`linkedin-action.html`](/src/home/components/action-link/linkedin-action.html) defines the label,
destination, and title once. Reuse within the homepage stays in `home/components/`.
The `html-components` plugin in [`vite.config.ts`](/vite.config.ts) recursively
expands source-root-relative include comments.
It runs before Vite processes HTML, adding neither wrappers nor browser JavaScript.
Nested includes also resolve from `src/`; cycles and invalid or escaping
paths are rejected.

[`src/home/metadata.json`](/src/home/metadata.json) owns the homepage's title, description, author,
canonical URL, and sharing metadata.
Vite generates the tags in the initial HTML for development and production.
The homepage shell retains charset, viewport, favicon, and stylesheet declarations.
The sharing image is a separate static asset at
[`public/images/social-preview.jpg`](/public/images/social-preview.jpg).
Read the [homepage metadata reference](/docs/reference/homepage-metadata.md) before changing
the field mapping or generation behavior.

Page entrypoints live in `src/<page>/index.html`. Vite emits `dist/home/index.html`.
The standalone [`résumé`](/public/resume/index.html) is copied to
`dist/resume/index.html`. Development and preview
rewrite `/` and `/resume` to those documents. CloudFront uses `home/index.html` as its default
root object and a viewer-request function for `/resume`. Unknown paths are not homepage fallbacks.
Future built pages need an entry in `build.rolldownOptions.input` and an explicit public route.

Import and export are a handoff, not automatic bidirectional synchronization. OpenPencil is a
workstation tool and is not required by the website build or CI.

Read [Edit the landing design](/docs/how-to/edit-landing-design.md) before
changing the document.
Read [Implement the landing design](/docs/how-to/implement-landing-design.md)
before translating it into semantic HTML and component-scoped CSS.
Tool ownership and known export limitations live
in the [OpenPencil reference](/docs/reference/openpencil.md).

## Evolving the system

**Keep ownership local.** The homepage owns its sections and action-link component.
Promote a component to `shared/` only when another page needs it.
The design file records visual intent; production markup and styles remain under `src/home/`.
Update both when visual intent changes, because export does not synchronize them.

**Preserve delivery contracts.** A new built page needs a Vite entrypoint and an explicit public route.
Review the artifact layout and CloudFront function together before changing either.
Keep one ordered production workflow for coupled site and infrastructure changes.
Read the [delivery model](/docs/explanation/delivery.md) before changing its path filters or order.

**Keep docs with owners.** Update this map when boundaries change.
Update the relevant task guide or reference when commands, configuration, or behavior changes.
Use the [decision index](/docs/decisions/README.md) only for decisions meeting its recording criteria.
Read [documentation maintenance](/docs/README.md#maintain-the-documentation) before reorganizing pages.

## AI-assisted development

Instruction files route agent tasks; recipes provide a shared command interface.
Git hooks select relevant local checks before commits reach `trunk`.
EditorConfig checks catch formatting drift in generated changes.
ADR `decision-makers` metadata records human and model participation in architectural decisions.
The proposed AI-first stance is in
[ADR-0008](/docs/decisions/0008-ai-assisted-development-as-first-class-concern.md).
Its status remains `proposed` in the [decision index](/docs/decisions/README.md).

## Documentation boundaries

- [README](/README.md): what the portfolio is and what its engineering demonstrates.
- [Glossary](/GLOSSARY.md): terms separating site, design, routing, and delivery concepts.
- [Documentation index](/docs/README.md): task guides, reference, and explanations organized
  by reader need. Each topic has one home; other pages link to it.
- This architecture map: current components and ownership boundaries.
- [Agent router](/AGENTS.md): which document to read before a task.
- [Decision records](/docs/decisions/README.md): durable reasoning, alternatives, and status.
