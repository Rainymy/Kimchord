const util = require('../Components/util.js').init();

async function songsEvent(req, res, GLOBAL_OBJECTS) {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = util.validQueries(username, userId, videoData);
  console.log({ error, comment }, "songs");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  if (videoData.isLive) {
    const callback = (result) => { if (result.error) { return console.log(result); } }
    const stream = await GLOBAL_OBJECTS.fileManager.liveStream(videoData, callback);
    
    return stream.pipe(res);
  }
  
  const streamFile = await GLOBAL_OBJECTS.fileManager.read(videoData);
  
  if (util.isError(streamFile)) {
    return res.send({ error: true, comment: streamFile.exitCode });
  }
  
  return streamFile.pipe(res);
}

module.exports = songsEvent;