const { DOWNLOAD_MAX_ALLOWED_HOURS: maxHours } = require('../config.json');

const Youtube = require('../API/youtube.js');
const youtube = new Youtube();

const util = require('../Components/util.js').init();

const {
  saveLocation,
  makeWriteStream,
  makeYTDLStream
} = require("../Components/handleFile.js");

async function download (req, res, GLOBAL_CONSTANTS) {
  const { username, userId, videoData: video } = req.body;
  
  const { error, comment } = util.validQueries(username, userId, video);
  console.log({ error, comment }, "download");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  console.log("Video Meta: ", video);
  
  const [ seconds, metadata ] = await youtube.getDurationById(video.id);
  const hours = Math.floor(seconds / 60 / 60);
  
  if (!seconds && !GLOBAL_CONSTANTS.cookies) {
    return res.send({
      error: true,
      comment: `- Age-restricted videos are not supported.`
    });
  }
  
  if (metadata?.isLive) {
    return res.send({ error: false, comment: null, isLive: true });
  }
  
  if (hours >= maxHours) {
    return res.send({
      error: true,
      comment: `Max ${maxHours} hours is allowed: Video is ${hours} hours long`
    });
  }
  
  const streamURL = await makeYTDLStream(video, GLOBAL_CONSTANTS.cookies, (result)=>{
    if (!result.error) {
      GLOBAL_CONSTANTS.cacheSongs.appendSong(GLOBAL_CONSTANTS.songs, {
        name: video.id,
        container: metadata.container
      });
    }
    return res.send(result);
  });
  
  const filePath = saveLocation(GLOBAL_CONSTANTS.songs, video.id, metadata.container);
  const streamToFile = await makeWriteStream(filePath);
  
  return streamURL.pipe(streamToFile);
}

module.exports = download;