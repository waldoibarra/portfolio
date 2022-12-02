# Welcome To My Personal Website Code

This is pretty much a work in progress, hope you enjoy reading this code as much as I enjoyed writing it.

## Key Features

- Trunk Based Development as branching model.
- Infrastructure as code with Terraform, which includes a private S3 bucket, CloudFront distribution (SSL certs and cache) and Route 53 A records.
- Makefile as an entrypoint of the app to simplify usage of this repository.
- Docker Compose to reduce need to install dependencies and standardize development on any OS.
- Linting of Terraform, TypeScript and CSS files.
- Unit tests for React code using Jest and testing library.
- Hot realoding enabled on save of React files.

## Local Development

### Requirements

The only needed tool you need to install in your machine is [Docker](https://www.docker.com).

### Run Website Locally

To run the website on development mode with hot realoding included, run the following command and visit [localhost:3000](http://localhost:3000).

``` sh
make start
```

## Manual Deployment

> :warning: This is to be done by a CI/CD pipeline soon.

Some environment variables are required to be defined in your current proccess, you can find more on some of these on [vars.tf](infrastructure/vars.tf) file.

``` sh
# AWS credentials.
export AWS_ACCESS_KEY_ID=""
export AWS_SECRET_ACCESS_KEY=""

# Terraform token for Cloud.
export TF_TOKEN_app_terraform_io=""

# Some variables used to deploy, you can read their descriptions on infrastructure/vars.tf file.
export TF_VAR_domain_name="waldoibarra.com"
export TF_VAR_hosted_zone_id=""
export TF_VAR_aws_profile="default"
export TF_VAR_Application="Personal static website"
```

Pretty much just have to use commands on the [Makefile](Makefile) to accomplish that, they use Docker and Terraform to deploy the website.

``` sh
make plan
make apply
```

This will update the website [waldoibarra.com](https://waldoibarra.com/) with the contents of the built app.
