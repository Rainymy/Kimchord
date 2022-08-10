"use strict";
const { ReadableStream } = require('node:stream');
const util = require('../Components/util.js').init();

async function songsEvent(req, res, GLOBAL_OBJECTS) {
  const { username, userId, videoData } = req.body;
  const { fileManager } = GLOBAL_OBJECTS;
  
  const { error, comment } = util.validQueries(username, userId, videoData);
  console.log({ error, comment }, "songs");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  if (videoData.isLive) {
    const callback = (result) => { if (result.error) { return console.log(result) } }
    const liveStream = await fileManager.liveStream(videoData, callback);
    
    return liveStream.pipe(res);
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
}

module.exports = songsEvent;