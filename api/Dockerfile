FROM node:lts-alpine

WORKDIR /application

COPY . /application/

RUN mkdir -p /dropspot && npm install

EXPOSE 4500

CMD [ "npm", "start" ]