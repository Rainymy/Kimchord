"use strict";
const {DOWNLOAD_MAX_ALLOWED_HOURS: MAX_ALLOWED_HOUR} = require('../../config.json');
const util = require('../Components/util.js').init();
const { PassThrough } = require('node:stream');

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

function waitDownloadStart(download, video) {
  return new Promise(async (resolve, reject) => {
    const [ source, destination ] = await download(video);
    
    destination.on("ready", () => { resolve("Write stream ready"); });
    destination.on("error", reject;
  });
}

async function startDownload(video, GLOBAL_OBJECTS) {
  const { fileManager } = GLOBAL_OBJECTS;
  
  console.log("Video Meta: ", video);
  
  const metadata = await fileManager.YT_DLP.getMetadata(video.url);
  
  const [ isValid, errorInfo ] = checkValidMeta(metadata);
  if (!isValid) { return errorInfo; }
  
  const combined = { ...video, ...{ container: metadata.ext } };
  
  await waitDownloadStart(fileManager.download, combined);
  return;
}

module.exports = startDownload;
