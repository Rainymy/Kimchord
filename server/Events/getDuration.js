const Youtube = require('../API/youtube.js');
const youtube = new Youtube();

const util = require('../Components/util.js').init();

const { saveLocation, deleteFile } = require("../Components/handleFile.js");

async function getDuration(req, res, GLOBAL_CONSTANTS) {
  const { username, userId, videoData } = req.body;
  
  const { error, comment } = util.validQueries(username, userId, videoData);
  console.log({ error, comment }, "getDuration");
  
  if (error) { return res.send({ error: error, comment: comment }); }
  
  if (videoData.type === "playlist") {
    const durations = [];
    for (let item of videoData.playlist) {
      if (item.isLive) {
        durations.push(0);
        continue;
      }
      
      const filePath = saveLocation(GLOBAL_CONSTANTS.songs, item.id);
      try { durations.push(await youtube.getVideoDurationInSeconds(filePath)); } 
      catch (e) {
        const err = await deleteFile(filePath);
        if (!err) {
          GLOBAL_CONSTANTS.cacheSongs.removeSong(
            GLOBAL_CONSTANTS.songs,
            { name: item.id }
          );
          console.log("Deleted unreadable file", filePath);
          continue;
        }
        
        console.log(e);
      }
    }
    
    return res.send(durations);
  }
  
  const durations = [];
  for (let item of videoData) {
    if (typeof item.duration === "number") {
      durations.push(item.duration);
      continue;
    }
    
    if (item.isLive) {
      durations.push(0);
      continue;
    }
    
    const filePath = saveLocation(GLOBAL_CONSTANTS.songs, item.id);
    try { durations.push(await youtube.getVideoDurationInSeconds(filePath)); } 
    catch (e) {
      const err = await deleteFile(filePath);
      if (!err) {
        GLOBAL_CONSTANTS.cacheSongs.removeSong(
          GLOBAL_CONSTANTS.songs,
          { name: item.id }
        );
        console.log("Deleted unreadable file", filePath);
        continue;
      }
      
      console.log(e);
    }
  }
  
  return res.send(durations);
}

module.exports = getDuration;