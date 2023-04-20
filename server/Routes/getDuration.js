"use strict";
const { PRESETS } = require('../Components/permission.js');

async function getSongDurationOrDelete(video, GLOBAL_OBJECTS) {
  const { fileManager, youtube } = GLOBAL_OBJECTS;
  
  let duration = 0;
  
  const filePath = fileManager.saveLocation(video);
  try { duration = await youtube.getVideoDurationInSeconds(filePath); }
  catch (e) {
    const metadata = await fileManager.YT_DLP.getMetadata(video.url);
    duration = metadata.duration;
    
    const err = fileManager.delete(video);
    if (err.error) { console.log(err); }
    else { console.log("Deleted unreadable file", filePath); }
  }
  
  return duration;
}

async function handleSongList(videoList, GLOBAL_OBJECTS) {
  const durations = [];
  
  for (let item of videoList) {
    if (typeof item.duration === "number") {
      durations.push(item.duration);
      continue;
    }
    
    if (item.isLive) {
      durations.push(0);
      continue;
    }
    
    durations.push(await getSongDurationOrDelete(item, GLOBAL_OBJECTS));
  }
  
  return durations;
}

async function getDuration(req, res, GLOBAL_OBJECTS) {
  const { videoData } = req.body;
  
  const musicList = videoData.type === "playlist" ? videoData.playlist : videoData; 
  
  const durations = await handleSongList(musicList, GLOBAL_OBJECTS);
  return res.send(durations);
}

module.exports = {
  method: "post",
  route: "/getDuration",
  skipLoad: false,
  permissions: [
    PRESETS.PERMISSIONS.QUERY
  ],
  main: getDuration
};