"use strict";
const {
  DOWNLOAD_MAX_ALLOWED_HOURS: MAX_ALLOWED_HOUR
} = require('../../config.json');

const EventEmitter = require('node:events');
const downloadCache = new Map();

function waitDownloadStart(download, video) {
  return new Promise(async (resolve, reject) => {
    if (downloadCache.has(video.id)) {
      return downloadCache.get(video.id).once("ready-cache", resolve);
    }
    
    downloadCache.set(video.id, new EventEmitter());
    
    const [ source, destination ] = await download(video);
    
    const finish = (error) => {
      downloadCache.get(video.id)?.emit("ready-cache");
      downloadCache.delete(video.id);
      return resolve(error);
    }
    
    destination.on("ready", finish);
    destination.on("error", finish);
    
    return;
  });
}

async function startDownload(video, GLOBAL_OBJECTS) {
  const { fileManager } = GLOBAL_OBJECTS;
  
  const hours = Math.floor(video.duration / 60 / 60);
  if (hours >= MAX_ALLOWED_HOUR) {
    const MAX_HOUR_COMMENT = `Max ${MAX_ALLOWED_HOUR} hours is allowed`;
    const VIDEO_HOUR_COMMENT = `Video is ${hours} hours long`;
    
    const MAX_HOUR_REACHED = `${MAX_HOUR_COMMENT}: ${VIDEO_HOUR_COMMENT}`;
    
    return { error: true, comment: MAX_HOUR_REACHED };
  }
  
  const combined = { ...video, container: video.ext };
  return await waitDownloadStart(fileManager.download, combined);
}

module.exports = startDownload;
