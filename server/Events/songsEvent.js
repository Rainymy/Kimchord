const util = require('../Components/util.js').init();

const {
  saveLocation,
  makeReadStream,
  makeYTDLStream
} = require("../Components/handleFile.js");

async function songsEvent(req, res, GLOBAL_CONSTANTS) {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = util.validQueries(username, userId, videoData);
  console.log({ error, comment }, "songs");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  if (videoData.isLive) {
    const stream = await makeYTDLStream(videoData, (result) => {
      if (result.error) { console.log(result); }
    });
    return stream.pipe(res);
  }
  
  const filePath = saveLocation(GLOBAL_CONSTANTS.songs, videoData.id);
  const stream = await makeReadStream(filePath);
  if (util.isError(stream)) {
    return res.send({ error: true, comment: stream.exitCode });
  }
  
  return stream.pipe(res);
}

module.exports = songsEvent;