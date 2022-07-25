const fs = require('fs');

/**
 * Remove files or directories
 * @param {string[]} files - Absolute paths
 * @param {?{ dry?: boolean, verbose?: boolean }} options
 */
module.exports = logger => (files, options = {}) => files.forEach(file => {
  if (!options.dry) fs.rmSync(file, { force: true, recursive: true });
  if (options.verbose) logger.info(`(delete) ${file}`);
});
