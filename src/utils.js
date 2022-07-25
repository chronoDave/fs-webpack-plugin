const path = require('path');

const toAbs = (p, root = process.cwd()) => {
  if (path.isAbsolute(p)) return p;
  return path.resolve(root, p);
};

/** Null coalescing */
const ldor = (x, v) => {
  if (x === null || x === undefined) return v;
  return x;
};

module.exports = {
  toAbs,
  ldor
};
