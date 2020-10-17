# fs-webpack-plugin

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](/LICENSE)
[![npm](https://img.shields.io/npm/v/fs-webpack-plugin?label=npm)](https://www.npmjs.com/package/fs-webpack-plugin)
[![Leaf-DB](https://img.shields.io/bundlephobia/minzip/fs-webpack-plugin@latest.svg)](https://bundlephobia.com/result?p=fs-webpack-plugin@latest)
[![Build Status](https://travis-ci.com/chronoDave/fs-webpack-plugin.svg?branch=master)](https://travis-ci.com/chronoDave/fs-webpack-plugin)

`fs-webpack-plugin` adds file system methods in a webpack plugin package.

Currently, it supports:

 - `copy`
 - `delete`

## Installation

```JS
// Yarn
yarn add fs-webpack-plugin --dev

// NPM
npm i fs-webpack-plugin --save-dev
```

_Note_: `fs-webpack-plugin` requires Node `>=12.10.0`.

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
      files: 'build/**/*'
    }, {
      type: 'copy',
      files: '**/*',
      to: 'build',
      root: 'assets'
    }], { verbose: true })
  ]
}
```

## Options

`new FsWebpackPlugin(actions, options)` 

 - `actions (Action[])` - Array of action objects
 - `options.verbose (Boolean)` - Enable logging (default `false`)
 - `options.strict (Boolean)` - Should throw errors instead of logging them (default `false`)
 - `options.dry (Boolean)` - Enable mocking (default `false`). Please note that `options.dry` will not output to console if `options.verbose` is `false`

`Action`

 - `type (String)` - Action type, must be one of `copy`, `delete`
 - `files (String)` - Files [glob](https://en.wikipedia.org/wiki/Glob_(programming)). If `type` is `delete` and `files` is `falsy`, `delete` will remove all files in `root` recursively. Defaults to `**/*`
 - `to (String)` - Output directory (used by `copy`)
 - `root (String)` - `files` glob root, defaults to `process.cwd()`
 - `hooks (String[])` - Webpack [hooks](https://webpack.js.org/api/compiler-hooks/#hooks) to run action on, defaults to `['beforeRun']`


## License

[MIT](./LICENSE)

## Donating

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y41E23T)
