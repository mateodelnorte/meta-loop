#!/usr/bin/env node

const fs = require('fs');
const debug = require('debug')('meta-loop');
const loop = require('loop-things');
const path = require('path');
const util = require('util');

module.exports = function (command) {
  let meta = null; 
  let buffer = null;

  const metaLocation = path.join(process.cwd(), '.meta');

  try {
    buffer = fs.readFileSync(metaLocation);
    debug(`.meta file found at ${metaLocation}`);
  } catch (e) {
    debug(`no .meta file found at ${metaLocation}: ${e}`);
  }

  if (buffer) {
    try {
      meta = JSON.parse(buffer.toString());
      debug(`.meta file contents parsed: ${util.inspect(meta, null, Infinity)}`);
    } catch (e) {
      debug(`error parsing .meta JSON: ${e}`);
    }
  }

  if ( ! meta) return console.error(`No .meta file found in ${process.cwd()}. Are you in a meta repo?`);

  const projects = meta.projects;
  const folders = Object.keys(projects).map((folder) => { return path.resolve(folder); });

  folders.unshift(process.cwd());

  loop({
    command: command,
    directories: folders
  });
};