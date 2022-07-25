const path = require('path');
const fs = require('fs');

const init = () => {
  const root = ['a', 'z'].map(dir => path.resolve(__dirname, dir));
  const files = [
    'b.txt',
    'b/c.txt',
  ].map(file => ({
    from: path.resolve(root[0], file),
    to: path.resolve(root[1], file)
  }));

  files.forEach(file => {
    fs.mkdirSync(path.parse(file.from).dir, { recursive: true });
    fs.writeFileSync(file.from, file.from);
  });

  return ({
    root,
    files,
    logger: { info: () => {} },
    cleanup: () => root.forEach((_, i) => fs.rmSync(
      path.resolve(__dirname, root[i]),
      { force: true, recursive: true }
    ))
  });
};

module.exports = {
  init
};
