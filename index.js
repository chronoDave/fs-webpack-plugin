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
        .map(pattern => glob.sync(pattern));
    }

    if (copy) {
      this.copy = toArray(copy)
        .map(({ files, to }) => ({
          files: glob.sync(files),
          to: path.resolve(process.cwd(), to)
        }));
    }
  }

  apply(compiler) {
    compiler.hooks.beforeRun.tap('FsWebpackPlugin', () => {
      try {
        if (this.remove) {
          this.remove.forEach(file => fse.removeSync(file));
          console.log(`Removed files: ${this.remove}`);
        }
        if (this.copy) {
          this.copy.forEach(({ files, to }) => fse.copyFileSync(files, to));
          console.log(`Copied files: ${JSON.stringify(this.copy)}`);
        }
      } catch (err) {
        console.error(err);
      }
    });
  }
};
