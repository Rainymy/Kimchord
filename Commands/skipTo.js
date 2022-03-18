const { codeBlock } = require('../Components/markup.js');
const messageInfo = require('../Components/messageInfo.js');

function skipTo(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);
  
  if (!message.member.voice.channel) {
    return message.channel.send(messageInfo.notInVoiceChannel);
  }
  
  if (!serverQueue) { return message.channel.send(messageInfo.queueIsEmpty); }
  
  const skippingTo = parseInt(arg);
  if (Number.isNaN(skippingTo) || skippingTo < 1 ) {
    return message.channel.send(
      `Please select number between 1-${ serverQueue.songs.length }`
    );
  }
  
  if (skippingTo > serverQueue.songs.length - 1) {
    return message.channel.send(
      `You are overskipping, there are ${serverQueue.songs.length} song in queue`
    );
  }
  
  serverQueue.songs.splice(0, skippingTo - 1);
  serverQueue.audioPlayer.stop();
  message.channel.send(codeBlock(`Skipping to "${serverQueue.songs[0].title}"`));
  return;
}

module.exports = {
  name: "Skip to",
  aliases: "skipto",
  category: "music",
  main: skipTo
};