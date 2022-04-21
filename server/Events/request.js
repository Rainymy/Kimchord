const util = require('../Components/util.js').init();

const { saveLocation, checkFileExists } = require("../Components/handleFile.js");

async function request(req, res, GLOBAL_CONSTANTS) {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = util.validQueries(username, userId, videoData);
  console.log({ error, comment }, "request");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  if (videoData.type === "playlist") {
    let filePath_1;
    for (let item of videoData.playlist) {
      filePath_1 = saveLocation(GLOBAL_CONSTANTS.songs, item.id);
      item.isFile = await checkFileExists(filePath_1);
    }
    
    return res.send(videoData);
  }
  
  const checkedSongs = [];
  
  for (let item of videoData) {
    const filePath_1 = saveLocation(GLOBAL_CONSTANTS.songs, item.id);
    item.isFile = await checkFileExists(filePath_1);
    checkedSongs.push(item);
  }
  
  return res.send(checkedSongs);
}

module.exports = request;