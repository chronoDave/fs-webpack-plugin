const remove = require('./remove');
const copy = require('./copy');
const { toAbs, ldor } = require('./utils');

/**
 * @typedef {{ type: 'copy', files: string[] | { from: string, to: string }[], root?: string, hooks?: string[] } | { type: 'delete', files: string[], root?: string, hooks?: string[] }} Action
 */

module.exports = class FsWebpackPlugin {
  /**
   * @param {Action[]} actions
   * @param {object} options
   * @param {boolean} options.verbose - Should log to console (default `true`)
   * @param {boolean} options.strict - Should throw error (default `false`)
   * @param {boolean} options.dry - Should mock actions (default `false`)
   */
  constructor(actions, options = {}) {
    if (!Array.isArray(actions)) throw new Error('Invalid configuration');

    this.name = 'FsWebpackPlugin';

    this.actions = actions;
    this.verbose = ldor(options.verbose, true);
    this.strict = ldor(options.strict, false);
    this.dry = ldor(options.dry, false);
  }

  /**
   * @param {Action} action
   */
  copy(action) {
    copy(this.logger)(action.files.map(file => ({
      from: toAbs(file.from, action.root),
      to: toAbs(file.to, action.root)
    })), {
      dry: this.dry,
      verbose: this.verbose
    });
  }

  /**
   * @param {Action} action
   */
  delete(action) {
    remove(this.logger)(action.files.map(file => toAbs(file, action.root)), {
      dry: this.dry,
      verbose: this.verbose
    });
  }

  apply(compiler) {
    this.logger = compiler.getInfrastructureLogger(this.name);
    this.actions.forEach(action => {
      if (!Array.isArray(action.files)) throw new Error('Files must be of type "array"');

      const hooks = Array.isArray(action.hooks) ?
        action.hooks :
        ['beforeRun'];

      hooks.forEach(hook => {
        if (!compiler.hooks[hook]) throw new Error(`Invalid hook: ${hook}`);

        compiler.hooks[hook].tap(this.name, () => {
          try {
            if (action.type === 'copy') return this.copy(action);
            if (action.type === 'delete') return this.delete(action);
          } catch (err) {
            if (this.strict) throw err;
            this.logger.error(err);
          }

          throw new Error(`Action must be of type 'copy' or 'delete': ${action.type}`);
        });
      });
    });
  }
};
