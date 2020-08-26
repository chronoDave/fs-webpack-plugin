const tape = require('tape');
const fse = require('fs-extra');
const path = require('path');

const FsWebpackPlugin = require('./index');

const mockCompiler = {
  hooks: {
    beforeRun: { tap: (_, func) => func() },
    watchRun: { tapPromise: (_, func) => func() }
  }
};
const root = path.resolve(__dirname, 'test');
const files = [
  path.resolve(root, 'test_1.txt'),
  path.resolve(root, 'test_2.txt'),
  path.resolve(root, 'test_3.txt')
];

const sleep = t => new Promise(resolve => setTimeout(resolve, t));

tape('Should not crash with no parameters', t => {
  try {
    const plugin = new FsWebpackPlugin();
    plugin.apply(mockCompiler);
  } catch (err) {
    t.end(err);
  }

  t.end();
});

tape('Should delete files', async t => {
  try {
    fse.mkdirpSync(root);
    for (let i = 0; i < files.length; i += 1) fse.writeFileSync(files[i], i);

    const plugin = new FsWebpackPlugin([
      { type: 'delete', files: 'test/**/*' }
    ], false);
    plugin.apply(mockCompiler);

    for (let i = 0; i < files.length; i += 1) t.false(fse.existsSync(files[i]));
  } catch (err) {
    t.end(err);
  }

  fse.removeSync(root);

  await sleep(10);

  t.end();
});

tape('Should copy files', async t => {
  try {
    fse.mkdirpSync(root);
    for (let i = 0; i < files.length; i += 1) fse.writeFileSync(files[i], i);

    const plugin = new FsWebpackPlugin([
      { type: 'copy', files: 'test/**/*', to: 'test/copy' }
    ], false);
    plugin.apply(mockCompiler);

    for (let i = 0; i < files.length; i += 1) {
      t.true(fse.existsSync(path.resolve(root, 'copy', files[i])));
    }
  } catch (err) {
    t.end(err);
  }

  fse.removeSync(root);

  await sleep(10);

  t.end();
});

tape('Should chain multiple commands', async t => {
  try {
    fse.mkdirpSync(root);
    for (let i = 0; i < files.length; i += 1) fse.writeFileSync(files[i], i);

    const plugin = new FsWebpackPlugin([
      { type: 'copy', files: 'test/**/*', to: 'test/copy' },
      { type: 'delete', files: 'test/**/*' }
    ], false);
    plugin.apply(mockCompiler);

    for (let i = 0; i < files.length; i += 1) t.false(fse.existsSync(files[i]));
  } catch (err) {
    t.end(err);
  }

  fse.removeSync(root);

  await sleep(10);

  t.end();
});
