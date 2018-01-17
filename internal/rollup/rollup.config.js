const rollup = require('rollup');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const path = require('path');

class NormalizePaths {
  resolveId(importee, importer) {
    // process.cwd() is the execroot and ends up looking something like /.../2c2a834fcea131eff2d962ffe20e1c87/bazel-sandbox/872535243457386053/execroot/<workspace_name>
    // from the path to the es6 output is bazel-out/host/bin/<build_file_path>/rollup.runfiles/<workspace_name>/<build_file_path>/bazel-out/host/bin
    const workspaceName = "TMPL_workspace_name"
    const buildFilePath = "TMPL_build_file_path"
    const firstSegment = importee.split('/')[0]
    const importerDir = importer ? path.dirname(importer) : "";

    if (firstSegment === 'bazel-out') {
      // entry point is a relative path from the execroot
      return `${process.cwd()}/${importee}.js`;
    } else if (firstSegment === '.' || firstSegment === '..') {
      // relative import
      return `${importerDir}/${importee}.js`;
    } else if (firstSegment === workspaceName) {
      // workspace import
      return require.resolve(importee, importer).replace(
        "bazel-out/host/bin/",
        `bazel-out/host/bin/${buildFilePath}/rollup.runfiles/${workspaceName}/${buildFilePath}/bazel-out/host/bin/`);
    }
  }
}

export default {
  output: {format: 'iife'},
  plugins: [
      new NormalizePaths(),
      commonjs(),
      nodeResolve({jsnext: true, module: true}),
    ]
}