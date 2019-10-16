import pkg from './package.json';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [
  {
    input: 'index.js',
    output: {
      file: pkg.browser,
      format: 'umd'
    },
    plugins: [resolve(), commonjs()]
  },
  {
    input: 'index_full.js',
    output: {
      file: pkg.browserFull,
      format: 'umd'
    },
    plugins: [resolve(), commonjs()]
  },
  {
    input: 'index_elevate.js',
    output: {
      file: pkg.browserElevate,
      format: 'umd'
    },
    plugins: [resolve(), commonjs()]
  },
  {
    input: 'index_sheet.js',
    output: {
      file: pkg.browserSheet,
      format: 'umd'
    },
    plugins: [resolve(), commonjs()]
  },
  {
    input: 'index_cube.js',
    output: {
      file: pkg.browserCube,
      format: 'umd'
    },
    plugins: [resolve(), commonjs()]
  },
  {
    input: 'index_interactive.js',
    output: {
      file: pkg.browserInteractive,
      format: 'umd'
    },
    plugins: [resolve(), commonjs()]
  },
  {
    input: 'index_radial.js',
    output: {
      file: pkg.browserRadial,
      format: 'umd'
    },
    plugins: [resolve(), commonjs()]
  }
];
