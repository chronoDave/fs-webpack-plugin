<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>

  <h1>fs-webpack-plugin</h1>
  <p>Native file system methods bundled in a webpack plugin package</p>
</div>

<div align="center">
  <img alt="node-current" src="https://img.shields.io/node/v/fs-webpack-plugin">
  <a href="https://www.npmjs.com/package/fs-webpack-plugin">
    <img alt="npm" src="https://img.shields.io/npm/v/fs-webpack-plugin?label=npm" />
  </a>
  <a href="https://bundlephobia.com/result?p=fs-webpack-plugin@3.0.0">
    <img alt="minzip size" src="https://img.shields.io/bundlephobia/minzip/fs-webpack-plugin@3.0.0.svg">
  </a>
  <a href="https://github.com/chronoDave/fs-webpack-plugin/workflows/ci">
    <img alt="ci" src="https://github.com/chronoDave/fs-webpack-plugin/workflows/ci/badge.svg?branch=master">
  </a>
  <a href="/LICENSE">
    <img alt="license MIT" src="https://img.shields.io/badge/License-MIT-blue.svg">
  </a>
</div>

## Why?

Both `copy-webpack-plugin` and `clean-webpack-plugin` recreate existing native functionality so why not use those?

<b>Note: </b> `clean` can be replaced with Webpack's [`output.clean`](https://webpack.js.org/configuration/output/#outputclean)

## Usage

<b>webpack.config.js</b>

```JS
const FsWebpackPlugin = require('fs-webpack-plugin');

module.exports = {
  plugins: [
    new FsWebpackPlugin([{
      // Delete folder `build` recursively
      type: 'delete',
      files: ['build'] // process.cwd() + build
    }, {
      // Delete file `build/index.test.js`
      type: 'delete',
      files: ['build/index.test.js'] // process.cwd() + build/index.test.js
    }, {
      // Delete file `build/index.test.js`,
      type: 'delete',
      files: ['index.test.js'],
      root: path.resolve(__dirname, 'build') // Must be absolute
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
      files: [{ from: 'assets', to: 'build' }]
    }, {
      // Copy file `assets/image.png` to `build/image.png`
      type: 'copy',
      files: [{ from: 'assets/image.png', to: 'build' }]
    }])
  ]
}
```

## Options

`new FsWebpackPlugin(actions, options)` 

 - `actions (Action[])` - Array of action objects
 - `options.verbose (Boolean)` - Enable logging (default `true`)
 - `options.strict (Boolean)` - Should throw errors instead of logging them (default `false`)
 - `options.dry (Boolean)` - Enable dry run (default `false`). Please note that `options.dry` will not output to console if `options.verbose` is `false`

`Action`

 - `type (String)` - Action type, must be one of `copy`, `delete`
 - `files (String[]|{ from: String, to: String}[]` - Files or directorys to delete. `copy` only accepts `{ from, to }`. If paths are relative, uses `root`
 - `root (String)` - Absolute path used by `files`, defaults to `process.cwd()`
 - `hooks (String[])` - Webpack [hooks](https://webpack.js.org/api/compiler-hooks/#hooks) to run action on, defaults to `['beforeRun']`
