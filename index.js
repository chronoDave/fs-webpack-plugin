const fs = require('fs');
const glob = require('fast-glob');
const path = require('path');

module.exports = class FsWebpackPlugin {
  /**
   * @param {object[]} actions
   * @param {object} options
   * @param {boolean} options.strict - Should throw error (default `false`)
   */
  constructor(actions = [], { verbose = false, strict = false } = {}) {
    this.actions = actions;
    this.strict = strict;
    this.verbose = verbose;

    this.name = 'FsWebpackPlugin';
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
   * @param {object} logger - Webpack logger
   */
  run({ type, files, to, root = process.cwd() }, logger) {
    try {
      switch (type) {
        case 'delete':
          glob
            .sync(files, { absolute: true, cwd: root })
            .forEach(file => {
              fs.unlinkSync(file);
              if (this.verbose) logger.info(`Removed file: ${file}`);
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
                if (p !== '..') fs.mkdirSync(newPath, { recursive: true });
              });

              fs.copyFileSync(file, newFile);
              if (this.verbose) logger.info(`Copied file: ${file} => ${newFile}`);
            });
          break;
        default: {
          const error = new Error(`Invalid type: ${type}`);
          if (this.strict) throw error;
          logger.error(error);
        }
      }
    } catch (err) {
      if (this.strict) throw err;
      console.error(err);
    }

    return Promise.resolve();
  }

  apply(compiler) {
    const logger = compiler.getInfrastructureLogger(this.name);

    for (let i = 0; i < this.actions.length; i += 1) {
      const action = this.actions[i];

      if (!action.hooks || !Array.isArray(action.hooks)) {
        const error = new Error(`Invalid hooks: ${action.hooks}`);
        if (this.strict) throw error;
        logger.error(error);
      } else {
        for (let j = 0; j < action.hooks.length; j += 1) {
          const hook = action.hooks[j];

          switch (true) {
            case this.syncHooks.includes(hook):
              compiler.hooks[hook].tap(this.name, () => this.run(action, logger));
              break;
            case this.asyncHooks.includes(hook):
              compiler.hooks[hook].tapPromise(this.name, () => this.run(action, logger));
              break;
            default: {
              const error = new Error(`Invalid hook: ${hook}`);
              if (this.strict) throw error;
              logger.error(error);
            }
          }
        }
      }
    }
  }
};
