#!/bin/bash

export VERSION=0.0.2

cd api
docker build -t digitalgoetz/dropspot-api:$VERSION .
docker push digitalgoetz/dropspot-api:$VERSION
cd ..

cd ui
docker build -t digitalgoetz/dropspot-ui:$VERSION .
docker push digitalgoetz/dropspot-ui:$VERSION
cd ..