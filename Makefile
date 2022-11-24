container_working_dir = /app
tf_files_dir = infrastructure
tf_data_dir = $(tf_files_dir)/.terraform
image_build_args = --build-arg AWS_ACCESS_KEY_ID --build-arg AWS_SECRET_ACCESS_KEY --build-arg AWS_PROFILE=$(TF_VAR_aws_profile)
container_env_vars = -e TF_TOKEN_app_terraform_io -e TF_VAR_domain_name -e TF_VAR_hosted_zone_id -e TF_VAR_aws_profile -e TF_VAR_Application
container_run_options = --rm $(container_env_vars) -v $(PWD):$(container_working_dir) -v $(PWD)/$(tf_data_dir):$(container_working_dir)/$(tf_data_dir) -w $(container_working_dir)
image_name = waldoibarra/terraform-aws
tf_global_options = -chdir=$(container_working_dir)/$(tf_files_dir)
tf_plan_file = tfplan

build_image:
	docker image build -t $(image_name) $(image_build_args) $(tf_files_dir)

init: build_image
	docker container run $(container_run_options) $(image_name) $(tf_global_options) init

plan:
	docker container run $(container_run_options) $(image_name) $(tf_global_options) plan -out $(tf_plan_file)

apply:
	docker container run $(container_run_options) $(image_name) $(tf_global_options) apply $(tf_plan_file)
