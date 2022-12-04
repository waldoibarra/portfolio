FROM hashicorp/terraform:1.3.5

WORKDIR /app

RUN apk add --no-cache aws-cli

ARG AWS_PROFILE
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY

# Configure profile as needed by a Terraform plugin, to run S3 commands.
RUN aws configure set aws_access_key_id ${AWS_ACCESS_KEY_ID} --profile ${AWS_PROFILE} \
    && aws configure set aws_secret_access_key ${AWS_SECRET_ACCESS_KEY} --profile ${AWS_PROFILE} \
    && aws configure set output json --profile ${AWS_PROFILE}
