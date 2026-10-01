# How delivery works

Production has one coordinated [workflow](/.github/workflows/website.yml), covering website and
infrastructure changes. Every deployment builds and checks both domains, stages the artifact,
applies a saved infrastructure plan, waits for CloudFront, and only then removes old objects.
This replaces the independent pipelines recorded in
[ADR 0005](/docs/decisions/0005-domain-split-cicd-workflows.md): independent deploys could delete
`index.html` before CloudFront switched its default root to `home/index.html`.
[ADR 0010](/docs/decisions/0010-coordinate-static-site-and-route-deployments.md) records the
coordinated delivery decision.

## One ordered production transaction

Matching pushes to `trunk` and manual `workflow_dispatch` run a real production deployment.
There is no pull-request trigger or validation-only dispatch. The workflow calls `just deploy`
after its EditorConfig, shell, TypeScript, and CSS lint steps:

| Order | Recipe | Guarantee |
| --- | --- | --- |
| 1 | `build`, `lint-tf`, `tf-check` | Build the artifact; initialize, validate and mock-test Terraform; exercise the production route function locally |
| 2 | `tf-plan` | Save the exact infrastructure plan to ignored `infrastructure/tfplan` |
| 3 | `s3-stage` | Upload `dist/` without `--delete`, retaining objects needed by the old configuration |
| 4 | `tf-apply` | Apply only that saved plan, not a freshly calculated plan |
| 5 | `cloudfront-wait` | Wait for the distribution to report `Deployed` |
| 6 | `s3-sync` | Synchronize the same artifact with `--delete`, removing obsolete objects |
| 7 | `invalidate` | Invalidate `/*` and wait for completion |

A failed command stops the sequence. In particular, a failed apply or distribution waiter cannot
reach the deleting sync or invalidation. Staging is non-destructive, not atomic: it can update
same-key files before the infrastructure changes. Vite's hashed assets avoid that overlap for
compiled assets. The saved plan is removed after a successful apply; a new planning attempt
removes any earlier plan first so a failed attempt cannot leave a stale apply target.

The `production` concurrency group has `cancel-in-progress: false`. One workflow owns the whole
sequence, rather than relying on a shared lock between independent jobs whose order is unknown.
GitHub may replace pending runs; it does not promise FIFO deployment order. Each run nevertheless
ships the artifact and infrastructure from one checkout together. Local deployments must not run
alongside Actions or another operator: GitHub concurrency does not lock a local shell.

Website-only changes deliberately use this same transaction. Usually the infrastructure plan is
empty. This conservative choice prevents a website-only push from deleting objects while a prior
infrastructure change remains unapplied. Do not use the low-level upload recipe as a shortcut for
route or layout changes.

## Bootstrap and shared state

Upload, distribution wait, and invalidation scripts read the bucket/distribution identifiers from
Terraform outputs, requiring Terraform Cloud and AWS access. Existing production deployments
already have these outputs. A completely new environment needs an initial checked, reviewed
infrastructure apply before its first artifact can be staged. Follow the
[infrastructure guide](/docs/how-to/change-infrastructure.md); subsequent deployments use the
ordered transaction above.

The workflow uses Mise's tool cache and npm's download cache. Its YAML owns secrets, environment
settings, and exact lint selection. The [infrastructure reference](/docs/reference/infrastructure.md)
describes AWS resources, state, and credentials. Mock-provider and route-function tests check
configuration and rewrite behavior, not live AWS permissions, DNS, or edge propagation.

Mise normalizes EditorConfig Checker's platform-suffixed executable to `ec` on installation, so
`just lint-ec` uses the same command on Linux and macOS. The workflow's cache prefix excludes
older installations that lacked that executable normalization.

## Shared command interface

The [justfile](/justfile) owns build, check, and deployment commands. Workflow `run` steps contain
only recipes; checkout, setup, and caching remain Actions steps. Local hooks in [`hk.pkl`](/hk.pkl)
select checks independently by staged-file globs. CI does not run Markdown lint, although local
hooks do. See [ADR 0007](/docs/decisions/0007-justfile-as-the-single-command-interface.md).

## Filtering limits

The workflow's `paths` allowlist includes website sources, static assets, infrastructure, all
scripts, `justfile`, toolchain/build configuration, and its own YAML. Docs-only pushes normally do
not run it. `hk.pkl`, `.editorconfig`, and `.gitignore` remain outside the allowlist. A new unlisted
source or configuration path can silently skip delivery; no run is not a passing check.

GitHub evaluates at most 300 changed files for path filtering. Matching files beyond that list can
miss a run; pushes exceeding 1,000 commits or timing out diff generation run without normal path
filtering. See [GitHub's path-filter documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#git-diff-comparisons).

The [deployment guide](/docs/how-to/verify-deployment.md) provides the reviewed local rollout,
rollback sequence, and checks for Actions and the live routes.
