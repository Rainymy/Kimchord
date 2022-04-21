const util = require('../Components/util.js').init();

const { saveLocation, deleteFile } = require("../Components/handleFile.js");

async function remove(req, res, GLOBAL_CONSTANTS) {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = util.validQueries(username, userId, videoData);
  console.log({ error, comment }, "remove");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  const video = videoData[0];
  const filePath = saveLocation(GLOBAL_CONSTANTS.songs, video.id);
  
  const err = await deleteFile(filePath);
  if (err) { return res.send({ error: true, comment: err }); }
  
  GLOBAL_CONSTANTS.cacheSongs.removeSong(GLOBAL_CONSTANTS.songs, { name: video.id });
  
  return res.send({ error: false, comment: `Deleted: ${video.title}` });
}

module.exports = remove;