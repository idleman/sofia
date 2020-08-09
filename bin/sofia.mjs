#!/usr/bin/env node --experimental-modules --experimental-vm-modules --harmony-weak-refs

import Sofia from '../src/Sofia.mjs';
import _glob from 'glob';


function getNormalizedPath(path) {
  path = path
    .replace(/(\\)+/g, '/')
    .replace(/(\/)+/g, '/');

  const parts = path.split('/');
  const result = [];
  while(parts.length) {
    const part = parts.shift();
    if(part === '..') {
      result.pop();
      continue;
    }
    if(part === '.') {
      continue;
    }
    result.push(part);
  }

  return 'file:///' + result.join('/');
};

const getFilesByPattern = pattern => new Promise((resolve, reject) => _glob(pattern, { absolute: true, ignore: ['**/node_modules/**'] }, (err, files) => err ? reject(err) : resolve(files)));

(async () => {
  const { argv = [] } = process;
  const patterns = argv.slice(2);
  const patternResults = await Promise.all(patterns.map(pattern => getFilesByPattern(pattern)));
  const files = [...new Set(patternResults.flat())]
    .map(file => getNormalizedPath(file));
    
  const sofia = new Sofia();
  files.forEach(file => sofia.addFile(file));
  try {
    await sofia.run();
    process.exit(0);
  } catch(err) {
    process.exit(1);
  }
})();
