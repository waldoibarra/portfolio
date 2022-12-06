website_service = website

start:
	docker compose up --build $(website_service)

lint:
	docker compose run --rm $(website_service) npm run lint:fix

test:
	docker compose run --rm $(website_service) npm run test:watch

lint_tf:
	docker container run --rm -v $(PWD)/infrastructure:/data -t ghcr.io/terraform-linters/tflint:v0.43.0

debug:
	docker compose run --rm $(website_service) sh
