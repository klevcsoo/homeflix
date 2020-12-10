#!/bin/bash

set -e

# THIS IS EXECUTED ON THE SERVER
cd ~/homeflix/

echo "  -> Removing old files..."
[ -d "./src" ] && rm -r ./src
[ -e "./run" ] && rm ./run

echo "  -> Extracting new files..."
unzip -qq ./dist.zip -d ./
mv ./dist ./src

echo "  -> Creating executable..."
touch ./run.sh && echo "NODE_ENV=production node src/main.js" > ./run.sh
chmod +x ./run.sh
mv ./run.sh ./run

echo "  -> Cleaning up install files on server..."
rm ./dist.zip
rm ./install.sh
