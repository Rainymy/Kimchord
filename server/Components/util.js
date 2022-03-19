const { existsSync, mkdir } = require('fs');
const path = require('path');

const essentialFolders = [ "../Songs" ];

function init() {
  let pathToFolder;
  for (let folder of essentialFolders) {
    pathToFolder = path.join(__dirname, folder);
    
    if (existsSync(pathToFolder)) { continue; }
    mkdir(pathToFolder, (err) => {
      if (err) { return console.error(err); }
      console.log(pathToFolder, 'directory created successfully!');
    });
  }
  
  return true;
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
  isError: isError,
  validQueries: validQueries
}