#!/usr/bin/env bash

# TODO: Fix install script to correctly setup the project
# TODO: Add a ./run script
# TODO: Automatically add a ./run scrip in the home folder for quick starting

source ~/.nvm/nvm.sh
nvm use
npm install

cd ./src/subprocess_touch
nvm install 6.7.0
npm install
