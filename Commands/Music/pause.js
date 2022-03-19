const messageInfo = require('../../Components/messageInfo.js');

function pause(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue || !serverQueue.songs.length) {
    return message.channel.send(messageInfo.nothingPlaying);
  }
  
  if (!serverQueue.playing) {
    return message.channel.send(messageInfo.songAlreadyPaused);
  }
  
  serverQueue.playing = false;
  serverQueue.audioPlayer.pause();
  serverQueue.songs[0].time.pause = Date.now();
  return; 
}

module.exports = {
  name: "Pause",
  aliases: ["pause", "hold"],
  main: pause
}