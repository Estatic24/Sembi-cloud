#!/bin/sh

/wait-for-it.sh mongo:27017 -t 30 -- echo "MongoDB is up"

node ./scripts/create-admin.js

npm start