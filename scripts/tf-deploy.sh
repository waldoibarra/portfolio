#!/usr/bin/env bash
set -euo pipefail

terraform -chdir=infrastructure plan -out=tfplan
terraform -chdir=infrastructure apply -auto-approve tfplan
