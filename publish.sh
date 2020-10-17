#!/bin/bash

REPOSITORY=$(node -p -e "require('./package.json').repository")
REPOSITORY=${REPOSITORY##*https://github.com/}

ORIGIN="https://"
ORIGIN+=$GH_TOKEN
ORIGIN+=@
ORIGIN+=$REPOSITORY

# yarn publish --non-interactive --new-version $3

git push https://${GH_TOKEN}@${REPOSITORY} master --tags
