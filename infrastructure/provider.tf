provider "aws" {
  region = "us-west-2"
}

provider "aws" {
  alias  = "useast1"
  region = "us-east-1"
}
