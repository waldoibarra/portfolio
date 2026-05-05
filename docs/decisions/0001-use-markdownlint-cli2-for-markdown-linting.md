---
status: accepted
date: 2026-05-04
decision-makers: Waldo Ibarra, Claude Opus 4.7
---

# Use markdownlint-cli2 for Markdown Linting

## Context and Problem Statement

The project has ADR files in `docs/decisions/`, a root `README.md`, and a root `AGENTS.md` — all
Markdown that must stay structurally consistent. There is currently no tool to enforce Markdown
formatting, so structural issues (inconsistent heading styles, missing blank lines, trailing
whitespace) can accumulate silently.

## Considered Options

- [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) — configuration-first CLI
  wrapping the `markdownlint` library, by the library's author
- [markdownlint-cli](https://github.com/igorshubovych/markdownlint-cli) — the original CLI wrapping
  `markdownlint`, flag-driven configuration
- [remark-lint](https://github.com/remarkjs/remark-lint) — plugin-based linter in the
  unified/remark ecosystem
- [Prettier](https://prettier.io/) (Markdown formatting) — auto-formatter that rewrites files
  rather than reporting problems

## Decision Outcome

Chosen option: "markdownlint-cli2", because

- It is actively maintained by the same author as the `markdownlint` library, while
  `markdownlint-cli` is in maintenance mode.
- Configuration is file-based (`.markdownlint-cli2.yaml`), supporting YAML comments — essential for
  explaining _why_ specific rules are configured (e.g., line-length rationale, template ignores).
- Glob patterns and ignore rules live in the config file, making the lint scope self-documenting —
  no separate `.markdownlintignore` needed.
- `gitignore: true` integration automatically skips `node_modules/`, `dist/`, etc.
- Built-in `frontMatter` regex support handles YAML frontmatter in ADR files (e.g., `status:
  superseded by ADR-0007`).
- `remark-lint` is heavier (unified ecosystem dependency tree) and its rule names/philosophy differ
  from the widely-known MDxxx convention.
- Prettier is a formatter, not a linter — it rewrites files silently instead of reporting
  structural problems like duplicate headings or missing blank lines.

### Consequences

- Good, because ADR structure, README formatting, and AGENTS.md style are checked automatically
  before every commit.
- Good, because `markdownlint-cli2` is managed via Mise (`.mise.toml`), consistent with how the
  project pins standalone dev tools like `tflint` — no `npm` devDependency, no version drift.
- Good, because lint scope is comprehensive: every `.md` file in the repository is checked. Only
  `LICENSE.md` is excluded via `ignores` (standard license text, no h1 heading).
- Good, because the decision _not_ to add a CI workflow is deliberate: trunk-based development by a
  solo developer means the pre-commit hook is the enforcement point, and CI would add maintenance
  overhead with negligible payoff.
- Bad, because GitHub web edits or `--no-verify` commits bypass the pre-commit hook — acceptable
  given this project's risk profile.
- Bad, because every new `.md` file must comply with the lint rules or receive a specific inline
  `markdownlint-disable` comment.
