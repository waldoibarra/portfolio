FROM node:18.12.1-alpine AS base
# ENV NODE_ENV=production
# Use rsync to make copying files faster after first time.
RUN apk add --no-cache rsync git
EXPOSE 3000
RUN mkdir /app && chown -R node:node /app \
    && mkdir /cache && chown -R node:node /cache
WORKDIR /cache
USER node
COPY --chown=node:node package*.json ./
# RUN npm ci --only=production && npm cache clean --force
RUN npm install && npm cache clean --force
WORKDIR /app

FROM base AS development
ENV NODE_ENV=development
# Required for Jest watch mode to work as it uses Git to run tests based on changed files.
ENV GIT_WORK_TREE=/app GIT_DIR=/app/.git
COPY --chown=node:node docker-entrypoint.sh .
RUN chmod 0755 /app/docker-entrypoint.sh
ENTRYPOINT [ "sh", "/app/docker-entrypoint.sh" ]

FROM base AS production
ENV NODE_ENV=production
RUN mv /cache/* /app
COPY --chown=node:node . .
