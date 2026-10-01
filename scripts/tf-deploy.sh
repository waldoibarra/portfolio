#!/usr/bin/env bash
# Apply the saved plan only from the production CI deployment.
set -euo pipefail

bash scripts/require-ci.sh

if [[ ! -s infrastructure/tfplan ]]; then
  printf 'Missing infrastructure/tfplan; CI must create its plan before applying.\n' >&2
  exit 1
fi

terraform -chdir=infrastructure apply tfplan
rm -f infrastructure/tfplan
