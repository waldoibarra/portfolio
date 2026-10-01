#!/usr/bin/env bash
# Restore a complete same-resource snapshot, keeping both artifacts until edges switch back.
set -euo pipefail

BACKUP_DIR=${1:?Usage: deploy-rollback.sh BACKUP_DIRECTORY}
readonly BACKUP_DIR
if [[ ! -f "${BACKUP_DIR}/complete" ]]; then
  printf 'Backup is incomplete: %s\n' "${BACKUP_DIR}" >&2
  exit 1
fi
if [[ ! -f "${BACKUP_DIR}/dist/index.html" && ! -f "${BACKUP_DIR}/dist/home/index.html" ]]; then
  printf 'Backup has no homepage: %s\n' "${BACKUP_DIR}" >&2
  exit 1
fi
S3_BUCKET_ID=$(< "${BACKUP_DIR}/bucket-id")
readonly S3_BUCKET_ID
DISTRIBUTION_ID=$(< "${BACKUP_DIR}/distribution-id")
readonly DISTRIBUTION_ID

aws s3 sync "${BACKUP_DIR}/dist" "s3://${S3_BUCKET_ID}"
DISTRIBUTION_ETAG=$(aws cloudfront get-distribution-config --id "${DISTRIBUTION_ID}" \
  --query ETag --output text)
readonly DISTRIBUTION_ETAG
aws cloudfront update-distribution --id "${DISTRIBUTION_ID}" \
  --if-match "${DISTRIBUTION_ETAG}" --distribution-config "file://${BACKUP_DIR}/cloudfront.json"
aws cloudfront wait distribution-deployed --id "${DISTRIBUTION_ID}"
aws s3 sync "${BACKUP_DIR}/dist" "s3://${S3_BUCKET_ID}" --delete
INVALIDATION_ID=$(aws cloudfront create-invalidation --distribution-id "${DISTRIBUTION_ID}" \
  --paths '/*' --query Invalidation.Id --output text)
readonly INVALIDATION_ID
aws cloudfront wait invalidation-completed --distribution-id "${DISTRIBUTION_ID}" \
  --id "${INVALIDATION_ID}"
printf 'Rollback complete. Reconcile Terraform configuration before the next deployment.\n'
