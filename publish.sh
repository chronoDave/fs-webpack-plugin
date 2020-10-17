#!/bin/bash

REPOSITORY=$(node -p -e "require('./package.json').repository")
REPOSITORY=${REPOSITORY##*https://github.com/}

ORIGIN="https://"
ORIGIN+=$1
ORIGIN+=@github.com/
ORIGIN+=$REPOSITORY

yarn publish --non-interactive --new-version

git push $ORIGIN master --tags
