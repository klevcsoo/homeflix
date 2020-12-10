#!/bin/bash

set -e

C="\033[1;33m"
NC="\033[0m"

echo "${C}Building app...${NC}"
cd app && npm run build && cd ..
cd server && npm run build && cd ..

echo "${C}Clearing dist directory...${NC}"
[ -d "dist/" ] && rm -r dist/
mkdir dist && mkdir dist/public

echo "${C}Copying front-end...${NC}"
rsync -rq app/build/* dist/public/

echo "${C}Copying back-end...${NC}"
rsync -rq server/lib/* dist/
rsync -rq server/node_modules dist/

echo "${C}Creating app bundle...${NC}"
zip -rqq dist.zip dist

echo "${C}Deploying to server...${NC}"
scp -rp dist.zip pi@192.168.0.34:~/homeflix/
scp -rp install.sh pi@192.168.0.34:~/homeflix/

echo "${C}Installing app...${NC}"
ssh pi@192.168.0.34 "bash ~/homeflix/install.sh"

echo "${C}Cleaning up install files on dev client...${NC}"
rm -r dist
rm dist.zip

echo "${C}Done${NC}"
