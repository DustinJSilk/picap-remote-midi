#!/usr/bin/env bash

source ~/.nvm/nvm.sh
nvm use
npm install

cd ./src/subprocess_touch
nvm install 6.7.0
npm install
