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

2. Create the local environment file if it does not already exist:

    ```sh
    test -f .env || cp .env.example .env
    ```

    Mise loads this file. Leave the Terraform token empty for frontend-only work; never commit
    credentials. Read [Change infrastructure](/docs/how-to/change-infrastructure.md) before
    configuring cloud access.

3. Trust the checkout and install the toolchain before using `just` for the first time:

    ```sh
    mise trust
    mise install
    ```

4. Install the Node dependencies and Git hooks:

    ```sh
    just install-node-deps
    just install-hooks
    ```

    For later setup runs, `just install` combines toolchain, dependency, and hook installation.
    Exact tool versions live in [.mise.toml](/.mise.toml) and [package.json](/package.json).

## Start and verify

1. Start the development server:

    ```sh
    just run
    ```

2. Open the local URL printed by Vite, normally <http://localhost:5173>. The rendered landing
    presents Waldo's software services, production results, and LinkedIn inquiry action. Its
    content works without JavaScript.
3. Stop the server with `Ctrl+C` when you finish.
4. Build and preview the production artifact:

    ```sh
    just build
    just preview
    ```

    A successful build writes the static site to `dist/`. `just preview` serves that directory
    through Vite's production preview server. Open the printed local URL, then stop the server
    with `Ctrl+C`.

## Choose the next task

- Read [Implement the landing design](/docs/how-to/implement-landing-design.md) before translating
  an approved design change into the native implementation.
- Read [Delivery model](/docs/explanation/delivery.md) before changing checks or workflows.
- Use `just --list` for the command list. `just check` still includes Terraform initialization
  and tests, so it requires the [infrastructure setup](/docs/how-to/change-infrastructure.md).
