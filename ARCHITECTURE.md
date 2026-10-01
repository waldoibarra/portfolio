# Architecture

Read this map before changing application code or infrastructure. For task instructions, start
with the [documentation index](/docs/README.md).

`waldo.love` is a static portfolio site, also served at `www.waldo.love`. Semantic HTML and
component-scoped native CSS implement its single landing page without a frontend runtime framework
or page script for its content. Vite 8 composes the HTML components during development and builds.
CloudFront serves the output from a private S3 bucket through Origin Access Control (OAC).
Custom Terraform owns the website resources. Domain registration and the existing public hosted
zone are account prerequisites, managed through explicit one-time operations outside Terraform.

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
interface, and [`hk.pkl`](/hk.pkl) selects pre-commit checks by staged paths. Vite 8 provides
development and build tooling; strict TypeScript checks cover [`vite.config.ts`](/vite.config.ts)
and future behavior modules. Tool-specific configuration remains in the root configuration files
and [`config/`](/config/).

Local development starts with `just setup`, then `just run`; it needs no AWS credentials.
Infrastructure plans are reviewed locally with `AWS_PROFILE=waldo`. Only GitHub Actions applies
Terraform or deploys production; CI uses its own credentials, not the workstation profile.

Development uses direct commits to `trunk`, without branches or PRs. On matching pushes,
the production workflow checks and builds both domains, stages website objects, applies
infrastructure, waits for CloudFront, then removes obsolete objects and invalidates caches.
Read the [delivery model](/docs/explanation/delivery.md) for filtering, gates, and deployment
dependencies.

The domain migration permits downtime and removes the previous domain's website routing.
There is no redirect service or old-site recovery guarantee. Bucket `waldoibarra-com-site`,
OAC `waldoibarra-com-oac`, and workspace `waldoibarra-com` keep their historical names to
preserve resource and state identities. These names are not website domains.

## Design and implementation

[`landing.fig`](/docs/designs/landing.fig) records visual intent. [`src/home/index.html`](/src/home/index.html)
owns the document shell and section order. Its private sections, components, and foundations
live under [`src/home/`](/src/home/); nothing is promoted to `shared/` until another page reuses it.
[`home.css`](/src/home/home.css) composes the page's styles without changing their cascade order.
The `html-components` plugin in [`vite.config.ts`](/vite.config.ts) expands source-root-relative
include comments before Vite processes HTML, without adding wrappers or browser JavaScript.

[`src/home/metadata.json`](/src/home/metadata.json) owns the homepage's title, description, author,
canonical URL, and sharing metadata. Vite generates the tags in the initial HTML for development
and production; the homepage shell retains charset, viewport, favicon, and stylesheet declarations.
The sharing image is a separate static asset at
[`public/images/social-preview.jpg`](/public/images/social-preview.jpg).
Read the [homepage metadata reference](/docs/reference/homepage-metadata.md) before changing
the field mapping or generation behavior.

Page entrypoints live in `src/<page>/index.html`. Vite emits `dist/home/index.html`; the standalone
[`résumé`](/public/resume/index.html) is copied to `dist/resume/index.html`. Development and preview
rewrite `/` and `/resume` to those documents. CloudFront uses `home/index.html` as its default
root object and a viewer-request function for `/resume`. Unknown paths are not homepage fallbacks.
Future built pages need an entry in `build.rolldownOptions.input` and an explicit public route.

Import and export are a handoff, not automatic bidirectional synchronization. OpenPencil is a
workstation tool and is not required by the website build or CI.

Read [Edit the landing design](/docs/how-to/edit-landing-design.md) before changing the document,
and [Implement the landing design](/docs/how-to/implement-landing-design.md) before translating
it into semantic HTML and component-scoped CSS. Tool ownership and known export limitations live
in the [OpenPencil reference](/docs/reference/openpencil.md).

## AI-assisted development

The project treats agents as collaborators: instruction files route tasks, recipes provide a
shared command interface, and Git hooks catch relevant regressions before commits reach
`trunk`. EditorConfig checks also catch formatting drift in generated changes.

The agent runtime configures Engram for cross-session memory. ADR `decision-makers` metadata
records human and model participation in architectural decisions.
[ADR-0008](/docs/decisions/0008-ai-assisted-development-as-first-class-concern.md) describes this
approach; its status remains `proposed` in the [decision index](/docs/decisions/README.md).

## Documentation boundaries

- [README](/README.md): what the portfolio is and what its engineering demonstrates.
- [Documentation index](/docs/README.md): task guides, reference, and explanations organized
  by reader need. Each topic has one home; other pages link to it.
- This architecture map: current components and ownership boundaries.
- [Agent router](/AGENTS.md): which document to read before a task.
- [Decision records](/docs/decisions/README.md): durable reasoning, alternatives, and status.
