#!/bin/bash

set -e

echo "Building app..."
cd app && npm run build && cd ..
cd server && npm run build && cd ..

echo "Clearing dist directory..."
if [ -d "dist/" ]; then rm -r dist/
fi
mkdir dist && mkdir dist/public

echo "Copying front-end..."
rsync -r --progress app/build/* dist/public/

echo "Copying back-end..."
rsync -r --progress server/lib/* dist/
rsync -r --progress server/node_modules dist/

echo "Creating executable file..."
touch dist/serve.sh && echo "NODE_ENV=production node src/main.js" > dist/serve.sh

echo "Deploying to server..."
ssh pi@192.168.0.34 "rm -r ~/homeflix/src && mkdir ~/homeflix/src"
scp -rp dist/* pi@192.168.0.34:~/homeflix/src/
ssh pi@192.168.0.34 "mv ~/homeflix/src/serve.sh ~/homeflix"
echo "Done"
