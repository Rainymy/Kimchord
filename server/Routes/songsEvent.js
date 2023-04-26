"use strict";
const { PRESETS } = require('../Components/permission.js');
const util = require('../Components/util.js').init();
const startDownload = require('../Components/download.js');

async function songsStream(req, res, GLOBAL_OBJECTS) {
  const { videoData } = req.body;
  const { fileManager } = GLOBAL_OBJECTS;
  
  if (videoData.isLive) {
    const callback = (result) => { if (result.error) { return console.log(result) } }
    const liveStream = await fileManager.liveStream(videoData, callback);
    
    return liveStream.pipe(res);
  }
  
  if (!videoData.isFile) {
    await startDownload(videoData, GLOBAL_OBJECTS);
    
    const queue = fileManager.modQueue.get(videoData.id);
    return queue.stream.pipe(res);
  }
  
  const streamFile = await fileManager.read(videoData);
  
  if (streamFile.error) {
    return res.send({ error: true, comment: streamFile.comment });
  }
  
  if (typeof streamFile.read === "function") {
    return streamFile.pipe(res);
  }
  
  res.set('content-type', 'audio/mp4');
  res.send(streamFile);
  
  return directStream.pipe(res);
}

module.exports = {
  method: "post",
  route: "/songs",
  skipLoad: false,
  permissions: [
    PRESETS.PERMISSIONS.QUERY
  ],
  main: songsStream
};