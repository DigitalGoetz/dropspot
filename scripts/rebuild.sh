#!/bin/bash

source ./scripts/environment.sh

bash scripts/stop.sh
bash scripts/build.sh
bash scripts/deploy.sh