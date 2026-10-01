#!/usr/bin/env bash
# Save the live artifact and distribution configuration before a same-resource cutover.
set -euo pipefail
umask 077

BACKUP_DIR=${1:?Usage: deploy-backup.sh NEW_DIRECTORY}
readonly BACKUP_DIR
S3_BUCKET_ID=$(terraform -chdir=infrastructure output -raw s3_bucket_id)
readonly S3_BUCKET_ID
DISTRIBUTION_ID=$(terraform -chdir=infrastructure output -raw cloudfront_distribution_id)
readonly DISTRIBUTION_ID

# Refuse an existing destination so a later backup cannot overwrite the recovery point.
mkdir "${BACKUP_DIR}"
printf '%s\n' "${S3_BUCKET_ID}" > "${BACKUP_DIR}/bucket-id"
printf '%s\n' "${DISTRIBUTION_ID}" > "${BACKUP_DIR}/distribution-id"
aws cloudfront wait distribution-deployed --id "${DISTRIBUTION_ID}"
aws cloudfront get-distribution-config --id "${DISTRIBUTION_ID}" \
  --query DistributionConfig --output json > "${BACKUP_DIR}/cloudfront.json"
aws s3 sync "s3://${S3_BUCKET_ID}" "${BACKUP_DIR}/dist"
touch "${BACKUP_DIR}/complete"
printf 'Recovery snapshot saved to %s\n' "${BACKUP_DIR}"
