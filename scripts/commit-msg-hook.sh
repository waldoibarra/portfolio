#!/usr/bin/env bash

set -e

echo "Running commit message linter."
just lint-commit "${1}"
