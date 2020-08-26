const fse = require('fs-extra');
const glob = require('fast-glob');
const path = require('path');

module.exports = class FsWebpackPlugin {
  /**
   * @param {object[]} options
   * @param {boolean} verbose - Enable logging (default `true`)
   */
  constructor(options = [], verbose = true) {
    this.options = options;
    this.verbose = verbose;
  }

  run() {
    this.options.forEach(({ type, files, to }) => {
      try {
        switch (type) {
          case 'delete':
            glob
              .sync(files, { absolute: true })
              .forEach(file => {
                fse.removeSync(file);
                if (this.verbose) console.log(`Removed file: ${file}`);
              });
            break;
          case 'copy':
            glob
              .sync(files, { absolute: true })
              .forEach(file => {
                const newFile = path.resolve(process.cwd(), to, file.split('/').pop());
                let newPath = process.cwd(); // Make folder(s) if they don't exist
                to.split('/').forEach(p => {
                  newPath = path.resolve(newPath, p);
                  if (p !== '..') fse.mkdirpSync(newPath);
                });
                fse.copyFileSync(file, newFile);
                if (this.verbose) console.log(`Copied file: ${file} => ${newFile}`);
              });
            break;
          default:
            console.error(`Invalid type: ${type}`);
        }
      } catch (err) {
        console.log(err);
      }
    });
  }

  apply(compiler) {
    compiler.hooks.beforeRun.tap('FsWebpackPlugin', () => this.run());
    compiler.hooks.watchRun.tapPromise('FsWebpackPlugin', () => {
      this.run();
      return Promise.resolve();
    });
  }
};
