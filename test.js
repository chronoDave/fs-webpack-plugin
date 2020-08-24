const test = require('tape');
const fse = require('fs-extra');

const FsWebpackPlugin = require('./index');

const mockCompiler = {
  hooks: {
    beforeRun: {
      tap: (_, func) => func()
    }
  }
};

// Shouldn't crash nor do anything
test('No options', t => {
  try {
    const plugin = new FsWebpackPlugin();
    plugin.apply(mockCompiler);
  } catch (err) {
    t.end(err);
  }

  t.end();
});

// Should remove files
test('Remove', t => {
  // Regular file
  try {
    fse.createFileSync('test.txt');

    const plugin = new FsWebpackPlugin({ remove: 'test.txt' });
    plugin.apply(mockCompiler);

    t.false(fse.existsSync('test.txt'));
  } catch (err) {
    t.end(err);
  }

  // Nested glob
  try {
    fse.mkdirpSync('test');
    fse.createFileSync('test/test.txt');

    const plugin = new FsWebpackPlugin({ remove: ['test/**/*'] });
    plugin.apply(mockCompiler);

    t.false(fse.existsSync('test/test.txt'));

    fse.removeSync('test');
  } catch (err) {
    t.end(err);
  }

  t.end();
});

// Should copy files
test('Copy', t => {
  // Regular file
  try {
    fse.createFileSync('test.txt');
    fse.mkdirpSync('test');

    const plugin = new FsWebpackPlugin({ copy: { files: 'test.txt', to: 'test' } });
    plugin.apply(mockCompiler);

    t.true(fse.existsSync('test/test.txt'));

    fse.removeSync('test.txt');
    fse.removeSync('test');
  } catch (err) {
    t.end(err);
  }

  // Nested glob
  try {
    fse.mkdirpSync('test');
    fse.createFileSync('test/test.txt');
    fse.mkdirpSync('output');

    const plugin = new FsWebpackPlugin({ copy: { files: 'test/**/*', to: 'output' } });
    plugin.apply(mockCompiler);

    t.true(fse.existsSync('output/test.txt'));

    fse.removeSync('test');
    fse.removeSync('output');
  } catch (err) {
    t.end(err);
  }

  t.end();
});
