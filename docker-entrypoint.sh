#!/bin/sh
set -e

command=$@

# Copy node_modules directory from cache for it to be available on host machine.
echo "Syncing node_modules directory."
rsync -ar /cache/node_modules/. /app/node_modules

if [ -z "$command" ];
then
    exec npm start
else
    exec $command
fi
