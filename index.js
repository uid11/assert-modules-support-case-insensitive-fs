#!/usr/bin/env node

'use strict';

const {readdirSync, statSync} = require('fs');
const {join, resolve} = require('path');

const modulesExtensions = ['cjs', 'js', 'json', 'jsx', 'mjs', 'ts', 'tsx', 'vue'];

const getBaseAndExtension = (filename) => {
  const lastPointIndex = filename.lastIndexOf('.');

  if (lastPointIndex === -1) {
    return {base: filename, extension: ''};
  }

  return {
    base: filename.slice(0, lastPointIndex),
    extension: filename.toLowerCase().slice(lastPointIndex + 1),
  };
};

const getDirsAndModules = (path) => {
  const fullNames = readdirSync(path);
  const dirs = [];
  const modulesToFullNames = new Map();

  for (const fullName of fullNames) {
    const fullPath = join(path, fullName);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      dirs.push(fullPath);
      modulesToFullNames.set(fullName, fullName);
    } else {
      const {base, extension} = getBaseAndExtension(fullName);

      if (modulesExtensions.includes(extension)) {
        modulesToFullNames.set(base, fullName);
      }
    }
  }

  return {dirs, modulesToFullNames};
};

class AssertModulesSupportCaseInsensitiveFSError extends Error {
  constructor({originModule, duplicateModule, path}) {
    super(
      `Modules "${originModule}" and "${duplicateModule}" in directory ${resolve(
        path,
      )} are not supported in case-insensitive file systems`,
    );
  }
}

const assertDir = (path) => {
  const {dirs, modulesToFullNames} = getDirsAndModules(path);
  const lowerCaseToModules = new Map();

  for (const moduleName of modulesToFullNames.keys()) {
    const lowerCaseName = moduleName.toLowerCase();

    if (lowerCaseToModules.has(lowerCaseName)) {
      throw new AssertModulesSupportCaseInsensitiveFSError({
        originModule: modulesToFullNames.get(moduleName),
        duplicateModule: modulesToFullNames.get(lowerCaseToModules.get(lowerCaseName)),
        path,
      });
    }

    lowerCaseToModules.set(lowerCaseName, moduleName);
  }

  dirs.forEach(assertDir);
};

const assertModulesSupportCaseInsensitiveFS = (paths) => {
  paths.forEach(assertDir);
};

if (require.main && require.main.id === module.id) {
  const args = process.argv.slice(2);

  assertModulesSupportCaseInsensitiveFS(args);
}

module.exports = assertModulesSupportCaseInsensitiveFS;
module.exports.default = assertModulesSupportCaseInsensitiveFS;
module.exports.assertModulesSupportCaseInsensitiveFS = assertModulesSupportCaseInsensitiveFS;
