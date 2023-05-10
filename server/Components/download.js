"use strict";
const {
  DOWNLOAD_MAX_ALLOWED_HOURS: MAX_ALLOWED_HOUR
} = require('../../config.json');

const EventEmitter = require('node:events');
const downloadCache = new Map();

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
    if (downloadCache.has(video.id)) {
      const cache = downloadCache.get(video.id);
      
      cache.once("ready-cache", (err) => {
        if (err) { return reject(err); }
        resolve();
      });
      
      return;
    }
    
    const tempEvent = new EventEmitter();
    
    downloadCache.set(video.id, tempEvent);
    
    const [ source, destination ] = await download(video);
    
    const finish = (error) => {
      tempEvent.emit("ready-cache");
      downloadCache.delete(video.id);
      return error ? reject(error) : resolve();
    }
    
    destination.on("ready", finish);
    destination.on("error", finish);
    
    return;
  });
}

async function startDownload(video, GLOBAL_OBJECTS) {
  const { fileManager } = GLOBAL_OBJECTS;
  
  console.log("Video Meta: ", video);
  
  const metadata = await fileManager.YT_DLP.getMetadata(video.url);
  
  const [ isValid, errorInfo ] = checkValidMeta(metadata);
  if (!isValid) { return errorInfo; }
  
  const combined = { ...video, ...{ container: metadata.ext } };
  
  return await waitDownloadStart(fileManager.download, combined);
}

module.exports = startDownload;
