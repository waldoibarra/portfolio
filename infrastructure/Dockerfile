FROM waldoibarra/terraform-aws:1.1.1

ARG AWS_PROFILE
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY

# Configure profile as needed by a Terraform plugin, to run S3 commands.
RUN aws configure set aws_access_key_id ${AWS_ACCESS_KEY_ID} --profile ${AWS_PROFILE} \
    && aws configure set aws_secret_access_key ${AWS_SECRET_ACCESS_KEY} --profile ${AWS_PROFILE} \
    && aws configure set output json --profile ${AWS_PROFILE}

WORKDIR /app
COPY ./infrastructure infrastructure
COPY ./build website_content
WORKDIR /app/infrastructure

ENTRYPOINT ["terraform"]
