const { existsSync, mkdir, statSync, readdirSync } = require('fs');
const { execSync } = require('child_process');
const path = require('path');

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

function getSaveLocation() {
  function isNotValidExt(ext) { return !!ext || ext === ".lnk" }
  
  const savePath = path.normalize(path.resolve(__dirname, saveFolder));
  
  try { if (statSync(savePath).isDirectory()) { return savePath; } }
  catch (e) {
    const userSaveExt = path.extname(savePath);
    const userSaveBase = path.basename(savePath, userSaveExt);
    
    if (isNotValidExt(userSaveExt)) { return; }
    
    for (let item of readdirSync(path.dirname(savePath))) {
      if (!path.extname(item) || path.extname(item) !== ".lnk") { continue; }
      
      const folderName = path.basename(item, path.extname(item));
      if (folderName !== userSaveBase) { continue; }
      
      return readShortcutLink(path.join(__dirname, "../", item)).TargetPath;
    }
  }
  
  return savePath;
}

function getKeyValuePairFromLines(lines) {
  const output = {};
  
  for (let line of lines.split("\r\n")) {
    if (line === "") { continue; }
    const [ key, ...value ] = line.split(":");
    output[key.trim()] = value.join(":").trim();
  }
  
  return output
}

function readShortcutLink(filePath) {
  const text = `"(New-Object -COM WScript.Shell).CreateShortcut('${filePath}')"`;
  const stats = execSync(`powershell.exe -command ${text}`, { encoding: "utf-8" });
  
  return getKeyValuePairFromLines(stats);
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