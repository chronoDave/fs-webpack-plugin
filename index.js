const fs = require('fs');
const path = require('path');

const walk = require('@chronocide/fs-walk').default;

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

  handleError(error) {
    if (this.strict) throw error;
    this.logger.error(error.message);
  }

  /**
   * @param {string[]} files
   * @param {string} root - Root folder
   */
  delete(files, root) {
    for (let i = 0; i < files.length; i += 1) {
      const file = path.resolve(root, files[i]);

      if (!fs.existsSync(file)) {
        // Invalid file or directory
        throw new Error(`File or folder does not exist: ${file}`);
      } else if (fs.lstatSync(file).isDirectory()) {
        // Path is directory
        if (!this.dry) fs.rmdirSync(file, { recursive: true });
        if (this.verbose) this.logger.info(`Removed folder: ${files}`);
      } else {
        // Path is file
        if (!this.dry) fs.unlinkSync(file);
        if (this.verbose) this.logger.info(`Removed file: ${files}`);
      }
    }
  }

  /**
   * @param {{ from: string, to: string }[]} files
   * @param {string} root - Root folder
   */
  copy(files, root) {
    for (let i = 0; i < files.length; i += 1) {
      const { from, to } = files[i];
      const stack = [];

      const fromAbs = path.resolve(root, from);
      if (!fs.existsSync(fromAbs)) {
        // Invalid file or directory
        throw new Error(`File or folder does not exist: ${fromAbs}`);
      } else if (fs.lstatSync(fromAbs).isDirectory()) {
        stack.push(...walk(fromAbs));
      } else {
        stack.push(fromAbs);
      }

      for (let j = 0; j < stack.length; j += 1) {
        const newFile = path.normalize(path.join(
          root,
          to,
          stack[j].replace(root, '')
        ));

        if (!this.dry) {
          fs.mkdirSync(path.dirname(newFile), { recursive: true });
          fs.copyFileSync(stack[j], newFile);
        }
        if (this.verbose) this.logger.info(`Copied file: ${fromAbs} => ${newFile}`);
      }
    }
  }

  /**
   * @param {object} action
   * @param {string} action.type - Action type
   * @param {string} action.files - Files glob
   * @param {string} action.to - Output folder
   * @param {string} action.root - Glob root
   * @param {object} logger - Webpack logger
   */
  run({ type, files, root = process.cwd() }) {
    const toArray = any => (Array.isArray(any) ? any : [any]);

    try {
      switch (type) {
        case 'delete':
          this.delete(toArray(files), root);
          break;
        case 'copy':
          this.copy(toArray(files), root);
          break;
        default:
          throw new Error(`Invalid type: ${type}`);
      }
    } catch (err) {
      this.handleError(err);
    }

    return Promise.resolve();
  }

  /**
   * @param {object} action
   * @param {string} action.type - Action type
   * @param {string[]|{ from: string, to: string }[]} action.files - Files glob
   * @param {string} action.root - Root
   * @param {function} cb - Callback
   */
  validate(action, cb) {
    if (typeof action !== 'object') return this.handleError(new Error(`Action must be an object: ${action}`));
    if (!action.type) return this.handleError(new Error(`Action must have a type: ${action}`));
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
              this.handleError(new Error(`Invalid hook: ${hook}`));
          }
        }
      });
    }
  }
};
