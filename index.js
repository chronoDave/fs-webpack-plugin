const fse = require('fs-extra');
const glob = require('fast-glob');
const path = require('path');

module.exports = class FsWebpackPlugin {
  /**
   * @param {object[]} actions
   * @param {object} options
   * @param {boolean} options.verbose - Enable logging (default `true`)
   * @param {boolean} options.strict - Should throw error (default `false`)
   */
  constructor(actions = [], { verbose = true, strict = false } = {}) {
    this.actions = actions;
    this.verbose = verbose;
    this.strict = strict;

    this.syncHooks = [
      'entryOption',
      'afterPlugins',
      'afterResolvers',
      'environment',
      'afterEnvironment',
      'normalModuleFactory',
      'contextModuleFactory',
      'initialize',
      'compile',
      'thisCompilation',
      'compilation',
      'shouldEmit',
      'failed',
      'invalid',
      'watchClose',
      'infrastructureLog',
      'log'
    ];
    this.asyncHooks = [
      'beforeRun',
      'additionalPass',
      'run',
      'watchRun',
      'beforeCompile',
      'make',
      'afterCompile',
      'emit',
      'afterEmit',
      'assetEmitted',
      'done'
    ];
  }

  /**
   * @param {object} action
   * @param {string} action.type - Action type
   * @param {string} action.files - Files glob
   * @param {string} action.to - Output folder
   * @param {string} action.root - Glob root
   */
  run({ type, files, to, root = process.cwd() }) {
    try {
      switch (type) {
        case 'delete':
          glob
            .sync(files, { absolute: true, cwd: root })
            .forEach(file => {
              fse.removeSync(file);
              if (this.verbose) console.log(`Removed file: ${file}`);
            });
          break;
        case 'copy':
          glob
            .sync(files, { absolute: true, cwd: root })
            .forEach(file => {
              const newFile = path.resolve(root, to, file.split('/').pop());

              let newPath = root;
              to.split('/').forEach(p => {
                newPath = path.resolve(newPath, p);
                if (p !== '..') fse.mkdirpSync(newPath);
              });

              fse.copyFileSync(file, newFile);
              if (this.verbose) console.log(`Copied file: ${file} => ${newFile}`);
            });
          break;
        default: {
          const error = new Error(`Invalid type: ${type}`);
          if (this.strict) throw error;
          console.error(error);
        }
      }
    } catch (err) {
      if (this.strict) throw err;
      console.error(err);
    }

    return Promise.resolve();
  }

  apply(compiler) {
    for (let i = 0; i < this.actions.length; i += 1) {
      const action = this.actions[i];

      if (!action.hooks || !Array.isArray(action.hooks)) {
        const error = new Error(`Invalid hooks: ${action.hooks}`);
        if (this.strict) throw error;
        console.error(error);
      } else {
        for (let j = 0; j < action.hooks.length; j += 1) {
          const hook = action.hooks[j];

          switch (true) {
            case this.syncHooks.includes(hook):
              compiler.hooks[hook].tap('FsWebpackPlugin', () => this.run(action));
              break;
            case this.asyncHooks.includes(hook):
              compiler.hooks[hook].tapPromise('FsWebpackPlugin', () => this.run(action));
              break;
            default: {
              const error = new Error(`Invalid hook: ${hook}`);
              if (this.strict) throw error;
              console.error(error);
            }
          }
        }
      }
    }
  }
};
