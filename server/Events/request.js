const util = require('../Components/util.js').init();

async function isFile(listFile, fileManager) {
  for (let item of listFile) {
    const filePath = fileManager.saveLocation(item);
    item.isFile = await fileManager.checkFileExists(filePath);
  }
  
  return listFile;
}

async function request(req, res, GLOBAL_OBJECTS) {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = util.validQueries(username, userId, videoData);
  console.log({ error, comment }, "request");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  const songList = videoData.type === "playlist" ? videoData.playlist : videoData;
  
  await isFile(songList, GLOBAL_OBJECTS.fileManager);
  return res.send(videoData);
}

module.exports = request;