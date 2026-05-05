---
status: accepted
date: 2026-05-04
decision-makers: Waldo Ibarra, Claude Opus 4.7
consulted: Gemini 3 Flash
---

# Enforce Editorconfig Rules with editorconfig-checker

## Context and Problem Statement

The project has an `.editorconfig` that defines trailing whitespace, final newlines, indentation
style, line endings, and charset — but nothing verifies that committed files actually comply.
LLM-generated edits (and manual ones) frequently violate these rules: trailing spaces, missing
final newlines, inconsistent indentation. Without enforcement, `.editorconfig` is purely advisory
and violations accumulate silently.

## Considered Options

- [editorconfig-checker](https://github.com/editorconfig-checker/editorconfig-checker) — standalone
  Go binary that verifies files match `.editorconfig` rules
- [eclint](https://github.com/jedmao/eclint) — Node.js-based editorconfig checker
- No enforcement — rely on editor compliance and manual review

## Decision Outcome

Chosen option: "editorconfig-checker", because

- It is the standard tool for this purpose — purpose-built, fast, and well-maintained.
- It is a compiled Go binary with no Node.js dependency, managed via Mise alongside `tflint` and
  `markdownlint-cli2` — consistent with the project's pattern for standalone dev tools.
- `eclint` is less maintained, slower (Node-based), and adds an unnecessary npm dependency tree for
  a task a single binary can do.
- No enforcement means `.editorconfig` is decorative — violations will accumulate, particularly
  from LLM-generated diffs that ignore editor settings.

### Consequences

- Good, because every commit is checked for trailing whitespace, final newlines, indentation style,
  charset, and line endings — catching violations that LLMs and manual edits commonly introduce.
- Good, because `editorconfig-checker` is managed via Mise (`.mise.toml`), consistent with how
  `tflint` and `markdownlint-cli2` are pinned — no npm devDependency, no version drift.
- Good, because `max_line_length = off` for `*.md` and `.tftest.hcl` avoids overlap:
  markdownlint-cli2 already enforces line length in Markdown, and Terraform test assertions cannot
  be meaningfully wrapped.
- Good, because `quote_type` enforcement is deliberately left to ESLint (`quotes: ['error',
  'single']`), since `editorconfig-checker` does not support non-standard `.editorconfig` properties.
  The `quote_type` section has been removed from `.editorconfig`.
- Good, because the decision _not_ to add a CI workflow is deliberate: trunk-based development by a
  solo developer means the pre-commit hook is the enforcement point, and CI would add maintenance
  overhead with negligible payoff.
- Bad, because GitHub web edits or `--no-verify` commits bypass the pre-commit hook — acceptable
  given this project's risk profile.
