const messageInfo = require('../Components/messageInfo.js');

function stop(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);
  
  if (!message.member.voice.channel) {
    return message.channel.send(messageInfo.notInVoiceChannel);
  }
  
  if (!serverQueue) { return message.channel.send(messageInfo.queueIsEmpty); }
  
  serverQueue.songs.length = 0;
  serverQueue.audioPlayer.stop();
  queue.delete(message.guild.id);
  return;
}

module.exports = {
  name: "Stop",
  aliases: ["stop", "leave"],
  category: "music",
  main: stop
};