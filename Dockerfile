FROM node:18.12.1-alpine

EXPOSE 3000

# Use rsync to make copying files faster after first time.
RUN apk add --no-cache rsync

RUN mkdir /app && chown -R node:node /app \
    && mkdir /cache && chown -R node:node /cache

USER node

WORKDIR /cache
COPY --chown=node:node package*.json ./
RUN npm install && npm cache clean --force

WORKDIR /app
COPY --chown=node:node . .

RUN chmod 0755 /app/docker-entrypoint.sh
ENTRYPOINT [ "sh", "/app/docker-entrypoint.sh" ]
