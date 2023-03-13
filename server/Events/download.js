"use strict";
const {
  DOWNLOAD_MAX_ALLOWED_HOURS: MAX_ALLOWED_HOUR
} = require('../../config.json');

const util = require('../Components/util.js').init();

function checkValidMeta(meta) {
  if (meta.is_live) {
    return [ false, { error: false, comment: null, isLive: true } ];
  }
  
  const hours = Math.floor(meta.duration / 60 / 60);
  if (hours >= MAX_ALLOWED_HOUR) {
    const MAX_HOUR_COMMENT = `Max ${MAX_ALLOWED_HOUR} hours is allowed`;
    const VIDEO_HOUR_COMMENT = `Video is ${hours} hours long`;
    
    const MAX_HOUR_REACHED = `${MAX_HOUR_COMMENT}: ${VIDEO_HOUR_COMMENT}`;
    
    return [ false, { error: true, comment: MAX_HOUR_REACHED } ];
  }
  
  return [ true ];
}

async function download(req, res, GLOBAL_OBJECTS) {
  const { username, userId, videoData: video } = req.body;
  const { fileManager, youtube } = GLOBAL_OBJECTS;
  
  const { error, comment } = util.validQueries(username, userId, video);
  console.log({ error, comment }, "download");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  console.log("Video Meta: ", video);
  
  const metadata = await fileManager.YT_DLP.getMetadata(video.url);
  const [ isValid, errorInfo ] = checkValidMeta(metadata);
  
  if (!isValid) { return res.send(errorInfo); }
  
  const combined = { ...video, ...{ container: metadata.ext } };
  return await fileManager.download(combined, (result) => {
    if (res.headersSent === true) { return; }
    
    return res.send(result);
  });
}

module.exports = download;
