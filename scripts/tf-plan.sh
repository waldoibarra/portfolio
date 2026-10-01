#!/usr/bin/env bash
# Replace any old plan so a failed planning run cannot leave a stale apply target.
set -euo pipefail

rm -f infrastructure/tfplan
terraform -chdir=infrastructure plan -out=tfplan
