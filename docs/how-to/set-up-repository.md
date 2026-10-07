# Set up the GitHub repository

Read this guide before publishing a checkout and configuring GitHub Actions. Read
[Set up a client site](/docs/how-to/set-up-client-site.md) before adapting the project for a
new website; its account isolation and infrastructure bootstrap are separate prerequisites.

## Prepare the checkout

1. Read [Run locally](/docs/how-to/run-locally.md) before installing the toolchain with `just setup`.
    Run `just build`, `just lint-ec`, and `just lint-md`.
2. Save the intended source and documentation changes in local Git commits on `trunk`. A push
    transfers committed files only. Keep `.env` and credentials out of Git.
3. Read [Configure deployment credentials](/docs/how-to/configure-deployment-credentials.md)
    before obtaining AWS keys, creating a Terraform token, and authenticating the GitHub CLI.
    Dotfiles may supply local environment variables or profiles; neither configures a GitHub runner.
4. Confirm the target AWS account and Terraform workspace. For an existing site, read
    [Change infrastructure](/docs/how-to/change-infrastructure.md) before reviewing a local plan.
    For this portfolio, use `AWS_PROFILE=waldo TF_VAR_domain_name=waldo.love just tf-plan`.
    Stop on unexpected replacement or deletion.

## Create and configure GitHub

Replace `OWNER/REPOSITORY` in the commands below with your GitHub owner and repository name.
For this portfolio, use `waldoibarra/portfolio`.

1. Create an empty repository under the intended owner. Do not initialize a README, license,
    or `.gitignore`. This portfolio is public; for a private client repository, check Actions
    billing and environment-protection availability. Keep Actions disabled during setup.
2. In Settings → Environments, create `production`. The current workflow needs no required
    reviewers or deployment-branch restrictions; it deploys only `trunk`. Add approval rules
    if the client's release policy requires them.
3. Read [Upload to GitHub](/docs/how-to/configure-deployment-credentials.md#upload-to-github-without-exposing-values)
    before adding `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `TF_TOKEN_APP_TERRAFORM_IO`
    to that environment. GitHub exposes secret names, not saved values.
4. Inspect the remote with `git remote -v`. If `origin` is missing, add it:

    ```sh
    git remote add origin git@github.com:OWNER/REPOSITORY.git
    ```

    If it already exists but points elsewhere, use `git remote set-url origin` with the intended
    URL instead. Leave it unchanged if it already matches. Push only the intended branch:

    ```sh
    git push origin trunk:trunk
    gh repo edit OWNER/REPOSITORY --default-branch trunk
    ```

    Do not use `git push --mirror`: it can publish unrelated local refs and backup history.
5. Configure Actions permissions. Allow `actions/checkout`, `actions/cache`, and `jdx/mise-action`,
    or allow all actions if that matches the repository policy. The workflow uses GitHub-hosted
    Ubuntu runners. Read-only repository contents permission is sufficient for checkout;
    write-default token permissions and PR-approval permission are not deployment requirements.
6. Protect `trunk`: require signed commits and linear history; disallow force pushes and deletion.
    Configure GitHub signing-key verification before enforcing signatures. Decide administrator
    bypass and required checks explicitly. This portfolio allows administrator bypass and has
    no required status checks. Its docs-only pushes do not normally run production CI.
7. For an existing site with reviewed state and available Terraform outputs, enable Actions and
    dispatch the deployment explicitly:

    ```sh
    gh workflow run website.yml --ref trunk --repo OWNER/REPOSITORY
    ```

    This runs a real production apply and upload. For a brand-new site, keep deployment disabled
    until the [bootstrap prerequisite](/docs/how-to/set-up-client-site.md#add-a-first-deployment-path)
    is implemented and approved; the normal workflow cannot initialize an empty environment.
8. Read [Verify a deployment](/docs/how-to/verify-deployment.md) before checking the run, hostnames,
    routes, and assets. Repository setup is not verified until a production run succeeds.

No repository variables, webhooks, custom runners, or GitHub Pages setup are required by the
current workflow. Configure optional About text, topics, and social preview separately.

## Connect existing infrastructure

For this portfolio, preserve organization `waldo-io`, workspace `waldoibarra-com`, and its state.
The workspace uses **local execution**: Terraform executes on the Actions runner and stores state
in Terraform Cloud. It has no GitHub VCS connection to configure.

Keep the bucket, distribution, OAC, hosted zone, and certificate identities. Read the
[infrastructure reference](/docs/reference/infrastructure.md) before changing them. A new GitHub
repository does not require new AWS resources or a fresh Terraform workspace.

With unchanged configuration and no infrastructure drift, expect a no-change plan. CI still
builds and uploads the website. The plan is a point-in-time check; CI generates its own plan
before applying. Bootstrap is only for a new site's empty environment, not an existing site
connected to a new repository.
