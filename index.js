#!/usr/bin/env node

const fs = require('fs');
const debug = require('debug')('meta-loop');
const getMetaFile = require('get-meta-file');
const loop = require('loop');
const path = require('path');
const util = require('util');

module.exports = function (command) {
  
  const meta = getMetaFile({ confirmInMetaRepo: true });
  const projects = meta.projects;
  const folders = Object.keys(projects).map((folder) => { return path.resolve(folder); });

  const exitOnError = process.argv.indexOf('--exit-on-error') >= 0;
  const exitOnAggregatedError = process.argv.indexOf('--exit-on-aggregated-error') >= 0;

  folders.unshift(process.cwd());

  // remove loop flags, and let loop pick them up from process.env
  ['--exclude', '--exclude-only', '--include', '--include-only'].forEach((flag) => {
    const flagIndex = command.indexOf(flag);
    if (flagIndex > -1) {
      command = command.substring(0, flagIndex);
    }
  });

  loop({
    command: command,
    directories: folders,
    exitOnError: exitOnError,
    exitOnAggregatedError: exitOnAggregatedError,
  }, (errorOccured) => {
    if (exitOnAggregatedError && errorOccured) {
      console.log('an error occured during loop execution - exiting process');
      process.exit(1);
    }
  });
};