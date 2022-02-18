const { getVoiceConnection } = require("../Components/handleConnection.js");

function leave(message, basicInfo, arg, queue) {
  let serverQueue = queue.get(message.guild.id);
  
  if (!message.member.voice.channel) {
    return message.channel.send('You are not in a voice channel!');
  }
  if (!serverQueue) {
    return message.channel.send(
      'There is nothing playing that I could stop for you.'
    );
  }
  
  serverQueue.songs.length = 0;
  serverQueue.audioPlayer.stop();
  queue.delete(message.guild.id);
  getVoiceConnection(message.guild.id).disconnect();
  return;
}

module.exports = { name: "Leave", aliases: ["leave"], main: leave };