const fs = require('fs');
const path = require('path');

const tape = require('tape');

const { init } = require('./_utils');
const remove = require('../src/remove');

tape('[remove] should delete files', t => {
  const { files, logger, cleanup } = init();

  try {
    remove(logger)(files.map(file => file.from));
  } catch (err) {
    t.fail(err);
  }

  files.forEach(file => t.false(fs.existsSync(file.from), file.from));

  cleanup();

  t.end();
});

tape('[remove] should not delete files if `dry` is true', t => {
  const { files, logger, cleanup } = init();

  try {
    remove(logger)(files.map(file => file.from), { dry: true });
  } catch (err) {
    t.fail(err);
  }

  files.forEach(file => t.true(fs.existsSync(file.from), file.from));

  cleanup();

  t.end();
});

tape('[remove] should delete folders', t => {
  const { files, logger, cleanup } = init();
  const dirs = files.map(file => ({
    from: path.parse(file.from).dir,
    to: path.parse(file.to).dir
  }));

  try {
    remove(logger)(dirs.map(dir => dir.from));
  } catch (err) {
    t.fail(err);
  }

  dirs.forEach(dir => t.false(fs.existsSync(dir.from), dir.from));

  cleanup();

  t.end();
});

tape('[remove] should not delete folders if `dry` is true', t => {
  const { files, logger, cleanup } = init();
  const dirs = files.map(file => ({
    from: path.parse(file.from).dir,
    to: path.parse(file.to).dir
  }));

  try {
    remove(logger)(dirs.map(dir => dir.from), { dry: true });
  } catch (err) {
    t.fail(err);
  }

  dirs.forEach(dir => t.true(fs.existsSync(dir.from), dir.from));

  cleanup();

  t.end();
});
