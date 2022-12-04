website_service = website
tf_service = terraform
tf_files_dir = infrastructure
tf_compose_file = $(tf_files_dir)/compose.yaml
tf_workdir = /app/$(tf_files_dir)
tf_plan_file = tfplan

# Website commands.

start:
	docker compose up --build $(website_service)

lint:
	docker compose run --rm $(website_service) npm run lint:fix

test:
	docker compose run --rm $(website_service) npm run test:watch

build_website:
	docker compose run --rm $(website_service) npm run build

debug:
	docker compose run --rm $(website_service) sh

# Terraform commands.

lint_tf:
	docker container run --rm -v $(PWD)/$(tf_files_dir):/data -t ghcr.io/terraform-linters/tflint:v0.43.0

init:
	docker compose -f $(tf_compose_file) run --rm $(tf_service) -chdir=$(tf_workdir) init

plan: init build_website
	docker compose -f $(tf_compose_file) run --rm $(tf_service) -chdir=$(tf_workdir) plan -out $(tf_plan_file)

apply:
	docker compose -f $(tf_compose_file) run --rm $(tf_service) -chdir=$(tf_workdir) apply $(tf_plan_file)
