# Verify a deployment

Verify the ordered deployment and the actual `/` and `/resume` responses. A successful build or
Terraform mock test does not establish that CloudFront is serving the intended objects.

## Review locally, deploy through CI

Complete the [infrastructure prerequisites](/docs/how-to/change-infrastructure.md#before-you-start),
then review the real plan from the repository root:

```sh
AWS_PROFILE=waldo TF_VAR_domain_name=waldo.love just tf-plan
```

Confirm the new certificate and DNS changes preserve the bucket, distribution, OAC, and workspace.
Stop on unexpected destruction, replacement, or unrelated drift. Registration and delegation
must be ready before a matching push or manual workflow dispatch on `trunk`.

Only CI applies Terraform and deploys production. It creates a fresh plan from its own checkout
and state, stages objects without deletion, applies that saved plan, waits for CloudFront,
syncs with deletion, and invalidates caches. The local plan file is a review artifact, not a
file CI consumes. Do not run production apply, upload, or recovery commands from a local shell.

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

Open both <https://waldo.love> and <https://www.waldo.love> in a browser:

- `/` renders the complete portfolio with its styles, fonts, and images.
- `/resume` renders the standalone résumé, not the homepage, with no redirect to an HTML path.
- Inspect the network panel: asset requests succeed and return their own content types, not HTML.
- A deliberately unknown path does not render the portfolio. The private S3 origin may return
  403 rather than 404; either is an error, not a homepage fallback.
- Confirm HTTPS and the expected content on both hostnames, then reload to check cached delivery.

Check valid TLS and HTTP 200 for `/` on both HTTPS hostnames; HTTP requests must upgrade to
HTTPS. Confirm deployed website links use the new domain. Existing email addresses are unchanged.

CloudFront's default root serves `home/index.html` for `/`; the viewer-request function rewrites
only `/resume` to `/resume/index.html`. `/resume/` and unknown paths are deliberately not aliases.
Direct object URLs such as `/resume/index.html` remain accessible through CloudFront.

## Recover a failed deployment

Inspect the failed Actions step and current Terraform state before retrying. Do not continue with
a deleting upload when apply or CloudFront propagation failed. Keep shared resource identities
and site content intact, review a corrective change or source revert locally, then deploy it
through CI's ordered sequence.

A source revert does not guarantee infrastructure recovery: a removed certificate may need
reissuance, and a deleted zone would require recreation and registrar delegation. Restoring
the retired website is not required. Downtime during the domain migration is acceptable;
there is no redirect or old-domain rollback guarantee.

After the new site passes these checks, follow the
[DNS retirement procedure](/docs/how-to/change-infrastructure.md#retire-unused-dns-and-renewal).
