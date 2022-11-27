container_working_dir = /app
tf_files_dir = infrastructure
tf_data_dir = $(tf_files_dir)/.terraform
image_build_args = --build-arg AWS_ACCESS_KEY_ID --build-arg AWS_SECRET_ACCESS_KEY --build-arg AWS_PROFILE=$(TF_VAR_aws_profile)
container_env_vars = -e TF_TOKEN_app_terraform_io -e TF_VAR_domain_name -e TF_VAR_hosted_zone_id -e TF_VAR_aws_profile -e TF_VAR_Application
tf_container_run_options = --rm $(container_env_vars) -v $(PWD):$(container_working_dir) -v $(PWD)/$(tf_data_dir):$(container_working_dir)/$(tf_data_dir) -w $(container_working_dir)
image_name = waldoibarra/terraform-aws
tf_global_options = -chdir=$(container_working_dir)/$(tf_files_dir)
tf_plan_file = tfplan
container_name = website
website_container_run_options = --rm -v $(PWD):$(container_working_dir) -w $(container_working_dir) --name $(container_name)

build_image:
	docker image build -t $(image_name) $(image_build_args) $(tf_files_dir)

init: build_image
	docker container run $(tf_container_run_options) $(image_name) $(tf_global_options) init

plan: init build_website
	docker container run $(tf_container_run_options) $(image_name) $(tf_global_options) plan -out $(tf_plan_file)

apply:
	docker container run $(tf_container_run_options) $(image_name) $(tf_global_options) apply $(tf_plan_file)

start:
	docker container run $(website_container_run_options) -p 3000:3000 -d node npm start

stop:
	docker container stop $(container_name)

build_website:
	docker container run $(website_container_run_options) node npm run build

test:
	docker container run $(website_container_run_options) node npm test

logs:
	docker container logs $(container_name) -f
