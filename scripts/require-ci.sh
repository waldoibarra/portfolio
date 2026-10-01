#!/usr/bin/env bash
# Reject local and non-production deployment entrypoints before any side effects.
set -euo pipefail

if [[ "${GITHUB_ACTIONS:-}" != true || "${GITHUB_REF:-}" != refs/heads/trunk ]]; then
  printf 'Deploy only in GitHub Actions on trunk; review locally with just tf-plan.\n' >&2
  exit 1
fi
