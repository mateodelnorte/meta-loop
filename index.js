#!/usr/bin/env node

const fs = require('fs');
const debug = require('debug')('meta-loop');
const getMetaFile = require('get-meta-file');
const loop = require('loop');
const path = require('path');
const util = require('util');

module.exports = function(command) {
  const meta = getMetaFile({ confirmInMetaRepo: true });
  if (!meta) return;

  let projects = meta.projects;
  let subsets = [];
  let folders = [];

  const subsetsIndex = command.indexOf('--subsets ');
  const subsetsValueIndex = subsetsIndex + 10;
  if (subsetsIndex > -1 && command.length > subsetsValueIndex) {
    const subsetsList = command.substring(subsetsValueIndex);
    let endSubsetIndex = subsetsList.indexOf(' ');
    if (endSubsetIndex === -1) {
      endSubsetIndex = command.length;
    }
    subsets = command.substring(subsetsValueIndex, endSubsetIndex).split(',');
  }

  if (subsets.length) {
    for (let subset of subsets) {
      if (subset.startsWith('/')) {
        subset = subset.substring(1);
      }
      let subsetProjects = subset.split('/').reduce((o, i) => o[i], projects);
      if (subsetProjects) {
        subsetProjects = recursiveSearch(subsetProjects);
        folders = folders.concat(
          subsetProjects.map(folder => {
            return path.resolve(folder);
          })
        );
      } else {
        console.log(`WARNING: subset \'${subset}\' not found in projects.`);
      }
    }
    command = command.split(' ')[0];
  } else {
    projects = recursiveSearch(projects);
    folders = projects.map(folder => {
      return path.resolve(folder);
    });
  }

  const exitOnError = process.argv.indexOf('--exit-on-error') >= 0;
  const exitOnAggregateError = process.argv.indexOf('--exit-on-aggregated-error') >= 0;

  folders.unshift(process.cwd());

  // remove loop flags, and let loop pick them up from process.env
  ['--exclude', '--exclude-only', '--include', '--include-only', '--parallel'].forEach(flag => {
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

const recursiveSearch = (obj, results = []) => {
  const r = results;
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (typeof value !== 'object') {
      r.push(key);
    } else if (typeof value === 'object') {
      recursiveSearch(value, r);
    }
  });
  return r;
};

module.exports.register = program => {
  program.command('exec', 'execute a command against meta repo and child repo dirs').alias('loop');
};
