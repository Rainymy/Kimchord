"use strict";
const { existsSync, mkdir, statSync, readdirSync } = require('node:fs');
const { execSync } = require('node:child_process');
const path = require('node:path');

const { saveFolder } = require('../config.json');

function init() {
  const essentialFolders = [ getSaveLocation() ];
  for (let folder of essentialFolders) {
    if (existsSync(folder)) { continue; }
    
    mkdir(folder, (err) => {
      return console.log(err ?? `${folder} : directory created successfully!`);
    });
  }
  
  return this;
}

function getKeyValuePairFromLines(lines) {
  const output = {};
  
  for (let line of lines.split("\r\n")) {
    if (line === "") { continue; }
    const [ key, ...value ] = line.split(":");
    output[key.trim()] = value.join(":").trim();
  }
  
  return output;
}

function getPathFromShortcutLink(pathLink) {
  if (process.platform === "win32") {
    const text = `"(New-Object -COM WScript.Shell).CreateShortcut('${pathLink}')"`;
    const stats = execSync(`powershell.exe -command ${text}`, { encoding: "utf-8" });
    
    return getKeyValuePairFromLines(stats).TargetPath;
  }
  
  if (process.platform === "darwin") {
    throw new Error("Shortcut for MacOS is not supported");
  }
  
  throw new Error("Shortcuts for Unix/Linux is not supported");
}

function getSaveLocation() {
  const isNotValidExt = (ext) => { return !!ext || ext === ".lnk" };
  
  const savePath = path.normalize(path.resolve(__dirname, saveFolder));
  
  try { statSync(savePath).isDirectory(); }
  catch (e) {
    const userSaveExt = path.extname(savePath);
    const userSaveBase = path.basename(savePath, userSaveExt);
    
    if (isNotValidExt(userSaveExt)) { return; }
    
    for (let item of readdirSync(path.dirname(savePath))) {
      if (!path.extname(item) || path.extname(item) !== ".lnk") { continue; }
      
      const folderName = path.basename(item, path.extname(item));
      if (folderName !== userSaveBase) { continue; }
      
      return getPathFromShortcutLink(path.join(__dirname, "../", item));
    }
  }
  
  return savePath;
}

function isError(e) {
  return e && e.stack && e.message && 
        typeof e.stack === 'string' && typeof e.message === 'string';
}

function validQueries(username, userId, videoData, optional_id) {
  if (optional_id) {
    if (!username || !userId || !videoData) {
      return { error: true, comment: "Incorrect Request" };
    }
    return { error: false, comment: null };
  }
  
  if (!videoData) {
    return { error: true, comment: `Missing metadata: ${videoData}` };
  }
  
  if (videoData.type === "playlist") {
    return { error: false, comment: null };
  }
  
  let haveSongId = videoData.id ?? videoData.every((current) => {
    return typeof current.id === "string";
  });
  
  if (!username || !userId || !haveSongId) {
    return { error: true, comment: "Incorrect Request" };
  }
  
  return { error: false, comment: null };
}

module.exports = {
  init: init,
  getSaveLocation: getSaveLocation,
  isError: isError,
  validQueries: validQueries
}