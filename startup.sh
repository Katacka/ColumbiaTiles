#!/usr/bin/env bash

export BUCKET='csimt-bucket'

#Install Meteor.js and dependencies
sudo apt update
sudo curl https://install.meteor.com/ | sh

#Install MongoDB
sudo apt install -y mongodb-server

#Copy and unpack the app
cd /home/katacka
sudo gsutil cp gs://csimt-bucket/versions/default.tar.gz .
sudo tar -xvzf default.tar.gz

#Install the app
cd /home/katacka/bundle/programs/server
sudo meteor npm install --production
cd ../..

#Start the app
sudo PORT=80 ROOT_URL=http://localhost MONGO_URL=mongodb://localhost meteor node main.js


