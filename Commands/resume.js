const messageInfo = require('../Components/messageInfo.js');

function resume(message, basicInfo, arg, queue) {
  let serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue || !serverQueue.songs.length) {
    return message.channel.send(messageInfo.nothingPlaying);
  }
  
  if (serverQueue.playing) { return message.channel.send(messageInfo.songPlaying); }
  
  serverQueue.playing = true; 
  serverQueue.audioPlayer.unpause();
  
  const pausedDuration = Date.now() - serverQueue.songs[0].time.pause;
  serverQueue.songs[0].time.start += pausedDuration;
  
  return;
}

module.exports = {
  name: "Resume",
  aliases: ["resume", "continue"],
  category: "music",
  main: resume
}