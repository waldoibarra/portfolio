# Waldo's Portfolio

A live software-architecture portfolio backed by its frontend, AWS infrastructure,
delivery automation, and engineering decisions.

## Live site

[Open the portfolio](https://waldo.love).

## Engineering proof

- **Semantic without JavaScript:** the landing page uses semantic HTML and native CSS.
  Its content needs neither client-side JavaScript nor a frontend runtime.
- **Infrastructure in code:** custom Terraform defines the AWS deployment.
  CloudFront Origin Access Control serves its private S3 origin.
- **Repeatable delivery:** Mise pins the toolchain, and `just` provides the command interface.
  One ordered GitHub Actions workflow deploys website artifacts and infrastructure together.
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

- [Architecture](https://github.com/waldoibarra/portfolio/blob/trunk/architecture.md)
- [Portfolio language](https://github.com/waldoibarra/portfolio/blob/trunk/GLOSSARY.md)
- [Run locally](https://github.com/waldoibarra/portfolio/blob/trunk/docs/how-to/run-locally.md)
- [Documentation](https://github.com/waldoibarra/portfolio/blob/trunk/docs/README.md)
- [Decision records](https://github.com/waldoibarra/portfolio/tree/trunk/docs/decisions)

## License

[MIT](https://github.com/waldoibarra/portfolio/blob/trunk/LICENSE.md)
