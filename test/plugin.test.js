const fs = require('fs');

const tape = require('tape');
const webpack = require('webpack');

const FsWebpackPlugin = require('../src/plugin');
const { init } = require('./_utils');

const promiseWebpack = options => new Promise((resolve, reject) => (
  webpack(options, (err, stats) => {
    if (err) return reject(err);
    return resolve(stats);
  })
));

/** Constructor */
tape('[plugin.constructor] should throw if parameters are not assigned', async t => {
  try {
    await promiseWebpack({ plugins: [new FsWebpackPlugin()] });
    t.fail('Expected to throw');
  } catch (err) {
    t.ok(err);
  }

  t.end();
});

/** Delete */
tape('[plugin.delete] should delete directory, recursively', async t => {
  const { root, cleanup } = init();

  try {
    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'delete',
        files: [root[1]]
      }], { strict: true })]
    });

    t.false(fs.existsSync(root[1]));
  } catch (err) {
    t.fail(err);
  }

  cleanup();
  t.end();
});

tape('[delete] should delete files', async t => {
  const { files, cleanup } = init();

  try {
    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'delete',
        files: [files[0].from]
      }], { strict: true })]
    });

    t.false(fs.existsSync(files[0].from));
    t.true(fs.existsSync(files[1].from));
  } catch (err) {
    t.fail(err);
  }

  cleanup();
  t.end();
});

tape('[delete] should not delete if `dry` is true', async t => {
  const { files, cleanup } = init();

  try {
    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'delete',
        files: [files[0].from],
      }], { dry: true, strict: true })]
    });

    t.true(fs.existsSync(files[0].from));
    t.true(fs.existsSync(files[1].from));
  } catch (err) {
    t.fail(err);
  }

  cleanup();
  t.end();
});

/** Copy */
tape('[copy] should copy file', async t => {
  const { files, cleanup } = init();

  try {
    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'copy',
        files: [files[0]]
      }], { strict: true })]
    });

    t.true(fs.existsSync(files[0].to));
    t.false(fs.existsSync(files[1].to));
  } catch (err) {
    t.fail(err);
  }

  cleanup();
  t.end();
});

tape('[copy] should copy directory, recursively', async t => {
  const { root, files, cleanup } = init();

  try {
    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'copy',
        files: [{
          from: root[0],
          to: root[1]
        }]
      }], { strict: true })]
    });

    files.forEach(file => t.true(fs.existsSync(file.to)));
  } catch (err) {
    t.fail(err);
  }

  cleanup();
  t.end();
});

tape('[copy] should not copy directory, recursively, if `dry` is true', async t => {
  const { root, files, cleanup } = init();

  try {
    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'copy',
        files: [{
          from: root[0],
          to: root[1]
        }]
      }], { strict: true, dry: true })]
    });

    files.forEach(file => t.false(fs.existsSync(file.to)));
  } catch (err) {
    t.fail(err);
  }

  cleanup();
  t.end();
});

/** Chain */
tape('[chain] should chain commands', async t => {
  const { root, files, cleanup } = init();

  try {
    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'delete',
        files: [files[0].from]
      }, {
        type: 'copy',
        files: [{
          from: root[0],
          to: root[1]
        }]
      }], { strict: true })]
    });

    t.false(fs.existsSync(files[0].from));
    t.true(fs.existsSync(files[1].from));
    t.false(fs.existsSync(files[0].to));
    t.true(fs.existsSync(files[1].to));
  } catch (err) {
    t.fail(err);
  }

  cleanup();
  t.end();
});
