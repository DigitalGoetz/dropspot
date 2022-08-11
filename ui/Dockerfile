FROM node:lts-alpine

WORKDIR /application

COPY . /application/

RUN npm install

EXPOSE 4501

CMD [ "npm", "start" ]