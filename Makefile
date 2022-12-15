website_service = website

help: ## Print help for each target.
	$(info Available commands:)
	$(info )
	@grep '^[[:alnum:]_-]*:.* ##' $(MAKEFILE_LIST) \
		| sort | awk 'BEGIN {FS=":.* ## "}; {printf "%-25s %s\n", $$1, $$2};'

start: ## Run website on development mode.
	docker compose up --build $(website_service)

lint: ## Run linter and fix problems for TypeScript and CSS files.
	docker compose run --rm $(website_service) npm run lint:fix

test: ## Run and watch unit tests.
	docker compose run --rm $(website_service) npm run test:watch

lint_tf: ## Run Terraform linter.
	docker container run --rm -v $(PWD)/infrastructure:/data -t ghcr.io/terraform-linters/tflint:v0.43.0

debug: ## To get in the container and see what's going on.
	docker compose run --rm $(website_service) sh
