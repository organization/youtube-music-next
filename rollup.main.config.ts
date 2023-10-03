import { defineConfig } from 'rollup';
import builtinModules from 'builtin-modules';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolvePlugin from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import { string } from 'rollup-plugin-string';
import css from 'rollup-plugin-import-css';
import wasmPlugin from '@rollup/plugin-wasm';
import copy from 'rollup-plugin-copy';

export default defineConfig({
  plugins: [
    typescript({
      module: 'ESNext',
    }),
    nodeResolvePlugin({
      browser: false,
      preferBuiltins: true,
    }),
    commonjs({
      strictRequires: false,
      ignoreDynamicRequires: true,
    }),
    json(),
    string({
      include: '**/*.html',
    }),
    css(),
    wasmPlugin(),
    copy({
      targets: [
        { src: 'assets', dest: 'dist/' },
      ],
    }),
    terser({
      ecma: 2020,
    }),
  ],
  input: './index.ts',
  output: {
    format: 'cjs',
    name: '[name].js',
    dir: './dist',
  },
  external: [
    'electron',
    'sharp',
    'xml2js',
    'youtubei.js',
    ...builtinModules,
  ],
});
