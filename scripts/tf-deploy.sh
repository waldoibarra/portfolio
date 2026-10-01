#!/usr/bin/env bash
# Apply only the saved infrastructure plan that was checked and reviewed.
set -euo pipefail

if [[ ! -s infrastructure/tfplan ]]; then
  printf 'Missing infrastructure/tfplan; run just tf-plan and review it first.\n' >&2
  exit 1
fi

terraform -chdir=infrastructure apply tfplan
rm -f infrastructure/tfplan
