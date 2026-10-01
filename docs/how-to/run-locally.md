# Run the portfolio locally

Read this guide before starting the Vite development server or setting up a new checkout.
You need Git and [Mise](https://mise.jdx.dev/getting-started.html), with
[Mise activated in your shell](https://mise.jdx.dev/getting-started.html#activate-mise).

## Set up the checkout

1. Clone the repository, then enter its root directory:

    ```sh
    git clone https://github.com/waldoibarra/portfolio.git
    cd portfolio
    ```

2. If `just` is not installed yet, bootstrap it through Mise:

    ```sh
    mise trust
    mise install just
    ```

3. Set up the tools, Node dependencies, local environment file, and Git hooks:

    ```sh
    just setup
    ```

    Setup preserves an existing `.env`. Leave the Terraform token empty for frontend-only work;
    neither setup nor the development server needs AWS credentials. Never commit credentials.
    Read [Change infrastructure](/docs/how-to/change-infrastructure.md) before configuring cloud
    access. Exact tool versions live in [.mise.toml](/.mise.toml) and [package.json](/package.json).

## Start and verify

1. Start the development server:

    ```sh
    just run
    ```

2. Open the local URL printed by Vite, normally <http://localhost:5173>. `/` renders the landing
    page from `src/home/index.html`; `/resume` serves the standalone `public/resume/index.html`.
    Both work without JavaScript. Direct navigation and refresh use the same route mappings.
3. Stop the server with `Ctrl+C` when you finish.
4. Build and preview the production artifact:

    ```sh
    just build
    just preview
    ```

    A successful build writes `dist/home/index.html`, `dist/resume/index.html`, and assets.
    `just preview` serves that directory with the same `/` and `/resume` mappings as development.
    Open both routes at the printed local URL, then stop the server with `Ctrl+C`.

## Edit homepage metadata

1. With `just run` active and the homepage open, edit
    [`src/home/metadata.json`](/src/home/metadata.json). This is the single source for the title,
    description, author, canonical URL, and Open Graph/Twitter sharing metadata.
2. Save the JSON. Vite triggers a full-page browser reload; you do not need to restart the server.
    Check the page title and the document's initial HTML response for the changed values.
3. To check the production output, stop development and run `just build`, then `just preview`.
    The generated tags are in `dist/home/index.html`, not set by runtime JavaScript.

Keep charset, viewport, stylesheet, and favicon declarations in
[`src/home/index.html`](/src/home/index.html). Read the
[homepage metadata reference](/docs/reference/homepage-metadata.md) before changing field names
or the sharing image; JSON edits do not regenerate the image.
For live sharing checks, see [Verify a deployment](/docs/how-to/verify-deployment.md#check-sharing-previews).

## Choose the next task

- Read [Implement the landing design](/docs/how-to/implement-landing-design.md) before translating
  an approved design change into the native implementation.
- Read [Delivery model](/docs/explanation/delivery.md) before changing checks or workflows.
- Use `just --list` for the command list. `just check` still includes Terraform initialization
  and tests, so it requires the [infrastructure setup](/docs/how-to/change-infrastructure.md).
