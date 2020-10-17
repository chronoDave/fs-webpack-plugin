#!/bin/bash

yarn publish --non-interactive --new-version $1
git push origin master --tags
