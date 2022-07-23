terraform {
  cloud {
    organization = "waldo-io"

    workspaces {
      name = "waldoibarra-com"
    }
  }
}
