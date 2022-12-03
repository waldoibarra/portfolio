FROM node:18.12.1-alpine

EXPOSE 3000

# Use rsync to make copying files faster after first time.
RUN apk add --no-cache rsync git

RUN mkdir /app && chown -R node:node /app \
    && mkdir /cache && chown -R node:node /cache

USER node

WORKDIR /cache
COPY --chown=node:node package*.json ./
RUN npm install && npm cache clean --force

WORKDIR /app
COPY --chown=node:node . .

# Required for Jest watch mode to work as it uses Git to run tests based on changed files.
ENV GIT_WORK_TREE=/app GIT_DIR=/app/.git

RUN chmod 0755 /app/docker-entrypoint.sh
ENTRYPOINT [ "sh", "/app/docker-entrypoint.sh" ]
