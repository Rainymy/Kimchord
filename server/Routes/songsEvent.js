"use strict";
const { ReadableStream } = require('node:stream');
const util = require('../Components/util.js').init();
const { PRESETS } = require('../Components/permission.js');

const handleFile = require('../Components/handleFile.js');
const download = require('../Components/download.js');

async function songsStream(req, res, GLOBAL_OBJECTS) {
  const { videoData } = req.body;
  const { fileManager } = GLOBAL_OBJECTS;
  
  if (videoData.isLive) {
    const callback = (result) => { if (result.error) { return console.log(result) } }
    const liveStream = await fileManager.liveStream(videoData, callback);
    
    return liveStream.pipe(res);
  }
  
  if (!videoData.isFile) {
    console.log("downlaoding in songStream");
    const stream = await download(videoData, GLOBAL_OBJECTS);
    console.log("after in songStream");
    // const directStream = await handleFile.makeDLPStream(videoData);
    // if (directStream.error) { return res.send(directStream); }
  }
  
  const streamFile = await fileManager.read(videoData);
  
  if (util.isError(streamFile)) {
    return res.send({ error: true, comment: streamFile.exitCode });
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