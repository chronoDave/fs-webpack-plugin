#!/bin/bash

REPOSITORY=$(awk '/repository/{gsub(/("|",)/,"",$4);print $4}' package.json)

yarn publish --non-interactive --new-version $3
git remote set-url origin https://${GH_TOKEN}@${REPOSITORY} >/dev/null 2>&1
git push origin master --tags
