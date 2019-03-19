#!/usr/bin/env bash

export BUCKET='csimt-bucket'
apt-get update
apt-get install npm

gsutil cp gs://csimt-bucket/versions/default.tar.gz /home/katacka

tar -xvzf /home/katacka/default.tar.gz
ls
cd ./bundle
npm install --production
npm install fibers source-map-support
node main.js 


