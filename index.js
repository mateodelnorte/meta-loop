#!/usr/bin/env node

const fs = require('fs');
const debug = require('debug')('meta-loop');
const getMetaFile = require('get-meta-file');
const loop = require('loop');
const path = require('path');
const util = require('util');

module.exports = function (command) {
  
  const meta = getMetaFile();
  const projects = meta.projects;
  const folders = Object.keys(projects).map((folder) => { return path.resolve(folder); });

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
    directories: folders
  });
};