FROM node:18-alpine

WORKDIR /src

COPY ./ /src/

RUN npm ci

CMD [ "npm", "run", "start" ]