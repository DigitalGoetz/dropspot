#!/bin/bash

export VERSION=0.0.4

cd ui
npm install
npm run build
cd ..
mkdir -p api/web
rm -rf api/web/*
mv ui/build/* api/web/

cd api
docker build -t digitalgoetz/dropspot:$VERSION .
cd ..


