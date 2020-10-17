#!/bin/bash

REPOSITORY=$(node -p -e "require('./package.json').repository")

# yarn publish --non-interactive --new-version $3

git push https://${GH_TOKEN}@${REPOSITORY} master --tags
