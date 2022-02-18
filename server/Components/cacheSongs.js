const path = require("path");
const { readdirectory } = require('./handleFile.js');

function parseLocalFolder() {
  const accum = {};
  const localFiles = readdirectory("../Songs");
  for (let file of localFiles) {
    const extension = path.extname(file); 
    const basename = path.basename(file, extension);
    
    if (!accum[basename]) { accum[basename] = []; }
    
    accum[basename].push({
      name: basename, 
      file: file,
      container: extension
    });
  }
  
  return accum;
}

function appendSong(listObj, file) {
  const create = {
    name: file.name, 
    file: `${file.name}.${file.container}`,
    container: file.container
  }
  
  if (Array.isArray(listObj[file.name])) {
    listObj[file.name].push(create);
    return listObj;
  }
  
  listObj[file.name] = [ create ];
  // console.log("Song Appended", listObj[file.name]);
  return listObj;
}

function removeSong(listObj, file) {
  if (Array.isArray(listObj[file.name])) {
    listObj[file.name].shift();
  }
  
  if (!listObj[file.name].length) {
    listObj[file.name] = null;
  }
  return listObj;
}

module.exports = {
  parseLocalFolder: parseLocalFolder,
  appendSong: appendSong,
  removeSong: removeSong
}