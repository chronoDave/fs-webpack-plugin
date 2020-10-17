const fs = require('fs');
const glob = require('fast-glob');
const path = require('path');

module.exports = class FsWebpackPlugin {
  /**
   * @param {object[]} actions
   * @param {object} options
   * @param {boolean} options.verbose - Should log to console (default `false`)
   * @param {boolean} options.strict - Should throw error (default `false`)
   * @param {boolean} options.dry - Should mock actions (default `false`)
   */
  constructor(actions = [], { verbose = false, dry = false, strict = false } = {}) {
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

    this.actions = actions;
    this.strict = strict;
    this.verbose = verbose;
    this.dry = dry;

    this.logger = null;
  }

  handleErr(message) {
    const err = new Error(message);
    if (this.strict) throw err;
    this.logger.error(err);
  }

  /**
   * @param {object} action
   * @param {string} action.type - Action type
   * @param {string} action.files - Files glob
   * @param {string} action.to - Output folder
   * @param {string} action.root - Glob root
   * @param {object} logger - Webpack logger
   */
  run({ type, files = '**/*', to, root = process.cwd() }) {
    try {
      switch (type) {
        case 'delete':
          if (!files) {
            if (!this.dry) fs.rmdirSync(root, { recursive: true });
            if (this.verbose) this.logger.info(`Removed folder: ${root}`);
          } else {
            glob
              .sync(files, { absolute: true, cwd: root })
              .forEach(file => {
                if (!this.dry) fs.unlinkSync(file);
                if (this.verbose) this.logger.info(`Removed file: ${file}`);
              });
          }
          break;
        case 'copy':
          glob
            .sync(files, { absolute: true, cwd: root })
            .forEach(file => {
              const newFile = path.resolve(root, to, file.split(path.sep).pop());

              let newPath = root;
              to.split(path.sep).forEach(p => {
                newPath = path.resolve(newPath, p);
                if (p !== '..' && !this.dry) fs.mkdirSync(newPath, { recursive: true });
              });

              if (!this.dry) fs.copyFileSync(file, newFile);
              if (this.verbose) this.logger.info(`Copied file: ${file} => ${newFile}`);
            });
          break;
        default:
          this.handleErr(`Invalid type: ${type}`);
      }
    } catch (err) {
      this.handleErr(err.message);
    }

    return Promise.resolve();
  }

  /**
   * @param {object} action
   * @param {string} action.type - Action type
   * @param {string} action.files - Files glob
   * @param {string} action.to - Output folder
   * @param {string} action.root - Glob root
   * @param {function} cb - Callback
   */
  validate(action, cb) {
    if (typeof action !== 'object') return this.handleErr(`Action must be an object: ${action}`);
    if (!action.type) return this.handleErr(`Action must have a type: ${action}`);
    return cb({ hooks: ['beforeRun'], ...action });
  }

  apply(compiler) {
    this.logger = compiler.getInfrastructureLogger(this.name);

    for (let i = 0; i < this.actions.length; i += 1) {
      this.validate(this.actions[i], action => {
        for (let j = 0; j < action.hooks.length; j += 1) {
          const hook = action.hooks[j];

          switch (true) {
            case this.syncHooks.includes(hook):
              compiler.hooks[hook].tap(this.name, () => this.run(action));
              break;
            case this.asyncHooks.includes(hook):
              compiler.hooks[hook].tapPromise(this.name, () => this.run(action));
              break;
            default:
              this.handleErr(`Invalid hook: ${hook}`);
          }
        }
      });
    }
  }
};
