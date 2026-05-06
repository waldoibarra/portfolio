#!/usr/bin/env bash

set -euo pipefail

S3_BUCKET_ID=$(terraform -chdir=infrastructure output -raw s3_bucket_id)

aws s3 sync ./dist "s3://${S3_BUCKET_ID}" --delete
