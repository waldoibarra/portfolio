---
status: accepted
date: 2026-05-05
decision-makers: Waldo Ibarra, Claude Opus 4.7
consulted: Gemini 3 Flash
---

# Use Mise for Toolchain Pinning

## Context and Problem Statement

The project needs deterministic version pins for Node, Terraform, AWS CLI,
TFLint, and just.
It also pins markdownlint-cli2, editorconfig-checker, and gh.
Local development, CI, and pre-commit hooks must use identical tool versions.
The toolchain spans Node and non-Node binaries, so approaches
anchored to a single ecosystem are insufficient. Which toolchain manager should govern the project?

## Decision Drivers

- Reproducibility — same binary versions on every machine and CI runner
- Contributor onboarding speed — one command to provision the full toolchain
- CI parity — local `just check` and CI pipeline must use identical versions
- Declarative pinning — versions live in a versioned config file, not in install scripts
- Cross-ecosystem coverage — must handle Node, Terraform, AWS CLI, and arbitrary binaries
- Low overhead — no daemons, no VM, no per-project shell rebuild cost

## Considered Options

- Mise — declarative TOML config, cross-ecosystem, per-directory activation, GitHub Action available
- Docker / Devcontainers — container image pins everything; full isolation
- asdf — predecessor to Mise; plugin-based version manager with similar coverage
- nvm + tfenv + manual installs — one tool per ecosystem, glued together
- Nix — declarative, hermetic, reproducible across systems

## Decision Outcome

Chosen option: "Mise", because it meets the drivers with the lowest cross-ecosystem overhead.
It supports GitHub Actions through `jdx/mise-action@v4`.
Its human-readable TOML configuration is diff-friendly.
`_.file = ".env"` loads project variables without a separate dotenv tool.
asdf was the closest alternative.
Mise offered faster activation, more active development, and built-in env integration.

### Consequences

- Good, because a single config file pins all tools; reproducible across machines and CI
- Good, because cross-ecosystem (Node + Terraform + AWS CLI + binaries) works without orchestration
  glue
- Good, because `_.file = ".env"` provides per-project env loading without a separate dotenv tool
- Good, because fast activation, no VM or daemon
- Bad, because aqua/ubi/asdf backend resolution can require `mise registry show <tool>`.
  Run it to verify a new tool's canonical identifier.
- Bad, because contributors must install Mise once before they can use the project; documented in
  [Run locally](/docs/how-to/run-locally.md)

### Confirmation

`.mise.toml` is the source of truth.
`mise install` provisions locally; `jdx/mise-action@v4` uses the same file in CI.
This shared file prevents version-pin drift between local and CI.
`infrastructure/versions.tf` `required_version` exact pin must match the `terraform`
value in `.mise.toml` (see [infrastructure reference](/docs/reference/infrastructure.md)).

## Pros and Cons of the Options

### Mise

- Good, because single TOML config covers all tools across all ecosystems
- Good, because `jdx/mise-action@v4` provides identical toolchain in CI with no extra setup
- Good, because `_.file = ".env"` loads per-project environment variables automatically
- Good, because per-directory activation means different projects can have different tool versions
- Bad, because Mise is newer than asdf so plugin ecosystem and community are still maturing
- Bad, because aqua/ubi/asdf backend resolution can be implicit.
  Use `mise registry show <tool>` to verify it.

### Docker / Devcontainers

- Good, because total isolation guarantees exact reproduction of the environment
- Bad, because Docker must also be installed locally, regressing on the "one tool to install" goal
- Bad, because image rebuilds are slow and CI caching is complex
- Bad, because editor LSPs and Git hooks integrate poorly
  when tools run inside containers, not on hosts.

### asdf

- Good, because mature plugin ecosystem with broad tool coverage
- Bad, because slower shell activation (Bash-based core, plugin-per-tool overhead)
- Bad, because no first-party env file integration; `.env` loading requires a separate plugin
- Bad, because Mise is a superset of asdf's capabilities with better performance and UX

### nvm + tfenv + manual installs

- Good, because each tool uses its own ecosystem-native version manager
- Bad, because versions scatter across `.nvmrc`, `.terraform-version`,
  and ad-hoc scripts without one declarative source.
- Bad, because AWS CLI, TFLint, and other binaries require manual install scripts with no version
  pinning
- Bad, because a contributor's different Node version may cause invisible local/CI drift until CI fails.

### Nix

- Good, because strongest reproducibility guarantees — hermetic, bit-for-bit identical
- Bad, because steep learning curve makes onboarding slow for contributors unfamiliar with Nix
- Bad, because macOS/Linux quirks add friction for a solo developer
- Bad, because overkill for a static-site portfolio toolchain whose total binary count is under 10

## More Information

- [Mise documentation](https://mise.jdx.dev)
- Re-visit trigger: compare Nix if Mise becomes unmaintained.
  Also compare Nix if Mise cannot satisfy a new multi-architecture or hermetic build requirement.
