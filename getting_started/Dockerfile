FROM node:14-alpine

RUN apk add tini

ENTRYPOINT ["/sbin/tini", "--"]

RUN mkdir /home/node/app/ && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY --chown=node:node package*.json ./

USER node

ENV NODE_ENV=production
ENV PORT=3000
RUN npm install && npm cache clean --force --loglevel=error

COPY --chown=node:node index.js .
COPY --chown=node:node migrate.ts .
COPY --chown=node:node tsconfig.json .
COPY --chown=node:node babel.config.js .
COPY --chown=node:node index.js .

COPY --chown=node:node app ./app/

EXPOSE 3000
# Run your program under Tini
CMD ["node", "index.js"]
