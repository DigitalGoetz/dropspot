#!/bin/bash

source ./scripts/environment.sh

docker run -d --name dropspot --rm -p "${PORT}":4500 -v "$(pwd)/uploads":/dropspot "digitalgoetz/dropspot:$VERSION"
