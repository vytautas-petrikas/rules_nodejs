const fs = require('fs');
const path = require('path');

function read(relativePath) {
  // TODO(#32) Can shorten the path if https://github.com/bazelbuild/rules_nodejs/issues/32 is resolved
  const path = `build_bazel_rules_nodejs/internal/e2e/rollup/${relativePath}`;
  return fs.readFileSync(require.resolve(path), { encoding: 'utf-8' }).replace(/\r\n/g, '\n');
}

// These keys are arbitrary and local to this test.
const update_var = 'UPDATE_GOLDEN'
const update_val = '1'

if (process.env[update_var] && process.env['TEST_SRCDIR']) {
  throw new Error(`Cannot use ${update_var} when run as a test. Use bazel run instead.`);
}

function check(actual, expected) {
  if (read(actual) !== read(expected)) {
    if (process.env[update_var] === update_val) {
      writePath = path.join(__dirname, expected);
      fs.writeFileSync(writePath, read(actual));
      console.error('Replaced ', writePath);
    } else {
      fail(`Actual output in ${actual} doesn't match golden file ${expected}.
      Update the golden file:

            bazel run --define ${update_var}=${update_val} ${process.env['BAZEL_TARGET']}`);
    }
  }
}

describe('bundling', () => {
  it('should work', () => {
    check('bundle.min.js', 'bundle-min_golden.js');
  });
  it('should produce a debug bundle', () => {
    check('bundle.min_debug.js', 'bundle-min-debug_golden.js');
  });
});