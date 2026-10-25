---
status: accepted
date: 2026-05-04
decision-makers: Waldo Ibarra, Claude Opus 4.7
consulted: Gemini 3 Flash
---

# Enforce Editorconfig Rules with editorconfig-checker

## Context and Problem Statement

The project's `.editorconfig` defines whitespace, final newlines, indentation, line endings, and charset.
At the time, nothing verified committed files against it.
LLM-generated and manual edits can violate these rules.
Examples include trailing spaces, missing final newlines, and inconsistent indentation.
Without enforcement, `.editorconfig` is purely advisory
and violations accumulate silently.

## Considered Options

- [editorconfig-checker](https://github.com/editorconfig-checker/editorconfig-checker) — standalone
  Go binary that verifies files match `.editorconfig` rules
- [eclint](https://github.com/jedmao/eclint) — Node.js-based editorconfig checker
- No enforcement — rely on editor compliance and manual review

## Decision Outcome

Chosen option: "editorconfig-checker", because

- It is the standard tool for this purpose — purpose-built, fast, and well-maintained.
- It is a compiled Go binary without a Node.js dependency.
  Mise manages it alongside `tflint` and `markdownlint-cli2`, following the standalone-tool pattern.
- `eclint` was less maintained and slower because it used Node.
  It added an npm dependency tree for a task one binary could handle.
- No enforcement means `.editorconfig` is decorative — violations will accumulate, particularly
  from LLM-generated diffs that ignore editor settings.

### Consequences

- Good, because commits are checked for whitespace, final newlines, indentation, charset, and line endings.
  This catches violations introduced by LLMs or manual edits.
- Good, because Mise (`.mise.toml`) manages `editorconfig-checker` alongside `tflint` and `markdownlint-cli2`.
  It adds no npm devDependency or separate version pin.
- Good, because `max_line_length = off` avoids overlapping checks for `*.md` and `.tftest.hcl`.
  markdownlint-cli2 checks Markdown line length.
  Terraform test assertions cannot be meaningfully wrapped.
- Good, because ESLint owns `quote_type` enforcement (`quotes: ['error', 'single']`).
  `editorconfig-checker` does not support non-standard `.editorconfig` properties.
  The `quote_type` section was removed from `.editorconfig`.
- Good, because omitting a CI workflow was deliberate.
  For a solo developer on trunk, the pre-commit hook provided enforcement.
  CI would have added maintenance overhead with negligible payoff.
- Bad, because GitHub web edits and `--no-verify` commits bypass the pre-commit hook.
  The project accepted that risk.
