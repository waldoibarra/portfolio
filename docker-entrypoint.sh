#!/bin/sh
set -e

node_modules_directory=/app/node_modules

sync_node_modules() {
    echo "Syncing node_modules directory from cache for it to be available on host machine."
    rsync -ar /cache/node_modules/. $node_modules_directory
}

sync_node_modules_if_not_present() {
    if [ ! -d $node_modules_directory ];
    then
        sync_node_modules
    fi
}

enable_git_hooks() {
    npx husky install
}

start_website() {
    sync_node_modules
    enable_git_hooks
    exec npm start
}

run_one_off_command() {
    sync_node_modules_if_not_present
    exec $@
}

main() {
    local command=$@

    if [ -z "$command" ];
    then
        start_website
    else
        run_one_off_command $command
    fi
}

main $@
