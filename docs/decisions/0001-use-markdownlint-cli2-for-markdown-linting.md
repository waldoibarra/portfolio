---
status: accepted
date: 2026-05-04
decision-makers: Waldo Ibarra, Claude Opus 4.7
---

# Use markdownlint-cli2 for Markdown Linting

## Context and Problem Statement

The project's ADR files, root `README.md`, and root `AGENTS.md`
must remain structurally consistent Markdown. At the time, no tool enforced Markdown formatting.
Structural issues could accumulate silently: inconsistent headings, missing blank lines,
and trailing whitespace.

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

- Its author also maintains the `markdownlint` library.
  At the decision's time, `markdownlint-cli` was in maintenance mode.
- Configuration is file-based (`config/.markdownlint-cli2.yaml`) and supports YAML comments.
  Those comments explain rule choices, including line-length rationale and template ignores.
- Glob patterns and ignore rules live in the config file.
  The lint scope is self-documenting, without a separate `.markdownlintignore`.
- `gitignore: true` integration automatically skips `node_modules/`, `dist/`, etc.
- Built-in `frontMatter` regex support handles ADR YAML frontmatter,
  including `status: superseded by ADR-0007`.
- `remark-lint` has a heavier unified dependency tree.
  Its rules and philosophy differ from the widely-known MDxxx convention.
- Prettier formats rather than lints.
  It silently rewrites files instead of reporting duplicate headings or missing blank lines.

### Consequences

- Good, because ADR structure, README formatting, and AGENTS.md style are checked automatically
  before every commit.
- Good, because Mise (`.mise.toml`) manages `markdownlint-cli2` alongside standalone tools like `tflint`.
  It adds no `npm` devDependency or separate version pin.
- Good, because lint scope is comprehensive: every `.md` file in the repository is checked. Only
  `LICENSE.md` is excluded via `ignores` (standard license text, no h1 heading).
- Good, because omitting a CI lint workflow was deliberate.
  For a solo developer on trunk, the pre-commit hook provided enforcement.
  CI would have added maintenance overhead with negligible payoff.
- Bad, because GitHub web edits and `--no-verify` commits bypass the pre-commit hook.
  The project accepted that risk.
- Bad, because new `.md` files must comply with lint rules.
  Otherwise, they need a specific inline `markdownlint-disable` comment.
