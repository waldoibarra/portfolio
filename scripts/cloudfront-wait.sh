#!/usr/bin/env bash
# Block destructive synchronization until CloudFront finishes deploying its configuration.
set -euo pipefail

DISTRIBUTION_ID=$(terraform -chdir=infrastructure output -raw cloudfront_distribution_id)
readonly DISTRIBUTION_ID

aws cloudfront wait distribution-deployed --id "${DISTRIBUTION_ID}"
