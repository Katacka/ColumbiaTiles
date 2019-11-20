#Script should be correct, needs testing
meteor build ..
gsutil cp ../ColubmiaTiles.tar.gz gs://csimt-bucket
gcloud compute --project "csimt-prod" ssh --zone "us-east1-b" "csimt-production"

sudo apt install mongodb-clients
mongodump --port=3001 -o ../dump

gsutil cp gs://csimt-bucket/ColubmiaTiles.tar.gz .
sudo tar -xvzf default.tar.gz
cd /home/katacka/bundle/programs/server
sudo meteor npm install --production
cd ../..

killall node

mongorestore --drop --port=3001 ../dump

sudo PORT=80 ROOT_URL=http://localhost MONGO_URL=mongodb://localhost meteor node main.js
