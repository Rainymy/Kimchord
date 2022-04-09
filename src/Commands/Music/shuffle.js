const { checkServerMusicRole } = require('../../Components/permissions.js');

const messageInfo = require('../../Components/messageInfo.js');
const { codeBlock } = require('../../Components/markup.js');

async function np(message, basicInfo, arg, queue) {
  const serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue) { return message.channel.send(messageInfo.nothingPlaying); }
  
  const REQUIRED_ROLE_NAME = basicInfo.guilds_settings.REQUIRED_MUSIC_ROLE_NAME;
  if (checkServerMusicRole(basicInfo.guilds_settings, message.member)) {
    return message.channel.send(
      codeBlock(messageInfo.requiresRoleName(REQUIRED_ROLE_NAME), "js")
    )
  }
  
  const currentSong = serverQueue.songs.shift(); 
  serverQueue.songs.sort(() => Math.random() - 0.5);
  serverQueue.songs.unshift(currentSong);
  
  return message.channel.send(codeBlock("⏯️ Shuffled your current queue ✔️"));
}

module.exports = {
  name: "Shuffle queue",
  aliases: "shuffle",
  main: np
}