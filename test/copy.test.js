const fs = require('fs');
const path = require('path');

const tape = require('tape');

const { init } = require('./_utils');
const copy = require('../src/copy');

tape('[copy] should copy files', t => {
  const { files, logger, cleanup } = init();

  try {
    copy(logger)(files);
  } catch (err) {
    t.fail(err);
  }

  files.forEach(file => t.true(fs.existsSync(file.to), file.from));

  cleanup();

  t.end();
});

tape('[copy] should not copy files recursively if `dry` is true', t => {
  const { files, logger, cleanup } = init();

  try {
    copy(logger, files, { dry: true });
  } catch (err) {
    t.fail(err);
  }

  files.forEach(file => t.false(fs.existsSync(file.to), file.from));

  cleanup();

  t.end();
});

tape('[copy] should copy folders', t => {
  const { files, logger, cleanup } = init();
  const dirs = files.map(file => ({
    from: path.parse(file.from).dir,
    to: path.parse(file.to).dir
  }));

  try {
    copy(logger)(dirs);
  } catch (err) {
    t.fail(err);
  }

  dirs.forEach(dir => t.true(fs.existsSync(dir.to), dir.from));

  cleanup();

  t.end();
});

tape('[copy] should not copy folders recursively if `dry` is true', t => {
  const { files, logger, cleanup } = init();
  const dirs = files.map(file => ({
    from: path.parse(file.from).dir,
    to: path.parse(file.to).dir
  }));

  try {
    copy(logger, dirs, { dry: true });
  } catch (err) {
    t.fail(err);
  }

  dirs.forEach(dir => t.false(fs.existsSync(dir.to), dir.from));

  cleanup();

  t.end();
});

tape('[copy] should copy file even if destination is folder', t => {
  const { files, logger, cleanup } = init();

  try {
    copy(logger)([{
      from: files[1].from,
      to: path.parse(files[1].to).dir
    }]);
  } catch (err) {
    t.fail(err);
  }

  t.true(fs.existsSync(files[1].to), files[1].from);
  t.false(fs.existsSync(files[0].to), files[0].from);

  cleanup();

  t.end();
});
