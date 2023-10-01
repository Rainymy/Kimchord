"use strict";
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const { saveFolder, tempFolder, plugins } = require('../config.json');

let initialized = false;

function init() {
  if (initialized) { return this; }
  
  const essentialFolders = [
    getSaveLocation(),
    getTempLocation(),
    ...getPluginLocation(plugins),
  ];
  for (let folder of essentialFolders) {
    if (fs.existsSync(folder)) { continue; }
    
    const folderPath = fs.mkdirSync(folder, { recursive: true });
    console.log(`Directory created successfully! : ${folderPath}`);
  }
  
  initialized = true;
  
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
    console.log(new Error("Shortcut for MacOS is not supported"));
    return;
  }
  
  console.log(new Error("Shortcuts for Unix/Linux is not supported"));
}

function getFileCount() {
  try {
    const dirPath = getSaveLocation();
    if (!fs.statSync(dirPath).isDirectory()) { return; }
    
    const temp = new Map();
    const info = { count: 0, duplicateCount: 0 };
    
    for (let file of fs.readdirSync(dirPath)) {
      const userSaveBase = path.basename(file, path.extname(file));
      
      if (temp.has(userSaveBase)) {
        info.duplicateCount++;
        continue;
      }
      temp.set(userSaveBase);
      info.count++;
    }
    return info;
  }
  catch (e) {
    console.log(e);
  }
}

function getPluginLocation() {
  return Object.values(plugins).map(v => path.join(__dirname, "../", v.path));
}

function getSaveLocation() { return getLocation(saveFolder); }
function getTempLocation() { return getLocation(tempFolder); }

function getLocation(locationPath) {
  const isNotValidExt = (ext) => { return !!ext || ext === ".lnk" };
  
  const savePath = path.normalize(path.resolve(__dirname, locationPath));
  
  try { fs.statSync(savePath).isDirectory(); }
  catch (e) {
    const userSaveExt = path.extname(savePath);
    const userSaveBase = path.basename(savePath, userSaveExt);
    
    if (isNotValidExt(userSaveExt)) { return; }
    
    for (let item of fs.readdirSync(path.dirname(savePath))) {
      if (!path.extname(item) || path.extname(item) !== ".lnk") { continue; }
      
      const folderName = path.basename(item, path.extname(item));
      if (folderName !== userSaveBase) { continue; }
      
      return getPathFromShortcutLink(path.join(__dirname, "../", item));
    }
  }
  
  return savePath;
}

function validQueries(username, userId, videoData, optional_id) {
  // if "optional_id" = true. "videoData" must be a string.
  // optional_id for searching.
  if (optional_id) {
    if (!username || !userId || !videoData) {
      return { error: true, comment: "Incorrect Request" };
    }
    return { error: false, comment: null };
  }
  
  if (!videoData) {
    return { error: true, comment: `Missing metadata: ${videoData}` };
  }
  
  if (typeof videoData === "string") {
    return { error: true, comment: "Incorrect Request" };
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
  getFileCount: getFileCount,
  getSaveLocation: getSaveLocation,
  getTempLocation: getTempLocation,
  validQueries: validQueries
}