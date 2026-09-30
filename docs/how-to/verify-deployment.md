# Verify a deployment

Check whether a push triggered the expected GitHub Actions workflows, then inspect their results
and the deployed site. These checks do not start a deployment.

## Before you start

Complete the [local setup](/docs/how-to/run-locally.md) to install the pinned GitHub CLI (`gh`).
Authenticate `gh` with an account that can read this repository's Actions runs. Run the examples
from the repository root so `gh` selects the correct repository. Build, lint, and deployment tasks
use [just recipes](/justfile); `gh` is used here to inspect GitHub.

Identify the full commit SHA at the tip of the push you want to inspect. Use that SHA, not the
commit title or the latest run, to avoid mixing results from different pushes.

## Find the runs for the push

Replace `COMMIT_SHA` with that full SHA:

```sh
gh run list --branch trunk --event push --commit COMMIT_SHA --limit 20 \
  --json databaseId,workflowName,headSha,status,conclusion,url
```

Each result's `databaseId` is the workflow **run ID**, not a job ID, workflow ID, or run number.
Use it as `RUN_ID` in the commands below. If both workflows ran, inspect both IDs.

The current path filters predict these results for pushes to `trunk`:

| Changed paths in the push | Expected runs |
| --- | --- |
| Only `README.md` or `docs/**` | Neither workflow |
| Only `src/**` or `public/**` | Website only |
| Only `infrastructure/**` or `scripts/tf-deploy.sh` | Infrastructure only |
| Both website and infrastructure paths | Both workflows |
| `.mise.toml` | Both workflows |
| Only one workflow's YAML | That workflow only |
| Only `justfile`, `hk.pkl`, `.editorconfig`, or `.gitignore` | Neither workflow |

Use the actual `paths` lists in
[`website.yml`](/.github/workflows/website.yml) and
[`infrastructure.yml`](/.github/workflows/infrastructure.yml) for all other paths. The filters
apply to the push's changed files, which can span more than one commit. A branch other than
`trunk` does not trigger either push workflow.

A path-filtered workflow has no run to watch; do not expect a completed run with a `skipped`
conclusion. An empty result alone does not prove correct filtering. If a run is expected, allow
for GitHub scheduling, repeat the query, and check the pushed SHA, branch, repository, and workflow
configuration. New files outside the allowlists can silently miss CI; see
[filtering limits](/docs/explanation/delivery.md#filtering-limits).

For a manually dispatched run, use the same query with `--event workflow_dispatch`. Manual runs
are not evidence that push path filters worked. Dispatching either workflow deploys to production;
do not dispatch one merely to test this guide.

## Inspect the result

For a run still in progress, replace `RUN_ID` with its `databaseId` and watch it:

```sh
gh run watch RUN_ID --exit-status
```

The command waits for completion and returns a nonzero status if the run fails. GitHub CLI does
not support `run watch` with a fine-grained personal access token; use supported authentication
or inspect the run in the browser.

Inspect the final status and conclusion, including runs that were already complete:

```sh
gh run view RUN_ID --json status,conclusion,url
gh run view RUN_ID --verbose
```

Require `status` to be `completed` and `conclusion` to be `success`. A queued, cancelled, or failed
run is not a successful deployment. If it failed, read the failing step's log:

```sh
gh run view RUN_ID --log-failed
```

For website deployment, confirm that upload and cache invalidation succeeded. The invalidation
script waits for CloudFront to report completion. For infrastructure, confirm that the apply
step succeeded, not just validation or the mock tests. If both workflows ran, their execution is
independent; success in one does not establish success in the other.

## Check the deployed site

After a successful website run, open <https://waldoibarra.com> and
<https://www.waldoibarra.com> in a browser. Confirm HTTPS works and the expected change is visible.
For infrastructure-only changes, check the affected behavior, such as domain resolution or
certificate delivery. A successful workflow does not establish that the live site behaves as
intended.

If the website deploy failed because Terraform outputs are missing, follow the bootstrap
requirements in [how delivery works](/docs/explanation/delivery.md#bootstrap-and-shared-state).
Do not rerun a deployment until you understand the failed step.
