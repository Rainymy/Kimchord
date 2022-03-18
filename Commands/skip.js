const messageInfo = require('../Components/messageInfo.js');

function skip(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);
  
  if (!message.member.voice.channel) {
    return message.channel.send(messageInfo.notInVoiceChannel);
  }
  
  if (!serverQueue) { return message.channel.send(messageInfo.queueIsEmpty); }
  
  serverQueue.audioPlayer.stop();
  return message.channel.send(messageInfo.skippingSong);
}

module.exports = {
  name: "Skip",
  aliases: "skip",
  category: "music",
  main: skip
};