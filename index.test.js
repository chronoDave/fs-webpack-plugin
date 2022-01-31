const fs = require('fs');
const path = require('path');

const tape = require('tape');
const webpack = require('webpack');

const FsWebpackPlugin = require('./index');

const testFolder = '_test';
const outputFolder = '_dist';
const testFolderAbsolute = path.resolve(__dirname, testFolder);
const outputFolderAbsolute = path.resolve(__dirname, outputFolder);

const files = [
  testFolder,
  path.join(testFolder, 'nested'),
  path.join(testFolder, 'deeply/nested')
].reduce((acc, relative, i) => {
  const name = `${i}.txt`;

  return ({
    ...acc,
    [i]: {
      name,
      relative: path.join(relative, name),
      absolute: path.resolve(__dirname, relative, name)
    }
  });
}, {});

const createTestFiles = () => {
  for (let i = 0, v = Object.values(files); i < v.length; i += 1) {
    const file = v[i];

    fs.mkdirSync(path.dirname(file.absolute), { recursive: true });
    fs.writeFileSync(file.absolute, `${i}`);
  }
};

const promiseWebpack = options => new Promise((resolve, reject) => (
  webpack(options, (err, stats) => {
    if (err) return reject(err);
    return resolve(stats);
  })
));

/** Constructor */
tape('[constructor] should not throw if parameters are not assigned', async t => {
  try {
    await promiseWebpack({ plugins: [new FsWebpackPlugin()] });
  } catch (err) {
    t.fail(err);
  }

  t.end();
});

tape('[constructor] should throw if `strict` is true', async t => {
  try {
    await promiseWebpack({ plugins: [new FsWebpackPlugin('fail', { strict: true })] });
    t.fail(new Error('Expected error'));
  } catch (err) {
    // Success
  }

  t.end();
});

/** Delete */
tape('[delete] should delete directory, recursively', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'delete',
        files: testFolder,
        root: __dirname
      }], { strict: true })]
    });

    t.false(fs.existsSync(path.resolve(__dirname, testFolder)));
  } catch (err) {
    t.fail(err);
  }

  fs.rmSync(testFolderAbsolute, { force: true, recursive: true });

  t.end();
});

tape('[delete] should delete files', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'delete',
        files: [files[1].relative],
        root: __dirname
      }], { strict: true })]
    });

    t.true(fs.existsSync(files[0].absolute));
    t.false(fs.existsSync(files[1].absolute));
    t.true(fs.existsSync(files[2].absolute));
  } catch (err) {
    t.fail(err);
  }

  fs.rmSync(testFolderAbsolute, { force: true, recursive: true });

  t.end();
});

tape('[delete] should not delete if `dry` is true', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'delete',
        files: ['_test'],
        root: __dirname
      }], { dry: true, strict: true })]
    });

    t.true(fs.existsSync(testFolderAbsolute));
  } catch (err) {
    t.fail(err);
  }

  fs.rmSync(testFolderAbsolute, { force: true, recursive: true });

  t.end();
});

/** Copy */
tape('[copy] should copy file', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'copy',
        files: {
          from: files[1].relative,
          to: outputFolder
        },
        root: __dirname
      }], { strict: true })]
    });

    t.false(fs.existsSync(path.resolve(outputFolderAbsolute, files[0].relative)));
    t.true(fs.existsSync(path.resolve(outputFolderAbsolute, files[1].name)));
    t.false(fs.existsSync(path.resolve(outputFolderAbsolute, files[2].relative)));
  } catch (err) {
    t.fail(err);
  }

  fs.rmSync(testFolderAbsolute, { force: true, recursive: true });
  fs.rmSync(outputFolderAbsolute, { force: true, recursive: true });

  t.end();
});

tape('[copy] should copy directory, recursively', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'copy',
        files: {
          from: testFolder,
          to: outputFolder
        },
        root: __dirname
      }], { strict: true })]
    });

    t.true(fs.existsSync(path.resolve(outputFolderAbsolute, files[0].relative)));
    t.true(fs.existsSync(path.resolve(outputFolderAbsolute, files[1].relative)));
    t.true(fs.existsSync(path.resolve(outputFolderAbsolute, files[2].relative)));
  } catch (err) {
    t.fail(err);
  }

  fs.rmSync(testFolderAbsolute, { force: true, recursive: true });
  fs.rmSync(outputFolderAbsolute, { force: true, recursive: true });

  t.end();
});

tape('[copy] should not copy directory, recursively, if `dry` is true', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'copy',
        files: {
          from: testFolder,
          to: outputFolder
        },
        root: __dirname
      }], { strict: true, dry: true })]
    });

    t.false(fs.existsSync(path.resolve(outputFolderAbsolute, files[0].relative)));
    t.false(fs.existsSync(path.resolve(outputFolderAbsolute, files[1].relative)));
    t.false(fs.existsSync(path.resolve(outputFolderAbsolute, files[2].relative)));
  } catch (err) {
    t.fail(err);
  }

  fs.rmSync(testFolderAbsolute, { force: true, recursive: true });
  fs.rmSync(outputFolderAbsolute, { force: true, recursive: true });

  t.end();
});

/** Chain */
tape('[chain] should chain commands', async t => {
  try {
    createTestFiles();

    await promiseWebpack({
      plugins: [new FsWebpackPlugin([{
        type: 'delete',
        files: files[1].relative,
        root: __dirname
      }, {
        type: 'copy',
        files: {
          from: testFolder,
          to: outputFolder
        },
        root: __dirname
      }], { strict: true })]
    });

    t.true(fs.existsSync(path.resolve(outputFolderAbsolute, files[0].relative)));
    t.false(fs.existsSync(path.resolve(outputFolderAbsolute, files[1].relative)));
    t.true(fs.existsSync(path.resolve(outputFolderAbsolute, files[2].relative)));
  } catch (err) {
    t.fail(err);
  }

  fs.rmSync(testFolderAbsolute, { force: true, recursive: true });
  fs.rmSync(outputFolderAbsolute, { force: true, recursive: true });

  t.end();
});
