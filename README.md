# Waldo's Portfolio

A live software-architecture portfolio backed by the frontend, AWS infrastructure, delivery
automation, and engineering decisions that run it.

## Live site

[Open the portfolio](https://waldo.love).

## Engineering proof

- **Semantic without JavaScript:** the landing page uses semantic HTML and native CSS; its content
  does not depend on client-side JavaScript or a frontend runtime.
- **Infrastructure in code:** custom Terraform defines the AWS deployment, including a private S3
  origin served through CloudFront Origin Access Control.
- **Repeatable delivery:** Mise pins the toolchain, `just` provides the command interface, and
  one ordered GitHub Actions workflow deploys website artifacts and infrastructure together.
- **Recorded decisions:** architectural decision records preserve alternatives, tradeoffs, and
  decision status.

## Run locally

With Mise activated and `just` available, run:

```sh
just setup
just run
```

Open the URL printed by Vite. See [local setup](docs/how-to/run-locally.md) for first-time
tool installation. Frontend development needs no AWS credentials.

## Explore the repository

- [Architecture](https://github.com/waldoibarra/portfolio/blob/trunk/ARCHITECTURE.md)
- [Run locally](https://github.com/waldoibarra/portfolio/blob/trunk/docs/how-to/run-locally.md)
- [Documentation](https://github.com/waldoibarra/portfolio/blob/trunk/docs/README.md)
- [Decision records](https://github.com/waldoibarra/portfolio/tree/trunk/docs/decisions)

## License

[MIT](https://github.com/waldoibarra/portfolio/blob/trunk/LICENSE.md)
