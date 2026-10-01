# Architecture

Read this map before changing application code or infrastructure. For task instructions, start
with the [documentation index](/docs/README.md).

`waldoibarra.com` is a static portfolio site. Semantic HTML and component-scoped native CSS
implement its single landing page without a frontend runtime framework or page script for its
content. Vite 8 builds the static files, and CloudFront serves the output from a private S3 bucket
through Origin Access Control (OAC). Custom Terraform owns the AWS resources.

## System boundaries

| Area | Owns | Does not own |
| --- | --- | --- |
| [`src/`](/src/), [`public/`](/public/) | Semantic landing-page HTML, component-scoped native CSS, static assets, and Vite type declarations | Infrastructure or deployment |
| [`infrastructure/`](/infrastructure/) | S3, CloudFront, ACM, Route53, provider pins, and Terraform Cloud backend configuration | Artifact uploads, which run through `just s3-sync` |
| [`infrastructure/tests/`](/infrastructure/tests/) | Native Terraform tests with mock providers | Integration tests against real AWS |
| [`scripts/`](/scripts/) | Deploy scripts invoked by `just`; each uses `set -euo pipefail` | General-purpose local utilities |
| [`.github/workflows/`](/.github/workflows/) | Separate website and infrastructure CI/CD workflows | Inline shell logic; project tasks call recipes |
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

Development uses direct commits to `trunk`, without branches or PRs. On push, GitHub Actions
selects workflows by changed paths and deploys after each workflow's checks pass. The website
workflow's path allowlist includes the [justfile](/justfile); [`hk.pkl`](/hk.pkl) remains outside
workflow filters. Read the [delivery model](/docs/explanation/delivery.md) for filtering, gates,
and deployment dependencies.

## Design and implementation

[`landing.fig`](/docs/designs/landing.fig) records visual intent; [`src/index.html`](/src/index.html)
and [`src/`](/src/) own the native production implementation. Import and export are a handoff, not
automatic bidirectional synchronization. OpenPencil is a workstation tool and is not required by
the website build or CI.

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
