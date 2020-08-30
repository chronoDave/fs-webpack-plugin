const tape = require('tape');
const fse = require('fs-extra');
const path = require('path');
const webpack = require('webpack');

const FsWebpackPlugin = require('./index');

const root = path.resolve(__dirname, 'test');
const files = [
  path.resolve(root, 'test_1.txt'),
  path.resolve(root, 'test_2.txt'),
  path.resolve(root, 'test_3.txt')
];

const sleep = t => new Promise(resolve => setTimeout(resolve, t));
const promiseWebpack = options => new Promise((resolve, reject) => (
  webpack(options, (err, stats) => {
    if (err) return reject(err);
    return resolve(stats);
  })
));
const createTestFiles = () => {
  fse.mkdirpSync(root);
  for (let i = 0; i < files.length; i += 1) fse.writeFileSync(files[i], i);
};

tape('Should not throw with no parameters', async t => {
  try {
    await promiseWebpack({ plugins: [new FsWebpackPlugin()] });
    t.end();
  } catch (err) {
    t.fail(err.message);
  }
});

tape('Should throw if strict is enabled', async t => {
  try {
    await promiseWebpack({ plugins: [new FsWebpackPlugin('fail', { strict: true })] });
    t.fail('Expected error');
  } catch (err) {
    t.end();
  }
});

tape('Should delete files', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'delete',
        files: 'test/**/*',
        hooks: ['beforeRun']
      }])]
    });

    for (let i = 0; i < files.length; i += 1) t.false(fse.existsSync(files[i]));
  } catch (err) {
    t.fail(err.message);
  }

  fse.removeSync(root);
  await sleep(10);

  t.end();
});

tape('Should copy files', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'copy',
        files: 'test/**/*',
        to: 'test/copy',
        hooks: ['beforeRun']
      }])]
    });

    for (let i = 0; i < files.length; i += 1) {
      t.true(fse.existsSync(path.resolve(root, 'copy', files[i])));
    }
  } catch (err) {
    t.fail(err.message);
  }

  fse.removeSync(root);
  await sleep(10);

  t.end();
});

tape('Should chain multiple commands', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'copy',
        files: 'test/**/*',
        to: 'test/copy',
        hooks: ['beforeRun']
      }, {
        type: 'delete',
        files: 'test/**/*',
        hooks: ['beforeRun']
      }
      ])]
    });

    for (let i = 0; i < files.length; i += 1) t.false(fse.existsSync(files[i]));
  } catch (err) {
    t.fail(err.message);
  }

  fse.removeSync(root);
  await sleep(10);

  t.end();
});

tape('Should accept root option', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'copy',
        files: '*',
        to: 'copy',
        root,
        hooks: ['beforeRun']
      }])]
    });

    for (let i = 0; i < files.length; i += 1) {
      t.true(fse.existsSync(path.resolve(root, 'copy', files[i])));
    }
  } catch (err) {
    t.fail(err.message);
  }

  fse.removeSync(root);
  await sleep(10);

  t.end();
});
