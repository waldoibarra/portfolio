# Welcome To My Personal Website Code

This is pretty much a work in progress, hope you enjoy reading this code as much as I enjoyed writing it.

## Setup

> Be sure Docker is installed on host computer.

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

## Deployment

Pretty much just have to use commands on the [Makefile](Makefile) to accomplish that, they use Docker and Terraform to deploy the website.

``` sh
make init
make plan
make apply
```

This will update the website [waldoibarra.com](https://waldoibarra.com/) with the contents on the [public](public) directory.
