const tape = require('tape');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const FsWebpackPlugin = require('./index');

const root = path.resolve(__dirname, 'test');
const files = [
  path.resolve(root, 'test_1.txt'),
  path.resolve(root, 'nested/test_2.txt'),
  path.resolve(root, 'deeply/nested/test_3.txt')
];

const promiseWebpack = options => new Promise((resolve, reject) => (
  webpack(options, (err, stats) => {
    if (err) return reject(err);
    return resolve(stats);
  })
));

const createTestFiles = () => {
  for (let i = 0; i < files.length; i += 1) {
    fs.mkdirSync(files[i].split(path.sep).slice(0, -1).join(path.sep), { recursive: true });
    fs.writeFileSync(files[i], i);
  }
};

/** Constructor */
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

/** Delete */
tape('Should delete files', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{ type: 'delete', root: 'test' }])]
    });

    for (let i = 0; i < files.length; i += 1) t.false(fs.existsSync(files[i]));
  } catch (err) {
    t.fail(err.message);
  }

  fs.rmdirSync(root, { recursive: true });

  t.end();
});

tape('Should mock delete files if `dry` is true', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin(
        [{ type: 'delete', root: 'test' }],
        { dry: true }
      )]
    });

    for (let i = 0; i < files.length; i += 1) t.true(fs.existsSync(files[i]));
  } catch (err) {
    t.fail(err.message);
  }

  fs.rmdirSync(root, { recursive: true });

  t.end();
});

tape('Should delete folders', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'delete',
        root: 'test',
        files: false
      }])]
    });

    t.false(fs.existsSync('test'));
  } catch (err) {
    t.fail(err.message);
  }

  fs.rmdirSync(root, { recursive: true });

  t.end();
});

tape('Should mock delete folders if `dry` is true', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'delete',
        root: 'test',
        files: false
      }], { dry: true })]
    });

    t.true(fs.existsSync('test'));
  } catch (err) {
    t.fail(err.message);
  }

  fs.rmdirSync(root, { recursive: true });

  t.end();
});

/** Copy */
tape('Should copy files', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'copy',
        files: 'test/**/*',
        to: 'test/copy'
      }])]
    });

    for (let i = 0; i < files.length; i += 1) {
      t.true(fs.existsSync(path.resolve(root, 'copy', files[i])));
    }
  } catch (err) {
    t.fail(err.message);
  }

  fs.rmdirSync(root, { recursive: true });

  t.end();
});

tape('Should mock copy files if `dry` is true', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'copy',
        files: 'test/**/*',
        to: 'test/copy'
      }], { dry: true })]
    });

    t.false(fs.existsSync(path.resolve(root, 'copy')));
  } catch (err) {
    t.fail(err.message);
  }

  fs.rmdirSync(root, { recursive: true });

  t.end();
});

/** Chain */
tape('Should chain multiple commands', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'copy',
        files: 'test/**/*',
        to: 'test/copy'
      }, {
        type: 'delete',
        files: 'test/**/*'
      }])]
    });

    for (let i = 0; i < files.length; i += 1) t.false(fs.existsSync(files[i]));
  } catch (err) {
    t.fail(err.message);
  }

  fs.rmdirSync(root, { recursive: true });

  t.end();
});
