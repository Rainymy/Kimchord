"use strict";
const { PRESETS } = require('../Components/permission.js');

async function request(req, res, GLOBAL_OBJECTS) {
  const { videoData } = req.body;
  const { fileManager } = GLOBAL_OBJECTS;
  
  const songList = videoData.type === "playlist" ? videoData.playlist : videoData;
  
  for (let item of songList) {
    const filePath = fileManager.saveLocation(item);
    item.isFile = await fileManager.checkFileExists(filePath);
    
    const meta = await fileManager.YT_DLP.getMetadata(item.url);
    item.isLive = meta.is_live;
    item.duration = meta.duration;
  }
  
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