const { checkServerMusicRole } = require('../../Components/permissions.js');

const messageInfo = require('../../Components/messageInfo.js');
const { codeBlock } = require('../../Components/markup.js');

function resume(message, basicInfo, arg, queue) {
  let serverQueue = queue.get(message.guild.id);
  
  if (!serverQueue || !serverQueue.songs.length) {
    return message.channel.send(messageInfo.nothingPlaying);
  }
  
  const REQUIRED_ROLE_NAME = basicInfo.guilds_settings.REQUIRED_MUSIC_ROLE_NAME;
  if (checkServerMusicRole(basicInfo.guilds_settings, message.member)) {
    return message.channel.send(
      codeBlock(messageInfo.requiresRoleName(REQUIRED_ROLE_NAME), "js")
    )
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
  main: resume
}