#!/bin/bash

export VERSION=0.0.3

cd ui
npm run build
cd ..
mkdir -p api/web
rm -rf api/web/*
mv ui/build/* api/web/

cd api
docker build -t digitalgoetz/dropspot:$VERSION .
# docker push digitalgoetz/dropspot:$VERSION
cd ..

docker run -it --rm -p 4500:4500 digitalgoetz/dropspot:0.0.3
