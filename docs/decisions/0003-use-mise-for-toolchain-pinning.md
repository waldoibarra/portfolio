---
status: accepted
date: 2026-05-05
decision-makers: Waldo Ibarra, Claude Opus 4.7
consulted: Gemini 3 Flash
---

# Use Mise for Toolchain Pinning

## Context and Problem Statement

The project needs deterministic, declarative version pins for Node, Terraform, AWS CLI, TFLint,
just, markdownlint-cli2, editorconfig-checker, and gh so that local development, CI, and pre-commit
hooks all run identical tool versions. The toolchain spans Node and non-Node binaries, so approaches
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

Chosen option: "Mise", because it meets all decision drivers with the lowest overhead among
cross-ecosystem options. It has first-class GitHub Actions support (`jdx/mise-action@v4`), TOML
config is human-readable and diff-friendly, and `_.file = ".env"` provides per-project env loading
without a separate dotenv tool. asdf is the closest alternative but Mise is more actively developed,
has faster shell activation, and includes built-in env file integration.

### Consequences

- Good, because a single config file pins all tools; reproducible across machines and CI
- Good, because cross-ecosystem (Node + Terraform + AWS CLI + binaries) works without orchestration
  glue
- Good, because `_.file = ".env"` provides per-project env loading without a separate dotenv tool
- Good, because fast activation, no VM or daemon
- Bad, because backend resolution (aqua/ubi/asdf) sometimes requires `mise registry show <tool>` to
  verify the canonical identifier when adding a new tool
- Bad, because contributors must install Mise once before they can use the project; documented in
  `README.md` and `docs/infrastructure.md`

### Confirmation

`.mise.toml` is the source of truth; `mise install` provisions the toolchain locally and
`jdx/mise-action@v4` does the same in CI. Drift between local and CI is impossible because both read
the same file. `infrastructure/versions.tf` `required_version` exact pin must match the `terraform`
value in `.mise.toml` (operational note in `docs/infrastructure.md`).

## Pros and Cons of the Options

### Mise

- Good, because single TOML config covers all tools across all ecosystems
- Good, because `jdx/mise-action@v4` provides identical toolchain in CI with no extra setup
- Good, because `_.file = ".env"` loads per-project environment variables automatically
- Good, because per-directory activation means different projects can have different tool versions
- Bad, because Mise is newer than asdf so plugin ecosystem and community are still maturing
- Bad, because tool backend resolution (which of aqua/ubi/asdf) is sometimes implicit and requires
  `mise registry show <tool>` to verify

### Docker / Devcontainers

- Good, because total isolation guarantees exact reproduction of the environment
- Bad, because Docker must also be installed locally, regressing on the "one tool to install" goal
- Bad, because image rebuilds are slow and CI caching is complex
- Bad, because host-tool integration (editor LSPs, git hooks) is poor — tools run inside the
  container, not on the host

### asdf

- Good, because mature plugin ecosystem with broad tool coverage
- Bad, because slower shell activation (Bash-based core, plugin-per-tool overhead)
- Bad, because no first-party env file integration; `.env` loading requires a separate plugin
- Bad, because Mise is a superset of asdf's capabilities with better performance and UX

### nvm + tfenv + manual installs

- Good, because each tool uses its own ecosystem-native version manager
- Bad, because there is no single declarative source of truth — versions are scattered across
  `.nvmrc`, `.terraform-version`, and ad-hoc install scripts
- Bad, because AWS CLI, TFLint, and other binaries require manual install scripts with no version
  pinning
- Bad, because drift between local and CI is invisible — a contributor on a different Node version
  may never notice until a CI failure

### Nix

- Good, because strongest reproducibility guarantees — hermetic, bit-for-bit identical
- Bad, because steep learning curve makes onboarding slow for contributors unfamiliar with Nix
- Bad, because macOS/Linux quirks add friction for a solo developer
- Bad, because overkill for a static-site portfolio toolchain whose total binary count is under 10

## More Information

- [Mise documentation](https://mise.jdx.dev)
- Re-visit trigger: if Mise becomes unmaintained or if a multi-architecture / hermetic build
  requirement emerges that Mise cannot satisfy, re-evaluate against Nix.
