const fs = require('fs');
const path = require('path');

/**
 * Copy files or directories
 * @param {{ from: string, to: string }[]} actions - Absolute paths
 * @param {?{ dry?: boolean, verbose?: boolean }} options
 */
module.exports = logger => (actions, options = {}) => actions.forEach(action => {
  if (!fs.existsSync(action.from)) throw new Error(`File or folder does not exist: ${action.from}`);
  if (!options.dry) {
    const to = fs.statSync(action.from).isDirectory() ?
      action.to :
      path.resolve(action.to, path.parse(action.from).base);

    fs.cpSync(action.from, to, { recursive: true });
  }
  if (options.verbose) logger.info(`(copy) ${action.from} => ${action.to}`);
});
