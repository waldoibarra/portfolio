#!/bin/bash
set -euo pipefail

DISTRIBUTION_ID=$(terraform -chdir=infrastructure output -raw cloudfront_distribution_id)

INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "Created invalidation: ${INVALIDATION_ID}"

aws cloudfront wait invalidation-completed \
  --distribution-id "$DISTRIBUTION_ID" \
  --id "$INVALIDATION_ID"

echo "Invalidation ${INVALIDATION_ID} completed."
