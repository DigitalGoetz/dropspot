#!/bin/bash

source ./scripts/environment.sh

cd ui
npm install
npm run build
cd ..
mkdir -p api/web
rm -rf api/web/*
mv ui/build/* api/web/

cd api
docker build -t digitalgoetz/dropspot:$VERSION .
# docker push digitalgoetz/dropspot:$VERSION
cd ..


