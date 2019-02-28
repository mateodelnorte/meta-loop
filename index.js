#!/usr/bin/env node

const fs = require('fs');
const debug = require('debug')('meta-loop');
const getMetaFile = require('get-meta-file');
const loop = require('loop');
const path = require('path');
const util = require('util');

module.exports = function (command) {
 
  function getChildFolders(parentFolder, recursive) {
    const meta = getMetaFile({confirmInMetaRepo: true});
    const projects = meta.projects; 
    let childFolders = Object.keys(projects).map((folder) => { return path.resolve(folder); });
    if (recursive) {
      childFolders = childFolders.reduce(function (folders, folder) {
        process.chdir(folder);
        if (fs.existsSync('.meta')) {
          folders = folders.concat(getChildFolders(folder,recursive));
        }
        return folders;
      }, childFolders);
      process.chdir(parentFolder);
    }
    return childFolders;
  }
  const folders = getChildFolders(process.cwd(),process.argv.indexOf('--recursive') >= 0);
  const exitOnError = process.argv.indexOf('--exit-on-error') >= 0;
  const exitOnAggregateError = process.argv.indexOf('--exit-on-aggregated-error') >= 0;
  
  folders.unshift(process.cwd());
  // remove loop flags, and let loop pick them up from process.env
  ['--exclude', '--exclude-only', '--include', '--include-only', '--recursive'].forEach((flag) => {
    const flagIndex = command.indexOf(flag);
    if (flagIndex > -1) {
      command = command.substring(0, flagIndex);
    }
  });

  loop({
    command: command,
    directories: folders,
    exitOnError: exitOnError,
    exitOnAggregateError: exitOnAggregateError,
  });
  
};

module.exports.register = (program) => {

  program
    .command('exec', 'execute a command against meta repo and child repo dirs')
    .alias('loop')

}
