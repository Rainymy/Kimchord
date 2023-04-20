"use strict";
const { PRESETS } = require('../Components/permission.js');

async function isFile(listFile, fileManager) {
  for (let item of listFile) {
    const filePath = fileManager.saveLocation(item);
    item.isFile = await fileManager.checkFileExists(filePath);
  }
  
  return listFile;
}

async function request(req, res, GLOBAL_OBJECTS) {
  const { videoData } = req.body;
  
  const songList = videoData.type === "playlist" ? videoData.playlist : videoData;
  
  await isFile(songList, GLOBAL_OBJECTS.fileManager);
  return res.send(videoData);
}

module.exports = {
  method: "post",
  route: "/request",
  skipLoad: false,
  permissions: [
    PRESETS.PERMISSIONS.QUERY
  ],
  main: request
};