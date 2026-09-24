#!/usr/bin/env node
/*
 * Builds the folder that gets published to GitHub Pages: _site/
 *
 * The site is the repo's own files, copied as they are. There is no
 * bundling or compiling. It leaves out tests (*.spec.js) and notes (*.md),
 * and adds .nojekyll so GitHub Pages serves the files untouched.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '_site');
const INCLUDE = ['index.html', 'catalog.js', 'shared', 'tools'];
const SKIP = [/\.spec\.js$/, /\.md$/];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT);

let count = 0;
INCLUDE.forEach((entry) => {
  fs.cpSync(path.join(ROOT, entry), path.join(OUT, entry), {
    recursive: true,
    filter: (src) => {
      const skip = SKIP.some((pattern) => pattern.test(src));
      if (!skip && fs.statSync(src).isFile()) count++;
      return !skip;
    }
  });
});
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

console.log('Built _site/ with ' + count + ' files.');
