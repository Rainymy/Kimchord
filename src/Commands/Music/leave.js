const { checkServerMusicRole } = require('../../Components/permissions.js');

const messageInfo = require('../../Components/messageInfo.js');
const { codeBlock } = require('../../Components/markup.js');

function leave(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);
  
  if (!message.member.voice.channel) {
    return message.channel.send(messageInfo.notInVoiceChannel);
  }
  
  if (!serverQueue) { return message.channel.send(messageInfo.queueIsEmpty); }
  
  const REQUIRED_ROLE_NAME = basicInfo.guilds_settings.REQUIRED_MUSIC_ROLE_NAME;
  if (checkServerMusicRole(basicInfo.guilds_settings, message.member)) {
    return message.channel.send(
      codeBlock(messageInfo.requiresRoleName(REQUIRED_ROLE_NAME), "js")
    );
  }
  
  serverQueue.songs.length = 0;
  serverQueue.audioPlayer.stop();
  clearTimeout(serverQueue.timeout.id);
  serverQueue.connection.destroy();
  queue.delete(message.guild.id);
  return;
}

module.exports = {
  name: "Leave",
  aliases: "leave",
  main: leave
};