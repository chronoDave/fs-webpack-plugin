#!/bin/bash

REPOSITORY=$(awk '/repository/{gsub(/("|",)/,"",$4);print $4}' package.json)

yarn config set _authToken $1 >/dev/null 2>&1
yarn publish --non-interactive --new-version $3
git remote set-url origin https://${2}@${REPOSITORY} >/dev/null 2>&1
git push origin master --tags
