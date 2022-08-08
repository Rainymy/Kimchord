"use strict";
const { DOWNLOAD_MAX_ALLOWED_HOURS: maxHours } = require('../../config.json');

const util = require('../Components/util.js').init();

async function parseData(id, GLOBAL_OBJECTS) {
  const { fileManager, youtube } = GLOBAL_OBJECTS;
  
  const [ seconds, metadata ] = await youtube.getDurationById(id);
  const hours = Math.floor(seconds / 60 / 60);
  
  if (!seconds && !fileManager.cookies) {
    const AGE_RESTRICTED = `Age-restricted videos are not supported.`;
    return [ { error: true, comment: AGE_RESTRICTED } ];
  }
  
  if (metadata?.isLive) {
    return [ { error: false, comment: null, isLive: true } ];
  }
  
  if (hours >= maxHours) {
    const MAX_HOUR = `Max ${maxHours} hours is allowed: Video is ${hours} hours long`;
    return [ { error: true, comment: MAX_HOUR } ];
  }
  
  return [ undefined, metadata ];
}

async function download(req, res, GLOBAL_OBJECTS) {
  const { username, userId, videoData: video } = req.body;
  const { fileManager, youtube } = GLOBAL_OBJECTS;
  
  const { error, comment } = util.validQueries(username, userId, video);
  console.log({ error, comment }, "download");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  console.log("Video Meta: ", video);
  
  const [ responseData, metadata ] = await parseData(video.id, GLOBAL_OBJECTS);
  if (typeof responseData === "object") { return await res.send(responseData); }
  
  const combined = { ...video, ...{ container: metadata.container } };
  return await fileManager.download(combined, (result) => {
    if (res.headersSent === true) { return; }
    
    return res.send(result);
  });
}

module.exports = download;
