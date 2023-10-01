"use strict";
const fs = require('node:fs');
const path = require('node:path');

const firstRun = {
  hasInited: false,
  hasCachedCommands: false,
  cachedCommands: []
}

const essentialFolders = {
  playlistFolder: "../../playlistFolder",
  guilds_settings: "../../guilds_settings"
};

function handleFile(filePath) {
  const commandFunction = require(filePath);
  const commmand = [];

  if (Array.isArray(commandFunction.aliases)) {
    for (let alias of commandFunction.aliases) { commmand.push(commandFunction); }
    return commmand;
  }

  commmand.push(commandFunction);
  return commmand;
}

function handleAppend(command, location, insideFolder) {
  if (path.extname(location) !== ".js") { return; }

  const listOfCommands = handleFile(location);
  if (insideFolder) {for (let wow of listOfCommands) {wow.category = insideFolder;}}

  for (let [ i, times ] of listOfCommands.entries()) {
    if (Array.isArray(times.aliases)) {
      command[times.aliases[i]] = times;
      continue;
    }
    command[times.aliases] = times;
  }

  return listOfCommands[0];
}

function getFirstOrString(aliases) {
  return Array.isArray(aliases) ? aliases[0] : aliases;
}

function commands() {
  if (firstRun.hasCachedCommands) { return firstRun.cachedCommands; }

  const commandPath = path.join(__dirname, "../../Commands");

  const commmand = {};
  const status = {};
  let stat;

  for (let [ index, file ] of fs.readdirSync(commandPath).entries()) {
    let relPath = path.join(commandPath, file);
    if (fs.statSync(relPath).isFile()) {
      stat = handleAppend(commmand, relPath);
      status[ getFirstOrString(stat.aliases) ] = { ...stat };
      delete status[ getFirstOrString(stat.aliases) ].main;
      continue;
    }
    for (let sec_file of fs.readdirSync(relPath)) {
      stat = handleAppend(commmand, path.join(relPath, sec_file), file);
      status[ getFirstOrString(stat.aliases) ] = { ...stat };
      delete status[ getFirstOrString(stat.aliases) ].main;
      delete status[ getFirstOrString(stat.aliases) ].permissions;
    }
  }

  firstRun.hasCachedCommands = true;
  firstRun.cachedCommands = [ commmand, status ];
  return firstRun.cachedCommands;
}

function Start() {
  this.commands = commands;
  this.init = () => {
    if (firstRun.hasInited) { return this; }

    for (let folder of Object.values(essentialFolders)) {
      const pathToFolder = path.join(__dirname, folder);

      if (fs.existsSync(pathToFolder)) { continue; };
      const dirPath = fs.mkdirSync(pathToFolder, { recursive: true });
      console.log(dirPath, 'directory created successfully!');
    }

    firstRun.hasInited = true;
    return this;
  }
}

module.exports = {
  essentialFolders: essentialFolders,
  default: new Start()
};
