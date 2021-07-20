FROM node:14-alpine

WORKDIR /usr/src/app

COPY package*.json /usr/src/app/

RUN npm install && mv /usr/src/app/node_modules /node_modules

COPY . .

ENV NODE_ENV=production

EXPOSE 8000

CMD [ "node", "./bin/www" ]