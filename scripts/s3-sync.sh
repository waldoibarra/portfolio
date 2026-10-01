#!/usr/bin/env bash
# Stage the artifact, or remove obsolete objects after CloudFront has deployed.
set -euo pipefail

if [[ ! -f dist/home/index.html || ! -f dist/resume/index.html ]]; then
  printf 'Missing built homepage or resume; run just build before uploading.\n' >&2
  exit 1
fi

S3_BUCKET_ID=$(terraform -chdir=infrastructure output -raw s3_bucket_id)
readonly S3_BUCKET_ID

sync_args=(./dist "s3://${S3_BUCKET_ID}")
case "${1:-}" in
  stage) ;;
  clean) sync_args+=(--delete) ;;
  *)
    printf 'Usage: %s stage|clean\n' "$0" >&2
    exit 1
    ;;
esac

aws s3 sync "${sync_args[@]}"
