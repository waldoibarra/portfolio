#!/usr/bin/env bash
# Prepare a checkout without requiring cloud credentials or overwriting local configuration.
set -euo pipefail

if [[ ! -f .env ]]; then
  cp .env.example .env
fi
just install-tools
mise exec -- just install-node-deps
mise exec -- just install-hooks
