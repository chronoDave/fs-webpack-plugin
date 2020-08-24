const fse = require('fs-extra');
const glob = require('fast-glob');
const path = require('path');

module.exports = class FsWebpackPlugin {
  /**
   * @param {object} options
   * @param {string|string[]} options.remove - <Glob>
   * @param {object|object[]} options.copy - `[{ files: <Glob>, to: <String> }]`
   */
  constructor({ remove = null, copy = null } = {}) {
    const toArray = any => (Array.isArray(any) ? any : [any]);

    this.remove = null;
    this.copy = null;

    if (remove) {
      this.remove = toArray(remove)
        .map(pattern => glob.sync(pattern, { absolute: true }))
        .flat();
    }

    if (copy) {
      this.copy = toArray(copy)
        .map(pattern => glob
          .sync(pattern.files, { absolute: true })
          .map(file => ({
            file,
            to: path.resolve(
              process.cwd(),
              pattern.to,
              file.split('/').pop()
            )
          })))
        .flat();
    }
  }

  actionRemove() {
    this.remove.forEach(file => fse.removeSync(file));
    console.log(`Removed file(s): \n - ${this.remove.join('\n - ')}`);
  }

  actionCopy() {
    this.copy.forEach(({ file, to }) => fse.copyFileSync(file, to));
    console.log(`Copied file(s): \n - ${this.copy.map(({ file, to }) => `${file} => ${to}`).join('\n - ')}`);
  }

  apply(compiler) {
    compiler.hooks.beforeRun.tap('FsWebpackPlugin', () => {
      try {
        if (this.remove) this.actionRemove();
        if (this.copy) this.actionCopy();
      } catch (err) {
        console.error(err);
      }
    });
  }
};
