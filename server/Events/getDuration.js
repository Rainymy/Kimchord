const util = require('../Components/util.js').init();

async function getSongDurationOrDelete(video, GLOBAL_OBJECTS) {
  const { fileManager, youtube } = GLOBAL_OBJECTS;
  
  let duration = 0;
  
  const filePath = fileManager.saveLocation(video);
  try { duration = await youtube.getVideoDurationInSeconds(filePath); }
  catch (e) {
    const err = fileManager.delete(video);
    if (err.error) { console.log(err); }
    else { console.log("Deleted unreadable file", filePath); }
  }
  
  return duration;
}

async function handleSongList(videoList, GLOBAL_OBJECTS) {
  const { fileManager, youtube } = GLOBAL_OBJECTS;
  
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
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = util.validQueries(username, userId, videoData);
  console.log({ error, comment }, "getDuration");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  const musicList = videoData.type === "playlist" ? videoData.playlist : videoData; 
  
  const durations = await handleSongList(musicList, GLOBAL_OBJECTS);
  return res.send(durations);
}

module.exports = getDuration;