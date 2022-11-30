website_service = website
tf_service = terraform
tf_compose_file = infrastructure/compose.yaml
tf_workdir = /app/infrastructure
tf_plan_file = tfplan

# Website commands.

start:
	docker compose up $(website_service)

build_website:
	docker compose run --rm $(website_service) npm run build

# Terraform commands.

lint_tf:
	docker compose -f $(tf_compose_file) run --rm --entrypoint tflint $(tf_service) $(tf_workdir)

init:
	docker compose -f $(tf_compose_file) run --rm $(tf_service) -chdir=$(tf_workdir) init

plan: init build_website
	docker compose -f $(tf_compose_file) run --rm $(tf_service) -chdir=$(tf_workdir) plan -out $(tf_plan_file)

apply:
	docker compose -f $(tf_compose_file) run --rm $(tf_service) -chdir=$(tf_workdir) apply $(tf_plan_file)
