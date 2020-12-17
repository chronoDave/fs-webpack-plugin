<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>
</div>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](/LICENSE)
[![npm](https://img.shields.io/npm/v/fs-webpack-plugin?label=npm)](https://www.npmjs.com/package/fs-webpack-plugin)
[![fs-webpack-plugin](https://img.shields.io/bundlephobia/minzip/fs-webpack-plugin@3.0.0.svg)](https://bundlephobia.com/result?p=fs-webpack-plugin@3.0.0)
![fs-webpack-plugin](https://github.com/chronoDave/fs-webpack-plugin/workflows/fs-webpack-plugin/badge.svg?branch=master)

# fs-webpack-plugin

Copies and deletes both files and directories.

## Why?

Both `copy-webpack-plugin` and `clean-webpack-plugin` are very large packages for the functionality they provide (`91.3kb` and `15.3kb` minzipped respectively).

Both of these packages rely on `fs`, so why not bundle them together whilst also minifiying the bundle size?

## Usage

<b>webpack.config.js</b>

```JS
const FsWebpackPlugin = require('fs-webpack-plugin');

module.exports = {
  plugins: [
    new FsWebpackPlugin([{
      // Delete folder `build` recursively
      type: 'delete',
      files: 'build'
    }, {
      // Delete file `build/index.test.js`
      type: 'delete',
      files: 'build/index.test.js'
    }, {
      // Delete file `build/index.test.js`,
      type: 'delete',
      files: 'index.test.js',
      root: path.resolve(__dirname, 'build') // [!] Must be absolute
    }, {
      // Delete file `build/index.test.js` and folder `build/test`
      type: 'delete',
      files: [
        'index.test.js',
        'test'
      ],
      root: path.resolve(__dirname, 'build')
    }, {
      // Copy folder `assets` recursively to `build/assets`
      type: 'copy',
      files: { from: 'assets', to: 'build' }
    }, {
      // Copy file `assets/image.png` to `build/assets/image.png`
      type: 'copy',
      files: { from: 'assets/image.png', to: 'build/assets/image.png' }
    }])
  ]
}
```

## Options

`new FsWebpackPlugin(actions, options)` 

 - `actions (Action[])` - Array of action objects
 - `options.verbose (Boolean)` - Enable logging (default `false`)
 - `options.strict (Boolean)` - Should throw errors instead of logging them (default `false`)
 - `options.dry (Boolean)` - Enable dry run (default `false`). Please note that `options.dry` will not output to console if `options.verbose` is `false`

`Action`

 - `type (String)` - Action type, must be one of `copy`, `delete`
 - `files (String|String[]|{ from: String, to: String}|{ from: String, to: String}[]` - File(s) or directory(s) to delete. `copy` only accepts `{ from, to }`. Paths are relative to root
 - `root (String)` - Absolute path used by `files`, defaults to `process.cwd()`
 - `hooks (String[])` - Webpack [hooks](https://webpack.js.org/api/compiler-hooks/#hooks) to run action on, defaults to `['beforeRun']`
