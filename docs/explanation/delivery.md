# How delivery works

The website and infrastructure have separate GitHub Actions workflows. Each owns its checks and
production deployment, so a website-only change does not need an infrastructure apply. A change
that matches both workflows can run them in parallel. The
[architecture map](/ARCHITECTURE.md) shows the systems they deploy;
[ADR 0005](/docs/decisions/0005-domain-split-cicd-workflows.md) records the split from the earlier
single workflow with `paths-ignore`.

## Two production pipelines

Both workflows trigger on matching pushes to `trunk` and support manual `workflow_dispatch`.
Neither declares a pull-request trigger. This follows the
[trunk-based development decision](/docs/decisions/0006-trunk-based-development.md).
A matching push runs deployment after its checks; it is not a validation-only event.

The [website workflow](/.github/workflows/website.yml) installs locked Node dependencies, checks
EditorConfig, shell scripts, TypeScript, and CSS, then builds the site. Its deployment uploads
`dist/` to S3 and invalidates CloudFront's `/*` path. The
[upload script](/scripts/s3-sync.sh) uses synchronization with deletion, so remote objects absent
from the build are removed. The [invalidation script](/scripts/invalidate.sh) waits for completion.

The [infrastructure workflow](/.github/workflows/infrastructure.yml) checks EditorConfig, shell
scripts, and Terraform lint before initialization, validation, and mock-provider tests. Only then
does it call the [deployment script](/scripts/tf-deploy.sh), which saves a plan and applies that
plan without interactive approval. A failed earlier step stops the apply. Mock tests check
configuration; they do not prove that real AWS calls or live DNS will succeed.

Both workflows use Mise's tool cache. The website also caches npm's download cache keyed by the
package lockfile; infrastructure caches Terraform providers keyed by the provider lockfile.
The YAML files own the exact step sequence, cache settings, environment variables, and secrets.
The [infrastructure reference](/docs/reference/infrastructure.md) describes the deployed resources
and workspace.

Each workflow has its own concurrency group, `website` or `infrastructure`, with
`cancel-in-progress: false`. A new run does not cancel an in-progress run in its group. The two
groups do not impose ordering between website and infrastructure deployments.

## Bootstrap and shared state

Website deployment reads the bucket and distribution IDs from Terraform outputs. Both deployment
recipes initialize Terraform before their scripts read those outputs. This means website
deployment needs access to the Terraform Cloud workspace as well as AWS, even when Terraform
resources have not changed.

Initial setup requires a successful infrastructure apply to populate those outputs. The website
workflow's documented bootstrap path is a manual run of `infrastructure.yml` before the first
website deployment. That manual run performs a real apply and needs the credentials and existing
hosted zone described in the [infrastructure change guide](/docs/how-to/change-infrastructure.md).

After bootstrap, workflow independence still matters. A push changing both domains starts
eligible workflows without a dependency between them. If the website needs outputs from an
infrastructure change, concurrent triggering does not guarantee that the apply finishes first.

## Local hooks and CI share recipes

The [justfile](/justfile) defines how build, lint, test, and deployment tasks execute. Local use,
Git hooks, and workflow `run` steps call those recipes; checkout, tool setup, and caching remain
GitHub Actions steps. [ADR 0007](/docs/decisions/0007-justfile-as-the-single-command-interface.md)
explains the shared command interface.

[`hk.pkl`](/hk.pkl) selects pre-commit checks by staged-file globs. EditorConfig runs without a
file filter; other checks, including the build and Terraform checks, run when their globs match.
The commit-message hook validates the message through `just lint-commit`. Hook installation is
part of [local setup](/docs/how-to/run-locally.md);
[ADR 0009](/docs/decisions/0009-use-hk-for-git-hook-management.md) explains hk's role.

CI invokes recipes directly, independently of local hook installation. Sharing recipe definitions
does not make check selection identical: Markdown lint is a local hook check, but neither delivery
workflow runs it. Hook globs and workflow path filters are separate configurations.

## Filtering limits

The workflows use `paths` allowlists. They document which changed files trigger each pipeline,
but an unlisted new source or configuration path can silently skip both workflows. The absence
of a run is not a passing check. Changes to shared build or deployment inputs need a review of
both allowlists. The website allowlist includes `justfile`, while `hk.pkl` remains outside both
workflow filters. `.mise.toml` is in both.

Each workflow includes its own YAML path. Editing that file triggers its push workflow only when
the branch and other event conditions also match; it does not bypass the `trunk` restriction.
Docs-only pushes normally trigger neither workflow. A documentation file under a matched directory,
such as `infrastructure/`, still matches that directory's filter.

GitHub also limits changed-file evaluation: path filters inspect up to 3,000 changed files. A
matching file outside that list can miss a run. For pushes with more than 1,000 commits, or when
GitHub times out generating the diff, workflows run without the normal path-filter result. See
[GitHub's path-filter documentation](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#git-diff-comparisons).

The [deployment verification guide](/docs/how-to/verify-deployment.md) shows how to compare a
specific push with the expected workflows and inspect the resulting runs.
