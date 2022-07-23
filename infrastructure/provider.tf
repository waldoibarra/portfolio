provider "aws" {
  region  = "us-west-2"
  profile = ""
}

provider "aws" {
  alias   = "useast1"
  region  = "us-east-1"
  profile = ""
}
