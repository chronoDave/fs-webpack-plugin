# fs-webpack-plugin

`fs-webpack-plugin` adds file system methods in a webpack plugin package.

## Why?

Both `copy-webpack-plugin` and `clean-webpack-plugin` have far too many depedencies and devDepedencies if you ask me. As these are both `fs` related packages, why not bundle them together (and minify the amount of depedencies in the proces)?

## Usage

`fs-webpack-plugin` is run before compilation.

<b>webpack.config.js</b>

```JS
const FsWebpackPlugin = require('fs-webpack-plugin');

module.exports = {
  plugins: [
    new FsWebpackPlugin({
      remove: ['build/**'],
      copy: [{ files: 'src/**', to: 'build' }]
    })
  ]
}
```

## Options

`remove` - Files to remove, expects glob pattern.
`copy` - Files to copy, expects object `{ files: <Glob>, to: <String> }`
`copy.files` - Files to copy, expects glob
`copy.to` - Output dir of `copy.files`, expects relative path (assumes `process.cwd()` as root)
