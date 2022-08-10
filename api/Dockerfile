FROM node:lts-alpine

WORKDIR /application

COPY . /application/

RUN mkdir -p /dropspot && npm install 

CMD [ "npm", "start" ]