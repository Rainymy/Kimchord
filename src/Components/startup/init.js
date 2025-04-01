"use strict";
const fs = require('node:fs');
const path = require('node:path');

/**
* @typedef {import("../../Commands/CommandModule").CommandModule} CommandModule
* @typedef {import("./folder").IMPORTANT_FOLDER} IMPORTANT_FOLDER
*/

const firstRun = {
  hasCachedCommands: false,
  cachedCommands: []
}


/** @type {Record<IMPORTANT_FOLDER, IMPORTANT_FOLDER>} */
const EssentialFolder = {
  PLAYLIST_FOLDER: "PLAYLIST_FOLDER",
  GUILDS_SETTINGS_FOLDER: "GUILDS_SETTINGS_FOLDER",
  COMMANDS_FOLDER: "COMMANDS_FOLDER"
}

/** @type {Map<IMPORTANT_FOLDER, String>} */
const essentialFolders = new Map([
  [EssentialFolder.PLAYLIST_FOLDER, "./"],
  [EssentialFolder.GUILDS_SETTINGS_FOLDER, "./"],
  [EssentialFolder.COMMANDS_FOLDER, "./"]
])


/**
* @param {String} filePath
* @returns
*/
function handleFile(filePath) {
  const commandFunction = require(filePath);
  const commmand = [];

  if (Array.isArray(commandFunction.aliases)) {
    for (let alias of commandFunction.aliases) {
      commmand.push(commandFunction);
    }
    return commmand;
  }

  commmand.push(commandFunction);
  return commmand;
}

function handleAppend(command, location, insideFolder) {
  if (path.extname(location) !== ".js") { return; }

  const listOfCommands = handleFile(location);
  if (insideFolder) {
    for (let wow of listOfCommands) {
      wow.category = insideFolder;
    }
  }

  for (let [i, times] of listOfCommands.entries()) {
    if (Array.isArray(times.aliases)) {
      command[times.aliases[i]] = times;
      continue;
    }
    command[times.aliases] = times;
  }

  return listOfCommands[0];
}

/**
* @param {String|String[]} aliases
* @returns {String}
*/
function getFirstOrString(aliases) {
  return Array.isArray(aliases) ? aliases[0] : aliases;
}

function commands() {
  if (firstRun.hasCachedCommands) { return firstRun.cachedCommands; }

  const commandPath = essentialFolders.get(EssentialFolder.COMMANDS_FOLDER);

  const commmand = {};
  const status = {};
  let stat;

  for (const file of fs.readdirSync(commandPath)) {
    let relPath = path.join(commandPath, file);

    if (fs.statSync(relPath).isFile()) {
      stat = handleAppend(commmand, relPath);
      status[getFirstOrString(stat.aliases)] = { ...stat };
      delete status[getFirstOrString(stat.aliases)].main;
      continue;
    }
    for (let sec_file of fs.readdirSync(relPath)) {
      stat = handleAppend(commmand, path.join(relPath, sec_file), file);
      status[getFirstOrString(stat.aliases)] = { ...stat };
      delete status[getFirstOrString(stat.aliases)].main;
      delete status[getFirstOrString(stat.aliases)].permissions;
    }
  }

  firstRun.hasCachedCommands = true;
  firstRun.cachedCommands = [commmand, status];
  return firstRun.cachedCommands;
}

function Start() {
  this.commands = commands;
}

function ensureEssentialFolders() {
  for (let pathToFolder of essentialFolders.values()) {

    if (fs.existsSync(pathToFolder)) { continue; };

    const dirPath = fs.mkdirSync(pathToFolder, { recursive: true });

    console.log(dirPath, 'directory created successfully!');
  }
}

/**
* @param {IMPORTANT_FOLDER} folderEnum
* @returns {String=}
*/
function getEssentialFolder(folderEnum) {
  return essentialFolders.get(folderEnum);
}

/**
* @param {IMPORTANT_FOLDER} folderEnum
* @param {String} folderPath
* @returns
*/
function setEssentialFolder(folderEnum, folderPath) {
  return essentialFolders.set(folderEnum, folderPath);
}

module.exports = {
  EssentialFolder: EssentialFolder,
  getEssentialFolder: getEssentialFolder,
  setEssentialFolder: setEssentialFolder,
  ensureEssentialFolders: ensureEssentialFolders,
  default: new Start()
};
