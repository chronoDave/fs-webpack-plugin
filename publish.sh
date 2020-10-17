#!/bin/bash

REPOSITORY=$(node.exe -p -e "require('./package.json').repository")

# yarn publish --non-interactive --new-version $3

git remote set-url origin https://${GH_TOKEN}@${REPOSITORY} >/dev/null 2>&1
git push origin master --tags
