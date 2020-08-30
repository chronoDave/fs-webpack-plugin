# fs-webpack-plugin

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![NPM](https://img.shields.io/npm/v/fs-webpack-plugin?label=npm)](https://www.npmjs.com/package/fs-webpack-plugin)

`fs-webpack-plugin` adds file system methods in a webpack plugin package.

Currently, it supports:

 - `copy`
 - `delete`

## Why?

Both `copy-webpack-plugin` and `clean-webpack-plugin` have far too many depedencies if you ask me. As these are both `fs` related packages, why not bundle them together (and minify the amount of depedencies in the process)?

## Usage

<b>webpack.config.js</b>

```JS
const FsWebpackPlugin = require('fs-webpack-plugin');

module.exports = {
  plugins: [
    new FsWebpackPlugin([{
      type: 'delete',
      files: 'build/**/*',
      hooks: ['beforeRun']
    }, {
      type: 'copy',
      files: 'assets/**/*',
      to: 'build',
      root: __dirname,
      hooks: ['beforeRun']
    }])
  ]
}
```

## Options

`new FsWebpackPlugin(actions, options)` 

 - `actions (Action[])` - Array of action objects
 - `options (Object)` - Options
 - `options.verbose (Boolean)` - Enable logging (default `true`)
 - `options.strict (Boolean)` - Should throw errors instead of logging them (default `false`)

`Action`

 - `type (String)` - Action type, must be one of `copy`, `delete`
 - `files (String)` - Files [glob](https://en.wikipedia.org/wiki/Glob_(programming))
 - `to (String)` - Output directory (used by `copy`)
 - `root (String)` - `files` glob root, defaults to `process.cwd()`
 - `hooks (String[])` - Webpack [hooks](https://webpack.js.org/api/compiler-hooks/#hooks) to run action at
