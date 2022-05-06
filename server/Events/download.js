const { DOWNLOAD_MAX_ALLOWED_HOURS: maxHours } = require('../config.json');

const util = require('../Components/util.js').init();

async function download(req, res, GLOBAL_OBJECTS) {
  const { username, userId, videoData: video } = req.body;
  const { fileManager, youtube } = GLOBAL_OBJECTS;
  
  const { error, comment } = util.validQueries(username, userId, video);
  console.log({ error, comment }, "download");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  console.log("Video Meta: ", video);
  
  const [ seconds, metadata ] = await youtube.getDurationById(video.id);
  const hours = Math.floor(seconds / 60 / 60);
  
  if (!seconds && !fileManager.cookies) {
    return res.send({
      error: true,
      comment: `Age-restricted videos are not supported.`
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
  
  const combined = { ...video, ...{ container: metadata.container } };
  await fileManager.download(combined, (result) => res.send(result));
  
  return; 
}

module.exports = download;