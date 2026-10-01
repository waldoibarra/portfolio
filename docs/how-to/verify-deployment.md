# Verify a deployment

Verify the ordered deployment and the actual `/` and `/resume` responses. A successful build or
Terraform mock test does not establish that CloudFront is serving the intended objects.

## Reviewed local rollout

Use the [local setup](/docs/how-to/run-locally.md) and
[infrastructure prerequisites](/docs/how-to/change-infrastructure.md#before-you-start). Run from
the repository root with the production AWS and Terraform Cloud credentials. Stop other local
operators and wait for any production Actions run before starting; local commands are not covered
by GitHub's concurrency lock. Do not push or dispatch another deployment during this sequence.

1. Build and check the exact source to deploy:

    ```sh
    just lint
    just build
    just tf-check
    ```

    `tf-check` includes `just test-routes`, which executes the production viewer-request function
    against route, asset, and unknown-path cases locally. None of these commands deploys.
2. Save a recoverable copy of the current site outside the repository. Choose a new directory;
    the backup command refuses an existing destination:

    ```sh
    just deploy-backup /tmp/portfolio-before-routing
    ```

    Keep this directory until production verification succeeds. It contains the live S3 artifact,
    bucket/distribution IDs, and the exact CloudFront distribution configuration. A `complete`
    marker is written only after every capture succeeds. This is a same-resource rollback point,
    not a backup of DNS, certificates, bucket policies, or CloudFront Function code.
3. Save and review the real plan:

    ```sh
    just tf-plan
    ```

    Inspect every change in the printed plan. The homepage cutover must set the default root to
    `home/index.html` and associate the `/resume` viewer-request rewrite without replacing the
    bucket or distribution. Stop on unexpected destruction, replacement, or unrelated drift.
    Do not modify source, `dist/`, or Terraform configuration after this review.
4. Apply that saved plan using the safe transaction:

    ```sh
    just deploy-reviewed
    ```

    This stages without deletion, applies `infrastructure/tfplan`, waits for CloudFront `Deployed`,
    synchronizes with deletion, then invalidates `/*` and waits for completion. A failure stops
    the remaining steps. The plan is consumed after a successful apply. Do not resume with a
    deleting upload if the apply or CloudFront waiter failed; diagnose and re-plan, or roll back.

For an unattended checked rollout, `just deploy` builds, checks infrastructure, creates the saved
plan, and runs the same transaction without a review pause. This is the CI path and mutates
production. Low-level `just tf-apply` also applies the saved plan without an approval prompt; it
is not the safe route/layout rollout by itself.

## Find the Actions run for a push

Authenticate the pinned GitHub CLI with an account that can read the repository. Replace
`COMMIT_SHA` with the full tip SHA of the push, rather than using a title or the latest run:

```sh
gh run list --branch trunk --event push --commit COMMIT_SHA --limit 20 \
  --json databaseId,workflowName,headSha,status,conclusion,url
```

The single **Production CI/CD** workflow lives in
[`website.yml`](/.github/workflows/website.yml). There is no independent infrastructure deployment.

| Changed paths in the push | Expected runs |
| --- | --- |
| Only `README.md` or `docs/**` | None |
| `src/**`, `public/**`, or `infrastructure/**` | Production CI/CD |
| `scripts/**`, `justfile`, `.mise.toml`, or `website.yml` | Production CI/CD |
| Both website and infrastructure paths | One Production CI/CD run |
| Only `hk.pkl`, `.editorconfig`, or `.gitignore` | None |

Use the YAML's actual `paths` list for other inputs. The filter evaluates all changed files in the
push, not only the tip commit. Only `trunk` pushes deploy. No run is not evidence of a passing
check: confirm the branch, SHA, repository, scheduling, and allowlist. See
[filtering limits](/docs/explanation/delivery.md#filtering-limits).

For manual runs, use `--event workflow_dispatch`. Dispatching the workflow deploys to production;
it is not a way to test filtering or this guide.

## Inspect the result

Use the result's `databaseId` as `RUN_ID` (not a job ID or run number):

```sh
gh run watch RUN_ID --exit-status
gh run view RUN_ID --json status,conclusion,url
gh run view RUN_ID --verbose
```

Require `completed` and `success`. For failure details:

```sh
gh run view RUN_ID --log-failed
```

Confirm the `just deploy` log completed staging, saved-plan apply, the CloudFront distribution
waiter, deleting sync, and completed invalidation, in that order. Passing lint or mock tests alone
is not a deployment. `gh run watch` does not support fine-grained personal access tokens; use
supported authentication or the browser.

## Check the deployed routes

Open both <https://waldoibarra.com> and <https://www.waldoibarra.com> in a browser:

- `/` renders the complete portfolio with its styles, fonts, and images.
- `/resume` renders the standalone résumé, not the homepage, with no redirect to an HTML path.
- Inspect the network panel: asset requests succeed and return their own content types, not HTML.
- A deliberately unknown path does not render the portfolio. The private S3 origin may return
  403 rather than 404; either is an error, not a homepage fallback.
- Confirm HTTPS and the expected content on both hostnames, then reload to check cached delivery.

CloudFront's default root serves `home/index.html` for `/`; the viewer-request function rewrites
only `/resume` to `/resume/index.html`. `/resume/` and unknown paths are deliberately not aliases.
Direct object URLs such as `/resume/index.html` remain accessible through CloudFront.

## Roll back the same-resource route cutover

If live verification fails, keep deployment automation idle and restore the captured snapshot:

```sh
just deploy-rollback /tmp/portfolio-before-routing
```

The recipe stages the old artifact without deletion, restores the saved distribution configuration
using its current ETag, waits for CloudFront `Deployed`, removes objects absent from the snapshot,
and invalidates `/*` with a completion wait. An incomplete backup is rejected. Verify the old
homepage and its assets on both hostnames; `/resume` need not exist in the previous release.

This emergency rollback updates CloudFront directly, leaving Terraform's desired configuration
unreconciled. Before another deployment, restore the intended known-good frontend and routing
source, retain the safe deployment recipes/workflow, and run `just build`, `just tf-check`, and
`just tf-plan` again. Review the refreshed plan so it does not silently reintroduce the failed
cutover. Do not reuse the consumed forward plan. The snapshot does not restore replaced/deleted
AWS resources or earlier code at an unchanged CloudFront Function ARN; use a separately reviewed
infrastructure recovery for those changes.
