# fs-webpack-plugin

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![NPM](https://img.shields.io/npm/v/fs-webpack-plugin?label=npm)](https://www.npmjs.com/package/fs-webpack-plugin)

`fs-webpack-plugin` adds file system methods in a webpack plugin package.

Currently, it supports:

 - `copy`
 - `remove`

`fs-webpack-plugins` supports [glob](https://en.wikipedia.org/wiki/Glob_(programming)) patterns.

## Why?

Both `copy-webpack-plugin` and `clean-webpack-plugin` have far too many depedencies if you ask me. As these are both `fs` related packages, why not bundle them together (and minify the amount of depedencies in the process)?

## Usage

`fs-webpack-plugin` is ran before compilation.

<b>webpack.config.js</b>

```JS
const FsWebpackPlugin = require('fs-webpack-plugin');

module.exports = {
  plugins: [
    new FsWebpackPlugin([
      { type: 'delete', files: 'build/**/*' },
      { type: 'copy', files: 'assets/**/*', to: 'build' }
    ])
  ]
}
```
